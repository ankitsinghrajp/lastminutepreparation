import { BookOpen } from "lucide-react";
import AIOutput from "../AIOutput";

const LastNightBeforeExamSummary = ({ summary }) => {
  return (
    <div className="bg-card rounded-none sm:rounded-2xl shadow-sm border-y sm:border border-border overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-bold text-lg text-white">Chapter Summary</h3>
        </div>
      </div>

      {/* ⬇ now using AIOutput instead of bullet points */}
      <div className="p-4">
        <AIOutput content={summary} />
      </div>
    </div>
  );
};

export default LastNightBeforeExamSummary;
