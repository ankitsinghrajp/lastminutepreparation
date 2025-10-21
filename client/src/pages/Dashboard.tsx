import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Calendar, Award, Brain, FileQuestion, Image as ImageIcon, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const stats = [
    { label: "Notes Uploaded", value: "12", icon: FileText },
    { label: "Summaries Generated", value: "8", icon: Award },
    { label: "Questions Created", value: "45", icon: FileQuestion },
    { label: "Study Streak", value: "5 days", icon: Calendar },
  ];

  const notesHistory = [
    { name: "Physics Chapter 5.pdf", date: "2 hours ago", size: "2.3 MB" },
    { name: "Chemistry Notes.pdf", date: "1 day ago", size: "4.1 MB" },
    { name: "Math Problems.pdf", date: "2 days ago", size: "1.8 MB" },
  ];

  const summariesHistory = [
    { title: "Quantum Mechanics Summary", date: "3 hours ago", wordCount: 450 },
    { title: "Organic Chemistry Summary", date: "1 day ago", wordCount: 520 },
    { title: "Calculus Concepts Summary", date: "3 days ago", wordCount: 380 },
  ];

  const questionsHistory = [
    { topic: "Thermodynamics", count: 15, difficulty: "Medium", date: "Yesterday" },
    { topic: "Electromagnetism", count: 20, difficulty: "Hard", date: "2 days ago" },
    { topic: "Kinematics", count: 10, difficulty: "Easy", date: "4 days ago" },
  ];

  const revisionPlan = {
    subject: "Physics",
    examDate: "2025-11-01",
    progress: 57,
    completedDays: 4,
    totalDays: 7,
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dashboard
            </h1>
            <Button variant="outline" size="sm">
              Upgrade to Premium
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="p-6 bg-card/50 border-border/50 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-primary">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Current Revision Plan</h3>
                  <p className="text-sm text-muted-foreground">{revisionPlan.subject} • Exam: {revisionPlan.examDate}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/revision-planner">View Plan</Link>
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{revisionPlan.completedDays} / {revisionPlan.totalDays} days completed</span>
              </div>
              <Progress value={revisionPlan.progress} className="h-2" />
            </div>
          </div>
        </Card>

        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notes">Uploaded Notes</TabsTrigger>
            <TabsTrigger value="summaries">Summaries</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-6">
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4">Recent Uploads</h3>
              <div className="space-y-3">
                {notesHistory.map((note, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{note.name}</p>
                        <p className="text-sm text-muted-foreground">{note.date} • {note.size}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="summaries" className="mt-6">
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4">Generated Summaries</h3>
              <div className="space-y-3">
                {summariesHistory.map((summary, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{summary.title}</p>
                        <p className="text-sm text-muted-foreground">{summary.date} • {summary.wordCount} words</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Read</Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="mt-6">
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4">Generated Questions</h3>
              <div className="space-y-3">
                {questionsHistory.map((question, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                        <FileQuestion className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{question.topic}</p>
                        <p className="text-sm text-muted-foreground">
                          {question.count} questions • {question.difficulty} • {question.date}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="p-8 bg-card/50 border-border/50 backdrop-blur-sm text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary mx-auto">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Explore More AI Features</h2>
            <p className="text-muted-foreground">
              Choose from our AI-powered tools to supercharge your learning.
            </p>
            <Button className="gradient-primary border-0 glow-primary" asChild>
              <Link to="/features">Explore Features</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
