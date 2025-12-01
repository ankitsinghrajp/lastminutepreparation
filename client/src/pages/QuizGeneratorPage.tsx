import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { BookOpen, Loader2, Zap, ChevronDown } from "lucide-react";
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
  const [selectedClass, setSelectedClass] = useState("12th");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState([]);
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(false);

  const [fetchSubject, { isLoading: isSubjectLoading, isError: isSubjectError, error: subjectError, data: subjectData }] = useLazyGetSubjectsQuery();
  const [fetchChapter, { isLoading: isChapterLoading, isError: isChapterError, error: chapterError, data: ChapterData }] = useLazyGetChaptersQuery();

  const [quizGenerator, quizGeneratorLoading, quizGeneratorData] = useAsyncMutation(useQuizGeneratorMutation);
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
        const indexArray = chapters[0]?.index || [];
        setSelectedIndex(indexArray);
      }
    } else if (!isChapterLoading && ChapterData) {
      setChapters([]);
      setSelectedChapter("");
      setSelectedIndex([]);
    }
  }, [ChapterData, isChapterLoading]);

  const handleGenerate = async () => {
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      toast.error("Please select class, subject, and chapter");
      return;
    }
     
    const res = await quizGenerator("Generating...",{className:selectedClass, subject:selectedSubject, chapter:selectedChapter, index:selectedIndex});

    if(res?.data?.data?.data){
      setResponse(res?.data?.data?.data);
    }
 
  };

  const isGenerateDisabled = loading || !selectedClass || !selectedSubject || !selectedChapter;

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
            Generate interactive practice questions with instant AI-powered answers
          </p>
        </div>

        {/* Selection Form */}
        <div className="w-full">
          <Card className="p-4 md:p-5 lg:p-6 bg-card/50 border-border/50 backdrop-blur-sm shadow-md">
            <div className="flex items-center gap-2 mb-5 md:mb-6">
              <Zap className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />
              <h2 className="text-lg md:text-xl lg:text-2xl font-semibold">Question Settings</h2>
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
                      <option>No chapters available</option>
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
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 md:h-6 md:w-6 mr-2 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                    Generate Questions
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