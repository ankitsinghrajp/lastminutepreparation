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
        prose max-w-none text-[18px] leading-[1.9]

        /* Paragraphs */
        [&>p]:mt-2
        [&>p]:mb-2

        /* Lists */
        [&>ul]:mt-5
        [&>ul]:mb-5
        [&>ol]:mt-5
        [&>ol]:mb-5
        [&_li]:my-2.5

        /* Headings */
        [&>h2]:mt-10 [&>h2]:mb-4
        [&>h3]:mt-9  [&>h3]:mb-3
        [&>h4]:mt-8  [&>h4]:mb-2

        /* Math blocks */
        [&_.katex-display]:mt-6
        [&_.katex-display]:mb-6
        [&_.katex-display]:py-3
        [&_.katex-display]:px-4
        [&_.katex-display]:bg-muted/30
        [&_.katex-display]:rounded-xl
        [&_.katex-display]:shadow-sm

        [&_.katex]:text-[19px]

        /* Code blocks */
        [&_pre]:mt-6
        [&_pre]:mb-6
        [&_pre]:p-4
        [&_pre]:rounded-xl

        [&_code]:text-[16px]
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
