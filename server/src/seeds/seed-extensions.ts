/**
 * seed-extensions.ts
 * Run AFTER the main seed: npm run seed
 * Then: npx ts-node src/seeds/seed-extensions.ts
 *
 * Seeds: founders, products, 100+ news articles
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getCompanyId(slug: string): Promise<string | null> {
  const { data } = await supabase.from('companies').select('id').eq('slug', slug).single();
  return data?.id ?? null;
}

async function seedFounders() {
  const openaiId = await getCompanyId('openai');
  const anthropicId = await getCompanyId('anthropic');
  const perplexityId = await getCompanyId('perplexity-ai');
  const midjourney = await getCompanyId('midjourney');
  const mistralId = await getCompanyId('mistral-ai');
  const cohereId = await getCompanyId('cohere');
  const a21Id = await getCompanyId('ai21-labs');

  const founders = [
    { name: 'Sam Altman', slug: 'sam-altman', title: 'CEO & Co-founder', company_id: openaiId, bio: 'Former president of Y Combinator. Co-founded OpenAI in 2015.', twitter: 'https://twitter.com/sama', linkedin: 'https://linkedin.com/in/sam-altman-b9172b', location: 'San Francisco, CA', photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Sam_Altman_2019.jpg/220px-Sam_Altman_2019.jpg' },
    { name: 'Greg Brockman', slug: 'greg-brockman', title: 'President & Co-founder', company_id: openaiId, bio: 'Former CTO of Stripe. Co-founded OpenAI.', twitter: 'https://twitter.com/gdb', linkedin: 'https://linkedin.com/in/gregbrockman', location: 'San Francisco, CA', photo_url: null },
    { name: 'Ilya Sutskever', slug: 'ilya-sutskever', title: 'Chief Scientist & Co-founder', company_id: openaiId, bio: 'AI researcher, co-inventor of AlexNet. Co-founded OpenAI.', twitter: 'https://twitter.com/ilyasut', linkedin: null, location: 'San Francisco, CA', photo_url: null },
    { name: 'Dario Amodei', slug: 'dario-amodei', title: 'CEO & Co-founder', company_id: anthropicId, bio: 'Former VP of Research at OpenAI. Co-founded Anthropic in 2021.', twitter: 'https://twitter.com/DarioAmodei', linkedin: 'https://linkedin.com/in/dario-amodei', location: 'San Francisco, CA', photo_url: null },
    { name: 'Daniela Amodei', slug: 'daniela-amodei', title: 'President & Co-founder', company_id: anthropicId, bio: 'Former VP of Operations at OpenAI. Co-founded Anthropic.', twitter: 'https://twitter.com/DanielaAmodei', linkedin: null, location: 'San Francisco, CA', photo_url: null },
    { name: 'Aravind Srinivas', slug: 'aravind-srinivas', title: 'CEO & Co-founder', company_id: perplexityId, bio: 'Former researcher at OpenAI and Google DeepMind. Founded Perplexity AI.', twitter: 'https://twitter.com/AravSrinivas', linkedin: null, location: 'San Francisco, CA', photo_url: null },
    { name: 'David Holz', slug: 'david-holz', title: 'CEO & Founder', company_id: midjourney, bio: 'Former co-founder of Leap Motion. Founded Midjourney.', twitter: 'https://twitter.com/davidholz_', linkedin: null, location: 'San Francisco, CA', photo_url: null },
    { name: 'Arthur Mensch', slug: 'arthur-mensch', title: 'CEO & Co-founder', company_id: mistralId, bio: 'Former researcher at Google DeepMind. Co-founded Mistral AI.', twitter: 'https://twitter.com/arthurmensch', linkedin: null, location: 'Paris, France', photo_url: null },
    { name: 'Aidan Gomez', slug: 'aidan-gomez', title: 'CEO & Co-founder', company_id: cohereId, bio: 'Co-author of the original Transformer paper. Co-founded Cohere.', twitter: 'https://twitter.com/aidangomez', linkedin: null, location: 'Toronto, Canada', photo_url: null },
    { name: 'Yoav Shoham', slug: 'yoav-shoham', title: 'Co-founder', company_id: a21Id, bio: 'Stanford CS professor, pioneer in AI and multi-agent systems.', twitter: null, linkedin: null, location: 'Tel Aviv, Israel', photo_url: null },
  ].filter((f) => f.company_id);

  const { error } = await supabase.from('founders').upsert(founders, { onConflict: 'slug' });
  if (error) console.error('Founders seed error:', error.message);
  else console.log(`✓ Seeded ${founders.length} founders`);
}

async function seedProducts() {
  const openaiId = await getCompanyId('openai');
  const anthropicId = await getCompanyId('anthropic');
  const perplexityId = await getCompanyId('perplexity-ai');
  const midjourneyId = await getCompanyId('midjourney');
  const runwayId = await getCompanyId('runway');
  const elevenId = await getCompanyId('elevenlabs');
  const cohereId = await getCompanyId('cohere');
  const mistralId = await getCompanyId('mistral-ai');

  const products = [
    { company_id: openaiId, name: 'ChatGPT', slug: 'chatgpt', description: 'Conversational AI assistant for everyday tasks.', category: 'Chat', launch_date: '2022-11-30', upvotes: 95000, website_url: 'https://chat.openai.com' },
    { company_id: openaiId, name: 'GPT-4o', slug: 'gpt-4o', description: 'Multimodal foundation model with vision and audio.', category: 'Foundation Model', launch_date: '2024-05-13', upvotes: 42000, website_url: 'https://openai.com/gpt-4o' },
    { company_id: openaiId, name: 'Codex', slug: 'openai-codex', description: 'AI for software development in the terminal.', category: 'Code', launch_date: '2025-04-16', upvotes: 18000, website_url: 'https://openai.com/codex' },
    { company_id: openaiId, name: 'Sora', slug: 'sora', description: 'Text-to-video model.', category: 'Video', launch_date: '2024-12-09', upvotes: 31000, website_url: 'https://sora.com' },
    { company_id: openaiId, name: 'Operator', slug: 'operator', description: 'AI agent for teams.', category: 'Agents', launch_date: '2025-01-23', upvotes: 12000, website_url: 'https://openai.com/operator' },
    { company_id: anthropicId, name: 'Claude', slug: 'claude-ai', description: 'AI assistant for thoughtful work and collaboration.', category: 'Chat', launch_date: '2023-03-14', upvotes: 67000, website_url: 'https://claude.ai' },
    { company_id: anthropicId, name: 'Claude Code', slug: 'claude-code', description: 'Agentic coding assistant in the terminal.', category: 'Code', launch_date: '2025-02-24', upvotes: 22000, website_url: 'https://claude.ai/code' },
    { company_id: perplexityId, name: 'Perplexity', slug: 'perplexity', description: 'AI search engine for real-time answers.', category: 'Search', launch_date: '2022-12-07', upvotes: 51000, website_url: 'https://perplexity.ai' },
    { company_id: midjourneyId, name: 'Midjourney', slug: 'midjourney', description: 'AI image generator for creators.', category: 'Image', launch_date: '2022-07-12', upvotes: 88000, website_url: 'https://midjourney.com' },
    { company_id: runwayId, name: 'Runway Gen-3', slug: 'runway-gen-3', description: 'High-fidelity AI video generation.', category: 'Video', launch_date: '2024-06-17', upvotes: 29000, website_url: 'https://runwayml.com' },
    { company_id: elevenId, name: 'ElevenLabs Voice', slug: 'elevenlabs-voice', description: 'AI voice synthesis and dubbing platform.', category: 'Voice', launch_date: '2023-01-01', upvotes: 37000, website_url: 'https://elevenlabs.io' },
    { company_id: cohereId, name: 'Command R+', slug: 'command-r-plus', description: 'Enterprise RAG and tool-use model.', category: 'Foundation Model', launch_date: '2024-04-04', upvotes: 9000, website_url: 'https://cohere.com/command' },
    { company_id: mistralId, name: 'Mistral Large', slug: 'mistral-large', description: 'Frontier LLM with multilingual capability.', category: 'Foundation Model', launch_date: '2024-02-26', upvotes: 14000, website_url: 'https://mistral.ai' },
  ].filter((p) => p.company_id);

  const { error } = await supabase.from('products').upsert(products, { onConflict: 'slug' });
  if (error) console.error('Products seed error:', error.message);
  else console.log(`✓ Seeded ${products.length} products`);
}

async function seedNews() {
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

  const articles = [
    { title: 'OpenAI launches GPT-4o with multimodal capabilities', url: 'https://openai.com/blog/gpt-4o', published_at: daysAgo(2), source: 'OpenAI Blog', tag: 'Product Launch', summary: 'GPT-4o brings native audio, vision, and text to OpenAI\'s flagship model.' },
    { title: 'Anthropic raises $4B from Amazon in landmark deal', url: 'https://techcrunch.com/anthropic-amazon-4b', published_at: daysAgo(5), source: 'TechCrunch', tag: 'Funding', summary: 'Amazon doubles down on Anthropic with a massive investment in AI safety research.' },
    { title: 'Perplexity AI reaches 100M monthly active users', url: 'https://perplexity.ai/blog/100m-users', published_at: daysAgo(3), source: 'Perplexity Blog', tag: 'Milestone', summary: 'The AI search startup crossed 100M MAUs, challenging Google in search.' },
    { title: 'Mistral AI releases Le Chat Enterprise with agentic features', url: 'https://mistral.ai/blog/le-chat-enterprise', published_at: daysAgo(1), source: 'Mistral Blog', tag: 'Product Launch', summary: 'Mistral\'s chat product gets a major enterprise overhaul with agents and integrations.' },
    { title: 'Google DeepMind unveils Gemini 2.0 Ultra', url: 'https://deepmind.google/gemini-2-ultra', published_at: daysAgo(7), source: 'DeepMind Blog', tag: 'Product Launch', summary: 'Gemini 2.0 Ultra tops benchmarks in reasoning and multimodal understanding.' },
    { title: 'ElevenLabs closes $80M Series B at $1.1B valuation', url: 'https://techcrunch.com/elevenlabs-series-b', published_at: daysAgo(14), source: 'TechCrunch', tag: 'Funding', summary: 'ElevenLabs joins the unicorn club with a massive Series B round.' },
    { title: 'Cohere launches North: private AI cloud for enterprises', url: 'https://cohere.com/blog/north', published_at: daysAgo(10), source: 'Cohere Blog', tag: 'Product Launch', summary: 'Cohere\'s new platform lets enterprises run LLMs in their own cloud infrastructure.' },
    { title: 'Runway raises $141M to accelerate AI video generation', url: 'https://runway.com/blog/series-d', published_at: daysAgo(20), source: 'Runway Blog', tag: 'Funding', summary: 'Runway\'s Gen-3 model is now powering Hollywood productions.' },
    { title: 'AI safety researchers publish landmark study on LLM alignment', url: 'https://arxiv.org/abs/2024-alignment-study', published_at: daysAgo(4), source: 'arXiv', tag: 'Research', summary: 'A new paper outlines scalable oversight techniques for aligning frontier models.' },
    { title: 'Hugging Face introduces Inference Endpoints V2', url: 'https://huggingface.co/blog/inference-v2', published_at: daysAgo(6), source: 'Hugging Face Blog', tag: 'Product Launch', summary: 'Faster cold starts and auto-scaling for open-source model deployment.' },
    { title: 'xAI secures $6B to build Grok 3 and Memphis data center', url: 'https://techcrunch.com/xai-6b-funding', published_at: daysAgo(15), source: 'TechCrunch', tag: 'Funding', summary: 'Elon Musk\'s xAI is racing to build one of the world\'s largest AI clusters.' },
    { title: 'Stability AI acquired by Harmony Intelligence', url: 'https://stability.ai/blog/acquisition', published_at: daysAgo(9), source: 'Stability AI Blog', tag: 'M&A', summary: 'The open-source image generation pioneer finds a new home.' },
    { title: 'Meta releases Llama 4 with 1T parameter MoE architecture', url: 'https://ai.meta.com/blog/llama-4', published_at: daysAgo(8), source: 'Meta AI Blog', tag: 'Product Launch', summary: 'Meta\'s latest open-weight model uses a mixture-of-experts architecture.' },
    { title: 'Scale AI lands $1B contract with US Department of Defense', url: 'https://wsj.com/scale-ai-dod-contract', published_at: daysAgo(11), source: 'Wall Street Journal', tag: 'Partnership', summary: 'Scale AI will provide AI data infrastructure for US military applications.' },
    { title: 'Databricks acquires MosaicML for $1.3B', url: 'https://techcrunch.com/databricks-mosaicml', published_at: daysAgo(30), source: 'TechCrunch', tag: 'M&A', summary: 'Databricks bolsters its AI training platform with the MosaicML acquisition.' },
    { title: 'Inflection AI pivots to enterprise with Pi 3', url: 'https://inflection.ai/blog/pi-3', published_at: daysAgo(25), source: 'Inflection Blog', tag: 'Product Launch', summary: 'After losing its founding team to Microsoft, Inflection refocuses on business.' },
    { title: 'Character.AI hits $1B ARR, eyes IPO', url: 'https://bloomberg.com/character-ai-ipo', published_at: daysAgo(18), source: 'Bloomberg', tag: 'Business', summary: 'The AI companionship platform reaches profitability and sets sights on public markets.' },
    { title: 'Microsoft integrates Copilot into every Office 365 tier', url: 'https://microsoft.com/blog/copilot-office', published_at: daysAgo(12), source: 'Microsoft Blog', tag: 'Product Launch', summary: 'Copilot is now available to all 300M+ Office 365 subscribers.' },
    { title: 'AI regulation bill passes EU Parliament with 523-46 vote', url: 'https://euractiv.com/ai-act-passed', published_at: daysAgo(22), source: 'Euractiv', tag: 'Policy', summary: 'The EU AI Act becomes law, setting global precedent for AI governance.' },
    { title: 'Groq raises $640M to expand inference hardware', url: 'https://techcrunch.com/groq-640m', published_at: daysAgo(16), source: 'TechCrunch', tag: 'Funding', summary: 'Groq\'s LPU chips are now serving billions of tokens per day to customers.' },
    { title: 'Together AI hits $1B valuation with new Series B', url: 'https://together.ai/blog/series-b', published_at: daysAgo(28), source: 'Together AI Blog', tag: 'Funding', summary: 'Together AI offers the fastest open-source model inference at scale.' },
    { title: 'Suno AI releases music generation v4 with stems and mixing', url: 'https://suno.com/blog/v4', published_at: daysAgo(5), source: 'Suno Blog', tag: 'Product Launch', summary: 'Suno v4 lets creators separate and remix AI-generated audio tracks.' },
    { title: 'OpenAI announces ChatGPT EDU for universities', url: 'https://openai.com/blog/chatgpt-edu', published_at: daysAgo(32), source: 'OpenAI Blog', tag: 'Product Launch', summary: 'A free, privacy-preserving version of ChatGPT for academic institutions.' },
    { title: 'Weights & Biases raises $200M, now valued at $2.5B', url: 'https://wandb.ai/blog/series-c', published_at: daysAgo(40), source: 'W&B Blog', tag: 'Funding', summary: 'The ML experiment tracking platform continues to dominate developer tooling.' },
    { title: 'Replicate launches Auto-Scale for open-source models', url: 'https://replicate.com/blog/auto-scale', published_at: daysAgo(13), source: 'Replicate Blog', tag: 'Product Launch', summary: 'Zero-to-scale inference for open models with no cold start penalty.' },
    { title: 'AI model carbon footprint study sparks industry debate', url: 'https://arxiv.org/abs/2024-carbon-ai', published_at: daysAgo(19), source: 'arXiv', tag: 'Research', summary: 'New research quantifies the environmental impact of training frontier AI models.' },
    { title: 'Pika Labs raises $80M for video AI platform', url: 'https://techcrunch.com/pika-80m', published_at: daysAgo(35), source: 'TechCrunch', tag: 'Funding', summary: 'Pika\'s consumer-facing video tool goes viral, competing with Runway and Sora.' },
    { title: 'Cognition AI launches Devin 2.0 autonomous coding agent', url: 'https://cognition.ai/blog/devin-2', published_at: daysAgo(8), source: 'Cognition Blog', tag: 'Product Launch', summary: 'Devin 2.0 can now deploy and maintain production services autonomously.' },
    { title: 'Sakana AI raises $30M for nature-inspired AI research', url: 'https://sakana.ai/blog/raise', published_at: daysAgo(27), source: 'Sakana AI Blog', tag: 'Funding', summary: 'The Tokyo-based lab uses evolutionary AI to train foundation models.' },
    { title: 'Udio releases stem separation for music AI generation', url: 'https://udio.com/blog/stems', published_at: daysAgo(6), source: 'Udio Blog', tag: 'Product Launch', summary: 'Udio expands its music platform with professional audio separation tools.' },
    { title: 'OpenAI o3 achieves 85% on ARC-AGI benchmark', url: 'https://openai.com/blog/o3', published_at: daysAgo(45), source: 'OpenAI Blog', tag: 'Research', summary: 'The reasoning model o3 solves 85% of the ARC-AGI challenge, a new record.' },
    { title: 'Anthropic publishes Constitutional AI 2.0 paper', url: 'https://anthropic.com/research/constitutional-ai-2', published_at: daysAgo(21), source: 'Anthropic Research', tag: 'Research', summary: 'New techniques for training helpful, harmless, and honest AI systems at scale.' },
    { title: 'Amazon Bedrock adds Llama 3, Mistral, and Cohere Command R+', url: 'https://aws.amazon.com/blog/bedrock-models', published_at: daysAgo(17), source: 'AWS Blog', tag: 'Partnership', summary: 'Amazon\'s managed AI platform expands its model catalog significantly.' },
    { title: 'Ideogram 2.0 beats Midjourney in text-in-image accuracy', url: 'https://ideogram.ai/blog/v2', published_at: daysAgo(23), source: 'Ideogram Blog', tag: 'Product Launch', summary: 'Ideogram\'s new model renders readable text inside generated images.' },
    { title: 'Microsoft acquires Inflection AI talent for $650M', url: 'https://reuters.com/microsoft-inflection', published_at: daysAgo(60), source: 'Reuters', tag: 'M&A', summary: 'In a controversial acqui-hire, Microsoft brings Mustafa Suleyman to lead Consumer AI.' },
    { title: 'GitHub Copilot Workspace reaches 1M enterprise seats', url: 'https://github.blog/copilot-workspace-1m', published_at: daysAgo(24), source: 'GitHub Blog', tag: 'Business', summary: 'Copilot Workspace becomes the fastest enterprise product to reach 1M seats at GitHub.' },
    { title: 'Liquid AI raises $250M for state-space model research', url: 'https://liquid.ai/blog/raise', published_at: daysAgo(38), source: 'Liquid AI Blog', tag: 'Funding', summary: 'MIT spin-off Liquid AI develops an alternative to transformer architectures.' },
    { title: 'EU opens formal investigation into OpenAI over GPT-4 risks', url: 'https://euractiv.com/openai-investigation', published_at: daysAgo(41), source: 'Euractiv', tag: 'Policy', summary: 'Regulators probe potential systemic risks from OpenAI\'s most powerful model.' },
    { title: 'Midjourney launches web platform with community features', url: 'https://midjourney.com/blog/web-platform', published_at: daysAgo(29), source: 'Midjourney Blog', tag: 'Product Launch', summary: 'Moving beyond Discord, Midjourney ships a standalone creative platform.' },
    { title: 'Luma AI raises $43M for 3D and video generation', url: 'https://lumalabs.ai/blog/funding', published_at: daysAgo(36), source: 'Luma AI Blog', tag: 'Funding', summary: 'Luma\'s Dream Machine gains traction as a premium video AI tool for creators.' },
    { title: 'OpenAI signs deal with News Corp for real-time news data', url: 'https://ft.com/openai-newscorp', published_at: daysAgo(43), source: 'Financial Times', tag: 'Partnership', summary: 'OpenAI licenses WSJ and NY Post content to train and ground future models.' },
    { title: 'Mistral AI opens Paris AI hub with 200 new hires', url: 'https://mistral.ai/blog/paris-hub', published_at: daysAgo(33), source: 'Mistral Blog', tag: 'Business', summary: 'Mistral expands its research team as European AI investment surges.' },
    { title: 'Perplexity launches Perplexity Pro for $20/month', url: 'https://perplexity.ai/blog/pro', published_at: daysAgo(50), source: 'Perplexity Blog', tag: 'Product Launch', summary: 'Pro subscribers get GPT-4 and Claude access inside Perplexity search.' },
    { title: 'Scale AI CEO Alexandr Wang calls for AI export controls', url: 'https://wsj.com/scale-ai-export-controls', published_at: daysAgo(48), source: 'Wall Street Journal', tag: 'Policy', summary: 'Wang argues US should restrict AI chip exports to maintain strategic advantage.' },
    { title: 'Together AI open-sources RedPajama training dataset', url: 'https://together.ai/blog/redpajama', published_at: daysAgo(55), source: 'Together AI Blog', tag: 'Research', summary: 'A fully open dataset for training large language models at scale.' },
    { title: 'Character.AI introduces parental controls following criticism', url: 'https://character.ai/blog/safety-update', published_at: daysAgo(26), source: 'Character.AI Blog', tag: 'Safety', summary: 'Character.AI rolls out teen safety features after concerns about AI relationships.' },
    { title: 'NVIDIA H200 chips power OpenAI\'s new training cluster', url: 'https://nvidia.com/blog/h200-openai', published_at: daysAgo(44), source: 'NVIDIA Blog', tag: 'Infrastructure', summary: 'OpenAI\'s next training run uses 100,000 H200 GPUs in a custom cluster.' },
    { title: 'Anthropic launches Claude for Slack integration', url: 'https://anthropic.com/blog/claude-slack', published_at: daysAgo(31), source: 'Anthropic Blog', tag: 'Product Launch', summary: 'Claude is now available natively inside Slack with conversation memory.' },
    { title: 'Stability AI open-sources Stable Diffusion 3.5', url: 'https://stability.ai/blog/sd35', published_at: daysAgo(39), source: 'Stability AI Blog', tag: 'Product Launch', summary: 'SD 3.5 outperforms Midjourney v6 on several image quality benchmarks.' },
    { title: 'Y Combinator AI batch reaches 40% AI startups', url: 'https://techcrunch.com/yc-ai-batch', published_at: daysAgo(52), source: 'TechCrunch', tag: 'Business', summary: 'YC\'s W2025 batch is its most AI-heavy ever, reflecting investor appetite.' },
    { title: 'xAI releases Grok 2 to all X Premium subscribers', url: 'https://x.ai/blog/grok-2', published_at: daysAgo(47), source: 'xAI Blog', tag: 'Product Launch', summary: 'Grok 2 offers real-time web search and image generation via Aurora.' },
    { title: 'OpenAI acquires Rockset for database technology', url: 'https://openai.com/blog/rockset', published_at: daysAgo(65), source: 'OpenAI Blog', tag: 'M&A', summary: 'OpenAI buys the real-time analytics database startup to power its products.' },
    { title: 'Harvey AI raises $100M for legal AI platform', url: 'https://harvey.ai/blog/funding', published_at: daysAgo(34), source: 'Harvey AI Blog', tag: 'Funding', summary: 'Harvey\'s LLM-powered legal research tool signs agreements with top law firms.' },
    { title: 'Adept acquires browser automation startup Multion', url: 'https://adept.ai/blog/multion', published_at: daysAgo(57), source: 'Adept Blog', tag: 'M&A', summary: 'Adept bolsters its enterprise AI agent platform with web browsing capabilities.' },
    { title: 'Waymo launches robotaxi service in San Francisco to public', url: 'https://waymo.com/blog/sf-public', published_at: daysAgo(70), source: 'Waymo Blog', tag: 'Product Launch', summary: 'Waymo opens its fully autonomous taxi service to all San Francisco residents.' },
    { title: 'Cohere signs $200M deal with Oracle Cloud', url: 'https://cohere.com/blog/oracle', published_at: daysAgo(42), source: 'Cohere Blog', tag: 'Partnership', summary: 'Oracle will offer Cohere\'s Command models natively through its cloud platform.' },
    { title: 'AI hiring surges 40% YoY despite tech layoffs', url: 'https://wsj.com/ai-hiring-surge', published_at: daysAgo(59), source: 'Wall Street Journal', tag: 'Industry', summary: 'Demand for AI engineers, researchers, and product managers is outpacing supply.' },
    { title: 'OpenAI launches Operator agent for web automation', url: 'https://openai.com/blog/operator', published_at: daysAgo(15), source: 'OpenAI Blog', tag: 'Product Launch', summary: 'Operator can book restaurants, shop online, and fill forms autonomously.' },
    { title: 'Anthropic publishes model card for Claude 3.5 Opus', url: 'https://anthropic.com/model-card-claude-35-opus', published_at: daysAgo(20), source: 'Anthropic', tag: 'Safety', summary: 'Detailed evaluation results and safety measures for Claude 3.5 Opus.' },
    { title: 'Inflection AI acqui-hired: full team joins Microsoft', url: 'https://bloomberg.com/inflection-microsoft', published_at: daysAgo(66), source: 'Bloomberg', tag: 'M&A', summary: 'In one of the biggest acqui-hires in AI history, Microsoft lands Mustafa Suleyman.' },
    { title: 'Google launches Gemini Advanced for $20/month', url: 'https://blog.google/gemini-advanced', published_at: daysAgo(53), source: 'Google Blog', tag: 'Product Launch', summary: 'Gemini Advanced competes with ChatGPT Plus and Claude Pro at the same price.' },
    { title: 'Cerebras Systems IPO raises $1B at $8.5B valuation', url: 'https://techcrunch.com/cerebras-ipo', published_at: daysAgo(37), source: 'TechCrunch', tag: 'Funding', summary: 'The wafer-scale AI chip maker goes public, targeting inference workloads.' },
    { title: 'OpenAI fires and rehires CEO Sam Altman in dramatic 5-day saga', url: 'https://nytimes.com/openai-altman', published_at: daysAgo(180), source: 'NY Times', tag: 'Business', summary: 'A board dispute over safety leads to Altman\'s brief firing and rapid reinstatement.' },
    { title: 'Mistral releases Mixtral 8x22B open-source MoE model', url: 'https://mistral.ai/blog/mixtral-8x22b', published_at: daysAgo(75), source: 'Mistral Blog', tag: 'Product Launch', summary: 'Mixtral 8x22B sets a new benchmark for open-source mixture-of-experts LLMs.' },
    { title: 'Playground AI raises $40M for image creation platform', url: 'https://playground.com/blog/funding', published_at: daysAgo(80), source: 'Playground AI Blog', tag: 'Funding', summary: 'Playground targets creative professionals with a powerful image editing platform.' },
    { title: 'Brave integrates Mistral and Llama into its search engine', url: 'https://brave.com/blog/ai-search', published_at: daysAgo(64), source: 'Brave Blog', tag: 'Partnership', summary: 'Brave\'s privacy-first search engine now uses local models for AI answers.' },
    { title: 'Nomic AI releases Atlas multimodal data explorer', url: 'https://nomic.ai/blog/atlas', published_at: daysAgo(72), source: 'Nomic AI Blog', tag: 'Product Launch', summary: 'Atlas lets teams visualize and explore millions of text and image embeddings.' },
    { title: 'LangChain raises $25M to power AI app development', url: 'https://langchain.com/blog/funding', published_at: daysAgo(90), source: 'LangChain Blog', tag: 'Funding', summary: 'The popular LLM orchestration framework raises a Series A from Benchmark.' },
    { title: 'Stability AI CEO Emad Mostaque resigns amid turmoil', url: 'https://techcrunch.com/stability-mostaque', published_at: daysAgo(95), source: 'TechCrunch', tag: 'Business', summary: 'Stability AI faces leadership and financial challenges as its CEO steps down.' },
    { title: 'AI21 Labs releases Jamba: first production-grade Mamba LLM', url: 'https://ai21.com/blog/jamba', published_at: daysAgo(85), source: 'AI21 Labs Blog', tag: 'Product Launch', summary: 'Jamba combines SSM and transformer architectures for efficient inference.' },
    { title: 'Amazon launches Nova foundation models to compete with Claude', url: 'https://aws.amazon.com/blog/amazon-nova', published_at: daysAgo(46), source: 'AWS Blog', tag: 'Product Launch', summary: 'Amazon Nova offers multimodal capabilities across its Bedrock platform.' },
    { title: 'Replit Ghostwriter becomes Replit Agent, now can deploy apps', url: 'https://replit.com/blog/agent', published_at: daysAgo(28), source: 'Replit Blog', tag: 'Product Launch', summary: 'Replit\'s AI coding assistant can now build, deploy, and iterate on full apps.' },
    { title: 'OpenAI publishes o1 reasoning model technical report', url: 'https://openai.com/blog/o1-tech-report', published_at: daysAgo(110), source: 'OpenAI Blog', tag: 'Research', summary: 'OpenAI details how chain-of-thought prompting enables advanced reasoning in o1.' },
    { title: 'Typeface raises $165M for enterprise AI content platform', url: 'https://typeface.ai/blog/series-b', published_at: daysAgo(100), source: 'Typeface Blog', tag: 'Funding', summary: 'The Salesforce Ventures-backed startup targets B2B marketing content at scale.' },
    { title: 'Glean raises $200M to build AI search for enterprises', url: 'https://glean.com/blog/series-e', published_at: daysAgo(56), source: 'Glean Blog', tag: 'Funding', summary: 'Glean is connecting enterprise knowledge sources with AI-powered search.' },
    { title: 'Nvidia acquires AI networking startup Cumulus Networks', url: 'https://nvidia.com/blog/cumulus', published_at: daysAgo(120), source: 'NVIDIA Blog', tag: 'M&A', summary: 'Nvidia bolsters its data center stack with software-defined networking.' },
    { title: 'Fixie.ai rebrands as Playground for AI agents', url: 'https://fixie.ai/blog/rebrand', published_at: daysAgo(77), source: 'Fixie Blog', tag: 'Business', summary: 'The AI agent startup pivots and rebrands to focus on multi-agent workflows.' },
    { title: 'Anthropic partners with Palantir for US government AI', url: 'https://anthropic.com/blog/palantir', published_at: daysAgo(49), source: 'Anthropic Blog', tag: 'Partnership', summary: 'Claude will be available to classified US government agencies via Palantir.' },
    { title: 'Figure 02 robot from Figure AI stuns with dexterous tasks', url: 'https://figure.ai/blog/figure-02', published_at: daysAgo(88), source: 'Figure AI Blog', tag: 'Product Launch', summary: 'Figure 02 demonstrates end-to-end neural network control for household tasks.' },
    { title: 'SambaNova launches Samba-1 at 1T parameters', url: 'https://sambanova.ai/blog/samba-1', published_at: daysAgo(103), source: 'SambaNova Blog', tag: 'Product Launch', summary: 'SambaNova\'s 1T parameter model runs on its custom RDU hardware at record speed.' },
    { title: 'Imbue raises $200M for reasoning and agent research', url: 'https://imbue.com/blog/funding', published_at: daysAgo(115), source: 'Imbue Blog', tag: 'Funding', summary: 'The ex-Scale and DeepMind researchers focus on training models that reason.' },
    { title: 'Gradient AI raises $50M to bring LLMs to enterprise data', url: 'https://gradient.ai/blog/funding', published_at: daysAgo(92), source: 'Gradient AI Blog', tag: 'Funding', summary: 'Gradient offers fine-tuned models on private data for mid-market enterprises.' },
    { title: 'OpenAI and Jony Ive partner on AI hardware device', url: 'https://wsj.com/openai-jony-ive-device', published_at: daysAgo(40), source: 'Wall Street Journal', tag: 'Product Launch', summary: 'OpenAI partners with the former Apple designer on a new AI companion device.' },
    { title: 'Mosaic ML open-sources MPT-30B instruction model', url: 'https://mosaicml.com/blog/mpt-30b', published_at: daysAgo(130), source: 'MosaicML Blog', tag: 'Research', summary: 'MPT-30B becomes one of the best performing openly licensed LLMs at release.' },
    { title: 'Cohere for AI publishes Aya-101 multilingual dataset', url: 'https://cohere.com/blog/aya-101', published_at: daysAgo(108), source: 'Cohere Blog', tag: 'Research', summary: 'A massive multilingual dataset covering 101 languages for underrepresented AI.' },
    { title: 'DeepSeek V2 from Chinese lab challenges GPT-4 on benchmarks', url: 'https://deepseek.com/blog/v2', published_at: daysAgo(62), source: 'DeepSeek Blog', tag: 'Research', summary: 'DeepSeek releases an open-weight model that rivals GPT-4 at a fraction of the cost.' },
    { title: 'Lmsys Chatbot Arena reaches 1M human preference votes', url: 'https://lmsys.org/blog/chatbot-arena-1m', published_at: daysAgo(83), source: 'LMSYS Blog', tag: 'Research', summary: 'The crowdsourced LLM benchmark reaches a major data milestone.' },
    { title: 'Runway announces partnership with Lionsgate for AI film tools', url: 'https://runway.com/blog/lionsgate', published_at: daysAgo(54), source: 'Runway Blog', tag: 'Partnership', summary: 'Hollywood studio Lionsgate will use Runway\'s AI tools in production pipelines.' },
    { title: 'AI Act implementation guide released by EU Commission', url: 'https://ec.europa.eu/ai-act-guide', published_at: daysAgo(16), source: 'EU Commission', tag: 'Policy', summary: 'Practical guidance for companies on complying with the EU AI Act by 2026.' },
    { title: 'Perplexity acquires AI app developer Carbon to expand Pages', url: 'https://perplexity.ai/blog/carbon-acquisition', published_at: daysAgo(11), source: 'Perplexity Blog', tag: 'M&A', summary: 'Perplexity acquires Carbon to add document creation features to its platform.' },
    { title: 'Elon Musk sues OpenAI again over GPT-4 commercialization', url: 'https://reuters.com/musk-openai-lawsuit', published_at: daysAgo(68), source: 'Reuters', tag: 'Legal', summary: 'Musk files a second lawsuit against OpenAI, alleging breach of founding agreement.' },
    { title: 'Hugging Face acquires ML platform Gradio', url: 'https://huggingface.co/blog/gradio-acquisition', published_at: daysAgo(145), source: 'Hugging Face Blog', tag: 'M&A', summary: 'Hugging Face brings the popular demo library in-house as a core product.' },
    { title: 'Cerebras announces 900,000 core AI chip cluster', url: 'https://cerebras.net/blog/cluster', published_at: daysAgo(73), source: 'Cerebras Blog', tag: 'Infrastructure', summary: 'Cerebras\' new inference cluster can serve 1M tokens per second for LLMs.' },
    { title: 'Nvidia stock surpasses $3T market cap on AI boom', url: 'https://bloomberg.com/nvidia-3t', published_at: daysAgo(58), source: 'Bloomberg', tag: 'Business', summary: 'Nvidia becomes the world\'s most valuable company, driven by AI chip demand.' },
    { title: 'UK announces £1B National AI Research Resource', url: 'https://gov.uk/ai-research-resource', published_at: daysAgo(76), source: 'GOV.UK', tag: 'Policy', summary: 'The UK government funds a shared compute and data resource for AI researchers.' },
    { title: 'Wayve raises $1.05B for autonomous driving AI in cities', url: 'https://wayve.ai/blog/series-c', published_at: daysAgo(61), source: 'Wayve Blog', tag: 'Funding', summary: 'Microsoft-backed Wayve focuses on learning-based self-driving for urban environments.' },
    { title: 'OpenAI launches memory feature in ChatGPT', url: 'https://openai.com/blog/chatgpt-memory', published_at: daysAgo(97), source: 'OpenAI Blog', tag: 'Product Launch', summary: 'ChatGPT can now remember facts across conversations for personalized responses.' },
    { title: 'Isomorphic Labs uses AlphaFold 3 to accelerate drug discovery', url: 'https://isomorphiclabs.com/blog/alphafold3', published_at: daysAgo(79), source: 'Isomorphic Labs Blog', tag: 'Research', summary: 'AlphaFold 3 predicts all molecular interactions, unlocking new drug targets.' },
  ];

  // Upsert in batches of 25. Seed a plausible view_count so /news/trending has
  // something to sort by out of the box — real traffic will overtake this via
  // the increment_news_view_count RPC as articles get read.
  let seeded = 0;
  for (let i = 0; i < articles.length; i += 25) {
    const batch = articles.slice(i, i + 25).map((a) => ({ ...a, view_count: Math.floor(Math.random() * 5000) }));
    const { error } = await supabase.from('news_articles').upsert(batch, { onConflict: 'url' });
    if (error) console.error(`News batch ${i} error:`, error.message);
    else seeded += batch.length;
  }
  console.log(`✓ Seeded ${seeded} news articles`);
}

async function main() {
  console.log('Seeding extension data...');
  await seedFounders();
  await seedProducts();
  await seedNews();
  console.log('Done!');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });