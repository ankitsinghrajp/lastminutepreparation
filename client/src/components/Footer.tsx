import { Sparkles, Mail, Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LastMinutePreparation
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              AI-powered study assistant helping students achieve their academic goals with smart tools and resources.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Product Section */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            
            </ul>
          </div>

          {/* AI Tools Section */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">AI Tools</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/ai-chat" className="text-muted-foreground hover:text-primary transition-colors">
                  Last Night Prep
                </Link>
              </li>
          
              <li>
                <Link to="/chapter-wise-study" className="text-muted-foreground hover:text-primary transition-colors">
                  Chapter Study
                </Link>
              </li>
              <li>
                <Link to="/ai-summary" className="text-muted-foreground hover:text-primary transition-colors">
                  AI Summarizer
                </Link>
              </li>
              <li>
                <Link to="/question-generator" className="text-muted-foreground hover:text-primary transition-colors">
                  Question Generator
                </Link>
              </li>
            </ul>
          </div>
          
          {/* More Tools & Legal Section */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/ask-any" className="text-muted-foreground hover:text-primary transition-colors">
                  Ask Questions
                </Link>
              </li>
              <li>
                <Link to="/diagram-analysis" className="text-muted-foreground hover:text-primary transition-colors">
                  Diagram Analysis
                </Link>
              </li>
              <li>
                <Link to="/quiz-generator" className="text-muted-foreground hover:text-primary transition-colors">
                  Quiz Generator
                </Link>
              </li>
              <li>
                <Link to="/pyqs" className="text-muted-foreground hover:text-primary transition-colors">
                  PYQs (2014-2024)
                </Link>
              </li>
            </ul>
            <h3 className="font-semibold mb-4 mt-6 text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 LastMinutePreparation. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with <span className="text-red-500">♥</span> for students
          </p>
        </div>
      </div>
    </footer>
  );
};