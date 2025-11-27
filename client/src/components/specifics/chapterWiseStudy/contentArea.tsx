import { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  Network,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import DiagramViewer from "./diagramViewer";
import ChapterWiseSummarySection from "./chapterWiseSummarySection";
import ChapterWiseShortNotesSection from "./chapterWiseShortNotesSection";
import ChapterWiseImportantQuestionSection from "./chapterWiseImportantQuestionSection";


// Collapsible Section Component
const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false, gradient }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-none shadow-sm border-y sm:border border-border overflow-hidden bg-card">
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
        <div className="">
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
  importantQuestions,
}) => {
  const [visibleSections, setVisibleSections] = useState({
    summary: false,
    shortNotes: false,
    mindMap: false,
    importantQuestions: false,
  });

  // Show sections as soon as data becomes available
  useEffect(() => {
    if (summary && !visibleSections.summary) {
      setVisibleSections(prev => ({ ...prev, summary: true }));
    }
  }, [summary]);

  useEffect(() => {
    if (shortNotes && shortNotes.length > 0 && !visibleSections.shortNotes) {
      setVisibleSections(prev => ({ ...prev, shortNotes: true }));
    }
  }, [shortNotes]);

  useEffect(() => {
    if (mindMap?.edges && mindMap?.nodes && !visibleSections.mindMap) {
      setVisibleSections(prev => ({ ...prev, mindMap: true }));
    }
  }, [mindMap]);

  useEffect(() => {
    if (importantQuestions && Object.keys(importantQuestions).length > 0 && !visibleSections.importantQuestions) {
      setVisibleSections(prev => ({ ...prev, importantQuestions: true }));
    }
  }, [importantQuestions]);

  return (
    <div className="bg-background overflow-y-auto h-full">
      <div className="space-y-4 px-0">
        {/* Summary Section */}
        {visibleSections.summary && (
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
        {visibleSections.shortNotes && (
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
        {visibleSections.mindMap && (
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

        {/* Important Questions Section */}
        {visibleSections.importantQuestions && (
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