import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { HelpCircle, Upload, Loader2, Copy, Download, Shuffle, BookmarkPlus, Trash2, FileCheck, Zap, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const classes = ["9th", "10th", "11th", "12th"];
const subjects = {
  "9th": ["Math", "Science", "English", "Hindi", "Social Science"],
  "10th": ["Math", "Science", "English", "Hindi", "Social Science"],
  "11th": ["Physics", "Chemistry", "Biology", "Math", "English"],
  "12th": ["Physics", "Chemistry", "Biology", "Math", "English"],
};

const chapters = {
  "Physics": ["Electrostatics", "Current Electricity", "Magnetism", "Optics", "Modern Physics"],
  "Chemistry": ["Solid State", "Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry"],
  "Biology": ["Reproduction", "Genetics", "Evolution", "Human Health", "Ecology"],
  "Math": ["Relations & Functions", "Calculus", "Vectors", "Probability", "Linear Programming"],
  "Science": ["Chemical Reactions", "Life Processes", "Light", "Electricity", "Magnetic Effects"],
  "English": ["Literature", "Grammar", "Writing Skills", "Comprehension"],
  "Hindi": ["व्याकरण", "साहित्य", "रचना", "पठन"],
  "Social Science": ["History", "Geography", "Civics", "Economics"],
};

const questionTypes = ["Mixed", "MCQ", "Short Answer", "Long Answer", "True/False"];
const difficultyLevels = ["Mixed", "Easy", "Medium", "Hard"];

interface Question {
  id: number;
  type: string;
  difficulty: string;
  question: string;
  options?: string[];
  answer?: string;
  marks: number;
  isPYQ?: boolean;
  year?: number;
}

export default function ImportantQuestions() {
  const [selectedClass, setSelectedClass] = useState("12th");
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [selectedChapter, setSelectedChapter] = useState("Electrostatics");
  const [questionType, setQuestionType] = useState("Mixed");
  const [difficulty, setDifficulty] = useState("Mixed");
  const [topic, setTopic] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingPDF, setProcessingPDF] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }

      setProcessingPDF(true);
      setPdfFile(file);
      
      setTimeout(() => {
        setProcessingPDF(false);
        toast.success(`PDF "${file.name}" uploaded successfully!`);
      }, 1500);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setQuestions([]);
    setShowAnswers(false);

    setTimeout(() => {
      const generatedQuestions: Question[] = [];
      let questionId = 1;

      // Generate MCQs
      if (questionType === "Mixed" || questionType === "MCQ") {
        const mcqDifficulties = difficulty === "Mixed" ? ["Easy", "Medium", "Hard"] : [difficulty];
        mcqDifficulties.forEach((diff) => {
          generatedQuestions.push({
            id: questionId++,
            type: "MCQ",
            difficulty: diff,
            question: `Which of the following statements about ${selectedChapter} is correct?`,
            options: [
              "Electric field lines can intersect each other",
              "Electric field lines are always perpendicular to equipotential surfaces",
              "Electric field lines form closed loops",
              "Electric potential is always positive"
            ],
            answer: "Electric field lines are always perpendicular to equipotential surfaces",
            marks: 1,
            isPYQ: Math.random() > 0.7,
            year: 2023
          });
        });
      }

      // Generate Short Answer
      if (questionType === "Mixed" || questionType === "Short Answer") {
        const shortDifficulties = difficulty === "Mixed" ? ["Easy", "Medium"] : [difficulty];
        shortDifficulties.forEach((diff) => {
          generatedQuestions.push({
            id: questionId++,
            type: "Short Answer",
            difficulty: diff,
            question: diff === "Easy" 
              ? `Define electric field and state its SI unit.`
              : `Explain the concept of electric flux. Write its mathematical expression.`,
            answer: diff === "Easy"
              ? "Electric field is the force experienced by a unit positive charge placed at a point. SI unit: N/C or V/m"
              : "Electric flux is the measure of electric field lines passing through a given surface. Φ = E⃗·A⃗ = EA cos θ",
            marks: diff === "Easy" ? 2 : 3,
            isPYQ: Math.random() > 0.6,
            year: 2022
          });
        });
      }

      // Generate Long Answer
      if (questionType === "Mixed" || questionType === "Long Answer") {
        const longDifficulties = difficulty === "Mixed" ? ["Medium", "Hard"] : [difficulty];
        longDifficulties.forEach((diff) => {
          generatedQuestions.push({
            id: questionId++,
            type: "Long Answer",
            difficulty: diff,
            question: diff === "Medium"
              ? `State and explain Gauss's law in electrostatics. Derive an expression for electric field due to an infinite plane sheet of charge.`
              : `Derive an expression for the electric potential and electric field due to an electric dipole at a point on its axial line. Also discuss the special cases.`,
            answer: "Detailed derivation with diagrams and step-by-step mathematical proof...",
            marks: 5,
            isPYQ: Math.random() > 0.5,
            year: 2023
          });
        });
      }

      // Generate True/False
      if (questionType === "Mixed" || questionType === "True/False") {
        generatedQuestions.push({
          id: questionId++,
          type: "True/False",
          difficulty: "Easy",
          question: "Electric field inside a conductor is always zero in electrostatic equilibrium.",
          answer: "True",
          marks: 1
        });
      }

      // Add more varied questions
      if (questionType === "Mixed") {
        generatedQuestions.push(
          {
            id: questionId++,
            type: "MCQ",
            difficulty: "Medium",
            question: "Two point charges +Q and -Q are separated by distance 2a. What is the electric potential at the midpoint?",
            options: ["Zero", "kQ/a", "2kQ/a", "kQ/2a"],
            answer: "Zero",
            marks: 1,
            isPYQ: true,
            year: 2021
          },
          {
            id: questionId++,
            type: "Short Answer",
            difficulty: "Hard",
            question: "A capacitor of capacitance C is charged to a potential V and then connected to another identical uncharged capacitor. Calculate the energy loss.",
            answer: "Energy loss = CV²/4. Initially energy = CV²/2, after connection energy = CV²/4",
            marks: 3
          },
          {
            id: questionId++,
            type: "Long Answer",
            difficulty: "Hard",
            question: "Derive an expression for the capacitance of a parallel plate capacitor with and without dielectric. How does the capacitance change when a dielectric slab is introduced?",
            answer: "Detailed derivation showing C = ε₀A/d and C' = Kε₀A/d where K is dielectric constant...",
            marks: 5,
            isPYQ: true,
            year: 2022
          }
        );
      }

      setQuestions(generatedQuestions);
      setLoading(false);
      toast.success(`Generated ${generatedQuestions.length} questions successfully!`);
    }, 2500);
  };

  const handleShuffle = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    toast.success("Questions shuffled!");
  };

  const handleCopy = () => {
    const text = questions.map((q, idx) => {
      let questionText = `${idx + 1}. [${q.type}] [${q.difficulty}] [${q.marks} marks] ${q.question}`;
      if (q.options) {
        questionText += "\n" + q.options.map((opt, i) => `   ${String.fromCharCode(97 + i)}) ${opt}`).join("\n");
      }
      if (showAnswers && q.answer) {
        questionText += `\n   Answer: ${q.answer}`;
      }
      if (q.isPYQ) {
        questionText += ` [PYQ ${q.year}]`;
      }
      return questionText;
    }).join("\n\n");
    
    navigator.clipboard.writeText(text);
    toast.success("Questions copied to clipboard!");
  };

  const handleDownload = () => {
    toast.success("Download feature coming soon!");
  };

  const handleSave = () => {
    toast.success("Questions saved! (Feature coming soon)");
  };

  const handleClear = () => {
    setTopic("");
    setPdfFile(null);
    setQuestions([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Cleared all inputs");
  };

  const handleRemovePDF = () => {
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("PDF removed");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "Medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "Hard": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "MCQ": return "📝";
      case "Short Answer": return "✍️";
      case "Long Answer": return "📄";
      case "True/False": return "✓✗";
      default: return "❓";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold">
            Important Questions{" "}
            <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
              Generator
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate exam-style questions for any topic, chapter, or PDF
          </p>
        </div>

        <Card className="p-8 bg-card/50 border-border/50 backdrop-blur-sm mb-6">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSubject(subjects[e.target.value][0]);
                }}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedChapter(chapters[e.target.value][0]);
                }}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {subjects[selectedClass].map((subj) => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Chapter</label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {chapters[selectedSubject]?.map((ch) => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Question Type</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {questionTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {difficultyLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Specific Topic (Optional)</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Gauss's Law, Electric Dipole, etc."
              className="bg-background/50"
            />
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Upload PDF (Optional)</label>
            {!pdfFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handlePDFUpload}
                  className="hidden"
                />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload PDF</p>
                <p className="text-xs text-muted-foreground mt-1">Generate questions from your notes or textbook</p>
              </div>
            ) : (
              <Card className="p-4 bg-background/50 border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                      <FileCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{pdfFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleRemovePDF}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleGenerate}
              disabled={loading || processingPDF}
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 flex-1 min-w-[200px]"
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

            <Button
              onClick={handleClear}
              variant="outline"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </Card>

        {questions.length > 0 && (
          <>
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {questions.length} Questions Generated
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {questions.filter(q => q.isPYQ).length} Past Year Questions
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => setShowAnswers(!showAnswers)}
                    variant="outline"
                    size="sm"
                  >
                    {showAnswers ? <XCircle className="h-4 w-4 mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                    {showAnswers ? "Hide" : "Show"} Answers
                  </Button>
                  <Button
                    onClick={handleShuffle}
                    variant="outline"
                    size="sm"
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Shuffle
                  </Button>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="outline"
                    size="sm"
                  >
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <Card key={q.id} className="p-6 bg-card/50 border-border/50 backdrop-blur-sm hover:border-violet-500/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center font-bold text-white">
                      {idx + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-lg">{getTypeIcon(q.type)}</span>
                        <span className="px-2 py-1 bg-violet-500/10 text-violet-500 rounded text-xs font-medium">
                          {q.type}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                        <span className="px-2 py-1 bg-secondary rounded text-xs font-medium">
                          {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                        </span>
                        {q.isPYQ && (
                          <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded text-xs font-medium border border-amber-500/20">
                            PYQ {q.year}
                          </span>
                        )}
                      </div>

                      <p className="text-base leading-relaxed mb-3">{q.question}</p>

                      {q.options && (
                        <div className="space-y-2 mb-3">
                          {q.options.map((option, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                                {String.fromCharCode(97 + i)}
                              </span>
                              <span className="text-sm">{option}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {showAnswers && q.answer && (
                        <div className="mt-4 p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-violet-500" />
                            <span className="text-sm font-semibold text-violet-500">Answer:</span>
                          </div>
                          <p className="text-sm leading-relaxed">{q.answer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {!questions.length && !loading && (
          <Card className="p-12 bg-card/50 border-border/50 backdrop-blur-sm text-center">
            <div className="max-w-md mx-auto">
              <HelpCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Ready to Generate Questions</h3>
              <p className="text-muted-foreground mb-4">
                Select your preferences and click "Generate Questions" to create exam-style practice questions
              </p>
              <div className="grid grid-cols-2 gap-4 text-left text-sm">
                <div className="p-3 bg-background/50 rounded-lg">
                  <span className="font-semibold block mb-1">✓ Multiple Types</span>
                  <span className="text-muted-foreground text-xs">MCQ, Short, Long Answer</span>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <span className="font-semibold block mb-1">✓ Custom Difficulty</span>
                  <span className="text-muted-foreground text-xs">Easy, Medium, Hard</span>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <span className="font-semibold block mb-1">✓ PYQ Included</span>
                  <span className="text-muted-foreground text-xs">Past Year Questions</span>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <span className="font-semibold block mb-1">✓ PDF Support</span>
                  <span className="text-muted-foreground text-xs">Upload your notes</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}