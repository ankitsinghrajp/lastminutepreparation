import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Loader2, 
  Brain, 
  Sparkles, 
  Layers,
  Clock,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import {
  useGetChapterWiseImportantQuestionMutation,
  useGetChapterWiseMindMapMutation,
  useGetChapterWiseShortNotesMutation,
  useGetChapterWiseSummaryMutation,
  useLazyGetChaptersQuery,
  useLazyGetSubjectsQuery,
} from "@/redux/api/api";
import { useAsyncMutation, useErrors } from "@/hooks/hook";
import { toast } from "sonner";
import ContentArea from "@/components/specifics/chapterWiseStudy/contentArea";
import logo from "../assets/logo.png"

const classes = ["9th", "10th", "11th", "12th"];

export default function ChapterWiseStudy() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [selectedClass, setSelectedClass] = useState("12th");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  const [loading, setLoading] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  // Content State
  const [summary, setSummary] = useState("");
  const [shortNotes, setShortNotes] = useState([]);
  const [mindMap, setMindMap] = useState({});
  const [importantQuestions, setImportantQuestions] = useState({});

  // Individual loading and completion states
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryComplete, setSummaryComplete] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesComplete, setNotesComplete] = useState(false);
  const [mindMapLoading, setMindMapLoading] = useState(false);
  const [mindMapComplete, setMindMapComplete] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsComplete, setQuestionsComplete] = useState(false);

  // Progress tracking state
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState("");
  const contentEndRef = useRef(null);

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

  const [getSummary] = useAsyncMutation(useGetChapterWiseSummaryMutation);
  const [getShortNotes] = useAsyncMutation(useGetChapterWiseShortNotesMutation);
  const [getMindMap] = useAsyncMutation(useGetChapterWiseMindMapMutation);
  const [getImportantQuestion] = useAsyncMutation(useGetChapterWiseImportantQuestionMutation);
 
  // Handle errors
  useErrors([
    { isError: isSubjectError, error: subjectError },
    { isError: isChapterError, error: chapterError },
  ]);


    // Poll every 2 seconds until summary is ready
  const pollSummary = async (params) => {
    const interval = setInterval(async () => {
      try {
        const res = await getSummary(null, params);
  
        if (res?.data?.statusCode === 200) {
          setSummary(res.data.data.summary);
          clearInterval(interval);
          toast.success("Summary Ready!");
          setSummaryComplete(true);
        }
      } catch (error) {
        clearInterval(interval);
        toast.error("Error fetching summary");
      }
    }, 2000);
  };

     // Poll every 6 seconds until summary is ready
  const pollshortNotes = async (params) => {
    const interval = setInterval(async () => {
      try {
        const res = await getShortNotes(null, params);
  
        if (res?.data?.statusCode === 200) {
          setShortNotes(res.data.data.shortNotes);
          clearInterval(interval);
          setNotesComplete(true);
          toast.success("Short Notes Ready!");
          
        }
      } catch (error) {
        clearInterval(interval);
        toast.error("Error fetching short Notes");
      }
    }, 6000);
  };

  //  Poll every 8 second until summary is ready
    const pollMindMap = async (params) => {
    const interval = setInterval(async () => {
      try {
        const res = await getMindMap(null, params);
  
        if (res?.data?.statusCode === 200) {
          setMindMap(res.data.data);
          clearInterval(interval);
          setMindMapComplete(true);
          toast.success("Mind Map Ready!");
          
        }
      } catch (error) {
        clearInterval(interval);
        toast.error("Error fetching mind map");
      }
    }, 8000);
  };

    const pollImportantQuestion = async (params) => {
    const interval = setInterval(async () => {
      try {
        const res = await getImportantQuestion(null, params);
  
        if (res?.data?.statusCode === 200) {
          setImportantQuestions(res.data.data.questions);
          clearInterval(interval);
          setQuestionsComplete(true);
          toast.success("Questions Ready!");
          
        }
      } catch (error) {
        clearInterval(interval);
        toast.error("Error fetching questions...");
      }
    }, 10000);
  };

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

  const handleGenerate = async () => {
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      toast.error("Please select class, subject, and chapter");
      return;
    }

    setLoading(true);
    setHasContent(true);
    setCurrentLoadingMessage("");
    
    // Reset all content
    setSummary("");
    setShortNotes([]);
    setMindMap({});
    setImportantQuestions({});

    // Reset all states
    setSummaryLoading(false);
    setSummaryComplete(false);
    setNotesLoading(false);
    setNotesComplete(false);
    setMindMapLoading(false);
    setMindMapComplete(false);
    setQuestionsLoading(false);
    setQuestionsComplete(false);

    const params = {
      className: selectedClass,
      subject: selectedSubject,
      chapter: selectedChapter
    };

    try {
      // Step 1: Generate Summary
      setSummaryLoading(true);
      try {
        const summaryRes = await getSummary("Generating Summary...", params);

         if (summaryRes?.data?.data) {
        setSummary(summaryRes.data.data?.summary);
        setSummaryComplete(true);
      }

      if (summaryRes?.data?.statusCode === 200) {
      // 🎉 Summary ready instantly (from Redis)
      setSummary(summaryRes.data.data.summary);
      setSummaryComplete(true);
    }

    if (summaryRes?.data?.statusCode === 202) {
      // ⏳ Not ready → queued → start polling
      toast.message("Generating summary...");
      pollSummary(params);
    }

      } catch (error) {
        console.error("Error generating summary:", error);
        setSummaryComplete(false);
      } finally {
        setSummaryLoading(false);
      }

      // Step 2: Generate Short Notes (only after summary completes)
      setNotesLoading(true);
      try {
        const notesRes = await getShortNotes("Generating Short Notes...", params);
        if (notesRes?.data?.data) {
        setShortNotes(notesRes.data.data?.shortNotes);
        setNotesComplete(true);
      }

      if (notesRes?.data?.statusCode === 200) {
      // 🎉 Summary ready instantly (from Redis)
      setShortNotes(notesRes.data.data.shortNotes);
      setNotesComplete(true);
    }

    if (notesRes?.data?.statusCode === 202) {
      // ⏳ Not ready → queued → start polling
      toast.message("Generating short notes...");
      pollshortNotes(params);

      }} catch (error) {
        console.error("Error generating short notes:", error);
        setNotesComplete(false);
      } finally {
        setNotesLoading(false);
      }

      // Step 3: Generate Mind Map (only after short notes completes)
      setMindMapLoading(true);
      try {
        const mindMapRes = await getMindMap("Generating Mind Map...", params);
       if (mindMapRes?.data?.data) {
        setMindMap(mindMapRes.data.data);
        setMindMapComplete(true);
      }

      if (mindMapRes?.data?.statusCode === 200) {
      // 🎉 Summary ready instantly (from Redis)
      setMindMap(mindMapRes.data.data);
      setMindMapComplete(true);
    }

    if (mindMapRes?.data?.statusCode === 202) {
      // ⏳ Not ready → queued → start polling
      toast.message("Generating mind map...");
      pollMindMap(params);

      }
      } catch (error) {
        console.error("Error generating mind map:", error);
        setMindMapComplete(false);
      } finally {
        setMindMapLoading(false);
      }

      // Step 4: Generate Important Questions (only after mind map completes)
      setQuestionsLoading(true);
      try {
        const questionsRes = await getImportantQuestion("Generating Important Questions...", params);
         if (questionsRes?.data?.data) {
        setImportantQuestions(questionsRes.data.data.questions);
        setQuestionsComplete(true);
      }

      if (questionsRes?.data?.statusCode === 200) {
      // 🎉 Summary ready instantly (from Redis)
      setImportantQuestions(questionsRes.data.data.questions);
      setQuestionsComplete(true);
    }

    if (questionsRes?.data?.statusCode === 202) {
      // ⏳ Not ready → queued → start polling
      toast.message("Generating Questions...");
      pollImportantQuestion(params);

      }
      } catch (error) {
        console.error("Error generating questions:", error);
        setQuestionsComplete(false);
      } finally {
        setQuestionsLoading(false);
      }

    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate some content");
    } finally {
      setLoading(false);
    }
  };

  // Check if any content is still loading
  const isAnyContentLoading = summaryLoading || notesLoading || mindMapLoading || questionsLoading;

  // Determine which content to show based on completion
  const shouldShowSummary = summaryComplete || summaryLoading;
  const shouldShowShortNotes = (notesComplete || notesLoading) && summaryComplete;
  const shouldShowMindMap = (mindMapComplete || mindMapLoading) && notesComplete;
  const shouldShowImportantQuestions = (questionsComplete || questionsLoading) && mindMapComplete;

  // Check if any content has been loaded
  const hasContentData = summary || shortNotes.length > 0 || 
                         Object.keys(mindMap).length > 0 || 
                         Object.keys(importantQuestions).length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar/>

      <div className={`mt-16 md:mt-24 ${hasContent ? '' : 'container mx-auto px-3 sm:px-4 max-w-7xl'} py-6`}>
        <div className={`text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4 ${hasContent ? 'px-3 sm:px-4' : ''}`}>
          <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold px-4">
            Chapter Wise{" "}
            <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
              Study
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            This guide covers each chapter fully, so you walk into the exam with zero doubt.
          </p>
        </div>

        {/* Input Section - Hide when content exists */}
        {!hasContent && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
            <div>
              <Card className="p-4 sm:p-6 bg-card/50 border-border/50 backdrop-blur-sm">
                <div className="space-y-5">
                  {/* Class Selection */}
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-3 block">
                      Select Class
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
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
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base"
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
                      onChange={(e) => setSelectedChapter(e.target.value)}
                      disabled={isChapterLoading || chapters.length === 0}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base"
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
                    disabled={loading || !selectedChapter}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 h-12 lg:h-14 text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Building Chapter Structure...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Start Learning
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Column - Help */}
            <div>
              <Card className="p-6 lg:p-8 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20 h-full flex flex-col justify-center">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-blue-500/10 flex-shrink-0">
                    <Layers className="h-6 w-6 lg:h-7 lg:w-7 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg lg:text-xl mb-2">AI-Powered Deep Learning</h3>
                    <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                      Get structured chapter breakdown with sections, topics, and subtopics. Choose your learning style!
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p className="text-sm lg:text-base text-muted-foreground">
                      <span className="font-semibold text-foreground">Smart Breakdown:</span> Auto-organized content hierarchy
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p className="text-sm lg:text-base text-muted-foreground">
                      <span className="font-semibold text-foreground">Multiple Modes:</span> Concept, Formula, Quiz & Flashcards
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p className="text-sm lg:text-base text-muted-foreground">
                      <span className="font-semibold text-foreground">AI Learning Path:</span> Personalized recommendations
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Content Area - Shows content in order as they complete */}
        {hasContent && (
          <div className="w-full">
            <ContentArea 
              summary={shouldShowSummary ? summary : ""} 
              shortNotes={shouldShowShortNotes ? shortNotes : []} 
              mindMap={shouldShowMindMap ? mindMap : {}} 
              importantQuestions={shouldShowImportantQuestions ? importantQuestions : {}}
            />
          </div>
        )}

        {/* Chatbot-style loading indicator - shows current loading step */}
        {hasContent && isAnyContentLoading && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="flex items-start gap-3 p-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <img className="h-8 w-8" src={logo} alt="" />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-muted/50 border border-border/50">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    {summaryLoading && "📝 Generating comprehensive chapter summary..."}
                    {!summaryLoading && notesLoading && "📚 Creating concise short notes..."}
                    {!summaryLoading && !notesLoading && mindMapLoading && "🗺️ Building visual mind map..."}
                    {!summaryLoading && !notesLoading && !mindMapLoading && questionsLoading && "❓ Preparing important questions..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={contentEndRef} />

        {/* Empty State */}
        {!hasContent && !loading && (
          <Card className="p-8 sm:p-12 lg:p-16 bg-card/30 border-border/30 text-center">
            <Brain className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 mx-auto mb-4 text-blue-500/50" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 text-muted-foreground">
              Ready to Master Your Chapter
            </h3>
            <p className="text-sm lg:text-base text-muted-foreground/70 max-w-md mx-auto">
              Select your chapter and learning mode to begin structured study
            </p>
          </Card>
        )}
      </div>

      <Footer/>
    </div>
  );
}