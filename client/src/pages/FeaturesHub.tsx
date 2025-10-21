import { Card } from "@/components/ui/card";
import { FileText, Brain, BookOpen, Clock, FileQuestion, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

const features = [
  {
    icon: FileText,
    title: "Chat with PDF",
    description: "Upload your PDF notes and have an interactive conversation about the content.",
    path: "/ai-chat",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Brain,
    title: "AI Summarizer",
    description: "Get concise, intelligent summaries of your study materials in seconds.",
    path: "/ai-chat",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: BookOpen,
    title: "Understand Topic",
    description: "Deep dive into any topic with AI-powered explanations and examples.",
    path: "/ai-chat",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Clock,
    title: "Last Night Before Exam",
    description: "Quick revision mode with key points and important questions.",
    path: "/ai-chat",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: FileQuestion,
    title: "Question Generator",
    description: "Generate exam-style questions from your study topics and notes.",
    path: "/question-generator",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: MessageSquare,
    title: "Ask Anything",
    description: "General Q&A interface - ask any academic question and get instant answers.",
    path: "/qa-interface",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Brain,
    title: "Revision Planner",
    description: "Create a personalized 7-day study plan tailored to your exam needs.",
    path: "/revision-planner",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: FileText,
    title: "Image Analysis",
    description: "Extract text from images and get AI analysis of diagrams and charts.",
    path: "/image-analysis",
    color: "from-green-500 to-emerald-500",
  },
];

export default function FeaturesHub() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-bold">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Learning Tool
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the AI-powered feature that fits your study needs right now.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Link key={index} to={feature.path} state={{ feature: feature.title }}>
              <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:border-primary/50 group cursor-pointer h-full">
                <div className="space-y-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <span className="text-primary font-medium group-hover:underline">
                      Start now →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
