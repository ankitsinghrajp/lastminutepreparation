import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { BookOpen, Loader2, Zap, ChevronDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import {
  useLazyGetChaptersQuery,
  useLazyGetSubjectsQuery,
  useQuizGeneratorMutation,
} from "@/redux/api/api";
import { useAsyncMutation, useErrors } from "@/hooks/hook";
import QuizBox from "@/components/specifics/quizGenerator/quizBox";
import logo from "../assets/logo.png";
import { Helmet } from "react-helmet-async";

const classes = ["9th", "10th", "11th", "12th"];

export default function QuizGenerator() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState(() => {
    return sessionStorage.getItem("quizGenerator_selectedClass") || "12th";
  });
  const [selectedSubject, setSelectedSubject] = useState(() => {
    return sessionStorage.getItem("quizGenerator_selectedSubject") || "";
  });
  const [selectedChapter, setSelectedChapter] = useState(() => {
    return sessionStorage.getItem("quizGenerator_selectedChapter") || "";
  });
  
  const [selectedIndex, setSelectedIndex] = useState([]);
  const [response, setResponse] = useState(() => {
    const saved = sessionStorage.getItem("quizGenerator_response");
    return saved ? JSON.parse(saved) : [];
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const pollIntervalRef = useRef(null);

  const [fetchSubject, { isLoading: isSubjectLoading, isError: isSubjectError, error: subjectError, data: subjectData }] = useLazyGetSubjectsQuery();
  const [fetchChapter, { isLoading: isChapterLoading, isError: isChapterError, error: chapterError, data: ChapterData }] = useLazyGetChaptersQuery();

  const [quizGenerator] = useAsyncMutation(useQuizGeneratorMutation);
  
  useErrors([
    { isError: isSubjectError, error: subjectError },
    { isError: isChapterError, error: chapterError },
  ]);

  // Persist selectedClass to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("quizGenerator_selectedClass", selectedClass);
  }, [selectedClass]);

  // Persist selectedSubject to sessionStorage
  useEffect(() => {
    if (selectedSubject) {
      sessionStorage.setItem("quizGenerator_selectedSubject", selectedSubject);
    }
  }, [selectedSubject]);

  // Persist selectedChapter to sessionStorage
  useEffect(() => {
    if (selectedChapter) {
      sessionStorage.setItem("quizGenerator_selectedChapter", selectedChapter);
    }
  }, [selectedChapter]);

  // Persist response to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("quizGenerator_response", JSON.stringify(response));
  }, [response]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Handle class change
  const handleClassChange = (newClass) => {
    if (newClass !== selectedClass) {
      setSelectedClass(newClass);
      // Clear everything when class changes
      setSubjects([]);
      setChapters([]);
      setSelectedSubject("");
      setSelectedChapter("");
      setSelectedIndex([]);
    }
  };

  // Handle subject change
  const handleSubjectChange = (newSubject) => {
    if (newSubject !== selectedSubject) {
      setSelectedSubject(newSubject);
      // Clear chapters immediately when subject changes
      setChapters([]);
      setSelectedChapter("");
      setSelectedIndex([]);
    }
  };

  // Fetch subjects when class changes
  useEffect(() => {
    const fetchSubjectFun = async () => {
      if (selectedClass && !isSubjectLoading) {
        try {
          await fetchSubject({ selectedClass });
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
      }
    };
    
    // Fetch whenever class changes
    if (selectedClass) {
      fetchSubjectFun();
    }
  }, [selectedClass, fetchSubject]);

  // Update subjects list
  useEffect(() => {
    if (subjectData?.data?.subjects) {
      const subjectsList = subjectData.data.subjects;
      setSubjects(subjectsList);
      
      // Auto-select first subject when subjects list changes
      // BUT only if no subject is currently selected (empty string)
      // This preserves sessionStorage persisted subjects on page reload
      if (subjectsList.length > 0 && !selectedSubject) {
        setSelectedSubject(subjectsList[0].subject);
      } else if (selectedSubject && subjectsList.length > 0) {
        // Validate that the current selected subject exists in the list
        const subjectExists = subjectsList.some(s => s.subject === selectedSubject);
        if (!subjectExists) {
          // If persisted subject doesn't exist, select first one
          setSelectedSubject(subjectsList[0].subject);
        }
      }
    } else if (!isSubjectLoading && subjectData) {
      // If we got a response but no subjects, clear selection
      setSubjects([]);
      setSelectedSubject("");
    }
  }, [subjectData, isSubjectLoading, selectedSubject]);

  // Fetch chapters when subject changes
  useEffect(() => {
    const fetchChaptersFun = async () => {
      if (selectedSubject && selectedClass && !isChapterLoading) {
        try {
          await fetchChapter({ selectedClass, selectedSubject });
        } catch (error) {
          console.error("Error fetching chapters:", error);
        }
      }
    };
    
    // Fetch chapters whenever subject or class changes
    if (selectedSubject && selectedClass) {
      fetchChaptersFun();
    }
  }, [selectedSubject, selectedClass]);

  // Update chapters list
  useEffect(() => {
    if (ChapterData?.data?.chapters) {
      const chaptersList = ChapterData.data.chapters;
      setChapters(chaptersList);
      
      // Check if we have a persisted chapter from sessionStorage
      const persistedChapter = sessionStorage.getItem("quizGenerator_selectedChapter");
      
      if (chaptersList.length > 0) {
        // If we have a persisted chapter and it exists in the list, keep it
        if (persistedChapter) {
          const chapterExists = chaptersList.some(c => c.chapter === persistedChapter);
          if (chapterExists && selectedChapter === persistedChapter) {
            // Chapter is already set correctly, set index
            const chapterObj = chaptersList.find(c => c.chapter === persistedChapter);
            if (chapterObj && selectedIndex.length === 0) {
              setSelectedIndex(chapterObj.index || []);
            }
            return;
          } else if (chapterExists && !selectedChapter) {
            // Set the persisted chapter
            setSelectedChapter(persistedChapter);
            const chapterObj = chaptersList.find(c => c.chapter === persistedChapter);
            setSelectedIndex(chapterObj?.index || []);
          } else {
            // Persisted chapter doesn't exist or selected is different, set first
            setSelectedChapter(chaptersList[0].chapter);
            setSelectedIndex(chaptersList[0].index || []);
          }
        } else if (!selectedChapter) {
          // No persisted chapter and nothing selected, set first
          setSelectedChapter(chaptersList[0].chapter);
          setSelectedIndex(chaptersList[0].index || []);
        } else {
          // We have a selected chapter, validate it exists
          const chapterExists = chaptersList.some(c => c.chapter === selectedChapter);
          if (!chapterExists) {
            setSelectedChapter(chaptersList[0].chapter);
            setSelectedIndex(chaptersList[0].index || []);
          } else {
            // Chapter exists, make sure index is set
            const chapterObj = chaptersList.find(c => c.chapter === selectedChapter);
            if (chapterObj && selectedIndex.length === 0) {
              setSelectedIndex(chapterObj.index || []);
            }
          }
        }
      }
    } else if (!isChapterLoading && ChapterData) {
      setChapters([]);
    }
  }, [ChapterData, isChapterLoading]);

  const pollMCQs = async (params) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        
           window.__LMP_POLLING__ = true;
           const res = await quizGenerator(null, params);
           window.__LMP_POLLING__ = false;

        if (res?.data?.statusCode === 200) {
          setResponse(res.data.data.data);
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setIsGenerating(false);
          toast.success("MCQs Ready!");
        }
      } catch (error) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        setIsGenerating(false);
        toast.error("Error fetching MCQs...");
      }
    }, 5000);
  };

  const handleGenerate = async () => {
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      toast.error("Please select class, subject, and chapter");
      return;
    }
    
    // Clear previous response and set generating state
    setResponse([]);
    setIsGenerating(true);
    
    const params = {
      className: selectedClass, 
      subject: selectedSubject, 
      chapter: selectedChapter, 
      index: selectedIndex
    };

    try {
      const res = await quizGenerator("Generating...", params);

      if (res?.data?.statusCode === 200) {
        // MCQs ready instantly (from Redis)
        setResponse(res.data.data.data);
        setIsGenerating(false);
        toast.success("MCQs Ready!");
      } else if (res?.data?.statusCode === 202) {
        // Not ready → queued → start polling
        toast.message("Generating MCQs...");
        pollMCQs(params);
      } else {
        setIsGenerating(false);
      }
    } catch (error) {
      setIsGenerating(false);
      toast.error("Failed to generate MCQs");
    }
  };

  const handleClear = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setResponse([]);
    setSelectedIndex([]);
    setIsGenerating(false);
    sessionStorage.removeItem("quizGenerator_response");
    toast.success("MCQs cleared!");
  };

  const isGenerateDisabled = isGenerating || !selectedClass || !selectedSubject || !selectedChapter;

  return (
    <div className="min-h-screen bg-background">
 
      <Helmet>
        {/* Title */}
        <title>
          CBSE Quiz, Fill Ups & True False Generator | Most Important Questions – LMP
        </title>

        {/* Meta Description */}
        <meta
          name="description"
          content="Practice CBSE quiz, fill in the blanks, and true/false questions from the most important exam topics. Smart objective question generator designed for last-minute revision."
        />

        {/* Keywords */}
        <meta
          name="keywords"
          content="
          cbse quiz generator,
          fill in the blanks cbse,
          true false questions cbse,
          objective questions cbse,
          cbse most important mcqs,
          cbse exam practice questions,
          last minute quiz cbse,
          cbse board objective questions
          "
        />

        {/* Canonical */}
        <link
          rel="canonical"
          href="https://lastminutepreparation.in/quiz-generator"
        />

        {/* Robots */}
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="CBSE Quiz, Fill Ups & True False – Most Important Questions | LMP"
        />
        <meta
          property="og:description"
          content="Generate and practice the most important CBSE quiz, fill-ups, and true/false questions for fast exam revision."
        />
        <meta
          property="og:url"
          content="https://lastminutepreparation.in/quiz-generator"
        />
        <meta
          property="og:image"
          content="https://lastminutepreparation.in/og-quiz-generator.png"
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="CBSE Quiz & Objective Question Generator | LMP"
        />
        <meta
          name="twitter:description"
          content="Practice CBSE quiz, fill in the blanks, and true/false questions from the most important topics."
        />
        <meta
          name="twitter:image"
          content="https://lastminutepreparation.in/og-quiz-generator.png"
        />
      </Helmet>

      <Navbar />
      
      <div className="container mx-auto px-2 py-20 md:py-24 lg:py-28 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10 lg:mb-12 space-y-3 md:space-y-4">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <BookOpen className="h-7 w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight px-2">
            Important MCQs Fill Ups & True False
          </h1>
          <p className="text-sm md:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Objective questions created by AI after deep analysis of 20 years of previous board exam patterns.
          </p>
        </div>

        {/* Selection Form */}
        <div className="w-full">
          <Card className="px-2 py-4 md:p-5 lg:p-6 bg-card/50 border-border/50 backdrop-blur-sm shadow-md">
            <div className="flex items-center justify-between gap-2 mb-5 md:mb-6">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />
                <h2 className="text-lg md:text-xl lg:text-2xl font-semibold">Question Settings</h2>
              </div>
              
              {response.length > 0 && (
                <Button
                  onClick={handleClear}
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear MCQs
                </Button>
              )}
            </div>

            <div className="space-y-4 md:space-y-5">
              {/* Class Selection */}
              <div className="space-y-2">
                <label className="block text-sm md:text-base font-medium text-foreground">
                  Class
                </label>
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full px-3 py-3 md:px-4 md:py-3.5 text-base rounded-lg bg-background border-2 border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Subject Selection */}
              <div className="space-y-2">
                <label className="block text-sm md:text-base font-medium text-foreground">
                  Subject
                </label>
                <div className="relative">
                  <select
                    value={selectedSubject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    disabled={isSubjectLoading || subjects.length === 0}
                    className="w-full px-3 py-3 md:px-4 md:py-3.5 text-base rounded-lg bg-background border-2 border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubjectLoading ? (
                      <option>Loading subjects please wait...</option>
                    ) : subjects.length > 0 ? (
                      subjects.map((subject) => (
                        <option key={subject.subject} value={subject.subject}>
                          {subject.subject}
                        </option>
                      ))
                    ) : (
                      <option>Loading subjects please wait...</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Chapter Selection */}
              <div className="space-y-2">
                <label className="block text-sm md:text-base font-medium text-foreground">
                  Chapter
                </label>
                <div className="relative">
                  <select
                    value={selectedChapter}
                    onChange={(e) => {
                      const newChapter = e.target.value;
                      setSelectedChapter(newChapter);
                      
                      const chapterObj = chapters.find(
                        (item) => item.chapter === newChapter
                      );
                      const indexArray = chapterObj?.index || [];
                      setSelectedIndex(indexArray);
                    }}
                    disabled={isChapterLoading || chapters.length === 0}
                    className="w-full px-3 py-3 md:px-4 md:py-3.5 text-base rounded-lg bg-background border-2 border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <option>Loading Chapters Please wait...</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className="w-full h-12 md:h-13 lg:h-14 text-base md:text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 md:h-6 md:w-6 mr-2 animate-spin" />
                    Generating MCQs...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                    Generate MCQs
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Loading Indicator - Shows while generating */}
          {isGenerating && response.length === 0 && (
            <div className="flex items-start gap-3 p-4 mt-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <img className="h-8 w-8" src={logo} alt="" />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-muted/50 border border-border/50">
                  <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Generating MCQs, Fill Ups & True/False Questions...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Box */}
          <div className="mt-6 md:mt-8 lg:mt-10">
            <QuizBox response={response}/>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}