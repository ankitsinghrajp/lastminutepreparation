import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { MessageCircle, Loader2, Bot, Copy, Trash2, Sparkles, Upload, X, FileImage } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { server } from "../constants";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import AskAnyLoader from "@/components/askAnyLoader";

/* ===================== AI OUTPUT ===================== */
const AIOutput = ({ content }) => {
  if (!content) return null;

  return (
    <div
      className="
        prose max-w-none text-[18px] leading-[1.85]
        [&>*:first-child]:mt-0
        [&_table]:mt-0
        [&>p]:mt-1 [&>p]:mb-1
        [&>ul]:mt-6 [&>ul]:mb-6
        [&>ol]:mt-6 [&>ol]:mb-6
        [&_li]:my-2
        [&>h2]:mt-10 [&>h2]:mb-3
        [&>h3]:mt-9 [&>h3]:mb-3
        [&>h4]:mt-8 [&>h4]:mb-2
        [&_.katex-display]:mt-8 [&_.katex-display]:mb-8
        [&_.katex-display]:py-4 [&_.katex-display]:px-4
        [&_.katex-display]:bg-muted/30 [&_.katex-display]:rounded-xl shadow-sm
        [&_.katex]:text-[19px]
        [&_pre]:mt-8 [&_pre]:mb-8 [&_pre]:p-4 [&_pre]:rounded-xl
        [&_code]:text-[16px]
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

/* ===================== MAIN PAGE ===================== */
export default function AskAnyQuestion() {
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const POLL_INTERVAL_MS = 5 * 1000; // 5 seconds
const POLL_TIMEOUT_MS = 40 * 1000; // 40 seconds


  const {user} = useSelector(state=>state.auth);


  const pollRef = useRef(null);

const startPolling = async (formData) => {
  // Clear any existing poll
  if (pollRef.current) {
    clearInterval(pollRef.current);
    pollRef.current = null;
  }

  const startTime = Date.now();

  pollRef.current = setInterval(async () => {
    try {
      // ⛔ STOP AFTER 40 SECONDS
      if (Date.now() - startTime > POLL_TIMEOUT_MS) {
        clearInterval(pollRef.current);
        pollRef.current = null;
        setLoading(false); // ✅ STOP LOADER
        toast.error("Answer is taking too long. Please try again.");
        return;
      }

      const res = await fetch(`${server}/api/v1/ai/ask-any`, {
        method: "POST",
        credentials: "include",
        headers: {
          "x-lmp-poll": "1",
        },
        body: formData,
      });

      const data = await res.json();

      // ✅ FINAL RESULT READY
      if (res.ok && data?.answer) {
        setResponse(data);
        clearInterval(pollRef.current);
        pollRef.current = null;
        setLoading(false); // ✅ STOP LOADER
      }
    } catch (err) {
      clearInterval(pollRef.current);
      pollRef.current = null;
      setLoading(false); // ✅ STOP LOADER
      toast.error("Polling failed. Please try again.");
    }
  }, POLL_INTERVAL_MS);
};



  const handleImageUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if(user.planType === "FREE"){
       toast.error("Only Premium users can upload images. If you’ve just upgraded, please log in again.”");
       return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];
    if (!validTypes.includes(uploadedFile.type)) {
      toast.error("Please upload JPG, PNG, GIF or WebP");
      return;
    }

    if (uploadedFile.size > 15 * 1024 * 1024) {
      toast.error("File size must be less than 15MB");
      return;
    }

    setImage(uploadedFile);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(uploadedFile);

    toast.success("Image uploaded");
  };


useEffect(() => {
  return () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
    }
  };
}, []);


  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAsk = async () => {
  if (!question.trim() && !image) {
    toast.error("Please enter a question or upload an image");
    return;
  }

  setLoading(true);
  setResponse(null);

  try {
    const formData = new FormData();
    if (question.trim()) formData.append("question", question);
    if (image) formData.append("image", image);

    const res = await fetch(`${server}/api/v1/ai/ask-any`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data?.message || "Something went wrong");
      setLoading(false);
      return;
    }

    // ✅ CASE 1: Answer already cached (Redis HIT)
  
    if (data?.answer) {
      setResponse(data);
      setLoading(false);
      return;
    }

    startPolling(formData);

  } catch (err) {
    toast.error("Failed to send question");
    setLoading(false);
  }
};


  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(`Question: ${question || "From Image"}\n\nAnswer:\n${response.answer}`);
    toast.success("Answer copied");
  };

  const handleClear = () => {
    setQuestion("");
    setImage(null);
    setImagePreview(null);
    setResponse(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        {/* Title */}
        <title>
          Ask Any Question for CBSE | Upload Image & Get Topper-Style Answers – LMP
        </title>

        {/* Meta Description */}
        <meta
          name="description"
          content="Upload a photo of any CBSE question or ask directly and get topper-style, exam-ready answers. AI-powered doubt solving built for scoring full marks."
        />

        {/* Keywords */}
        <meta
          name="keywords"
          content="
          ask any question cbse,
          upload question image get answer,
          cbse doubt solver ai,
          image based question answer cbse,
          topper style answers cbse,
          ai homework help cbse,
          board exam question solver,
          photo question answer cbse,
          instant cbse doubt solving
          "
        />

        {/* Canonical */}
        <link
          rel="canonical"
          href="https://lastminutepreparation.in/ask-any"
        />

        {/* Robots */}
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Ask Any CBSE Question – Upload Image & Get Topper Answers | LMP"
        />
        <meta
          property="og:description"
          content="Click a photo of any CBSE question or ask directly. Get accurate, topper-style answers written exactly for board exams."
        />
        <meta
          property="og:url"
          content="https://lastminutepreparation.in/ask-any"
        />
        <meta
          property="og:image"
          content="https://lastminutepreparation.in/og-ask-any.png"
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Ask Any CBSE Question | Image & Text Answers – LMP"
        />
        <meta
          name="twitter:description"
          content="Upload a question image or ask anything and get exam-ready CBSE answers instantly."
        />
        <meta
          name="twitter:image"
          content="https://lastminutepreparation.in/og-ask-any.png"
        />
      </Helmet>

      <Navbar />

      <div className="container mx-auto px-4 py-20 max-w-6xl">

        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 mb-4">
            <MessageCircle className="text-emerald-500" size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-2">Ask Any Question</h1>
          <p className="text-muted-foreground text-lg">Your personal AI that converts any question into a full-mark, board-format answer.</p>
        </div>

        {/* INPUT */}
        <Card className="p-6 mb-6 shadow-lg border-2">
          <label className="block text-sm font-medium mb-2">Your Question</label>
          <Textarea
            placeholder="Type your question here... (Press Enter to submit, Shift+Enter for new line)"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={4}
            disabled={loading}
            className="resize-none"
          />

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors"
            >
              <Upload className="mx-auto mb-2 text-muted-foreground" size={32} />
              <p className="text-sm font-medium mb-1">Upload Question Image</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, GIF or WebP (Max 15MB)</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between p-4 bg-background/80 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                    <FileImage className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{image.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(image.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleRemoveImage}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-lg overflow-hidden border border-border bg-background/50 p-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto max-h-96 object-contain rounded"
                />
              </div>
            </div>
          )}

          <Button className="w-full mt-4" onClick={handleAsk} disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
            Get Answer
          </Button>
        </Card>

        {/* RESULT */}
        {response && (
          <Card className="p-6 shadow-lg border-2">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Bot className="text-emerald-500" size={20} />
                </div>
                <h3 className="font-semibold text-xl">AI Answer</h3>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCopy} size="sm" variant="outline">
                  <Copy className="mr-1" size={16} /> Copy
                </Button>
                <Button onClick={handleClear} size="sm" variant="outline">
                  <Trash2 className="mr-1" size={16} /> Clear
                </Button>
              </div>
            </div>

            <AIOutput content={response.answer} />
          </Card>
        )}

      </div>
      <AskAnyLoader stepLabel="1" showLoader={loading}/>
      <Footer />
    </div>
  );
}