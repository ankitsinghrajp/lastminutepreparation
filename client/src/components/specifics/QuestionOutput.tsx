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
    // 🔥 FIX: convert double-escaped LaTeX to single (\\\\ → \\)
    .replace(/\\\\/g, "\\")
    // 🔥 convert escaped newlines to real newlines
    .replace(/\\n/g, "\n")
    // 🔥 clean table pipe alignment
    .replace(/\n\s*\|/g, "\n|")
    .trim();
};

const QuestionOutput = ({ content }) => {
  const normalized = normalizeContent(content);

  return (
    <div
      className="
        prose max-w-none text-[18px] leading-[1.85]

        [&>p]:mt-1 [&>p]:mb-1
        [&>ul]:mt-6 [&>ul]:mb-6
        [&>ol]:mt-6 [&>ol]:mb-6
        [&_li]:my-2

        [&_.katex-display]:mt-8 [&_.katex-display]:mb-8
        [&_.katex-display]:py-4 [&_.katex-display]:px-4
        [&_.katex-display]:bg-muted/30 [&_.katex-display]:rounded-xl shadow-sm

        [&_.katex]:text-[19px]

        [&_pre]:mt-8 [&_pre]:mb-8 [&_pre]:p-4 [&_pre]:rounded-xl
        [&_code]:text-[16px]
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

export default QuestionOutput;
