import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { FileText, Upload, Send, Loader2, Bot, User, Download, BookmarkPlus, Trash2, FileCheck } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWithPDF() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingPDF, setProcessingPDF] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }

      setProcessingPDF(true);
      setPdfFile(file);
      
      setTimeout(() => {
        setProcessingPDF(false);
        toast.success(`PDF "${file.name}" uploaded successfully!`);
        setChatHistory([
          {
            role: "assistant",
            content: `Great! I've loaded "${file.name}". I can help you with:\n\n• Summarizing chapters or sections\n• Answering specific questions about the content\n• Generating key points and important notes\n• Explaining complex concepts\n• Creating study guides\n\nWhat would you like to know?`,
          },
        ]);
      }, 2000);
    }
  };

  const handleSend = async () => {
    if (!pdfFile) {
      toast.error("Please upload a PDF first");
      return;
    }
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: message,
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    setTimeout(() => {
      const responses = [
        `Based on the content of "${pdfFile.name}", here's what I found:\n\n📌 Key Points:\n• This section discusses fundamental concepts\n• Important formulas and definitions are highlighted\n• Practical applications are demonstrated\n\n💡 Summary:\nThe material covers essential topics with clear explanations and examples. Would you like me to elaborate on any specific point?`,
        
        `I've analyzed that section from "${pdfFile.name}":\n\n🎯 Main Concepts:\n1. Core principle explained with context\n2. Step-by-step methodology outlined\n3. Real-world applications provided\n\n📊 Important Details:\nThe document provides comprehensive coverage with supporting evidence and examples. Any specific questions about this?`,
        
        `Here's what I found in "${pdfFile.name}":\n\n✅ Summary:\nThis chapter introduces key theories and practical implementations. It includes detailed explanations, diagrams, and case studies.\n\n🔍 Notable Points:\n• Critical terminology defined\n• Mathematical relationships explained\n• Common misconceptions clarified\n\nWould you like a more detailed breakdown?`,
      ];

      const aiResponse: ChatMessage = {
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
      };

      setChatHistory((prev) => [...prev, aiResponse]);
      setLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: string) => {
    if (!pdfFile) {
      toast.error("Please upload a PDF first");
      return;
    }
    setMessage(action);
  };

  const handleDownloadNotes = () => {
    if (chatHistory.length === 0) {
      toast.error("No chat history to download");
      return;
    }
    toast.success("Notes downloaded! (Feature coming soon)");
  };

  const handleBookmark = () => {
    toast.success("Conversation bookmarked! (Feature coming soon)");
  };

  const handleClearChat = () => {
    setChatHistory([]);
    toast.success("Chat history cleared");
  };

  const handleRemovePDF = () => {
    setPdfFile(null);
    setChatHistory([]);
    toast.success("PDF removed");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold">
            Chat with{" "}
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Your PDF
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload any PDF and have an intelligent conversation about its content
          </p>
        </div>

        {!pdfFile ? (
          <Card className="p-12 bg-card/50 border-border/50 backdrop-blur-sm text-center max-w-2xl mx-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleUpload}
              className="hidden"
            />
            
            <div className="mb-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Upload Your PDF</h2>
              <p className="text-muted-foreground">
                Textbooks, research papers, manuals, notes, eBooks - any PDF works!
              </p>
            </div>

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={processingPDF}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 text-lg px-8 py-6"
            >
              {processingPDF ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing PDF...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Browse PDF File
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              Maximum file size: 50MB | Supported format: PDF
            </p>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <FileCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{pdfFile.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleRemovePDF}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </Card>

              <Card className="flex flex-col bg-card/50 border-border/50 backdrop-blur-sm" style={{ height: "600px" }}>
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">AI Chat Assistant</h2>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleBookmark}
                      variant="outline"
                      size="sm"
                    >
                      <BookmarkPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleDownloadNotes}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleClearChat}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed text-sm">
                          {msg.content}
                        </p>
                      </div>

                      {msg.role === "user" && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="bg-secondary rounded-2xl px-4 py-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-border/50 p-4 bg-card/30">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask anything about your PDF..."
                      className="flex-1 bg-background/50"
                      disabled={loading}
                    />
                    
                    <Button
                      onClick={handleSend}
                      size="icon"
                      className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 flex-shrink-0"
                      disabled={loading || !message.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Quick Actions</h2>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleQuickAction("Summarize the entire document")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    📄 Summarize Document
                  </Button>

                  <Button
                    onClick={() => handleQuickAction("Give me key points from this PDF")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    🎯 Extract Key Points
                  </Button>

                  <Button
                    onClick={() => handleQuickAction("Create a study guide from this content")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    📚 Generate Study Guide
                  </Button>

                  <Button
                    onClick={() => handleQuickAction("Explain the main concepts in simple terms")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    💡 Explain Concepts
                  </Button>

                  <Button
                    onClick={() => handleQuickAction("List important formulas and definitions")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    📐 Formulas & Definitions
                  </Button>

                  <Button
                    onClick={() => handleQuickAction("Generate practice questions from this material")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    ❓ Create Questions
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                  <h3 className="font-semibold mb-2 text-sm">💡 Pro Tips</h3>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Be specific with page numbers</li>
                    <li>• Ask for examples or analogies</li>
                    <li>• Request step-by-step explanations</li>
                    <li>• Save important answers</li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}