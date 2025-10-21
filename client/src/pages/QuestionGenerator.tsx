import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { FileQuestion, Sparkles, Download } from "lucide-react";

export default function QuestionGenerator() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState("10");
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      const questions = Array.from({ length: parseInt(questionCount) }, (_, i) => 
        `${i + 1}. Sample ${difficulty} difficulty question about ${topic}? Explain in detail.`
      );
      setGeneratedQuestions(questions);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <FileQuestion className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold">Question Generator</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Generate exam-style questions from your study topics
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic / Subject</label>
                  <Textarea
                    placeholder="Enter the topic or paste your notes here..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={6}
                    className="bg-background/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Questions</label>
                    <Select value={questionCount} onValueChange={setQuestionCount}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Questions</SelectItem>
                        <SelectItem value="10">10 Questions</SelectItem>
                        <SelectItem value="15">15 Questions</SelectItem>
                        <SelectItem value="20">20 Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  className="w-full gradient-primary border-0"
                  onClick={handleGenerate}
                  disabled={!topic || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Generated Questions</h3>
                  {generatedQuestions.length > 0 && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {generatedQuestions.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Generated questions will appear here</p>
                    </div>
                  ) : (
                    generatedQuestions.map((question, index) => (
                      <div key={index} className="p-4 bg-background/50 rounded-lg">
                        <p className="text-sm leading-relaxed">{question}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
