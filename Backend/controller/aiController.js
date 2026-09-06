const { GoogleGenAI } = require("@google/genai");
const User = require("../models/user");
const Book = require("../models/book");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");

// Initialize Google Gen AI client if API Key is set
let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// Ensure covers upload directory exists
const coversDir = path.join(__dirname, "..", "uploads", "covers");
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

// Helper: Check and verify user
const checkAILimit = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(401).json({ message: "User not found" });
    return null;
  }
  return user;
};

// Helper: Increment AI generation counter
const incrementAIUsage = async (userId) => {
  await User.findByIdAndUpdate(userId, { $inc: { aiGenerationsUsed: 1 } });
};

// Helper: Clean JSON response from Gemini
const cleanJSONText = (text) => {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  }
  return cleaned;
};

// @desc    Generate Complete Comprehensive Book Outline & Structure
// @route   POST /api/ai/generate-book
// @access  Private
const generateBook = async (req, res) => {
  const { prompt, difficulty, tone, contentType, targetAudience, chaptersCount } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: "Book prompt or topic is required" });
  }

  const user = await checkAILimit(req, res);
  if (!user) return;

  const count = parseInt(chaptersCount, 10) || 5;

  const systemPrompt = `You are a world-class book author, editor, and educational publisher.
A user wants to create a complete, high-quality, comprehensive digital book.

User Prompt / Subject: "${prompt}"
Difficulty Level: "${difficulty || "Beginner"}"
Tone: "${tone || "Professional & Friendly"}"
Content Type: "${contentType || "Practical Guide"}"
Target Audience: "${targetAudience || "General Learners"}"

Generate a complete book plan with:
1. "title": Catchy, professional book title.
2. "subtitle": Engaging subtitle summarizing the value.
3. "description": A 2-3 paragraph overview of the book, prerequisites, and learning outcomes.
4. "chapters": Array of exactly ${count} chapters.
For each chapter include:
   - "title": Chapter Title (e.g. "Chapter 1: ...")
   - "summary": 2-3 sentences explaining the core concept, case studies, and practical takeaways.
   - "sections": Array of 3-5 sub-topics/sections covered in this chapter.
   - "includesExercises": true
   - "includesExamples": true

Return your response ONLY as a valid JSON object with NO markdown enclosing, NO \`\`\`json blocks.
JSON format:
{
  "title": "...",
  "subtitle": "...",
  "description": "...",
  "chapters": [
    {
      "title": "Chapter 1: ...",
      "summary": "...",
      "sections": ["Section 1.1: ...", "Section 1.2: ...", "Section 1.3: ..."],
      "includesExercises": true,
      "includesExamples": true
    }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: systemPrompt,
    });

    const parsed = JSON.parse(cleanJSONText(response.text));
    await incrementAIUsage(user._id);

    res.json(parsed);
  } catch (error) {
    console.error("Generate book error:", error);
    res.status(500).json({
      message: "Failed to generate complete book plan",
      error: error.message,
    });
  }
};

// @desc    Generate eBook outline (chapters list)
// @route   POST /api/ai/generate-outline
// @access  Private
const generateOutline = async (req, res) => {
  const { title, description, audience, style, length, difficulty, contentType } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Book title is required" });
  }

  const user = await checkAILimit(req, res);
  if (!user) return;

  try {
    const prompt = `You are a professional book publisher and editor.
Create a detailed, logical chapter outline for a publication-ready book.
Title: "${title}"
Details/Niche: "${description || ""}"
Target Audience: "${audience || "General"}"
Writing Style/Tone: "${style || "Friendly & Clear"}"
Difficulty: "${difficulty || "Beginner"}"
Content Type: "${contentType || "Practical Guide"}"
Outline Length: "${length || "5 Chapters"}"

Generate 5 to 7 chapters. For each chapter, provide:
1. Chapter Title (e.g. "Chapter 1: ...")
2. Summary (2 sentences explaining theoretical foundations, real-world examples, and actionable takeaways).

Return your response ONLY as a valid JSON array of objects, with NO markdown formatting, NO code blocks.
[
  { "title": "Chapter 1: ...", "summary": "..." },
  { "title": "Chapter 2: ...", "summary": "..." }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const chapters = JSON.parse(cleanJSONText(response.text));
    await incrementAIUsage(user._id);
    res.json({ chapters });
  } catch (error) {
    console.error("AI Generate outline error:", error);
    res.status(500).json({ message: "AI Outline generation failed", error: error.message });
  }
};

// @desc    Draft full, rich chapter content with AI (Structured Educational Format)
// @route   POST /api/ai/generate-chapter
// @access  Private
const generateChapter = async (req, res) => {
  const {
    title,
    chapterTitle,
    chapterSummary,
    writingStyle,
    difficulty,
    contentType,
    length,
    options, // { examples: true, exercises: true, mcqs: true, summary: true, faq: true, interviewQuestions: true }
    previousChapterContext,
  } = req.body;

  if (!title || !chapterTitle) {
    return res.status(400).json({ message: "Book title and chapter title are required" });
  }

  const user = await checkAILimit(req, res);
  if (!user) return;

  const opt = options || {};

  const prompt = `You are an acclaimed textbook author, industry expert, and master educator.
Write a complete, deeply educational, and structured chapter for a book.

Book Title: "${title}"
Chapter: "${chapterTitle}"
Chapter Goal/Summary: "${chapterSummary || ""}"
Tone: "${writingStyle || "Professional & Engaging"}"
Difficulty Level: "${difficulty || "Beginner"}"
Content Type: "${contentType || "Practical Guide"}"
Target Length: "${length || "Standard (approx 1200-1800 words)"}"
${previousChapterContext ? `Context from previous chapter: "${previousChapterContext}"` : ""}

STRUCTURAL INSTRUCTIONS:
- Write comprehensive, in-depth content. Do NOT write shallow summaries or placeholders.
- Use clean semantic HTML elements directly (<h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>, <code>, <pre><code>...</code></pre>, <hr/>).
- Start immediately with the chapter narrative or introduction (no markdown, no backticks, no wrapping <html><body> tags).
- Include practical step-by-step breakdowns, conceptual definitions, and architecture/logic flow where applicable.
${opt.examples !== false ? `- Include a dedicated '<h3>Practical Real-World Examples & Case Studies</h3>' with concrete examples (and code/data blocks if relevant).` : ""}
${opt.summary !== false ? `- Include a '<h3>Chapter Summary & Key Takeaways</h3>' with bullet points summarizing the core learnings.` : ""}
${opt.exercises ? `- Include a '<h3>Practice Exercises & Hands-On Challenges</h3>' with 3-4 problem-solving exercises.` : ""}
${opt.mcqs ? `- Include a '<h3>Self-Assessment Multiple Choice Questions (MCQs)</h3>' with 3 questions, options, and explanations.` : ""}
${opt.faq ? `- Include a '<h3>Frequently Asked Questions</h3>' covering common beginner traps and best practices.` : ""}
${opt.interviewQuestions ? `- Include a '<h3>Common Interview & Certification Questions</h3>' with sample model answers.` : ""}

Write the full HTML chapter now:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    let content = response.text.trim();
    if (content.startsWith("```")) {
      content = content.replace(/^```(?:html)?\s*/i, "").replace(/```$/, "").trim();
    }

    await incrementAIUsage(user._id);
    res.json({ content });
  } catch (error) {
    console.error("AI Generate chapter error:", error);
    res.status(500).json({ message: "AI Chapter drafting failed", error: error.message });
  }
};

// @desc    Generic AI Command Editor (Whole Chapter / Whole Content Natural Language)
// @route   POST /api/ai/edit-content
// @access  Private
const editContent = async (req, res) => {
  const { content, instruction, chapterTitle, bookTitle, tone, difficulty } = req.body;

  if (!content || !instruction) {
    return res.status(400).json({ message: "Content and natural language instruction are required" });
  }

  const user = await checkAILimit(req, res);
  if (!user) return;

  const prompt = `You are a professional book editor and writing assistant.
Apply the following user instruction to modify and enhance the provided chapter content.

Book Title: "${bookTitle || "eBook"}"
Chapter: "${chapterTitle || "Current Chapter"}"
Tone: "${tone || "Professional"}"
Difficulty: "${difficulty || "Standard"}"

USER INSTRUCTION:
"${instruction}"

ORIGINAL CONTENT (HTML):
${content}

REQUIREMENTS:
- Strictly follow the user's instruction while maintaining the context and format of the chapter.
- Return the full modified content formatted in clean semantic HTML (<h2>, <h3>, <p>, <ul>, <ol>, <li>, <blockquote>, <pre><code>, etc.).
- Do NOT use markdown code blocks (\`\`\`html). Output raw HTML elements directly.
- Preserve unchanged sections and weave additions seamlessly into the chapter.

Return the modified HTML content now:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    let modified = response.text.trim();
    if (modified.startsWith("```")) {
      modified = modified.replace(/^```(?:html)?\s*/i, "").replace(/```$/, "").trim();
    }

    await incrementAIUsage(user._id);
    res.json({
      original: content,
      suggested: modified,
      instruction,
    });
  } catch (error) {
    console.error("AI Edit content error:", error);
    res.status(500).json({ message: "AI Content edit failed", error: error.message });
  }
};

// @desc    Floating Selection AI (Modify or answer specifically for selected text)
// @route   POST /api/ai/edit-selection
// @access  Private
const editSelection = async (req, res) => {
  const { selectedText, action, customInstruction, contextBefore, contextAfter } = req.body;

  if (!selectedText) {
    return res.status(400).json({ message: "Selected text is required" });
  }

  const user = await checkAILimit(req, res);
  if (!user) return;

  let promptInstruction = "";
  switch (action) {
    case "rewrite":
      promptInstruction = "Rewrite the selected text to make it more engaging, articulate, and flow naturally.";
      break;
    case "expand":
      promptInstruction = "Expand the selected text with rich details, explanations, and thorough nuance.";
      break;
    case "shorten":
      promptInstruction = "Make the selected text concise, punchy, and direct while preserving all essential insights.";
      break;
    case "simplify":
      promptInstruction = "Simplify this text so that complete beginners can easily understand it without jargon.";
      break;
    case "grammar":
      promptInstruction = "Fix all grammar, spelling, punctuation, and syntax errors in the selected text.";
      break;
    case "professional":
      promptInstruction = "Rewrite the selected text in an authoritative, polished, executive professional tone.";
      break;
    case "academic":
      promptInstruction = "Rewrite the selected text with academic rigor, scholarly terminology, and formal structure.";
    case "creative":
      promptInstruction = "Rewrite the selected text in a vivid, storytelling, creative narrative style.";
      break;
    case "explain":
      promptInstruction = "Provide an intuitive explanation and real-world analogy for the concept highlighted in the selected text.";
      break;
    case "add-example":
      promptInstruction = "Add 2 practical, real-world examples illustrating the point made in the selected text.";
      break;
    case "continue":
      promptInstruction = "Continue writing seamlessly from where the selected text left off for 2-3 paragraphs.";
      break;
    case "custom":
    default:
      promptInstruction = customInstruction || "Improve and polish the selected text.";
      break;
  }

  const prompt = `You are an expert writing co-pilot in a rich book editor.
Transform the selected passage based on this instruction: "${promptInstruction}"

${contextBefore ? `Preceding Context: "${contextBefore.substring(Math.max(0, contextBefore.length - 200))}"` : ""}
Selected Passage: "${selectedText}"
${contextAfter ? `Succeeding Context: "${contextAfter.substring(0, 200)}"` : ""}

Output clean HTML or formatted text representing the replacement passage. Do NOT output markdown code blocks.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    let result = response.text.trim();
    if (result.startsWith("```")) {
      result = result.replace(/^```(?:html)?\s*/i, "").replace(/```$/, "").trim();
    }

    await incrementAIUsage(user._id);
    res.json({
      original: selectedText,
      suggested: result,
      action: action || "custom",
    });
  } catch (error) {
    console.error("AI Edit selection error:", error);
    res.status(500).json({ message: "AI Selection edit failed", error: error.message });
  }
};

// @desc    Whole Book Assistant (Review, Consolidate, Add Elements across chapters)
// @route   POST /api/ai/review-content
// @access  Private
const reviewContent = async (req, res) => {
  const { bookId, command, chapters, bookTitle, bookDescription } = req.body;

  if (!command) {
    return res.status(400).json({ message: "Assistant command is required" });
  }

  const user = await checkAILimit(req, res);
  if (!user) return;

  const chaptersSummary = (chapters || []).map((ch, idx) => ({
    chapterNumber: idx + 1,
    title: ch.title,
    length: ch.body ? ch.body.length : 0,
    excerpt: ch.body ? ch.body.replace(/<[^>]*>/g, " ").substring(0, 250) + "..." : "",
  }));

  const prompt = `You are a Chief Literary Editor and Book Strategist.
Analyze the entire book structure and respond to the author's macro command.

Book Title: "${bookTitle || "eBook"}"
Description: "${bookDescription || ""}"
Author Command: "${command}"

Current Chapters Overview:
${JSON.stringify(chaptersSummary, null, 2)}

Provide an actionable, structured response formatted in clean HTML.
- If the author asked to generate an introduction, conclusion, glossary, index, or FAQ, provide the full high-grade text ready to be inserted.
- If the author asked for consistency improvement, grammar audit, or tone adjustments across the book, provide chapter-by-chapter actionable suggestions and revisions.
- Output clean HTML (<h2>, <h3>, <p>, <ul>, <li>, <strong>, etc.) without markdown enclosing.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    let result = response.text.trim();
    if (result.startsWith("```")) {
      result = result.replace(/^```(?:html)?\s*/i, "").replace(/```$/, "").trim();
    }

    await incrementAIUsage(user._id);
    res.json({
      command,
      response: result,
    });
  } catch (error) {
    console.error("AI Review content error:", error);
    res.status(500).json({ message: "AI Book Assistant review failed", error: error.message });
  }
};

// @desc    Generate Exercises, MCQs, or Study Materials
// @route   POST /api/ai/generate-exercises
// @access  Private
const generateExercises = async (req, res) => {
  const { chapterTitle, chapterContent, type, difficulty } = req.body;

  if (!chapterTitle) {
    return res.status(400).json({ message: "Chapter title is required" });
  }

  const user = await checkAILimit(req, res);
  if (!user) return;

  const prompt = `You are an expert curriculum designer.
Generate high-impact ${type || "exercises and questions"} for the following chapter:
Chapter: "${chapterTitle}"
Difficulty: "${difficulty || "Intermediate"}"

Content Excerpt:
${chapterContent ? chapterContent.replace(/<[^>]*>/g, " ").substring(0, 2000) : ""}

Generate:
1. 3 Practical Real-World Problem Solving Exercises
2. 3 Multiple Choice Questions (with Answer Keys & Explanations)
3. 2 Discussion/Interview Questions with Model Answers

Format your response in clean, beautiful HTML elements directly (<h3>, <ol>, <li>, <p>, <strong>, <blockquote>). Do NOT use markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    let content = response.text.trim();
    if (content.startsWith("```")) {
      content = content.replace(/^```(?:html)?\s*/i, "").replace(/```$/, "").trim();
    }

    await incrementAIUsage(user._id);
    res.json({ content });
  } catch (error) {
    console.error("AI Generate exercises error:", error);
    res.status(500).json({ message: "Failed to generate exercises", error: error.message });
  }
};

// @desc    Edit text with AI assistant (Legacy & Quick Actions)
// @route   POST /api/ai/edit-text
// @access  Private
const editText = async (req, res) => {
  const { action, text, instruction, tone } = req.body;

  if (!action || !text) {
    return res.status(400).json({ message: "Action and text are required" });
  }

  const user = await checkAILimit(req, res);
  if (!user) return;

  try {
    let prompt = "";
    if (action === "rewrite") {
      prompt = `Rewrite the following text to make it more engaging, clear, and professional. Return HTML output directly. Do NOT use markdown.\nText: "${text}"`;
    } else if (action === "expand") {
      prompt = `Expand the following text with rich detail and examples. Return HTML output directly.\nText: "${text}"`;
    } else if (action === "shorten") {
      prompt = `Shorten the following text to be punchy and direct while keeping core insights. Return HTML output directly.\nText: "${text}"`;
    } else if (action === "grammar") {
      prompt = `Fix all grammar, punctuation, and style errors in the following text. Return HTML output directly.\nText: "${text}"`;
    } else if (action === "tone") {
      prompt = `Rewrite the following text in a "${tone || "Professional"}" tone. Return HTML output directly.\nText: "${text}"`;
    } else if (action === "chat") {
      prompt = `You are a world-class AI book editor. Answer this query: "${instruction}"\nContext chapter content:\n"${text}"\nProvide your response formatted as clean HTML. Do NOT use markdown.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    let result = response.text.trim();
    if (result.startsWith("```")) {
      result = result.replace(/^```(?:html)?\s*/i, "").replace(/```$/, "").trim();
    }

    await incrementAIUsage(user._id);
    res.json({ content: result });
  } catch (error) {
    console.error("AI Edit text error:", error);
    res.status(500).json({ message: "AI Text processing failed", error: error.message });
  }
};

// @desc    Generate AI cover image using Pollinations.ai
// @route   POST /api/ai/generate-cover
// @access  Private
const generateCoverImage = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: "A cover description prompt is required" });
  }

  const user = await checkAILimit(req, res);
  if (!user) return;

  try {
    const seed = Math.floor(Math.random() * 100000);
    const enhancedPrompt = `Professional book cover art, high quality, editorial design: ${prompt}`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=600&height=800&enhance=true&seed=${seed}&nologo=true`;

    const fileName = `cover-${Date.now()}-${seed}.jpg`;
    const filePath = path.join(coversDir, fileName);

    await new Promise((resolve, reject) => {
      const fetchImage = (url, redirectCount = 0) => {
        if (redirectCount > 5) {
          return reject(new Error("Too many redirects"));
        }
        const client = url.startsWith("https") ? https : http;
        client.get(url, (response) => {
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            return fetchImage(response.headers.location, redirectCount + 1);
          }
          if (response.statusCode !== 200) {
            return reject(new Error(`Image fetch failed with status ${response.statusCode}`));
          }
          const fileStream = fs.createWriteStream(filePath);
          response.pipe(fileStream);
          fileStream.on("finish", () => {
            fileStream.close();
            resolve();
          });
          fileStream.on("error", reject);
        }).on("error", reject);
      };
      fetchImage(imageUrl);
    });

    await incrementAIUsage(user._id);

    const serverUrl = `http://localhost:${process.env.PORT || 5000}/Backend/uploads/covers/${fileName}`;
    
    res.json({
      imageUrl: serverUrl,
      message: "AI cover image generated successfully",
    });
  } catch (error) {
    console.error("AI Cover generation error:", error);
    res.status(500).json({ message: "AI Cover image generation failed", error: error.message });
  }
};

module.exports = {
  generateBook,
  generateOutline,
  generateChapter,
  editContent,
  editSelection,
  reviewContent,
  generateExercises,
  editText,
  generateCoverImage,
};
