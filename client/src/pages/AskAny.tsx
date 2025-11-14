import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { MessageCircle, Loader2, Bot, Award, BookOpen, Copy, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { useAsyncMutation } from "@/hooks/hook";
import { useAskAnyMutation } from "@/redux/api/api";

export default function AskAnyQuestion() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [askAny, askAnyLoading] = useAsyncMutation(useAskAnyMutation);
  
  const handleAsk = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question first!");
      return;
    }
   
    const res = await askAny("Generating best answer...", {question});
    if(res?.data?.data?.data){
      setResponse(res?.data?.data?.data);
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
    
    let fullText = `Question: ${question}\n\n`;
    fullText += `Answer: ${response.answer}\n`;
    if (response.formula) {
      fullText += `\nFormula: ${response.formula}\n`;
    }
    fullText += `\nMarks: ${response.marks}`;
    
    navigator.clipboard.writeText(fullText);
    toast.success("Answer copied to clipboard!");
  };

  const handleClear = () => {
    setQuestion("");
    setResponse(null);
    toast.success("Cleared - Ready for new question");
  };

  // Function to parse bold markdown and return React elements
  const renderTextWithBold = (text) => {
    if (!text) return null;
    
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove the ** markers and wrap in <strong>
        const boldText = part.slice(2, -2);
        return <strong key={index}>{boldText}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20 sm:py-24 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-4">
            <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            Ask{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Any Question
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Get instant AI-powered answers with detailed explanations
          </p>
        </div>

        {/* Input Section - Always Visible */}
        <Card className="p-5 sm:p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Your Question
              </label>
              <Textarea
                placeholder="Type your question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={4}
                className="resize-none text-base"
                disabled={askAnyLoading}
              />
            </div>

            <Button
              onClick={handleAsk}
              disabled={askAnyLoading || !question.trim()}
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium"
            >
              {askAnyLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Answer...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Answer
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        {response && (
          <div className="space-y-4">
            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="h-9"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="h-9"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>

            {/* Answer Card */}
            <Card className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-lg">Answer</h3>
              </div>
              <div className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {renderTextWithBold(response.answer)}
              </div>
            </Card>

            {/* Formula Card (Conditional) */}
            {response.formula && (
              <Card className="p-5 sm:p-6 bg-blue-500/5 border-blue-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="font-semibold">Formula</h3>
                </div>
                <div className="bg-background/50 rounded-lg p-4 border border-blue-500/20">
                  <code className="text-base font-mono text-blue-600 dark:text-blue-400 block overflow-x-auto">
                    {response.formula}
                  </code>
                </div>
              </Card>
            )}

            {/* Marks Card */}
            <Card className="p-5 sm:p-6 bg-amber-500/5 border-amber-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Difficulty Level</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      {response.marks} Marks
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!response && !askAnyLoading && (
          <Card className="p-12 text-center border-dashed">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-lg font-medium mb-2 text-muted-foreground">
              Ready to Help
            </h3>
            <p className="text-sm text-muted-foreground/70">
              Enter your question above to get a detailed answer
            </p>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  );
}