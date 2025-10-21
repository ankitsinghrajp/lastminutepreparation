import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Upload, Image as ImageIcon, Sparkles, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ImageAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [analysis, setAnalysis] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis("");
      setExtractedText("");
    }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysis(
        "This diagram shows the water cycle process. Key components include:\n\n" +
        "1. Evaporation: Water from oceans and lakes transforms into vapor\n" +
        "2. Condensation: Water vapor forms clouds in the atmosphere\n" +
        "3. Precipitation: Water falls back to earth as rain, snow, or hail\n" +
        "4. Collection: Water collects in water bodies and the cycle repeats\n\n" +
        "The diagram effectively illustrates the continuous movement of water through these stages."
      );
      setExtractedText(
        "Sample extracted text from the image:\n\n" +
        "Water Cycle\n" +
        "• Evaporation\n" +
        "• Condensation\n" +
        "• Precipitation\n" +
        "• Collection"
      );
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold">Image & Diagram Analysis</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Extract text and get AI analysis of your diagrams and images
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Upload Image</h3>
                  
                  <label className="cursor-pointer">
                    <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
                      {previewUrl ? (
                        <div className="space-y-4">
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="max-h-64 mx-auto rounded-lg"
                          />
                          <p className="text-sm text-muted-foreground">{selectedFile?.name}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <Upload className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Click to upload image</p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG, or PDF up to 10MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <Button 
                  className="w-full gradient-primary border-0"
                  onClick={handleAnalyze}
                  disabled={!selectedFile || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analyze Image
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                  <TabsTrigger value="text">Extracted Text</TabsTrigger>
                </TabsList>
                
                <TabsContent value="analysis" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Analysis Results</h3>
                    {analysis ? (
                      <div className="p-4 bg-background/50 rounded-lg min-h-[400px]">
                        <p className="text-sm leading-relaxed whitespace-pre-line">{analysis}</p>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-24">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>AI analysis will appear here</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="text" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Extracted Text (OCR)</h3>
                    {extractedText ? (
                      <div className="p-4 bg-background/50 rounded-lg min-h-[400px]">
                        <p className="text-sm leading-relaxed whitespace-pre-line font-mono">{extractedText}</p>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-24">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Extracted text will appear here</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
