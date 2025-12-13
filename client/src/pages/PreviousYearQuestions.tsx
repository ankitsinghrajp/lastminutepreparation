import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { BookOpen, Search, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import {
  useLazyGetChaptersQuery,
  useLazyGetSubjectsQuery,
  usePyqsGeneratorMutation,
} from "@/redux/api/api";
import { useAsyncMutation, useErrors } from "@/hooks/hook";
import PyqsComponent from "@/components/specifics/PreviousYearQuestions/PyqsComponent";

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
 
  const [selectedClass, setSelectedClass] = useState("12th");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025");


  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [pyqGenerator, pyqGeneratorLoading] = useAsyncMutation(usePyqsGeneratorMutation);
  const [pyqs, setPyqs] = useState({});

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

     const pollPyqs = async (params) => {
      const interval = setInterval(async () => {
        try {
          const res = await pyqGenerator(null, params);
    
          if (res?.data?.statusCode === 200) {
            setQuestions(res.data.data.data.pyqs);
            setPyqs(res.data.data.data);
            clearInterval(interval);
            toast.success("Questions Ready!");
            
          }
        } catch (error) {
          clearInterval(interval);
          toast.error("Error fetching questions...");
        }
      }, 4000);
    };

  // Fetch subjects when class changes
  useEffect(() => {
    const fetchSubjectFun = async () => {
      if (selectedClass) {
        setSubjects([]);
        setChapters([]);
        setSelectedSubject("");
        setSelectedChapter("");
        setQuestions([]);
        setPyqs({});
        try {
          await fetchSubject({ selectedClass });
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
      }
    };
    fetchSubjectFun();
  }, [selectedClass, fetchSubject]);

  // Set first subject when subjects are loaded
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
        setQuestions([]);
        setPyqs({});
        try {
          await fetchChapter({ selectedClass, selectedSubject });
        } catch (error) {
          console.error("Error fetching chapters:", error);
        }
      }
    };
    fetchChaptersFun();
  }, [selectedSubject, selectedClass, fetchChapter]);

  // Set first chapter when chapters are loaded
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

  const handleFetchQuestions = async () => {
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      toast.error("Please select class, subject, and chapter");
      return;
    }

    // Reset previous questions before fetching new ones
    setQuestions([]);
    setPyqs({});

    const res = await pyqGenerator(`Fetching year: ${selectedYear} cbse board questions...`,{className:selectedClass, subject:selectedSubject, chapter:selectedChapter, year:selectedYear});
    
    if (res?.data?.data) {
        setQuestions(res.data.data.data.pyqs);
        setPyqs(res.data.data.data);
      }

      if (res?.data?.statusCode === 200) {
      // 🎉 Summary ready instantly (from Redis)
      setQuestions(res.data.data.data.pyqs);
      setPyqs(res.data.data.data);
    }

    if (res?.data?.statusCode === 202) {
      // ⏳ Not ready → queued → start polling
      toast.message(`Fetching year: ${selectedYear} cbse board questions...`);
      pollPyqs({className:selectedClass, subject:selectedSubject, chapter:selectedChapter, year:selectedYear});

      }

  };

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
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Class</label>
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
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
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={isSubjectLoading || subjects.length === 0}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                >
                  {isSubjectLoading ? (
                    <option>Loading subjects...</option>
                  ) : subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <option key={subject.subject} value={subject.subject}>{subject.subject}</option>
                    ))
                  ) : (
                    <option>No subjects available</option>
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
                    <option>No chapters available</option>
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
              disabled={loading || !selectedClass || !selectedSubject || !selectedChapter}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 flex-1 min-w-[200px]"
            >
              {loading ? (
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

  
              <div className="space-y-4">
                {pyqs && <PyqsComponent pyqsData={pyqs} selectedClass={selectedClass} selectedSubject={selectedSubject} selectedChapter={selectedChapter}/>}
      
        </div>
      </div>
      <Footer/>
    </div>
  );
}