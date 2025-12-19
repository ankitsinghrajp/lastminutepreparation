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

const QuestionOutput = ({ content }) => {
  const normalized = normalizeContent(content);

  return (
    <>
      <style>{`
        .question-output-wrapper .katex-display {
          overflow: visible !important;
        }

        .question-output-wrapper .katex-display > .katex {
          max-width: 100%;
          display: inline-block;
          text-align: left;
        }

        @media (max-width: 640px) {
          .question-output-wrapper .katex {
            font-size: 0.9em !important;
          }

          .question-output-wrapper .katex-display > .katex {
            font-size: 0.8em !important;
          }
        }

        @media (max-width: 480px) {
          .question-output-wrapper .katex {
            font-size: 0.85em !important;
          }

          .question-output-wrapper .katex-display > .katex {
            font-size: 0.75em !important;
          }
        }

        @media (max-width: 380px) {
          .question-output-wrapper .katex {
            font-size: 0.8em !important;
          }

          .question-output-wrapper .katex-display > .katex {
            font-size: 0.7em !important;
          }
        }
      `}</style>

      <div
        className="question-output-wrapper
          prose max-w-none text-[16px] leading-[1.75]

          [&>p]:mt-4 [&>p]:mb-4
          [&>ul]:mt-5 [&>ul]:mb-5
          [&>ol]:mt-5 [&>ol]:mb-5
          [&_li]:my-1.5

          [&_.katex-display]:mt-6 [&_.katex-display]:mb-6
          [&_.katex-display]:py-3 [&_.katex-display]:px-4
          [&_.katex-display]:bg-muted/30 [&_.katex-display]:rounded-xl shadow-sm

          [&_.katex]:text-[17px]

          [&_pre]:mt-6 [&_pre]:mb-6 [&_pre]:p-4 [&_pre]:rounded-xl
          [&_code]:text-[14px]
        "
      >
        <ReactMarkdown
          children={normalized}
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
        />
      </div>
    </>
  );
};

export default QuestionOutput;