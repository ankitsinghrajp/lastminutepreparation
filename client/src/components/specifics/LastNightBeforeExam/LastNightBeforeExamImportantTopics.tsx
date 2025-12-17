import { Lightbulb } from 'lucide-react'

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

const Output = ({ content }) => {
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


const LastNightBeforeExamImportantTopics = ({importantTopics}) => {
  return (
      <div className=" rounded-none shadow-sm  overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
              <div className= "flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-white">Important Topics</h3>
              </div>
            </div>
            <div className="py-2 space-y-4">
              {importantTopics.map((topic, idx) => (
                <div key={idx} className="bg-muted/50 rounded-xl p-4 border border-border">
                  <div className="flex gap-3 mb-3">
                    <p className="font-semibold text-base text-foreground pt-0.5">
                      {topic.topic}
                    </p>
                  </div>
                  <p className="text-sm text-foreground/80 mb-3 ml-1 leading-relaxed">
                    {topic.explanation}
                  </p>

                  {topic.formula && (
                    <div className="ml-0 bg-gray-800 rounded-md p-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600/30 scrollbar-track-transparent hover:scrollbar-thumb-gray-600/50">
                      <p className="mb-2">
                        Formula:
                      </p>
                      <div className="min-w-max">
                        {<Output content={`$${topic.formula}$`}/>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
  )
}

export default LastNightBeforeExamImportantTopics