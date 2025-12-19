import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { BookOpen, Search, Loader2, ChevronDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import {
  useLazyGetChaptersQuery,
  useLazyGetSubjectsQuery,
  usePyqsGeneratorMutation,
} from "@/redux/api/api";
import { useAsyncMutation, useErrors } from "@/hooks/hook";
import PyqsComponent from "@/components/specifics/PreviousYearQuestions/PyqsComponent";
import logo from "../assets/logo.png";

const classes = ["9th", "10th", "11th", "12th"];
const years = ["2025","2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014"];

interface Question {
  id: number;
  year: string;
  question: string;
  marks: number;
  hint: string;
  solution: string;
  frequency: "high" | "medium" | "low";
}

export default function PreviousYearQuestions() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState(() => {
    return sessionStorage.getItem("pyqs_selectedClass") || "12th";
  });
  const [selectedSubject, setSelectedSubject] = useState(() => {
    return sessionStorage.getItem("pyqs_selectedSubject") || "";
  });
  const [selectedChapter, setSelectedChapter] = useState(() => {
    return sessionStorage.getItem("pyqs_selectedChapter") || "";
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    return sessionStorage.getItem("pyqs_selectedYear") || "2025";
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = sessionStorage.getItem("pyqs_questions");
    return saved ? JSON.parse(saved) : [];
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const pollIntervalRef = useRef(null);
  
  const [pyqGenerator] = useAsyncMutation(usePyqsGeneratorMutation);
  const [pyqs, setPyqs] = useState(() => {
    const saved = sessionStorage.getItem("pyqs_data");
    return saved ? JSON.parse(saved) : {};
  });

  const [
    fetchSubject,
    { isLoading: isSubjectLoading, isError: isSubjectError, error: subjectError, data: subjectData },
  ] = useLazyGetSubjectsQuery();
  
  const [
    fetchChapter,
    { isLoading: isChapterLoading, isError: isChapterError, error: chapterError, data: ChapterData },
  ] = useLazyGetChaptersQuery();

  useErrors([
    { isError: isSubjectError, error: subjectError },
    { isError: isChapterError, error: chapterError },
  ]);

  // Persist selectedClass to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("pyqs_selectedClass", selectedClass);
  }, [selectedClass]);

  // Persist selectedSubject to sessionStorage
  useEffect(() => {
    if (selectedSubject) {
      sessionStorage.setItem("pyqs_selectedSubject", selectedSubject);
    }
  }, [selectedSubject]);

  // Persist selectedChapter to sessionStorage
  useEffect(() => {
    if (selectedChapter) {
      sessionStorage.setItem("pyqs_selectedChapter", selectedChapter);
    }
  }, [selectedChapter]);

  // Persist selectedYear to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("pyqs_selectedYear", selectedYear);
  }, [selectedYear]);

  // Persist questions to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("pyqs_questions", JSON.stringify(questions));
  }, [questions]);

  // Persist pyqs data to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("pyqs_data", JSON.stringify(pyqs));
  }, [pyqs]);

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
    }
  };

  // Handle subject change
  const handleSubjectChange = (newSubject) => {
    if (newSubject !== selectedSubject) {
      setSelectedSubject(newSubject);
      // Clear chapters immediately when subject changes
      setChapters([]);
      setSelectedChapter("");
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
      const persistedChapter = sessionStorage.getItem("pyqs_selectedChapter");
      
      if (chaptersList.length > 0) {
        // If we have a persisted chapter and it exists in the list, keep it
        if (persistedChapter) {
          const chapterExists = chaptersList.some(c => c.chapter === persistedChapter);
          if (chapterExists && selectedChapter === persistedChapter) {
            // Chapter is already set correctly, do nothing
            return;
          } else if (chapterExists && !selectedChapter) {
            // Set the persisted chapter
            setSelectedChapter(persistedChapter);
          } else {
            // Persisted chapter doesn't exist or selected is different, set first
            setSelectedChapter(chaptersList[0].chapter);
          }
        } else if (!selectedChapter) {
          // No persisted chapter and nothing selected, set first
          setSelectedChapter(chaptersList[0].chapter);
        } else {
          // We have a selected chapter, validate it exists
          const chapterExists = chaptersList.some(c => c.chapter === selectedChapter);
          if (!chapterExists) {
            setSelectedChapter(chaptersList[0].chapter);
          }
        }
      }
    } else if (!isChapterLoading && ChapterData) {
      setChapters([]);
    }
  }, [ChapterData, isChapterLoading]);

  const pollPyqs = async (params) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        
           window.__LMP_POLLING__ = true;
            const res = await pyqGenerator(null, params);
           window.__LMP_POLLING__ = false;
    
        if (res?.data?.statusCode === 200) {
          setQuestions(res.data.data.data.pyqs);
          setPyqs(res.data.data.data);
          setIsGenerating(false);
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          toast.success("Previous Year Questions Ready!");
        }
      } catch (error) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        setIsGenerating(false);
        toast.error("Error fetching questions...");
      }
    }, 4000);
  };

  const handleFetchQuestions = async () => {
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      toast.error("Please select class, subject, and chapter");
      return;
    }

    // Reset previous questions before fetching new ones
    setQuestions([]);
    setPyqs({});
    setIsGenerating(true);

    const params = {
      className: selectedClass, 
      subject: selectedSubject, 
      chapter: selectedChapter, 
      year: selectedYear
    };

    try {
      const res = await pyqGenerator(`Fetching year: ${selectedYear} CBSE board questions...`, params);
      
      if (res?.data?.statusCode === 200) {
        // Questions ready instantly (from Redis)
        setQuestions(res.data.data.data.pyqs);
        setPyqs(res.data.data.data);
        setIsGenerating(false);
        toast.success("Previous Year Questions Ready!");
      } else if (res?.data?.statusCode === 202) {
        // Not ready → queued → start polling
        toast.message(`Fetching year: ${selectedYear} CBSE board questions...`);
        pollPyqs(params);
      } else {
        setIsGenerating(false);
      }
    } catch (error) {
      setIsGenerating(false);
      toast.error("Failed to fetch questions");
    }
  };

  const handleClear = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setQuestions([]);
    setPyqs({});
    setIsGenerating(false);
    sessionStorage.removeItem("pyqs_questions");
    sessionStorage.removeItem("pyqs_data");
    toast.success("Previous year questions cleared!");
  };

  const isFetchDisabled = isGenerating || !selectedClass || !selectedSubject || !selectedChapter;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-2 py-24 max-w-7xl">
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold">
            Previous Year{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Access 10+ years of board exam questions (2014 - 2025) with AI-powered hints and solutions
          </p>
        </div>

        <Card className="p-8 bg-card/50 border-border/50 backdrop-blur-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Filter Questions</h2>
            
            {questions.length > 0 && (
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="text-destructive border-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear PYQs
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Class</label>
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                >
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>Class {cls}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Subject</label>
              <div className="relative">
                <select
                  value={selectedSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  disabled={isSubjectLoading || subjects.length === 0}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                >
                  {isSubjectLoading ? (
                    <option>Loading subjects please wait...</option>
                  ) : subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <option key={subject.subject} value={subject.subject}>{subject.subject}</option>
                    ))
                  ) : (
                    <option>Loading subjects please wait...</option>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Chapter</label>
              <div className="relative">
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  disabled={isChapterLoading || chapters.length === 0}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                >
                  {isChapterLoading ? (
                    <option>Loading chapters...</option>
                  ) : chapters.length > 0 ? (
                    chapters.map((chapter) => (
                      <option key={chapter.chapter} value={chapter.chapter}>{chapter.chapter}</option>
                    ))
                  ) : (
                    <option>Loading Chapters Please wait...</option>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Year</label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleFetchQuestions}
              disabled={isFetchDisabled}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 flex-1 min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fetching Questions...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Fetch PYQs
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Loading Indicator - Shows while generating */}
        {isGenerating && questions.length === 0 && (
          <div className="flex items-start gap-3 p-4 mb-6">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
              <img className="h-8 w-8" src={logo} alt="" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-muted/50 border border-border/50">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Fetching {selectedYear} CBSE Board Questions...
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {pyqs && Object.keys(pyqs).length > 0 && (
            <PyqsComponent 
              pyqsData={pyqs} 
              selectedClass={selectedClass} 
              selectedSubject={selectedSubject} 
              selectedChapter={selectedChapter}
            />
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );
}