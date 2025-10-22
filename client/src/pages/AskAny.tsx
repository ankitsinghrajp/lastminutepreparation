import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { MessageCircle, Upload, Loader2, Bot, Image as ImageIcon, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AskAnyQuestion() {
  const [question, setQuestion] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success(`Image "${file.name}" uploaded successfully!`);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Image removed");
  };

  const handleAsk = async () => {
    if (!question.trim() && !imageFile) {
      toast.error("Please enter a question or upload an image");
      return;
    }

    setLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const responses = [
        `Based on your question${imageFile ? ' and the uploaded image' : ''}, here's a comprehensive answer:\n\n📌 Key Points:\n• The concept you're asking about is fundamental to understanding this topic\n• There are multiple approaches to solving this problem\n• The most efficient method involves breaking it down into smaller steps\n\n💡 Detailed Explanation:\nTo fully understand this, let's examine the core principles. The relationship between the different elements shows that there's a clear pattern emerging. This pattern can be applied to similar situations.\n\n✅ Practical Application:\nIn real-world scenarios, this knowledge can be used to solve complex problems efficiently. The key is to recognize the underlying structure and apply the appropriate techniques.\n\n🎯 Additional Tips:\n• Always verify your understanding with examples\n• Practice similar problems to reinforce learning\n• Don't hesitate to break complex concepts into simpler parts\n\nWould you like me to elaborate on any specific aspect?`,
        
        `Great question${imageFile ? ' with the visual reference' : ''}! Let me break this down for you:\n\n🔍 Analysis:\nThis topic requires understanding several interconnected concepts. The foundation lies in grasping the basic principles before moving to advanced applications.\n\n📊 Step-by-Step Breakdown:\n1. First, identify the core components of your question\n2. Understand how these components interact with each other\n3. Apply the relevant formulas or methodologies\n4. Verify your results against known patterns\n\n💭 Deeper Insights:\nWhat makes this particularly interesting is how it connects to broader theoretical frameworks. The implications extend beyond the immediate question to encompass related areas of study.\n\n⚡ Quick Summary:\nThe answer involves recognizing patterns, applying systematic approaches, and validating results. This methodology can be adapted to similar challenges you might encounter.\n\nNeed clarification on any part?`,
        
        `Excellent question${imageFile ? '! The image you provided helps illustrate the concept' : ''}:\n\n🎯 Direct Answer:\nThe solution to your question involves understanding both the theoretical foundation and practical implementation. Let me explain both aspects.\n\n📚 Theoretical Foundation:\nThe underlying principles are based on established theories that have been proven through extensive research and application. These principles form the backbone of how we approach such problems.\n\n🛠️ Practical Implementation:\nIn practice, you would:\n• Start by analyzing the given information\n• Apply the appropriate formulas or methods\n• Cross-check your results\n• Optimize the solution for efficiency\n\n🌟 Expert Tips:\nProfessionals in this field recommend focusing on understanding the 'why' behind each step rather than just memorizing procedures. This deeper understanding enables you to adapt the knowledge to new situations.\n\n✨ Conclusion:\nThis concept is more straightforward than it might initially appear. With practice and the right approach, you'll master it quickly.\n\nWant me to provide specific examples?`,
      ];

      const aiResponse = responses[Math.floor(Math.random() * responses.length)];
      setAnswer(aiResponse);
      setLoading(false);
      toast.success("Answer generated successfully!");
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold">
            Ask{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Any Question
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get instant AI-powered answers to any question with text or image support
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Your Question</h2>
              </div>

              <div className="space-y-4">
                <Textarea
                  placeholder="Type your question here... (Ctrl + Enter to ask)"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={6}
                  className="resize-none bg-background/50 focus:ring-2 focus:ring-emerald-500"
                />

                {imagePreview && (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Uploaded preview"
                      className="max-w-xs max-h-48 rounded-lg border-2 border-border"
                    />
                    <Button
                      onClick={handleRemoveImage}
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      {imageFile?.name}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="flex-none"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>

                  <Button
                    onClick={handleAsk}
                    disabled={loading || (!question.trim() && !imageFile)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 flex-1 min-w-[200px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Thinking...
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4 mr-2" />
                        Ask AI
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  💡 Tip: Be specific with your questions for better answers. You can upload images of problems, diagrams, or any visual content.
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="h-5 w-5 text-emerald-500" />
                <h2 className="text-xl font-semibold">AI Answer</h2>
              </div>
              
              <div className="bg-background/80 rounded-lg p-6 min-h-[400px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mb-4" />
                    <p className="text-muted-foreground">Analyzing your question...</p>
                  </div>
                ) : answer ? (
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap leading-relaxed font-sans text-sm">
                      {answer}
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Bot className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg">AI-generated answer will appear here</p>
                    <p className="text-sm mt-2">Ask any question - academic, technical, general knowledge, or anything else!</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">How It Works</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/20">
                  <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs">1</span>
                    Type Your Question
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ask anything - math problems, science concepts, essay questions, coding doubts, or general queries
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/20">
                  <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs">2</span>
                    Add Images (Optional)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Upload photos of problems, diagrams, handwritten notes, or any visual content that helps explain your question
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/20">
                  <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs">3</span>
                    Get Instant Answers
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Receive detailed, step-by-step explanations with examples, formulas, and practical tips
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
                <h3 className="font-semibold mb-3 text-sm">✨ Example Questions</h3>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>• "Explain photosynthesis in simple terms"</li>
                  <li>• "Solve this calculus problem: ∫x²dx"</li>
                  <li>• "What's the difference between DNA and RNA?"</li>
                  <li>• "How does Newton's third law work?"</li>
                  <li>• "Explain blockchain technology"</li>
                  <li>• "Help me understand this diagram"</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/20">
                <h3 className="font-semibold mb-2 text-sm">🎯 Pro Tips</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Be specific with your questions</li>
                  <li>• Include context if needed</li>
                  <li>• Upload clear, well-lit images</li>
                  <li>• Use Ctrl + Enter for quick submission</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}