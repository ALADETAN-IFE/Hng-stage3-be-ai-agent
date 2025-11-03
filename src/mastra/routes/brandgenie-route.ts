import { registerApiRoute } from "@mastra/core/server";
import { randomUUID } from "crypto";

export const a2aAgentRoute = registerApiRoute("/a2a/agent/:agentId", {
  method: "POST",
  handler: async (c) => {
    try {
      const mastra = c.get("mastra");
      const agentId = c.req.param("agentId");
      const body = await c.req.json();

      const { jsonrpc, id: requestId, method, params } = body;

      // Validate JSON-RPC 2.0 format
      if (jsonrpc !== "2.0" || !requestId) {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId || null,
            error: { code: -32600, message: "Invalid Request" },
          },
          400
        );
      }

      // Get the agent from Mastra
      const agent = mastra.getAgent(agentId);
      if (!agent) {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId,
            error: { code: -32602, message: `Agent '${agentId}' not found `},
          },
          404
        );
      }

      // Extract messages from params
      const { message, messages = [] } = params || {};
      const inputMessages = message ? [message] : messages;

      // Convert A2A message format → Mastra format
      const mastraMessages = inputMessages.map((msg: any) => ({
        role: msg.role,
        content:
          msg.parts
            ?.map((p: any) => p.text || JSON.stringify(p.data))
            .join("\n") || "",
      }));

      console.log(`🤖 Agent '${agentId}' received ${inputMessages.length} message(s)`);
      console.log(`📝 Input: ${JSON.stringify(mastraMessages, null, 2)}`);

      // Execute the agent
      const response = await agent.generate(mastraMessages);
      const text = response.text || "";

      console.log(`✅ Agent '${agentId}' response length: ${text.length} chars`);

      // Build A2A JSON-RPC response
      return c.json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          id: randomUUID(),
          contextId: randomUUID(),
          status: { state: "completed", timestamp: new Date().toISOString() },
          artifacts: [
            {
              artifactId: randomUUID(),
              name: "BrandGenie Response",
              parts: [{ kind: "text", text }],
            },
          ],
          history: [
            ...inputMessages.map((m: any) => ({
              ...m,
              messageId: randomUUID(),
            })),
            {
              role: "agent",
              parts: [{ kind: "text", text }],
              messageId: randomUUID(),
            },
          ],
          kind: "task",
        },
      });
    } catch (error: any) {
      console.error("❌ A2A Agent Route Error:", error);
      return c.json(
        {
          jsonrpc: "2.0",
          id: null,
          error: { 
            code: -32603, 
            message: error.message || "Internal error"
          },
        },
        500
      );
    }
  },
});