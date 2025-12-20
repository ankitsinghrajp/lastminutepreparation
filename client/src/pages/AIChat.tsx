import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Clock, Loader2, Brain, Sparkles, Trash2, HelpCircle, ChevronDown, History, X } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import logo from "../assets/logo.png";
import {
  useGetLastNightSummaryMutation,
  useGetLastNightAiCoachMutation,
  useGetLastNightPredictedQuestionsMutation,
  useGetLastNightImportantTopicsMutation,
  useGetLastNightMcqsMutation,
  useGetLastNightMemoryBoosterMutation,
  useLazyGetChaptersQuery,
  useLazyGetSubjectsQuery,
} from "@/redux/api/api";
import { useAsyncMutation, useErrors } from "@/hooks/hook";
import RevisionPanel from "@/components/specifics/RevisionPanel";
import { Helmet } from "react-helmet-async";
import AnimatedLoader from "@/components/AnimatedLoader";

const classes = ["9th", "10th", "11th", "12th"];

const GENERATION_STEPS = [
  { key: "summary", label: "Chapter Summary", pollInterval: 2000 },
  { key: "importantTopics", label: "Important Topics", pollInterval: 3000 },
  { key: "predictedQuestion", label: "Predicted Questions", pollInterval: 6000 },
  { key: "mcqs", label: "Practice MCQs", pollInterval: 3000 },
  { key: "memoryBooster", label: "Memory Boosters", pollInterval: 3000 },
  { key: "aiCoach", label: "AI Study Coach", pollInterval: 3000 },
];

export default function LastNightBeforeExam() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [selectedClass, setSelectedClass] = useState(() => {
    return sessionStorage.getItem("lastNight_selectedClass") || "12th";
  });
  const [selectedSubject, setSelectedSubject] = useState(() => {
    return sessionStorage.getItem("lastNight_selectedSubject") || "";
  });
  const [selectedChapter, setSelectedChapter] = useState(() => {
    return sessionStorage.getItem("lastNight_selectedChapter") || "";
  });

  const [summary, setSummary] = useState(() => {
    const saved = sessionStorage.getItem("lastNight_summary");
    return saved || "";
  });
  const [importantTopics, setImportantTopics] = useState(() => {
    const saved = sessionStorage.getItem("lastNight_importantTopics");
    return saved ? JSON.parse(saved) : [];
  });
  const [predictedQuestion, setPredictedQuestion] = useState(() => {
    const saved = sessionStorage.getItem("lastNight_predictedQuestion");
    return saved ? JSON.parse(saved) : [];
  });
  const [mcqs, setMcqs] = useState(() => {
    const saved = sessionStorage.getItem("lastNight_mcqs");
    return saved ? JSON.parse(saved) : [];
  });
  const [memoryBooster, setMemoryBooster] = useState(() => {
    const saved = sessionStorage.getItem("lastNight_memoryBooster");
    return saved ? JSON.parse(saved) : [];
  });
  const [aiCoach, setAiCoach] = useState(() => {
    const saved = sessionStorage.getItem("lastNight_aiCoach");
    return saved ? JSON.parse(saved) : [];
  });

  const [showHistory, setShowHistory] = useState(false);

  const [currentStep, setCurrentStep] = useState(-1);
  const [hasGenerated, setHasGenerated] = useState(() => {
    return sessionStorage.getItem("lastNight_hasGenerated") === "true";
  });
  const [history, setHistory] = useState([]);
  const [timerMinutes] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerMinutes * 60);
  const timerRef = useRef(null);
  const contentEndRef = useRef(null);
  const pollIntervalRefs = useRef({});
  const pollTimeoutRefs = useRef({});
  
  // Track previous subject to detect changes
  const prevSubjectRef = useRef(selectedSubject);
  
  // Create a ref to track revision data for saving to history
  const revisionDataRef = useRef({
    summary: "",
    importantTopics: [],
    predictedQuestion: [],
    mcqs: [],
    memoryBooster: [],
    aiCoach: []
  });

  const [fetchSubject, { isLoading: isSubjectLoading, isError: isSubjectError, error: subjectError, data: subjectData }] = useLazyGetSubjectsQuery();
  const [fetchChapter, { isLoading: isChapterLoading, isError: isChapterError, error: chapterError, data: ChapterData }] = useLazyGetChaptersQuery();

  const [getSummary] = useAsyncMutation(useGetLastNightSummaryMutation);
  const [getImportantTopics] = useAsyncMutation(useGetLastNightImportantTopicsMutation);
  const [getPredictedQuestion] = useAsyncMutation(useGetLastNightPredictedQuestionsMutation);
  const [getMcqs] = useAsyncMutation(useGetLastNightMcqsMutation);
  const [getMemoryBooster] = useAsyncMutation(useGetLastNightMemoryBoosterMutation);
  const [getAiCoach] = useAsyncMutation(useGetLastNightAiCoachMutation);

  // ✅ POLLING CONFIG (NEW)
const POLL_INTERVAL_MS = 5000; // 5 seconds
const POLL_TIMEOUT_MS = 90 * 1000; // 1 min 30 sec


  useErrors([
    { isError: isSubjectError, error: subjectError },
    { isError: isChapterError, error: chapterError },
  ]);

  // Clear all polling intervals & timeouts
const clearAllPolls = () => {
  Object.values(pollIntervalRefs.current).forEach(clearInterval);
  Object.values(pollTimeoutRefs.current).forEach(clearTimeout);

  pollIntervalRefs.current = {};
  pollTimeoutRefs.current = {};
};


  // Load history from localStorage on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const savedHistory = localStorage.getItem("lastNightHistory");
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error("Error loading history:", error);
      }
    };
    loadHistory();
  }, []);

  // Persist selectedClass to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("lastNight_selectedClass", selectedClass);
  }, [selectedClass]);

  // Persist selectedSubject to sessionStorage
  useEffect(() => {
    if (selectedSubject) {
      sessionStorage.setItem("lastNight_selectedSubject", selectedSubject);
    }
  }, [selectedSubject]);

  // Persist selectedChapter to sessionStorage
  useEffect(() => {
    if (selectedChapter) {
      sessionStorage.setItem("lastNight_selectedChapter", selectedChapter);
    }
  }, [selectedChapter]);

  // Persist summary to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("lastNight_summary", summary);
  }, [summary]);

  // Persist importantTopics to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("lastNight_importantTopics", JSON.stringify(importantTopics));
  }, [importantTopics]);

  // Persist predictedQuestion to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("lastNight_predictedQuestion", JSON.stringify(predictedQuestion));
  }, [predictedQuestion]);

  // Persist mcqs to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("lastNight_mcqs", JSON.stringify(mcqs));
  }, [mcqs]);

  // Persist memoryBooster to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("lastNight_memoryBooster", JSON.stringify(memoryBooster));
  }, [memoryBooster]);

  // Persist aiCoach to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("lastNight_aiCoach", JSON.stringify(aiCoach));
  }, [aiCoach]);

  // Persist hasGenerated to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("lastNight_hasGenerated", hasGenerated.toString());
  }, [hasGenerated]);

  // Update the ref whenever any revision data changes
  useEffect(() => {
    revisionDataRef.current = {
      summary,
      importantTopics,
      predictedQuestion,
      mcqs,
      memoryBooster,
      aiCoach
    };
  }, [summary, importantTopics, predictedQuestion, mcqs, memoryBooster, aiCoach]);

  // Save to history when all steps complete
  const saveToHistory = (className, subject, chapter) => {
    try {
      setHistory((prevHistory) => {
        // Check if the same revision already exists in history
        const isDuplicate = prevHistory.some(
          (item) =>
            item.className === className &&
            item.subject === subject &&
            item.chapter === chapter
        );

        // If duplicate exists, don't save again
        if (isDuplicate) {
          console.log("Duplicate revision - not saving to history");
          return prevHistory;
        }

        const historyItem = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          className,
          subject,
          chapter,
          summary: revisionDataRef.current.summary,
          importantTopics: revisionDataRef.current.importantTopics,
          predictedQuestion: revisionDataRef.current.predictedQuestion,
          mcqs: revisionDataRef.current.mcqs,
          memoryBooster: revisionDataRef.current.memoryBooster,
          aiCoach: revisionDataRef.current.aiCoach,
        };

        // Add new item at the beginning
        const updatedHistory = [historyItem, ...prevHistory];
        // Keep only last 5 items
        const trimmedHistory = updatedHistory.slice(0, 5);
        // Save to localStorage
        localStorage.setItem("lastNightHistory", JSON.stringify(trimmedHistory));
        return trimmedHistory;
      });
    } catch (error) {
      console.error("Error saving to history:", error);
    }
  };


  // Generic polling function
 // ✅ SAFE POLLING (5 sec interval + 90 sec timeout)
const pollData = async (stepKey, fetcher, setter, dataKey, params) => {
  const startTime = Date.now();

  // ❌ Prevent duplicate polling
  if (pollIntervalRefs.current[stepKey]) return;

  pollIntervalRefs.current[stepKey] = setInterval(async () => {
    try {
      // ⏱️ TIMEOUT CHECK (1 min 30 sec)
      if (Date.now() - startTime > POLL_TIMEOUT_MS) {
        clearInterval(pollIntervalRefs.current[stepKey]);
        clearTimeout(pollTimeoutRefs.current[stepKey]);

        delete pollIntervalRefs.current[stepKey];
        delete pollTimeoutRefs.current[stepKey];

        toast.error(`${stepKey} generation timed out. Please try again.`);
        setCurrentStep(-1);
        return;
      }

       
           window.__LMP_POLLING__ = true;
           const res = await fetcher(null, params);
           window.__LMP_POLLING__ = false;

      if (res?.data?.statusCode === 200) {
        setter(res.data.data[dataKey]);

        // ✅ STOP POLLING
        clearInterval(pollIntervalRefs.current[stepKey]);
        clearTimeout(pollTimeoutRefs.current[stepKey]);

        delete pollIntervalRefs.current[stepKey];
        delete pollTimeoutRefs.current[stepKey];
      }
    } catch (error) {
      clearInterval(pollIntervalRefs.current[stepKey]);
      clearTimeout(pollTimeoutRefs.current[stepKey]);

      delete pollIntervalRefs.current[stepKey];
      delete pollTimeoutRefs.current[stepKey];

      toast.error(`Error while generating ${stepKey}`);
      setCurrentStep(-1);
    }
  }, POLL_INTERVAL_MS);

  // ⛔ HARD SAFETY TIMEOUT (failsafe)
  pollTimeoutRefs.current[stepKey] = setTimeout(() => {
    if (pollIntervalRefs.current[stepKey]) {
      clearInterval(pollIntervalRefs.current[stepKey]);
      delete pollIntervalRefs.current[stepKey];

      toast.error(`${stepKey} took too long. Please retry.`);
      setCurrentStep(-1);
    }
  }, POLL_TIMEOUT_MS);
};


  // Generate content step by step
  const generateStep = async (stepIndex, params) => {
    if (stepIndex >= GENERATION_STEPS.length) {
      setCurrentStep(-1);
      toast.success("All revision materials ready!");
      
      // Save to history with a small delay to ensure all state updates are complete
      setTimeout(() => {
        saveToHistory(params.className, params.subject, params.chapter);
      }, 1000);
      
      return;
    }

    const step = GENERATION_STEPS[stepIndex];
    setCurrentStep(stepIndex);

    try {
      let res, fetcher, setter, dataKey;

      switch (step.key) {
        case "summary":
          fetcher = getSummary;
          setter = setSummary;
          dataKey = "summary";
          res = await getSummary(null, params);
          break;
        case "importantTopics":
          fetcher = getImportantTopics;
          setter = setImportantTopics;
          dataKey = "topics";
          res = await getImportantTopics(null, params);
          break;
        case "predictedQuestion":
          fetcher = getPredictedQuestion;
          setter = setPredictedQuestion;
          dataKey = "questions";
          res = await getPredictedQuestion(null, params);
          break;
        case "mcqs":
          fetcher = getMcqs;
          setter = setMcqs;
          dataKey = "mcqs";
          res = await getMcqs(null, params);
          break;
        case "memoryBooster":
          fetcher = getMemoryBooster;
          setter = setMemoryBooster;
          dataKey = "boosters";
          res = await getMemoryBooster(null, params);
          break;
        case "aiCoach":
          fetcher = getAiCoach;
          setter = setAiCoach;
          dataKey = "steps";
          res = await getAiCoach(null, params);
          break;
        default:
          return;
      }

      if (res?.data?.statusCode === 200) {
        // Data ready immediately
        setter(res.data.data[dataKey]);
        // Move to next step
        setTimeout(() => generateStep(stepIndex + 1, params), 500);
      } else if (res?.data?.statusCode === 202) {
        // Data being generated - start polling
        pollData(step.key, fetcher, setter, dataKey, params);
        
        // Wait for polling to complete before moving to next step
        const checkInterval = setInterval(() => {
          if (!pollIntervalRefs.current[step.key]) {
            clearInterval(checkInterval);
            setTimeout(() => generateStep(stepIndex + 1, params), 500);
          }
        }, 500);
      }
    } catch (error) {
      toast.error(`Failed to generate ${step.label}`);
      setCurrentStep(-1);
    }
  };

  const handleGenerate = async () => {
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      toast.error("Please select class, subject, and chapter");
      return;
    }

    // Reset all states before generating new content
    setSummary("");
    setImportantTopics([]);
    setPredictedQuestion([]);
    setMcqs([]);
    setMemoryBooster([]);
    setAiCoach([]);
    revisionDataRef.current = {
      summary: "",
      importantTopics: [],
      predictedQuestion: [],
      mcqs: [],
      memoryBooster: [],
      aiCoach: []
    };
    
    setHasGenerated(true);
    clearAllPolls();

    const params = {
      className: selectedClass,
      subject: selectedSubject,
      chapter: selectedChapter,
    };

    // Start step-by-step generation
    generateStep(0, params);
  };

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
    const persistedChapter = sessionStorage.getItem("lastNight_selectedChapter");
    
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllPolls();
      clearInterval(timerRef.current);
    };
  }, []);

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
    clearAllPolls();
    setSummary("");
    setImportantTopics([]);
    setPredictedQuestion([]);
    setMcqs([]);
    setMemoryBooster([]);
    setAiCoach([]);
    revisionDataRef.current = {
      summary: "",
      importantTopics: [],
      predictedQuestion: [],
      mcqs: [],
      memoryBooster: [],
      aiCoach: []
    };
    
    // Clear sessionStorage
    sessionStorage.removeItem("lastNight_summary");
    sessionStorage.removeItem("lastNight_importantTopics");
    sessionStorage.removeItem("lastNight_predictedQuestion");
    sessionStorage.removeItem("lastNight_mcqs");
    sessionStorage.removeItem("lastNight_memoryBooster");
    sessionStorage.removeItem("lastNight_aiCoach");
    sessionStorage.removeItem("lastNight_hasGenerated");
    
    setHasGenerated(false);
    setCurrentStep(-1);
    setTimerActive(false);
    setTimeLeft(timerMinutes * 60);
    toast.success("Cleared - Ready for new revision");
  };

const loadFromHistory = (historyItem) => {
  clearAllPolls();
  
  // Set all the data first
  setSummary(historyItem.summary || "");
  setImportantTopics(historyItem.importantTopics || []);
  setPredictedQuestion(historyItem.predictedQuestion || []);
  setMcqs(historyItem.mcqs || []);
  setMemoryBooster(historyItem.memoryBooster || []);
  setAiCoach(historyItem.aiCoach || []);
  revisionDataRef.current = {
    summary: historyItem.summary || "",
    importantTopics: historyItem.importantTopics || [],
    predictedQuestion: historyItem.predictedQuestion || [],
    mcqs: historyItem.mcqs || [],
    memoryBooster: historyItem.memoryBooster || [],
    aiCoach: historyItem.aiCoach || []
  };
  setHasGenerated(true);
  setCurrentStep(-1);
  setTimerActive(false);
  setTimeLeft(timerMinutes * 60);
  
  // Force clear everything first
  setSubjects([]);
  setChapters([]);
  setSelectedSubject("");
  setSelectedChapter("");
  
  // Set class - this will trigger subject fetch via useEffect
  setSelectedClass(historyItem.className);
  
  // After subjects are fetched, manually fetch for the specific subject and chapter
  // Use a longer delay to ensure subjects have loaded
  setTimeout(async () => {
    try {
      // Fetch subjects for the class
      const subjectsRes = await fetchSubject({ selectedClass: historyItem.className });
      
      if (subjectsRes?.data?.data?.subjects) {
        const subjectsList = subjectsRes.data.data.subjects;
        setSubjects(subjectsList);
        
        // Check if the history subject exists in the fetched subjects
        const subjectExists = subjectsList.some(s => s.subject === historyItem.subject);
        
        if (subjectExists) {
          setSelectedSubject(historyItem.subject);
          
          // Now fetch chapters for this specific subject
          setTimeout(async () => {
            try {
              const chaptersRes = await fetchChapter({ 
                selectedClass: historyItem.className, 
                selectedSubject: historyItem.subject 
              });
              
              if (chaptersRes?.data?.data?.chapters) {
                const chaptersList = chaptersRes.data.data.chapters;
                setChapters(chaptersList);
                
                // Check if the history chapter exists
                const chapterExists = chaptersList.some(c => c.chapter === historyItem.chapter);
                
                if (chapterExists) {
                  setSelectedChapter(historyItem.chapter);
                } else if (chaptersList.length > 0) {
                  setSelectedChapter(chaptersList[0].chapter);
                }
              }
            } catch (error) {
              console.error("Error fetching chapters from history:", error);
            }
          }, 300);
        } else if (subjectsList.length > 0) {
          // If subject doesn't exist, select first available
          setSelectedSubject(subjectsList[0].subject);
        }
      }
    } catch (error) {
      console.error("Error fetching subjects from history:", error);
    }
  }, 500);
  
  toast.success("Loaded from history");
  
  // Scroll to top to show content
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

  const deleteFromHistory = (itemId, e) => {
    e.stopPropagation(); // Prevent triggering loadFromHistory
    try {
      setHistory((prevHistory) => {
        const updatedHistory = prevHistory.filter((item) => item.id !== itemId);
        localStorage.setItem("lastNightHistory", JSON.stringify(updatedHistory));
        toast.success("Removed from history");
        return updatedHistory;
      });
    } catch (error) {
      console.error("Error deleting from history:", error);
      toast.error("Failed to delete from history");
    }
  };

  const hasContent = summary || importantTopics.length > 0 || predictedQuestion.length > 0 || 
                     mcqs.length > 0 || memoryBooster.length > 0 || aiCoach.length > 0;

  const isGenerating = currentStep >= 0;

  return (
    <div className="min-h-screen w-full bg-background">
        <Helmet>
        {/* Title */}
        <title>
          Last Night Before Exam – One Night CBSE Revision Guide | LMP
        </title>

        {/* Meta Description */}
        <meta
          name="description"
          content="Haven’t studied enough? Use Last Night Before Exam to revise CBSE chapters in one night with topper-style answers, PYQs, and smart revision to score maximum marks."
        />

        {/* Keywords */}
        <meta
          name="keywords"
          content="
          last night before exam cbse,
          one night study guide cbse,
          last minute revision cbse,
          cbse exam preparation in one night,
          how to score marks in cbse last night,
          topper style answers cbse,
          cbse important questions last minute,
          cbse pyqs last night revision,
          cbse ai
          "
        />

        {/* Canonical */}
        <link
          rel="canonical"
          href="https://lastminutepreparation.in/ai-chat"
        />

        {/* Robots */}
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Last Night Before Exam – Smart CBSE One-Night Revision | LMP"
        />
        <meta
          property="og:description"
          content="Revise CBSE syllabus in one night with exam-ready answers, PYQs, and focused revision. Built for students short on time."
        />
        <meta
          property="og:url"
          content="https://lastminutepreparation.in/ai-chat"
        />
        <meta
          property="og:image"
          content="https://lastminutepreparation.in/og-ai-chat.png"
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Last Night Before Exam – CBSE Smart Revision | LMP"
        />
        <meta
          name="twitter:description"
          content="Short on time? Revise CBSE chapters in one night with topper-style answers and PYQs."
        />
        <meta
          name="twitter:image"
          content="https://lastminutepreparation.in/og-ai-chat.png"
        />
      </Helmet>
      <Navbar />

      <div className="container mx-auto px-1 pt-20 sm:pt-24 lg:max-w-[90%] xl:max-w-[90%]">
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
            Even if you haven't studied the chapter at all, this one-night revision material is enough to build full exam-ready understanding and aim for 90%+.
          </p>
        </div>

        {/* Timer Bar - Sticky when content exists */}
        {hasGenerated && (
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
                  <Button onClick={toggleTimer} size="sm" variant="secondary" className="h-9 px-4 font-medium">
                    {timerActive ? "Pause" : "Start"}
                  </Button>
                  <Button onClick={handleClear} size="sm" variant="secondary" className="h-9 px-3">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Input Section - Only show when no revision */}
        {!hasGenerated && (
          <div className="max-w-2xl lg:max-w-7xl mx-auto space-y-6">
            {/* History Section */}
            {history.length > 0 && (
             <Card className="p-6">
  {/* Header (click to toggle) */}
  <button
    onClick={() => setShowHistory((prev) => !prev)}
    className="w-full flex items-center justify-between gap-3 mb-4 text-left"
  >
    <div className="flex items-center gap-3">
      <History className="w-5 h-5 text-orange-500" />
      <h3 className="font-semibold text-lg">Recent Revisions</h3>
    </div>

    <ChevronDown
      className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
        showHistory ? "rotate-180" : ""
      }`}
    />
  </button>

  {/* Foldable Content */}
  <div
    className={`grid transition-all duration-300 ease-in-out ${
      showHistory ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
    }`}
  >
    <div className="overflow-hidden space-y-2">
      {history.map((item) => (
        <button
          key={item.id}
          onClick={() => loadFromHistory(item)}
          className="w-full text-left p-4 rounded-lg border border-border hover:border-orange-500 hover:bg-orange-500/5 transition-all group relative"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-8">
              <p className="font-medium text-sm">
                {item.className} - {item.subject}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {item.chapter}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground">
                {new Date(item.timestamp).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <button
                onClick={(e) => deleteFromHistory(item.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/10 text-red-500 transition-all"
                title="Delete from history"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
</Card>

            )}

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6 sm:p-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">Class</label>
                    <div className="relative">
                      <select
                        value={selectedClass}
                        onChange={(e) => handleClassChange(e.target.value)}
                        className="w-full h-11 px-4 pr-10 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
                      >
                        {classes.map((cls) => (
                          <option key={cls} value={cls}>Class {cls}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <div className="relative">
                      <select
                        value={selectedSubject}
                        onChange={(e) => handleSubjectChange(e.target.value)}
                        disabled={isSubjectLoading || subjects.length === 0}
                        className="w-full h-11 px-4 pr-10 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
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
                    <label className="block text-sm font-medium mb-2">Chapter</label>
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
                            <option key={chapter.chapter} value={chapter.chapter}>{chapter.chapter}</option>
                          ))
                        ) : (
                          <option>Loading Chapters Please wait...</option>
                        )}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !selectedClass || !selectedSubject || !selectedChapter}
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    {isGenerating ? (
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

              <Card className="p-6 sm:p-8 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2.5 rounded-xl bg-orange-500/10 flex-shrink-0">
                    <HelpCircle className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">What You'll Get</h3>
                    <p className="text-sm text-muted-foreground">Comprehensive last-minute revision materials</p>
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
          </div>
        )}

        {/* Revision Content */}
        {hasGenerated && (
          <div className="space-y-6">
            {hasContent && (
              <RevisionPanel 
                summary={summary} 
                importantTopics={importantTopics} 
                predictedQuestion={predictedQuestion} 
                mcqs={mcqs} 
                memoryBooster={memoryBooster} 
                aiCoach={aiCoach}
                selectedClass={selectedClass}
                selectedSubject={selectedSubject}
                selectedChapter={selectedChapter}
              />
            )}

            {/* Sequential Loading Indicator */}
            {isGenerating && currentStep >= 0 && (
              <div className="flex items-start gap-3 p-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center ml-4 flex-shrink-0">
                  <img className="h-8 w-8" src={logo} alt="" />
                </div>
                   <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-muted/50 border border-border/50">
                                     <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                     <span className="text-sm text-muted-foreground">
                                       Generating {GENERATION_STEPS[currentStep]?.label}...
                                     </span>
                                   </div>
                  <AnimatedLoader stepLabel={currentStep} isLoading={isGenerating}/>
              
              </div>
            )}
 
          </div>
        )}

        {/* Empty State */}
        {!hasGenerated && !isGenerating && (
          <Card className="p-12 sm:p-16 mb-8 text-center mt-8 max-w-2xl lg:max-w-5xl mx-auto">
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