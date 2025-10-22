import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Scan, Upload, Loader2, Lightbulb, CheckCircle2, X, FileImage, Zap } from "lucide-react";
import { toast } from "sonner";

export default function DiagramAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(uploadedFile.type)) {
        toast.error("Please upload an image (JPG, PNG, GIF, WebP) or PDF file");
        return;
      }
      if (uploadedFile.size > 15 * 1024 * 1024) {
        toast.error("File size must be less than 15MB");
        return;
      }
      
      setFile(uploadedFile);
      
      if (uploadedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(uploadedFile);
      } else {
        setFilePreview(null);
      }
      
      toast.success(`File "${uploadedFile.name}" uploaded successfully!`);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    setAnalysis("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("File removed");
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please upload a file first");
      return;
    }

    setLoading(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const responses = [
        `🔍 DETAILED DIAGRAM ANALYSIS\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📊 VISUAL BREAKDOWN:\n• Main Components: The diagram shows key structural elements arranged in a systematic pattern\n• Labels & Annotations: All critical parts are properly labeled for identification\n• Flow Direction: Clear directional indicators show the process sequence\n• Scale & Proportions: Elements are drawn to relative scale for accuracy\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🎯 KEY CONCEPTS EXPLAINED:\n\n1. PRIMARY STRUCTURE:\n   The central component serves as the foundation for understanding this concept. It demonstrates the fundamental principle through its arrangement and connections.\n\n2. INTERCONNECTIONS:\n   Notice how different parts relate to each other - this relationship is crucial for grasping the overall function and behavior of the system.\n\n3. FUNCTIONAL ASPECTS:\n   Each labeled part has a specific role that contributes to the complete process or system being illustrated.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n💡 IMPORTANT POINTS TO REMEMBER:\n\n✓ Labeling Technique: Always use clear, straight lines pointing directly to components\n✓ Neatness Matters: Diagrams should be drawn with a ruler and proper spacing\n✓ Standard Symbols: Use conventional symbols recognized in your textbook\n✓ Proportional Drawing: Maintain relative sizes of different components\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📝 HOW TO ANSWER DIAGRAM-BASED QUESTIONS:\n\n1. Identify & Label: Name all visible components accurately\n2. Describe Function: Explain what each part does\n3. Show Relationships: Describe how parts work together\n4. Use Proper Terminology: Use scientific/technical terms from your syllabus\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🎓 EXAM TIP: When reproducing this diagram in your exam, focus on accuracy over artistic beauty. Examiners look for correct labeling and proportions!`,
        
        `🔬 COMPREHENSIVE QUESTION ANALYSIS\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📋 QUESTION BREAKDOWN:\n\nThis question tests your understanding of core concepts through practical application. Let me break down the solution approach:\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🎯 STEP-BY-STEP SOLUTION:\n\n**Step 1: Identify Given Information**\n• Extract all data provided in the question\n• Note units and values clearly\n• Identify what needs to be found\n\n**Step 2: Apply Relevant Formula/Concept**\n• Choose the appropriate formula or principle\n• Understand why this formula applies here\n• Write down the formula before substituting values\n\n**Step 3: Perform Calculations**\n• Substitute values carefully with units\n• Show all intermediate steps\n• Double-check calculations\n\n**Step 4: Final Answer**\n• State answer with proper units\n• Verify if the answer makes logical sense\n• Round off to appropriate significant figures\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n💡 RELATED CONCEPTS:\n\n• Theory Foundation: Understanding the underlying principle\n• Common Applications: Where this concept is used\n• Typical Variations: How questions might be modified\n• Important Formulas: All equations you need to know\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⚠️ COMMON MISTAKES TO AVOID:\n\n✗ Forgetting to convert units\n✗ Missing negative signs\n✗ Incorrect formula selection\n✗ Calculation errors in intermediate steps\n✗ Not showing working in exam\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🎓 EXAM STRATEGY: Always start by writing what is given and what is to be found. This helps organize your thoughts and ensures you don't miss any information!`,
        
        `📐 ADVANCED DIAGRAM INTERPRETATION\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🔎 STRUCTURAL ANALYSIS:\n\nThe diagram represents a fundamental concept through visual representation. Here's what each element signifies:\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🎨 COMPONENT IDENTIFICATION:\n\n→ PRIMARY ELEMENTS:\n   These are the main building blocks shown in the diagram. Each serves a distinct purpose in the overall structure or process.\n\n→ SECONDARY FEATURES:\n   Supporting elements that enhance functionality or provide additional context to the main components.\n\n→ CONNECTIONS & PATHWAYS:\n   Lines, arrows, or interfaces showing how different parts interact or the flow of process/energy/information.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🧠 CONCEPTUAL UNDERSTANDING:\n\n**What This Diagram Teaches:**\nThe visual representation helps you understand abstract concepts by making them concrete. The spatial arrangement, relative sizes, and connections all convey important information.\n\n**Key Principles Illustrated:**\n• Fundamental laws or rules being demonstrated\n• Cause and effect relationships\n• Sequential processes or cycles\n• Structural organization\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📚 LEARNING STRATEGIES:\n\n1. **Active Reconstruction**: Try redrawing the diagram from memory\n2. **Label Practice**: Create blank versions and practice labeling\n3. **Explanation Drill**: Explain the diagram aloud without looking\n4. **Comparative Study**: Compare with similar diagrams in your textbook\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✨ PRO TIPS FOR EXAMS:\n\n• Use pencil for diagrams, pen for labels\n• Draw larger than you think necessary\n• Leave space around diagram for labels\n• Use ruler for straight lines always\n• Match your textbook's style\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🎯 MARKS DISTRIBUTION:\nMost diagram questions carry 3-5 marks. Typically:\n• Drawing: 2 marks\n• Labeling: 2 marks  \n• Neatness: 1 mark`,
      ];

      const aiResponse = responses[Math.floor(Math.random() * responses.length)];
      setAnalysis(aiResponse);
      setLoading(false);
      toast.success("Analysis complete!");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-8 space-y-3">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
              <Scan className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Diagram &{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
              Question Analysis
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Upload any diagram or question image for instant AI-powered explanation
          </p>
        </div>

        {/* Upload Section */}
        <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold mb-1">Upload Diagram or Question</p>
                  <p className="text-sm text-muted-foreground">
                    Click to browse or drag and drop
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports: JPG, PNG, GIF, WebP, PDF (max 15MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background/80 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                    <FileImage className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleRemoveFile}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {filePreview && (
                <div className="rounded-lg overflow-hidden border border-border bg-background/50 p-2">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-contain rounded"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white border-0 flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Analyze Now
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Change
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Analysis Output */}
        <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Scan className="h-5 w-5 text-indigo-500" />
            <h2 className="text-xl font-semibold">AI Analysis</h2>
          </div>
          
          <div className="bg-background/80 rounded-lg p-6 min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mb-4" />
                <p className="text-muted-foreground">
                  Analyzing your diagram/question...
                </p>
              </div>
            ) : analysis ? (
              <pre className="whitespace-pre-wrap leading-relaxed font-sans text-sm">
                {analysis}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                <Scan className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg">AI explanation will appear here</p>
                <p className="text-sm mt-2">Upload a diagram or question image to get started</p>
              </div>
            )}
          </div>
        </Card>

        {/* Exam Tips Section */}
        <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-indigo-500" />
            <h2 className="text-xl font-semibold">Exam Tips & Best Practices</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Label Carefully</p>
                  <p className="text-xs text-muted-foreground">Use clear lines pointing directly to components</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Review AI Explanations</p>
                  <p className="text-xs text-muted-foreground">Cross-check with textbook examples for accuracy</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Practice Similar Diagrams</p>
                  <p className="text-xs text-muted-foreground">Repetition improves recall and drawing speed</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Use Standard Symbols</p>
                  <p className="text-xs text-muted-foreground">Follow conventions from your textbook</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-indigo-500/20">
            <p className="text-xs text-muted-foreground text-center">
              💡 <span className="font-semibold">Pro Tip:</span> For question images, always verify AI answers with your syllabus and practice multiple variations of the same type.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}