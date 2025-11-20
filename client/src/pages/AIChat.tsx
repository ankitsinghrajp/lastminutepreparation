import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Clock, Loader2, Brain, Sparkles, Trash2, HelpCircle, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import {
   useGetLastNightSummaryMutation,
   useGetLastNightAiCoachMutation,
   useGetLastNightPredictedQuestionsMutation,
   useGetLastNightImportantTopicsMutation,
   useGetLastNightMcqsMutation,
   useGetLastNightMemoryBoosterMutation,
   useGetLastNightQuickShotsMutation,
  useLazyGetChaptersQuery,
  useLazyGetSubjectsQuery,
} from "@/redux/api/api";
import { useAsyncMutation, useErrors } from "@/hooks/hook";
import RevisionPanel from "@/components/specifics/RevisionPanel";

const classes = ["9th", "10th", "11th", "12th"];

export default function LastNightBeforeExam() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  // Dropdown of class subject and chapters
  const [selectedClass, setSelectedClass] = useState("12th");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  // states of data
  const [summary, setSummary] = useState("");
  const [importantTopics, setImportantTopics] = useState([]);
  const [predictedQuestion, setPredictedQuestion] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [memoryBooster, setMemoryBooster] = useState([]);
  const [aiCoach, setAiCoach] = useState([]);

  // Chat messages for sequential loading
  const [chatMessages, setChatMessages] = useState([]);

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

  const [getSummary, isGetSummaryLoading, getSummaryData] = useAsyncMutation(
    useGetLastNightSummaryMutation
  );
  const [getImportantTopics, isGetImportantTopicsLoading, getImportantTopicsData] = useAsyncMutation(
    useGetLastNightImportantTopicsMutation
  );
  const [getPredictedQuestion, isGetPredictedQuestionsLoading, getPredictedQuestionsData] = useAsyncMutation(
    useGetLastNightPredictedQuestionsMutation
  );
  const [getMcqs, isGetMcqsLoading, getMcqsData] = useAsyncMutation(
    useGetLastNightMcqsMutation
  );
  const [getMemoryBooster, isGetMemoryBoosterLoading, getMemoryBoosterData] = useAsyncMutation(
    useGetLastNightMemoryBoosterMutation
  );
  const [getAiCoach, isGetAiCoachLoading, getAiCoachData] = useAsyncMutation(
    useGetLastNightAiCoachMutation
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

  const handleGenerate = async () => {
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      toast.error("Please select class, subject, and chapter");
      return;
    }

    setLoading(true);
    setChatMessages([]);
    
    const params = {
      className: selectedClass,
      subject: selectedSubject,
      chapter: selectedChapter,
    };

    try {
      // 1. Get Summary
      setChatMessages(prev => [...prev, { type: 'loading', message: 'Analyzing CBSE patterns and extracting key points...' }]);
      
      const summaryRes = await getSummary("Analyzing CBSE patterns and extracting key points...", params);
      if (summaryRes?.data?.data) {
        const summaryData = summaryRes.data.data?.summary;
        setSummary(summaryData);
        setChatMessages(prev => [...prev.slice(0, -1), { type: 'success', message: 'Summary generated', data: summaryData }]);
      }

      // 2. Get Important Topics
      setChatMessages(prev => [...prev, { type: 'loading', message: 'Extracting important topics...' }]);
      
      const topicsRes = await getImportantTopics("Extracting important topics...", params);
      if (topicsRes?.data?.data) {
        const topicsData = topicsRes.data.data?.topics;
        setImportantTopics(topicsData);
        setChatMessages(prev => [...prev.slice(0, -1), { type: 'success', message: 'Important topics extracted', data: topicsData }]);
      }

      // 3. Get Predicted Questions
      setChatMessages(prev => [...prev, { type: 'loading', message: 'Generating predicted questions...' }]);
      
      const questionsRes = await getPredictedQuestion("Generating predicted questions...", params);
      if (questionsRes?.data?.data) {
        const questionsData = questionsRes.data.data?.questions;
        setPredictedQuestion(questionsData);
        setChatMessages(prev => [...prev.slice(0, -1), { type: 'success', message: 'Predicted questions generated', data: questionsData }]);
      }

      // 4. Get MCQs
      setChatMessages(prev => [...prev, { type: 'loading', message: 'Creating practice MCQs...' }]);
      
      const mcqsRes = await getMcqs("Creating practice MCQs...", params);
      if (mcqsRes?.data?.data) {
        const mcqsData = mcqsRes.data.data?.mcqs;
        setMcqs(mcqsData);
        setChatMessages(prev => [...prev.slice(0, -1), { type: 'success', message: 'MCQs created', data: mcqsData }]);
      }

      // 5. Get Memory Booster
      setChatMessages(prev => [...prev, { type: 'loading', message: 'Creating memory boosters...' }]);
      
      const memoryBoosterRes = await getMemoryBooster("Creating memory boosters...", params);
      if (memoryBoosterRes?.data?.data) {
        const memoryBoosterData = memoryBoosterRes.data.data?.boosters;
        setMemoryBooster(memoryBoosterData);
        setChatMessages(prev => [...prev.slice(0, -1), { type: 'success', message: 'Memory boosters created', data: memoryBoosterData }]);
      }

      // 6. Get AI Coach
      setChatMessages(prev => [...prev, { type: 'loading', message: 'Generating study plan...' }]);
      
      const aiCoachRes = await getAiCoach("Generating study plan...", params);
      console.log("This is the ai Coach Response",aiCoachRes);
      if (aiCoachRes?.data?.data) {
        const aiCoachData = aiCoachRes.data.data?.coach;
        console.log("This is the ai coach data: ",aiCoachData)
        setAiCoach(aiCoachData);
        setChatMessages(prev => [...prev.slice(0, -1), { type: 'success', message: 'Study plan generated', data: aiCoachData }]);
      }

      // Add completion message
      setChatMessages(prev => [...prev, { type: 'complete', message: '✓ All materials ready for revision' }]);
      toast.success("Revision materials generated successfully!");

    } catch (error) {
      setChatMessages(prev => [...prev, { type: 'error', message: 'Failed to generate materials' }]);
      toast.error("Failed to generate revision materials");
    } finally {
      setLoading(false);
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
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClear = () => {
    setSummary("");
    setImportantTopics([]);
    setPredictedQuestion([]);
    setMcqs([]);
    setMemoryBooster([]);
    setAiCoach([]);
    setChatMessages([]);
    setTimerActive(false);
    setTimeLeft(timerMinutes * 60);
    toast.success("Cleared - Ready for new revision");
  };

  const hasRevision = chatMessages.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-20 sm:py-24 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 mb-4">
            <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            Last Night{" "}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Before Exam
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Focused revision with key points and high-yield questions
          </p>
        </div>

        {/* Timer Bar - Sticky when content exists */}
        {hasRevision && (
          <div className="sticky top-16 sm:top-20 z-40 mb-6">
            <Card className="p-4 bg-gradient-to-r from-orange-500 to-red-500 border-0 shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-white flex-shrink-0" />
                  <div className="text-white">
                    <div className="text-2xl font-bold tabular-nums">{formatTime(timeLeft)}</div>
                    <div className="text-xs opacity-90">
                      {timerActive ? "Focus Mode" : "Paused"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={toggleTimer}
                    size="sm"
                    variant="secondary"
                    className="h-9 px-4 font-medium"
                  >
                    {timerActive ? "Pause" : "Start"}
                  </Button>
                  <Button
                    onClick={handleClear}
                    size="sm"
                    variant="secondary"
                    className="h-9 px-3"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Input Section - Only show when no revision */}
        {!hasRevision && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-6 sm:p-8">
              <div className="space-y-5">
                {/* Class Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Class
                  </label>
                  <div className="relative">
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full h-11 px-4 pr-10 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
                    >
                      {classes.map((cls) => (
                        <option key={cls} value={cls}>
                          Class {cls}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      disabled={isSubjectLoading || subjects.length === 0}
                      className="w-full h-11 px-4 pr-10 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                    >
                      {isSubjectLoading ? (
                        <option>Loading subjects...</option>
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
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Chapter Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Chapter
                  </label>
                  <div className="relative">
                    <select
                      value={selectedChapter}
                      onChange={(e) => setSelectedChapter(e.target.value)}
                      disabled={isChapterLoading || chapters.length === 0}
                      className="w-full h-11 px-4 pr-10 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                    >
                      {isChapterLoading ? (
                        <option>Loading chapters...</option>
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
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Timer Setup */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Focus Timer (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={timerMinutes}
                    onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 30)}
                    className="w-full h-11 px-4 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !selectedClass || !selectedSubject || !selectedChapter}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Revision
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Info Card */}
            <Card className="p-6 sm:p-8 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2.5 rounded-xl bg-orange-500/10 flex-shrink-0">
                  <HelpCircle className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">What You'll Get</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive last-minute revision materials
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: "Chapter Summary", desc: "Key concepts at a glance" },
                  { label: "Important Topics", desc: "Focus areas with formulas" },
                  { label: "Predicted Questions", desc: "High-yield exam questions" },
                  { label: "Practice MCQs", desc: "Test your understanding" },
                  { label: "Memory Boosters", desc: "Quick recall techniques" },
                  { label: "Study Plan", desc: "Time-bound revision strategy" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Progress & Content Display */}
        {hasRevision && (
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="p-4 sm:p-6">
              <h3 className="text-base font-semibold mb-4">Generation Progress</h3>
              <div className="space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {msg.type === 'loading' && (
                        <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                      )}
                      {msg.type === 'success' && (
                        <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                        </div>
                      )}
                      {msg.type === 'error' && (
                        <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                        </div>
                      )}
                      {msg.type === 'complete' && (
                        <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-green-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${msg.type === 'error' ? 'text-red-500' : 'text-foreground'}`}>
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Revision Content */}
            <Card>
              <RevisionPanel 
                summary={summary} 
                importantTopics={importantTopics} 
                predictedQuestion={predictedQuestion} 
                mcqs={mcqs} 
                memoryBooster={memoryBooster} 
                aiCoach={aiCoach}
              />
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!hasRevision && !loading && (
          <Card className="p-12 sm:p-16 text-center mt-8">
            <Brain className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-orange-500/30" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-muted-foreground">
              Ready When You Are
            </h3>
            <p className="text-sm text-muted-foreground/70">
              Select your chapter to begin focused revision
            </p>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
}