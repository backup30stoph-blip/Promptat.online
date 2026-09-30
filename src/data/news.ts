export interface AINewsItem {
  id: string;
  slug: string;
  title: string;
  title_ar: string;
  excerpt: string;
  excerpt_ar: string;
  content: string;
  content_ar: string;
  category: 'models' | 'video' | 'image' | 'tools' | 'opensource';
  category_label: string;
  category_label_ar: string;
  cover: string;
  source: string;
  source_url?: string;
  published_at: string;
  read_time: string;
  is_breaking?: boolean;
  views: number;
  likes: number;
  tags: string[];
}

export const AI_NEWS_ITEMS: AINewsItem[] = [
  {
    id: 'news-1',
    slug: 'runway-gen-3-direct-camera-control-update',
    title: 'Runway Unveils Gen-3 Alpha Advanced Camera Control & Multi-Motion Tracking',
    title_ar: 'رنواي تطلق ميزة التحكم المتقدم بالكاميرا وتتبع الحركة المتعددة في Gen-3 Alpha',
    excerpt: 'Runway releases precise cinematic camera controls, enabling creators to script pan, tilt, zoom, and orbit motions with sub-millimeter precision.',
    excerpt_ar: 'أعلنت شركة Runway عن تحديث ثوري يتيح للمبدعين التحكم في زوايا الكاميرا وحركتها بدقة سينمائية غير مسبوقة لتوليد فيديوهات فائقة الواقعية.',
    content: `Runway has officially launched enhanced Camera Controls for Gen-3 Alpha. Creators can now designate custom camera paths including Roll, Pan, Tilt, Dolly Zoom, and Orbit directly from prompt strings or visual coordinate dials.

### Key Highlights:
- **Cinematic Precision**: Specify focal lengths (24mm, 35mm, 85mm anamorphic).
- **Speed & Intensity**: Motion vector scaling from 1 (subtle slow motion) to 10 (high-speed action).
- **4K Upscaling & Temporal Consistency**: Reduced artifacting on fluid simulations and human facial expressions.`,
    content_ar: `أطلقت Runway رسميًا تحديث أدوات التحكم بالكاميرا في نموذج Gen-3 Alpha، مما يمنح صناع المحتوى حرية كاملة في توجيه حركة الكاميرا السينمائية داخل المشهد.

### أبرز التحديثات:
- **دقة سينمائية**: إمكانية تحديد نوع العدسات (24mm، 35mm، 85mm Anamorphic).
- **التحكم بالسرعة وقوة الحركة**: ضبط متجه الحركة من 1 (حركة بطيئة ناعمة) إلى 10 (حركة سريعة وأكشن).
- **دقة 4K وثبات بصري فائق**: تقليل التشوهات في حركة الوجوه والمحاكاة الفيزيائية المعقدة.`,
    category: 'video',
    category_label: 'Video AI',
    category_label_ar: 'ذكاء الفيديو',
    cover: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80',
    source: 'Runway Research',
    published_at: '2026-09-29T14:30:00Z',
    read_time: '3 min read',
    is_breaking: true,
    views: 4520,
    likes: 890,
    tags: ['Runway Gen-3', 'Video AI', 'Camera Control', 'AI Motion']
  },
  {
    id: 'news-2',
    slug: 'claude-3-7-hybrid-reasoning-launch',
    title: 'Anthropic Announces Claude 3.7 Sonnet with Dynamic Hybrid Thinking',
    title_ar: 'أنثروبيك تطلق نموذج Claude 3.7 Sonnet بنظام التفكير الهجين المتكيف',
    excerpt: 'Claude 3.7 Sonnet introduces controllable reasoning budgets, switching between instant answers and deep multi-step computational reasoning.',
    excerpt_ar: 'أطلقت أنثروبيك نموذجها الرائد الجديد Claude 3.7 Sonnet الذي يدمج سرعة الاستجابة اللحظية مع التفكير التحليلي العميق القابل للتحكم.',
    content: `Anthropic has unveiled Claude 3.7 Sonnet, the industry's first hybrid reasoning model that allows developers and creators to dial in exact thinking token budgets.

### What Makes it Unique:
- **Controllable Extended Thinking**: Set thinking tokens from 1k to 64k based on code complexity.
- **Top-tier Full-Stack Engineering**: Massive gains on SWE-bench and real-world frontend architecture debugging.
- **Agentic Workflows**: Flawless tool use with multi-turn parallel verification.`,
    content_ar: `كشفت شركة Anthropic عن نموذج Claude 3.7 Sonnet، وهو أول نموذج هجين يمنح المطورين القدرة على تحديد ميزانية تفكير مخصصة لكل مهمة برمجية أو تحليلية.

### أهم المزايا:
- **تفكير تحليلي متكيف**: التحكم بعدد رموز التفكير من 1000 إلى 64000 رمز بحسب تعقيد الكود.
- **تفوق قياسي في هندسة البرمجيات**: قفزة نوعية في اختبارات SWE-bench وبناء واجهات الويب المعقدة.
- **دقة في استدعاء الأدوات**: تنفيذ مهام متعددة الخطوات بالتوازي مع التحقق الذاتي من الأخطاء.`,
    category: 'models',
    category_label: 'LLMs & Reasoning',
    category_label_ar: 'النماذج اللغوية',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    source: 'Anthropic',
    published_at: '2026-09-28T09:15:00Z',
    read_time: '4 min read',
    is_breaking: true,
    views: 8940,
    likes: 1620,
    tags: ['Claude 3.7', 'Reasoning', 'Anthropic', 'Coding']
  },
  {
    id: 'news-3',
    slug: 'kling-ai-1-5-global-creator-suite',
    title: 'Kling AI 1.5 Upgrades Motion Quality and 1080p Cinematic Physics',
    title_ar: 'تحديث Kling AI 1.5: فيزياء سينمائية واقعية وجودة 1080p عالية الدقة',
    excerpt: 'Kling 1.5 delivers lifelike gravity, lighting reflections, and complex crowd movements with improved text prompt compliance.',
    excerpt_ar: 'يقدم Kling 1.5 قفزة هائلة في محاكاة الجاذبية، انعكاسات الإضاءة، وحركة الحشود المعقدة مع استجابة دقيقة لأوامر النصوص.',
    content: `The Kling AI video generation suite has released version 1.5, introducing full 1080p native rendering and physics-informed character motion.

### Core Features:
- **Complex Multi-Subject Interactions**: Characters interact naturally with objects and surrounding environments.
- **Native 16:9 & 9:16 Aspect Ratios**: Direct export optimized for cinematic YouTube and vertical Reels.
- **Realistic Lighting & Reflections**: Dynamic water, glass, and neon reflections calculated per frame.`,
    content_ar: `أعلنت منصة Kling AI عن إطلاق النسخة 1.5 التي توفر محاكاة فيزيائية عالية الواقعية وتوليد فيديو بدقة 1080p أصلية مع استجابة متفوقة للمطالبات النصية.

### المزايا الأساسية:
- **تفاعل متقدم بين العناصر**: تفاعل طبيعي وسلس للشخصيات مع الأدوات والبيئة المحيطة.
- **أبعاد مخصصة 16:9 و 9:16**: توليد مباشر للسينما ويوتيوب، أو لمنصات الفيديو العمودي مثل تيك توك وريلز.
- **إضاءة وانعكاسات ديناميكية**: محاكاة واقعية لانعكاسات الماء والزجاج وأضواء النيون في كل إطار.`,
    category: 'video',
    category_label: 'Video AI',
    category_label_ar: 'ذكاء الفيديو',
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    source: 'Kling Media',
    published_at: '2026-09-27T18:00:00Z',
    read_time: '3 min read',
    is_breaking: false,
    views: 3120,
    likes: 670,
    tags: ['Kling AI', 'Video Prompts', 'Physics', 'Cinematic']
  },
  {
    id: 'news-4',
    slug: 'flux-1-lora-ecosystem-explosion',
    title: 'Flux.1 Open Ecosystem Surpasses 10,000 Custom Community LoRAs',
    title_ar: 'نظام Flux.1 المفتوح يتجاوز 10,000 نموذج LoRA مخصص للمصممين',
    excerpt: 'The Black Forest Labs Flux.1 ecosystem expands rapidly with photorealistic style LoRAs, typography generators, and studio product visualizers.',
    excerpt_ar: 'يشهد مجتمع Flux.1 نمواً قياسياً مع توفر آلاف النماذج المصغرة لإنتاج صور استوديو، خطوط طباعية، وتصميم منتجات تجارية متقنة.',
    content: `Black Forest Labs' open-weights Flux.1 model has become the new standard for image creators, crossing 10,000 open-source community LoRA adapters on Civitai and HuggingFace.

From commercial product mockups to intricate isometric worlds, Flux.1 is empowering designers to achieve production-ready imagery with minimal prompt tuning.`,
    content_ar: `أصبح نموذج Flux.1 المفتوح المعيار الجديد لصناع الصور والمصممين، متجاوزاً حاجز 10,000 نموذج LoRA متخصص للتصميم والطباعة على منصات Civitai و HuggingFace.

يمكّن هذا النموذج المبدعين من إنتاج صور تجارية واحترافية للمنتجات بدقة غير مسبوقة وبأقل قدر من التعديل اليدوي.`,
    category: 'image',
    category_label: 'Image AI',
    category_label_ar: 'ذكاء الصور',
    cover: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    source: 'Black Forest Labs',
    published_at: '2026-09-26T11:45:00Z',
    read_time: '3 min read',
    is_breaking: false,
    views: 5240,
    likes: 1180,
    tags: ['Flux.1', 'Image Prompts', 'LoRA', 'Design']
  },
  {
    id: 'news-5',
    slug: 'deepseek-v3-compute-efficiency-milestone',
    title: 'DeepSeek-V3 Breakthrough: State-of-the-Art Performance with Extreme Efficiency',
    title_ar: 'إنجاز DeepSeek-V3: أداء فائق بمستويات استهلاك طاقة وحوسبة قياسية',
    excerpt: 'DeepSeek-V3 sets a new benchmark in open model efficiency, rivaling proprietary frontier models across coding and multilingual tasks.',
    excerpt_ar: 'حقق نموذج DeepSeek-V3 المفتوح قفزة نوعية في كفاءة الحوسبة، منافساً أقوى النماذج المغلقة في البرمجة والمهام متعددة اللغات.',
    content: `DeepSeek has published comprehensive architecture benchmarks for DeepSeek-V3, demonstrating how Multi-Head Latent Attention (MLA) and DeepSeekMoE architectures achieve top-tier benchmark scores with exceptional token throughput.`,
    content_ar: `نشرت DeepSeek نتائج معمارية نموذجها الجديد DeepSeek-V3، والتي كشفت عن تقنيات ضغط الانتباه المتعدد ومصفوفة الخبراء الموزعة التي تمنح سرعة معالجة استثنائية بتكلفة اقتصادية منخفضة.`,
    category: 'opensource',
    category_label: 'Open Source',
    category_label_ar: 'المصادر المفتوحة',
    cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    source: 'DeepSeek AI',
    published_at: '2026-09-25T16:20:00Z',
    read_time: '5 min read',
    is_breaking: false,
    views: 6710,
    likes: 1450,
    tags: ['DeepSeek', 'Open Source', 'LLMs', 'AI Architecture']
  }
];
