import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Sparkles, Loader2 } from "lucide-react";

const sampleQuestions = [
  "Explain photosynthesis in simple terms",
  "What is the Pythagorean theorem?",
  "How does Newton's third law work?",
  "Explain the water cycle",
];

interface QAPair {
  question: string;
  answer: string;
}

export default function QAInterface() {
  const [question, setQuestion] = useState("");
  const [qaHistory, setQaHistory] = useState<QAPair[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    const currentQuestion = question;
    setQuestion("");

    // Simulate AI response (replace with actual AI integration later)
    setTimeout(() => {
      const aiAnswer = `Here's a comprehensive answer to your question: "${currentQuestion}"\n\n` +
        `This is a simulated response. In the production version, this will be powered by advanced AI models that will provide detailed, accurate answers to your questions.\n\n` +
        `Key points:\n• Detailed explanation of the concept\n• Real-world examples\n• Related topics to explore\n• Practice questions for better understanding\n\n` +
        `Feel free to ask follow-up questions for more clarity!`;

      setQaHistory((prev) => [
        ...prev,
        { question: currentQuestion, answer: aiAnswer },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSampleQuestion = (sampleQ: string) => {
    setQuestion(sampleQ);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 max-w-5xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Q&A</span>
          </div>
          
          <h1 className="text-5xl font-bold">
            Ask Any{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Academic Question
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get instant, detailed answers to all your study questions
          </p>
        </div>

        <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here... (e.g., What is quantum mechanics?)"
              className="min-h-[120px] bg-background/50 text-lg"
              disabled={isLoading}
            />
            
            <Button
              type="submit"
              className="w-full gradient-primary border-0 h-12 text-lg glow-primary"
              disabled={isLoading || !question.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Getting Answer...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get AI Answer
                </>
              )}
            </Button>
          </form>

          {qaHistory.length === 0 && (
            <div className="mt-8">
              <p className="text-sm text-muted-foreground mb-4">Try these sample questions:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sampleQuestions.map((q, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto py-3 px-4 text-left justify-start border-primary/30 hover:bg-primary/10"
                    onClick={() => handleSampleQuestion(q)}
                  >
                    <span className="text-sm">{q}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          {qaHistory.map((qa, index) => (
            <Card
              key={index}
              className="p-6 bg-card/50 border-border/50 backdrop-blur-sm space-y-4"
            >
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-sm font-semibold">Q</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-foreground">
                      {qa.question}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/30 pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {qa.answer}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
