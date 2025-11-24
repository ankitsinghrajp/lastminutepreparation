import { CheckCircle, Lightbulb } from "lucide-react";
import { renderFormula } from "./renderFormula";
import AIOutput from "../AIOutput";

const normalizeLatex = (text) => {
  if (!text || typeof text !== 'string') return text;

  return text
    .replace(/\\\\/g, "\\")
    .replace(/\\\[/g, "\\[")
    .replace(/\\\]/g, "\\]")
    .replace(/\\\(/g, "\\(")
    .replace(/\\\)/g, "\\)")
    .trim();
};

const convertMarkdownBold = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const renderTextWithFormulas = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return rawText || null;

  const text = normalizeLatex(rawText);

  const formulaRegex =
    /(\\\[.*?\\\]|\\\(.*?\\\)|\$\$.*?\$\$|\$.*?\$|\\frac\{[^}]*\}\{[^}]*\}|\\sqrt\{[^}]*\}|[A-Za-z0-9_]+\s*=\s*[^,\.\n]+)/g;

  const matches = [...text.matchAll(formulaRegex)];

  if (matches.length === 0) {
    return <span>{convertMarkdownBold(text)}</span>;
  }

  const parts = [];
  let last = 0;

  matches.forEach((match) => {
    const index = match.index;

    if (index > last) {
      const before = text.substring(last, index);
      parts.push(<span key={`t-${last}`}>{convertMarkdownBold(before)}</span>);
    }

    const formula = match[0];
    parts.push(<span key={`f-${index}`}>{renderFormula(formula)}</span>);

    last = index + formula.length;
  });

  if (last < text.length) {
    const after = text.substring(last);
    parts.push(<span key={`t-${last}-end`}>{convertMarkdownBold(after)}</span>);
  }

  return <>{parts}</>;
};

const LastNightMcqs = ({ mcqs }) => {
  // Safety check for mcqs array
  if (!mcqs || !Array.isArray(mcqs) || mcqs.length === 0) {
    return (
      <div className="rounded-lg shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
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
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-bold text-lg text-white">
            Multiple Choice Questions
          </h3>
        </div>
      </div>

      <div className="py-4 space-y-4">
        {mcqs.map((mcq, idx) => {
          // Safety checks for each MCQ object
          if (!mcq || typeof mcq !== 'object') return null;

          const question = mcq.question || "Question not available";
          const options = Array.isArray(mcq.options) ? mcq.options : [];
          const correct = mcq.correct || "";
          const formula = mcq.formula || "";
          const explanation = mcq.explanation || "No explanation provided";

          return (
            <div
              key={idx}
              className="bg-muted/50 rounded-xl p-4 border border-border overflow-hidden"
            >
              {/* Question */}
              <div className="flex gap-3 mb-4">
                <span className="font-bold text-foreground/70 shrink-0 text-base">
                  Q{idx + 1}.
                </span>
                <div className="font-semibold text-base text-foreground break-words overflow-hidden">
                  {renderTextWithFormulas(question)}
                </div>
              </div>

              {/* Options */}
              {options.length > 0 && (
                <div className="space-y-2 mb-4 ml-1 overflow-hidden">
                  {options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg text-sm transition-all ${
                        opt === correct
                          ? "bg-green-500/10 border-2 border-green-500/40 shadow-sm"
                          : "bg-background/50 border border-border"
                      }`}
                    >
                      <div className="flex items-start gap-2 overflow-hidden">
                        <span className="font-bold text-foreground/70 shrink-0">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        <span
                          className={`min-w-0 break-words block leading-normal ${
                            opt === correct
                              ? "font-medium text-green-700 dark:text-green-300"
                              : "text-foreground/90"
                          }`}
                        >
                          <span className="inline-block align-middle overflow-visible">
                            {renderTextWithFormulas(opt)}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

      
              {/* Explanation */}
              <div className="p-4 mb-4 bg-blue-500/5 rounded-lg border-l-4 border-blue-500 ml-2 overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wide">
                    Explanation
                  </p>
                </div>
                <div className="text-sm text-foreground/80 leading-relaxed break-words overflow-hidden">
                  {renderTextWithFormulas(explanation)}
                </div>
              </div>

               {/* Formula Block */}
              {formula && (
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 mb-3 ml-2 overflow-x-auto">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                    Formula:
                  </p>
                  {renderFormula(normalizeLatex(formula))}
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
