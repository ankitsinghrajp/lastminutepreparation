import { useState, useEffect } from "react";
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

const classes = ["9th", "10th", "11th", "12th"];

export default function ImportantQuestions() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  
  // Initialize from sessionStorage
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

  const [importantQuestions, isImportantQuestionsLoading] = useAsyncMutation(
    useImportantQuestionGeneratorMutation
  );
  
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

  const pollImportantQuestion = async (params) => {
    const interval = setInterval(async () => {
      try {
        const res = await importantQuestions(null, params);

        if (res?.data?.statusCode === 200) {
          setResponse(res.data.data.data);
          clearInterval(interval);
          toast.success("Questions Ready!");
        }
      } catch (error) {
        clearInterval(interval);
        toast.error("Error fetching questions...");
      }
    }, 6000);
  };

  // COPY FROM LASTNIGHTBEFOREEXAM - Fetch subjects when class changes
  useEffect(() => {
    const fetchSubjectFun = async () => {
      if (selectedClass) {
        // Only reset if we're changing from a different class (not on initial load)
        const savedClass = sessionStorage.getItem("importantQuestions_selectedClass");
        if (savedClass && savedClass !== selectedClass) {
          setSubjects([]);
          setChapters([]);
          setSelectedSubject("");
          setSelectedChapter("");
          setSelectedIndex([]);
        }
        try {
          await fetchSubject({ selectedClass });
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
      }
    };
    fetchSubjectFun();
  }, [selectedClass, fetchSubject]);

  // COPY FROM LASTNIGHTBEFOREEXAM - Update subjects list
  useEffect(() => {
    if (subjectData?.data?.subjects) {
      const subjects = subjectData.data.subjects;
      setSubjects(subjects);
      // Only auto-select if no subject is already selected
      if (subjects.length > 0 && !isSubjectLoading && !selectedSubject) {
        setSelectedSubject(subjects[0].subject);
      }
    } else if (!isSubjectLoading && subjectData) {
      setSubjects([]);
      if (!sessionStorage.getItem("importantQuestions_selectedSubject")) {
        setSelectedSubject("");
      }
    }
  }, [subjectData, isSubjectLoading, selectedSubject]);

  // COPY FROM LASTNIGHTBEFOREEXAM - Fetch chapters when subject changes
  useEffect(() => {
    const fetchChaptersFun = async () => {
      if (selectedSubject && selectedClass) {
        // Only reset if we're changing from a different subject (not on initial load)
        const savedSubject = sessionStorage.getItem("importantQuestions_selectedSubject");
        if (savedSubject && savedSubject !== selectedSubject) {
          setChapters([]);
          setSelectedChapter("");
          setSelectedIndex([]);
        }
        try {
          await fetchChapter({ selectedClass, selectedSubject });
        } catch (error) {
          console.error("Error fetching chapters:", error);
        }
      }
    };
    fetchChaptersFun();
  }, [selectedSubject, selectedClass, fetchChapter]);

  // COPY FROM LASTNIGHTBEFOREEXAM - Update chapters list
  useEffect(() => {
    if (ChapterData?.data?.chapters) {
      const chapters = ChapterData.data.chapters;
      setChapters(chapters);
      
      // Only auto-select if no chapter is already selected
      if (chapters.length > 0 && !isChapterLoading && !selectedChapter) {
        const firstChapter = chapters[0].chapter;
        setSelectedChapter(firstChapter);
        const indexArray = chapters[0]?.index || [];
        setSelectedIndex(indexArray);
      }
    } else if (!isChapterLoading && ChapterData) {
      setChapters([]);
      if (!sessionStorage.getItem("importantQuestions_selectedChapter")) {
        setSelectedChapter("");
        setSelectedIndex([]);
      }
    }
  }, [ChapterData, isChapterLoading, selectedChapter]);

  const handleGenerate = async () => {
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      toast.error("Please select class, subject, and chapter");
      return;
    }
    
    // Clear previous response
    setResponse([]);
    
    const res = await importantQuestions("Generating...", {
      className: selectedClass,
      subject: selectedSubject,
      chapter: selectedChapter,
      index: selectedIndex
    });
    
    if (res?.data?.data) {
      setResponse(res.data.data.data);
    }

    if (res?.data?.statusCode === 200) {
      // 🎉 Questions ready instantly (from Redis)
      setResponse(res.data.data.data);
    }

    if (res?.data?.statusCode === 202) {
      // ⏳ Not ready → queued → start polling
      toast.message("Generating Questions...");
      pollImportantQuestion({
        className: selectedClass,
        subject: selectedSubject,
        chapter: selectedChapter,
        index: selectedIndex
      });
    }
  };

  const handleClear = () => {
    setResponse([]);
    setSelectedIndex([]);
    sessionStorage.removeItem("importantQuestions_response");
    toast.success("Questions cleared!");
  };

  const isGenerateDisabled = isImportantQuestionsLoading || !selectedClass || !selectedSubject || !selectedChapter;

  return (
    <div className="min-h-screen bg-background">
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
                  onChange={(e) => setSelectedClass(e.target.value)}
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
                  onChange={(e) => setSelectedSubject(e.target.value)}
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
                      (item) =>
                        item.chapter.trim().toLowerCase() ===
                        newChapter.trim().toLowerCase()
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
                {isImportantQuestionsLoading ? (
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