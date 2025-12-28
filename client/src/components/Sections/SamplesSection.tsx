import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Star, CheckCircle, BookOpen, FileQuestion, Upload, MessageSquare, History, Layers, Sparkles, CheckSquare, HelpCircle, SplitSquareVertical } from "lucide-react";

import importantQuestionImage from "../../assets/important-questions-demo.png";
import topperStyleAnswerImage from "../../assets/topper-style-demo.png";
import pyqImage from "../../assets/pyqs-demo.png";
import lastnightbeforeExamImage from "../../assets/last-night-before-exam-demo.png";
import chatwithpdfImage from "../../assets/chat-with-pdf-demo.png";
import chapterwisestudyImage from "../../assets/chapter-wise-study-demo.png";
import aiSummarizerImage from "../../assets/ai-summarizer-demo.png";
import quizFillupsImage from "../../assets/quiz-fillups-demo.png";
import askAnyImage from "../../assets/ask-any-demo.png";
import diagramImage from "../../assets/diagram-analysis-demo.png";

const samples = [
  
  {
    id: 1,
    title: "95% Chance Questions",
    description: "Handpicked 95% probable CBSE questions with accurate, topper-style answers.",
    icon: FileQuestion,
    color: "from-violet-500 to-purple-500",
    image: importantQuestionImage,
  },
    {
    id: 2,
    title: "Last Night Before Exam",
    description: "Even if you haven’t studied before, revise this the last night and walk into the exam confidently",
    icon: BookOpen,
    color: "from-green-500 to-emerald-500",
    image: lastnightbeforeExamImage,
    badge: "11 Years",
  },
  {
    id: 3,
    title: "Topper-Style Answers",
    description: "See how our AI crafts exam-ready answers that score full marks",
    icon: Star,
    color: "from-orange-500 to-red-500",
    image: topperStyleAnswerImage,
    badge: "Perfect Format",
  },
  {
    id: 4,
    title: "PYQs 2014-2025",
    description: "Handpicked CBSE PYQs from 2014–2025 — focus on what boards repeat most.",
    icon: History,
    color: "from-green-500 to-emerald-500",
    image: pyqImage,
    badge: "11 Years",
  },

  {
    id: 5,
    title: "Chat With PDF",
    description: "Your notes become interactive - ask anything, get everything",
    icon: MessageSquare,
    color: "from-pink-500 to-red-500",
    image: chatwithpdfImage,
    badge: "Smart Chat",
  },
  {
    id: 6,
    title: "Chapter Wise Study",
    description: "Study each chapter in depth with structured content that builds complete exam confidence.",
    icon: Layers,
    color: "from-pink-500 to-red-500",
    image: chapterwisestudyImage,
    badge: "Smart Chat",
  },
  {
    id: 7,
    title: "AI Summarizer",
    description: "Get quick, easy-to-understand summaries of any topic — perfect for fast revision.",
    icon: Sparkles,
    color: "from-pink-500 to-red-500",
    image: aiSummarizerImage,
    badge: "Smart Chat",
  },
  {
    id: 8,
    title: "Quiz FillUps & True False",
    description: "Test your understanding with instant fill-ups and true/false questions.",
    icon: CheckSquare,
    color: "from-pink-500 to-red-500",
    image: quizFillupsImage,
    badge: "Smart Chat",
  },
  {
    id: 9,
    title: "Ask Any Question",
    description: "Stuck on a question? Upload its photo or ask directly and get instant explanations.",
    icon: HelpCircle,
    color: "from-pink-500 to-red-500",
    image: askAnyImage,
    badge: "Smart Chat",
  },
  {
    id: 10,
    title: "Diagram Analysis",
    description: "AI-based diagram analysis that explains each labeled part clearly for exams.",
    icon: SplitSquareVertical,
    color: "from-pink-500 to-red-500",
    image: diagramImage,
    badge: "Smart Chat",
  },
];

export default function SamplesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % samples.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + samples.length) % samples.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const currentSample = samples[currentIndex];

  return (
    <div className="min-h-screen bg-background pt-16 pb-4 px-2">
      <div className="">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            See It{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              In Action
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Real examples of how our AI transforms your study experience
          </p>
        </div>

        {/* Main Carousel Card */}
        <Card className="relative overflow-hidden bg-card/50 border-border/50 backdrop-blur-sm mb-8">
          {/* Image Section */}
          <div className="relative h-64 md:h-96 overflow-hidden bg-gradient-to-br from-background to-muted">
            <img
              src={currentSample.image}
              alt={currentSample.title}
              className="w-full h-full object-cover opacity-90"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/90 backdrop-blur-sm border border-border hover:bg-background hover:border-primary/50 transition-all flex items-center justify-center group"
              aria-label="Previous sample"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:text-primary transition-colors" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/90 backdrop-blur-sm border border-border hover:bg-background hover:border-primary/50 transition-all flex items-center justify-center group"
              aria-label="Next sample"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:text-primary transition-colors" />
            </button>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${currentSample.color} flex items-center justify-center flex-shrink-0`}>
                <currentSample.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl md:text-3xl font-bold mb-1 truncate">
                  {currentSample.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {currentSample.description}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {samples.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Thumbnail Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {samples.map((sample, index) => (
            <button
              key={sample.id}
              onClick={() => goToSlide(index)}
              className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                index === currentIndex
                  ? "ring-2 ring-primary shadow-lg shadow-primary/20 scale-105"
                  : "hover:scale-105 hover:shadow-md"
              }`}
            >
              <Card className="overflow-hidden border-0">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <img
                    src={sample.image}
                    alt={sample.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                  
                  {/* Icon */}
                  <div className={`absolute bottom-2 left-2 w-8 h-8 rounded-lg bg-gradient-to-br ${sample.color} flex items-center justify-center`}>
                    <sample.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                {/* Title - Hidden on mobile for space */}
                <div className="p-2 hidden md:block">
                  <p className="text-xs font-medium truncate">{sample.title}</p>
                </div>
              </Card>
            </button>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Ready to experience the difference?
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105">
            Try It Now - It's Free
          </button>
        </div>
      </div>
    </div>
  );
}