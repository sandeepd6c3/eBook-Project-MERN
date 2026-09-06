import React, { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const OutlineGeneratorModal = ({
  isOpen,
  onClose,
  initialTopic,
  onGenerate,
  isGenerating,
}) => {
  const [topic, setTopic] = useState(initialTopic || "");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("General Learners");
  const [tone, setTone] = useState("Friendly & Clear");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [contentType, setContentType] = useState("Practical Guide");
  const [chaptersCount, setChaptersCount] = useState(5);

  React.useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
  }, [initialTopic]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;
    onGenerate({
      prompt: topic.trim(),
      description: description.trim(),
      audience,
      tone,
      difficulty,
      contentType,
      chaptersCount,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Complete Book Plan & Outline"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1">
            Book Topic or Title *
          </label>
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'Mastering Full-Stack React & Node.js Microservices'..."
            className="w-full text-xs sm:text-sm bg-bg-secondary border border-border-primary rounded-xl p-3 text-text-primary focus:border-brand-purple focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1">
            Niche Details & Core Objectives (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key talking points, concepts to cover, target audience background..."
            className="w-full text-xs bg-bg-secondary border border-border-primary rounded-xl p-3 text-text-primary focus:border-brand-purple focus:outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full text-xs bg-bg-secondary border border-border-primary rounded-xl p-2.5 text-text-primary focus:outline-none"
            >
              <option value="Beginner">Beginner (Zero to One)</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced / Mastery</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
              Writing Style / Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full text-xs bg-bg-secondary border border-border-primary rounded-xl p-2.5 text-text-primary focus:outline-none"
            >
              <option value="Friendly & Clear">Friendly & Clear</option>
              <option value="Professional & Technical">Professional & Technical</option>
              <option value="Academic & Scholarly">Academic & Scholarly</option>
              <option value="Conversational & Storytelling">Conversational & Storytelling</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
              Content Format
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full text-xs bg-bg-secondary border border-border-primary rounded-xl p-2.5 text-text-primary focus:outline-none"
            >
              <option value="Practical Guide">Practical Guide</option>
              <option value="Textbook">Comprehensive Textbook</option>
              <option value="Tutorial">Step-by-Step Tutorial</option>
              <option value="Exam Prep">Exam / Interview Prep</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
              Number of Chapters
            </label>
            <select
              value={chaptersCount}
              onChange={(e) => setChaptersCount(Number(e.target.value))}
              className="w-full text-xs bg-bg-secondary border border-border-primary rounded-xl p-2.5 text-text-primary focus:outline-none"
            >
              <option value={4}>4 Chapters (Quick Guide)</option>
              <option value={5}>5 Chapters (Standard)</option>
              <option value={7}>7 Chapters (In-depth)</option>
              <option value={10}>10 Chapters (Mastery Edition)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-2 border-t border-border-primary">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2.5 text-xs font-bold text-text-secondary hover:text-text-primary bg-bg-secondary rounded-xl border border-border-primary"
          >
            Cancel
          </button>
          <Button
            type="submit"
            variant="primary"
            disabled={!topic.trim() || isGenerating}
            className="px-6 py-2.5 text-xs font-bold rounded-xl"
          >
            {isGenerating ? "Structuring with AI..." : "Generate Book Outline ✨"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default OutlineGeneratorModal;
