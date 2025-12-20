import React from "react";
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
        prose max-w-none text-base sm:text-lg leading-relaxed
        px-1

        /* Paragraphs */
        [&>p]:mt-2 [&>p]:mb-2

        /* Lists */
        [&>ul]:mt-4 [&>ul]:mb-4 [&>ul]:pl-4 sm:[&>ul]:pl-6
        [&>ol]:mt-4 [&>ol]:mb-4 [&>ol]:pl-4 sm:[&>ol]:pl-6
        [&_li]:my-2

        /* Headings */
        [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:text-xl sm:[&>h2]:text-2xl
        [&>h3]:mt-6 [&>h3]:mb-2 [&>h3]:text-lg sm:[&>h3]:text-xl
        [&>h4]:mt-5 [&>h4]:mb-2 [&>h4]:text-base sm:[&>h4]:text-lg

        /* Math blocks - responsive */
        [&_.katex-display]:mt-4 [&_.katex-display]:mb-4
        [&_.katex-display]:py-3 [&_.katex-display]:px-2
        sm:[&_.katex-display]:py-4 sm:[&_.katex-display]:px-4
        [&_.katex-display]:bg-muted/30
        [&_.katex-display]:rounded-lg sm:[&_.katex-display]:rounded-xl
        [&_.katex-display]:shadow-sm
        [&_.katex-display]:overflow-x-auto
        [&_.katex-display]:overflow-y-hidden
        [&_.katex-display]:max-w-full
        [&_.katex-display]:scrollbar-thin
        [&_.katex-display]:scrollbar-thumb-muted
        [&_.katex-display]:scrollbar-track-transparent

        /* KaTeX font sizing - responsive */
        [&_.katex]:text-sm sm:[&_.katex]:text-base md:[&_.katex]:text-lg
        [&_.katex-display_.katex]:text-base sm:[&_.katex-display_.katex]:text-lg

        /* Inline math */
        [&_p_.katex]:mx-0.5

        /* Code blocks - responsive */
        [&_pre]:mt-4 [&_pre]:mb-4
        [&_pre]:p-3 sm:[&_pre]:p-4
        [&_pre]:rounded-lg sm:[&_pre]:rounded-xl
        [&_pre]:overflow-x-auto
        [&_pre]:overflow-y-hidden
        [&_pre]:max-w-full
        [&_pre]:scrollbar-thin
        [&_pre]:scrollbar-thumb-muted
        [&_pre]:scrollbar-track-transparent

        [&_code]:text-sm sm:[&_code]:text-base
        [&_:not(pre)>code]:bg-muted/50
        [&_:not(pre)>code]:px-1.5
        [&_:not(pre)>code]:py-0.5
        [&_:not(pre)>code]:rounded

        /* Tables - responsive */
        [&_table]:mt-4 [&_table]:mb-4
        [&_table]:overflow-x-auto
        [&_table]:block sm:[&_table]:table
        [&_table]:max-w-full

        /* Blockquotes */
        [&>blockquote]:mt-4 [&>blockquote]:mb-4
        [&>blockquote]:pl-3 sm:[&>blockquote]:pl-4
        [&>blockquote]:border-l-4

        /* Strong/Bold text */
        [&_strong]:font-semibold
      "
    >
      <ReactMarkdown
        children={content.replace(/\n/g, "  \n")}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
      />
    </div>
  );
};

export default AIOutput;