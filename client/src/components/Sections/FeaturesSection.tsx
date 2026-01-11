import { Card } from "@/components/ui/card";
import { FileText, Brain, BookOpen, Clock, FileQuestion, MessageSquare, File, Crown, Users, Zap, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const features = [
  {
    icon: FileQuestion,
    title: "Extreme High Probability Questions",
    description: "Most repeated questions with answers - 95% Chance of Coming in the Exam.",
    path: "/question-generator",
    color: "from-violet-500 to-purple-500",
    baseStudents: 46000,
    isTrending: true,
  },
  {
    icon: Clock,
    title: "Last Night Before Exam",
    description: "One night before exam can change everything. Learn only the most probable things",
    path: "/ai-chat",
    color: "from-orange-500 to-red-500",
    baseStudents: 29000,
    isPro:true,
    isTrending: true,
  },

  {
    icon: FileText,
    title: "PYQs (2014 - 2025)",
    description: "Last 10 years PYQs with clear answers. Know exactly how questions come in boards.",
    path: "/pyqs",
    color: "from-green-500 to-emerald-500",
    isPro: true,
    baseStudents: 3000,
    isTrending: true,
  },
  {
    icon: Brain,
    title: "AI Topic Summarizer",
    description: "Your Fastest Way to Understand Any Topic.",
    path: "/ai-summary",
    color: "from-blue-500 to-cyan-500",
  },
  
  {
    icon: File,
    title: "Chat With PDF",
    description: "Turn Your Notes into a Talking Teacher.",
    path: "/chat-with-pdf",
    color: "from-pink-500 to-red-500",
    isPro: true,
  },
  {
    icon: BookOpen,
    title: "Chapter Wise Study Guide",
    description: "Turn Every Chapter into Your Strength.",
    path: "/chapter-wise-study",
    color: "from-blue-500 to-cyan-500",
    isPro: true
  },
  {
    icon: MessageSquare,
    title: "Ask Any Question",
    description: "Type It or Click It — Get the Perfect Answer.",
    path: "/ask-any",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Brain,
    title: "Quiz, Fill Ups and True False",
    description: "Fill-Ups & True/False That Really Matter.",
    path: "/quiz-generator",
    color: "from-orange-500 to-amber-500",
    isPro: true,
  },
  {
    icon: MessageSquare,
    title: "Diagram & Image Analysis",
    description: "Your Diagram Explained Like a Topper.",
    path: "/diagram-analysis",
    color: "from-indigo-500 to-blue-500",
    isPro: true,
  }
];

function LiveStudentCount({ baseCount }) {
  const [count, setCount] = useState(baseCount);
  const [isIncreasing, setIsIncreasing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prevCount => {
        const change = Math.floor(Math.random() * 500) + 1;
        const shouldIncrease = Math.random() > 0.5;
        
        if (shouldIncrease) {
          setIsIncreasing(true);
          return prevCount + change;
        } else {
          setIsIncreasing(false);
          return Math.max(baseCount - 500, prevCount - change);
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [baseCount]);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
      <div className="relative flex items-center">
        <Users className="w-4 h-4 text-green-500" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </div>
      <span className="text-sm font-semibold text-green-500">
        {count.toLocaleString()}+ studying now
      </span>
      <span className={`text-xs ${isIncreasing ? 'text-green-400' : 'text-orange-400'}`}>
        {isIncreasing ? '↑' : '↓'}
      </span>
    </div>
  );
}

export default function FeaturesSection() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const handleFeatureClick = (e, feature) => {
    if (feature.isPro && user?.planType === "FREE") {
      e.preventDefault();
      // Scroll to pricing section if on same page
      const pricingElement = document.getElementById('pricing');
      if (pricingElement) {
        pricingElement.scrollIntoView({ behavior: 'smooth' });
      } else {
          // Navigate to home page with hash
      navigate('/', { state: { scrollTo: 'pricing' } });
        // Small delay to ensure page loads before scrolling
        setTimeout(() => {
          const element = document.getElementById('pricing');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  };

  return (
    <div id="tools" className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-16 pb-24">
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
              className=""
              onClick={(e) => handleFeatureClick(e, feature)}
            >
              <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:border-primary/50 group cursor-pointer overflow-hidden h-full relative flex flex-col">
                
                {/* Badges Container - Top right corner */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                  {feature.isTrending && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      TRENDING
                    </div>
                  )}
                  
                  {feature.isPro && (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-xs font-bold rounded-full shadow-lg">
                      <Crown className="w-3 h-3" />
                      <span>PRO</span>
                    </div>
                  )}
                </div>
 
                <div className="flex flex-col flex-grow">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg mb-4`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  
                  {/* Title and Description */}
                  <div className="flex-grow mb-4">
                    <h3 className="text-xl font-bold mb-2 leading-tight">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Bottom Section - Social Proof and CTA */}
                  <div className="space-y-3 mt-auto">
                    {/* Social Proof for trending items */}
                    {feature.isTrending && feature.baseStudents && (
                      <LiveStudentCount baseCount={feature.baseStudents} />
                    )}

                    {/* CTA Button */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                      feature.isPro 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg group-hover:shadow-amber-500/50' 
                        : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                    }`}>
                      <span>{feature.isPro ? 'Unlock PRO' : 'Start Now'}</span>
                      <Zap className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
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