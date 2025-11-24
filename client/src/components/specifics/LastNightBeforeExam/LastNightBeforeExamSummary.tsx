import { BookOpen } from "lucide-react";

const LastNightBeforeExamSummary = ({ summary }) => {
  // Convert \\n\\n → \n\n (real newline)
  const cleanSummary = summary.replace(/\\n/g, "\n");

  // Split into paragraphs
  const paragraphs = cleanSummary
    .split(/\n\s*\n/)
    .map((para, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {para.trim()}
      </p>
    ));

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

      <div className="p-4">
        {paragraphs}
      </div>
    </div>
  );
};

export default LastNightBeforeExamSummary;

