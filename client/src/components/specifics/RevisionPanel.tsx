import { Brain, BookOpen, Lightbulb, Calculator, AlertCircle, FileText, CheckCircle, Target, Zap } from "lucide-react";

const RevisionPanel = ({ revision }) => {
  if (!revision || Object.keys(revision).length === 0) {
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
        {/* Chapter Overview */}
        <div className="p-4 sm:p-6 bg-card/50 border-border/50 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold">Chapter Overview</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Chapter</p>
              <p className="text-sm font-medium">{revision?.ChapterOverview?.chapterName}</p>
            </div>
            <div className="p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Key Theme</p>
              <p className="text-sm font-medium">{revision?.ChapterOverview?.keyTheme}</p>
            </div>
            <div className="p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Exam Weightage</p>
              <p className="text-sm font-medium">{revision?.ChapterOverview?.examWeightage}</p>
            </div>
            <div className="p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Time to Revise</p>
              <p className="text-sm font-medium">{revision?.ChapterOverview?.timeToRevise}</p>
            </div>
          </div>
        </div>

        {/* Quick Concepts */}
        <div className="p-4 sm:p-6 bg-card/50 border-border/50 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold">Quick Concepts</h3>
          </div>
          <div className="space-y-4">
            {revision?.QuickConcepts?.map((concept, idx) => (
              <div key={idx} className="p-4 bg-background/50 rounded-lg border border-border/30">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="font-medium text-sm sm:text-base flex-1">{concept?.topic}</p>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-xs font-medium flex-shrink-0">
                    {concept?.priority}
                  </span>
                </div>
                <ul className="space-y-1.5 mb-3">
                  {concept?.points?.map((pt, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
                <div className="p-2 bg-green-500/5 rounded border-l-2 border-green-500">
                  <p className="text-green-600 dark:text-green-400 font-medium text-xs mb-1">Exam Tip:</p>
                  <p className="text-xs text-foreground/80">{concept?.examTip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulas & Equations */}
        <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Formulas & Equations</h3>
          </div>
          <div className="space-y-4">
            {revision?.FormulasAndEquations?.map((f, i) => (
              <div key={i} className="p-4 bg-background/50 rounded-lg border border-border/30">
                <div className="mb-2">
                  <p className="font-medium text-sm mb-1">{f?.concept}</p>
                  <div className="p-2 bg-blue-500/10 rounded">
                    <p className="text-sm font-mono text-blue-600 dark:text-blue-400">{f?.formula}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-background/50 rounded">
                      <p className="text-muted-foreground mb-1">Unit</p>
                      <p className="font-medium">{f?.unit}</p>
                    </div>
                    <div className="p-2 bg-background/50 rounded">
                      <p className="text-muted-foreground mb-1">Application</p>
                      <p>{f?.application}</p>
                    </div>
                  </div>
                  <div className="p-2 bg-red-500/5 rounded border-l-2 border-red-500">
                    <p className="text-red-600 dark:text-red-400 font-medium mb-1">Common Error:</p>
                    <p className="text-foreground/80">{f?.commonError}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Confusions */}
        <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold">Common Confusions</h3>
          </div>
          <div className="space-y-4">
            {revision?.CommonConfusions?.map((item, i) => (
              <div key={i} className="p-4 bg-background/50 rounded-lg border border-border/30">
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-red-500/5 rounded border-l-2 border-red-500">
                    <p className="text-red-600 dark:text-red-400 font-medium mb-1">Misconception:</p>
                    <p className="text-foreground/80">{item?.misconception}</p>
                  </div>
                  <div className="p-2 bg-green-500/5 rounded border-l-2 border-green-500">
                    <p className="text-green-600 dark:text-green-400 font-medium mb-1">Correct:</p>
                    <p className="text-foreground/80">{item?.correct}</p>
                  </div>
                  <div className="p-2 bg-purple-500/5 rounded border-l-2 border-purple-500">
                    <p className="text-purple-600 dark:text-purple-400 font-medium mb-1">Trick:</p>
                    <p className="text-foreground/80">{item?.trick}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Must-Know Definitions */}
        <div className="p-4 sm:p-6 bg-card/50 border-border/50 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold">Must-Know Definitions</h3>
          </div>
          <div className="space-y-4">
            {revision?.MustKnowDefinitions?.map((def, i) => (
              <div key={i} className="p-4 bg-background/50 rounded-lg border border-border/30">
                <p className="font-medium text-sm mb-2">{def?.term}</p>
                <p className="text-sm mb-2 leading-relaxed">{def?.definition}</p>
                <div className="p-2 bg-blue-500/5 rounded border-l-2 border-blue-500">
                  <p className="text-blue-600 dark:text-blue-400 font-medium text-xs mb-1">Example:</p>
                  <p className="text-xs text-foreground/80 italic">{def?.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revision Checklist */}
        <div className="p-4 sm:p-6 bg-card/50 border-border/50 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold">Revision Checklist</h3>
          </div>
          <div className="space-y-2.5">
            {revision?.RevisionChecklist?.map((task, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg hover:bg-background/80 transition-colors">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </div>
                <p className="text-sm leading-relaxed flex-1">{task}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Exam Strategy */}
        <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Exam Strategy</h3>
          </div>
          <div className="space-y-3">
            {revision?.ExamStrategy?.mcqTips && (
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2">MCQ Tips</p>
                <ul className="space-y-1">
                  {revision?.ExamStrategy?.mcqTips?.map((tip, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {revision?.ExamStrategy?.shortAnswerTips && (
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2">Short Answer Tips</p>
                <ul className="space-y-1">
                  {revision?.ExamStrategy?.shortAnswerTips?.map((tip, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {revision?.ExamStrategy?.caseBasedTips && (
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2">Case-Based Tips</p>
                <ul className="space-y-1">
                  {revision?.ExamStrategy?.caseBasedTips?.map((tip, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {revision?.ExamStrategy?.longAnswerTips && (
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2">Long Answer Tips</p>
                <ul className="space-y-1">
                  {revision?.ExamStrategy?.longAnswerTips?.map((tip, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {revision?.ExamStrategy?.lastHour && (
              <div className="p-3 bg-background/50 rounded-lg border-l-2 border-orange-500">
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-2">⏰ Last Hour Focus</p>
                <ul className="space-y-1">
                  {revision?.ExamStrategy?.lastHour?.map((item, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {revision?.ExamStrategy?.avoid && (
              <div className="p-3 bg-background/50 rounded-lg border-l-2 border-red-500">
                <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">✗ Avoid</p>
                <ul className="space-y-1">
                  {revision?.ExamStrategy?.avoid?.map((item, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {revision?.ExamStrategy?.examHall && (
              <div className="p-3 bg-background/50 rounded-lg border-l-2 border-green-500">
                <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">✓ Exam Hall Tips</p>
                <ul className="space-y-1">
                  {revision?.ExamStrategy?.examHall?.map((item, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisionPanel;