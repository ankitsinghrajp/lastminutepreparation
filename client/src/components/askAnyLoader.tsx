import { useEffect, useState } from "react";
import logo from "../assets/logo.png";

const LOADER_MESSAGES = [
  "🧠 Understanding the question exactly the way examiners expect…",
  "📘 Analyzing concepts, formulas, and keywords involved…",
  "✍️ Writing a topper-style answer in proper board format…",
  "🎯 Ensuring accuracy so no marks are cut in evaluation…",
  "📚 Structuring steps, points, and explanations clearly…",
  "✅ Final check — answer ready for full marks"
];

const AskAnyLoader = ({ stepLabel = "Loading...", showLoader = true }) => {
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
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t-2 border-orange-500/30 shadow-lg">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Animated Logo */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 animate-ping" />
              </div>
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center animate-pulse">
                <img src={logo} alt="LMP" className="w-6 h-6" />
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm sm:text-base font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent truncate">
                  {stepLabel}
                </h3>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
              
              {/* Rotating Messages */}
              <p className="text-xs sm:text-sm text-muted-foreground animate-fade-in truncate">
                {currentMessage}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="hidden sm:block flex-shrink-0 w-32">
              <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 animate-loading-bar" />
              </div>
            </div>
          </div>
          
          {/* Mobile Progress Bar */}
          <div className="sm:hidden mt-2">
            <div className="relative h-1 bg-muted rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 animate-loading-bar" />
            </div>
          </div>
        </div>
      </div>

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
          animation: fade-in 1s ease-in-out;
        }

        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AskAnyLoader;
