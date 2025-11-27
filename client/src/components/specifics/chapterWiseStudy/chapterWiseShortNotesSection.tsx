import AIOutput from "../AIOutput";

const ChapterWiseShortNotesSection = ({ shortNotes }) => {
  if (!shortNotes) return null;

  return (
    <div
      className="
        p-4 sm:p-5
        bg-[#12151c]
        border border-white/10
        shadow-md shadow-black/20

        hover:border-violet-500/30
        hover:shadow-violet-500/10
        transition-all duration-300
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/50 tracking-wide">
          Everything important about this chapter is here...
        </span>

        <span
          className="
            text-[10px] px-2 py-1 rounded-full
            bg-violet-600/20 text-violet-300 border border-violet-500/20
          "
        >
          Important
        </span>
      </div>

      {/* Entire content as single AI Output */}
      <AIOutput content={shortNotes} />
    </div>
  );
};

export default ChapterWiseShortNotesSection;
