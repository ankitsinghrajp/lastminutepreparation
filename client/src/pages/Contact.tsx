import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Mail, MapPin, Instagram, Send, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      console.log("Form data:", formData);
      toast.success("Message sent successfully! We'll get back to you within 24 hours.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setLoading(false);
    }, 1500);

    // TODO: Replace with actual backend integration
    // fetch('https://your-backend-api.com/contact', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData)
    // });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold">
            Contact{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Us
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have a question, feedback, or need support, feel free to reach out.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Email Us</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              For any queries, suggestions, or technical support:
            </p>
            <a 
              href="mailto:support@lastminutepreparation.in"
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              support@lastminutepreparation.in
            </a>
          </Card>

          <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Location</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              LastMinutePreparation AI<br />
              Bangalore, India
            </p>
          </Card>

          <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm hover:border-pink-500/50 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                <Instagram className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Follow Us</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Stay updated on tips, PYQs, and new features
            </p>
            <div className="flex flex-col gap-2">
              <a 
                href="https://instagram.com/lastminutepreparation" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-pink-500 hover:text-pink-600 font-medium"
              >
                📷 Instagram
              </a>
              <a 
                href="https://t.me/lastminutepreparation" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                ✈️ Telegram
              </a>
              <a 
                href="https://facebook.com/lastminutepreparation" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                📘 Facebook
              </a>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="p-8 bg-card/50 border-border/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <Send className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Message Us Directly</h2>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Fill out the form below and we'll get back to you as soon as possible:
              </p>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || !formData.name || !formData.email || !formData.message}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm sticky top-24">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-6 text-center mb-6">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-lg font-semibold text-white mb-2">Quick Tip</h3>
                <p className="text-sm text-white/90">
                  We aim to respond within 24 hours on all business days.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-background/80 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-sm">📧 Email Support</h4>
                  <p className="text-xs text-muted-foreground">
                    For urgent queries, email us directly at support@lastminutepreparation.in
                  </p>
                </div>

                <div className="bg-background/80 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-sm">💬 Community</h4>
                  <p className="text-xs text-muted-foreground">
                    Join our Telegram group for instant help from the community!
                  </p>
                </div>

                <div className="bg-background/80 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-sm">📱 Social Media</h4>
                  <p className="text-xs text-muted-foreground">
                    Follow us for daily study tips, PYQs, and exam updates!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}