import { useState, useEffect } from "react";
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

const classes = ["9th", "10th", "11th", "12th"];

export default function QuizGenerator() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  
  // Initialize from sessionStorage
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
  const [loading, setLoading] = useState(false);

  const [fetchSubject, { isLoading: isSubjectLoading, isError: isSubjectError, error: subjectError, data: subjectData }] = useLazyGetSubjectsQuery();
  const [fetchChapter, { isLoading: isChapterLoading, isError: isChapterError, error: chapterError, data: ChapterData }] = useLazyGetChaptersQuery();

  const [quizGenerator, quizGeneratorLoading, quizGeneratorData] = useAsyncMutation(useQuizGeneratorMutation);
  
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

  const pollMCQs = async (params) => {
    const interval = setInterval(async () => {
      try {
        const res = await quizGenerator(null, params);

        if (res?.data?.statusCode === 200) {
          setResponse(res.data.data.data);
          clearInterval(interval);
          toast.success("MCQs Ready!");
          setLoading(false);
        }
      } catch (error) {
        clearInterval(interval);
        toast.error("Error fetching MCQs...");
        setLoading(false);
      }
    }, 5000);
  };

  // COPY FROM LASTNIGHTBEFOREEXAM - Fetch subjects when class changes
  useEffect(() => {
    const fetchSubjectFun = async () => {
      if (selectedClass) {
        // Only reset if we're changing from a different class (not on initial load)
        const savedClass = sessionStorage.getItem("quizGenerator_selectedClass");
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
      if (!sessionStorage.getItem("quizGenerator_selectedSubject")) {
        setSelectedSubject("");
      }
    }
  }, [subjectData, isSubjectLoading, selectedSubject]);

  // COPY FROM LASTNIGHTBEFOREEXAM - Fetch chapters when subject changes
  useEffect(() => {
    const fetchChaptersFun = async () => {
      if (selectedSubject && selectedClass) {
        // Only reset if we're changing from a different subject (not on initial load)
        const savedSubject = sessionStorage.getItem("quizGenerator_selectedSubject");
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
      if (!sessionStorage.getItem("quizGenerator_selectedChapter")) {
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
    setLoading(true);
     
    const res = await quizGenerator("Generating...", {
      className: selectedClass, 
      subject: selectedSubject, 
      chapter: selectedChapter, 
      index: selectedIndex
    });

    if (res?.data?.data) {
      setResponse(res.data.data.data);
      setLoading(false);
    }

    if (res?.data?.statusCode === 200) {
      // 🎉 MCQs ready instantly (from Redis)
      setResponse(res.data.data.data);
      setLoading(false);
    }

    if (res?.data?.statusCode === 202) {
      // ⏳ Not ready → queued → start polling
      toast.message("Generating MCQs...");
      pollMCQs({
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
    sessionStorage.removeItem("quizGenerator_response");
    setLoading(false);
    toast.success("MCQs cleared!");
  };

  const isGenerateDisabled = loading || quizGeneratorLoading || !selectedClass || !selectedSubject || !selectedChapter;

  return (
    <div className="min-h-screen bg-background">
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
                    onChange={(e) => setSelectedClass(e.target.value)}
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
                    onChange={(e) => setSelectedSubject(e.target.value)}
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
                        (item) =>
                          item.chapter.trim().toLowerCase() ===
                          newChapter.trim().toLowerCase()
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
                {(loading || quizGeneratorLoading) ? (
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