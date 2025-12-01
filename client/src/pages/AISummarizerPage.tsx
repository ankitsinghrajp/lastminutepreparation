import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Sparkles, Loader2, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAsyncMutation } from "@/hooks/hook";
import { useSummarizerMutation } from "@/redux/api/api";
import AIOutput from "@/components/specifics/AIOutput";

const detailLevels = ["Short", "Medium", "Long"];

export default function AISummarizer() {
  const [topic, setTopic] = useState("");
  const [detailLevel, setDetailLevel] = useState("Medium");
  const [result, setResult] = useState("");
  const [summarizer, isLoading] = useAsyncMutation(useSummarizerMutation);

  const handleSummarize = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setResult("");

    try {
      const formData = new FormData();
      formData.append("topic", topic);
      formData.append("level", detailLevel);

      const response = await summarizer(
        "Generating explanation...",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const aiText =
        response?.data?.data?.data ||
        response?.data?.data?.answer ||
        response?.data?.data ||
        response?.data;

      if (aiText) setResult(aiText);
      else toast.error("No valid response from AI");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast.success("Copied!");
  };

  const handleClear = () => {
    setTopic("");
    setResult("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-3 sm:px-4 py-20 max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold">
            AI Topic{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Summarizer
            </span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg px-2">
            Your quick learning companion for clean, simple and high-quality topic explanations.
          </p>
        </div>

        {/* Input Section */}
        <Card className="p-4 sm:p-6 bg-card/50 border-border/50 backdrop-blur-sm">
          <div className="space-y-3 sm:space-y-4">
            
            {/* Topic Input */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Enter Topic
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis, Ohm's Law, French Revolution"
                className="h-12"
                onKeyDown={(e) => e.key === "Enter" && handleSummarize()}
              />
            </div>

            {/* Level Selector */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Explanation Length
              </label>

              <div className="grid grid-cols-3 gap-2">
                {detailLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setDetailLevel(level)}
                    className={`p-3 rounded-lg text-sm font-medium ${
                      detailLevel === level
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                        : "bg-background/50 border hover:bg-background border-border/50"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleSummarize}
              disabled={isLoading}
              className="w-full h-11 sm:h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Output Section */}
        {result ? (
          <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Copy
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Clear
              </Button>
            </div>

            {/* AI Output */}
            <Card className="p-4 sm:p-6 bg-card/50 border-border/50">
              <AIOutput content={result} />
            </Card>
          </div>
        ) : (
          <div className="mt-6 sm:mt-8">
            <Card className="p-6 sm:p-8 bg-card/50 border-border/50">
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 mb-4">
                    <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-500" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2">How It Works</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Get AI-powered explanations on any topic in seconds
                  </p>
                </div>

                <div className="grid gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-semibold text-sm">
                        1
                      </div>
                      <div>
                        <h3 className="font-medium text-sm sm:text-base">Enter Your Topic</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Type any subject you want to learn about - from science and math to history and literature
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-semibold text-sm">
                        2
                      </div>
                      <div>
                        <h3 className="font-medium text-sm sm:text-base">Choose Detail Level</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Select short for quick overviews, medium for balanced explanations, or long for in-depth coverage
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-semibold text-sm">
                        3
                      </div>
                      <div>
                        <h3 className="font-medium text-sm sm:text-base">Get Clear Explanations</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Receive teacher-style explanations with proper formatting, formulas, and easy-to-understand language
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    Perfect for students, educators, and curious minds seeking quick, accurate explanations
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}