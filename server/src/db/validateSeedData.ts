import { seedCompanies } from "./seedData/companies.seed";
import { seedInvestors } from "./seedData/investors.seed";
import { seedFundingRounds } from "./seedData/fundingRounds.seed";

const companySlugs = new Set(seedCompanies.map((c) => c.slug));
const investorSlugs = new Set(seedInvestors.map((i) => i.slug));

let problems = 0;

// Duplicate slug checks
const dupCompanySlugs = seedCompanies.map((c) => c.slug).filter((s, i, arr) => arr.indexOf(s) !== i);
if (dupCompanySlugs.length > 0) {
  console.error(`❌ Duplicate company slugs: ${[...new Set(dupCompanySlugs)].join(", ")}`);
  problems++;
}

const dupInvestorSlugs = seedInvestors.map((i) => i.slug).filter((s, i, arr) => arr.indexOf(s) !== i);
if (dupInvestorSlugs.length > 0) {
  console.error(`❌ Duplicate investor slugs: ${[...new Set(dupInvestorSlugs)].join(", ")}`);
  problems++;
}

// Funding round reference checks
for (const round of seedFundingRounds) {
  if (!companySlugs.has(round.company_slug)) {
    console.error(`❌ Funding round references unknown company slug: '${round.company_slug}'`);
    problems++;
  }
  if (round.lead_investor_slug && !investorSlugs.has(round.lead_investor_slug)) {
    console.error(
      `❌ Funding round (${round.company_slug}) references unknown lead investor slug: '${round.lead_investor_slug}'`
    );
    problems++;
  }
  for (const pSlug of round.participant_investor_slugs) {
    if (!investorSlugs.has(pSlug)) {
      console.error(
        `❌ Funding round (${round.company_slug}) references unknown participant investor slug: '${pSlug}'`
      );
      problems++;
    }
  }
}

console.log(`\nChecked ${seedCompanies.length} companies, ${seedInvestors.length} investors, ${seedFundingRounds.length} funding rounds.`);

if (problems > 0) {
  console.error(`\n💥 Found ${problems} referential integrity problem(s) in seed data.`);
  process.exit(1);
} else {
  console.log("✅ Seed data is internally consistent — all slug references resolve.");
  process.exit(0);
}
