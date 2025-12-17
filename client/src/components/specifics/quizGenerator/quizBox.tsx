import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  HelpCircle,
  FileText
} from 'lucide-react';

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

const normalizeContent = (content) => {
  if (typeof content !== "string") return content;

  return content
    .replace(/\\\\/g, "\\")
    .replace(/\\n/g, "\n")
    .replace(/\n\s*\|/g, "\n|")
    .trim();
};

// Function to wrap mathematical formulas with $ signs for KaTeX rendering
const wrapMathFormulas = (text) => {
  if (!text || typeof text !== "string") return text;

  // Patterns to detect mathematical notation
  const patterns = [
    // Superscripts like x^2, x^3, etc.
    /\b([a-zA-Z])\^(\{[^}]+\}|\d+)/g,
    // Subscripts like x_1, x_2, etc.
    /\b([a-zA-Z])_(\{[^}]+\}|\d+)/g,
    // Fractions in parentheses like (x - 4)/3
    /\(([^)]+)\)\/(\d+|[a-zA-Z]+)/g,
    // Greek letters and mathematical symbols
    /[∈∉⊂⊆∪∩∅≤≥≠±∞∑∏√∫∂]/g,
    // Function inverses like f^{-1}
    /([a-zA-Z])\^\{-1\}/g,
  ];

  let result = text;
  let hasMatch = false;

  patterns.forEach(pattern => {
    if (pattern.test(result)) {
      hasMatch = true;
    }
  });

  // If any mathematical pattern is found, process the text
  if (hasMatch) {
    // Don't wrap if already wrapped with $
    if (result.includes('$')) {
      return result;
    }

    // Wrap superscripts: x^2 -> $x^2$
    result = result.replace(/\b([a-zA-Z])\^(\{[^}]+\}|\d+)/g, (match) => {
      if (result.charAt(result.indexOf(match) - 1) !== '$') {
        return `$${match}$`;
      }
      return match;
    });

    // Wrap subscripts: x_1 -> $x_1$
    result = result.replace(/\b([a-zA-Z])_(\{[^}]+\}|\d+)/g, (match) => {
      if (result.charAt(result.indexOf(match) - 1) !== '$') {
        return `$${match}$`;
      }
      return match;
    });

    // Wrap function inverses: f^{-1} -> $f^{-1}$
    result = result.replace(/([a-zA-Z])\^\{-1\}/g, (match) => {
      if (result.charAt(result.indexOf(match) - 1) !== '$') {
        return `$${match}$`;
      }
      return match;
    });

    // Wrap fractions: (x - 4)/3 -> $(x - 4)/3$
    result = result.replace(/\(([^)]+)\)\/(\d+|[a-zA-Z]+)/g, (match) => {
      if (result.charAt(result.indexOf(match) - 1) !== '$') {
        return `$${match}$`;
      }
      return match;
    });

    // Wrap standalone mathematical symbols
    result = result.replace(/([∈∉⊂⊆∪∩∅≤≥≠±∞∑∏√∫∂])/g, (match, offset) => {
      if (result.charAt(offset - 1) !== '$') {
        return `$${match}$`;
      }
      return match;
    });
  }

  return result;
};

const MCQMarkdown = ({ content }) => {
  if (!content || typeof content !== "string") return null;

  // First wrap math formulas, then normalize
  const withMath = wrapMathFormulas(content);
  const normalized = normalizeContent(withMath);

  return (
    <div
      className="
        prose prose-sm max-w-none text-[14px] leading-relaxed

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

        [&_.katex]:text-[15px]
        [&_.katex-display]:my-4
        [&_.katex-display]:px-3
        [&_.katex-display]:py-2
        [&_.katex-display]:bg-muted/30
        [&_.katex-display]:rounded-lg

        [&_pre]:my-3 [&_pre]:p-3 [&_pre]:rounded-lg
        [&_code]:text-[13px]
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

const QuizBox = ({ response }) => {
  const [showAnswers, setShowAnswers] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    mcq: true,
    fillup: true,
    trueFalse: true
  });

  const toggleAnswer = (id) => {
    setShowAnswers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!response || !response?.questions || response.questions.length === 0) {
    return (
      <Card className="p-8 bg-card/30 border-border/30 text-center">
        <BookOpen className="h-12 w-12 mx-auto mb-3 text-emerald-500/50" />
        <h3 className="text-base font-medium mb-1.5 text-muted-foreground">
          No Questions Yet
        </h3>
        <p className="text-xs text-muted-foreground/70">
          Generate questions to see them here
        </p>
      </Card>
    );
  }

  const mcqQuestions = response.questions?.filter(q => q.type === 'mcq') || [];
  const fillupQuestions = response.questions?.filter(q => q.type === 'fillup') || [];
  const trueFalseQuestions = response.questions?.filter(q => q.type === 'true_false') || [];

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Chapter Info Header */}
      <Card className="px-2 py-4 md:p-4 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold mb-1 truncate">{response?.chapter || 'Quiz Questions'}</h2>
              <div className="flex flex-wrap gap-1.5 text-xs sm:text-sm text-muted-foreground">
                {response?.subject && <span className="truncate">{response.subject}</span>}
                {response?.class && <span>• Class {response.class}</span>}
                {response?.questions && <span>• {response.questions.length} Questions</span>}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Multiple Choice Questions */}
      {mcqQuestions.length > 0 && (
        <Card className="px-2 py-4 md:p-4 bg-card/50 border-border/50">
          <button
            onClick={() => toggleSection('mcq')}
            className="flex items-center justify-between w-full mb-3 sm:mb-4"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
              <h3 className="text-sm sm:text-base font-semibold">Multiple Choice ({mcqQuestions.length})</h3>
            </div>
            {expandedSections.mcq ? (
              <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            )}
          </button>

          {expandedSections.mcq && (
            <div className="space-y-3 sm:space-y-4">
              {mcqQuestions.map((q, idx) => (
                <div key={q.id || idx} className="px-2 py-4 md:p-4 bg-background/50 rounded-lg border border-border/30">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{idx + 1}</span>
                      </span>
                      <div className="text-sm font-medium flex-1">
                        <MCQMarkdown content={q.question} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    {q.options?.map((option, optIdx) => (
                      <div 
                        key={optIdx}
                        className="p-2.5 sm:p-3 bg-background/50 rounded-lg text-xs sm:text-sm border border-border/30"
                      >
                        <MCQMarkdown content={option} />
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => toggleAnswer(`mcq-${q.id || idx}`)}
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                  >
                    {showAnswers[`mcq-${q.id || idx}`] ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Hide Answer
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show Answer
                      </>
                    )}
                  </Button>

                  {showAnswers[`mcq-${q.id || idx}`] && q.answer && (
                    <div className="mt-3 p-2.5 sm:p-3 bg-emerald-500/5 rounded border border-emerald-500/20">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                        Correct Answer:
                      </p>
                      <div className="text-sm font-medium">
                        <MCQMarkdown content={q.answer} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Fill in the Blanks */}
      {fillupQuestions.length > 0 && (
        <Card className="px-2 py-4 md:p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
          <button
            onClick={() => toggleSection('fillup')}
            className="flex items-center justify-between w-full mb-3 sm:mb-4"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              <h3 className="text-sm sm:text-base font-semibold">Fill in the Blanks ({fillupQuestions.length})</h3>
            </div>
            {expandedSections.fillup ? (
              <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            )}
          </button>

          {expandedSections.fillup && (
            <div className="space-y-3">
              {fillupQuestions.map((q, idx) => (
                <div key={q.id || idx} className="p-3 sm:p-4 bg-background/50 rounded-lg border border-border/30">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{idx + 1}</span>
                      </span>
                      <div className="text-sm font-medium flex-1">
                        <MCQMarkdown content={q.question} />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => toggleAnswer(`fillup-${q.id || idx}`)}
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                  >
                    {showAnswers[`fillup-${q.id || idx}`] ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Hide Answer
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show Answer
                      </>
                    )}
                  </Button>

                  {showAnswers[`fillup-${q.id || idx}`] && q.answer && (
                    <div className="mt-3 p-2.5 sm:p-3 bg-purple-500/5 rounded border border-purple-500/20">
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                        Answer:
                      </p>
                      <div className="text-sm">
                        <MCQMarkdown content={q.answer} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* True/False Questions */}
      {trueFalseQuestions.length > 0 && (
        <Card className="px-2 py-4 md:p-4 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
          <button
            onClick={() => toggleSection('trueFalse')}
            className="flex items-center justify-between w-full mb-3 sm:mb-4"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              <h3 className="text-sm sm:text-base font-semibold">True/False ({trueFalseQuestions.length})</h3>
            </div>
            {expandedSections.trueFalse ? (
              <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            )}
          </button>

          {expandedSections.trueFalse && (
            <div className="space-y-3">
              {trueFalseQuestions.map((q, idx) => (
                <div key={q.id || idx} className="px-2 py-4 md:p-4 bg-background/50 rounded-lg border border-border/30">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{idx + 1}</span>
                      </span>
                      <div className="text-sm font-medium flex-1">
                        <MCQMarkdown content={q.question} />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => toggleAnswer(`tf-${q.id || idx}`)}
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                  >
                    {showAnswers[`tf-${q.id || idx}`] ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Hide Answer
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show Answer
                      </>
                    )}
                  </Button>

                  {showAnswers[`tf-${q.id || idx}`] && q.answer && (
                    <div className="mt-3 p-2.5 sm:p-3 bg-blue-500/5 rounded border border-blue-500/20">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                        Answer:
                      </p>
                      <p className={`text-sm font-medium ${
                        q.answer.toLowerCase() === 'true' 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {q.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default QuizBox;