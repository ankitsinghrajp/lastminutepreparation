import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  Brain, 
  Target, 
  Lightbulb, 
  HelpCircle,
  Zap,
  AlertCircle,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';

const QuestionBox = ({ response }) => {
  const [showAnswers, setShowAnswers] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    important: true,
    numericals: true,
    veryShort: true,
    long: true
  });

  const toggleAnswer = (index) => {
    setShowAnswers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCopyQuestion = (question) => {
    navigator.clipboard.writeText(question);
  };

  if (!response || response.length === 0) {
    return (
      <Card className="p-8 bg-card/30 border-border/30 text-center">
        <BookOpen className="h-12 w-12 mx-auto mb-3 text-emerald-500/50" />
        <h3 className="text-base font-medium mb-1.5 text-muted-foreground">
          No Questions Yet
        </h3>
        <p className="text-xs text-muted-foreground/70">
          Generate questions to see them here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Chapter Info Header */}
      {response.chapter && (
        <Card className="p-4 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold mb-2">{response.chapter}</h2>
              {response.whyImportant && (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {response.whyImportant}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Past Year Patterns */}
      {response.pastYearPatterns && response.pastYearPatterns.length > 0 && (
        <Card className="p-4 bg-card/50 border-border/50">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            <h3 className="text-sm sm:text-base font-semibold">Past Year Patterns</h3>
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            {response.pastYearPatterns.map((pattern, idx) => (
              <div key={idx} className="p-3 bg-background/50 rounded-lg border border-border/30">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-xs sm:text-sm font-medium truncate">{pattern.questionType}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                    pattern.frequency === 'High' 
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                      : pattern.frequency === 'Medium'
                      ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                      : 'bg-green-500/10 text-green-600 dark:text-green-400'
                  }`}>
                    {pattern.frequency}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{pattern.trend}</p>
                {pattern.notes && (
                  <p className="text-xs text-foreground/80 mt-2 p-2 bg-blue-500/5 rounded border-l-2 border-blue-500">
                    {pattern.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Important Questions */}
      {response.importantQuestions && response.importantQuestions.length > 0 && (
        <Card className="p-4 bg-card/50 border-border/50">
          <button
            onClick={() => toggleSection('important')}
            className="flex items-center justify-between w-full mb-3 sm:mb-4"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
              <h3 className="text-sm sm:text-base font-semibold">Important Questions ({response.importantQuestions.length})</h3>
            </div>
            {expandedSections.important ? (
              <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            )}
          </button>

          {expandedSections.important && (
            <div className="space-y-3 sm:space-y-4">
              {response.importantQuestions.map((q, idx) => (
                <div key={idx} className="p-3 sm:p-4 bg-background/50 rounded-lg border border-border/30">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{idx + 1}</span>
                      </span>
                      <p className="text-sm font-medium flex-1">{q.question}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-xs font-medium">
                        {q.marks}m
                      </span>
                      <Button
                        onClick={() => handleCopyQuestion(q.question)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {q.whyThisIsImportant && (
                    <div className="mb-3 p-2 bg-blue-500/5 rounded border-l-2 border-blue-500">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                        Why Important:
                      </p>
                      <p className="text-xs text-foreground/80">{q.whyThisIsImportant}</p>
                    </div>
                  )}

                  {q.keywords && q.keywords.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {q.keywords.map((keyword, kidx) => (
                        <span 
                          key={kidx} 
                          className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => toggleAnswer(`important-${idx}`)}
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                  >
                    {showAnswers[`important-${idx}`] ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Hide Answer
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show Answer
                      </>
                    )}
                  </Button>

                  {showAnswers[`important-${idx}`] && q.modelAnswer && (
                    <div className="mt-3 p-2.5 sm:p-3 bg-emerald-500/5 rounded border border-emerald-500/20">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-2">
                        Model Answer:
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{q.modelAnswer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Must Practice Numericals */}
      {response.mustPracticeNumericals && response.mustPracticeNumericals.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
          <button
            onClick={() => toggleSection('numericals')}
            className="flex items-center justify-between w-full mb-3 sm:mb-4"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              <h3 className="text-sm sm:text-base font-semibold">Must Practice Numericals ({response.mustPracticeNumericals.length})</h3>
            </div>
            {expandedSections.numericals ? (
              <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            )}
          </button>

          {expandedSections.numericals && (
            <div className="space-y-3 sm:space-y-4">
              {response.mustPracticeNumericals.map((num, idx) => (
                <div key={idx} className="p-3 sm:p-4 bg-background/50 rounded-lg border border-border/30">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="text-sm font-medium flex-1">
                      <span className="text-orange-500">Problem {idx + 1}:</span> {num.question}
                    </p>
                    <span className="px-2 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded text-xs font-medium flex-shrink-0">
                      {num.marks}m
                    </span>
                  </div>

                  {num.formulaUsed && num.formulaUsed.length > 0 && (
                    <div className="mb-3 p-2 bg-blue-500/5 rounded border-l-2 border-blue-500">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                        Formula Used:
                      </p>
                      {num.formulaUsed.map((formula, fidx) => (
                        <p key={fidx} className="text-xs font-mono text-foreground/80 break-all">{formula}</p>
                      ))}
                    </div>
                  )}

                  {num.commonMistake && (
                    <div className="mb-3 p-2 bg-red-500/5 rounded border-l-2 border-red-500">
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                        Common Mistake:
                      </p>
                      <p className="text-xs text-foreground/80">{num.commonMistake}</p>
                    </div>
                  )}

                  <Button
                    onClick={() => toggleAnswer(`numerical-${idx}`)}
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                  >
                    {showAnswers[`numerical-${idx}`] ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Hide Solution
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show Solution
                      </>
                    )}
                  </Button>

                  {showAnswers[`numerical-${idx}`] && num.solutionSteps && (
                    <div className="mt-3 p-2.5 sm:p-3 bg-orange-500/5 rounded border border-orange-500/20">
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-2">
                        Solution Steps:
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{num.solutionSteps}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Very Short Questions */}
      {response.veryShortQuestions && response.veryShortQuestions.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
          <button
            onClick={() => toggleSection('veryShort')}
            className="flex items-center justify-between w-full mb-3 sm:mb-4"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              <h3 className="text-sm sm:text-base font-semibold">Very Short Questions ({response.veryShortQuestions.length})</h3>
            </div>
            {expandedSections.veryShort ? (
              <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            )}
          </button>

          {expandedSections.veryShort && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {response.veryShortQuestions.map((vsq, idx) => (
                <div key={idx} className="p-3 bg-background/50 rounded-lg border border-border/30">
                  <p className="text-sm font-medium mb-3 text-purple-600 dark:text-purple-400">
                    Q: {vsq.question}
                  </p>
                  
                  <Button
                    onClick={() => toggleAnswer(`veryshort-${idx}`)}
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                  >
                    {showAnswers[`veryshort-${idx}`] ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Hide Answer
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show Answer
                      </>
                    )}
                  </Button>

                  {showAnswers[`veryshort-${idx}`] && (
                    <div className="mt-3 p-2 bg-purple-500/5 rounded border border-purple-500/20">
                      <p className="text-xs text-foreground/80">{vsq.answer}</p>
                    </div>
                  )}

                  {vsq.keywords && vsq.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {vsq.keywords.map((kw, kidx) => (
                        <span 
                          key={kidx}
                          className="px-1.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded text-xs"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Long Answer Questions */}
      {response.longAnswerQuestions && response.longAnswerQuestions.length > 0 && (
        <Card className="p-4 bg-card/50 border-border/50">
          <button
            onClick={() => toggleSection('long')}
            className="flex items-center justify-between w-full mb-3 sm:mb-4"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
              <h3 className="text-sm sm:text-base font-semibold">Long Answer Questions ({response.longAnswerQuestions.length})</h3>
            </div>
            {expandedSections.long ? (
              <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            )}
          </button>

          {expandedSections.long && (
            <div className="space-y-3 sm:space-y-4">
              {response.longAnswerQuestions.map((laq, idx) => (
                <div key={idx} className="p-3 sm:p-4 bg-background/50 rounded-lg border border-border/30">
                  <p className="text-sm font-medium mb-3">{laq.question}</p>

                  {laq.structure && (
                    <div className="mb-3 p-2 bg-blue-500/5 rounded border-l-2 border-blue-500">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                        Answer Structure:
                      </p>
                      <p className="text-xs text-foreground/80">{laq.structure}</p>
                    </div>
                  )}

                  {laq.diagramTip && (
                    <div className="mb-3 p-2 bg-purple-500/5 rounded border-l-2 border-purple-500">
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                        💡 Diagram Tip:
                      </p>
                      <p className="text-xs text-foreground/80">{laq.diagramTip}</p>
                    </div>
                  )}

                  <Button
                    onClick={() => toggleAnswer(`long-${idx}`)}
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                  >
                    {showAnswers[`long-${idx}`] ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Hide Model Answer
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show Model Answer
                      </>
                    )}
                  </Button>

                  {showAnswers[`long-${idx}`] && laq.modelAnswer && (
                    <div className="mt-3 p-2.5 sm:p-3 bg-emerald-500/5 rounded border border-emerald-500/20">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-2">
                        Model Answer:
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{laq.modelAnswer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Exam Strategy */}
      {response.examStrategy && (
        <Card className="p-4 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            <h3 className="text-sm sm:text-base font-semibold">Exam Strategy</h3>
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            {response.examStrategy.howToAttempt && response.examStrategy.howToAttempt.length > 0 && (
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
                  How to Attempt:
                </p>
                <ul className="space-y-1.5">
                  {response.examStrategy.howToAttempt.map((tip, idx) => (
                    <li key={idx} className="text-xs sm:text-sm flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {response.examStrategy.mustRevise && response.examStrategy.mustRevise.length > 0 && (
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">
                  Must Revise:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {response.examStrategy.mustRevise.map((item, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {response.examStrategy.avoidMistakes && response.examStrategy.avoidMistakes.length > 0 && (
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">
                  Avoid These Mistakes:
                </p>
                <ul className="space-y-1.5">
                  {response.examStrategy.avoidMistakes.map((mistake, idx) => (
                    <li key={idx} className="text-xs sm:text-sm flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default QuestionBox;