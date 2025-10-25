import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Home, Search, FileText, ArrowLeft, AlertCircle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <div className="text-center mb-12 space-y-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-7xl font-bold">
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                404
              </span>
            </h1>
            <h2 className="text-4xl font-bold">Page Not Found</h2>
          </div>
          
          <p className="text-2xl text-muted-foreground">
            Oops! The page you're looking for doesn't exist.
          </p>
        </div>

        <Card className="p-8 bg-card/50 border-border/50 backdrop-blur-sm mb-6">
          <h3 className="text-xl font-semibold mb-4">It might have been:</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500"></div>
              <span>Moved</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500"></div>
              <span>Deleted</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500"></div>
              <span>Or maybe you typed the URL incorrectly</span>
            </li>
          </ul>
        </Card>

        <Card className="px-2 py-4 bg-card/50 border-border/50 backdrop-blur-sm mb-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="text-2xl">🔄</span>
            What You Can Do
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              onClick={() => window.location.href = '/'}
              className="h-auto py-6 flex flex-col items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
            >
              <Home className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Homepage</div>
                <div className="text-xs opacity-90">Start fresh</div>
              </div>
            </Button>

            <Button
              onClick={() => window.location.href = '/features'}
              className="h-auto py-6 flex flex-col items-center gap-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white border-0"
            >
              <FileText className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Features</div>
                <div className="text-xs opacity-90">Explore tools</div>
              </div>
            </Button>

            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="h-auto py-6 flex flex-col items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
            >
              <Search className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Dashboard</div>
                <div className="text-xs opacity-90">Find content</div>
              </div>
            </Button>
          </div>
        </Card>

        <Card className="p-8 bg-gradient-to-br from-blue-500 to-purple-500 text-white text-center">
          <div className="text-4xl mb-4">💡</div>
          <h3 className="text-xl font-semibold mb-3">Quick Tip</h3>
          <p className="text-white/90 mb-4">
            Use the search bar to quickly find topics, PYQs, or chapter summaries you need.
          </p>
          <p className="text-lg font-medium">
            Stay calm — your last-minute preparation is safe with us! 🚀
          </p>
        </Card>

        <div className="text-center mt-8">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
