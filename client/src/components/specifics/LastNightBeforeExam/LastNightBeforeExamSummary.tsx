import { BookOpen } from 'lucide-react'

const LastNightBeforeExamSummary = ({summary}) => {
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
            <div className="p-4 space-y-3">
              {summary.map((point, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground/90 pt-0.5">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
  )
}

export default LastNightBeforeExamSummary