import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  Loader2,
  Bot,
  Upload,
  X,
  FileText,
  Sparkles,
  CheckCircle2,
  User,
  ArrowUp,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import { server } from "@/constants";
import { toast } from "sonner";
import { useSelector } from "react-redux";

/* ===================== AI OUTPUT ===================== */
const AIOutput = ({ content }) => {
  if (!content) return null;

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-slate [&>*]:mb-3 [&>ul]:mb-4 [&>ol]:mb-4 [&>li]:mb-1.5 [&>p]:mb-3 [&>h1]:mt-5 [&>h1]:mb-3 [&>h1]:text-xl [&>h1]:font-bold [&>h2]:mt-4 [&>h2]:mb-2.5 [&>h2]:text-lg [&>h2]:font-semibold [&>h3]:mt-3 [&>h3]:mb-2 [&>h3]:text-base [&>h3]:font-semibold [&>hr]:my-4 [&>pre]:my-4 [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:bg-slate-900 [&>pre]:border [&>pre]:border-slate-800 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:bg-slate-800/50 [&>code]:text-orange-400 [&>code]:text-sm [&>pre>code]:p-0 [&>pre>code]:bg-transparent">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

/* ===================== MAIN COMPONENT ===================== */
export default function ChatWithPDF() {
  const [pdf, setPdf] = useState(null);
  const [pdfId, setPdfId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

    const {user} = useSelector((state)=>state.auth)
    

  const pollUploadPdf = async (file, maxRetries = 5) => {
  const formData = new FormData();
  formData.append("pdf", file);

  for (let i = 0; i < maxRetries; i++) {
    const res = await fetch(`${server}/api/v1/ai/upload-pdf`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await res.json();

    // ✅ Final result received
    if (data?.data?.pdfId) {
      return data.data.pdfId;
    }

    // ⏳ Still processing → wait 2s
    await new Promise((r) => setTimeout(r, 7000));
  }

  throw new Error("The pdf is corrupted or not readable try different.");
};


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [question]);

const handlePdfUpload = async (e) => {

  if(user.planType === "FREE"){
    toast.error("Premium feature only. If recently subscribed logout and login again");
    return;
  }
  const file = e.target.files?.[0];
  if (!file || file.type !== "application/pdf") {
    toast.error("Please upload a valid PDF file");
    return;
  }

  if (file.size > 15 * 1024 * 1024) {
    toast.error("File size must be less than 15MB");
    return;
  }

  setUploading(true);

  try {
    const pdfId = await pollUploadPdf(file);

    setPdf(file);
    setPdfId(pdfId);
    setMessages([]);

    toast.success("PDF processed successfully");
  } catch (err) {
    toast.error(err.message || "PDF processing failed");
    fileInputRef.current.value = "";
  } finally {
    setUploading(false);
  }
};

  const handleRemovePdf = () => {
    setPdf(null);
    setPdfId(null);
    setMessages([]);
    setQuestion("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAsk = async () => {
    if (!pdfId) {
      alert("Please upload a PDF first");
      return;
    }

    if (!question.trim()) {
      return;
    }

    const userMessage = {
      type: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuestion = question;
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch(`${server}/api/v1/ai/chat-with-pdf`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
          pdfId: pdfId,
        }),
      });

      const response = await res.json();

      if (response?.data?.answer) {
        const aiMessage = {
          type: "ai",
          content: response.data.answer,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          type: "ai",
          content:
            "Sorry, I couldn't process your question. Please try again.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        type: "ai",
        content:
          "An error occurred while processing your request. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {!pdf ? (
        /* ===================== UPLOAD SCREEN ===================== */
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center px-4 py-8 sm:py-12">
            <div className="w-full max-w-2xl space-y-8 sm:space-y-10">
              {/* Header */}
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 shadow-2xl shadow-orange-500/20">
                  <FileText className="text-white" size={36} />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                     AI PDF Assistant
                  </h1>
                  <p className="text-base sm:text-lg text-slate-400 max-w-lg mx-auto px-4">
                    Upload your document and chat with it using advanced AI
                  </p>
                </div>
              </div>

              {/* Upload Area */}
              <div className="px-4 sm:px-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                  disabled={uploading}
                />

                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`relative overflow-hidden border-2 border-dashed rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center transition-all backdrop-blur-sm ${
                    uploading
                      ? "opacity-60 cursor-not-allowed border-slate-700 bg-slate-900/40"
                      : "cursor-pointer hover:border-orange-500 border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 hover:shadow-xl hover:shadow-orange-500/10 active:scale-[0.99]"
                  }`}
                >
                  {uploading ? (
                    <div className="space-y-4 sm:space-y-5">
                      <div className="relative">
                        <Loader2
                          className="mx-auto text-orange-500 animate-spin"
                          size={48}
                        />
                        <div className="absolute inset-0 blur-xl bg-orange-500/20 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-lg sm:text-xl font-semibold text-white mb-2">
                          Processing your PDF
                        </p>
                        <p className="text-sm text-slate-400">
                          This will only take a moment...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-5">
                      <div className="relative inline-block">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                          <Upload className="text-white" size={28} />
                        </div>
                        <div className="absolute -inset-2 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-2xl blur-xl -z-10" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-base sm:text-lg font-semibold text-white">
                          Drop your PDF here or tap to browse
                        </p>
                        <p className="text-sm text-slate-400">
                          Max 15MB • Secure & Private
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 px-4 sm:px-0">
                {[
                  {
                    icon: Sparkles,
                    title: "AI-Powered",
                    desc: "Advanced language models",
                  },
                  {
                    icon: CheckCircle2,
                    title: "Accurate",
                    desc: "Context-aware responses",
                  },
                  {
                    icon: MessageCircle,
                    title: "Interactive",
                    desc: "Natural conversation",
                  },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="relative group p-5 sm:p-6 text-center rounded-xl sm:rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm hover:bg-slate-900/60 hover:border-slate-700 transition-all hover:scale-[1.02] active:scale-100"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 mx-auto rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-shadow">
                      <feature.icon className="text-white" size={20} />
                    </div>
                    <h4 className="font-semibold mb-1.5 text-white text-sm sm:text-base">
                      {feature.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-400">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ===================== CHAT SCREEN ===================== */
        <div className="flex flex-col h-full">
          {/* Fixed Header */}
          <div className="flex-shrink-0 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold truncate text-sm sm:text-base text-white">
                    {pdf.name}
                  </h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 sm:gap-2">
                    <span>{(pdf.size / 1024 / 1024).toFixed(1)} MB</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    <CheckCircle2 size={12} className="text-green-500" />
                    <span>Ready</span>
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRemovePdf}
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-red-500/10 hover:text-red-400 flex-shrink-0 rounded-lg sm:rounded-xl transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center text-center py-12 sm:py-20 px-4">
                  <div className="space-y-4 sm:space-y-6 max-w-md">
                    <div className="relative inline-block">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/20 flex items-center justify-center">
                        <MessageCircle className="text-orange-400" size={28} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg sm:text-xl font-semibold text-white">
                        Start the conversation
                      </p>
                      <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                        Ask anything about your document and get intelligent,
                        context-aware answers
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-2 sm:gap-3 ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.type === "ai" && (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
                          <Bot className="text-white" size={16} />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3.5 py-3 sm:px-4 sm:py-3.5 shadow-lg ${
                          message.type === "user"
                            ? "bg-gradient-to-br from-orange-500 to-red-600 text-white"
                            : "bg-slate-800/50 backdrop-blur-sm border border-slate-700"
                        }`}
                      >
                        {message.type === "user" ? (
                          <p className="text-sm leading-relaxed break-words">
                            {message.content}
                          </p>
                        ) : (
                          <div className="text-sm text-slate-100">
                            <AIOutput content={message.content} />
                          </div>
                        )}
                      </div>

                      {message.type === "user" && (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="text-slate-300" size={16} />
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex gap-2 sm:gap-3 justify-start">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
                        <Bot className="text-white" size={16} />
                      </div>
                      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl px-4 py-3 shadow-lg">
                        <div className="flex gap-2.5 items-center">
                          <Loader2
                            className="animate-spin text-orange-400"
                            size={16}
                          />
                          <span className="text-sm text-slate-300">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Fixed Input Bar */}
          <div className="flex-shrink-0 bg-slate-900/80 backdrop-blur-lg border-t border-slate-800 px-3 sm:px-4 py-3 sm:py-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Ask about your PDF..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className="resize-none min-h-[44px] max-h-[120px] text-sm rounded-xl sm:rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 border-2 border-slate-700 focus:border-orange-500 focus:ring-0 bg-slate-800/50 backdrop-blur-sm text-white placeholder:text-slate-500 shadow-sm disabled:opacity-60 transition-colors"
                    style={{ height: "44px" }}
                  />
                </div>

                <Button
                  onClick={handleAsk}
                  disabled={loading || !question.trim()}
                  size="icon"
                  className="h-11 w-11 flex-shrink-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-orange-500/20 transition-all active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <ArrowUp className="h-5 w-5 text-white" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}