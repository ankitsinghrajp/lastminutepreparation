import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Sparkles, Loader2, Copy, Trash2, ImageIcon, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAsyncMutation } from "@/hooks/hook";
import { useSummarizerMutation } from "@/redux/api/api";
import AIOutput from "@/components/specifics/AIOutput";
import { useSelector } from "react-redux";

const detailLevels = ["Short", "Medium", "Long"];

export default function AISummarizer() {
  const [topic, setTopic] = useState("");
  const [detailLevel, setDetailLevel] = useState("Medium");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [summarizer, isLoading] = useAsyncMutation(useSummarizerMutation);

  const {user} = useSelector(state=>state.auth);

  const handleSummarize = async () => {

    if (!topic.trim() && !image) {
      toast.error("Please enter a topic or upload an image");
      return;
    }

    setResult("");

    try {
      const formData = new FormData();
      formData.append("topic", topic);
      formData.append("level", detailLevel);

      if (image) {
        formData.append("image", image);
      }

      const response = await summarizer(
        "Generating explanation...",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const aiText =
        response?.data?.data?.data ||
        response?.data?.data?.answer ||
        response?.data?.data ||
        response?.data;

      if (aiText) setResult(aiText);
      else toast.error(response?.error?.data?.message || "No valid response from AI");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast.success("Copied!");
  };

  const handleClear = () => {
    setTopic("");
    setImage(null);
    setResult("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-3 sm:px-4 py-20 max-w-7xl">

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 space-y-3 sm:space-y-4">
             <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">
            AI Topic{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Summarizer
            </span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg px-2">
            Perfect for quick understanding, fast revision, and concept clarity.
          </p>
        </div>

        {/* Input Section */}
        <Card className="p-4 sm:p-6 bg-card/50 border-border/50 backdrop-blur-sm">
          <div className="space-y-3 sm:space-y-4">

            {/* Topic Input */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Enter Topic
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis, Ohm's Law"
                className="h-12"
              />
            </div>

            {/* Image Input with Preview (Mobile First) */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Upload Image (Optional)
              </label>

              {!image ? (
                <label className="flex items-center justify-center gap-2 h-12 border border-dashed rounded-lg cursor-pointer hover:bg-muted text-sm transition-colors">
                  <ImageIcon className="h-4 w-4" />
                  <span>Choose Image (PNG, JPG, JPEG, WebP)</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Check if file is AVIF

                        if(user.planType === "FREE"){
                          toast.error("Only Premium users can upload images. If you’ve just upgraded, please log in again.”");
                          return;
                        }
                        if (file.type === "image/avif" || file.name.toLowerCase().endsWith(".avif")) {
                          toast.error("AVIF format is not supported. Please use PNG, JPG, JPEG, or WebP.");
                          e.target.value = "";
                          return;
                        }
                        setImage(file);
                      }
                    }}
                  />
                </label>
              ) : (
                <div className="relative bg-muted/30 rounded-lg border border-border p-2 sm:p-3">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="w-full h-auto max-h-64 sm:max-h-80 object-contain rounded-lg"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-3 right-3 sm:top-4 sm:right-4"
                    onClick={() => setImage(null)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Level Selector */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Explanation Length
              </label>

              <div className="grid grid-cols-3 gap-2">
                {detailLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setDetailLevel(level)}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      detailLevel === level
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                        : "bg-background/50 border hover:bg-background border-border/50"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleSummarize}
              disabled={isLoading}
              className="w-full h-11 sm:h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Output Section */}
        {result ? (
          <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-1" /> Copy
              </Button>

              <Button variant="outline" size="sm" onClick={handleClear}>
                <Trash2 className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>

            <Card className="p-4 sm:p-6 bg-card/50 border-border/50">
              <AIOutput content={result} />
            </Card>
          </div>
        ) : null}
      </div>

      <Footer />
    </div>
  );
}