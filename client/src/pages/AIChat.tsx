import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Clock, Loader2, FileText, Brain } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { useLazyGetChaptersQuery, useLazyGetSubjectsQuery } from "@/redux/api/api";
import { useErrors } from "@/hooks/hook";

const classes = ["9th", "10th", "11th", "12th"];

export default function LastNightBeforeExam() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [selectedClass, setSelectedClass] = useState("12th");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [revision, setRevision] = useState("");
  const [loading, setLoading] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerMinutes * 60);
  const timerRef = useRef(null);
  
  const [fetchSubject, {isLoading: isSubjectLoading, isError: isSubjectError, error: subjectError, data: subjectData}] = useLazyGetSubjectsQuery();
  const [fetchChapter, {isLoading: isChapterLoading, isError: isChapterError, error: chapterError, data: ChapterData}] = useLazyGetChaptersQuery();

  // Handle errors
  useErrors([
    { isError: isSubjectError, error: subjectError },
    { isError: isChapterError, error: chapterError }
  ]);

  // Fetch subjects when class changes
  useEffect(() => {
    const fetchSubjectFun = async () => {
      if (selectedClass) {
        setSubjects([]);
        setChapters([]);
        setSelectedSubject("");
        setSelectedChapter("");
        try {
          await fetchSubject({selectedClass});
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
      }
    };
    fetchSubjectFun();
  }, [selectedClass, fetchSubject]);
  
  // Update subjects when subject data is loaded
  useEffect(() => {
    if (subjectData?.data?.subjects) {
      const subjects = subjectData.data.subjects;
      setSubjects(subjects);
      if (subjects.length > 0 && !isSubjectLoading) {
        setSelectedSubject(subjects[0].subject);
      }
    } else if (!isSubjectLoading && subjectData) {
      setSubjects([]);
      setSelectedSubject("");
    }
  }, [subjectData, isSubjectLoading]);

  // Fetch chapters when subject changes
  useEffect(() => {
    const fetchChaptersFun = async () => {
      if (selectedSubject && selectedClass) {
        setChapters([]);
        setSelectedChapter("");
        try {
          await fetchChapter({selectedClass, selectedSubject});
        } catch (error) {
          console.error("Error fetching chapters:", error);
        }
      }
    };
    fetchChaptersFun();
  }, [selectedSubject, selectedClass, fetchChapter]);

  // Update chapters when chapter data is loaded
  useEffect(() => {
    if (ChapterData?.data?.chapters) {
      const chapters = ChapterData.data.chapters;
      setChapters(chapters);
      if (chapters.length > 0 && !isChapterLoading) {
        setSelectedChapter(chapters[0].chapter);
      }
    } else if (!isChapterLoading && ChapterData) {
      setChapters([]);
      setSelectedChapter("");
    }
  }, [ChapterData, isChapterLoading]);

  // Timer logic
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            toast.success("Timer completed! Take a break.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timeLeft]);

  const handleGenerate = () => {
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      toast.error("Please select class, subject, and chapter");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setRevision("Sample revision content will appear here...");
      setLoading(false);
      toast.success("Revision generated successfully!");
    }, 2000);
  };

  const toggleTimer = () => {
    if (timerActive) {
      setTimerActive(false);
    } else {
      setTimeLeft(timerMinutes * 60);
      setTimerActive(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-3 sm:px-4 py-20 sm:py-24 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold px-4">
            Last Night{" "}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Before Exam
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Quick revision mode with key points and high-yield questions
          </p>
        </div>

        {/* Input Section */}
        <Card className="p-4 sm:p-6 lg:p-8 bg-card/50 border-border/50 backdrop-blur-sm mb-4 sm:mb-6">
          <div className="space-y-4">
            {/* Class Selection */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Select Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
              >
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Subject Selection */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Select Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={isSubjectLoading || subjects.length === 0}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isSubjectLoading ? (
                  <option>Loading...</option>
                ) : subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <option key={subject.subject} value={subject.subject}>
                      {subject.subject}
                    </option>
                  ))
                ) : (
                  <option>No subjects available</option>
                )}
              </select>
            </div>

            {/* Chapter Selection */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Select Chapter
              </label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                disabled={isChapterLoading || chapters.length === 0}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isChapterLoading ? (
                  <option>Loading...</option>
                ) : chapters.length > 0 ? (
                  chapters.map((chapter) => (
                    <option key={chapter.chapter} value={chapter.chapter}>
                      {chapter.chapter}
                    </option>
                  ))
                ) : (
                  <option>No chapters available</option>
                )}
              </select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !selectedClass || !selectedSubject || !selectedChapter}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 h-11 sm:h-12 text-sm sm:text-base font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Generate Revision
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Focus Timer - Mobile */}
        <Card className="p-4 sm:p-6 bg-card/50 border-border/50 backdrop-blur-sm mb-4 sm:mb-6 lg:hidden">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Focus Timer</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-center">
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="text-white/80 text-sm">
                {timerActive ? "Focus Mode Active" : "Ready to Focus"}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Set Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 30)}
                disabled={timerActive}
                className="w-full px-3 sm:px-4 py-2.5 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              />
            </div>

            <Button
              onClick={toggleTimer}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 h-11"
            >
              {timerActive ? "Stop Timer" : "Start Timer"}
            </Button>

            <div className="text-xs text-muted-foreground text-center pt-2">
              <p>Stay focused and avoid distractions!</p>
              <p className="mt-1">Timer simulates exam conditions</p>
            </div>
          </div>
        </Card>

        {/* Content Layout */}
        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Revision Panel */}
          <div className="lg:col-span-3">
            <Card className="p-4 sm:p-6 bg-card/50 border-border/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg sm:text-xl font-semibold">Revision Panel</h2>
              </div>
              
              <div className="bg-background/80 rounded-lg p-4 sm:p-6 min-h-[400px] sm:min-h-[500px]">
                {revision ? (
                  <pre className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base font-sans">{revision}</pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground px-4">
                    <Brain className="h-12 w-12 sm:h-16 sm:w-16 mb-3 sm:mb-4 opacity-50" />
                    <p className="text-base sm:text-lg font-medium mb-2">Your key points and important questions will appear here</p>
                    <p className="text-xs sm:text-sm">Select your class, subject, and chapter, then click "Generate Revision"</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Focus Timer - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold">Focus Timer</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-center">
                  <div className="text-5xl font-bold text-white mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-white/80 text-sm">
                    {timerActive ? "Focus Mode Active" : "Ready to Focus"}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Set Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={timerMinutes}
                    onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 30)}
                    disabled={timerActive}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <Button
                  onClick={toggleTimer}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
                >
                  {timerActive ? "Stop Timer" : "Start Timer"}
                </Button>

                <div className="text-xs text-muted-foreground text-center pt-2">
                  <p>Stay focused and avoid distractions!</p>
                  <p className="mt-1">Timer simulates exam conditions</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}