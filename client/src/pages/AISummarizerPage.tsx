import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Sparkles, Upload, Loader2, FileText, Copy, Trash2, FileCheck, Lightbulb, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { useAsyncMutation } from "@/hooks/hook";
import { useSummarizerMutation } from "@/redux/api/api";

const detailLevels = ["Short", "Medium", "Detailed"];

export default function AISummarizer() {
  const [topic, setTopic] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [detailLevel, setDetailLevel] = useState("Medium");
  const [summary, setSummary] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [importantQuestions, setImportantQuestions] = useState<string[]>([]);
  const [processingPDF, setProcessingPDF] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [summarizer, isSummarizerLoading] = useAsyncMutation(useSummarizerMutation);

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

    setSummary("");
    setKeyPoints([]);
    setImportantQuestions([]);

   const result = await summarizer("Summarizing...",{topic,leve:detailLevel});
    console.log("Result from backend: ",result);
   if(result?.data?.data?.data){
    setSummary(result?.data?.data?.data?.summary);
    setKeyPoints(result?.data?.data?.data?.keyPoints);
    setImportantQuestions(result?.data?.data?.data?.questions);
   }

  };

  const handleCopy = () => {
    const fullText = `${summary}\n\n📌 KEY POINTS:\n${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n❓ IMPORTANT QUESTIONS:\n${importantQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
    navigator.clipboard.writeText(fullText);
    toast.success("Summary copied to clipboard!");
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
      
      <div className="container mx-auto px-3 sm:px-4 py-20 sm:py-24 max-w-7xl">
        {/* Header - Mobile Optimized */}
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold px-4">
            AI{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Summarizer
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Summarize any topic in seconds - works with text or PDF
          </p>
        </div>

        {/* Main Content - Stacked on Mobile */}
        <div className="space-y-4 sm:space-y-6">
          {/* Input Section */}
          <Card className="p-4 sm:p-6 lg:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-emerald-500" />
                  Enter Topic to Summarize
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis, Newton's Laws..."
                  className="bg-background/50 h-11 sm:h-12 text-base"
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
                    className="border-2 border-dashed border-border/50 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all active:scale-95"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handlePDFUpload}
                      className="hidden"
                      disabled={!!topic}
                    />
                    <Upload className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1 text-sm sm:text-base">Tap to upload PDF</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Max file size: 50MB
                    </p>
                    {topic && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Clear topic input to upload PDF
                      </p>
                    )}
                  </div>
                ) : (
                  <Card className="p-3 sm:p-4 bg-background/50 border-border/50">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                          <FileCheck className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{pdfFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleRemovePDF}
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </Card>

          {/* Detail Level Section */}
          <Card className="p-4 sm:p-6 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg sm:text-xl font-semibold">Detail Level</h2>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
              {detailLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setDetailLevel(level)}
                  disabled={isSummarizerLoading}
                  className={`p-3 sm:p-4 rounded-lg text-left transition-all ${
                    detailLevel === level
                      ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg"
                      : "bg-background/50 hover:bg-background/80 border border-border/50"
                  }`}
                >
                  <div className="font-semibold mb-1 text-sm sm:text-base">{level}</div>
                  <div className={`text-xs ${detailLevel === level ? "text-white/80" : "text-muted-foreground"} hidden sm:block`}>
                    {level === "Short" && "Quick overview"}
                    {level === "Medium" && "Balanced detail"}
                    {level === "Detailed" && "Deep dive"}
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/20">
              <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                How to Use
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Enter any topic or upload a PDF</li>
                <li>• Choose your preferred detail level</li>
                <li>• Get instant AI-powered summary</li>
                <li>• Copy or save results</li>
              </ul>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSummarize}
              disabled={isSummarizerLoading || processingPDF || (!topic && !pdfFile)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 flex-1 h-12 sm:h-11 text-base"
            >
              {isSummarizerLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
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
              disabled={isSummarizerLoading}
              className="h-12 sm:h-11 sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {(summary || keyPoints?.length > 0 || importantQuestions?.length > 0) && (
          <div className="space-y-4 sm:space-y-6 mt-6 sm:mt-8">
            <Card className="p-4 sm:p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <h2 className="text-lg sm:text-xl font-semibold truncate">Summary</h2>
                </div>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Copy</span>
                </Button>
              </div>

              <div className="bg-background/80 rounded-lg p-4 sm:p-6">
                <pre className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base font-sans">{summary}</pre>
              </div>
            </Card>

            {keyPoints?.length > 0 && (
              <Card className="p-4 sm:p-6 bg-card/50 border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-lg sm:text-xl font-semibold">Key Points</h2>
                </div>
                <div className="space-y-3">
                 {keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 sm:p-4 bg-background/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{idx + 1}</span>
                      </div>
                      <p 
                        className="text-sm sm:text-base leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: point.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        }}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {importantQuestions?.length > 0 && (
              <Card className="p-4 sm:p-6 bg-card/50 border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-lg sm:text-xl font-semibold">Important Questions</h2>
                </div>
                <div className="space-y-3">
                  {importantQuestions.map((question, idx) => (
                    <div key={idx} className="p-3 sm:p-4 bg-background/50 rounded-lg border border-border/50 hover:border-emerald-500/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="text-emerald-500 font-semibold text-sm flex-shrink-0">Q{idx + 1}.</span>
                        <p className="text-sm sm:text-base leading-relaxed">{question}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {!summary && !isSummarizerLoading && (
          <Card className="p-8 sm:p-12 bg-card/50 border-border/50 backdrop-blur-sm text-center mt-6 sm:mt-8">
            <div className="max-w-md mx-auto">
              <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Ready to Summarize</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
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