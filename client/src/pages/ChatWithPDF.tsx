import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageCircle, Loader2, Bot, Upload, X, FileText, Send, Sparkles, CheckCircle2 } from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";
import { server } from "@/constants";

/* ===================== AI OUTPUT ===================== */
const AIOutput = ({ content }) => {
  if (!content) return null;

  return (
    <div
      className="
        max-w-none 
        text-sm 
        leading-relaxed 
        text-slate-100

        [&>*]:mb-4
        [&>ul]:mb-5
        [&>ol]:mb-5
        [&>li]:mb-2
        [&>p]:mb-4
        [&>h1]:mt-6 [&>h1]:mb-3
        [&>h2]:mt-6 [&>h2]:mb-3
        [&>h3]:mt-5 [&>h3]:mb-2

        [&>hr]:my-6

        [&>pre]:my-5
        [&>pre]:p-4
        [&>pre]:rounded-xl
        [&>pre]:bg-slate-900

        [&>code]:px-1
        [&>code]:py-0.5
        [&>code]:rounded-md
        [&>code]:bg-slate-800

        dark:text-slate-100
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert("File size must be less than 15MB");
      return;
    }

    setUploading(true);

    try {
      const formdata = new FormData();
      formdata.append("pdf", file);

      const res = await fetch(`${server}/api/v1/ai/upload-pdf`, {
        method: "POST",
        credentials: "include",
        body: formdata,
      });

      const response = await res.json();

      if (response?.data?.pdfId) {
        setPdf(file);
        setPdfId(response.data.pdfId);
        setMessages([]);
      } else {
        alert("Failed to upload PDF. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred while uploading the PDF. Please try again.");
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
          content: "Sorry, I couldn't process your question. Please try again.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        type: "ai",
        content: "An error occurred while processing your request. Please try again.",
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
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
   

      {!pdf ? (
        /* ===================== UPLOAD SCREEN ===================== */
        <div className="flex-1 overflow-y-scroll no-scrollbar">
          <div className="min-h-full flex flex-col justify-center px-4 py-12 pt-24">
            <div className="max-w-2xl mx-auto w-full space-y-10">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 shadow-2xl shadow-orange-500/30 mb-2">
                  <FileText className="text-white" size={40} />
                </div>
                <div>
                  <h1 className="text-4xl sm:text-5xl font-bold mb-3">
                    AI-Powered PDF Assistant
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                    Upload your document and get instant, intelligent answers to any question
                  </p>
                </div>
              </div>

              {/* Upload Area */}
              <Card className="border shadow-xl bg-card backdrop-blur-sm">
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
                  className={`border-2 border-dashed rounded-2xl p-12 m-6 text-center transition-all ${
                    uploading 
                      ? "opacity-50 cursor-not-allowed border-border" 
                      : "cursor-pointer hover:border-orange-500 hover:bg-orange-500/5 border-border hover:shadow-lg"
                  }`}
                >
                  {uploading ? (
                    <div className="space-y-4">
                      <Loader2 className="mx-auto text-orange-500 animate-spin" size={48} />
                      <div>
                        <p className="text-lg font-semibold">Uploading your PDF...</p>
                        <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                        <Upload className="text-white" size={28} />
                      </div>
                      <div>
                        <p className="text-lg font-semibold mb-2">
                          Drop your PDF here or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supports files up to 15MB • Secure and private
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Features */}
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { icon: Sparkles, title: "AI-Powered", desc: "Advanced natural language understanding" },
                  { icon: CheckCircle2, title: "Accurate", desc: "Context-aware responses" },
                  { icon: MessageCircle, title: "Interactive", desc: "Conversational interface" },
                ].map((feature, i) => (
                  <Card key={i} className="p-6 text-center border shadow-lg bg-card backdrop-blur-sm hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-3 shadow-md">
                      <feature.icon className="text-white" size={20} />
                    </div>
                    <h4 className="font-semibold mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.desc}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ===================== CHAT SCREEN ===================== */
        <>
          {/* Fixed Header with PDF Info */}
          <div className="flex-shrink-0 bg-background backdrop-blur-md border-b border-border px-4 py-4 shadow-sm">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-md">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold truncate">
                    {pdf.name}
                  </h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{(pdf.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-green-600" />
                      Ready
                    </span>
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRemovePdf}
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Scrollable Messages Container */}
          <div className="flex-1 overflow-y-scroll no-scrollbar px-4 py-8 ">
            <div className="max-w-6xl mx-auto space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center py-20">
                  <div className="space-y-6 max-w-md">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 flex items-center justify-center">
                      <MessageCircle className="text-orange-500" size={32} />
                    </div>
                    <div>
                      <p className="text-xl font-semibold mb-3">
                        Start a conversation
                      </p>
                      <p className="text-muted-foreground">
                        Ask any question about your PDF document and receive detailed, accurate answers powered by AI
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.type === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                   
                      
                      <div
                        className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-md ${
                          message.type === "user"
                            ? "bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-tr-sm"
                            : "bg-card border border-border rounded-tl-sm"
                        }`}
                      >
                        {message.type === "user" ? (
                          <p className="text-sm leading-relaxed break-words">
                            {message.content}
                          </p>
                        ) : (
                          <div className="text-sm">
                            <AIOutput content={message.content} />
                          </div>
                        )}
                       
                      </div>

                    </div>
                  ))}

                  {loading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-md">
                        <Bot className="text-white" size={18} />
                      </div>
                      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-5 py-4 shadow-md">
                        <div className="flex gap-3 items-center">
                          <Loader2 className="animate-spin text-orange-500" size={18} />
                          <span className="text-sm text-muted-foreground">
                            Analyzing your document...
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

          {/* Fixed Input Bar at Bottom */}
          <div className="flex-shrink-0 bg-background backdrop-blur-md border-t border-border px-4 py-5 shadow-lg">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3 items-end">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="icon"
                  disabled={uploading}
                  className="h-12 w-12 flex-shrink-0 rounded-xl hover:bg-muted border-input"
                >
                  <Upload className="h-5 w-5" />
                </Button>
                
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Ask a question about your PDF..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows={1}
                    disabled={loading}
                    className="resize-none min-h-[48px] max-h-[120px] text-sm rounded-xl px-4 py-3 border-2 border-input focus:border-orange-500 focus:ring-0 bg-background shadow-sm"
                  />
                </div>
                
                <Button
                  onClick={handleAsk}
                  disabled={loading || !question.trim()}
                  size="icon"
                  className="h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Send className="h-5 w-5 text-white" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}