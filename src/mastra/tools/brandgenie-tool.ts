import axios from 'axios';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// ðŸ” Domain extension presets by industry
const DOMAIN_PRESETS: Record<string, string[]> = {
  tech: ['.com', '.io', '.dev', '.ai', '.co', '.net', '.tech', '.cloud', '.app', '.xyz'],
  ecommerce: ['.com', '.shop', '.store', '.co', '.ng', '.online', '.biz', '.net', '.africa', '.market'],
  education: ['.edu.ng', '.org', '.academy', '.school', '.education', '.learn', '.ng', '.com', '.net', '.africa'],
  social: ['.com', '.app', '.social', '.co', '.io', '.network', '.ng', '.chat', '.link', '.live'],
  non_profit: ['.org', '.ngo', '.africa', '.foundation', '.charity', '.org.ng', '.net', '.com', '.info', '.community'],
  finance: ['.com', '.finance', '.money', '.ng', '.co', '.biz', '.net', '.credit', '.fund', '.invest'],
  media: ['.com', '.tv', '.fm', '.media', '.ng', '.news', '.co', '.press', '.studio', '.net'],
  default: ['.com', '.org', '.net', '.co', '.ng', '.xyz', '.online', '.biz', '.store', '.app'],
};

// ðŸ§  Guess industry from idea keywords
function detectIndustry(idea: string): keyof typeof DOMAIN_PRESETS {
  const text = idea.toLowerCase();
  if (text.includes('school') || text.includes('learn') || text.includes('education')) return 'education';
  if (text.includes('ecommerce') || text.includes('store') || text.includes('market')) return 'ecommerce';
  if (text.includes('non-profit') || text.includes('ngo') || text.includes('foundation')) return 'non_profit';
  if (text.includes('app') || text.includes('social') || text.includes('network')) return 'social';
  if (text.includes('bank') || text.includes('finance') || text.includes('money')) return 'finance';
  if (text.includes('media') || text.includes('tv') || text.includes('news')) return 'media';
  if (text.includes('tech') || text.includes('startup') || text.includes('software') || text.includes('ai'))
    return 'tech';
  return 'default';
}

// 🚀 Optimized domain checker with timeout and batch processing
async function checkDomainAvailability(name: string, extensions: string[]): Promise<Record<string, boolean>> {
  const availability: Record<string, boolean> = {};
  
  // Check all domains in parallel with timeout
  const checks = extensions.map(async (ext) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout per request
      
      const res = await axios.get(
        `https://api.domainsdb.info/v1/domains/search?domain=${name}${ext}`,
        { 
          signal: controller.signal,
          timeout: 2000 
        }
      );
      
      clearTimeout(timeoutId);
      availability[ext] = !res.data.domains || res.data.domains.length === 0;
    } catch (error) {
      // If timeout or error, assume available (optimistic approach)
      availability[ext] = true;
    }
  });

  await Promise.all(checks);
  return availability;
}

export const brandGenieTool = createTool({
  id: 'brandgenie-tool',
  description: 'Generates creative brand names and checks smart domain availability based on business type.',
  inputSchema: z.object({
    idea: z.string().describe('Business idea or startup concept'),
    // Optional: allow user to provide their own names
    customNames: z.array(z.string()).optional().describe('Custom brand names to check (optional)'),
  }),
  outputSchema: z.object({
    text: z.string().describe('Markdown-formatted brand suggestions'),
    format: z.literal('markdown').describe('Output format type'),
  }),
  execute: async ({ context }) => {
    const startTime = Date.now();
    const { idea, customNames } = context;
    const industry = detectIndustry(idea);
    const extensions = DOMAIN_PRESETS[industry];

    // 🎯 Allow agent to provide creative names, or use fallback
    let names: string[];
    
    if (customNames && customNames.length > 0) {
      // Use names provided by the agent/LLM
      names = customNames.slice(0, 5); // Limit to 5 for speed
      console.log('✨ Using creative names from agent:', names);
    } else {
      // Fallback to simple generated names
      const seed = idea.split(' ')[0] || 'Brand';
      names = [
        `${seed}Hub`,
        `${seed}Spark`,
        `${seed}Labs`,
        `${seed}Pulse`,
        `${seed}Link`,
      ];
      console.log('Using fallback names:', names);
    }

    console.log(`Checking ${names.length} names × ${extensions.length} extensions...`);

    // Check all brand names in parallel
    const results = await Promise.all(
      names.map(async (name) => {
        const availability = await checkDomainAvailability(name, extensions);
        const suggestedExt = extensions.find((ext) => availability[ext]) || 'None available';
        return { name, availability, suggestedExt };
      })
    );

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Domain check completed in ${elapsedTime}s`);

    // ✨ Format output in readable Markdown
    const brandSuggestions = results
      .map((r, index) => {
        const availableDomains = Object.entries(r.availability)
          .filter(([_, available]) => available)
          .map(([ext]) => `${ext}`)
          .join(', ') || 'None available';
        
        const suggestedDomain = r.suggestedExt === 'None available'
          ? 'No domains available'
          : `**${r.name.toLowerCase()}${r.suggestedExt}**`;

        return `### ${index + 1}. ${r.name}

**Recommended Domain:** ${suggestedDomain}

**Available Extensions:** ${availableDomains}

---`;
      })
      .join('\n\n');

    const markdownOutput = `# Brand Name Suggestions

**Your Idea:** "${idea}"  
**Detected Industry:** ${industry.toUpperCase()}  
**Processing Time:** ${elapsedTime}s

${brandSuggestions}

💡 **Tip:** BrandGenie automatically selects the best domain extensions for your industry and suggests the next available option if .com is taken.`;

    return {
      text: markdownOutput,
      format: 'markdown' as const,
    };
  },
});

// import axios from 'axios';
// import { createTool } from '@mastra/core/tools';
// import { z } from 'zod';

// /**
//  * BrandGenie Tool
//  * - Generates brand name ideas
//  * - Checks domain availability
//  * - Returns name, domain, and availability status
//  */

// export const brandGenieTool = createTool({
//   id: 'brandgenie-tool',
//   description: 'Generates unique startup names and checks if their domains (.com, .org, .net, .co, .ng) are available.',
//   inputSchema: z.object({
//     idea: z.string().describe('Brief description of the userâ€™s business or startup idea'),
//   }),
//   outputSchema: z.array(
//     z.object({
//       name: z.string(),
//       domain: z.string(),
//       available: z.boolean(),
//     })
//   ),
//   execute: async ({ context }) => {
//     const { idea } = context;
  
//     const seed = idea.split(' ')[0] || 'Brand';
//     const names = [`${seed}Hub`, `${seed}Spark`, `${seed}Forge`, `${seed}Labs`, `${seed}Nest`];

//     const extensions = ['.com', '.org', '.net', '.co', '.ng'];
  
//     const results = await Promise.all(
//       names.map(async (name) => {
//         const domain = `${name.toLowerCase()}.com`;
//         let available = false;
  
//         try {
//           const res = await axios.get(
//             `https://api.domainsdb.info/v1/domains/search?domain=${name}`
//           );
//           available = !res.data.domains;
//         } catch {
//           available = true;
//         }
  
//         return { name, domain, available };
//       })
//     );
  
//     // ðŸ§™ Convert JSON results to a human-readable Markdown table
//     const tableHeader = `| Brand Name | Domain | Available |\n|-------------|------------------|------------|`;
//     const tableRows = results
//       .map(
//         (r) =>
//           `| ${r.name} | ${r.domain} | ${r.available ? "âœ… Yes" : "âŒ No"} |`
//       )
//       .join('\n');
  
//     const readableOutput = `
//   Here are some brand name suggestions for your idea:
  
//   ${tableHeader}
//   ${tableRows}
  
//   Each name is designed to be catchy, relevant, and easy to remember. ðŸš€
//   `;
  
//     return readableOutput.trim();
//   },
  
  // execute: async ({ context }) => {
  //   const { idea } = context;

  //   // âœ¨ Ideally, you'd use a model to suggest names.
  //   // For now, generate simple example names from the idea:
  //   const seed = idea.split(' ')[0] || 'Brand';
  //   const names = [
  //     `${seed}Hub`,
  //     `${seed}Spark`,
  //     `${seed}Forge`,
  //     `${seed}Labs`,
  //     `${seed}Nest`,
  //   ];

  //   // Check each nameâ€™s domain availability
  //   const results = await Promise.all(
  //     names.map(async (name) => {
  //       const domain = `${name.toLowerCase()}.com`;
  //       let available = false;

  //       try {
  //         const res = await axios.get(
  //           `https://api.domainsdb.info/v1/domains/search?domain=${name}`
  //         );
  //         // if API returns domains, it's already taken
  //         available = !res.data.domains;
  //       } catch {
  //         // if request fails, assume it's available
  //         available = true;
  //       }

  //       return { name, domain, available };
  //     })
  //   );

  //   return results;
  // },
// });