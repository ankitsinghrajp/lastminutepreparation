import { Card } from "@/components/ui/card";
import { FileText, Brain, BookOpen, Clock, FileQuestion, MessageSquare, Book, File } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

const features = [
  {
    icon: Clock,
    title: "Last Night Before Exam",
    description: "The Final Revision That Decides Your Marks.",
    path: "/ai-chat",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: File,
    title: "Chat With PDF",
    description: "Turn Your Notes into a Talking Teacher.",
    path: "/chat-with-pdf",
    color: "from-pink-500 to-red-500",
  },

  {
    icon: BookOpen,
    title: "Chapter Wise Study Guide",
    description: "Turn Every Chapter into Your Strength.",
    path: "/chapter-wise-study",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Brain,
    title: "AI Topic Summarizer",
    description: "Your Fastest Way to Understand Any Topic.",
    path: "/ai-summary",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: FileQuestion,
    title: "Predicted Important Question",
    description: "Questions with a 95% Chance of Coming in the Exam.",
    path: "/question-generator",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Brain,
    title: "Quiz, Fill Ups and True False",
    description: "Fill-Ups & True/False That Really Matter.",
    path: "/quiz-generator",
    color: "from-orange-500 to-amber-500",
  },
    {
    icon: MessageSquare,
    title: "Ask Any Question",
    description: "Type It or Click It — Get the Perfect Answer.",
    path: "/ask-any",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: MessageSquare,
    title: "Diagram & Image Analysis",
    description: "Your Diagram Explained Like a Topper.",
    path: "/diagram-analysis",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: FileText,
    title: "PYQs (2014 - 2025)",
    description: "Past Questions. Present Preparation. Future Topper.",
    path: "/pyqs",
    color: "from-green-500 to-emerald-500",
  },
];

export default function FeaturesSection() {
  return (
    <div id="tools" className="min-h-screen bg-background">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Link 
              key={index} 
              to={feature.path} 
              state={{ feature: feature.title }}
              className={ ""}
            >
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