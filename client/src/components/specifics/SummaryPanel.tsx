import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  CheckCircle2, 
  Brain, 
  Target, 
  Zap, 
  HelpCircle, 
  Lightbulb, 
  AlertCircle,
  Copy,
  Trash2,
  Clock,
  TrendingUp,
  Award,
  FileText,
  Layers
} from "lucide-react";
import { toast } from "sonner";

const SummaryPanel = ({ summary, onClear }) => {
  const handleCopy = () => {
    if (!summary) return;
    
    let fullText = `📚 CHAPTER SUMMARY: ${summary?.ChapterOverview?.chapterName || 'N/A'}\n\n`;
    fullText += `📖 OVERVIEW:\n${summary?.ChapterOverview?.summary || 'N/A'}\n\n`;
    fullText += `⏱️ Study Time: ${summary?.ChapterOverview?.estimatedStudyTime || 'N/A'}\n`;
    fullText += `📊 Exam Weightage: ${summary?.ChapterOverview?.examWeightage || 'N/A'}\n\n`;
    
    if (summary?.KeyConcepts?.length) {
      fullText += `💡 KEY CONCEPTS:\n`;
      summary.KeyConcepts.forEach((concept, i) => {
        fullText += `${i + 1}. ${concept?.topic || 'N/A'}\n${concept?.explanation || 'N/A'}\n\n`;
      });
    }
    
    if (summary?.FormulasAndEquations?.length) {
      fullText += `📐 FORMULAS:\n`;
      summary.FormulasAndEquations.forEach((formula, i) => {
        fullText += `${i + 1}. ${formula?.concept || 'N/A'}: ${formula?.plainText || 'N/A'}\n`;
      });
      fullText += '\n';
    }
    
    if (summary?.MustKnowDefinitions?.length) {
      fullText += `📝 DEFINITIONS:\n`;
      summary.MustKnowDefinitions.forEach((def, i) => {
        fullText += `${i + 1}. ${def?.term || 'N/A'}: ${def?.definition || 'N/A'}\n`;
      });
    }
    
    navigator.clipboard.writeText(fullText);
    toast.success("Summary copied to clipboard!");
  };

  const getImportanceColor = (level) => {
    if (level?.toLowerCase() === 'high') return 'text-red-500';
    if (level?.toLowerCase() === 'medium') return 'text-yellow-500';
    return 'text-green-500';
  };

  const getDifficultyColor = (level) => {
    if (level?.toLowerCase() === 'hard' || level?.toLowerCase() === 'hots') return 'text-red-500';
    if (level?.toLowerCase() === 'medium') return 'text-yellow-500';
    return 'text-green-500';
  };

  if (!summary) return null;

  return (
    <div className="space-y-4 mt-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold">
            {summary?.ChapterOverview?.chapterName || 'Chapter Summary'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="h-9"
          >
            <Copy className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Copy</span>
          </Button>
          {onClear && (
            <Button
              onClick={onClear}
              variant="outline"
              size="sm"
              className="h-9"
            >
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Chapter Overview */}
      <Card className="p-4 sm:p-6 bg-card/50 border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-emerald-500" />
          <h3 className="font-semibold">Chapter Overview</h3>
        </div>
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">{summary?.ChapterOverview?.summary || 'No summary available'}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Exam Weightage</p>
              <p className="text-sm font-medium">{summary?.ChapterOverview?.examWeightage || 'N/A'}</p>
            </div>
            <div className="p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Study Time</p>
              <p className="text-sm font-medium">{summary?.ChapterOverview?.estimatedStudyTime || 'N/A'}</p>
            </div>
            <div className="p-3 bg-background/50 rounded-lg col-span-2 sm:col-span-1">
              <p className="text-xs text-muted-foreground mb-1">NCERT Reference</p>
              <p className="text-sm font-medium">{summary?.ChapterOverview?.ncertReference || 'N/A'}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Concepts */}
      {summary?.KeyConcepts?.length > 0 && (
        <Card className="p-4 sm:p-6 bg-card/50 border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold">Key Concepts</h3>
          </div>
          <div className="space-y-4">
            {summary.KeyConcepts.map((concept, idx) => (
              <div key={idx} className="p-4 bg-background/50 rounded-lg border border-border/30">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-medium text-sm">{concept?.topic || 'Untitled'}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getImportanceColor(concept?.importanceLevel)} bg-opacity-10`}>
                    {concept?.importanceLevel || 'N/A'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                  {concept?.explanation || 'No explanation available'}
                </p>
                {concept?.whyItMatters && (
                  <div className="p-2 bg-blue-500/5 rounded border-l-2 border-blue-500 mb-2">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Why It Matters:</p>
                    <p className="text-xs text-foreground/80 mt-1">{concept.whyItMatters}</p>
                  </div>
                )}
                {concept?.connectionToOtherTopics && (
                  <div className="p-2 bg-purple-500/5 rounded border-l-2 border-purple-500">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Connections:</p>
                    <p className="text-xs text-foreground/80 mt-1">{concept.connectionToOtherTopics}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Formulas and Equations */}
      {summary?.FormulasAndEquations?.length > 0 && (
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Formulas & Equations</h3>
          </div>
          <div className="space-y-4">
            {summary.FormulasAndEquations.map((formula, idx) => (
              <div key={idx} className="p-4 bg-background/50 rounded-lg border border-border/30">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-medium text-sm">{formula?.concept || 'Untitled'}</h4>
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">
                    {formula?.unit || 'N/A'}
                  </span>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg mb-3 font-mono text-sm">
                  {formula?.plainText || formula?.formula || 'N/A'}
                </div>
                {formula?.derivation && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Derivation:</p>
                    <p className="text-xs text-foreground/80 leading-relaxed">{formula.derivation}</p>
                  </div>
                )}
                {formula?.applicationContext && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Application:</p>
                    <p className="text-xs text-foreground/80">{formula.applicationContext}</p>
                  </div>
                )}
                {formula?.commonMistakes?.length > 0 && (
                  <div className="p-2 bg-red-500/5 rounded border-l-2 border-red-500">
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Common Mistakes:</p>
                    <ul className="space-y-1">
                      {formula.commonMistakes.map((mistake, i) => (
                        <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                          <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {formula?.practiceHint && (
                  <div className="p-2 bg-green-500/5 rounded border-l-2 border-green-500 mt-2">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">💡 Practice Hint:</p>
                    <p className="text-xs text-foreground/80 mt-1">{formula.practiceHint}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Important Diagrams */}
      {summary?.ImportantDiagrams?.length > 0 && (
        <Card className="p-4 sm:p-6 bg-card/50 border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold">Important Diagrams</h3>
          </div>
          <div className="space-y-4">
            {summary.ImportantDiagrams.map((diagram, idx) => (
              <div key={idx} className="p-4 bg-background/50 rounded-lg border border-border/30">
                <h4 className="font-medium text-sm mb-2">{diagram?.diagramName || 'Untitled Diagram'}</h4>
                <p className="text-xs text-muted-foreground mb-3">{diagram?.purpose || 'No purpose specified'}</p>
                
                {diagram?.keyLabels?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Key Labels:</p>
                    <div className="flex flex-wrap gap-2">
                      {diagram.keyLabels.map((label, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-xs">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {diagram?.criticalPointsToRemember?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Critical Points:</p>
                    <ul className="space-y-1">
                      {diagram.criticalPointsToRemember.map((point, i) => (
                        <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {diagram?.examTip && (
                  <div className="p-2 bg-orange-500/5 rounded border-l-2 border-orange-500">
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">📝 Exam Tip:</p>
                    <p className="text-xs text-foreground/80 mt-1">{diagram.examTip}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Must Know Definitions */}
      {summary?.MustKnowDefinitions?.length > 0 && (
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Must Know Definitions</h3>
          </div>
          <div className="space-y-4">
            {summary.MustKnowDefinitions.map((def, idx) => (
              <div key={idx} className="p-4 bg-background/50 rounded-lg border border-border/30">
                <h4 className="font-medium text-sm mb-2">{def?.term || 'Untitled Term'}</h4>
                <p className="text-sm text-foreground/90 mb-2 leading-relaxed">{def?.definition || 'No definition available'}</p>
                
                {def?.elaboration && (
                  <div className="p-2 bg-purple-500/5 rounded border-l-2 border-purple-500 mb-2">
                    <p className="text-xs text-foreground/80">{def.elaboration}</p>
                  </div>
                )}
                
                {def?.exampleInContext && (
                  <div className="p-2 bg-blue-500/5 rounded border-l-2 border-blue-500 mb-2">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Example:</p>
                    <p className="text-xs text-foreground/80 mt-1">{def.exampleInContext}</p>
                  </div>
                )}
                
                {def?.examFormat && (
                  <div className="p-2 bg-orange-500/5 rounded border-l-2 border-orange-500">
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Exam Format:</p>
                    <p className="text-xs text-foreground/80 mt-1">{def.examFormat}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Practice Questions */}
      {summary?.PracticeQuestions?.length > 0 && (
        <Card className="p-4 sm:p-6 bg-card/50 border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold">Practice Questions</h3>
          </div>
          <div className="space-y-4">
            {summary.PracticeQuestions.map((q, idx) => (
              <div key={idx} className="p-4 bg-background/50 rounded-lg border border-border/30">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-sm font-medium flex-1">
                    <span className="text-emerald-500">Q{idx + 1}.</span> {q?.question || 'No question available'}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(q?.difficultyLevel)} bg-opacity-10`}>
                      {q?.difficultyLevel || 'N/A'}
                    </span>
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-xs font-medium">
                      {q?.marks || 'N/A'} marks
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs">
                  {q?.answer && (
                    <div className="p-2 bg-blue-500/5 rounded border-l-2 border-blue-500">
                      <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">Answer:</p>
                      <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">{q.answer}</p>
                    </div>
                  )}
                  
                  {q?.keywords?.length > 0 && (
                    <div className="p-2 bg-purple-500/5 rounded border-l-2 border-purple-500">
                      <p className="text-purple-600 dark:text-purple-400 font-medium mb-1">Keywords:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {q.keywords.map((keyword, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {q?.markingScheme && (
                    <div className="p-2 bg-green-500/5 rounded border-l-2 border-green-500">
                      <p className="text-green-600 dark:text-green-400 font-medium mb-1">Marking Scheme:</p>
                      <p className="text-foreground/80">{q.markingScheme}</p>
                    </div>
                  )}
                  
                  {q?.commonErrors && (
                    <div className="p-2 bg-red-500/5 rounded border-l-2 border-red-500">
                      <p className="text-red-600 dark:text-red-400 font-medium mb-1">Common Errors:</p>
                      <p className="text-foreground/80">{q.commonErrors}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Conceptual Connections */}
      {summary?.ConceptualConnections?.length > 0 && (
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold">Conceptual Connections</h3>
          </div>
          <div className="space-y-3">
            {summary.ConceptualConnections.map((connection, idx) => (
              <div key={idx} className="p-3 bg-background/50 rounded-lg">
                <p className="text-sm mb-2 leading-relaxed">{connection?.connection || 'No connection specified'}</p>
                {connection?.whyItMatters && (
                  <div className="p-2 bg-emerald-500/5 rounded border-l-2 border-emerald-500">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Why It Matters:</p>
                    <p className="text-xs text-foreground/80 mt-1">{connection.whyItMatters}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Revision Strategies */}
      {summary?.RevisionStrategies && (
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold">Revision Strategies</h3>
          </div>
          <div className="space-y-3">
            {summary.RevisionStrategies.quickRecallTips?.length > 0 && (
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-2">Quick Recall Tips:</p>
                <ul className="space-y-1">
                  {summary.RevisionStrategies.quickRecallTips.map((tip, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <Zap className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {summary.RevisionStrategies.mnemonicsAndTricks?.length > 0 && (
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-2">Mnemonics & Tricks:</p>
                <ul className="space-y-1">
                  {summary.RevisionStrategies.mnemonicsAndTricks.map((trick, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span>{trick}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {summary.RevisionStrategies.commonConfusions?.length > 0 && (
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-2">Common Confusions:</p>
                <ul className="space-y-1">
                  {summary.RevisionStrategies.commonConfusions.map((confusion, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>{confusion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {summary.RevisionStrategies.priorityTopics && (
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">Priority Topics:</p>
                <p className="text-sm">{summary.RevisionStrategies.priorityTopics}</p>
              </div>
            )}
            
            {summary.RevisionStrategies.studySequence && (
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">Study Sequence:</p>
                <p className="text-sm">{summary.RevisionStrategies.studySequence}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Previous Year Patterns */}
      {summary?.PreviousYearPatterns && (
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border-blue-500/20">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Previous Year Patterns</h3>
          </div>
          <div className="space-y-3">
            {summary.PreviousYearPatterns.frequentQuestionTypes?.length > 0 && (
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-2">Frequent Question Types:</p>
                <div className="flex flex-wrap gap-2">
                  {summary.PreviousYearPatterns.frequentQuestionTypes.map((type, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-xs">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {summary.PreviousYearPatterns.topicsAskedMost?.length > 0 && (
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-2">Topics Asked Most:</p>
                <div className="flex flex-wrap gap-2">
                  {summary.PreviousYearPatterns.topicsAskedMost.map((topic, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded text-xs">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {summary.PreviousYearPatterns.trendAnalysis && (
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">Trend Analysis:</p>
                <p className="text-sm">{summary.PreviousYearPatterns.trendAnalysis}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SummaryPanel;