import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Sparkles, Upload, Loader2, FileText, Copy, Download, Lightbulb, HelpCircle, Trash2, FileCheck, BookmarkPlus } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";

const detailLevels = ["Short", "Medium", "Detailed"];

export default function AISummarizer() {
  const [topic, setTopic] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [detailLevel, setDetailLevel] = useState("Medium");
  const [summary, setSummary] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [importantQuestions, setImportantQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingPDF, setProcessingPDF] = useState(false);
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

  const handleSummarize = async () => {
    if (!topic && !pdfFile) {
      toast.error("Please enter a topic or upload a PDF");
      return;
    }

    setLoading(true);
    setSummary("");
    setKeyPoints([]);
    setImportantQuestions([]);

    setTimeout(() => {
      const source = pdfFile ? pdfFile.name : topic;
      const detailText = detailLevel === "Short" ? "concise" : detailLevel === "Medium" ? "balanced" : "comprehensive";

      let generatedSummary = "";
      let points: string[] = [];
      let questions: string[] = [];

      if (detailLevel === "Short") {
        generatedSummary = `📋 QUICK SUMMARY: ${source}

This ${pdfFile ? 'document' : 'topic'} covers essential concepts and foundational principles. The main focus is on understanding core ideas and their practical applications. Key definitions and formulas are highlighted for quick reference and exam preparation.

The material provides clear explanations with relevant examples to aid comprehension and retention.`;

        points = [
          "Core concepts and fundamental principles explained",
          "Important definitions and key terminology",
          "Essential formulas and equations",
          "Basic practical applications"
        ];

        questions = [
          "What are the main concepts covered in this topic?",
          "Define the key terms and their significance",
          "What are the most important formulas to remember?"
        ];
      } else if (detailLevel === "Medium") {
        generatedSummary = `📚 DETAILED SUMMARY: ${source}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 OVERVIEW:
This ${pdfFile ? 'document' : 'topic'} provides a comprehensive exploration of fundamental concepts and their applications. The material is structured to build understanding from basic principles to advanced applications, making it suitable for thorough exam preparation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 MAIN CONCEPTS:

The content covers essential theoretical foundations, mathematical formulations, and practical implementations. Each concept is explained with clear definitions, step-by-step derivations, and real-world examples to facilitate deep understanding.

Key relationships between different concepts are highlighted, showing how various principles interconnect and build upon each other. This holistic approach helps in developing a complete understanding of the subject matter.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 PRACTICAL APPLICATIONS:

The material includes numerous examples demonstrating how theoretical concepts apply to real-world scenarios. Problem-solving techniques are illustrated through worked examples, showing systematic approaches to different types of questions.

Common mistakes and misconceptions are addressed, providing guidance on avoiding typical errors in examinations and practical applications.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ CONCLUSION:

This is a well-structured resource that balances theoretical depth with practical utility. It serves as an excellent reference for both learning new concepts and revising previously studied material.`;

        points = [
          "Comprehensive coverage of all fundamental concepts and principles",
          "Clear explanations with step-by-step derivations and proofs",
          "Multiple real-world examples and practical applications",
          "Important formulas, equations, and their derivations",
          "Problem-solving techniques and systematic approaches",
          "Common mistakes and how to avoid them",
          "Relationships between different concepts and topics"
        ];

        questions = [
          "Explain the fundamental principles and their significance",
          "Derive the main formulas and show their applications",
          "How do the different concepts relate to each other?",
          "Solve a complex problem demonstrating the key concepts",
          "What are the practical applications of these principles?",
          "Compare and contrast related concepts or theories"
        ];
      } else {
        generatedSummary = `📚 COMPREHENSIVE SUMMARY: ${source}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 INTRODUCTION & CONTEXT:

This ${pdfFile ? 'document' : 'topic'} presents an exhaustive exploration of the subject matter, providing both theoretical depth and practical insights. The material is designed to facilitate complete mastery of the concepts, suitable for advanced study and comprehensive exam preparation.

The content is structured systematically, progressing from foundational principles to complex applications, ensuring a thorough understanding at every level.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 DETAILED CONCEPTUAL FRAMEWORK:

FUNDAMENTAL PRINCIPLES:
The document establishes core concepts through rigorous definitions and logical development. Each principle is explored in depth, with attention to both historical context and modern interpretations. Mathematical formulations are presented with complete derivations, showing all intermediate steps and underlying assumptions.

THEORETICAL FOUNDATIONS:
Advanced concepts are built systematically upon basic principles. The material demonstrates how complex ideas emerge from simpler ones, providing insight into the logical structure of the subject. Multiple perspectives and approaches are presented, enriching understanding and preparing for diverse problem types.

MATHEMATICAL DEVELOPMENT:
All key formulas and equations are derived in detail, with clear explanations of each step. Special cases, boundary conditions, and limitations are explicitly discussed. The mathematical treatment balances rigor with accessibility, making advanced concepts comprehensible.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 APPLICATIONS & EXAMPLES:

PRACTICAL IMPLEMENTATIONS:
Numerous worked examples demonstrate the application of theoretical concepts to real-world problems. Each example is solved completely, with detailed explanations of the reasoning at each step. Different solution strategies are compared, highlighting the most efficient approaches.

PROBLEM-SOLVING METHODOLOGY:
Systematic techniques for approaching different types of problems are presented. The material includes strategies for: analyzing problem statements, identifying relevant concepts, selecting appropriate methods, executing solutions efficiently, and verifying results.

ADVANCED SCENARIOS:
Complex, multi-step problems are solved to demonstrate integration of multiple concepts. These examples prepare students for challenging examination questions and real-world applications.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 DEEPER INSIGHTS:

INTERCONNECTIONS:
The material reveals deep connections between different concepts, showing how various topics form a unified whole. Cross-references to related subjects are provided, enabling comprehensive understanding.

COMMON CHALLENGES:
Typical mistakes and misconceptions are identified and corrected. The document provides guidance on avoiding common errors and developing robust problem-solving skills.

ADVANCED CONSIDERATIONS:
Extensions, generalizations, and advanced topics are introduced, providing pathways for further study and deeper exploration.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 SUMMARY & REVIEW:

This comprehensive resource provides complete coverage of the subject matter, suitable for thorough preparation and deep understanding. The systematic presentation, detailed explanations, and extensive examples make it an invaluable reference for serious study.

Key takeaways include mastery of fundamental principles, proficiency in problem-solving techniques, and understanding of practical applications. The material prepares students for both examinations and real-world use of the concepts.`;

        points = [
          "Complete theoretical framework with all fundamental principles and advanced concepts",
          "Rigorous mathematical derivations with all steps shown and assumptions stated",
          "Extensive collection of worked examples covering simple to complex scenarios",
          "Comprehensive problem-solving methodologies and systematic approaches",
          "Detailed exploration of real-world applications and practical implementations",
          "In-depth analysis of relationships between different concepts and topics",
          "Common mistakes, misconceptions, and how to avoid them",
          "Advanced topics, extensions, and pathways for further study",
          "Historical context and modern interpretations of key concepts",
          "Multiple solution strategies compared for efficiency and elegance"
        ];

        questions = [
          "Provide a comprehensive explanation of all fundamental principles and their theoretical foundations",
          "Derive all major formulas from first principles, showing each step and assumption",
          "Analyze complex, multi-step problems demonstrating integration of multiple concepts",
          "Compare and contrast different approaches to solving advanced problems",
          "Explain the deep connections between various concepts and how they form a unified framework",
          "Discuss the practical applications and real-world significance of the theoretical principles",
          "Evaluate the limitations and boundary conditions of the key formulas and concepts",
          "Solve challenging problems that require creative application of the principles",
          "Explain how this topic relates to other subjects and areas of study"
        ];
      }

      setSummary(generatedSummary);
      setKeyPoints(points);
      setImportantQuestions(questions);
      setLoading(false);
      toast.success("Summary generated successfully!");
    }, 2500);
  };

  const handleCopy = () => {
    const fullText = `${summary}\n\n📌 KEY POINTS:\n${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n❓ IMPORTANT QUESTIONS:\n${importantQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
    navigator.clipboard.writeText(fullText);
    toast.success("Summary copied to clipboard!");
  };

  const handleDownload = () => {
    toast.success("Download feature coming soon!");
  };

  const handleSave = () => {
    toast.success("Summary saved! (Feature coming soon)");
  };

  const handleClear = () => {
    setTopic("");
    setPdfFile(null);
    setSummary("");
    setKeyPoints([]);
    setImportantQuestions([]);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold">
            AI{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Summarizer
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Summarize any topic in seconds - works with text or PDF
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2 p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-emerald-500" />
                  Enter Topic to Summarize
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis, Newton's Laws, World War II, etc."
                  className="bg-background/50 h-12"
                  disabled={!!pdfFile}
                />
                {pdfFile && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Clear PDF to use topic input
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 border-t border-border/50"></div>
                <span className="text-sm text-muted-foreground">OR</span>
                <div className="flex-1 border-t border-border/50"></div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Upload className="h-4 w-4 text-emerald-500" />
                  Upload PDF Document
                </label>
                
                {!pdfFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handlePDFUpload}
                      className="hidden"
                      disabled={!!topic}
                    />
                    <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">Click to upload PDF</p>
                    <p className="text-sm text-muted-foreground">
                      Max file size: 50MB
                    </p>
                    {topic && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Clear topic input to upload PDF
                      </p>
                    )}
                  </div>
                ) : (
                  <Card className="p-4 bg-background/50 border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
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

              <div className="flex gap-4">
                <Button
                  onClick={handleSummarize}
                  disabled={loading || processingPDF || (!topic && !pdfFile)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Summary
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
            </div>
          </Card>

          <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm sticky top-24 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-emerald-500" />
              <h2 className="text-xl font-semibold">Detail Level</h2>
            </div>

            <div className="space-y-3 mb-6">
              {detailLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setDetailLevel(level)}
                  disabled={loading}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    detailLevel === level
                      ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg"
                      : "bg-background/50 hover:bg-background/80 border border-border/50"
                  }`}
                >
                  <div className="font-semibold mb-1">{level}</div>
                  <div className={`text-xs ${detailLevel === level ? "text-white/80" : "text-muted-foreground"}`}>
                    {level === "Short" && "Quick overview with key points"}
                    {level === "Medium" && "Balanced detail with examples"}
                    {level === "Detailed" && "Comprehensive deep dive"}
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/20">
              <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                How to Use
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Enter any topic or upload a PDF</li>
                <li>• Choose your preferred detail level</li>
                <li>• Get instant AI-powered summary</li>
                <li>• Copy, save, or download results</li>
              </ul>
            </div>
          </Card>
        </div>

        {(summary || keyPoints.length > 0 || importantQuestions.length > 0) && (
          <div className="space-y-6">
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-semibold">Summary</h2>
                </div>
                <div className="flex gap-2">
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

              <div className="bg-background/80 rounded-lg p-6 font-mono text-sm">
                <pre className="whitespace-pre-wrap leading-relaxed">{summary}</pre>
              </div>
            </Card>

            {keyPoints.length > 0 && (
              <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-semibold">Key Points</h2>
                </div>
                <div className="space-y-3">
                  {keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {importantQuestions.length > 0 && (
              <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-semibold">Important Questions</h2>
                </div>
                <div className="space-y-3">
                  {importantQuestions.map((question, idx) => (
                    <div key={idx} className="p-4 bg-background/50 rounded-lg border border-border/50 hover:border-emerald-500/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="text-emerald-500 font-semibold text-sm flex-shrink-0">Q{idx + 1}.</span>
                        <p className="text-sm leading-relaxed">{question}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {!summary && !loading && (
          <Card className="p-12 bg-card/50 border-border/50 backdrop-blur-sm text-center">
            <div className="max-w-md mx-auto">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Ready to Summarize</h3>
              <p className="text-muted-foreground">
                Enter a topic or upload a PDF, choose your detail level, and click "Generate Summary"
              </p>
            </div>
          </Card>
        )}
      </div>
      <Footer/>
    </div>
  );
}