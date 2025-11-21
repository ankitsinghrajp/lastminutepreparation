import "katex/dist/katex.min.css";
import Latex from "react-latex-next";

export const renderFormula = (text) => {
  if (!text?.trim()) return null;

  // Check if the text contains LaTeX patterns
  const hasLatex = /\$\$.*?\$\$|\\\[.*?\\\]|\\\(.*?\\\)|\\[a-zA-Z]+|\^|_/.test(text);
  // If no LaTeX detected, return plain text
  if (!hasLatex) {
    return <span className="inline-block">{text}</span>;
  }

  // Clean up the formula by normalizing backslashes
  let cleaned = text
    .replace(/\\\\\\\\/g, '\\') // quadruple backslash to single
    .replace(/\\\\\\/g, '\\')   // triple backslash to single
    .replace(/\\\\/g, '\\')     // double backslash to single
    .trim();

  // If text already has $$ delimiters, use it as-is
  // Otherwise, check if it's pure formula or mixed text
  if (cleaned.includes('$$') || cleaned.includes('\\[') || cleaned.includes('\\(')) {
    return (
      <div className="overflow-x-auto max-w-full">
        <Latex>{cleaned}</Latex>
      </div>
    );
  }

  // For inline formulas, wrap in $$
  return (
    <div className="overflow-x-auto max-w-full">
      <Latex>{`$$${cleaned}$$`}</Latex>
    </div>
  );
};

export const parseAnswer = (answer) => {
  if (!answer) return [];

  if (!answer.includes('\\n')) {
    return [{ type: "paragraph", content: answer.trim() }];
  }

  const parts = answer
    .split(/\\n/)
    .filter((part) => part.trim());

  return parts.map((part) => {
    const trimmed = part.trim();

    if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
      return {
        type: "bullet",
        content: trimmed.replace(/^[-•]\s*/, '').trim(),
      };
    }

    if (/^\d+\./.test(trimmed)) {
      return {
        type: "numbered",
        content: trimmed.replace(/^\d+\.\s*/, '').trim(),
      };
    }

    if (trimmed.match(/^\s{2,}-/) || trimmed.match(/^\s{2,}•/)) {
      return {
        type: "subbullet",
        content: trimmed.trim().replace(/^[-•]\s*/, '').trim(),
      };
    }

    return { type: "paragraph", content: trimmed };
  });
};