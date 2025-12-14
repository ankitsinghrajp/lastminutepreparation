import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import AIOutput from '../AIOutput';
import { useAsyncMutation } from '@/hooks/hook';
import { useTopperStyleMutation } from '@/redux/api/api';
import { renderFormula } from '../LastNightBeforeExam/renderFormula';
import { toast } from 'sonner';

const ChapterWiseImportantQuestionSection = ({ 
  importantQuestions, 
  selectedClass, 
  selectedSubject, 
  selectedChapter 
}) => {
  const [getAnswer] = useAsyncMutation(useTopperStyleMutation);
  const [answers, setAnswers] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [showAnswers, setShowAnswers] = useState({});


  const pollTopperStyleAnswer = async (params, idx) => {
    const interval = setInterval(async () => {
      try {
        const res = await getAnswer("Fetching answer...", params);
  
        if (res?.data?.statusCode === 200) {
          const answer = res.data.data.answer;
          setAnswers(prev => ({ ...prev, [idx]: answer }));
          setShowAnswers(prev => ({ ...prev, [idx]: true }));
          clearInterval(interval);
          setLoadingStates(prev => ({ ...prev, [idx]: false }));
          
          toast.success("Answer Ready!");
        }
      } catch (error) {
        clearInterval(interval);
        setLoadingStates(prev => ({ ...prev, [idx]: false }));
        toast.error("Error fetching Answer...");
      }
    }, 10000);
  };

  const generateAnswer = async (question, idx) => {
    setLoadingStates(prev => ({ ...prev, [idx]: true }));
    try {
      const res = await getAnswer(
        "Generating topper style answer...",
        { user_question: question, selectedClass, selectedSubject, selectedChapter }
      );

      if (res?.data?.statusCode === 200) {
        const answer = res.data.data.answer;
        setAnswers(prev => ({ ...prev, [idx]: answer }));
        setShowAnswers(prev => ({ ...prev, [idx]: true }));
        setLoadingStates(prev => ({ ...prev, [idx]: false }));
      } else if (res?.data?.statusCode === 202) {
        toast.message("Fetching Answer...");
        pollTopperStyleAnswer({ user_question: question, selectedClass, selectedSubject, selectedChapter }, idx);
      } else {
        setLoadingStates(prev => ({ ...prev, [idx]: false }));
      }
    } catch (error) {
      console.error(error);
      setLoadingStates(prev => ({ ...prev, [idx]: false }));
    }
  };

  const toggleAnswer = (idx) => {
    setShowAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const questionsArray = Object.entries(importantQuestions).map(([key, value]) => ({
    question: typeof value === 'string' ? value : value?.question,
  }));

  return (
    <div className="shadow-sm overflow-hidden">
      
      <div className="py-4 space-y-3 sm:space-y-4">
        {questionsArray.map((q, idx) => (
          <div
            key={idx}
            className="bg-muted/50 p-3 sm:p-4 border border-border"
          >
            <div className="flex items-start gap-2 sm:gap-3 mb-3">
              <span
                className="min-w-7 min-h-7 sm:min-w-8 sm:min-h-8 flex items-center justify-center 
                text-xs font-semibold rounded-full bg-gradient-to-r 
                from-purple-500 to-pink-500 text-white shrink-0"
              >
                Q.{idx + 1}
              </span>

              <p className="font-semibold text-sm sm:text-base text-foreground leading-relaxed">
                {q.question}
              </p>
            </div>

            {q?.formula && (
              <div className="mt-3">
                <div className="p-3 sm:p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Key Formula
                    </p>
                  </div>
                  {renderFormula(q.formula)}
                </div>
              </div>
            )}

            {q?.keywords?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                {q.keywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-purple-500/10 
                    text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold 
                    border border-purple-500/20"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4">
              {!answers[idx] ? (
                <button
                  onClick={() => generateAnswer(q.question, idx)}
                  disabled={loadingStates[idx]}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 
                  px-4 sm:px-5 py-2.5 sm:py-2 bg-gradient-to-r border border-pink-500 hover:from-gray-800 to-slate-800 from-gray-900
                  text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity 
                  disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loadingStates[idx] ? (
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
                    onClick={() => toggleAnswer(idx)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 
                    px-4 sm:px-5 py-2.5 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 
                    text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity 
                    shadow-sm"
                  >
                    {showAnswers[idx] ? (
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

                  {showAnswers[idx] && (
                    <div className="p-4 sm:p-6 bg-card rounded-lg sm:rounded-xl border border-border shadow-lg">
                      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <p className="text-xs font-bold text-purple-500 uppercase tracking-wide">
                          Topper Style Answer
                        </p>
                      </div>

                      <AIOutput content={answers[idx]} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterWiseImportantQuestionSection;