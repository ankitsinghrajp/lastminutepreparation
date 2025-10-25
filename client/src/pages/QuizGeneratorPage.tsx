import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { BookOpen, Loader2, Copy, Download, Shuffle, BookmarkPlus, Eye, EyeOff, Zap, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";

const classes = ["9th", "10th", "11th", "12th"];
const subjects = {
  "9th": ["Math", "Science", "English", "Hindi", "Social Science"],
  "10th": ["Math", "Science", "English", "Hindi", "Social Science"],
  "11th": ["Physics", "Chemistry", "Biology", "Math", "English"],
  "12th": ["Physics", "Chemistry", "Biology", "Math", "English"],
};

const chapters = {
  "Physics": ["Motion", "Laws of Motion", "Gravitation", "Work & Energy", "Sound"],
  "Chemistry": ["Chemical Reactions", "Acids & Bases", "Metals & Non-metals", "Carbon Compounds", "Periodic Table"],
  "Biology": ["Cell Structure", "Tissues", "Diversity in Living", "Health & Disease", "Natural Resources"],
  "Math": ["Real Numbers", "Polynomials", "Linear Equations", "Quadratic Equations", "Arithmetic Progressions"],
  "Science": ["Chemical Reactions", "Life Processes", "Light", "Electricity", "Magnetic Effects"],
  "English": ["All Chapters"],
  "Hindi": ["All Chapters"],
  "Social Science": ["All Chapters"],
};

interface Question {
  type: string;
  question: string;
  options?: string[];
  answer: string;
  difficulty: string;
}

export default function QuizGenerator() {
  const [selectedClass, setSelectedClass] = useState("12th");
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [selectedChapter, setSelectedChapter] = useState("Motion");
  const [topic, setTopic] = useState("");
  const [questionType, setQuestionType] = useState("Mixed");
  const [difficulty, setDifficulty] = useState("Mixed");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setShowAnswers(false);
    
    // Simulate AI generation
    setTimeout(() => {
      const generatedQuestions: Question[] = [];
      
      // Generate MCQs
      if (questionType === "MCQ" || questionType === "Mixed") {
        generatedQuestions.push(
          {
            type: "MCQ",
            question: `What is the fundamental principle related to ${selectedChapter}?`,
            options: [
              "Option A: First principle definition",
              "Option B: Second principle definition",
              "Option C: Third principle definition",
              "Option D: Fourth principle definition"
            ],
            answer: "Option A: First principle definition",
            difficulty: difficulty === "Mixed" ? "Medium" : difficulty
          },
          {
            type: "MCQ",
            question: `Which of the following correctly describes the relationship in ${selectedChapter}?`,
            options: [
              "Option A: Direct proportional relationship",
              "Option B: Inverse proportional relationship",
              "Option C: No relationship exists",
              "Option D: Exponential relationship"
            ],
            answer: "Option B: Inverse proportional relationship",
            difficulty: difficulty === "Mixed" ? "Hard" : difficulty
          }
        );
      }
      
      // Generate Fill in the Blanks
      if (questionType === "Fill-ups" || questionType === "Mixed") {
        generatedQuestions.push(
          {
            type: "Fill-ups",
            question: `The fundamental formula for ${selectedChapter} is represented as _______.`,
            answer: "F = ma (or relevant formula)",
            difficulty: difficulty === "Mixed" ? "Easy" : difficulty
          },
          {
            type: "Fill-ups",
            question: `According to the law, when the _______ increases, the _______ also increases proportionally.`,
            answer: "force, acceleration",
            difficulty: difficulty === "Mixed" ? "Medium" : difficulty
          }
        );
      }
      
      // Generate True/False
      if (questionType === "True/False" || questionType === "Mixed") {
        generatedQuestions.push(
          {
            type: "True/False",
            question: `The principle of ${selectedChapter} states that action and reaction forces act on the same body.`,
            answer: "False - They act on different bodies",
            difficulty: difficulty === "Mixed" ? "Easy" : difficulty
          },
          {
            type: "True/False",
            question: `In ${selectedChapter}, the rate of change is directly proportional to the applied force.`,
            answer: "True",
            difficulty: difficulty === "Mixed" ? "Medium" : difficulty
          }
        );
      }

      // Add topic-specific questions if topic is provided
      if (topic) {
        generatedQuestions.push({
          type: "MCQ",
          question: `Regarding ${topic}, which statement is most accurate?`,
          options: [
            "Option A: First interpretation",
            "Option B: Second interpretation",
            "Option C: Third interpretation",
            "Option D: Fourth interpretation"
          ],
          answer: "Option C: Third interpretation",
          difficulty: difficulty === "Mixed" ? "Hard" : difficulty
        });
      }

      setQuestions(generatedQuestions);
      setLoading(false);
      toast.success(`Generated ${generatedQuestions.length} questions successfully!`);
    }, 2000);
  };

  const handleCopyQuestions = () => {
    if (questions.length === 0) {
      toast.error("No questions to copy");
      return;
    }
    
    let text = `📚 QUIZ - ${selectedSubject} (${selectedChapter})\n`;
    text += `Class: ${selectedClass} | Difficulty: ${difficulty}\n\n`;
    text += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    questions.forEach((q, idx) => {
      text += `Q${idx + 1}. [${q.type}] [${q.difficulty}]\n${q.question}\n`;
      if (q.options) {
        q.options.forEach(opt => text += `   ${opt}\n`);
      }
      if (showAnswers) {
        text += `\n✓ Answer: ${q.answer}\n`;
      }
      text += "\n";
    });
    
    navigator.clipboard.writeText(text);
    toast.success("Questions copied to clipboard!");
  };

  const handleDownload = () => {
    if (questions.length === 0) {
      toast.error("No questions to download");
      return;
    }
    toast.success("Download feature coming soon!");
  };

  const handleShuffle = () => {
    if (questions.length === 0) {
      toast.error("No questions to shuffle");
      return;
    }
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    toast.success("Questions shuffled!");
  };

  const handleSaveToRevision = () => {
    if (questions.length === 0) {
      toast.error("No questions to save");
      return;
    }
    toast.success("Saved to revision planner! (Feature coming soon)");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-3 sm:px-4 py-20 sm:py-24 max-w-7xl">
      

        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Quizes World
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Generate interactive practice questions with instant AI-powered answers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                <h2 className="text-lg sm:text-xl font-semibold">Question Settings</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-1 sm:mb-2 block">Select Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedSubject(subjects[e.target.value][0]);
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 sm:mb-2 block">Select Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      setSelectedChapter(chapters[e.target.value]?.[0] || "All Chapters");
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {subjects[selectedClass].map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 sm:mb-2 block">Select Chapter</label>
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {chapters[selectedSubject]?.map((ch) => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <label className="text-sm font-medium mb-1 sm:mb-2 block">Question Type</label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Mixed">Mixed (All Types)</option>
                    <option value="MCQ">MCQ Only</option>
                    <option value="Fill-ups">Fill-ups Only</option>
                    <option value="True/False">True/False Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 sm:mb-2 block">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Mixed">Mixed</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 sm:mb-2 block">Specific Topic (Optional)</label>
                  <Input
                    placeholder="e.g., Newton's Laws"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-background border-border focus:ring-2 focus:ring-amber-500 text-sm sm:text-base"
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 text-sm sm:text-base py-2 sm:py-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Questions
                  </>
                )}
              </Button>
            </Card>

            <Card className="p-4 sm:p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                  <h2 className="text-lg sm:text-xl font-semibold">Generated Questions</h2>
                  {questions.length > 0 && (
                    <span className="text-sm text-muted-foreground">({questions.length} questions)</span>
                  )}
                </div>
                
                {questions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => setShowAnswers(!showAnswers)}
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                    >
                      {showAnswers ? (
                        <>
                          <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="text-xs sm:text-sm">Hide Answers</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="text-xs sm:text-sm">Show Answers</span>
                        </>
                      )}
                    </Button>
                    
                    <div className="flex gap-2 flex-1 sm:flex-none">
                      <Button
                        onClick={handleShuffle}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Shuffle className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      
                      <Button
                        onClick={handleCopyQuestions}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      
                      <Button
                        onClick={handleDownload}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4">
                {questions.length === 0 ? (
                  <div className="bg-background/80 rounded-lg p-6 sm:p-12 text-center">
                    <BookOpen className="h-8 w-8 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 opacity-50 text-muted-foreground" />
                    <p className="text-base sm:text-lg text-muted-foreground">Generated quiz questions will appear here</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">Select your preferences and click "Generate Questions"</p>
                  </div>
                ) : (
                  questions.map((q, idx) => (
                    <div key={idx} className="bg-background/80 rounded-lg p-4 sm:p-5 border border-border">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold text-xs sm:text-sm">
                            {idx + 1}
                          </span>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            <span className="px-2 py-1 sm:px-3 sm:py-1 bg-amber-500/20 text-amber-500 rounded-full text-xs font-medium">
                              {q.type}
                            </span>
                            <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${
                              q.difficulty === "Easy" ? "bg-green-500/20 text-green-500" :
                              q.difficulty === "Medium" ? "bg-yellow-500/20 text-yellow-500" :
                              "bg-red-500/20 text-red-500"
                            }`}>
                              {q.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm sm:text-base font-medium mb-3">{q.question}</p>
                      
                      {q.options && (
                        <div className="space-y-1 sm:space-y-2 mb-3">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                              <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-secondary text-xs mt-0.5 flex-shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="break-words flex-1">{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {showAnswers && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-start gap-2">
                            <span className="text-green-500 font-medium text-xs sm:text-sm flex-shrink-0">✓ Answer:</span>
                            <span className="text-xs sm:text-sm text-green-500 break-words">{q.answer}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar - Hidden on mobile unless toggled */}
          <div className={`lg:col-span-1 ${mobileSidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <Card className="p-4 sm:p-6 bg-card/50 border-border/50 backdrop-blur-sm lg:sticky lg:top-24">
              <div className="flex items-center justify-between lg:justify-start gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <BookmarkPlus className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                  <h2 className="text-lg sm:text-xl font-semibold">Quick Actions</h2>
                </div>
                <Button
                  onClick={() => setMobileSidebarOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Button
                  onClick={handleSaveToRevision}
                  variant="outline"
                  className="w-full justify-start text-xs sm:text-sm"
                  disabled={questions.length === 0}
                >
                  <BookmarkPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Save to Revision
                </Button>

                <Button
                  onClick={handleCopyQuestions}
                  variant="outline"
                  className="w-full justify-start text-xs sm:text-sm"
                  disabled={questions.length === 0}
                >
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Copy All Questions
                </Button>

                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full justify-start text-xs sm:text-sm"
                  disabled={questions.length === 0}
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Download as PDF
                </Button>

                <Button
                  onClick={handleShuffle}
                  variant="outline"
                  className="w-full justify-start text-xs sm:text-sm"
                  disabled={questions.length === 0}
                >
                  <Shuffle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Shuffle Questions
                </Button>
              </div>

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
                <h3 className="font-semibold mb-2 text-xs sm:text-sm">📚 Study Tips</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Practice mixed difficulty for better preparation</li>
                  <li>• Hide answers first, then self-check</li>
                  <li>• Shuffle questions to test real understanding</li>
                  <li>• Focus on weak areas using topic filter</li>
                  <li>• Review wrong answers thoroughly</li>
                </ul>
              </div>

              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-secondary/50 rounded-lg">
                <h3 className="font-semibold mb-2 text-xs sm:text-sm">✨ Features</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Multiple question types</li>
                  <li>✓ Adjustable difficulty levels</li>
                  <li>✓ Topic-specific generation</li>
                  <li>✓ Show/hide answers toggle</li>
                  <li>✓ Export and save options</li>
                  <li>✓ Universal curriculum support</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}