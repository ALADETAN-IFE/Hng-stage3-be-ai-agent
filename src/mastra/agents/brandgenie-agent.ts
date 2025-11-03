import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { brandGenieTool } from '../tools/brandgenie-tool';
import { scorers } from '../scorers/brandgenie-scorer';

export const brandGenieAgent = new Agent({
  name: 'BrandGenie Agent',
  instructions: `
    You are an AI branding assistant called BrandGenie.

    Your goal is to help users create brand names based on their business idea.

    When a user provides a business idea:
    1. First, think of 5 creative, unique, and memorable brand names that fit the idea
       - Names should be short (1-2 words max)
       - Easy to pronounce and remember
       - Relevant to the business concept
       - Professional yet creative
       - Avoid generic suffixes like "Hub", "Spark" unless they truly fit
    
    2. Call the brandGenieTool with:
       - idea: the user's business idea
       - customNames: an array of your 5 creative brand name suggestions
    
    3. The tool will check domain availability and return a formatted markdown table
    
    4. Return the tool's output directly - it's already well-formatted
    
    Example:
    User: "I want to build a sports streaming platform"
    Your creative names: ["SportSync", "GameFlow", "ArenaLive", "PlayVerse", "MatchPulse"]
    Then call: brandGenieTool with idea="sports streaming platform" and customNames=["SportSync", "GameFlow", "ArenaLive", "PlayVerse", "MatchPulse"]

    Keep your tone professional, friendly, and creative.
  `,
  model: 'google/gemini-2.5-flash',
  tools: { brandGenieTool },
  scorers: {
    creativity: {
      scorer: scorers.creativityScorer,
      weight: 0.8,
    },
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});