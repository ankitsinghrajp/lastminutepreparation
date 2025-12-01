import { 
  Button 
} from '@/components/ui/button';
import { 
  Card 
} from '@/components/ui/card';

import { 
  Trophy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calendar,
  Award
} from 'lucide-react';

import { useState } from 'react';
import { useAsyncMutation } from '@/hooks/hook';
import { useTopperStyleMutation } from '@/redux/api/api';
import AIOutput from "../AIOutput";

const PyqsComponent = ({ pyqsData, selectedClass, selectedSubject, selectedChapter }) => {
  const [getAnswer] = useAsyncMutation(useTopperStyleMutation);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState({});
  const [showAnswers, setShowAnswers] = useState({});

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

  // Extract array from pyqsData - handle different data structures
  let questionsArray = [];
  
  if (Array.isArray(pyqsData)) {
    questionsArray = pyqsData;
  } else if (pyqsData && typeof pyqsData === 'object') {
    // Check for common nested array patterns
    questionsArray = pyqsData.questions || pyqsData.data || pyqsData.pyqs || [];
  }

  // Group questions by marks
  const groupedQuestions = questionsArray.reduce((acc, q) => {
    const marks = q.marks || 'Other';
    if (!acc[marks]) {
      acc[marks] = [];
    }
    acc[marks].push(q);
    return acc;
  }, {});

  const sortedMarks = Object.keys(groupedQuestions).sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return Number(a) - Number(b);
  });

  // ----------------------- FALLBACK UI -----------------------
  if (!questionsArray || questionsArray.length === 0) {
    return (
      <div className="w-full max-w-full sm:px-4 md:px-6 mx-auto">
        <Card className="p-8 sm:p-10 bg-muted/50 border border-border rounded-xl text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">No Previous Year Questions</h3>
            <p className="text-sm text-muted-foreground">
              Previous year questions will appear here once available
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const getMarksGradient = (marks) => {
    const m = Number(marks);
    if (m === 1) return 'from-blue-500 to-cyan-500';
    if (m === 2) return 'from-green-500 to-emerald-500';
    if (m === 3) return 'from-amber-500 to-orange-500';
    if (m >= 5) return 'from-rose-500 to-pink-500';
    return 'from-slate-500 to-gray-500';
  };

  return (
    <div className="w-full max-w-full mx-auto">
      <div className="space-y-4 sm:space-y-5">

        {/* ==================== HEADER ==================== */}
        <Card className="overflow-hidden rounded-lg shadow-sm">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Previous Year Questions
                </h2>
                <p className="text-sm text-white/90 mt-1">
                  Master these questions to ace your exams
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <Award className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">{questionsArray.length} Questions</span>
              </div>
            </div>
          </div>
        </Card>

        {/* ========================================================= */}
        {/* =============== QUESTIONS BY MARKS =============== */}
        {/* ========================================================= */}

        {sortedMarks.map(marks => (
          <Card 
            key={marks}
            className="rounded-lg shadow-sm overflow-hidden"
          >
            {/* Section Header */}
            <div className={`w-full flex justify-between items-center p-4 sm:p-5 bg-gradient-to-r ${getMarksGradient(marks)}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {marks} Mark{Number(marks) !== 1 ? 's' : ''} Questions
                </h3>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-sm font-bold text-white">{groupedQuestions[marks].length}</span>
              </div>
            </div>

            {/* Section Content */}
            <div className="py-4 space-y-3 sm:space-y-4">
              {groupedQuestions[marks].map((q, idx) => {
                const key = `pyq-${q.id || idx}`;

                return (
                  <div 
                    key={q.id || idx}
                    className="bg-muted/50 rounded-lg sm:rounded-xl px-1 py-3 border border-border mx-1"
                  >
                    {/* Question Header with Year */}
                    <div className="flex items-center justify-between mb-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`min-w-7 min-h-7 sm:min-w-8 sm:min-h-8 flex items-center justify-center text-xs font-semibold rounded-full bg-gradient-to-r ${getMarksGradient(marks)} text-white`}>
                          {idx + 1}
                        </span>
                        {q.year && (
                          <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-semibold text-muted-foreground">{q.year}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        <Award className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-xs font-bold text-amber-600">{marks}M</span>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="flex items-start mb-3 px-3">
                      <p className="font-semibold text-sm sm:text-base text-foreground leading-relaxed flex-1">
                        {q.question}
                      </p>

                    </div>

                    {/* Generate / Show Answer */}
                    <div className="mt-4 px-3">
                      {!answers[key] ? (
                        <button
                          onClick={() => generateAIAnswer(q.question, key)}
                          disabled={loading[key]}
                          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2 bg-gradient-to-r border border-orange-500 hover:from-gray-800 to-slate-800 from-gray-900 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
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
                            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2 bg-gradient-to-r ${getMarksGradient(marks)} text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm`}
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
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                <p className="text-xs font-bold text-amber-500 uppercase tracking-wide">
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
          </Card>
        ))}

      </div>
    </div>
  );
};

export default PyqsComponent;