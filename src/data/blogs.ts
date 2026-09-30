import { BlogArticle } from '../types';

export const BLOGS: BlogArticle[] = [
  {
    id: 'b-1',
    title: 'The Art of Aspect Ratios and Camera Settings in Midjourney v6',
    slug: 'aspect-ratios-camera-settings-midjourney-v6',
    cover: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Unlock photorealistic image generation by mastering shutter speeds, focal lengths, film stock prompts, and aspect ratio variables in the latest Midjourney update.',
    category: 'Prompt Engineering',
    published_at: '2026-07-20T08:00:00Z',
    views: 4520,
    likes: 832,
    read_time: '6 min read',
    author: {
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      role: 'Principal Prompt Engineer'
    },
    related_prompts: ['p-1', 'p-3', 'p-5'],
    related_skills: ['s-2'],
    content: `Mastering photorealism in Midjourney v6 requires you to speak the language of real-world photography. The model has been trained on millions of high-end camera shots, meaning it understands technical jargon like focal lengths, apertures, lighting conditions, and specific camera brands.

In this guide, we will break down the exact parameters and text cues you should embed in your prompt to get breathtaking results every single time.

---

## 1. The Camera and Lens Formula
Instead of typing "ultra photorealistic" (which Midjourney v6 actually penalizes as fluff), specify the exact camera gear. 

Here are the most effective camera/lens pairings:
* **For Portraits:** \`shot on Hasselblad X2D 100C, 90mm f/4 lens, studio lighting\`
* **For Architecture:** \`architectural photography, shot on Sony A7R V, 24mm wide-angle lens\`
* **For Action/Sport:** \`high-speed action shutter, shot on Canon EOS R5, 70-200mm lens\`
* **For Retro/Vintage:** \`editorial analog shoot, Leica M3, 50mm f/2 lens, Kodachrome film\`

## 2. Setting the Perfect Aspect Ratio (--ar)
In Midjourney, aspect ratio determines the composition. Never leave it at the default square (1:1) for landscapes or cinema styles.
* **--ar 16:9** - Standard wide-screen (YouTube, banners, landscapes)
* **--ar 9:16** - Short-form vertical (TikTok, Reels, phone wallpapers)
* **--ar 4:5** - Portrait mode (Instagram posts, fine art portraits)
* **--ar 21:9** - Anamorphic cinematic aspect ratio

Add this parameter to the absolute end of your prompt, after any text descriptions.

---

## 3. Mastering Cinematic Lighting
Lighting defines the emotional resonance of your prompt. Avoid generic "good lighting" phrases and use specific lighting setups:
1. **Chiaroscuro:** Deep contrast, high-contrast shadows, dramatic Rembrandt look.
2. **Volumetric Lighting:** Beautiful rays of light passing through dust, mist, or rain.
3. **Golden Hour:** Warm, soft, angled light that occurs right before sunset.
4. **Rim Lighting:** Highlights the edges of your subject, separation from a dark background.

## 4. The Seed Parameter (--seed)
Want to modify a generated image without completely changing it? Use the seed! Every image in Midjourney has a specific seed number. 
If you find an image you love:
1. React to the image with the ✉️ (envelope) emoji.
2. The Midjourney bot will DM you the exact Seed number.
3. Use \`--seed <seed_number>\` in your next prompt to generate consistent characters, objects, or styles under different conditions.`
  },
  {
    id: 'b-2',
    title: 'How to Build and Optimize Custom .cursorrules for AI Assisted Coding',
    slug: 'build-optimize-custom-cursorrules-ai-coding',
    cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Stop explaining your coding preferences repeatedly. Learn how to draft a powerful system instruction file that makes Cursor and Windsurf code flawlessly.',
    category: 'Cursor Mastery',
    published_at: '2026-07-22T10:00:00Z',
    views: 3120,
    likes: 673,
    read_time: '8 min read',
    author: {
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      role: 'Full Stack AI Architect'
    },
    related_prompts: ['p-2', 'p-7'],
    related_skills: ['s-1', 's-3'],
    content: `AI-assisted IDEs like Cursor and Windsurf are transforming how we write code. However, out of the box, these agents often write generic code, use outdated libraries, or restructure files in ways you didn't ask for.

The solution? **.cursorrules**. 

By placing a \`.cursorrules\` text file at the root of your project, you declare the source of truth for your codebase's structure, styling, security, and rendering guidelines.

---

## 1. Why You Need custom .cursorrules
When you converse with an AI coder, it starts with a clean slate. It guesses your preferences based on the files in your directory. A custom rules file acts as a **permanent system instruction**, meaning the AI:
* Never drafts nested cards or cluttered layouts if you forbid it.
* Automatically uses modern Tailwind CSS v4 syntax instead of v3.
* Implements robust TypeScript types without you begging for them.
* Structures files exactly in the folders you have designated.

---

## 2. Core Structure of an Effective Rules File
An elite \`.cursorrules\` file should contain four core sections:
1. **Developer Identity & Stack:** Declare your role and the exact versions of software being utilized (e.g. React 19, Supabase, Tailwind CSS v4).
2. **Directory Map:** Outline the file tree to prevent the AI from generating random folders like \`/src/helpers/\` or \`/src/utils/\` arbitrarily.
3. **Coding Standards:** Forbid bad practices. For example, instruct the AI to always use standard enums instead of const enums, and require named imports.
4. **Security Directives:** Require Row Level Security (RLS) on database schemas and forbid hardcoding secret keys.

## 3. Testing and Updating Your Rules
As your project evolves, update your rules! If you notice the AI continually making the same mistake (such as using legacy React components), open your \`.cursorrules\` and add a "Banned Patterns" section to prevent it from happening again.`
  }
];
