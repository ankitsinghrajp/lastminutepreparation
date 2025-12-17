import { CheckCircle, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

/* -------------------- Normalizer (SAME AS QuestionOutput) -------------------- */

const normalizeContent = (content) => {
  if (typeof content !== "string") return content;

  return content
    .replace(/\\\\/g, "\\")     // LaTeX fix
    .replace(/\\n/g, "\n")      // Newlines
    .replace(/\n\s*\|/g, "\n|") // Tables
    .trim();
};

/* -------------------- MCQ Markdown -------------------- */

const MCQMarkdown = ({ content }) => {
  if (!content || typeof content !== "string") return null;

  const normalized = normalizeContent(content);

  return (
    <div
      className="
        prose prose-sm max-w-none

        [&>p]:my-1
        [&>ul]:my-3
        [&>ol]:my-3
        [&_li]:my-1

        [&_table]:my-4
        [&_table]:border
        [&_table]:border-border
        [&_th]:border [&_td]:border
        [&_th]:bg-muted [&_th]:px-2 [&_th]:py-1
        [&_td]:px-2 [&_td]:py-1

        [&_.katex]:text-[16px]
        [&_.katex-display]:my-4
        [&_.katex-display]:px-3
        [&_.katex-display]:py-2
        [&_.katex-display]:bg-muted/30
        [&_.katex-display]:rounded-lg

        [&_pre]:my-3 [&_pre]:p-3 [&_pre]:rounded-lg
        [&_code]:text-[14px]
      "
    >
      <ReactMarkdown
        children={normalized}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
      />
    </div>
  );
};



/* -------------------- Helpers -------------------- */

const normalizeLatex = (text) => {
  if (!text || typeof text !== "string") return "";
  return text.replace(/\\\\/g, "\\").trim();
};

/* -------------------- Component -------------------- */

const LastNightMcqs = ({ mcqs }) => {
  const [openExplanations, setOpenExplanations] = useState({});

  const toggleExplanation = (idx) => {
    setOpenExplanations(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (!Array.isArray(mcqs) || mcqs.length === 0) {
    return (
      <div className="rounded-lg shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-lg text-white">
              Multiple Choice Questions
            </h3>
          </div>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          No MCQs available at the moment.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-none shadow-sm border-y overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 md:p-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 bg-white/20 rounded-lg">
            <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </div>
          <h3 className="font-bold text-base md:text-lg text-white">
            Multiple Choice Questions
          </h3>
        </div>
      </div>

      {/* MCQs */}
      <div className="py-3 md:py-4 space-y-3 md:space-y-4">
        {mcqs.map((mcq, idx) => {
          if (!mcq || typeof mcq !== "object") return null;

          const {
            question = "Question not available",
            options = [],
            correct = "",
            explanation = "No explanation provided",
            formula = "",
          } = mcq;

          const isOpen = openExplanations[idx];

          return (
            <div
              key={idx}
              className="bg-muted/50 rounded-xl p-3 md:p-4 border border-border mx-2 md:mx-0"
            >
              {/* Question */}
              <div className="flex gap-2 md:gap-3 mb-3 md:mb-4">
                <span className="font-bold text-foreground/70 shrink-0 text-sm md:text-base">
                  Q{idx + 1}.
                </span>
                <div className="font-semibold text-sm md:text-base text-foreground">
                  <MCQMarkdown content={question} />
                </div>
              </div>

              {/* Options */}
              {Array.isArray(options) && options.length > 0 && (
                <div className="space-y-2 mb-3 md:mb-4 ml-0 md:ml-1">
                  {options.map((opt, i) => {
                    const isCorrect = opt === correct;
                    return (
                      <div
                        key={i}
                        className={`p-2.5 md:p-3 rounded-lg transition-all ${
                          isCorrect
                            ? "bg-green-500/10 border-2 border-green-500/40"
                            : "bg-background/50 border border-border"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-foreground/70 shrink-0 text-sm md:text-base">
                            {String.fromCharCode(65 + i)}.
                          </span>
                          <div
                            className={`leading-relaxed text-sm md:text-base ${
                              isCorrect
                                ? "font-medium text-green-700 dark:text-green-300"
                                : "text-foreground/90"
                            }`}
                          >
                            <MCQMarkdown content={opt} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Formula (ONLY SOURCE OF FORMULAS) */}
              {formula && typeof formula === "string" && formula.trim() !== "" && (
                <div className="p-2.5 md:p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 mb-3 ml-0 md:ml-2 overflow-x-auto">
                  <p className="text-xs font-semibold text-blue-600 mb-2">
                    Formula:
                  </p>
                  {<MCQMarkdown content={`$${formula}$`}/>}
                </div>
              )}

              {/* Explanation Toggle Button */}
              <button
                onClick={() => toggleExplanation(idx)}
                className="w-full p-3 md:p-4 bg-green-500/5 rounded-xl border-2 border-green-500/30 ml-0 md:ml-2 hover:bg-green-500/10 hover:border-green-500/50 hover:shadow-md transition-all duration-200 flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 md:p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                    <Lightbulb className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-green-600 font-bold text-xs md:text-sm uppercase tracking-wide">
                      View Explanation
                    </p>
                    <p className="text-green-600/70 text-[10px] md:text-xs">
                      {isOpen ? "Click to hide" : "Click to reveal"}
                    </p>
                  </div>
                </div>
                <div className="p-1 bg-green-500/10 rounded-full group-hover:bg-green-500/20 transition-colors">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  )}
                </div>
              </button>

              {/* Explanation Content */}
              {isOpen && (
                <div className="mt-3 p-4 md:p-5 bg-green-500/5 rounded-xl border-l-4 border-green-500 ml-0 md:ml-2 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <Lightbulb className="h-4 w-4 text-green-600" />
                    <p className="text-green-600 font-bold text-xs uppercase tracking-wide">
                      Explanation
                    </p>
                  </div>
                  <div className="text-sm md:text-base text-foreground leading-[1.8] space-y-3">
                    <MCQMarkdown content={explanation} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LastNightMcqs;