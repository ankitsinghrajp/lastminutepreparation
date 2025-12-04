import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { MessageCircle, Loader2, Bot, Copy, Trash2, Sparkles, Upload, X, FileImage } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import AIOutput from "@/components/specifics/AIOutput";
import { server } from "../constants";

export default function AskAnyQuestion() {
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(uploadedFile.type)) {
        toast.error("Please upload an image (JPG, PNG, GIF, WebP)");
        return;
      }

      if (uploadedFile.size > 15 * 1024 * 1024) {
        toast.error("File size must be less than 15MB");
        return;
      }

      setImage(uploadedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(uploadedFile);

      toast.success(`Image "${uploadedFile.name}" uploaded successfully!`);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Image removed");
  };

  const handleAsk = async () => {
    if (!question.trim() && !image) {
      toast.error("Please enter a question or upload an image!");
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const formData = new FormData();
      if (question.trim()) formData.append("question", question);
      if (image) formData.append("image", image);

      const res = await fetch(`${server}/api/v1/ai/ask-any`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Something went wrong");
        setLoading(false);
        return;
      }

      setResponse(data?.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send question");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const handleCopy = () => {
    if (!response) return;

    let fullText = `Question: ${question || "From Image"}\n\n`;
    fullText += `Answer: ${response.answer}\n`;

    navigator.clipboard.writeText(fullText);
    toast.success("Answer copied to clipboard!");
  };

  const handleClear = () => {
    setQuestion("");
    setImage(null);
    setImagePreview(null);
    setResponse(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Cleared - Ready for new question");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-20 sm:py-24 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-4">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">
            Ask{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Any Question
            </span>
          </h1>
          <p className="text-muted-foreground">
            Get instant AI-powered answers with image support
          </p>
        </div>

        {/* Input Section */}
        <Card className="p-6 mb-6 bg-card/50 border-border/50 backdrop-blur-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Your Question
              </label>
              <Textarea
                placeholder="Type your question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={4}
                className="resize-none"
                disabled={loading}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Upload Question Image (Optional)
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {!image ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1">Upload Question Image</p>
                      <p className="text-xs text-muted-foreground">
                        Click to browse or drag and drop
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supports: JPG, PNG, GIF, WebP (max 15MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-background/80 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <FileImage className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{image.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(image.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleRemoveImage}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {imagePreview && (
                    <div className="rounded-lg overflow-hidden border border-border bg-background/50 p-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-auto max-h-96 object-contain rounded"
                      />
                    </div>
                  )}

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Image
                  </Button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleAsk}
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Answer...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Answer
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        {response && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button onClick={handleCopy} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
              <Button onClick={handleClear} variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-2" /> Clear
              </Button>
            </div>

            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg">Answer</h3>
              </div>
              <div className="text-base whitespace-pre-wrap">
                <AIOutput content={response.answer} />
              </div>
            </Card>
          </div>
        )}

        {!response && !loading && (
          <Card className="p-12 text-center border-dashed">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-lg font-medium mb-2 text-muted-foreground">
              Ready to Help
            </h3>
            <p className="text-sm text-muted-foreground/70">
              Ask by typing or uploading a question image
            </p>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}