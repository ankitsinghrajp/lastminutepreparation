import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
     
            <span className="text-md md:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LastMinutePreparation
            </span>
          </Link>
          
          <div className="flex items-center space-x-3">
      
            <Button className="gradient-primary border-0" asChild>
              <Link to="/auth">Start Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
