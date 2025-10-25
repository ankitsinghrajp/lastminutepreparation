import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Target, Brain, Lightbulb, Rocket, Users, BookOpen, Zap, Heart, Award, TrendingUp } from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      icon: BookOpen,
      title: "AI Answers to PYQs",
      description: "Previous Year Questions solved instantly with detailed explanations"
    },
    {
      icon: Brain,
      title: "Instant Summaries",
      description: "Chapters & topics summarized in seconds for quick revision"
    },
    {
      icon: Zap,
      title: "Formula Sheets",
      description: "Quick access to all important formulas and concept boosters"
    },
    {
      icon: Award,
      title: "Question Predictions",
      description: "AI-powered critical question predictions for your exams"
    },
    {
      icon: TrendingUp,
      title: "One-Click Revision",
      description: "Fast learning mode for last-minute preparation"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Students Helped" },
    { number: "4", label: "Classes Covered" },
    { number: "50+", label: "Subjects & Topics" },
    { number: "24/7", label: "AI Availability" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20 md:py-24 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-xl">
              <Brain className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            About{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              LastMinutePreparation AI
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Smart preparation beats long hours of studying. We're here to help you revise smarter, faster, and stress-free.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="p-6 md:p-8 lg:p-10 mb-8 md:mb-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <Target className="h-7 w-7 md:h-8 md:w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 md:mb-4">Our Mission</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                To help students revise smarter, faster, and stress-free — especially when time is running out. 
                We aim to make last-minute study sessions productive using the power of Artificial Intelligence.
              </p>
            </div>
          </div>
        </Card>

        {/* What We Do Section */}
        <div className="mb-12 md:mb-16">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-4">
              <Lightbulb className="h-6 w-6 md:h-7 md:w-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3 md:mb-4">🤖 What We Do</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
              An intelligent study assistant built for CBSE students (Classes 9–12) that never sleeps
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="p-5 md:p-6 bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <Card className="p-6 md:p-8 lg:p-10 mb-8 md:mb-12 bg-card/50 border-border/50 backdrop-blur-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Why We Created This */}
        <Card className="p-6 md:p-8 lg:p-10 mb-8 md:mb-12 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
              <Heart className="h-7 w-7 md:h-8 md:w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 md:mb-4"> Why We Created This</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                We noticed a huge gap — students study hard but struggle to organize and recall information under pressure. 
                So we built an AI that understands the CBSE curriculum, generates quick answers, and gives personalized 
                revision help — all in seconds.
              </p>
            </div>
          </div>
        </Card>

        {/* Vision Section */}
        <Card className="p-6 md:p-8 lg:p-10 mb-8 md:mb-12 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Rocket className="h-7 w-7 md:h-8 md:w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 md:mb-4">Our Vision</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                To make AI-powered learning accessible for every student in India — turning last-minute panic into confidence. 
                Our goal is to reach <span className="font-semibold text-foreground">1 million students</span> and redefine 
                how India studies during exam season.
              </p>
            </div>
          </div>
        </Card>

     

        {/* Bottom Spacer */}
        <div className="h-8 md:h-12"></div>
      </div>
    </div>
  );
}