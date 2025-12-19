import { Card } from "@/components/ui/card";
import { Upload, Brain, FileQuestion, Calendar, Image as ImageIcon, Zap } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Easy Upload",
    description: "Upload PDFs, images, or screenshots. We handle the rest with intelligent text extraction.",
  },
  {
    icon: Brain,
    title: "AI Summaries",
    description: "Get concise, bullet-point summaries highlighting key concepts from your notes instantly.",
  },
  {
    icon: ImageIcon,
    title: "Diagram Analysis",
    description: "Extract text from images and analyze diagrams, charts, or tables automatically.",
  },
  {
    icon: FileQuestion,
    title: "Question Generation",
    description: "Generate board-style questions from your notes to test your understanding.",
  },
  {
    icon: Calendar,
    title: "Previous Year Question Papers",
    description: "Get previous 10 years Question Papers to score 99% in your boards.",
  },
  {
    icon: Zap,
    title: "Chat With PDF",
    description: "AI-powered conversations with your PDFs.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Excel
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful AI features designed to transform how you study and retain information.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:border-primary/50 group"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-primary group-hover:glow-primary transition-all duration-300">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
