import express from "express";
import OpenAI from "openai";

const app = express();

app.use(express.json({ limit: "1mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "AI Web Generator"
  });
});

app.post("/generate", async (req, res) => {
  try {
    const prompt = String(req.body?.prompt || "").trim();

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required"
      });
    }

    if (prompt.length > 10000) {
      return res.status(400).json({
        error: "Prompt is too long"
      });
    }

    const response = await client.responses.create({
      model: "gpt-6-luna",
      instructions: `
You are an expert frontend developer.

The user describes a website or web UI.

Generate a complete working HTML document.

Rules:
- Return ONLY the HTML document.
- Put CSS inside <style>.
- Put JavaScript inside <script>.
- Do not use Markdown code fences.
- Do not explain anything outside the HTML.
- Make the website responsive and mobile friendly.
- Make buttons and interactions functional.
- Prefer self-contained HTML/CSS/JS.
`,
      input: prompt
    });

    let html = response.output_text || "";

    html = html
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    if (!html) {
      return res.status(502).json({
        error: "AI returned empty HTML"
      });
    }

    res.json({
      html: html
    });

  } catch (error) {
    console.error("Generation error:", error);

    res.status(500).json({
      error: "AI generation failed"
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI Web Generator running on port ${PORT}`);
});
