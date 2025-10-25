import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { BookOpen, Loader2, Brain, FileText, Lightbulb, AlertCircle, Copy, BookmarkPlus } from "lucide-react";
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
  "Physics": ["Electrostatics", "Current Electricity", "Magnetism", "Optics", "Modern Physics"],
  "Chemistry": ["Solid State", "Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry"],
  "Biology": ["Reproduction", "Genetics", "Evolution", "Human Health", "Ecology"],
  "Math": ["Relations & Functions", "Calculus", "Vectors", "Probability", "Linear Programming"],
  "Science": ["Chemical Reactions", "Life Processes", "Light", "Electricity", "Magnetic Effects"],
  "English": ["Literature", "Grammar", "Writing Skills", "Comprehension"],
  "Hindi": ["व्याकरण", "साहित्य", "रचना", "पठन"],
  "Social Science": ["History", "Geography", "Civics", "Economics"],
};

const importantTopicsData = {
  "Physics": {
    "Electrostatics": [
      "Coulomb's Law and Electric Field",
      "Gauss's Law and Applications",
      "Electric Potential and Capacitance",
      "Dielectrics and Polarization"
    ],
    "Current Electricity": [
      "Ohm's Law and Resistance",
      "Kirchhoff's Laws",
      "Wheatstone Bridge",
      "Meter Bridge and Potentiometer"
    ]
  },
  "Chemistry": {
    "Solid State": [
      "Crystal Lattice and Unit Cells",
      "Packing Efficiency",
      "Imperfections in Solids",
      "Magnetic and Electrical Properties"
    ]
  },
  "Math": {
    "Calculus": [
      "Limits and Continuity",
      "Differentiation and Applications",
      "Integration Techniques",
      "Definite Integrals and Areas"
    ]
  }
};

const pyqsData = {
  "Physics": {
    "Electrostatics": [
      { question: "Derive an expression for electric field due to an infinite plane sheet of charge.", year: 2023, marks: 5 },
      { question: "State and explain Gauss's theorem in electrostatics.", year: 2022, marks: 3 },
      { question: "Two point charges +4μC and -2μC are separated by 10cm. Find the electric field at midpoint.", year: 2021, marks: 3 }
    ],
    "Current Electricity": [
      { question: "State Kirchhoff's laws. Apply them to find current in a given circuit.", year: 2023, marks: 5 },
      { question: "Derive expression for balancing condition of Wheatstone bridge.", year: 2022, marks: 3 }
    ]
  },
  "Chemistry": {
    "Solid State": [
      { question: "Calculate the packing efficiency of FCC and BCC crystal lattices.", year: 2023, marks: 5 },
      { question: "Distinguish between Schottky and Frenkel defects.", year: 2022, marks: 3 }
    ]
  },
  "Math": {
    "Calculus": [
      { question: "Find dy/dx if y = sin⁻¹(2x√(1-x²))", year: 2023, marks: 4 },
      { question: "Evaluate: ∫(sin x + cos x)/√(1 + sin 2x) dx", year: 2022, marks: 4 }
    ]
  }
};

export default function ChapterWiseStudy() {
  const [selectedClass, setSelectedClass] = useState("12th");
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [selectedChapter, setSelectedChapter] = useState("Electrostatics");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [importantTopics, setImportantTopics] = useState<string[]>([]);
  const [pyqs, setPYQs] = useState<{ question: string; year: number; marks: number }[]>([]);

  useEffect(() => {
    const topics = importantTopicsData[selectedSubject]?.[selectedChapter] || [];
    const questions = pyqsData[selectedSubject]?.[selectedChapter] || [];
    setImportantTopics(topics);
    setPYQs(questions);
  }, [selectedClass, selectedSubject, selectedChapter]);

  const handleGenerate = async () => {
    setLoading(true);
    setSummary("");
    
    setTimeout(() => {
      const generatedSummary = `📚 CHAPTER SUMMARY: ${selectedChapter}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 OVERVIEW:
This chapter covers fundamental concepts that form the backbone of ${selectedSubject}. Understanding these principles is crucial for both theoretical knowledge and practical problem-solving in examinations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 KEY CONCEPTS:

1. FUNDAMENTAL PRINCIPLES
   • Core definitions and basic terminology
   • Mathematical foundations and formulations
   • Physical/Chemical significance and real-world applications
   • Relationship with other chapters and concepts

2. IMPORTANT FORMULAS & DERIVATIONS
   • Primary equations you must memorize
   • Step-by-step derivation methods
   • When and how to apply each formula
   • Common variations and special cases

3. PROBLEM-SOLVING TECHNIQUES
   • Standard approach to numerical problems
   • Short-cut methods for quick solutions
   • Common mistakes to avoid
   • Tips for writing step-by-step solutions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 QUICK REVISION POINTS:

✓ Remember the fundamental definitions word-for-word
✓ Practice deriving key formulas at least 3 times
✓ Solve minimum 5 numerical problems of each type
✓ Draw and label diagrams clearly with proper annotations
✓ Understand the physical/practical significance of concepts
✓ Review previous year questions for pattern analysis

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎓 EXAM STRATEGY:

• Theory Questions: Use proper terminology, write in points
• Numerical Problems: Always write given data, formula, and units
• Derivations: Show all steps clearly, don't skip intermediate steps
• Diagrams: Use pencil, label properly, maintain cleanliness
• Time Management: Allocate time based on marks (1 mark = 1 minute)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ LAST-MINUTE TIPS:

• Focus on high-weightage topics (5 marks questions)
• Revise important formulas 1 hour before exam
• Practice previous year questions
• Keep your concepts crystal clear
• Stay calm and read questions carefully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Good luck with your preparation! 🌟`;

      setSummary(generatedSummary);
      setLoading(false);
      toast.success("Chapter summary generated successfully!");
    }, 2000);
  };

  const handleCopySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      toast.success("Summary copied to clipboard!");
    }
  };

  const handleMarkImportant = () => {
    toast.success("Marked as important! (Feature coming soon)");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold">
            Chapter Wise{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Study Guide
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered summaries, key points, and important questions for every chapter
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
                  setSummary("");
                }}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                  setSummary("");
                }}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                onChange={(e) => {
                  setSelectedChapter(e.target.value);
                  setSummary("");
                }}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {chapters[selectedSubject]?.map((ch) => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 flex-1 min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>

            <Button
              onClick={handleCopySummary}
              disabled={!summary}
              variant="outline"
              className="flex-none"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>

            <Button
              onClick={handleMarkImportant}
              disabled={!summary}
              variant="outline"
              className="flex-none"
            >
              <BookmarkPlus className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">AI-Generated Chapter Summary</h2>
              </div>
              
              <div className="bg-background/80 rounded-lg p-6 min-h-[400px] font-mono text-sm">
                {summary ? (
                  <pre className="whitespace-pre-wrap leading-relaxed">{summary}</pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Brain className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg">Your chapter summary will appear here</p>
                    <p className="text-sm mt-2">Select class, subject, and chapter, then click "Generate Summary"</p>
                  </div>
                )}
              </div>
            </Card>

            {pyqs.length > 0 && (
              <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Past Year Questions (PYQs)</h2>
                </div>
                
                <div className="space-y-3">
                  {pyqs.map((q, idx) => (
                    <div key={idx} className="p-4 bg-background/50 rounded-lg border border-border/50 hover:border-blue-600/50 transition-colors">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <span className="text-blue-600 font-semibold text-sm">Q{idx + 1}.</span>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-blue-600/10 text-blue-600 rounded text-xs font-medium">
                            {q.marks} marks
                          </span>
                          <span className="px-2 py-1 bg-secondary rounded text-xs font-medium">
                            {q.year}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed pl-6">{q.question}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            {importantTopics.length > 0 && (
              <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Important Topics</h2>
                </div>
                
                <div className="space-y-3">
                  {importantTopics.map((topic, idx) => (
                    <div key={idx} className="p-3 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-lg border border-blue-600/20 hover:border-blue-600/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">{idx + 1}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{topic}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-lg border border-blue-600/20">
                  <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Study Tips
                  </h3>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Focus on these high-priority topics first</li>
                    <li>• Practice numericals thoroughly</li>
                    <li>• Understand concepts, don't just memorize</li>
                    <li>• Revise diagrams and derivations</li>
                    <li>• Solve previous year questions</li>
                  </ul>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}