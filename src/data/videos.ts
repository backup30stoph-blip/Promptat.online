import { VideoConcept } from '../types';

export const VIDEO_CONCEPTS: VideoConcept[] = [
  {
    id: 'v-1',
    title: 'Countries Depicted as Epic Anime Supervillains',
    slug: 'countries-depicted-as-epic-anime-supervillains',
    cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    description: 'This concept leverages AI image generators (Midjourney/Flux) to reimagine countries as characters. It is currently one of the highest-viewed trends on YouTube Shorts, TikTok, and Instagram Reels, generating millions of organic impressions in days.',
    hook: 'If world nations were anime supervillains, who would be the final boss? Here is what they look like, and the results are terrifying...',
    niche: 'AI Art & Entertainment / Geography Trivia',
    difficulty: 'Easy',
    expected_rpm: 1.20,
    competition: 'Medium',
    virality_score: 98,
    ai_tools_needed: ['Midjourney v6', 'ElevenLabs (Adam Voice)', 'Leonardo AI (Motion)', 'CapCut Pro'],
    
    // Blueprints
    channel_blueprint: 'Build a dedicated short-form channel ("WorldReimagined" or "AI Nation Villains"). Post twice a day. Maintain a consistent, dark cinematic atmosphere with booming, suspenseful orchestral background music. Keep videos between 45 to 55 seconds, flashing each country character for exactly 5-6 seconds with dramatic, slow-zoom keyframes.',
    video_structure: [
      '0:00 - 0:05 | Hook: Prompt a question asking who the final boss is, show a teaser of USA or Japan.',
      '0:05 - 0:12 | Character 1: The United Kingdom as a dark steampunk monarch.',
      '0:12 - 0:18 | Character 2: Brazil as a massive jungle/nature shaman villain.',
      '0:18 - 0:24 | Character 3: Japan as a neon cybernetic samurai overlord.',
      '0:24 - 0:31 | Character 4: Morocco as a mystical golden sand desert wizard.',
      '0:31 - 0:38 | Character 5: Italy as a high-fashion, mafia-style godfather of stone.',
      '0:38 - 0:45 | Character 6 (The Boss): Canada as a giant frozen timberland yeti conqueror.',
      '0:45 - 0:50 | Call to Action: Ask viewers "Which country did we miss? Comment below to see Part 2!"'
    ],
    thumbnail_prompt: 'High-contrast split image, on the left: Japan as a glowing neon cybernetic red-eyed samurai; on the right: USA as an eagle-themed military dictator with glowing blue aura. Dramatic dark background, heavy rain, hyper-detailed, 8k resolution, cinematic look, centered text "WHO IS THE BOSS?" in bold impact font.',
    voice_prompt: 'Generate a voiceover using ElevenLabs (Voice ID: "Adam" or "Marcus"). Set Stability to 40%, Clarity to 85%, and Style Exaggeration to 15% for a deep, cinematic, slightly raspy, epic narration style.',
    editing_prompt: 'Add heavy camera shake on character transitions. Use CapCut "Cinematic zoom-in" effects on each image. Overlay dust particles and rain overlay effects at 15% opacity. Sync transition cuts exactly to the heavy beat-drops of a dark suspenseful Hans Zimmer-style audio track.',
    image_prompt: 'Anime key visual, [COUNTRY] depicted as a powerful supervillain, fantasy armor themed around [COUNTRY NATIONAL EMBLEM/CULTURE], glowing energy eyes, dynamic battle pose, epic lightning background, dark fantasy aesthetic, hyper-detailed, gorgeous colors, trending on ArtStation, 8k.',
    animation_prompt: 'Import generated images into Leonardo AI Motion or Runway Gen-2. Apply motion strength: 3. Zoom speed: 1.5. Horizontal panning: 0.5. Set camera motion to slowly pan into the glowing eyes of the character to create a lifelike 3D depth.',
    
    // SEO
    titles: [
      'If Countries Were Anime Supervillains 💀',
      'Countries as AI Supervillains... The Final Boss is Wild!',
      'Reimagining World Nations as Villains (Part 1)'
    ],
    description_seo: 'We used advanced AI tools to reimagine countries as epic anime supervillains! From the cybernetic streets of Japan to the mysterious sands of Morocco, wait until you see who the final boss is. What country should we do next? Comment below!',
    tags: ['countries as villains', 'ai art trend', 'midjourney anime', 'countries as supervillains', 'viral shorts', 'elevenlabs narrator', 'nations anime'],
    hashtags: ['#aiart', '#countries', '#anime', '#midjourney', '#viralshorts', '#supervillain'],
    publishing_schedule: 'Post on TikTok at 11:30 AM and 6:00 PM local time. Post on YouTube Shorts at 3:00 PM EST.',
    
    // Monetization
    monetization: [
      'TikTok Creator Rewards Program (Once 10k followers are reached)',
      'YouTube Shorts Ad Revenue',
      'Selling high-quality poster prints of the characters via Shopify print-on-demand'
    ],
    affiliate_ideas: [
      'Promote Midjourney / Leonardo AI referral programs in your bio.',
      'Promote ElevenLabs affiliate link as the voice generator used.'
    ],
    resources: [
      'CapCut Cinematic Overlay Pack',
      'Hans Zimmer Suspenseful Royalty-Free Audio Link',
      'Morocco Sand Shaman Prompt Settings'
    ],
    downloads: 4890,
    views: 12450,
    likes: 2104,
    featured: true
  },
  {
    id: 'v-2',
    title: 'Secret Floating Mega-Resorts of 2050',
    slug: 'secret-floating-mega-resorts-of-2050',
    cover: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
    description: 'A premium, high-RPM documentary concept showing futuristic floating hotels, underwater suites, and artificial resort islands of 2050. This niche targets high-income viewers interested in travel, luxury tech, architecture, and engineering, yielding extremely high ad-rates.',
    hook: 'Forget traditional hotels. In 2050, the richest 1% will vacation in floating biophilic mega-cities that sail across the ocean...',
    niche: 'Luxury Travel / Future Tech & Engineering',
    difficulty: 'Hard',
    expected_rpm: 8.50,
    competition: 'Low',
    virality_score: 85,
    ai_tools_needed: ['Flux.1 (Pro)', 'Midjourney v6', 'InVideo AI (Script-to-Video)', 'ElevenLabs (Rachel Voice)'],
    
    // Blueprints
    channel_blueprint: 'Establish a premium faceless documentary channel ("LuxuryHorizon" or "FutureBuilds"). Videos must be 8 to 12 minutes long to qualify for multiple mid-roll ads. Focus on slow, high-quality, pristine visuals with a sophisticated, calm, professional narrator. Keep background music soft, atmospheric, and aspirational.',
    video_structure: [
      '0:00 - 1:30 | Introduction: The evolution of ultra-luxury resorts. Show the threat of rising sea levels turning into floating architecture.',
      '1:30 - 4:00 | Project 1: "The Ocean Oasis" - A massive self-sustaining floating hotel in the Maldives with coral-rebuilding filters.',
      '4:00 - 6:30 | Project 2: "Neom Aqua Dome" - The underwater dome resort in Saudi Arabia with glass ceilings showcasing marine life.',
      '6:30 - 9:00 | Project 3: "Aero-Resorts" - Solar-powered luxury cruise airships that hover over landscapes.',
      '9:00 - 10:30 | Technical details: How AI, desalination, and floating platforms make these conceptual mega-structures possible.',
      '10:30 - 12:00 | Outro & Poll: "Would you spend $50,000 a night to stay here? Let us know in the comments below! Subscribe for more future luxury."'
    ],
    thumbnail_prompt: 'A futuristic massive white floating ring-shaped luxury hotel in the middle of a crystal clear blue ocean. Small luxury yachts docked nearby, palm trees growing on the upper decks. Beautiful sunset, pink and orange sky, drone overhead shot, photorealistic, 8k resolution, text overlay: "RESORTS OF 2050" in sleek white luxury serif font.',
    voice_prompt: 'Generate a voiceover using ElevenLabs (Voice ID: "Rachel" or "Bella"). Set Stability to 65% and Clarity to 90% for an elegant, articulate, relaxing, high-society female tone.',
    editing_prompt: 'Use smooth, 3-second cross-fade transitions. Color grade the entire video with a clean, warm, high-exposure, desaturated look (popular in luxury channels). Ensure there is a subtle ocean-wave sound effect playing under the voiceover.',
    image_prompt: 'Drone photorealistic architectural render of a futuristic floating luxury resort, biophilic design, crystal blue lagoons, white yachts, soft sunset light, ultra-detailed glass facades, 8k, architectural digest style.',
    animation_prompt: 'Generate gentle 4k video clips using Runway Gen-3 with the prompt: "Cinematic drone shot flying slowly over a beautiful futuristic white floating resort in the Maldives, waves lapping, sunset reflection, ultra-realistic".',
    
    // SEO
    titles: [
      'Inside the Floating Mega-Resorts of 2050 🏝️',
      'How the Super-Rich Will Vacation in 2050 (AI Resorts)',
      'The Most Expensive Conceptual Hotels Ever Designed'
    ],
    description_seo: 'Take a deep look into the breathtaking conceptual floating mega-resorts of 2050! We explore the physics, luxury amenities, and architectural blueprints of underwater hotels, artificial islands, and floating cities of the future.',
    tags: ['future luxury', 'floating hotels', 'mega resorts 2050', 'futuristic architecture', 'luxury travel documentary', 'neom aqua dome', 'ocean resort concepts'],
    hashtags: ['#luxurytravel', '#architecture', '#futuretech', '#megaresorts', '#documentary', '#wealth'],
    publishing_schedule: 'Publish every Thursday at 4:00 PM EST to capture high-intent evening luxury audiences.',
    
    // Monetization
    monetization: [
      'High-paying YouTube AdSense ($8-$12 RPM)',
      'High-end travel luggage and watch brand sponsors',
      'Affiliate partnerships with luxury credit card signups'
    ],
    affiliate_ideas: [
      'Link high-quality travel gear via Amazon Associates.',
      'Promote web hosting and AI video generation tools used to make the video.'
    ],
    resources: [
      'Future Resort Script Draft (Google Doc Link)',
      'Travertine Stone Texture Assets',
      'Premium Sound Effects Pack (Ambient Waves)'
    ],
    downloads: 1420,
    views: 4500,
    likes: 853,
    featured: false
  },
  {
    id: 'v-3',
    title: 'Top 10 AI Tools No One is Telling You About',
    slug: 'top-10-ai-tools-no-one-is-telling-you-about',
    cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    description: 'This is a high-tempo, value-packed listicle designed for tech and entrepreneurship channels. Showing tangible, mind-blowing tools that can make people money or automate their business captures high retention and CTR.',
    hook: 'If you are only using ChatGPT, you are falling behind. These 10 secret AI tools will do a week of your work in under 10 minutes...',
    niche: 'AI Tools & Productivity / SaaS Hacks',
    difficulty: 'Medium',
    expected_rpm: 5.40,
    competition: 'High',
    virality_score: 92,
    ai_tools_needed: ['Screen Studio (Screen Recording)', 'ElevenLabs (Adam Voice)', 'ChatGPT (Script)', 'CapCut (Edits)'],
    
    // Blueprints
    channel_blueprint: 'Build an educational tech-brand channel ("AIPowerhouse" or "HustleWithAI"). Keep the editing speed incredibly fast. Every 3 seconds there must be a screen zoom, a sound effect, or an arrow pointing to a software UI. Deliver pure value—no long introductions, jump straight to Tool #10.',
    video_structure: [
      '0:00 - 0:15 | Intro Hook + quick montage showing the results of 3 shocking AI tools.',
      '0:15 - 1:00 | Tool 10: Gamma App (Create full web pages & presentations in 1 click).',
      '1:00 - 1:45 | Tool 9: Screen Studio (Automated smooth screen zooming for video creators).',
      '1:45 - 2:30 | Tool 8: Perplexity AI (Replacing standard Google search with instant citations).',
      '2:30 - 3:15 | Tool 7: v0.dev (Generates stunning React components in seconds).',
      '3:15 - 4:00 | Tool 6: ElevenLabs Reader (Listen to any document with realistic human emotion).',
      '4:00 - 4:45 | Tool 5: Clay.run (Automates cold outbound B2B emails with smart AI scoring).',
      '4:45 - 5:30 | Tool 4: Relume (AI site mapping and sitemap creation).',
      '5:30 - 6:15 | Tool 3: Captions.ai (Auto captions, eye contact corrector, and zoom cuts).',
      '6:15 - 7:00 | Tool 2: Synthesia (Realistic AI avatars that speak 120+ languages).',
      '7:00 - 8:00 | Tool 1 (The Holy Grail): Bolt.new / Lovable.dev (Create full-stack web apps from a prompt).',
      '8:00 - 8:30 | Outro: "Which tool blew your mind? Get the full list in the description link, subscribe for daily AI hacks!"'
    ],
    thumbnail_prompt: 'A screen split, on the left: A crying emoji with standard "ChatGPT" logo; on the right: A mind-blown emoji with 3 futuristic glowing logos (v0, Bolt, Elevenlabs). Black background, neon green arrows pointing, big bright yellow text: "CHATGPT IS DEAD. USE THESE!" with high drop shadow.',
    voice_prompt: 'High energy, fast paced, clear male voiceover (ElevenLabs "Adam"). Keep delivery rate at 1.1x speed to hold modern low-attention span viewers.',
    editing_prompt: 'Use "swoosh" and "pop" sound effects for every list entry transition. Overlay red circles and yellow highlighter animations on screen-captured software features. Ensure the music is upbeat, modern synth-pop.',
    image_prompt: 'Abstract high-tech software dashboard showing colorful graphs, glowing data metrics, clean neon UI elements, sleek 3D glass aesthetic, 8k resolution commercial render.',
    animation_prompt: 'Record your own screen using Screen Studio while typing simple prompts into these tools. Zoom in 200% on the moment the AI generates the webpage or video, showcasing the speed of generation.',
    
    // SEO
    titles: [
      '10 Secret AI Tools No One is Telling You About 🤫',
      'These 10 AI Tools Feel Illegal to Know in 2026',
      'The Ultimate AI Productivity Stack (Better than ChatGPT)'
    ],
    description_seo: 'ChatGPT is just the tip of the iceberg. In this video, we reveal 10 secret, mind-blowing AI tools that automate coding, copywriting, video creation, and sales, saving you hours of manual labor.',
    tags: ['secret ai tools', 'productivity hacks', 'chatgpt alternatives', 'best ai 2026', 'bolt.new', 'clay outbound', 'automate workflow', 'ai apps list'],
    hashtags: ['#aitools', '#productivity', '#chatgpt', '#saas', '#automation', '#businesshacks'],
    publishing_schedule: 'Publish Sunday morning at 10:00 AM EST, when entrepreneurs are planning their upcoming work week.',
    
    // Monetization
    monetization: [
      'Sponsorships from SaaS companies featured in the list ($500 - $3,000 per video)',
      'YouTube AdSense revenue',
      'Selling custom automation workflows as a digital product'
    ],
    affiliate_ideas: [
      'Use affiliate registration links for Clay, Synthesia, and Gamma in the pinned comment.',
      'Promote a premium Notion template organizing these 100+ tools.'
    ],
    resources: [
      'Excel Sheet of 100+ Secret AI Tools',
      'Screen Studio Configuration Settings',
      'Premium Sound Effects Pack (Swooshes)'
    ],
    downloads: 7810,
    views: 25400,
    likes: 4209,
    featured: true
  }
];
