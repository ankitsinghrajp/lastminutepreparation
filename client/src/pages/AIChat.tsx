import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Clock, Loader2, Brain, Sparkles, Trash2, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import {
  useGetRevisionMutation,
  useLazyGetChaptersQuery,
  useLazyGetSubjectsQuery,
} from "@/redux/api/api";
import { useAsyncMutation, useErrors } from "@/hooks/hook";
import RevisionPanel from "@/components/specifics/RevisionPanel";

const classes = ["9th", "10th", "11th", "12th"];

export default function LastNightBeforeExam() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [selectedClass, setSelectedClass] = useState("12th");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState([]);
  const [revision, setRevision] = useState({});
  const [loading, setLoading] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerMinutes * 60);
  const timerRef = useRef(null);

  const [
    fetchSubject,
    {
      isLoading: isSubjectLoading,
      isError: isSubjectError,
      error: subjectError,
      data: subjectData,
    },
  ] = useLazyGetSubjectsQuery();
  const [
    fetchChapter,
    {
      isLoading: isChapterLoading,
      isError: isChapterError,
      error: chapterError,
      data: ChapterData,
    },
  ] = useLazyGetChaptersQuery();

  const [getRevision, isgetRevisionLoading, getRevisionData] = useAsyncMutation(
    useGetRevisionMutation
  );

  // Handle errors
  useErrors([
    { isError: isSubjectError, error: subjectError },
    { isError: isChapterError, error: chapterError },
  ]);

  // Fetch subjects when class changes
  useEffect(() => {
    const fetchSubjectFun = async () => {
      if (selectedClass) {
        setSubjects([]);
        setChapters([]);
        setSelectedSubject("");
        setSelectedChapter("");
        setSelectedIndex([]);
        try {
          await fetchSubject({ selectedClass });
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
        setSelectedIndex([]);
        try {
          await fetchChapter({ selectedClass, selectedSubject });
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
        const firstChapter = chapters[0].chapter;
        setSelectedChapter(firstChapter);
        
        // Find index for the first chapter
        const indexArray = chapters[0]?.index || [];
        setSelectedIndex(indexArray);
      }
    } else if (!isChapterLoading && ChapterData) {
      setChapters([]);
      setSelectedChapter("");
      setSelectedIndex([]);
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

  const handleGenerate = async () => {
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      toast.error("Please select class, subject, and chapter");
      return;
    }
     const res = await getRevision("Analyzing CBSE patterns and extracting only the most important points... ✨",{className:selectedClass, subject:selectedSubject, chapter: selectedChapter,index:selectedIndex});
     if(res?.data?.data?.data){
      setRevision(res.data.data.data);
     }
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
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleClear = () => {
    setRevision({});
    setTimerActive(false);
    setTimeLeft(timerMinutes * 60);
    toast.success("Cleared - Ready for new revision");
  };

  const hasRevision = revision && Object.keys(revision).length > 0;

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

        {/* Fixed Timer Header - Only show when revision exists */}
        {hasRevision && (
          <div className="sticky top-16 sm:top-20 z-40 mb-4">
            <Card className="p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-red-500 border-0 shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
                  <div className="text-white">
                    <div className="text-lg sm:text-2xl font-bold">{formatTime(timeLeft)}</div>
                    <div className="text-[10px] sm:text-xs opacity-90 hidden sm:block">
                      {timerActive ? "Focus Mode Active" : "Ready to Focus"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={toggleTimer}
                    size="sm"
                    variant="secondary"
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    {timerActive ? "Stop" : "Start"}
                  </Button>
                  <Button
                    onClick={handleClear}
                    size="sm"
                    variant="secondary"
                    className="h-8 sm:h-9"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Input Section - Only show when no revision */}
        {!hasRevision && (
          <>
            <Card className="p-4 sm:p-6 bg-card/50 border-border/50 backdrop-blur-sm">
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
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
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
                    onChange={(e) => {
                      const newChapter = e.target.value;
                      setSelectedChapter(newChapter);
                      
                      // Find the index for the newly selected chapter
                      const chapterObj = chapters.find(
                        (item) =>
                          item.chapter.trim().toLowerCase() ===
                          newChapter.trim().toLowerCase()
                      );
                      const indexArray = chapterObj?.index || [];
                      setSelectedIndex(indexArray);
                      
                    }}
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

                {/* Timer Setup */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Set Focus Timer (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={timerMinutes}
                    onChange={(e) =>
                      setTimerMinutes(parseInt(e.target.value) || 30)
                    }
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Timer will help you stay focused during revision
                  </p>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={
                    isgetRevisionLoading ||
                    !selectedClass ||
                    !selectedSubject ||
                    !selectedChapter
                  }
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 h-12 text-base font-medium"
                >
                  {isgetRevisionLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating Revision...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate Revision
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Help Card */}
            <Card className="p-4 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20 mt-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Exam Night Revision Mode</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Get chapter-wise key points, formulas, common confusions, and exam strategies. Perfect for last-minute preparation!
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Revision Panel - Show when revision exists */}
        {hasRevision && (
          <div className="space-y-4 mt-4">
            <Card className=" bg-card/50 border-border/50 backdrop-blur-sm">
              <RevisionPanel revision={revision} />
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!hasRevision && !loading && (
          <Card className="p-8 sm:p-12 bg-card/30 border-border/30 text-center mt-6">
            <Brain className="h-12 w-12 sm:h-14 sm:w-14 mx-auto mb-3 text-orange-500/50" />
            <h3 className="text-base sm:text-lg font-medium mb-1.5 text-muted-foreground">
              Ready for Last-Minute Revision
            </h3>
            <p className="text-sm text-muted-foreground/70">
              Select your chapter and generate focused revision content with timer
            </p>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
}