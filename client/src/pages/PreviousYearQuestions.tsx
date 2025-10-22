import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { BookOpen, Search, Loader2, Copy, Download, BookmarkPlus, Filter, Star, Calendar } from "lucide-react";
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
  "English": ["All Chapters"],
  "Hindi": ["All Chapters"],
  "Social Science": ["All Chapters"],
};

const years = ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014"];

interface Question {
  id: number;
  year: string;
  question: string;
  marks: number;
  hint: string;
  solution: string;
  frequency: "high" | "medium" | "low";
}

export default function PreviousYearQuestions() {
  const [selectedClass, setSelectedClass] = useState("12th");
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [selectedChapter, setSelectedChapter] = useState("Electrostatics");
  const [searchTopic, setSearchTopic] = useState("");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleFetchQuestions = async () => {
    setLoading(true);
    
    setTimeout(() => {
      const mockQuestions: Question[] = [
        {
          id: 1,
          year: "2024",
          question: "Derive an expression for the electric field intensity at a point on the axial line of an electric dipole. Also, find the direction of this electric field.",
          marks: 5,
          hint: "Consider a dipole with charges +q and -q separated by distance 2a. Use superposition principle.",
          solution: "Step 1: Consider electric dipole with charges +q at A and -q at B, separated by 2a...\nStep 2: Apply superposition principle for electric field...\nStep 3: Use binomial expansion for r >> a...\nFinal Expression: E = (2kp)/(r³) along the axial direction",
          frequency: "high"
        },
        {
          id: 2,
          year: "2023",
          question: "Two point charges 4 μC and -2 μC are separated by a distance of 1 m in air. At what point on the line joining the charges is the electric potential zero?",
          marks: 3,
          hint: "Use the formula V = kq/r and set the total potential equal to zero.",
          solution: "Let the point be at distance x from 4 μC charge.\nV₁ + V₂ = 0\nk(4×10⁻⁶)/x + k(-2×10⁻⁶)/(1-x) = 0\nSolving: x = 0.67 m from the 4 μC charge",
          frequency: "high"
        },
        {
          id: 3,
          year: "2023",
          question: "Define electric flux. Write its SI unit. A small metal sphere carrying charge +Q is located at the centre of a spherical cavity inside a large uncharged metallic spherical shell. Write the charges on the inner and outer surfaces of the shell. Write the expression for the electric field at a point P at a distance r from the centre for (i) r < R₁ (ii) R₁ < r < R₂",
          marks: 5,
          hint: "Use Gauss's law and properties of conductors in electrostatic equilibrium.",
          solution: "Electric Flux: ϕ = ∫E·dA, SI Unit: Nm²/C or Vm\nInner surface charge: -Q\nOuter surface charge: +Q\n(i) For r < R₁: E = kQ/r²\n(ii) For R₁ < r < R₂: E = 0 (inside conductor)",
          frequency: "high"
        },
        {
          id: 4,
          year: "2022",
          question: "State Gauss's law in electrostatics. Using this law, derive an expression for the electric field due to an infinitely long straight uniformly charged wire.",
          marks: 4,
          hint: "Choose a cylindrical Gaussian surface coaxial with the wire.",
          solution: "Gauss's Law: ϕ = Q_enclosed/ε₀\nStep 1: Consider cylindrical Gaussian surface of radius r and length l\nStep 2: Electric flux through curved surface = E × 2πrl\nStep 3: Charge enclosed = λl (where λ is linear charge density)\nStep 4: Applying Gauss's law: E × 2πrl = λl/ε₀\nFinal Expression: E = λ/(2πε₀r)",
          frequency: "high"
        },
        {
          id: 5,
          year: "2022",
          question: "A parallel plate capacitor is charged by a battery. After some time the battery is disconnected and a dielectric slab of dielectric constant K is inserted between the plates. How will (i) the capacitance (ii) the electric field between the plates, and (iii) the energy stored in the capacitor be affected? Justify your answer.",
          marks: 3,
          hint: "Remember that charge remains constant when battery is disconnected.",
          solution: "(i) Capacitance: C' = KC (increases by factor K)\n(ii) Electric Field: E' = E/K (decreases by factor K)\n(iii) Energy: U' = U/K (decreases by factor K)\nJustification: Since Q is constant after disconnection, C = Q/V increases to KC, hence V decreases to V/K, making E = V/d also decrease to E/K. Energy U = Q²/2C decreases to U/K.",
          frequency: "medium"
        },
        {
          id: 6,
          year: "2021",
          question: "Explain the concept of electrostatic shielding. Why is it that the electric field inside a conductor is zero in electrostatic conditions?",
          marks: 2,
          hint: "Consider charge distribution on conductor surface and equilibrium conditions.",
          solution: "In electrostatic equilibrium, charges redistribute on the conductor surface such that the internal electric field becomes zero. Any internal field would cause charge motion, contradicting equilibrium.\n\nElectrostatic Shielding: The interior of a conductor is shielded from external electric fields. External charges induce opposite charges on the outer surface, creating an internal field that exactly cancels the external field inside.",
          frequency: "medium"
        },
        {
          id: 7,
          year: "2021",
          question: "Three capacitors of capacitances 2 μF, 3 μF and 4 μF are connected in series. What is the effective capacitance? If this combination is connected to a 100 V supply, what is the charge on each capacitor?",
          marks: 3,
          hint: "For series: 1/C_eq = 1/C₁ + 1/C₂ + 1/C₃. In series, charge is same on all capacitors.",
          solution: "For series combination:\n1/C_eq = 1/2 + 1/3 + 1/4 = (6+4+3)/12 = 13/12\nC_eq = 12/13 μF ≈ 0.923 μF\n\nCharge: Q = C_eq × V = (12/13) × 100 = 92.3 μC\nSince in series, same charge flows through all capacitors:\nQ on each capacitor = 92.3 μC",
          frequency: "high"
        },
        {
          id: 8,
          year: "2020",
          question: "Deduce the expression for the potential energy of a system of two point charges q₁ and q₂ brought from infinity to the points with position vectors r₁ and r₂ respectively in the presence of external electric field E.",
          marks: 3,
          hint: "Consider work done against external field and mutual interaction.",
          solution: "Work done to bring q₁ from infinity: W₁ = q₁(V_ext at r₁) = q₁E·r₁\nWork done to bring q₂: W₂ = q₂E·r₂ + kq₁q₂/|r₁-r₂|\n\nTotal Potential Energy:\nU = q₁E·r₁ + q₂E·r₂ + kq₁q₂/r₁₂\nwhere r₁₂ = |r₁ - r₂|",
          frequency: "low"
        }
      ];

      const filteredQuestions = mockQuestions.filter(q => {
        if (selectedYear !== "All Years" && q.year !== selectedYear) return false;
        if (searchTopic && !q.question.toLowerCase().includes(searchTopic.toLowerCase())) return false;
        return true;
      });

      setQuestions(filteredQuestions);
      setLoading(false);
      toast.success(`Found ${filteredQuestions.length} questions!`);
    }, 1500);
  };

  const handleCopyQuestion = (question: string) => {
    navigator.clipboard.writeText(question);
    toast.success("Question copied to clipboard!");
  };

  const handleCopyAll = () => {
    const allText = questions.map((q, idx) => 
      `${idx + 1}. [${q.year}] [${q.marks} marks] ${q.question}\n\nHint: ${q.hint}\n\nSolution:\n${q.solution}\n\n${"=".repeat(80)}\n\n`
    ).join("");
    
    navigator.clipboard.writeText(allText);
    toast.success("All questions copied to clipboard!");
  };

  const handleDownloadPDF = () => {
    toast.success("PDF download will be available soon!");
  };

  const handleMarkImportant = (id: number) => {
    toast.success("Question marked as important!");
  };

  const toggleSolution = (id: number) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      high: "bg-red-500/20 text-red-400 border-red-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      low: "bg-green-500/20 text-green-400 border-green-500/30"
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full border ${colors[frequency as keyof typeof colors]}`}>
        {frequency === "high" ? "🔥 High Priority" : frequency === "medium" ? "⭐ Medium" : "📌 Low"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold">
            Previous Year{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Access 10 years of board exam questions (2014 - 2024) with AI-powered hints and solutions
          </p>
        </div>

        <Card className="p-8 bg-card/50 border-border/50 backdrop-blur-sm mb-6">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
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
                  setSelectedChapter(chapters[e.target.value][0]);
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
                {chapters[selectedSubject]?.map((ch) => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="All Years">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1">
              <Input
                placeholder="🔍 Search by topic or keyword (optional)..."
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleFetchQuestions}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 flex-1 min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fetching Questions...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Fetch PYQs
                </>
              )}
            </Button>

            <Button
              onClick={handleCopyAll}
              disabled={questions.length === 0}
              variant="outline"
              className="flex-none"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </Button>

            <Button
              onClick={handleDownloadPDF}
              disabled={questions.length === 0}
              variant="outline"
              className="flex-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">
                    Questions Panel
                    {questions.length > 0 && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({questions.length} found)
                      </span>
                    )}
                  </h2>
                </div>
              </div>
              
              <div className="space-y-4">
                {questions.length > 0 ? (
                  questions.map((q, idx) => (
                    <Card key={q.id} className="p-5 bg-background/50 border-border/50 hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30">
                            <Calendar className="h-3 w-3" />
                            {q.year}
                          </span>
                          <span className="text-sm px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                            {q.marks} marks
                          </span>
                          {getFrequencyBadge(q.frequency)}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleCopyQuestion(q.question)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleMarkImportant(q.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <BookmarkPlus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-base leading-relaxed">
                          <span className="font-semibold text-foreground">Q{idx + 1}.</span> {q.question}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Button
                          onClick={() => toggleSolution(q.id)}
                          variant="outline"
                          size="sm"
                          className="w-full justify-between"
                        >
                          <span className="flex items-center gap-2">
                            💡 {expandedQuestion === q.id ? "Hide" : "Show"} Hint & Solution
                          </span>
                          <span className="text-xs">
                            {expandedQuestion === q.id ? "▲" : "▼"}
                          </span>
                        </Button>

                        {expandedQuestion === q.id && (
                          <div className="space-y-3 p-4 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-lg border border-blue-500/20">
                            <div>
                              <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                                💡 Hint:
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {q.hint}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-border/50">
                              <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                                ✅ Solution:
                              </h4>
                              <pre className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
                                {q.solution}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
                      <BookOpen className="h-12 w-12 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Questions Yet</h3>
                    <p className="text-muted-foreground max-w-md">
                      Select your class, subject, and chapter, then click "Fetch PYQs" to load previous year questions with AI-powered solutions
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Quick Stats</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    {questions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Questions Found
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                  <div className="text-3xl font-bold text-purple-400 mb-1">
                    10
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Years Coverage (2014-2024)
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
                  <div className="text-3xl font-bold text-orange-400 mb-1">
                    {questions.filter(q => q.frequency === "high").length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    High Priority Questions
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border/50">
                <h3 className="font-semibold mb-3 text-sm">📚 Study Tips</h3>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Focus on high-priority questions first</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Practice questions from last 3 years</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Review hints before checking solutions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Bookmark important questions for quick revision</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Time yourself while solving</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Tips
                </h3>
                <p className="text-xs text-muted-foreground">
                  Use the search box to find questions on specific topics like "electric field", "capacitor", or "Gauss law"
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}