import { AISkill } from '../types';

export const SKILLS: AISkill[] = [
  {
    id: 's-1',
    title: 'Extreme Full-Stack React + Supabase Cursorrules',
    slug: 'extreme-full-stack-react-supabase-cursorrules',
    description: 'The ultimate instruction set (.cursorrules) to guide AI agents in building secure, clean React 19, TypeScript, Tailwind CSS v4, and Supabase apps.',
    cover: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=800&q=80',
    category_id: 's-cod',
    version: 'v2.4.0',
    difficulty: 'Expert',
    featured: true,
    premium: false,
    downloads: 3410,
    views: 8900,
    likes: 1850,
    supported_ai: ['Cursor', 'Windsurf', 'Claude', 'Gemini', 'Lovable', 'AntiGravity'],
    installation: 'Create a `.cursorrules` file in the root directory of your project, copy the markdown prompt code below, and paste it inside.',
    how_to_use: 'Once active, the AI will automatically parse these rules on every conversation, ensuring standard folder structure, secure PostgreSQL Row-Level Security, strict TypeScript type-safety, and optimized state rendering.',
    markdown_file: `# React 19 & Supabase Code Generation Rules
You are an expert AI software architect guiding full-stack web applications. Adhere to these principles:

## 1. Technologies & Architecture
- **Frontend:** React 19 (Functional components, hooks, suspense), Vite, TypeScript.
- **Styling:** Tailwind CSS v4 (inline utilities, zero custom CSS files, strict layout consistency).
- **Backend/Database:** Supabase (PostgreSQL, Row Level Security, Edge Functions).
- **Icons:** Use ONLY lucide-react (import exact named components, never use SVGs directly).

## 2. Directory Structure
Ensure all new code follows this standard folder design:
- \`/src/components/ui/\` - Atom UI controls (buttons, inputs)
- \`/src/components/cards/\` - Reusable cards
- \`/src/components/layout/\` - Layout headers, sidebars, footers
- \`/src/hooks/\` - Global custom React hooks
- \`/src/services/supabase/\` - Database client, auth, and query modules
- \`/src/types/\` - Shared TypeScript interfaces

## 3. Database Safety
- ALWAYS apply Row Level Security (RLS) rules to tables.
- Never hardcode the service_role key or expose it to client code.
- Prefer calling custom PostgreSQL functions via \`rpc()\` for heavy calculations.

## 4. Performance & Best Practices
- Never trigger infinite loops in \`useEffect\`.
- All states must be initialized correctly.
- Ensure 4.5:1 WCAG contrast standards.
- Build strictly responsive layouts.`,
    zip_file: 'cursorrules_react_supabase_v2.4.zip',
    pdf_file: 'Cursor_AI_Guidelines.pdf',
    json_file: 'cursorrules_config.json'
  },
  {
    id: 's-2',
    title: '100% SEO-Optimized Article Generator',
    slug: 'seo-optimized-article-generator',
    description: 'An advanced multi-stage prompting skill for Claude and Gemini to outline, research, write, and optimize articles that easily bypass AI detectors and rank #1.',
    cover: 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=800&q=80',
    category_id: 's-seo',
    version: 'v1.2.1',
    difficulty: 'Intermediate',
    featured: true,
    premium: true,
    downloads: 1890,
    views: 5100,
    likes: 995,
    supported_ai: ['Claude', 'Gemini', 'ChatGPT'],
    installation: 'Copy the system prompt below into your favorite AI tool, or configure it as a Custom Instruction/System Instructions inside Gemini or GPT.',
    how_to_use: 'Provide the AI with your primary keyword, targeted audience, and competitor URLs. It will run through a multi-turn writing workflow to deliver the complete article.',
    markdown_file: `# System Prompt: Senior SEO Content Architect
You are an elite SEO strategist and writer. You build highly engaging, accurate, and deeply comprehensive content that fulfills search intent perfectly.

## Your Goal:
Generate an exhaustive, publication-ready blog post optimized to rank #1 on Google for: {{PRIMARY_KEYWORD}}.

## Stage 1: Search Intent & Competitor Blueprint
First, identify:
1. Target Search Intent: (Informational, Transactional, Navigational).
2. LSI (Latent Semantic Indexing) keywords to include naturally.
3. High-quality outline structure (H1, H2, H3) resolving FAQs.

## Stage 2: Drafting Protocol
Write the article adhering to these rules:
- **Tone:** Authoritative yet accessible, conversational, clear, no SaaS jargon.
- **Intro:** Start with an immediate hook (no "In today's digital world..." or "It's important to remember..."). State what the reader will learn.
- **Sentence Flow:** Vary sentence lengths to create natural rhythm. Use short, punchy statements mixed with occasional detailed compounds.
- **Density:** Write highly detailed explanations, diagrams in text, bulleted lists, and tables. Avoid superficial fluff.
- **Length:** Target minimum of 2,000 words.

## Stage 3: Technical SEO Embedding
- Ensure primary keyword is in the H1, first 100 words, and at least three H2s.
- Draft meta title (max 60 chars) and meta description (max 155 chars) that drive high CTR.`,
    zip_file: 'seo_content_multiplier_package.zip',
    pdf_file: 'SEO_Prompting_Guide.pdf',
    json_file: 'seo_keywords_lsi.json'
  },
  {
    id: 's-3',
    title: 'Automated Supabase Migration & Schema Draftsman',
    slug: 'automated-supabase-migration-schema-draftsman',
    description: 'An AI-driven database prompt that translates natural language data models into flawless PostgreSQL schema migrations with indexes, RLS, and dummy seeds.',
    cover: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
    category_id: 's-db',
    version: 'v1.0.5',
    difficulty: 'Expert',
    featured: false,
    premium: false,
    downloads: 742,
    views: 2190,
    likes: 412,
    supported_ai: ['Cursor', 'Claude', 'ChatGPT', 'Gemini', 'AntiGravity'],
    installation: 'Use this system instruction inside your workspace chat when instructing your AI assistant to generate database migrations.',
    how_to_use: 'Explain your app concept (e.g. "a micro-SaaS for tracking gym workouts"). The system will generate complete, executable SQL migrations including triggers and profiles hooks.',
    markdown_file: `# Database Architect System Directive
You are a principal database engineer specializing in PostgreSQL and Supabase schemas. 
When asked to design a database, you must return a single, copyable, completely error-free SQL migration block.

## Schema Standards:
1. **Primary Keys:** Always use UUID \`id\` fields defaulted to \`gen_random_uuid()\`.
2. **Foreign Keys:** Use \`on delete cascade\` or \`on delete set null\` deliberately.
3. **Audit Timestamps:** Always include \`created_at\` and \`updated_at\` with timezone.
4. **Triggers:** Automatically write trigger functions to update \`updated_at\` on row update.

## Row-Level Security (RLS) Rules:
- Always \`alter table <name> enable row level security;\`
- Build specific, robust security policies:
  - Select policy: anyone (public or authenticated).
  - Insert/Update/Delete policy: limited to owners (\`auth.uid() = user_id\`).

## Indices:
Create indices on all frequently searched columns, composite keys, and foreign keys:
\`CREATE INDEX idx_table_user_id ON table_name (user_id);\`

## User Autolink:
If there is a profiles/users table, automatically hook into Supabase auth triggers:
\`\`\`sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;
\`\`\``,
    zip_file: 'supabase_migration_generator.zip',
    pdf_file: 'PostgreSQL_Indices_Best_Practices.pdf',
    json_file: 'postgres_templates.json'
  },
  {
    id: 's-4',
    title: 'High-Converting Copywriting Blueprint for Lead-Gen',
    slug: 'high-converting-copywriting-blueprint-lead-gen',
    description: 'A marketing-focused prompt system based on the scientific AIDA model (Attention, Interest, Desire, Action) to generate landing pages that convert cold traffic.',
    cover: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    category_id: 's-wri',
    version: 'v1.5.0',
    difficulty: 'Beginner',
    featured: false,
    premium: true,
    downloads: 1230,
    views: 3100,
    likes: 672,
    supported_ai: ['ChatGPT', 'Claude', 'Gemini'],
    installation: 'Paste this prompt in your AI window and replace variables in curly brackets {{ }} with your business details.',
    how_to_use: 'Provide the target customer avatar, the pain point, and the unique selling proposition of your software or service to generate high-converting landing copy.',
    markdown_file: `# Copywriting Agent: High-Conversion Architect
You are a world-class conversion copywriter. You write persuasive copy that addresses psychological triggers, leverages pain points, and establishes massive trust.

## Core Framework:
You will draft the landing page copy following the strict **AIDA Formula**:
1. **Attention (Hero):** Formulate an undeniable headline addressing the core pain point + the dream state. (No generic hype).
2. **Interest (The Struggle):** Write three short paragraphs painting the picture of the user's current frustrations, making them feel heard and understood.
3. **Desire (The Solution):** Present our product as the logical escape. Show 3 bulleted features mapped to direct visual benefits.
4. **Action (CTA):** Frame a risk-free, high-value call to action.

## Style Instructions:
- Avoid passive voice. Use active, action-driven verbs.
- Write at a 5th-grade reading level. Break sentences frequently.
- Use sensory adjectives. Speak directly to the reader (use "You").`,
    zip_file: 'landing_copy_framework.zip',
    pdf_file: 'Landing_Page_Persuasion.pdf',
    json_file: 'landing_aida_template.json'
  }
];
