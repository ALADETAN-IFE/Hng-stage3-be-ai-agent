import { z } from "zod";
import { createToolCallAccuracyScorerCode } from "@mastra/evals/scorers/code";
import { createCompletenessScorer } from "@mastra/evals/scorers/code";
import { createScorer } from "@mastra/core/scores";

/**
 * âœ… Scorer 1: Checks if the agent used the correct tool (BrandGenieTool)
 */
export const toolCallAppropriatenessScorer = createToolCallAccuracyScorerCode({
  expectedTool: "BrandGenieTool",
  strictMode: false,
});

/**
 * âœ… Scorer 2: Measures how complete the response is
 */
export const completenessScorer = createCompletenessScorer();

/**
 * âœ… Scorer 3: Custom LLM-judged scorer â€” evaluates creativity, name uniqueness, and tagline quality
 */
export const creativityScorer = createScorer({
  name: "Brand Creativity & Relevance",
  description:
    "Evaluates if generated brand names, taglines, and stories are creative, relevant, and aligned with the user's business idea.",
  type: "agent",
  judge: {
    model: "google/gemini-2.5-flash",
    instructions: `
      You are an expert brand evaluator.
      Your job is to assess how creative and relevant the assistant's branding suggestions are.
      Check:
      1. Are the brand names unique and professional?
      2. Do the taglines fit the type of business?
      3. Does the short story align with the user's input?
      4. Avoid repetition or over-generic results.
      Provide structured JSON output following the schema.
    `,
  },
})
  .preprocess(({ run }) => {
    const userText = (run.input?.inputMessages?.[0]?.content as string) || "";
    const assistantText = (run.output?.[0]?.content as string) || "";
    return { userText, assistantText };
  })
  .analyze({
    description: "Judge the creativity, relevance, and quality of BrandGenie outputs.",
    outputSchema: z.object({
      creative: z.boolean(),
      relevant: z.boolean(),
      professional: z.boolean(),
      confidence: z.number().min(0).max(1).default(1),
      explanation: z.string().default(""),
    }),
    createPrompt: ({ results }) => `
      Evaluate the following AI branding response.

      User Input (Business Idea):
      """
      ${results.preprocessStepResult.userText}
      """

      Assistant Branding Output:
      """
      ${results.preprocessStepResult.assistantText}
      """

      Tasks:
      1. Check if the names are creative and distinct.
      2. Check if the taglines fit the idea and sound professional.
      3. Check if the story is engaging and relevant.
      4. Return your judgment as JSON.

      Format:
      {
        "creative": boolean,
        "relevant": boolean,
        "professional": boolean,
        "confidence": number, // 0-1
        "explanation": string
      }
    `,
  })
  .generateScore(({ results }) => {
    const r = (results as any)?.analyzeStepResult || {};
    const score =
      ((r.creative ? 0.4 : 0) +
        (r.relevant ? 0.3 : 0) +
        (r.professional ? 0.3 : 0)) *
      (r.confidence ?? 1);
    return Math.max(0, Math.min(1, score));
  })
  .generateReason(({ results, score }) => {
    const r = (results as any)?.analyzeStepResult || {};
    return `Creativity Scoring: creative=${r.creative}, relevant=${r.relevant}, professional=${r.professional}, confidence=${r.confidence}. Score=${score}. ${r.explanation}`;
  });

/**
 * Export all scorers for use in agent setup
 */
export const scorers = {
  toolCallAppropriatenessScorer,
  completenessScorer,
  creativityScorer,
};