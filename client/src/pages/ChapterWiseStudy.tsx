import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Loader2, 
  Brain, 
  Sparkles, 
  Calculator,
  Layers,
  Zap,
  Clock
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import {
  useLazyGetChaptersQuery,
  useLazyGetSubjectsQuery,
  useChapterWiseStudyMutation,
} from "@/redux/api/api";
import { useAsyncMutation, useErrors } from "@/hooks/hook";
import { toast } from "sonner";
import ProgressBar from "@/components/specifics/chapterWiseStudy/ProgressBar";
import ContentArea from "@/components/specifics/chapterWiseStudy/ContentArea";

const classes = ["9th", "10th", "11th", "12th"];

const learningModes = [
  { id: "concept", name: "Concept Mode", icon: Brain, color: "blue", desc: "Key ideas & visuals" },
  { id: "formula", name: "Formula Mode", icon: Calculator, color: "purple", desc: "Formulas & definitions" },
];

export default function ChapterWiseStudy() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [selectedClass, setSelectedClass] = useState("12th");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState([]);
  const [selectedMode, setSelectedMode] = useState("concept");
  const [loading, setLoading] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [aiContent, setAIContent] = useState({});
  
  // Add state for tracking current section
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const [chapterWiseStudyTrigger, chapterWiseStudyLoading, chapterWiseStudyData] = useAsyncMutation(useChapterWiseStudyMutation);

  // Study content state
  const [chapterStructure, setChapterStructure] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [progress, setProgress] = useState(0);
  
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

  // Update progress when section changes
  useEffect(() => {
    if (hasContent && aiContent?.sections) {
      const totalSections = aiContent.sections.length;
      const newProgress = totalSections > 0 ? ((currentSectionIndex + 1) / totalSections) * 100 : 0;
      setProgress(newProgress);
    }
  }, [currentSectionIndex, hasContent, aiContent]);

  const handleGenerate = async () => {
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      toast.error("Please select class, subject, and chapter");
      return;
    }
    
    const res = await chapterWiseStudyTrigger("Wait for 30 seconds! We're generating...",{className:selectedClass, subject:selectedSubject, chapter:selectedChapter, index:selectedIndex});
    if(res?.data?.data?.data) {
      console.log("This is the response from the ai for chapter wise study: ",res?.data?.data?.data);
      setHasContent(true);
      setAIContent(res?.data?.data?.data);
      setCurrentSectionIndex(0); // Reset to first section
      setProgress(0); // Reset progress
    }
  };

  const handleStartNewChapter = () => {
    setHasContent(false);
    setAIContent({});
    setCurrentSectionIndex(0);
    setProgress(0);
    setSelectedMode("concept");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ModeCard = ({ mode }) => {
    const Icon = mode.icon;
    const isActive = selectedMode === mode.id;
    
    return (
      <button
        onClick={() => setSelectedMode(mode.id)}
        className={`p-4 rounded-xl border-2 transition-all text-left w-full ${
          isActive 
            ? `border-${mode.color}-500 bg-${mode.color}-500/10` 
            : 'border-border/50 hover:border-border bg-card/50'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${
            isActive ? `bg-${mode.color}-500/20` : 'bg-muted'
          }`}>
            <Icon className={`h-5 w-5 ${
              isActive ? `text-${mode.color}-500` : 'text-muted-foreground'
            }`} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{mode.name}</h4>
            <p className="text-xs text-muted-foreground">{mode.desc}</p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar/>

      <div className="container mt-16 md:mt-24 mx-auto px-3 sm:px-4 py-6 max-w-7xl">

        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold px-4">
            Chapter Wise {" "}
            <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
              Study
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Learn with LastMinutePreparation like never before...
          </p>
        </div>

        {/* Progress Bar - Show when content exists */}
        <ProgressBar hasContent={hasContent} progress={progress}/>

        {/* Input Section - Hide when content exists */}
        {!hasContent && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
            {/* Left Column - Inputs */}
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

        {/* Learning Mode Selection - Show when content exists */}
        {hasContent && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Choose Your Learning Mode
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {learningModes.map((mode) => (
                <ModeCard key={mode.id} mode={mode} />
              ))}
            </div>
          </div>
        )}

        {/* Content Area - Show based on selected mode */}
        <ContentArea 
          hasContent={hasContent} 
          selectedMode={selectedMode} 
          aiContent={aiContent}
          currentSectionIndex={currentSectionIndex}
          setCurrentSectionIndex={setCurrentSectionIndex}
        />

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

      {/* Footer */}
      <Footer/>
    </div>
  );
}