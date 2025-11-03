# HNG Internship - Backend Wizards Stage 3 (Mastra AI Agents)

This repository contains the Stage 3 Backend submission — a Mastra-based AI agents project that generates brand name suggestions, checks domain availability, and includes a sample weather agent and workflows prepared for Telex.im integration.

---

## 🚀 Live / Demo

- No hosted public demo included by default. See "How to Run Locally" to run the agents and workflows locally or deploy to Mastra.

---

## 🧩 Features

- Mastra agents and tools implemented under src/mastra:
  - BrandGenie tool: generates 5 creative, short (1–2 word) brand name ideas (LLM-provided or fallback), calls the domain-check tool to run parallel, industry-
  - Scorers: utility modules for ranking suggestions
  - Workflows: Mastra workflow JSON ready for A2A nodes (Telex.im)
- Outputs Markdown-formatted suggestions and domain availability
- Parallel domain checks with timeouts and optimistic fallbacks
- Workflow-ready A2A endpoints for Telex.im integration
- Basic logging and simple error handling in tools

---

## 🧠 Technologies Used

- **Node.js** — Runtime environment
- **TypeScript** — Source language for Mastra agents/tools
- **Mastra** — Agent framework used for building agents and workflows
- **axios** — HTTP client (note: must be added to Mastra bundler externals)
- **zod** — Input/output schema validation for tools
- (Optional) any HTTP server (Express) for custom routes or A2A endpoints

---

## 👤 About Me

**Aladetan Fortune Ifeloju (IfeCodes)**  
Full Stack Developer — building intelligent integrations and automation.

- 💻 [GitHub](https://github.com/ALADETAN-IFE)
- 🐦 [Twitter / X](https://x.com/ifeCodes_)
- 💼 [LinkedIn](https://www.linkedin.com/in/fortune-ife-aladetan-458ab136a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app)

---

## ⚙️ How to Run Locally

1. Clone repository

```bash
git clone https://github.com/ALADETAN-IFE/hng-stage3-be-ai-agent.git
cd hng-stage3-be-ai-agent
```

2. Install dependencies

```bash
npm install
```

3. Run (dev):

```bash
npm run dev
npm start
```

4. If deploying with Mastra, ensure bundler externals include axios:

```javascript
export const mastra = new Mastra({
  bundler: {
    externals: ["axios"],
  },
});
```

## Notes

- The BrandGenie tool uses domainsdb.info for domain checks; network requests may be rate-limited.
- Adjust domain-check timeouts and API keys as needed.
- See src/mastra for details on agent/tool/workflow implementations.

## Author

Aladetan Fortune Ifeloju (IfeCodes)

- GitHub: https://github.com/ALADETAN-IFE
- Twitter: https://x.com/ifeCodes_
- LinkedIn: https://www.linkedin.com/in/fortune-ife-aladetan-458ab136a
