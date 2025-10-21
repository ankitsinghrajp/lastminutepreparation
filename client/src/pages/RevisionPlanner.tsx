import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { Calendar, CheckCircle2, Circle, Sparkles } from "lucide-react";

interface DayPlan {
  day: number;
  topic: string;
  duration: string;
  completed: boolean;
}

export default function RevisionPlanner() {
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [weakTopics, setWeakTopics] = useState("");
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      const samplePlan: DayPlan[] = [
        { day: 1, topic: "Introduction & Core Concepts", duration: "2 hours", completed: false },
        { day: 2, topic: "Weak Topics - Part 1", duration: "3 hours", completed: false },
        { day: 3, topic: "Advanced Concepts", duration: "2.5 hours", completed: false },
        { day: 4, topic: "Weak Topics - Part 2", duration: "3 hours", completed: false },
        { day: 5, topic: "Practice Questions", duration: "2 hours", completed: false },
        { day: 6, topic: "Revision & Mock Test", duration: "3 hours", completed: false },
        { day: 7, topic: "Final Review & Rest", duration: "1.5 hours", completed: false },
      ];
      setPlan(samplePlan);
      setIsGenerating(false);
    }, 2000);
  };

  const toggleCompletion = (index: number) => {
    setPlan(plan.map((item, i) => 
      i === index ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = plan.filter(p => p.completed).length;
  const progress = plan.length > 0 ? (completedCount / plan.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold">Revision Planner</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Create a personalized 7-day study plan
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm h-fit">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    placeholder="e.g., Physics, Mathematics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Exam Date</label>
                  <Input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Weak Topics</label>
                  <Textarea
                    placeholder="List your weak areas or topics that need more focus..."
                    value={weakTopics}
                    onChange={(e) => setWeakTopics(e.target.value)}
                    rows={4}
                    className="bg-background/50"
                  />
                </div>

                <Button 
                  className="w-full gradient-primary border-0"
                  onClick={handleGeneratePlan}
                  disabled={!subject || !examDate || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin" />
                      Creating Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Study Plan
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <div className="space-y-6">
              {plan.length > 0 && (
                <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Progress</h3>
                      <span className="text-sm text-muted-foreground">
                        {completedCount} / {plan.length} days
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </Card>
              )}

              <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">7-Day Study Plan</h3>

                  {plan.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Your personalized plan will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {plan.map((item, index) => (
                        <div
                          key={index}
                          className={`p-4 bg-background/50 rounded-lg border-2 transition-all cursor-pointer ${
                            item.completed 
                              ? 'border-primary/50 bg-primary/5' 
                              : 'border-transparent hover:border-border'
                          }`}
                          onClick={() => toggleCompletion(index)}
                        >
                          <div className="flex items-start gap-3">
                            {item.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold">Day {item.day}</h4>
                                <span className="text-sm text-muted-foreground">{item.duration}</span>
                              </div>
                              <p className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {item.topic}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
