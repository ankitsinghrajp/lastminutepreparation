import { Brain, BookOpen, Lightbulb, FileText, CheckCircle, Target, Zap } from "lucide-react";

const RevisionPanel = ({ summary, importantTopics, predictedQuestion, mcqs, memoryBooster, aiCoach }) => {
  if (!summary || summary.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
        <Brain className="h-12 w-12 sm:h-14 sm:w-14 mb-3 text-emerald-500/50" />
        <h3 className="text-base sm:text-lg font-medium mb-1.5 text-muted-foreground">
          Ready for Chapter Revision
        </h3>
        <p className="text-sm text-muted-foreground/70">
          Select your class, subject, and chapter, then click "Generate Revision"
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background overflow-y-auto h-full">
      <div className="py-4 sm:py-6 space-y-4">
        {/* Chapter Summary */}
        <div className="p-2 py-4 bg-card/50 border-border/50 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold">Chapter Summary</h3>
          </div>
          <p className="text-sm leading-relaxed">{summary}</p>
        </div>

        {/* Important Topics */}
        {importantTopics && importantTopics.length > 0 && (
          <div className="p-2 py-4 bg-card/50 border-border/50 rounded-lg border">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-emerald-500" />
              <h3 className="font-semibold">Important Topics</h3>
            </div>
            <div className="space-y-4">
              {importantTopics?.map((topic, idx) => (
                <div key={idx} className="p-4 bg-background/50 rounded-lg border border-border/30">
                  <p className="font-medium text-sm sm:text-base mb-2">{topic?.topic}</p>
                  <p className="text-sm mb-3 leading-relaxed">{topic?.explanation}</p>
                  {topic?.formula && (
                    <div className="p-3 bg-blue-500/10 rounded">
                      <div dangerouslySetInnerHTML={{ __html: topic?.formula }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Predicted Questions */}
        {predictedQuestion && predictedQuestion.length > 0 && (
          <div className="p-2 py-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20 rounded-lg border">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">Predicted Questions</h3>
            </div>
            <div className="space-y-4">
              {predictedQuestion?.map((q, idx) => (
                <div key={idx} className="p-4 bg-background/50 rounded-lg border border-border/30">
                  <p className="font-medium text-sm mb-3">{q?.question}</p>
                  <div className="p-3 bg-green-500/5 rounded border-l-2 border-green-500 mb-3">
                    <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: q?.answer }} />
                  </div>
                  {q?.formula && (
                    <div className="p-3 bg-blue-500/10 rounded mb-3">
                      <div dangerouslySetInnerHTML={{ __html: q?.formula }} />
                    </div>
                  )}
                  {q?.keywords && q.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {q?.keywords?.map((keyword, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MCQs */}
        {mcqs && mcqs.length > 0 && (
          <div className="p-2 py-4 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20 rounded-lg border">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Multiple Choice Questions</h3>
            </div>
            <div className="space-y-4">
              {mcqs?.map((mcq, idx) => (
                <div key={idx} className="p-4 bg-background/50 rounded-lg border border-border/30">
                  <p className="font-medium text-sm mb-3">{mcq?.question}</p>
                  <div className="space-y-2 mb-3">
                    {mcq?.options?.map((option, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded text-sm ${
                          option.startsWith(mcq?.correct)
                            ? 'bg-green-500/10 border border-green-500/30'
                            : 'bg-background/50'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  {mcq?.formula && (
                    <div className="p-3 bg-blue-500/10 rounded mb-3">
                      <div dangerouslySetInnerHTML={{ __html: mcq?.formula }} />
                    </div>
                  )}
                  <div className="p-3 bg-blue-500/5 rounded border-l-2 border-blue-500">
                    <p className="text-blue-600 dark:text-blue-400 font-medium text-xs mb-1">Explanation:</p>
                    <p className="text-xs text-foreground/80">{mcq?.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Memory Boosters */}
        {memoryBooster && memoryBooster.length > 0 && (
          <div className="p-2 py-4 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20 rounded-lg border">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold">Memory Boosters</h3>
            </div>
            <div className="space-y-4">
              {memoryBooster?.map((booster, idx) => (
                <div key={idx} className="p-4 bg-background/50 rounded-lg border border-border/30">
                  <p className="text-sm leading-relaxed mb-3">{booster?.text}</p>
                  {booster?.formula && (
                    <div className="p-3 bg-blue-500/10 rounded">
                      <div dangerouslySetInnerHTML={{ __html: booster?.formula }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Coach */}
        {aiCoach && aiCoach.length > 0 && (
          <div className="p-2 py-4 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20 rounded-lg border">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-emerald-500" />
              <h3 className="font-semibold">AI Coach - Study Plan</h3>
            </div>
            <div className="space-y-3">
              {aiCoach?.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
             
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed mb-2">{step?.step}</p>
                    {step?.formula && (
                      <div className="p-2 bg-blue-500/10 rounded">
                        <div dangerouslySetInnerHTML={{ __html: step?.formula }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevisionPanel;