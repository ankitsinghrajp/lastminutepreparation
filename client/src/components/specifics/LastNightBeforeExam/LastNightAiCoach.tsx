import { Target } from 'lucide-react'

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
    // DO NOT TOUCH LaTeX BACKSLASHES
    .replace(/\r\n/g, "\n")
    .replace(/\n\s*\|/g, "\n|")
    .trim();
};

const Output = ({ content }) => {
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

          [&>p]:mt-1 [&>p]:mb-1
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

const LastNightAiCoach = ({aiCoach}) => {
  return (
      <div className="rounded-none shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-white">AI Coach - Study Plan</h3>
              </div>
            </div>

            <div className="py-4 space-y-3">
              {aiCoach.map((step, idx) => (
                <div key={idx} className="flex gap-3 bg-muted/50 rounded-xl p-4 border border-border">
                  

                  <div className="flex-1">
                    <p className="text-sm leading-relaxed text-foreground/90 mb-2">
                       <Output content={step.action}/>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
  )
}

export default LastNightAiCoach