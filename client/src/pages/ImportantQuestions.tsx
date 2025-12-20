import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { HelpCircle, Loader2, Zap, ChevronDown } from "lucide-react";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import {
  useLazyGetChaptersQuery,
  useLazyGetSubjectsQuery,
} from "@/redux/api/api";
import { useAsyncMutation, useErrors } from "@/hooks/hook";
import { useImportantQuestionGeneratorMutation } from "@/redux/api/api";
import QuestionBox from "@/components/specifics/ImportantQuestionGenerator/QuestionBox";
import logo from "../assets/logo.png";
import { Helmet } from "react-helmet-async";

const classes = ["9th", "10th", "11th", "12th"];

export default function ImportantQuestions() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState(() => {
    return sessionStorage.getItem("importantQuestions_selectedClass") || "12th";
  });
  const [selectedSubject, setSelectedSubject] = useState(() => {
    return sessionStorage.getItem("importantQuestions_selectedSubject") || "";
  });
  const [selectedChapter, setSelectedChapter] = useState(() => {
    return sessionStorage.getItem("importantQuestions_selectedChapter") || "";
  });
  
  const [selectedIndex, setSelectedIndex] = useState([]);
  const [response, setResponse] = useState(() => {
    const saved = sessionStorage.getItem("importantQuestions_response");
    return saved ? JSON.parse(saved) : [];
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const pollIntervalRef = useRef(null);

  const [importantQuestions] = useAsyncMutation(useImportantQuestionGeneratorMutation);
  
  const [fetchSubject, { isLoading: isSubjectLoading, isError: isSubjectError, error: subjectError, data: subjectData }] = useLazyGetSubjectsQuery();
  const [fetchChapter, { isLoading: isChapterLoading, isError: isChapterError, error: chapterError, data: ChapterData }] = useLazyGetChaptersQuery();

  useErrors([
    { isError: isSubjectError, error: subjectError },
    { isError: isChapterError, error: chapterError },
  ]);

  // Persist selectedClass to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("importantQuestions_selectedClass", selectedClass);
  }, [selectedClass]);

  // Persist selectedSubject to sessionStorage
  useEffect(() => {
    if (selectedSubject) {
      sessionStorage.setItem("importantQuestions_selectedSubject", selectedSubject);
    }
  }, [selectedSubject]);

  // Persist selectedChapter to sessionStorage
  useEffect(() => {
    if (selectedChapter) {
      sessionStorage.setItem("importantQuestions_selectedChapter", selectedChapter);
    }
  }, [selectedChapter]);

  // Persist response to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("importantQuestions_response", JSON.stringify(response));
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
      const persistedChapter = sessionStorage.getItem("importantQuestions_selectedChapter");
      
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

  const pollImportantQuestion = async (params) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
           window.__LMP_POLLING__ = true;
           const res = await importantQuestions(null, params);
           window.__LMP_POLLING__ = false;

        if (res?.data?.statusCode === 200) {
          setResponse(res.data.data.data);
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setIsGenerating(false);
          toast.success("Questions Ready!");
        }
      } catch (error) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        setIsGenerating(false);
        toast.error("Error fetching questions...");
      }
    }, 6000);
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
      const res = await importantQuestions("Generating...", params);
      
      if (res?.data?.statusCode === 200) {
        // Questions ready instantly (from Redis)
        setResponse(res.data.data.data);
        setIsGenerating(false);
        toast.success("Questions Ready!");
      } else if (res?.data?.statusCode === 202) {
        // Not ready → queued → start polling
        toast.message("Generating Questions...");
        pollImportantQuestion(params);
      } else {
        setIsGenerating(false);
      }
    } catch (error) {
      setIsGenerating(false);
      toast.error("Failed to generate questions");
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
    sessionStorage.removeItem("importantQuestions_response");
    toast.success("Questions cleared!");
  };

  const isGenerateDisabled = isGenerating || !selectedClass || !selectedSubject || !selectedChapter;

  return (
    <div className="min-h-screen bg-background">

      <Helmet>
        {/* Title */}
        <title>
          Important Questions for CBSE Exams | 95% Accurate Exam Questions – LMP
        </title>

        {/* Meta Description */}
        <meta
          name="description"
          content="Get highly important CBSE exam questions with up to 95% accuracy. Based on PYQs, exam trends, and smart analysis to help you score maximum marks."
        />

        {/* Keywords */}
        <meta
          name="keywords"
          content="
          important questions cbse,
          cbse important questions,
          95 percent accurate cbse questions,
          cbse most expected questions,
          cbse exam important questions,
          topper predicted questions cbse,
          cbse board exam questions list,
          last minute important questions cbse
          "
        />

        {/* Canonical */}
        <link
          rel="canonical"
          href="https://lastminutepreparation.in/question-generator"
        />

        {/* Robots */}
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="CBSE Important Questions (95% Accuracy) | LMP"
        />
        <meta
          property="og:description"
          content="Revise the most important CBSE exam questions with high accuracy. Designed using PYQs and exam patterns for last-minute preparation."
        />
        <meta
          property="og:url"
          content="https://lastminutepreparation.in/question-generator"
        />
        <meta
          property="og:image"
          content="https://lastminutepreparation.in/og-question-generator.png"
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Important Questions for CBSE Exams | LMP"
        />
        <meta
          name="twitter:description"
          content="Prepare smart with highly important CBSE questions based on PYQs and exam trends."
        />
        <meta
          name="twitter:image"
          content="https://lastminutepreparation.in/og-question-generator.png"
        />
      </Helmet>

      <Navbar />
      
      <div className="container mx-auto px-2 py-20 sm:py-24 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500">
            <HelpCircle className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Important Questions{" "}
            <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
              Generator
            </span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            AI-predicted high-probability questions trained on 20 years of previous board exam papers, with up to 95% relevance.
          </p>
        </div>

        {/* Selection Form */}
        <Card className="p-4 sm:p-6 lg:p-8 bg-card border-border shadow-sm mb-6">
          <div className="space-y-4 sm:space-y-5">
            {/* Class Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Class
              </label>
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
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
              <label className="text-sm font-medium text-foreground">
                Subject
              </label>
              <div className="relative">
                <select
                  value={selectedSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  disabled={isSubjectLoading || subjects.length === 0}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              <label className="text-sm font-medium text-foreground">
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
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className="flex-1 h-12 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Generate Questions
                  </>
                )}
              </Button>
              
              {response.length > 0 && (
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="h-12 px-4 text-destructive border-destructive hover:bg-destructive/10"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Loading Indicator - Shows while generating */}
        {isGenerating && response.length === 0 && (
          <div className="flex items-start gap-3 p-4 mb-6">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
              <img className="h-8 w-8" src={logo} alt="" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-muted/50 border border-border/50">
                <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Generating Important Questions...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <QuestionBox 
          response={response} 
          selectedClass={selectedClass} 
          selectedSubject={selectedSubject} 
          selectedChapter={selectedChapter}
        />
      </div>
      
      <Footer />
    </div>
  );
}