const { GoogleGenAI } = require("@google/genai");

// Initialize Google Gen AI client if API Key is set
let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// @desc    Generate eBook outline (chapters list)
// @route   POST /api/ai/generate-outline
// @access  Private
const generateOutline = async (req, res) => {
  const { title, description, audience, style, length } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Book title is required" });
  }

  // If no API Key is set, return mock fallback outline
  if (!ai) {
    console.log("GEMINI_API_KEY not configured. Returning mock outline fallback.");
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockOutline = [
      {
        title: "Chapter 1: Foundational Core Principles",
        summary: `Introduction and overview of the fundamental concepts behind "${title}" tailored for ${audience || "general audience"}. Setting the stage and defining main objectives.`,
      },
      {
        title: "Chapter 2: Essential Workflows & System Setup",
        summary: "Detailed guides on initial environment setup, essential configurations, tools, and recommended packages.",
      },
      {
        title: "Chapter 3: Core Implementation & Design Patterns",
        summary: "Step-by-step review of code structuring, components design, architectural layout patterns, and clean bindings.",
      },
      {
        title: "Chapter 4: Advanced Paradigms & Optimization",
        summary: "Diving into complex techniques, performance optimization methods, resolving bottlenecks, and debugging logs.",
      },
      {
        title: "Chapter 5: Publishing, Exporting & Next Steps",
        summary: "Preparing drafts for public reviews, exporting to high-quality PDF/EPUB formats, and final packaging checks.",
      },
    ];
    return res.json({ chapters: mockOutline });
  }

  try {
    const prompt = `You are a professional book publisher and editor.
Create a detailed chapter outline for a book with:
Title: "${title}"
Details/Niche: "${description}"
Target Audience: "${audience || "General"}"
Writing Style/Tone: "${style || "Friendly"}"
Outline Length: "${length || "Medium"}"

Generate exactly 5 to 6 chapters. For each chapter, provide:
1. Chapter Title (e.g. "Chapter 1: ...")
2. Brief Summary/Outline (1-2 sentences explaining what the chapter will cover).

Return your response ONLY as a valid JSON array of objects, with no markdown formatting, no code blocks (such as \`\`\`json), and no extra text.
The JSON array must have this structure:
[
  { "title": "Chapter 1: ...", "summary": "..." },
  { "title": "Chapter 2: ...", "summary": "..." }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text.trim();
    
    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    try {
      const chapters = JSON.parse(text);
      res.json({ chapters });
    } catch (parseErr) {
      console.error("Gemini output JSON parse error. Text raw:", text, parseErr);
      res.status(500).json({
        message: "AI generated outline format was invalid. Please try again.",
        error: parseErr.message,
      });
    }
  } catch (error) {
    console.error("AI Generate outline error:", error);
    res.status(500).json({ message: "AI Outline generation failed", error: error.message });
  }
};

// @desc    Draft full chapter content with AI
// @route   POST /api/ai/generate-chapter
// @access  Private
const generateChapter = async (req, res) => {
  const { title, chapterTitle, chapterSummary, writingStyle } = req.body;

  if (!title || !chapterTitle) {
    return res.status(400).json({ message: "Book title and chapter title are required" });
  }

  // If no API Key is set, return mock fallback chapter text
  if (!ai) {
    console.log("GEMINI_API_KEY not configured. Returning mock chapter draft fallback.");
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockBody = `<h2>Welcome to ${chapterTitle}</h2>

<p>In this segment of our guide for "${title}", we explore the key details surrounding these principles. Writing this segment requires a structured, clear approach to ensure that readers can comfortably follow along and extract actionable guidelines.</p>

<p>As we dive deeper, we must recognize that laying out solid structural anchors is key to mastering these paradigms. By establishing robust patterns early in the development lifecycle, we can prevent common errors, streamline building cycles, and ensure that our publishing outputs remain high-quality.</p>

<blockquote>Furthermore, integrating style configurations allows us to lock in a consistent tone. Whether you are aiming for an academic, formal authority or a conversational, friendly guide, consistency remains the single most important factor in keeping readers engaged across hundreds of pages.</blockquote>

<p>Finally, packaging your chapters for final document exports completes the writing lifecycle. Exporting to high-resolution formats like PDF and EPUB requires clean outline compilation, metadata verification, and layout alignment. In the coming segments, we will detail how this publishing pipeline behaves.</p>`;

    return res.json({ content: mockBody });
  }

  try {
    const prompt = `You are an expert eBook writer. Write a comprehensive, detailed chapter draft for a book.
Book Title: "${title}"
Chapter Title: "${chapterTitle}"
Chapter Summary: "${chapterSummary || ""}"
Writing Tone/Style: "${writingStyle || "Conversational"}"

Requirements:
- Write at least 4 to 5 detailed paragraphs.
- Provide comfortable, flowing paragraphs in a professional and highly engaging tone.
- Do not write summary headers, welcome text, or meta-text. Start directly with the chapter content.
- Use clean HTML formatting (such as <h2>Section</h2>, <p>paragraph</p>, <strong>bold</strong>, <blockquote>quote</blockquote>). Do NOT use markdown. Write raw HTML elements directly.

Start writing now:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ content: response.text });
  } catch (error) {
    console.error("AI Generate chapter error:", error);
    res.status(500).json({ message: "AI Chapter drafting failed", error: error.message });
  }
};

// @desc    Edit text with AI assistant (Rewrite, expand, shorten, fix grammar, shift tone, ask chat)
// @route   POST /api/ai/edit-text
// @access  Private
const editText = async (req, res) => {
  const { action, text, instruction, tone } = req.body;

  if (!action || !text) {
    return res.status(400).json({ message: "Action and text are required" });
  }

  // If no API Key is set, return mock editing fallback
  if (!ai) {
    console.log("GEMINI_API_KEY not configured. Returning mock editing fallback.");
    await new Promise((resolve) => setTimeout(resolve, 1200));

    let result = "";
    if (action === "rewrite") {
      result = `<p>${text.replace(/<[^>]*>/g, "")}</p>\n<p><em>(AI rewritten for enhanced clarity and flow)</em></p>`;
    } else if (action === "expand") {
      result = `${text}\n<p>Additionally, when implementing these components, developers must pay close attention to visual feedback mechanisms, accessibility tags, and cross-browser responsiveness. Ensuring these elements are locked in early guarantees clean, scalable production modules.</p>`;
    } else if (action === "shorten") {
      const cleanText = text.replace(/<[^>]*>/g, "");
      result = `<p>${cleanText.substring(0, Math.min(cleanText.length, 180))}...</p>\n<p><em>(AI condensed and summarized draft)</em></p>`;
    } else if (action === "grammar") {
      result = `${text}\n<p><em>(AI audited spelling, grammar, and style metrics: 0 issues found)</em></p>`;
    } else if (action === "tone") {
      result = `<p><strong>[Tone: ${tone || "Professional"}]</strong></p>\n${text}`;
    } else if (action === "chat") {
      result = `<h4>AI Assistant Response:</h4>\n<p>Based on your query "<strong>${instruction}</strong>", here is an expansion block:</p>\n<ul>\n  <li><strong>Core Objective</strong>: Focus on clean visual structures.</li>\n  <li><strong>Writing Style</strong>: Consistent guidelines improve readability.</li>\n</ul>`;
    }
    return res.json({ content: result });
  }

  try {
    let prompt = "";
    if (action === "rewrite") {
      prompt = `Rewrite the following text to make it more engaging, clear, and professional. Return HTML output (such as <p>, <h2>, <strong>, etc.) directly. Do NOT use markdown.
Text to rewrite: "${text}"`;
    } else if (action === "expand") {
      prompt = `Expand the following text by adding more detail, explanations, and context. Write 1 or 2 extra paragraphs. Return HTML output directly. Do NOT use markdown.
Text to expand: "${text}"`;
    } else if (action === "shorten") {
      prompt = `Shorten the following text to make it extremely concise and direct. Keep only the main points. Return HTML output directly. Do NOT use markdown.
Text to shorten: "${text}"`;
    } else if (action === "grammar") {
      prompt = `Fix any grammar, spelling, punctuation, or style errors in the following text. Polish the writing without changing the core meaning. Return HTML output directly. Do NOT use markdown.
Text to fix: "${text}"`;
    } else if (action === "tone") {
      prompt = `Rewrite the following text to match a "${tone || "Professional"}" tone. Return HTML output directly. Do NOT use markdown.
Text: "${text}"`;
    } else if (action === "chat") {
      prompt = `You are a helpful AI writing assistant. Answer this query: "${instruction}"
Context chapter content: "${text}"

Provide your answer directly, formatted as clean HTML (with headings, paragraphs, lists, etc. if helpful). Do NOT use markdown.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ content: response.text });
  } catch (error) {
    console.error("AI Edit text error:", error);
    res.status(500).json({ message: "AI Text processing failed", error: error.message });
  }
};

module.exports = {
  generateOutline,
  generateChapter,
  editText,
};
