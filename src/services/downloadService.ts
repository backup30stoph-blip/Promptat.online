import { AIPrompt, AISkill, VideoConcept } from '../types';
import { supabase } from './supabase/client';

/**
 * Client-Side Instant Prompt TXT Exporter
 */
export function downloadPromptAsTxt(prompt: AIPrompt) {
  const content = `================================================
PROMPTAT.ONLINE - AI PROMPT EXPORT
Title: ${prompt.title}
Model: ${prompt.model}
Category ID: ${prompt.category_id}
Difficulty: ${prompt.difficulty}
================================================

[CORE PROMPT]
${prompt.prompt}

${prompt.negative_prompt ? `[NEGATIVE PROMPT]\n${prompt.negative_prompt}\n` : ''}
${prompt.aspect_ratio ? `Aspect Ratio: ${prompt.aspect_ratio}\n` : ''}
${prompt.style ? `Style: ${prompt.style}\n` : ''}
${prompt.camera ? `Camera Settings: ${prompt.camera}\n` : ''}
${prompt.lighting ? `Lighting: ${prompt.lighting}\n` : ''}
${prompt.seed ? `Seed: ${prompt.seed}\n` : ''}
================================================
Downloaded from https://promptat.online
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${prompt.slug || 'prompt'}-promptat.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Increment download counter asynchronously in Supabase
  incrementDownloadCount('prompts', prompt.id);
}

/**
 * Client-Side Instant Prompt Markdown Exporter
 */
export function downloadPromptAsMd(prompt: AIPrompt) {
  const content = `# ${prompt.title}

> **Model:** ${prompt.model}  
> **Difficulty:** ${prompt.difficulty}  
> **Source:** [Promptat.online](https://promptat.online)

---

## 📝 Core Prompt
\`\`\`text
${prompt.prompt}
\`\`\`

${prompt.negative_prompt ? `### ⛔ Negative Prompt\n\`\`\`text\n${prompt.negative_prompt}\n\`\`\`\n` : ''}

### ⚙️ Technical Specs
- **Aspect Ratio:** ${prompt.aspect_ratio || 'Default'}
- **Style:** ${prompt.style || 'None'}
- **Camera:** ${prompt.camera || 'Standard'}
- **Lighting:** ${prompt.lighting || 'Natural'}
- **Seed:** \`${prompt.seed || 'Random'}\`
`;

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${prompt.slug || 'prompt'}-promptat.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Increment download counter asynchronously in Supabase
  incrementDownloadCount('prompts', prompt.id);
}

/**
 * Storage Asset Download (Skills ZIP/PDF/JSON/MD & Video Blueprints)
 */
export async function downloadAssetFile(
  table: 'skills' | 'video_concepts',
  item: AISkill | VideoConcept,
  fileType: 'markdown' | 'zip' | 'pdf' | 'json' = 'zip'
): Promise<{ url: string | null; error: string | null }> {
  try {
    let filePath = '';
    
    if (table === 'skills') {
      const skill = item as AISkill;
      if (fileType === 'markdown') filePath = skill.markdown_file;
      else if (fileType === 'zip') filePath = skill.zip_file || skill.markdown_file;
      else if (fileType === 'pdf') filePath = skill.pdf_file || skill.markdown_file;
      else if (fileType === 'json') filePath = skill.json_file || skill.markdown_file;
    } else {
      const video = item as VideoConcept;
      filePath = video.cover || '';
    }

    if (!filePath) {
      // Fallback: Generate inline markdown text file
      const content = table === 'skills' 
        ? (item as AISkill).markdown_file 
        : JSON.stringify(item, null, 2);
        
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${item.slug}-${fileType}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      incrementDownloadCount(table, item.id);
      return { url: null, error: null };
    }

    // If it's a full public URL, trigger browser download
    if (filePath.startsWith('http')) {
      window.open(filePath, '_blank');
      incrementDownloadCount(table, item.id);
      return { url: filePath, error: null };
    }

    // Try generating short-lived signed URL from Supabase storage bucket 'downloads'
    const { data, error } = await supabase.storage
      .from('downloads')
      .createSignedUrl(filePath, 300); // 5 min TTL

    if (error || !data?.signedUrl) {
      // Fallback to public URL if signed URL isn't configured
      const publicUrlData = supabase.storage.from('downloads').getPublicUrl(filePath);
      if (publicUrlData?.data?.publicUrl) {
        window.open(publicUrlData.data.publicUrl, '_blank');
        incrementDownloadCount(table, item.id);
        return { url: publicUrlData.data.publicUrl, error: null };
      }
      throw error || new Error('Could not generate download URL');
    }

    window.open(data.signedUrl, '_blank');
    incrementDownloadCount(table, item.id);
    return { url: data.signedUrl, error: null };
  } catch (err: any) {
    console.error('Error downloading file asset:', err);
    return { url: null, error: err.message || 'Download failed' };
  }
}

/**
 * Increment download counter atomically in Supabase
 */
async function incrementDownloadCount(table: 'prompts' | 'skills' | 'video_concepts', id: string) {
  try {
    // Read current value then increment
    const { data } = await supabase.from(table).select('downloads').eq('id', id).single();
    if (data) {
      const current = data.downloads || 0;
      await supabase.from(table).update({ downloads: current + 1 }).eq('id', id);
    }
  } catch (err) {
    console.warn(`Could not increment download count for ${table}/${id}:`, err);
  }
}
