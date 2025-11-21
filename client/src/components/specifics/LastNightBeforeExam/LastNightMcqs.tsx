import { CheckCircle, Lightbulb } from 'lucide-react'
import { renderFormula } from './renderFormula'

// --- Helper: clean JSON-escaped LaTeX everywhere ----
const normalizeLatex = (text) => {
  if (!text) return text;

  return text
    .replace(/\\\\/g, "\\")        // Convert \\frac → \frac, \\alpha → \alpha
    .replace(/\\\[/g, "\\[")       // Ensure \[ stays correct
    .replace(/\\\]/g, "\\]")       
    .replace(/\\\(/g, "\\(")
    .replace(/\\\)/g, "\\)")
    .trim();
};

// --- Bold Markdown ---
const convertMarkdownBold = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

// --- Formula-aware text renderer ---
const renderTextWithFormulas = (rawText) => {
  if (!rawText) return null;

  const text = normalizeLatex(rawText);

  // Detect any LaTeX structure
  const formulaRegex =
    /(\\\[.*?\\\]|\\\(.*?\\\)|\\frac{.*?}|\\sqrt{.*?}|[A-Za-z0-9_]+\s*=\s*[^,\.\n]+)/g;

  const matches = [...text.matchAll(formulaRegex)];

  if (matches.length === 0) {
    return <span>{convertMarkdownBold(text)}</span>;
  }

  const parts = [];
  let last = 0;

  matches.forEach((match) => {
    const index = match.index;

    // Text before formula
    if (index > last) {
      const before = text.substring(last, index);
      parts.push(<span key={`t-${last}`}>{convertMarkdownBold(before)}</span>);
    }

    // The formula itself
    const formula = match[0];
    parts.push(<span key={`f-${index}`}>{renderFormula(formula)}</span>);

    last = index + formula.length;
  });

  // Remaining text
  if (last < text.length) {
    const after = text.substring(last);
    parts.push(<span key={`t-${last}`}>{convertMarkdownBold(after)}</span>);
  }

  return <>{parts}</>;
};

const LastNightMcqs = ({ mcqs }) => {
  return (
    <div className="rounded-none shadow-sm border-y overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-bold text-lg text-white">Multiple Choice Questions</h3>
        </div>
      </div>

      <div className="py-4 space-y-4">
        {mcqs.map((mcq, idx) => (
          <div key={idx} className="bg-muted/50 rounded-xl p-4 border border-border">
            {/* Question */}
            <div className="flex gap-3 mb-4">
              <div className="font-semibold text-base text-foreground pt-1">
                {renderTextWithFormulas(mcq.question)}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2 mb-4 ml-1">
              {mcq.options.map((opt, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg text-sm transition-all ${
                    opt === mcq.correct
                      ? "bg-green-500/10 border-2 border-green-500/40 shadow-sm"
                      : "bg-background/50 border border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground/70">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span
                      className={
                        opt === mcq.correct
                          ? "font-medium text-green-700 dark:text-green-300"
                          : "text-foreground/90"
                      }
                    >
                      {renderTextWithFormulas(opt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Formula Block */}
            {mcq.formula && (
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 mb-3 ml-2">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">Formula:</p>
                {renderFormula(normalizeLatex(mcq.formula))}
              </div>
            )}

            {/* Explanation */}
            <div className="p-4 bg-blue-500/5 rounded-lg border-l-4 border-blue-500 ml-2">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wide">
                  Explanation
                </p>
              </div>
              <div className="text-sm text-foreground/80 leading-relaxed">
                {renderTextWithFormulas(mcq.explanation)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LastNightMcqs;
