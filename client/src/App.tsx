import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import FeaturesHub from "./pages/FeaturesHub";
import AIChat from "./pages/AIChat";
import QAInterface from "./pages/QAInterface";
import QuestionGenerator from "./pages/QuestionGenerator";
import RevisionPlanner from "./pages/RevisionPlanner";
import ImageAnalysis from "./pages/ImageAnalysis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/features" element={<FeaturesHub />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/qa-interface" element={<QAInterface />} />
          <Route path="/question-generator" element={<QuestionGenerator />} />
          <Route path="/revision-planner" element={<RevisionPlanner />} />
          <Route path="/image-analysis" element={<ImageAnalysis />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
