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
import ImportantQuestions from "./pages/ImportantQuestions";
import NotFound from "./pages/NotFound";
import ChatWithPDF from "./pages/ChatWithPDF";
import ChapterWiseStudy from "./pages/ChapterWiseStudy";
import AISummarizer from "./pages/AISummarizerPage";
import AskAnyQuestion from "./pages/AskAny";
import DiagramAnalysis from "./pages/DiagramAnalysis";
import QuizGenerator from "./pages/QuizGeneratorPage";
import PreviousYearQuestions from "./pages/PreviousYearQuestions";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import TermsOfServicePage from "./pages/TermsOfService";
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
      <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/features" element={<FeaturesHub />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/chat-with-pdf" element={<ChatWithPDF/>}/>
          <Route path="/chapter-wise-study" element={<ChapterWiseStudy/>}/>
          <Route path="/ai-summary" element={<AISummarizer/>}/>
          <Route path="/question-generator" element={<ImportantQuestions />} />
          <Route path="/ask-any" element={<AskAnyQuestion />} />
          <Route path="/diagram-analysis" element={<DiagramAnalysis />} />
          <Route path="/quiz-generator" element={<QuizGenerator />} />
          <Route path="/pyqs" element={<PreviousYearQuestions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
