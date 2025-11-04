import logo from "../assets/logo.png";
const LayoutLoader = () => {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center space-y-6 px-4">
        {/* Animated Icon Container */}
        <div className="relative">
        
          {/* Inner icon */}
          <div className="w-24 h-24 flex items-center justify-center ">
            <img className='h-24 w-24' src={logo} alt="" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Loading
            </span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Please wait while we prepare everything...
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-purple-500 animate-bounce" 
               style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-bounce" 
               style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" 
               style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 md:w-80 h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"
               style={{ 
                 width: '100%',
                 animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
               }}></div>
        </div>
      </div>
    </div>
  );
};

export default LayoutLoader;