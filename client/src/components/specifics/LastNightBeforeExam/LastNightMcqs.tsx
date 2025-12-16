import { CheckCircle, Lightbulb } from "lucide-react";
import { renderFormula } from "./renderFormula";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import AIOutput from "../AIOutput";

const MCQMarkdown = ({ content }) => {
  if (!content || typeof content !== "string") return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) => (
          <span className="leading-relaxed">{children}</span>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};


/* -------------------- Helpers -------------------- */

const normalizeLatex = (text) => {
  if (!text || typeof text !== "string") return "";
  return text.replace(/\\\\/g, "\\").trim();
};

/* -------------------- Component -------------------- */

const LastNightMcqs = ({ mcqs }) => {
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

      {/* MCQs */}
      <div className="py-4 space-y-4">
        {mcqs.map((mcq, idx) => {
          if (!mcq || typeof mcq !== "object") return null;

          const {
            question = "Question not available",
            options = [],
            correct = "",
            explanation = "No explanation provided",
            formula = "",
          } = mcq;

          return (
            <div
              key={idx}
              className="bg-muted/50 rounded-xl p-4 border border-border"
            >
              {/* Question */}
              <div className="flex gap-3 mb-4">
                <span className="font-bold text-foreground/70 shrink-0">
                  Q{idx + 1}.
                </span>
                <div className="font-semibold text-base text-foreground">
                  <MCQMarkdown content={question} />
                </div>
              </div>

              {/* Options */}
              {Array.isArray(options) && options.length > 0 && (
                <div className="space-y-2 mb-4 ml-1">
                  {options.map((opt, i) => {
                    const isCorrect = opt === correct;
                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-lg transition-all ${
                          isCorrect
                            ? "bg-green-500/10 border-2 border-green-500/40"
                            : "bg-background/50 border border-border"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-foreground/70 shrink-0">
                            {String.fromCharCode(65 + i)}.
                          </span>
                          <div
                            className={`leading-relaxed ${
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

              {/* Explanation */}
              <div className="p-4 mb-4 bg-blue-500/5 rounded-lg border-l-4 border-blue-500 ml-2">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <p className="text-blue-600 font-bold text-xs uppercase tracking-wide">
                    Explanation
                  </p>
                </div>
                <div className="text-sm text-foreground/80 leading-relaxed">
                  <MCQMarkdown content={explanation} />
                </div>
              </div>

              {/* Formula (ONLY SOURCE OF FORMULAS) */}
              {formula && typeof formula === "string" && formula.trim() !== "" && (
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 mb-3 ml-2 overflow-x-auto">
                  <p className="text-xs font-semibold text-blue-600 mb-2">
                    Formula:
                  </p>
                  {<AIOutput content={formula}/>}
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
