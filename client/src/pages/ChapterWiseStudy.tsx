import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Brain, Sparkles, Layers, Clock, Trash2, History, X, ChevronDown, HelpCircle } from "lucide-react";
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
import logo from "../assets/logo.png";
import { Helmet } from "react-helmet-async";

const classes = ["9th", "10th", "11th", "12th"];

const GENERATION_STEPS = [
  { key: "summary", label: "Chapter Summary", pollInterval: 2000 },
  { key: "shortNotes", label: "Short Notes", pollInterval: 6000 },
  { key: "mindMap", label: "Mind Map", pollInterval: 8000 },
  { key: "importantQuestions", label: "Important Questions", pollInterval: 10000 },
];

export default function ChapterWiseStudy() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  
  // Initialize from sessionStorage - EXACT COPY
  const [selectedClass, setSelectedClass] = useState(() => {
    return sessionStorage.getItem("chapterWise_selectedClass") || "12th";
  });
  const [selectedSubject, setSelectedSubject] = useState(() => {
    return sessionStorage.getItem("chapterWise_selectedSubject") || "";
  });
  const [selectedChapter, setSelectedChapter] = useState(() => {
    return sessionStorage.getItem("chapterWise_selectedChapter") || "";
  });

  // Content State - Initialize from sessionStorage - EXACT COPY
  const [summary, setSummary] = useState(() => {
    const saved = sessionStorage.getItem("chapterWise_summary");
    return saved || "";
  });
  const [shortNotes, setShortNotes] = useState(() => {
    const saved = sessionStorage.getItem("chapterWise_shortNotes");
    return saved ? JSON.parse(saved) : [];
  });
  const [mindMap, setMindMap] = useState(() => {
    const saved = sessionStorage.getItem("chapterWise_mindMap");
    return saved ? JSON.parse(saved) : {};
  });
  const [importantQuestions, setImportantQuestions] = useState(() => {
    const saved = sessionStorage.getItem("chapterWise_importantQuestions");
    return saved ? JSON.parse(saved) : {};
  });

  const [currentStep, setCurrentStep] = useState(-1);
  const [hasGenerated, setHasGenerated] = useState(() => {
    return sessionStorage.getItem("chapterWise_hasGenerated") === "true";
  });
  const [history, setHistory] = useState([]);
  const [timerMinutes] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerMinutes * 60);
  const [showHistory, setShowHistory] = useState(false);

  const timerRef = useRef(null);
  const contentEndRef = useRef(null);
  const pollIntervalRefs = useRef({});
  const revisionDataRef = useRef({
    summary: "",
    shortNotes: [],
    mindMap: {},
    importantQuestions: {}
  });

  // Track previous subject to detect changes - EXACT COPY
  const prevSubjectRef = useRef(selectedSubject);

  const [
    fetchSubject,
    { isLoading: isSubjectLoading, isError: isSubjectError, error: subjectError, data: subjectData },
  ] = useLazyGetSubjectsQuery();

  const [
    fetchChapter,
    { isLoading: isChapterLoading, isError: isChapterError, error: chapterError, data: ChapterData },
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

  // Load history from localStorage on mount - EXACT COPY
  useEffect(() => {
    const loadHistory = () => {
      try {
        const savedHistory = localStorage.getItem("chapterWiseHistory");
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error("Error loading history:", error);
      }
    };
    loadHistory();
  }, []);

  // Persist selectedClass to sessionStorage - EXACT COPY
  useEffect(() => {
    sessionStorage.setItem("chapterWise_selectedClass", selectedClass);
  }, [selectedClass]);

  // Persist selectedSubject to sessionStorage - EXACT COPY
  useEffect(() => {
    if (selectedSubject) {
      sessionStorage.setItem("chapterWise_selectedSubject", selectedSubject);
    }
  }, [selectedSubject]);

  // Persist selectedChapter to sessionStorage - EXACT COPY
  useEffect(() => {
    if (selectedChapter) {
      sessionStorage.setItem("chapterWise_selectedChapter", selectedChapter);
    }
  }, [selectedChapter]);

  // Persist summary to sessionStorage - EXACT COPY
  useEffect(() => {
    sessionStorage.setItem("chapterWise_summary", summary);
  }, [summary]);

  // Persist shortNotes to sessionStorage - EXACT COPY
  useEffect(() => {
    sessionStorage.setItem("chapterWise_shortNotes", JSON.stringify(shortNotes));
  }, [shortNotes]);

  // Persist mindMap to sessionStorage - EXACT COPY
  useEffect(() => {
    sessionStorage.setItem("chapterWise_mindMap", JSON.stringify(mindMap));
  }, [mindMap]);

  // Persist importantQuestions to sessionStorage - EXACT COPY
  useEffect(() => {
    sessionStorage.setItem("chapterWise_importantQuestions", JSON.stringify(importantQuestions));
  }, [importantQuestions]);

  // Persist hasGenerated to sessionStorage - EXACT COPY
  useEffect(() => {
    sessionStorage.setItem("chapterWise_hasGenerated", hasGenerated.toString());
  }, [hasGenerated]);

  // Update the ref whenever any revision data changes - EXACT COPY
  useEffect(() => {
    revisionDataRef.current = {
      summary,
      shortNotes,
      mindMap,
      importantQuestions
    };
  }, [summary, shortNotes, mindMap, importantQuestions]);

  // Save to history when all steps complete - EXACT COPY PATTERN
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
          shortNotes: revisionDataRef.current.shortNotes,
          mindMap: revisionDataRef.current.mindMap,
          importantQuestions: revisionDataRef.current.importantQuestions,
        };

        // Add new item at the beginning
        const updatedHistory = [historyItem, ...prevHistory];
        // Keep only last 5 items
        const trimmedHistory = updatedHistory.slice(0, 5);
        // Save to localStorage
        localStorage.setItem("chapterWiseHistory", JSON.stringify(trimmedHistory));
        return trimmedHistory;
      });
    } catch (error) {
      console.error("Error saving to history:", error);
    }
  };

  // Clear all polling intervals - EXACT COPY
  const clearAllPolls = () => {
    Object.values(pollIntervalRefs.current).forEach(interval => clearInterval(interval));
    pollIntervalRefs.current = {};
  };

  // Generic polling function - EXACT COPY
  const pollData = async (stepKey, fetcher, setter, dataKey, params, pollInterval) => {
    pollIntervalRefs.current[stepKey] = setInterval(async () => {
      try {
          window.__LMP_POLLING__ = true;
          const res = await fetcher(null, params);
          window.__LMP_POLLING__ = false;
  
        if (res?.data?.statusCode === 200) {
          if (dataKey === "fullData") {
            // For mindmap which returns the entire data object
            setter(res.data.data);
          } else {
            setter(res.data.data[dataKey]);
          }
          clearInterval(pollIntervalRefs.current[stepKey]);
          delete pollIntervalRefs.current[stepKey];
        }
      } catch (error) {
        clearInterval(pollIntervalRefs.current[stepKey]);
        delete pollIntervalRefs.current[stepKey];
        console.error(`Error polling ${stepKey}:`, error);
      }
    }, pollInterval);
  };

  // Generate content step by step - EXACT COPY PATTERN
  const generateStep = async (stepIndex, params) => {
    if (stepIndex >= GENERATION_STEPS.length) {
      setCurrentStep(-1);
      toast.success("All chapter materials ready!");
      
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
        case "shortNotes":
          fetcher = getShortNotes;
          setter = setShortNotes;
          dataKey = "shortNotes";
          res = await getShortNotes(null, params);
          break;
        case "mindMap":
          fetcher = getMindMap;
          setter = setMindMap;
          dataKey = "fullData"; // Special key for mindmap
          res = await getMindMap(null, params);
          break;
        case "importantQuestions":
          fetcher = getImportantQuestion;
          setter = setImportantQuestions;
          dataKey = "questions";
          res = await getImportantQuestion(null, params);
          break;
        default:
          return;
      }

      if (res?.data?.statusCode === 200) {
        // Data ready immediately
        if (dataKey === "fullData") {
          setter(res.data.data);
        } else {
          setter(res.data.data[dataKey]);
        }
        toast.success(`${step.label} ready!`);
        // Move to next step
        setTimeout(() => generateStep(stepIndex + 1, params), 500);
      } else if (res?.data?.statusCode === 202) {
        // Data being generated - start polling
        pollData(step.key, fetcher, setter, dataKey, params, step.pollInterval);
        
        // Wait for polling to complete before moving to next step
        const checkInterval = setInterval(() => {
          if (!pollIntervalRefs.current[step.key]) {
            clearInterval(checkInterval);
            toast.success(`${step.label} ready!`);
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

    // Reset all states before generating new content - EXACT COPY PATTERN
    setSummary("");
    setShortNotes([]);
    setMindMap({});
    setImportantQuestions({});
    revisionDataRef.current = {
      summary: "",
      shortNotes: [],
      mindMap: {},
      importantQuestions: {}
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

  // Handle class change - EXACT COPY
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

  // Handle subject change - EXACT COPY
  const handleSubjectChange = (newSubject) => {
    if (newSubject !== selectedSubject) {
      setSelectedSubject(newSubject);
      // Clear chapters immediately when subject changes
      setChapters([]);
      setSelectedChapter("");
    }
  };

  // Fetch subjects when class changes - EXACT COPY
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

  // Update subjects list - EXACT COPY
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

  // Fetch chapters when subject changes - EXACT COPY
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

  // Update chapters list - EXACT COPY
  useEffect(() => {
    if (ChapterData?.data?.chapters) {
      const chaptersList = ChapterData.data.chapters;
      setChapters(chaptersList);
      
      // Check if we have a persisted chapter from sessionStorage
      const persistedChapter = sessionStorage.getItem("chapterWise_selectedChapter");
      
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

  // Timer logic - EXACT COPY
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            toast.success("Study session completed! Take a break.");
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

  // Cleanup on unmount - EXACT COPY
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
    setShortNotes([]);
    setMindMap({});
    setImportantQuestions({});
    revisionDataRef.current = {
      summary: "",
      shortNotes: [],
      mindMap: {},
      importantQuestions: {}
    };
    
    // Clear sessionStorage - EXACT COPY PATTERN
    sessionStorage.removeItem("chapterWise_summary");
    sessionStorage.removeItem("chapterWise_shortNotes");
    sessionStorage.removeItem("chapterWise_mindMap");
    sessionStorage.removeItem("chapterWise_importantQuestions");
    sessionStorage.removeItem("chapterWise_hasGenerated");
    
    setHasGenerated(false);
    setCurrentStep(-1);
    setTimerActive(false);
    setTimeLeft(timerMinutes * 60);
    toast.success("Cleared - Ready for new chapter study");
  };

  // Load from history - EXACT COPY PATTERN WITH ADJUSTED KEYS
  const loadFromHistory = (historyItem) => {
    clearAllPolls();
    
    // Set all the data first
    setSummary(historyItem.summary || "");
    setShortNotes(historyItem.shortNotes || []);
    setMindMap(historyItem.mindMap || {});
    setImportantQuestions(historyItem.importantQuestions || {});
    revisionDataRef.current = {
      summary: historyItem.summary || "",
      shortNotes: historyItem.shortNotes || [],
      mindMap: historyItem.mindMap || {},
      importantQuestions: historyItem.importantQuestions || {}
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
        localStorage.setItem("chapterWiseHistory", JSON.stringify(updatedHistory));
        toast.success("Removed from history");
        return updatedHistory;
      });
    } catch (error) {
      console.error("Error deleting from history:", error);
      toast.error("Failed to delete from history");
    }
  };

  const hasContent = summary || shortNotes.length > 0 || Object.keys(mindMap).length > 0 || Object.keys(importantQuestions).length > 0;

  const isGenerating = currentStep >= 0;

  return (
    <div className="min-h-screen w-full bg-background">

       <Helmet>
        {/* Title */}
        <title>
          Chapter-Wise Study for CBSE | Smart Revision & Topper-Style Answers – LMP
        </title>

        {/* Meta Description */}
        <meta
          name="description"
          content="Study CBSE syllabus chapter by chapter with important topics, PYQs, and topper-style answers. Smart chapter-wise revision designed to score full marks in exams."
        />

        {/* Keywords */}
        <meta
          name="keywords"
          content="
          chapter wise study cbse,
          cbse chapter wise preparation,
          chapter wise important questions cbse,
          cbse chapter wise revision,
          topper style answers chapter wise,
          cbse pyqs chapter wise,
          smart revision chapter wise,
          cbse board exam preparation chapter wise
          "
        />

        {/* Canonical */}
        <link
          rel="canonical"
          href="https://lastminutepreparation.in/chapter-wise-study"
        />

        {/* Robots */}
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="CBSE Chapter-Wise Study & Smart Revision | LMP"
        />
        <meta
          property="og:description"
          content="Prepare CBSE chapters one by one with important topics, PYQs, and exam-ready answers. Built for focused and effective revision."
        />
        <meta
          property="og:url"
          content="https://lastminutepreparation.in/chapter-wise-study"
        />
        <meta
          property="og:image"
          content="https://lastminutepreparation.in/og-chapter-wise-study.png"
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Chapter-Wise CBSE Study & Revision | LMP"
        />
        <meta
          name="twitter:description"
          content="Study CBSE chapters smartly with topper-style answers, PYQs, and focused revision."
        />
        <meta
          name="twitter:image"
          content="https://lastminutepreparation.in/og-chapter-wise-study.png"
        />
      </Helmet>
      <Navbar />

      <div className="container mx-auto px-2 pt-20 sm:pt-24 lg:max-w-[90%] xl:max-w-[90%]">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 mb-4">
            <Layers className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            Chapter Wise{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Study
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            This guide covers each chapter fully, so you walk into the exam with zero doubt.
          </p>
        </div>

        {/* Timer Bar - Sticky when content exists */}
        {hasGenerated && (
          <div className="sticky top-16 sm:top-20 z-40 mb-6">
            <Card className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 border-0 shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-white flex-shrink-0" />
                  <div className="text-white">
                    <div className="text-2xl font-bold tabular-nums">{formatTime(timeLeft)}</div>
                    <div className="text-xs opacity-90">
                      {timerActive ? "Study Mode" : "Paused"}
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

        {/* Input Section - Only show when no content generated */}
        {!hasGenerated && (
          <div className="max-w-2xl lg:max-w-7xl mx-auto space-y-6">
            {/* History Section - EXACT COPY PATTERN */}
            {history.length > 0 && (
              <Card className="p-6">
                {/* Header (click to toggle) */}
                <button
                  onClick={() => setShowHistory((prev) => !prev)}
                  className="w-full flex items-center justify-between gap-3 mb-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-lg">Recent Chapter Studies</h3>
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
                        className="w-full text-left p-4 rounded-lg border border-border hover:border-blue-500 hover:bg-blue-500/5 transition-all group relative"
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
                              {new Date(item.timestamp).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
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
                        className="w-full h-11 px-4 pr-10 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
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
                        className="w-full h-11 px-4 pr-10 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
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
                        className="w-full h-11 px-4 pr-10 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
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
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Start Chapter Study
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              <Card className="p-6 sm:p-8 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 flex-shrink-0">
                    <HelpCircle className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">What You'll Get</h3>
                    <p className="text-sm text-muted-foreground">Comprehensive chapter study materials</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { label: "Chapter Summary", desc: "Detailed overview of the chapter" },
                    { label: "Short Notes", desc: "Concise notes for quick revision" },
                    { label: "Mind Map", desc: "Visual representation of concepts" },
                    { label: "Important Questions", desc: "Key questions for exam preparation" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
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

        {/* Content Area */}
        {hasGenerated && (
          <div className="space-y-6">
            {hasContent && (
              <ContentArea
                summary={summary}
                shortNotes={shortNotes}
                mindMap={mindMap}
                importantQuestions={importantQuestions}
                selectedClass={selectedClass}
                selectedSubject={selectedSubject}
                selectedChapter={selectedChapter}
              />
            )}

            {/* Sequential Loading Indicator */}
            {isGenerating && currentStep >= 0 && (
              <div className="flex items-start gap-3 p-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <img className="h-8 w-8" src={logo} alt="" />
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-muted/50 border border-border/50">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Generating {GENERATION_STEPS[currentStep]?.label}...
                    </span>
                  </div>
                </div>
              </div>
            )}
           
          </div>
        )}

        {/* Empty State */}
        {!hasGenerated && !isGenerating && (
          <Card className="p-12 sm:p-16 mb-8 text-center mt-8 max-w-2xl lg:max-w-5xl mx-auto">
            <Brain className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-blue-500/30" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-muted-foreground">
              Ready to Master Your Chapter
            </h3>
            <p className="text-sm text-muted-foreground/70">
              Select your chapter and learning mode to begin structured study
            </p>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
}