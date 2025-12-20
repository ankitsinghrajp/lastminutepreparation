import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import logo from "../assets/logo.png";

const LOADER_MESSAGES = [
  "📚 Fetching your study materials...",
  "🚀 All of India is on LMP right now!",
  "⏳ High traffic! Struggling to fetch data...",
  "💪 Almost there, hang tight...",
  "🔥 Loading premium content for you...",
  "⚡ Worth the wait, trust us!",
  "🎯 Preparing your exam arsenal...",
  "📖 Compiling topper secrets...",
];

const AnimatedLoader = ({ stepLabel = "Loading...", showLoader = true }) => {
  const [currentMessage, setCurrentMessage] = useState(LOADER_MESSAGES[0]);

  useEffect(() => {
    if (!showLoader) return;
    
    let messageIndex = 0;
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADER_MESSAGES.length;
      setCurrentMessage(LOADER_MESSAGES[messageIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, [showLoader]);

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <Card className="p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-orange-500/20">
        <div className="space-y-6">
          {/* Animated Logo */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 animate-ping" />
            </div>
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center animate-pulse">
              <img src={logo} alt="LMP" className="w-12 h-12" />
            </div>
          </div>

          {/* Step Label */}
          <div className="text-center">
            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
              {stepLabel}
            </h3>
            <div className="flex items-center justify-center gap-1 mb-4">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>

          {/* Rotating Messages */}
          <div className="text-center min-h-[60px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground animate-fade-in px-4">
              {currentMessage}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 animate-loading-bar" />
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Please wait, this may take up to 2 minutes...
          </p>
        </div>
      </Card>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }

        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnimatedLoader;

// USAGE EXAMPLE:
// import AnimatedLoader from './AnimatedLoader';
// 
// function YourComponent() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [currentStep, setCurrentStep] = useState("Generating Summary");
//
//   return (
//     <>
//       <AnimatedLoader 
//         stepLabel={currentStep} 
//         showLoader={isLoading} 
//       />
//       {/* Your other content */}
//     </>
//   );
// }