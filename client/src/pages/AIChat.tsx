import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Clock, Loader2, Copy, BookmarkPlus, FileText, Brain } from "lucide-react";
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
  "English": ["All Chapters"],
  "Hindi": ["All Chapters"],
  "Social Science": ["All Chapters"],
};

export default function LastNightBeforeExam() {
  const [selectedClass, setSelectedClass] = useState("12th");
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [selectedChapter, setSelectedChapter] = useState("All Chapters");
  const [revision, setRevision] = useState("");
  const [loading, setLoading] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerMinutes * 60);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            toast.success("Timer completed! Take a break.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timeLeft]);

  const handleGenerate = async () => {
    setLoading(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const keyPoints = `📚 KEY POINTS - ${selectedSubject} (${selectedChapter})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 CRITICAL CONCEPTS:

• Core Definition: Fundamental principles and laws specific to this topic
• Key Formulas: All important equations you must memorize
• Important Terms: Definitions that frequently appear in exams
• Common Relationships: How different concepts connect
• Real-world Applications: Practical examples for better understanding

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ QUICK REVISION TRICKS:

• Mnemonic devices for easy memorization
• Common mistakes students make - AVOID THESE!
• Time-saving calculation shortcuts
• Diagram labeling essentials
• Unit conversion quick reference

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 HIGH-YIELD IMPORTANT QUESTIONS:

1. [5 marks] Derive the main formula/principle - appears in 80% of exams
2. [3 marks] Explain the concept with a real-world example
3. [2 marks] Differentiate between related concepts
4. [3 marks] Numerical problem - standard difficulty level
5. [5 marks] Application-based question combining multiple concepts
6. [2 marks] Short definitions - frequently asked terms
7. [4 marks] Graphical interpretation question
8. [3 marks] Reasoning-based conceptual question

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 EXAM TIPS:

• Always write units in numerical answers
• Draw diagrams neatly with proper labeling
• Underline important terms in answers
• Show all calculation steps for partial marks
• Manage time: 1 mark = 1 minute approximately

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ LAST-MINUTE CHECKLIST:

☐ Review all formulas one final time
☐ Practice 2-3 numerical problems
☐ Revise diagrams and labeling
☐ Go through previous year questions
☐ Sleep well - don't stay up too late!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Good luck! You've got this! 🎓✨`;

      setRevision(keyPoints);
      setLoading(false);
      toast.success("Revision notes generated successfully!");
    }, 2000);
  };

  const handleCopyNotes = () => {
    if (revision) {
      navigator.clipboard.writeText(revision);
      toast.success("Notes copied to clipboard!");
    }
  };

  const handleMarkImportant = () => {
    toast.success("Marked as important! (Feature coming soon)");
  };

  const toggleTimer = () => {
    if (timerActive) {
      setTimerActive(false);
    } else {
      setTimeLeft(timerMinutes * 60);
      setTimerActive(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Clock className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold">
            Last Night{" "}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Before Exam
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Quick revision mode with key points and high-yield questions
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
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
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
                  setSelectedChapter("All Chapters");
                }}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="All Chapters">All Chapters</option>
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
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 flex-1 min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Revision
                </>
              )}
            </Button>

            <Button
              onClick={handleCopyNotes}
              disabled={!revision}
              variant="outline"
              className="flex-none"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Notes
            </Button>

            <Button
              onClick={handleMarkImportant}
              disabled={!revision}
              variant="outline"
              className="flex-none"
            >
              <BookmarkPlus className="h-4 w-4 mr-2" />
              Mark Important
            </Button>
          </div>
        </Card>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Revision Panel</h2>
              </div>
              
              <div className="bg-background/80 rounded-lg p-6 min-h-[500px] font-mono text-sm">
                {revision ? (
                  <pre className="whitespace-pre-wrap leading-relaxed">{revision}</pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Brain className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg">Your key points and important questions will appear here.</p>
                    <p className="text-sm mt-2">Select your class, subject, and chapter, then click "Generate Revision"</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Focus Timer</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-center">
                  <div className="text-5xl font-bold text-white mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-white/80 text-sm">
                    {timerActive ? "Focus Mode Active" : "Ready to Focus"}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Set Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={timerMinutes}
                    onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 30)}
                    disabled={timerActive}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <Button
                  onClick={toggleTimer}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
                >
                  {timerActive ? "Stop Timer" : "Start Timer"}
                </Button>

                <div className="text-xs text-muted-foreground text-center pt-2">
                  <p>Stay focused and avoid distractions!</p>
                  <p className="mt-1">Timer simulates exam conditions</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}