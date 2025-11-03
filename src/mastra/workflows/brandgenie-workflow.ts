import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { brandGenieAgent } from '../agents/brandgenie-agent';

/**
 * ✅ Create a step directly from the agent
 * This is the proper Mastra pattern for using agents in workflows
 */
const generateBranding = createStep(brandGenieAgent);

// Workflow definition
const brandGenieWorkflow = createWorkflow({
  id: 'brandgenie-workflow',
  inputSchema: z.object({
    idea: z.string().describe('User input business idea'),
  }),
  outputSchema: z.object({
    text: z.string().describe('Generated brand suggestions'),
  }),
})
  // ✅ Map the workflow input to the agent's expected format
  .map(async ({ inputData }) => {
    const { idea } = inputData;
    
    // Agent expects { prompt: string }, not { input: { idea } }
    return {
      prompt: `Generate creative brand names and check domain availability for this business idea: "${idea}". 

Think of 5 unique, memorable brand names that fit this concept, then use the brandGenieTool to check their domain availability.`
    };
  })
  // ✅ Pass the mapped input to the agent step
  .then(generateBranding)
  .commit();

export { brandGenieWorkflow };