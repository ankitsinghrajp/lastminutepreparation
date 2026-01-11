import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import heroIllustration from "@/assets/hero-illustration.png";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Glowing orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-[90px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Spotlight effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-blue-500/10 via-transparent to-transparent blur-3xl" />
      
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left space-y-4">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 border border-blue-400/30 backdrop-blur-sm shadow-lg shadow-blue-500/20">
              <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                AI-Powered CBSE Study Assistant
              </span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-white">
              CBSE Board{" "}
              <span className="block mt-2 pb-3 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                ka Right Content
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
              In the final hours before the exam, LastMinutePreparation removes confusion and tells you exactly what to study—nothing extra, only what matters.
            </p>

            {/* Trust indicator */}
            <div className="flex items-center justify-center lg:justify-start gap-3 py-3 px-5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20 rounded-xl backdrop-blur-sm w-fit">
              <Zap className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              <p className="text-sm md:text-base font-semibold text-amber-300">
                Trained on 20 Years of CBSE Question Papers & Exam Patterns
              </p>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-400">100% Trusted</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400">98% Success Rate</span>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border-0 text-lg h-14 px-8 text-white font-semibold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300" 
                asChild
              >
                <a href="#tools">
                  Explore Features <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              
              <Button 
                size="lg" 
                className="text-lg h-14 px-8 bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300" 
                asChild
              >
                <a href="#tools">
                  Start Free Trial
                </a>
              </Button>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative lg:ml-8">
            {/* Glow effect behind image */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30 opacity-50 blur-3xl rounded-full scale-110" />
            
            {/* Decorative rings */}
            <div className="absolute inset-0 rounded-2xl border border-blue-400/20 animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 rounded-2xl border border-purple-400/20 animate-pulse scale-105" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
            
            <img 
              src={heroIllustration}
              alt="AI-powered study tools visualization" 
              className="relative rounded-2xl shadow-2xl shadow-blue-500/20 hover:scale-[1.02] transition-transform duration-500"
              style={{
                animation: 'float 6s ease-in-out infinite'
              }}
            />
            
            {/* Floating particles */}
            <div className="absolute top-10 right-10 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
            <div className="absolute bottom-20 left-10 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 right-5 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </section>
  );
};