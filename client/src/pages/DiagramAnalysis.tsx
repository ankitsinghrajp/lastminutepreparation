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

const AIOutput = ({ content }) => {
  const cleanedContent = content
    ?.replace(/\n\s*\n\s*\n+/g, "\n\n") // remove triple blank lines
    ?.replace(/^\s+|\s+$/g, "");        // trim edges

  return (
    <div
      className="
        text-[18px] leading-[1.45]

        /* remove margins everywhere */
        [&_*]:m-0 [&_*]:p-0

        /* lists compact */
        [&_li]:my-0.5

        /* katex compact */
        [&_.katex-display]:my-1
      "
    >
      <ReactMarkdown
        children={cleanedContent}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
      />
    </div>
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
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    <AIOutput content={analysis}/>
                  </p>
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
