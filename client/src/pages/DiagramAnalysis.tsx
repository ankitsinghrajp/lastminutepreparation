import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Scan, Upload, Loader2, Lightbulb, CheckCircle2, X, FileImage, Zap } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import {server} from "../constants"
import axios from "axios";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";



// utils/validateAIOutput.ts

 function validateAIOutput(content: string) {
  if (!content || typeof content !== "string") {
    return { valid: false, reason: "Empty AI response" };
  }

  const errors: string[] = [];

  /* ---------------- LANGUAGE MIX CHECK ---------------- */

  const hindiRegex = /[अ-ह]/;
  const englishRegex = /[a-zA-Z]/;

  if (hindiRegex.test(content) && englishRegex.test(content)) {
    errors.push("Mixed Hindi and English detected");
  }

  /* ---------------- FORBIDDEN MARKDOWN ---------------- */

  if (/```/.test(content)) errors.push("Code blocks are forbidden");
  if (/^#+\s/m.test(content)) errors.push("Markdown headings detected");
  if (/{\s*".*":/.test(content)) errors.push("JSON detected");

  /* ---------------- MATH SAFETY ---------------- */

  const rawMathTokens = [
    "\\vec{",
    "\\theta",
    "\\Phi",
    "\\cos",
    "\\sin",
    "\\sqrt",
    "\\frac",
  ];

  rawMathTokens.forEach((token) => {
    const regex = new RegExp(`(?<!\\$)${token}`, "g");
    if (regex.test(content)) {
      errors.push(`Math token ${token} used outside LaTeX`);
    }
  });

  /* ---------------- DISPLAY MATH RULE ---------------- */

  if (/\\Phi\s*=/.test(content) && !/\$\$[\s\S]*\\Phi\s*=/.test(content)) {
    errors.push("Flux formula must be in display math ($$ $$)");
  }

  /* ---------------- BULLET STRUCTURE ---------------- */

  const bulletCount = (content.match(/^\s*[-•]/gm) || []).length;
  if (bulletCount < 3) {
    errors.push("Too few bullet points for diagram explanation");
  }

  /* ---------------- WORD COUNT ---------------- */

  const wordCount = content.trim().split(/\s+/).length;
  if (wordCount < 50 || wordCount > 70) {
    errors.push(`Word count violation (${wordCount} words)`);
  }

  /* ---------------- MEMORY RULE ---------------- */

  if (!/memory|remember|trick|mnemonic/i.test(content)) {
    errors.push("Memory trick missing");
  }

  if (!/revision|quick|summary/i.test(content)) {
    errors.push("Quick revision line missing");
  }

  /* ---------------- FINAL RESULT ---------------- */

  if (errors.length > 0) {
    return {
      valid: false,
      reason: errors.join(" | "),
    };
  }

  return { valid: true };
}


const normalizeContent = (content) => {
  if (typeof content !== "string") return content;

  return content
    .replace(/\\\\/g, "\\")
    .replace(/\\n/g, "\n")
    .replace(/\n\s*\|/g, "\n|")
    .trim();
};

// Function to wrap mathematical formulas with $ signs for KaTeX rendering
const wrapMathFormulas = (text) => {
  if (!text || typeof text !== "string") return text;

  // Patterns to detect mathematical notation
  const patterns = [
    // Superscripts like x^2, x^3, etc.
    /\b([a-zA-Z])\^(\{[^}]+\}|\d+)/g,
    // Subscripts like x_1, x_2, etc.
    /\b([a-zA-Z])_(\{[^}]+\}|\d+)/g,
    // Fractions in parentheses like (x - 4)/3
    /\(([^)]+)\)\/(\d+|[a-zA-Z]+)/g,
    // Greek letters and mathematical symbols
    /[∈∉⊂⊆∪∩∅≤≥≠±∞∑∏√∫∂]/g,
    // Function inverses like f^{-1}
    /([a-zA-Z])\^\{-1\}/g,
  ];

  let result = text;
  let hasMatch = false;

  patterns.forEach(pattern => {
    if (pattern.test(result)) {
      hasMatch = true;
    }
  });

  // If any mathematical pattern is found, process the text
  if (hasMatch) {
    // Don't wrap if already wrapped with $
    if (result.includes('$')) {
      return result;
    }

    // Wrap superscripts: x^2 -> $x^2$
    result = result.replace(/\b([a-zA-Z])\^(\{[^}]+\}|\d+)/g, (match) => {
      if (result.charAt(result.indexOf(match) - 1) !== '$') {
        return `$${match}$`;
      }
      return match;
    });

    // Wrap subscripts: x_1 -> $x_1$
    result = result.replace(/\b([a-zA-Z])_(\{[^}]+\}|\d+)/g, (match) => {
      if (result.charAt(result.indexOf(match) - 1) !== '$') {
        return `$${match}$`;
      }
      return match;
    });

    // Wrap function inverses: f^{-1} -> $f^{-1}$
    result = result.replace(/([a-zA-Z])\^\{-1\}/g, (match) => {
      if (result.charAt(result.indexOf(match) - 1) !== '$') {
        return `$${match}$`;
      }
      return match;
    });

    // Wrap fractions: (x - 4)/3 -> $(x - 4)/3$
    result = result.replace(/\(([^)]+)\)\/(\d+|[a-zA-Z]+)/g, (match) => {
      if (result.charAt(result.indexOf(match) - 1) !== '$') {
        return `$${match}$`;
      }
      return match;
    });

    // Wrap standalone mathematical symbols
    result = result.replace(/([∈∉⊂⊆∪∩∅≤≥≠±∞∑∏√∫∂])/g, (match, offset) => {
      if (result.charAt(offset - 1) !== '$') {
        return `$${match}$`;
      }
      return match;
    });
  }

  return result;
};

const AIOutput = ({ content }) => {
  if (!content || typeof content !== "string") return null;

  // First wrap math formulas, then normalize
  const withMath = wrapMathFormulas(content);
  const normalized = normalizeContent(withMath);

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

          [&_table]:my-4
          [&_table]:border
          [&_table]:border-border
          [&_th]:border [&_td]:border
          [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2
          [&_td]:px-3 [&_td]:py-2
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


export default function DiagramAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const pollForResult = async (formData: FormData) => {
  const interval = setInterval(async () => {
    try {
      const res = await axios.post(
        `${server}/api/v1/ai/image-analysis`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      // ✅ Result ready
      if (res?.status === 200 && res.data?.aiResponse) {
        setAnalysis(res.data.aiResponse);
        setLoading(false);
        clearInterval(interval);
        toast.success("Diagram analyzed successfully!");
      }
    } catch (err) {
      console.error("Polling error", err);
      clearInterval(interval);
      setLoading(false);
      toast.error("Failed while fetching result");
    }
  }, 2000);
};


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(uploadedFile.type)) {
        toast.error("Please upload an image (JPG, PNG, GIF, WebP) or PDF file");
        return;
      }

      if (uploadedFile.size > 15 * 1024 * 1024) {
        toast.error("File size must be less than 15MB");
        return;
      }

      setFile(uploadedFile);

      if (uploadedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(uploadedFile);
      } else {
        setFilePreview(null);
      }

      toast.success(`File "${uploadedFile.name}" uploaded successfully!`);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    setAnalysis("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("File removed");
  };

  const handleAnalyze = async () => {
  if (!file) {
    toast.error("Please upload a file first");
    return;
  }

  try {
    setLoading(true);
    setAnalysis("");

    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post(
      `${server}/api/v1/ai/image-analysis`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );

    // ✅ If instantly ready (cache hit)
    if (res?.status === 200 && res.data?.aiResponse) {
      setAnalysis(res.data.aiResponse);
      toast.success("Diagram analyzed successfully!");
      setLoading(false);
      return;
    }

    // ⏳ Otherwise start polling
    toast.message("Analyzing diagram...");
    pollForResult(formData);

  } catch (error: any) {
    console.error(error);
    toast.error(error?.response?.data?.message || "Analysis failed. Try again.");
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-2 py-20 max-w-7xl">

        {/* Header Section */}
        <div className="text-center mb-8 space-y-3">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
              <Scan className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Diagram &{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
              Question Analysis
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Upload any diagram and learn how to remember, understand, and redraw it perfectly in the exam.
          </p>
        </div>

        {/* Upload Section */}
        <Card className="px-2 py-5 bg-card/50 border-border/50 backdrop-blur-sm mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold mb-1">Upload Diagram or Question</p>
                  <p className="text-sm text-muted-foreground">
                    Click to browse or drag and drop
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports: JPG, PNG, GIF, WebP, PDF (max 15MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 bg-background/80 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                    <FileImage className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleRemoveFile}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {filePreview && (
                <div className="rounded-lg overflow-hidden border border-border bg-background/50 p-2">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-contain rounded"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white border-0 flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Analyze Now
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Change
                </Button>
              </div>

              {/* Analysis Output */}
              {analysis && (
                <Card className="p-4 mt-4 bg-background border border-border">
                  <h2 className="text-lg font-semibold mb-2">AI Explanation:</h2>
                    <AIOutput content={analysis}/>
                </Card>
              )}
            </div>
          )}
        </Card>

      </div>

      <Footer />
    </div>
  );
}