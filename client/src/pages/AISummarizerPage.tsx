import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Sparkles, Loader2, Copy, Trash2, Lightbulb, HelpCircle, Target, BookOpen, Brain, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { useAsyncMutation } from "@/hooks/hook";
import { useSummarizerMutation } from "@/redux/api/api";
import { useSelector } from "react-redux";

const detailLevels = ["Short", "Medium", "Long"];

interface PracticeQuestion {
  question: string;
  marks: string;
  answerFormat: string;
  magicWords: string;
  commonMistake: string;
}

interface ExamIntelligence {
  chanceOfComing: string;
  whyItMatters: string;
  commonQuestionFormats: string[];
  marksDistribution: string;
  timeToSpend: string;
  examinerLooksFor: string[];
}

interface AnsweringStrategy {
  perfectAnswerStructure: string;
  mustInclude: string[];
  instantMarkLoss: string[];
  proTips: string[];
}

interface RevisionGuide {
  quickSummary: string;
  mustKnowPoints: string[];
  memoryTricks: string[];
  examIntelligence: ExamIntelligence;
  answeringStrategy: AnsweringStrategy;
  practiceQuestions: PracticeQuestion[];
  last10MinutesDrill: string[];
}

export default function AISummarizer() {
  const [topic, setTopic] = useState("");
  const {user} = useSelector((state)=>state.auth);
  const [detailLevel, setDetailLevel] = useState("Medium");
  const [revisionData, setRevisionData] = useState<RevisionGuide | null>(null);
  const [summarizer, isSummarizerLoading] = useAsyncMutation(useSummarizerMutation);

  const handleSummarize = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic to study");
      return;
    }

    setRevisionData(null);

    try {
      const formData = new FormData();
      formData.append("topic", topic);
      formData.append("level", detailLevel);
      
      const result = await summarizer("Generating your revision guide...", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
      });
      
      if (result?.data?.data?.data) {
        setRevisionData(result.data.data.data);
      }
    } catch (error) {
      toast.error("Error generating revision guide. Please try again!");
    }
  };

  const handleCopy = () => {
    if (!revisionData) return;
    
    let fullText = `📚 LAST-MINUTE REVISION: ${topic}\n\n`;
    fullText += `📖 QUICK SUMMARY:\n${revisionData.quickSummary}\n\n`;
    fullText += `💡 MUST KNOW POINTS:\n${revisionData.mustKnowPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n`;
    fullText += `🧠 MEMORY TRICKS:\n${revisionData.memoryTricks.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n`;
    fullText += `🎯 EXAM INTELLIGENCE:\nChance of Coming: ${revisionData.examIntelligence.chanceOfComing}\n`;
    fullText += `Question Formats: ${revisionData.examIntelligence.commonQuestionFormats.join(', ')}\n\n`;
    fullText += `✍️ PRACTICE QUESTIONS:\n${revisionData.practiceQuestions.map((q, i) => `Q${i + 1}. ${q.question}\nMarks: ${q.marks}\nAnswer: ${q.answerFormat}`).join('\n\n')}\n\n`;
    fullText += `⏰ LAST 10 MINUTES DRILL:\n${revisionData.last10MinutesDrill.join('\n')}`;
    
    navigator.clipboard.writeText(fullText);
    toast.success("Revision guide copied to clipboard!");
  };

  const handleClear = () => {
    setTopic("");
    setRevisionData(null);
    toast.success("Cleared - Ready for new topic");
  };

  const getChanceColor = (chance: string) => {
    if (chance.toLowerCase().includes('high')) return 'text-red-500';
    if (chance.toLowerCase().includes('medium')) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-3 sm:px-4 py-20 sm:py-24 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold px-4">
            AI Topic{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Summarizer
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Last-minute revision guide with exam tips, tricks & practice questions
          </p>
        </div>

        {/* Input Section */}
        {!revisionData && (
          <>
            <Card className="p-4 sm:p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <div className="space-y-4">
                {/* Topic Input */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Enter Your Topic
                  </label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Photosynthesis, Quadratic Equations, French Revolution..."
                    className="bg-background/50 h-12 text-base"
                    onKeyDown={(e) => e.key === 'Enter' && handleSummarize()}
                  />
                </div>

                {/* Detail Level Pills */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Detail Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {detailLevels.map((level) => (
                      <button
                        key={level}
                        onClick={() => setDetailLevel(level)}
                        disabled={isSummarizerLoading}
                        className={`p-3 rounded-lg text-center transition-all text-sm font-medium ${
                          detailLevel === level
                            ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md"
                            : "bg-background/50 hover:bg-background border border-border/50"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {detailLevel === "Short" && "Quick essentials - Perfect for 30 min revision"}
                    {detailLevel === "Medium" && "Balanced coverage - Ideal for 1 hour study"}
                    {detailLevel === "Long" && "Comprehensive - Deep dive with all details"}
                  </p>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleSummarize}
                  disabled={isSummarizerLoading || !topic.trim()}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 h-12 text-base font-medium"
                >
                  {isSummarizerLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Preparing Your Guide...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate Revision Guide
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Help Card */}
            <Card className="p-4 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20 mt-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Perfect for Night-Before Revision</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Get exam-focused summaries, memory tricks, practice questions, and last-minute tips - everything you need to score marks fast!
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Results Section */}
        {revisionData && (
          <div className="space-y-4 mt-6">
            {/* Header with Actions */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold">{topic}</h2>
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
                <Button
                  onClick={handleClear}
                  variant="outline"
                  size="sm"
                  className="h-9"
                >
                  <Trash2 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">New</span>
                </Button>
              </div>
            </div>

            {/* Quick Summary */}
            <Card className="p-4 sm:p-6 bg-card/50 border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-emerald-500" />
                <h3 className="font-semibold">Quick Summary</h3>
              </div>
              <div className="prose prose-sm sm:prose-base max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base text-foreground">{revisionData.quickSummary}</p>
              </div>
            </Card>

            {/* Must Know Points */}
            <Card className="p-4 sm:p-6 bg-card/50 border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h3 className="font-semibold">Must Know Points</h3>
              </div>
              <div className="space-y-2.5">
                {revisionData.mustKnowPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg hover:bg-background/80 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{idx + 1}</span>
                    </div>
                    <p className="text-sm leading-relaxed flex-1">{point}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Memory Tricks */}
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Memory Tricks & Mnemonics</h3>
              </div>
              <div className="space-y-2.5">
                {revisionData.memoryTricks.map((trick, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed flex-1">{trick}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Exam Intelligence */}
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Exam Intelligence</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Probability</p>
                  <p className={`font-semibold ${getChanceColor(revisionData.examIntelligence.chanceOfComing)}`}>
                    {revisionData.examIntelligence.chanceOfComing}
                  </p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Why It Matters</p>
                  <p className="text-sm">{revisionData.examIntelligence.whyItMatters}</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Common Question Formats</p>
                  <ul className="space-y-1.5">
                    {revisionData.examIntelligence.commonQuestionFormats.map((format, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{format}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Marks</p>
                    <p className="text-sm font-medium">{revisionData.examIntelligence.marksDistribution}</p>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Time</p>
                    <p className="text-sm font-medium">{revisionData.examIntelligence.timeToSpend}</p>
                  </div>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Examiner Looks For</p>
                  <div className="flex flex-wrap gap-2">
                    {revisionData.examIntelligence.examinerLooksFor.map((item, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Answering Strategy */}
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold">Answering Strategy</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Perfect Answer Structure</p>
                  <p className="text-sm">{revisionData.answeringStrategy.perfectAnswerStructure}</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">✓ Must Include</p>
                  <ul className="space-y-1">
                    {revisionData.answeringStrategy.mustInclude.map((item, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">✗ Instant Mark Loss</p>
                  <ul className="space-y-1">
                    {revisionData.answeringStrategy.instantMarkLoss.map((item, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-2">💡 Pro Tips</p>
                  <ul className="space-y-1">
                    {revisionData.answeringStrategy.proTips.map((tip, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Practice Questions */}
            <Card className="p-4 sm:p-6 bg-card/50 border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="h-5 w-5 text-emerald-500" />
                <h3 className="font-semibold">Practice Questions</h3>
              </div>
              <div className="space-y-4">
                {revisionData.practiceQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-background/50 rounded-lg border border-border/30">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="text-sm font-medium flex-1"><span className="text-emerald-500">Q{idx + 1}.</span> {q.question}</p>
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-xs font-medium flex-shrink-0">
                        {q.marks} marks
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 bg-blue-500/5 rounded border-l-2 border-blue-500">
                        <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">Answer Format:</p>
                        <div className="whitespace-pre-wrap font-sans text-foreground/80">{q.answerFormat}</div>
                      </div>
                      <div className="p-2 bg-purple-500/5 rounded border-l-2 border-purple-500">
                        <p className="text-purple-600 dark:text-purple-400 font-medium mb-1">Magic Words:</p>
                        <p className="text-foreground/80">{q.magicWords}</p>
                      </div>
                      <div className="p-2 bg-red-500/5 rounded border-l-2 border-red-500">
                        <p className="text-red-600 dark:text-red-400 font-medium mb-1">Common Mistake:</p>
                        <p className="text-foreground/80">{q.commonMistake}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Last 10 Minutes Drill */}
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-red-500/5 to-orange-500/5 border-red-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold">Last 10 Minutes Drill ⏰</h3>
              </div>
              <div className="space-y-2">
                {revisionData.last10MinutesDrill.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                    <span className="text-lg">{item.startsWith('□') ? item[0] : '□'}</span>
                    <p className="text-sm leading-relaxed flex-1">{item.replace('□', '').trim()}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {!revisionData && !isSummarizerLoading && (
          <Card className="p-8 sm:p-12 bg-card/30 border-border/30 text-center mt-6">
            <Brain className="h-12 w-12 sm:h-14 sm:w-14 mx-auto mb-3 text-emerald-500/50" />
            <h3 className="text-base sm:text-lg font-medium mb-1.5 text-muted-foreground">
              Ready for Last-Minute Revision
            </h3>
            <p className="text-sm text-muted-foreground/70">
              Enter your topic and get exam-focused revision guide instantly
            </p>
          </Card>
        )}
      </div>
      <Footer/>
    </div>
  );
}