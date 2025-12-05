import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageCircle, Loader2, Bot, User, Upload, X, FileText, Send, Sparkles } from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";
import { Navbar } from "@/components/Navbar";
import { server } from "@/constants";

/* ===================== AI OUTPUT ===================== */
const AIOutput = ({ content }) => {
  if (!content) return null;

  return (
    <div className="prose prose-sm sm:prose-base max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

/* ===================== FOOTER ===================== */
const Footer = () => (
  <footer className="border-t py-4 bg-background">
    <div className="container mx-auto px-4 text-center">
      <p className="text-xs text-muted-foreground">
        Powered by AI • Upload responsibly • Keep documents private
      </p>
    </div>
  </footer>
);

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <Navbar/>

      <div className="flex-1 container pt-16 mx-auto px-3 sm:px-4 max-w-6xl flex flex-col overflow-hidden">
        {!pdf ? (
          /* ===================== UPLOAD SCREEN ===================== */
          <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full py-8">
            <div className="text-center mb-6 sm:mb-8 lg:mb-10 px-4">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 mb-4 sm:mb-5">
                <MessageCircle className="text-emerald-600" size={28} />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-foreground">
                Chat With PDF
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Upload any PDF document and have an intelligent conversation with it. Ask questions and get instant answers.
              </p>
            </div>

            <Card className="p-4 sm:p-6 lg:p-8 shadow-sm border">
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
                className={`border-2 border-dashed rounded-xl p-8 sm:p-10 lg:p-14 text-center cursor-pointer transition-all duration-200 ${
                  uploading 
                    ? "opacity-50 cursor-not-allowed border-muted" 
                    : "hover:border-emerald-500 hover:bg-emerald-50/30 border-muted-foreground/20"
                }`}
              >
                {uploading ? (
                  <div className="space-y-3">
                    <Loader2 className="mx-auto text-emerald-600 animate-spin" size={36} />
                    <div>
                      <p className="text-base sm:text-lg font-semibold mb-1">Uploading PDF...</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Please wait while we process your file</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Upload className="text-emerald-600" size={24} />
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-semibold mb-1 text-foreground">
                        Click to upload PDF
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Maximum file size: 15MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8 lg:mt-10">
              {[
                { icon: MessageCircle, title: "Natural Chat", desc: "Conversational interface" },
                { icon: Sparkles, title: "AI Powered", desc: "Accurate responses" },
                { icon: FileText, title: "Unlimited", desc: "Ask anything" },
              ].map((feature, i) => (
                <Card key={i} className="p-4 sm:p-5 text-center hover:shadow-md transition-shadow border bg-card">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                    <feature.icon className="text-emerald-600" size={20} />
                  </div>
                  <h4 className="font-semibold mb-1 text-sm sm:text-base text-foreground">
                    {feature.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* ===================== CHAT SCREEN ===================== */
          <div className="flex-1 flex flex-col h-full overflow-hidden py-4">
            {/* PDF Info Header - Fixed */}
            <Card className="p-3 sm:p-4 mb-3 sm:mb-4 shadow-sm border flex-shrink-0">
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs sm:text-sm truncate text-foreground">
                      {pdf.name}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {(pdf.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleRemovePdf}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-50 hover:text-red-600 flex-shrink-0 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* Messages Container - Scrollable */}
            <Card className="flex-1 p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 overflow-y-auto shadow-sm border bg-card flex flex-col">
              <div className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center px-4">
                    <div className="space-y-3">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Sparkles className="text-emerald-600" size={24} />
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base mb-1 text-foreground">
                          Ready to chat
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Ask me anything about your document
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-2 sm:gap-3 ${
                          message.type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                      
                        
                        <div
                          className={`max-w-[85%] sm:max-w-[80%] lg:max-w-[75%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                            message.type === "user"
                              ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                              : "bg-muted border"
                          }`}
                        >
                          {message.type === "user" ? (
                            <p className="text-xs sm:text-sm leading-relaxed break-words">
                              {message.content}
                            </p>
                          ) : (
                            <div className="text-xs sm:text-sm">
                              <AIOutput content={message.content} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {loading && (
                      <div className="flex gap-2 sm:gap-3 justify-start">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="text-emerald-600" size={16} />
                        </div>
                        <div className="bg-muted border rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
                          <div className="flex gap-2 items-center">
                            <Loader2 className="animate-spin text-emerald-600" size={16} />
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              Analyzing...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </Card>

            {/* Input Area - Fixed */}
            <Card className="p-3 sm:p-4 shadow-sm border flex-shrink-0">
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  placeholder="Ask a question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={1}
                  disabled={loading}
                  className="resize-none min-h-[40px] sm:min-h-[44px] max-h-[100px] text-xs sm:text-sm"
                />
                <Button
                  onClick={handleAsk}
                  disabled={loading || !question.trim()}
                  size="icon"
                  className="h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}