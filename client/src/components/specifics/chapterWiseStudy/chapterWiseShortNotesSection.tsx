
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

const AIOutput = ({ content }) => {
  return (
    <div
      className="
        prose prose-invert max-w-none

        text-[17.5px] sm:text-[18px]
        leading-[1.9]

        /* Paragraph rhythm */
        [&>p]:mt-1.5
        [&>p]:mb-1.5

        /* Bold concept name (acts like heading) */
        [&>p>strong]:block
        [&>p>strong]:text-[19px]
        [&>p>strong]:sm:text-[20px]
        [&>p>strong]:font-semibold
        [&>p>strong]:text-white
        [&>p>strong]:mt-7
        [&>p>strong]:mb-2

        /* KaTeX display blocks */
        [&_.katex-display]:mt-6
        [&_.katex-display]:mb-6
        [&_.katex-display]:px-4
        [&_.katex-display]:py-3
        [&_.katex-display]:bg-white/5
        [&_.katex-display]:rounded-xl
        [&_.katex-display]:overflow-x-auto

        /* KaTeX font sizing */
        [&_.katex]:text-[18px]
        sm:[&_.katex]:text-[19px]

        /* Prevent formula clipping */
        [&_.katex-display]:max-w-full
        [&_.katex]:whitespace-normal

        /* Code (just in case) */
        [&_code]:text-[15px]
        [&_pre]:rounded-xl
        [&_pre]:bg-black/40
      "
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const ChapterWiseShortNotesSection = ({ shortNotes }) => {
  if (!shortNotes) return null;

  return (
    <div
      className="
        p-4 sm:p-5
        bg-[#12151c]
        border border-white/10
        shadow-md shadow-black/20

        hover:border-violet-500/30
        hover:shadow-violet-500/10
        transition-all duration-300
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/50 tracking-wide">
          Everything important about this chapter is here...
        </span>

        <span
          className="
            text-[10px] px-2 py-1 rounded-full
            bg-violet-600/20 text-violet-300 border border-violet-500/20
          "
        >
          Important
        </span>
      </div>

      {/* Entire content as single AI Output */}
      <AIOutput content={shortNotes} />
    </div>
  );
};

export default ChapterWiseShortNotesSection;
