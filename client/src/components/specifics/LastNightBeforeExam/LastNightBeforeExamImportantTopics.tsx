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
    <>
      <style>{`
        /* Prevent KaTeX formulas from being cut off */
        .formula-output-wrapper .katex-display {
          overflow-x: visible !important;
          overflow-y: visible !important;
          overflow: visible !important;
        }
        
        .formula-output-wrapper .katex-display > .katex {
          max-width: 100%;
          display: inline-block;
          text-align: left;
        }
        
        .formula-output-wrapper .katex {
          max-width: 100%;
          display: inline-block;
          line-height: 1.4;
        }
        
        .formula-output-wrapper p {
          line-height: 1.7;
          margin: 0.4rem 0;
        }
        
        /* Responsive font scaling for mobile */
        @media (max-width: 640px) {
          .formula-output-wrapper .katex {
            font-size: 0.9em !important;
          }
          
          .formula-output-wrapper .katex-display > .katex {
            font-size: 0.8em !important;
          }
        }
        
        @media (max-width: 480px) {
          .formula-output-wrapper .katex {
            font-size: 0.85em !important;
          }
          
          .formula-output-wrapper .katex-display > .katex {
            font-size: 0.75em !important;
          }
        }
        
        @media (max-width: 380px) {
          .formula-output-wrapper .katex {
            font-size: 0.8em !important;
          }
          
          .formula-output-wrapper .katex-display > .katex {
            font-size: 0.7em !important;
          }
        }
      `}</style>
      
      <div
        className="formula-output-wrapper
          prose max-w-none text-[16px] leading-relaxed

          [&>p]:my-1.5
          [&>ul]:mt-4 [&>ul]:mb-4
          [&>ol]:mt-4 [&>ol]:mb-4
          [&_li]:my-1.5

          [&_.katex-display]:my-4
          [&_.katex-display]:py-2 [&_.katex-display]:px-3
          [&_.katex-display]:bg-muted/30 [&_.katex-display]:rounded-xl

          [&_.katex]:text-[16px] [&_.katex]:align-middle

          [&_pre]:mt-6 [&_pre]:mb-6 [&_pre]:p-3 [&_pre]:rounded-xl
          [&_code]:text-[15px]
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
                    <Output content={`${topic.explanation}`}/>
                  </p>

                  {topic.formula && (
                    <div className="ml-0  rounded-md">
                     
                      <div className="min-w-0">
                        <Output content={`$${topic.formula}$`}/>
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