import { 
  Button 
} from '@/components/ui/button';
import { 
  Card 
} from '@/components/ui/card';

import { 
  CheckCircle2, 
  BookOpen, 
  HelpCircle,
  Zap,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

import { useState } from 'react';
import { useAsyncMutation } from '@/hooks/hook';
import { useTopperStyleMutation } from '@/redux/api/api';
import AIOutput from "../AIOutput";

const QuestionBox = ({ response, selectedClass, selectedSubject, selectedChapter }) => {

  const [getAnswer] = useAsyncMutation(useTopperStyleMutation);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState({});
  const [showAnswers, setShowAnswers] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    important: true,
    veryShort: true,
    numericals: true,
    long: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleAnswer = (key) => {
    setShowAnswers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generateAIAnswer = async (question, key) => {
    try {
      setLoading(prev => ({ ...prev, [key]: true }));

      const res = await getAnswer(
        "Generating topper-style answer...",
        { user_question: question, selectedClass, selectedSubject, selectedChapter }
      );

      const aiAnswer = res?.data?.data?.answer;
      if (aiAnswer) {
        setAnswers(prev => ({ ...prev, [key]: aiAnswer }));
        setShowAnswers(prev => ({ ...prev, [key]: true }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // ----------------------- FALLBACK UI -----------------------
  if (!response || response.length === 0) {
    return (
      <div className="w-full max-w-full sm:px-4 md:px-6 mx-auto">
        <Card className="p-8 sm:p-10 bg-muted/50 border border-border rounded-xl text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">Ready to Start?</h3>
            <p className="text-sm text-muted-foreground">
              Generate questions to begin your practice journey
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto">
      <div className="space-y-4 sm:space-y-5">

        {/* ==================== CHAPTER HEADER ==================== */}
        {response.chapter && (
          <Card className="overflow-hidden rounded-lg shadow-sm">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    {response.chapter}
                  </h2>
                  {response.whyImportant && (
                    <p className="text-sm text-white/90 mt-1">
                      {response.whyImportant}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ========================================================= */}
        {/* =============== QUESTION SECTIONS =============== */}
        {/* ========================================================= */}

        {[
          { 
            key: 'important', 
            label: 'Important Questions', 
            icon: <CheckCircle2 className="h-5 w-5 text-white" />, 
            gradient: 'from-emerald-500 to-teal-500',
            list: response.importantQuestions 
          },
          { 
            key: 'veryShort', 
            label: 'Very Short Questions', 
            icon: <HelpCircle className="h-5 w-5 text-white" />, 
            gradient: 'from-blue-500 to-cyan-500',
            list: response.veryShortQuestions 
          },
          { 
            key: 'numericals', 
            label: 'Must Practice Numericals', 
            icon: <Zap className="h-5 w-5 text-white" />, 
            gradient: 'from-orange-500 to-red-500',
            list: response.mustPracticeNumericals 
          },
          { 
            key: 'long', 
            label: 'Long Answer Questions', 
            icon: <BookOpen className="h-5 w-5 text-white" />, 
            gradient: 'from-purple-500 to-pink-500',
            list: response.longAnswerQuestions 
          },
        ].map(section => (
          section.list?.length > 0 && (
            <Card 
              key={section.key}
              className="rounded-lg shadow-sm overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.key)}
                className={`w-full flex justify-between items-center p-4 sm:p-5 bg-gradient-to-r ${section.gradient} hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    {section.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {section.label}
                  </h3>
                </div>
                <div className="flex-shrink-0">
                  {expandedSections[section.key] ? (
                    <ChevronUp className="w-5 h-5 text-white" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white" />
                  )}
                </div>
              </button>

              {/* Section Content */}
              {expandedSections[section.key] && (
                <div className="py-4 space-y-3 sm:space-y-4">
                  {section.list.map((q, idx) => {
                    const key = `${section.key}-${idx}`;

                    return (
                      <div 
                        key={idx}
                        className="bg-muted/50 rounded-lg sm:rounded-xl px-1 py-3  border border-border mx-1"
                      >
                        {/* Question Text */}
                        <div className="flex items-start gap-2 sm:gap-3 mb-3">
                          <span className={`min-w-7 min-h-7 sm:min-w-8 sm:min-h-8 flex items-center justify-center text-xs font-semibold rounded-full bg-gradient-to-r ${section.gradient} text-white shrink-0`}>
                            {idx + 1}
                          </span>

                          <p className="font-semibold text-sm sm:text-base text-foreground leading-relaxed flex-1">
                            {q.question}
                          </p>

                          {/* Copy Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 flex-shrink-0 hover:bg-muted"
                            onClick={() => navigator.clipboard.writeText(q.question)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Generate / Show Answer */}
                        <div className="mt-4">
                          {!answers[key] ? (
                            <button
                              onClick={() => generateAIAnswer(q.question, key)}
                              disabled={loading[key]}
                              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2 bg-gradient-to-r border border-pink-500 hover:from-gray-800 to-slate-800 from-gray-900 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
                            >
                              {loading[key] ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  <span>Generating...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4" />
                                  <span>Generate Topper Style Answer</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="space-y-3">
                              <button
                                onClick={() => toggleAnswer(key)}
                                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2  sm:px-5 py-2.5 sm:py-2 bg-gradient-to-r ${section.gradient} text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm`}
                              >
                                {showAnswers[key] ? (
                                  <>
                                    <ChevronUp className="h-4 w-4" />
                                    <span>Hide Answer</span>
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-4 w-4" />
                                    <span>Show Answer</span>
                                  </>
                                )}
                              </button>

                              {showAnswers[key] && (
                                <div className="p-4 sm:p-6 bg-card rounded-lg sm:rounded-xl border border-border shadow-lg">
                                  <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
                                    <Sparkles className="h-4 w-4 text-purple-500" />
                                    <p className="text-xs font-bold text-purple-500 uppercase tracking-wide">
                                      Topper Style Answer
                                    </p>
                                  </div>
                                  <AIOutput content={answers[key]} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )
        ))}

      </div>
    </div>
  );
};

export default QuestionBox;