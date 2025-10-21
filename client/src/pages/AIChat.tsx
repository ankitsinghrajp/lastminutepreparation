import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Send, Upload, Loader2, FileText, User, Bot } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChat() {
  const location = useLocation();
  const featureTitle = location.state?.feature || "AI Assistant";
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm your AI study assistant for ${featureTitle}. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setUploadedFile(file);
      toast.success(`File "${file.name}" uploaded successfully`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !uploadedFile) return;

    const userMessage: Message = {
      role: "user",
      content: uploadedFile 
        ? `[Uploaded: ${uploadedFile.name}] ${input}` 
        : input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (replace with actual AI integration later)
    setTimeout(() => {
      const aiResponse: Message = {
        role: "assistant",
        content: `I understand you're working on "${featureTitle}". ${
          uploadedFile 
            ? `I've analyzed your file "${uploadedFile.name}". ` 
            : ""
        }Here's what I can help you with:\n\n• Key concepts and explanations\n• Practice questions\n• Summary of important points\n• Clarification of doubts\n\nWhat specific aspect would you like to explore?`,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
      setUploadedFile(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-24 flex flex-col max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{featureTitle}</h1>
          <p className="text-muted-foreground">
            AI-powered assistance for your studies
          </p>
        </div>

        <Card className="flex-1 flex flex-col bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "gradient-primary text-white"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
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
            {uploadedFile && (
              <div className="mb-3 flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary">{uploadedFile.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto h-6 w-6 p-0"
                  onClick={() => setUploadedFile(null)}
                >
                  ×
                </Button>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0"
              >
                <Upload className="h-5 w-5" />
              </Button>
              
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your studies..."
                className="flex-1 bg-background/50"
                disabled={isLoading}
              />
              
              <Button
                type="submit"
                size="icon"
                className="gradient-primary border-0 flex-shrink-0"
                disabled={isLoading || (!input.trim() && !uploadedFile)}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
