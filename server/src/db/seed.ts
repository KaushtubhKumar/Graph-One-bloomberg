import { supabase } from "./supabaseClient";
import { slugify } from "../utils/pagination";
import { seedCompanies } from "./seedData/companies.seed";
import { seedInvestors } from "./seedData/investors.seed";
import { seedFundingRounds } from "./seedData/fundingRounds.seed";

async function upsertCompanies(): Promise<Map<string, string>> {
  console.log(`\n📦 Upserting ${seedCompanies.length} companies...`);
  const slugToId = new Map<string, string>();

  for (const company of seedCompanies) {
    const slug = slugify(company.slug);
    const { data, error } = await supabase
      .from("companies")
      .upsert({ ...company, slug }, { onConflict: "slug" })
      .select("id, slug")
      .single();

    if (error) {
      console.error(`  ❌ ${company.name}: ${error.message}`);
      continue;
    }
    slugToId.set(data.slug, data.id);
    console.log(`  ✓ ${company.name}`);
  }

  return slugToId;
}

async function upsertInvestors(): Promise<Map<string, string>> {
  console.log(`\n💰 Upserting ${seedInvestors.length} investors...`);
  const slugToId = new Map<string, string>();

  for (const investor of seedInvestors) {
    const slug = slugify(investor.slug);
    const { data, error } = await supabase
      .from("investors")
      .upsert({ ...investor, slug }, { onConflict: "slug" })
      .select("id, slug")
      .single();

    if (error) {
      console.error(`  ❌ ${investor.name}: ${error.message}`);
      continue;
    }
    slugToId.set(data.slug, data.id);
    console.log(`  ✓ ${investor.name}`);
  }

  return slugToId;
}

async function insertFundingRounds(
  companySlugToId: Map<string, string>,
  investorSlugToId: Map<string, string>
) {
  console.log(`\n📈 Inserting ${seedFundingRounds.length} funding rounds...`);

  // Clear existing rounds + participants first so re-running the seed doesn't duplicate them
  // (rounds don't have a natural unique key the way companies/investors do via slug).
  const companyIds = Array.from(companySlugToId.values());
  if (companyIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("funding_rounds")
      .delete()
      .in("company_id", companyIds);
    if (deleteError) {
      console.error(`  ⚠️  Could not clear existing rounds: ${deleteError.message}`);
    } else {
      console.log("  🧹 Cleared existing funding rounds for seeded companies");
    }
  }

  let inserted = 0;
  let skipped = 0;
  const affectedInvestorIds = new Set<string>();

  for (const round of seedFundingRounds) {
    const companyId = companySlugToId.get(round.company_slug);
    if (!companyId) {
      console.warn(`  ⚠️  Skipping round: unknown company slug '${round.company_slug}'`);
      skipped++;
      continue;
    }

    const leadInvestorId = round.lead_investor_slug
      ? investorSlugToId.get(round.lead_investor_slug)
      : null;
    if (round.lead_investor_slug && !leadInvestorId) {
      console.warn(
        `  ⚠️  Round for ${round.company_slug}: unknown lead investor slug '${round.lead_investor_slug}', proceeding without lead`
      );
    }

    const { data: insertedRound, error } = await supabase
      .from("funding_rounds")
      .insert({
        company_id: companyId,
        round_type: round.round_type,
        amount_usd: round.amount_usd,
        announced_date: round.announced_date,
        valuation_usd: round.valuation_usd,
        is_valuation_disclosed: round.is_valuation_disclosed,
        lead_investor_id: leadInvestorId ?? null,
        notes: round.notes ?? null,
      })
      .select("id")
      .single();

    if (error || !insertedRound) {
      console.error(`  ❌ ${round.company_slug} (${round.round_type}): ${error?.message}`);
      skipped++;
      continue;
    }

    // Build participant set: explicit participants + lead, resolved + deduped, dropping unknown slugs.
    const participantIds = new Set<string>();
    for (const pSlug of round.participant_investor_slugs) {
      const id = investorSlugToId.get(pSlug);
      if (id) {
        participantIds.add(id);
      } else {
        console.warn(
          `  ⚠️  Round for ${round.company_slug}: unknown participant investor slug '${pSlug}', skipping`
        );
      }
    }
    if (leadInvestorId) participantIds.add(leadInvestorId);

    if (participantIds.size > 0) {
      const rows = Array.from(participantIds).map((investorId) => ({
        round_id: insertedRound.id,
        investor_id: investorId,
        is_lead: investorId === leadInvestorId,
      }));
      const { error: participantsError } = await supabase.from("round_participants").insert(rows);
      if (participantsError) {
        console.error(`  ❌ Failed to insert participants for ${round.company_slug}: ${participantsError.message}`);
      }
      participantIds.forEach((id) => affectedInvestorIds.add(id));
    }

    inserted++;
  }

  console.log(`  ✓ Inserted ${inserted} rounds (${skipped} skipped)`);
  return affectedInvestorIds;
}

async function recalcDenormalizedFields(
  companySlugToId: Map<string, string>,
  affectedInvestorIds: Set<string>
) {
  console.log("\n🔄 Recalculating denormalized totals...");

  for (const companyId of companySlugToId.values()) {
    const { data: rounds, error } = await supabase
      .from("funding_rounds")
      .select("amount_usd, announced_date")
      .eq("company_id", companyId);

    if (error) continue;

    const total = (rounds ?? []).reduce((sum, r) => sum + (r.amount_usd ?? 0), 0);
    const lastDate = (rounds ?? []).map((r) => r.announced_date).sort().at(-1);

    await supabase
      .from("companies")
      .update({ total_funding_usd: total, last_funding_at: lastDate ?? null })
      .eq("id", companyId);
  }

  for (const investorId of affectedInvestorIds) {
    const [{ data: led }, { data: participated }] = await Promise.all([
      supabase.from("funding_rounds").select("company_id").eq("lead_investor_id", investorId),
      supabase
        .from("round_participants")
        .select("round:funding_rounds(company_id)")
        .eq("investor_id", investorId),
    ]);

    const companyIds = new Set<string>();
    (led ?? []).forEach((r) => companyIds.add(r.company_id));
    (participated ?? []).forEach((p) => {
      const round = p.round as unknown as { company_id: string } | null;
      if (round?.company_id) companyIds.add(round.company_id);
    });

    await supabase.from("investors").update({ portfolio_count: companyIds.size }).eq("id", investorId);
  }

  console.log("  ✓ Done");
}

async function main() {
  console.log("🌱 Seeding GraphOne database...");

  const companySlugToId = await upsertCompanies();
  const investorSlugToId = await upsertInvestors();
  const affectedInvestorIds = await insertFundingRounds(companySlugToId, investorSlugToId);
  await recalcDenormalizedFields(companySlugToId, affectedInvestorIds);

  console.log("\n✅ Seed complete.");
  console.log(`   Companies: ${companySlugToId.size}`);
  console.log(`   Investors: ${investorSlugToId.size}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("\n💥 Seed failed:", err);
  process.exit(1);
});
