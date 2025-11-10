import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Clock, Loader2, Brain, Sparkles, Trash2, HelpCircle, History, X } from "lucide-react";
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
  const [revisionHistory, setRevisionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
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

  // Load revision history from localStorage on mount
  useEffect(() => {
    loadRevisionHistory();
  }, []);

  // Load revision history from localStorage
  const loadRevisionHistory = () => {
    try {
      const saved = localStorage.getItem('revisionHistory');
      if (saved) {
        const history = JSON.parse(saved);
        setRevisionHistory(history);
      }
    } catch (error) {
      console.error("Error loading revision history:", error);
    }
  };

  // Save revision to localStorage (max 20 items)
  const saveRevisionToHistory = (newRevision) => {
    try {
      const saved = localStorage.getItem('revisionHistory');
      let history = saved ? JSON.parse(saved) : [];
      
      // Add new revision with timestamp
      const revisionWithMeta = {
        ...newRevision,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        className: selectedClass,
        subject: selectedSubject,
        chapter: selectedChapter,
        index: selectedIndex,
      };
      
      // Add to beginning of array
      history.unshift(revisionWithMeta);
      
      // Keep only last 20 items
      if (history.length > 20) {
        history = history.slice(0, 20);
      }
      
      // Save back to localStorage
      localStorage.setItem('revisionHistory', JSON.stringify(history));
      setRevisionHistory(history);
    } catch (error) {
      console.error("Error saving revision history:", error);
    }
  };

  // Delete a specific revision from history
  const deleteFromHistory = (id) => {
    try {
      const updated = revisionHistory.filter(item => item.id !== id);
      localStorage.setItem('revisionHistory', JSON.stringify(updated));
      setRevisionHistory(updated);
      toast.success("Revision deleted from history");
    } catch (error) {
      console.error("Error deleting revision:", error);
    }
  };

  // Clear all history
  const clearAllHistory = () => {
    try {
      localStorage.removeItem('revisionHistory');
      setRevisionHistory([]);
      toast.success("All history cleared");
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  // Load a revision from history
  const loadFromHistory = (historyItem) => {
    setRevision(historyItem);
    setSelectedClass(historyItem.className);
    setSelectedSubject(historyItem.subject);
    setSelectedChapter(historyItem.chapter);
    setSelectedIndex(historyItem.index || []);
    setShowHistory(false);
    toast.success("Revision loaded from history");
  };

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
    const res = await getRevision("Analyzing CBSE patterns and extracting only the most important points... ✨", {
      className: selectedClass,
      subject: selectedSubject,
      chapter: selectedChapter,
      index: selectedIndex
    });
    if (res?.data?.data?.data) {
      const revisionData = res.data.data.data;
      setRevision(revisionData);
      saveRevisionToHistory(revisionData);
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
          <div className="sticky top-16 sm:top-20 z-40 mb-6">
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

        {/* History Toggle Button */}
        {revisionHistory.length > 0 && !hasRevision && (
          <div className="mb-4">
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <History className="h-4 w-4 mr-2" />
              {showHistory ? "Hide" : "Show"} Previously Visited ({revisionHistory.length})
            </Button>
          </div>
        )}

        {/* History Panel */}
        {showHistory && revisionHistory.length > 0 && (
          <Card className="p-4 mb-4 bg-card/50 border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <History className="h-5 w-5" />
                Previously Visited Revisions
              </h3>
              <Button
                onClick={clearAllHistory}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600"
              >
                Clear All
              </Button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {revisionHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
                  onClick={() => loadFromHistory(item)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.chapter}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.subject} • Class {item.className}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString()} at{" "}
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFromHistory(item.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Desktop Two-Column Layout / Mobile Single Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Input Section (Desktop) / Single Column (Mobile) */}
          {!hasRevision && (
            <div className="lg:col-span-1">
              <Card className="p-4 sm:p-6 lg:p-8 bg-card/50 border-border/50 backdrop-blur-sm h-full">
                <div className="space-y-5 lg:space-y-6">
                  {/* Class Selection */}
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-3 block">
                      Select Class
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-base"
                    >
                      {classes.map((cls) => (
                        <option key={cls} value={cls}>
                          Class {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject Selection */}
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-3 block">
                      Select Subject
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      disabled={isSubjectLoading || subjects.length === 0}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base"
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
                    <label className="text-sm font-semibold text-foreground mb-3 block">
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
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base"
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
                    <label className="text-sm font-semibold text-foreground mb-3 block">
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
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-base"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
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
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 h-12 lg:h-14 text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
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
            </div>
          )}

          {/* Right Column - Help Card (Desktop) / Below Input (Mobile) */}
          {!hasRevision && (
            <div className="lg:col-span-1">
              <Card className="p-6 lg:p-8 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20 h-full flex flex-col justify-center">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-orange-500/10 flex-shrink-0">
                    <HelpCircle className="h-6 w-6 lg:h-7 lg:w-7 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg lg:text-xl mb-2">Exam Night Revision Mode</h3>
                    <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                      Get chapter-wise key points, formulas, common confusions, and exam strategies. Perfect for last-minute preparation!
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                    <p className="text-sm lg:text-base text-muted-foreground">
                      <span className="font-semibold text-foreground">Focus Timer:</span> Stay on track with built-in timer
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                    <p className="text-sm lg:text-base text-muted-foreground">
                      <span className="font-semibold text-foreground">Key Points:</span> Essential concepts at a glance
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                    <p className="text-sm lg:text-base text-muted-foreground">
                      <span className="font-semibold text-foreground">Exam Strategies:</span> Tips to maximize your score
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Revision Panel - Show when revision exists - Full Width */}
        {hasRevision && (
          <div className="space-y-4 mt-4">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <RevisionPanel revision={revision} />
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!hasRevision && !loading && (
          <Card className="p-8 sm:p-12 lg:p-16 bg-card/30 border-border/30 text-center mt-8">
            <Brain className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 mx-auto mb-4 text-orange-500/50" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 text-muted-foreground">
              Ready for Last-Minute Revision
            </h3>
            <p className="text-sm lg:text-base text-muted-foreground/70 max-w-md mx-auto">
              Select your chapter and generate focused revision content with timer
            </p>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
}