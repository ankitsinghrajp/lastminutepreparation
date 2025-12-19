import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroIllustration from "@/assets/hero-illustration.png";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered CBSE Study Assistant</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Study Smarter,{" "}
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent animate-gradient">
                Not Harder
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              Designed for the final hours before an exam, LastMinutePreparation turns confusion into clarity.
Revise only what matters and walk into the exam with confidence.
            </p>

             <div className="flex items-center justify-start gap-2 py-2">
                <Zap className="w-5 h-5 text-accent animate-glow-pulse" />
                <p className="text-md md:text-md font-semibold text-accent">
                  Trained on 20 Years of CBSE Question Papers & Exam Patterns
                </p>
              </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="gradient-primary border-0 text-lg h-14 px-8 glow-primary" asChild>
                <a href="#tools">
                  Explore Features <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              {
                
              }
              <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-primary/30 hover:bg-primary/10" asChild>
                <Link to="#pricing">
                  Start Free Trial
                </Link>
              </Button>
            </div>
     
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-20 blur-3xl rounded-full" />
            <img 
              src={heroIllustration}
              alt="AI-powered study tools visualization" 
              className="relative rounded-2xl animate-float"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
