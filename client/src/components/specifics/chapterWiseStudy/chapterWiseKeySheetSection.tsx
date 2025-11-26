import { Calendar, GraduationCap, Lightbulb, Sparkles } from 'lucide-react'
import AIOutput from '../AIOutput'

const ChapterWiseKeySheetSection = ({keySheet}) => {
  return (
   <div className="space-y-4">
              {/* Formulas */}
              {keySheet.formulas && keySheet.formulas.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                    </div>
                    <h4 className="text-base font-bold text-foreground">
                      Important Formulas
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {keySheet.formulas.map((formula, index) => (
                      <div
                        key={index}
                        className="p-3 bg-background/50 rounded-lg border border-amber-500/10"
                      >
                        <AIOutput content={formula} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Important Dates */}
              {keySheet.importantDates && keySheet.importantDates.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-rose-500" />
                    </div>
                    <h4 className="text-base font-bold text-foreground">
                      Important Dates
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {keySheet.importantDates.map((date, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gradient-to-br from-rose-500/5 to-pink-500/5 rounded-lg border border-rose-500/10"
                      >
                        <p className="text-sm text-foreground font-medium">
                          {date}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Terms */}
              {keySheet.keyTerms && keySheet.keyTerms.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <Lightbulb className="h-4 w-4 text-cyan-500" />
                    </div>
                    <h4 className="text-base font-bold text-foreground">
                      Key Terms & Definitions
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {keySheet.keyTerms.map((term, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-xl border border-cyan-500/10"
                      >
                        <AIOutput content={term} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Theorems & Laws */}
              {keySheet.theoremsOrLaws && keySheet.theoremsOrLaws.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <GraduationCap className="h-4 w-4 text-indigo-500" />
                    </div>
                    <h4 className="text-base font-bold text-foreground">
                      Theorems & Laws
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {keySheet.theoremsOrLaws.map((theorem, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-xl border border-indigo-500/10"
                      >
                        <AIOutput content={theorem} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
  )
}

export default ChapterWiseKeySheetSection