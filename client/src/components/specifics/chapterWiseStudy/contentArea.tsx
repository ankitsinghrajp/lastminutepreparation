import { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  Network,
  Key,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import DiagramViewer from "./diagramViewer";
import ChapterWiseSummarySection from "./chapterWiseSummarySection";
import ChapterWiseShortNotesSection from "./chapterWiseShortNotesSection";
import ChapterWiseKeySheetSection from "./chapterWiseKeySheetSection";
import ChapterWiseImportantQuestionSection from "./chapterWiseImportantQuestionSection";


// Collapsible Section Component
const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false, gradient }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-none sm:rounded-2xl shadow-sm border-y sm:border border-border overflow-hidden bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full ${gradient} p-4 flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-bold text-lg text-white text-left">
            {title}
          </h3>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-white flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-white flex-shrink-0" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
};

const ContentArea = ({
  summary,
  shortNotes,
  mindMap,
  keySheet,
  importantQuestions,
}) => {
  useEffect(() => {
    if (summary) console.log("Summary:", summary);
    if (shortNotes) console.log("Short Notes:", shortNotes);
    if (mindMap) console.log("Mind Map:", mindMap);
    if (keySheet) console.log("Key Sheet:", keySheet);
    if (importantQuestions) console.log("Important Questions:", importantQuestions);
  }, [summary, shortNotes, mindMap, keySheet, importantQuestions]);

  return (
    <div className="bg-background overflow-y-auto h-full">
      <div className="space-y-4 px-0">
        {/* Summary Section */}
        {summary && (
          <CollapsibleSection
            title="Chapter Summary"
            icon={BookOpen}
            gradient="bg-gradient-to-r from-blue-500 to-blue-600"
            defaultOpen={true}
          >
            <ChapterWiseSummarySection summary={summary}/>
          </CollapsibleSection>
        )}

        {/* Short Notes Section */}
        {shortNotes && shortNotes.length > 0 && (
          <CollapsibleSection
            title="Short Notes"
            icon={FileText}
            gradient="bg-gradient-to-r from-violet-500 to-purple-600"
            defaultOpen={true}
          >
            <ChapterWiseShortNotesSection shortNotes={shortNotes}/>
          </CollapsibleSection>
        )}

        {/* Mind Map Section */}
        {mindMap && mindMap?.edges && mindMap?.nodes && (
          <CollapsibleSection
            title="Complete Mind Map Of Chapter"
            icon={Network}
            gradient="bg-gradient-to-r from-emerald-500 to-teal-500"
            defaultOpen={false}
          >
            <div className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-lg p-4 border border-emerald-500/10">
              <DiagramViewer
                edges={mindMap.edges}
                nodes={mindMap.nodes}
              />
            </div>
          </CollapsibleSection>
        )}

        {/* Key Sheet Section */}
        {keySheet && Object.keys(keySheet).length > 0 && (
          <CollapsibleSection
            title="Key Concepts & Reference"
            icon={Key}
            gradient="bg-gradient-to-r from-amber-500 to-orange-600"
            defaultOpen={true}
          >
            <ChapterWiseKeySheetSection keySheet={keySheet}/>
          </CollapsibleSection>
        )}

        {/* Important Questions Section */}
        {importantQuestions && Object.keys(importantQuestions).length > 0 && (
          <CollapsibleSection
            title="Important Questions"
            icon={HelpCircle}
            gradient="bg-gradient-to-r from-pink-500 to-rose-600"
            defaultOpen={true}
          >
           <ChapterWiseImportantQuestionSection importantQuestions={importantQuestions}/>
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
};

export default ContentArea;