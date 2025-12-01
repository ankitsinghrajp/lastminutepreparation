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
        prose max-w-none text-[18px] leading-[1.85]

        /* ⇢ Paragraph spacing (clean 2-line look) */
        [&>p]:mt-1 [&>p]:mb-1

        /* ⇢ List spacing */
        [&>ul]:mt-6 [&>ul]:mb-6
        [&>ol]:mt-6 [&>ol]:mb-6
        [&_li]:my-2

        /* ⇢ Headings — proper spacing like ChatGPT */
        [&>h2]:mt-10 [&>h2]:mb-3
        [&>h3]:mt-9 [&>h3]:mb-3
        [&>h4]:mt-8 [&>h4]:mb-2

        /* ⇢ Formula block — enough room above & below */
        [&_.katex-display]:mt-8 [&_.katex-display]:mb-8
        [&_.katex-display]:py-4 [&_.katex-display]:px-4
        [&_.katex-display]:bg-muted/30 [&_.katex-display]:rounded-xl shadow-sm

        /* ⇢ Inline formula size */
        [&_.katex]:text-[19px]

        /* ⇢ Code block spacing & styling */
        [&_pre]:mt-8 [&_pre]:mb-8 [&_pre]:p-4 [&_pre]:rounded-xl
        [&_code]:text-[16px]
      "
    >
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
      />
    </div>
  );
};

export default AIOutput;
