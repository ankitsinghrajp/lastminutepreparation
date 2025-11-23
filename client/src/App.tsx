import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";
import { GoogleOAuthProvider } from "@react-oauth/google"; // ✅ import this
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import LayoutLoader from "./components/layoutLoader";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useCheckExpiryMutation, useRefreshTokenMutation } from "./redux/api/api";
import { userNotExists } from "./redux/reducers/auth";
import VerifyEmail from "./pages/VerifyEmail";
import PaymentSuccess from "./pages/PaymentSuccess";

const Auth = lazy(()=>import( "./pages/Auth"));
const AIChat = lazy(()=>import("./pages/AIChat"));
const ImportantQuestions = lazy(()=>import("./pages/ImportantQuestions"));
const NotFound = lazy(()=>import("./pages/NotFound"));
const ChapterWiseStudy = lazy(()=>import("./pages/ChapterWiseStudy"));
const AISummarizer = lazy(()=>import("./pages/AISummarizerPage"));
const AskAnyQuestion = lazy(()=>import("./pages/AskAny"));
const DiagramAnalysis = lazy(()=>import("./pages/DiagramAnalysis"));
const QuizGenerator = lazy(()=>import("./pages/QuizGeneratorPage"));
const PreviousYearQuestions = lazy(()=>import("./pages/PreviousYearQuestions"));
const PrivacyPolicyPage = lazy(()=>import("./pages/PrivacyPolicy"));
const TermsOfServicePage = lazy(()=>import("./pages/TermsOfService"));
const AboutPage = lazy(()=>import("./pages/About"));
const ContactPage = lazy(()=>import("./pages/Contact"));
const ScrollToTop = lazy(()=>import("./components/ScrollToTop"));
const ProtectedRoute = lazy(()=>import("./components/auth/protectedRoute"));

const queryClient = new QueryClient();

const App = () => {

  const {user} = useSelector((state)=>state.auth)

  const dispatch = useDispatch();
  const [mutate] = useRefreshTokenMutation();
  const [planExpiryMutate] = useCheckExpiryMutation();

  useEffect(()=>{
      const checkAuth = async ()=>{
        const res = await mutate("");
        if(!res?.data) {
          dispatch(userNotExists());
        }
      }
      checkAuth();

  },[dispatch])


  useEffect(()=>{
    const checkExpiry = async ()=>{
        await planExpiryMutate("");
    }
    checkExpiry();
  },[]);
  return <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* ✅ Wrap everything inside GoogleOAuthProvider */}
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <BrowserRouter>
         <Suspense fallback={<LayoutLoader />}>
          <ScrollToTop />
          <Routes>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute user={user}/>}>
            <Route path="/ai-chat" element={<AIChat />} />
            {/* <Route path="/chat-with-pdf" element={<ChatWithPDF />} /> */}
            <Route path="/chapter-wise-study" element={<ChapterWiseStudy />} />
            <Route path="/ai-summary" element={<AISummarizer />} />
            <Route path="/question-generator" element={<ImportantQuestions />} />
            <Route path="/ask-any" element={<AskAnyQuestion />} />
            <Route path="/diagram-analysis" element={<DiagramAnalysis />} />
            <Route path="/quiz-generator" element={<QuizGenerator />} />
            <Route path="/pyqs" element={<PreviousYearQuestions />} />
            <Route path="/payment-success" element={<PaymentSuccess/>}/>
            </Route>

            <Route element={<ProtectedRoute user={!user} redirect="/"/>}>
                <Route path="/auth" element={<Auth />} />
            </Route>


            <Route path="/" element={<Index />} />
            <Route path="/verify-email" element={<VerifyEmail/>}/>
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
};

export default App;
