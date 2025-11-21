import { Lightbulb } from 'lucide-react'
import { renderFormula } from './renderFormula'

const LastNightBeforeExamImportantTopics = ({importantTopics}) => {
  return (
      <div className=" rounded-none shadow-sm  overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
              <div className= "flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-white">Important Topics</h3>
              </div>
            </div>
            <div className="py-2 space-y-4">
              {importantTopics.map((topic, idx) => (
                <div key={idx} className="bg-muted/50 rounded-xl p-4 border border-border">
                  <div className="flex gap-3 mb-3">
                    <p className="font-semibold text-base text-foreground pt-0.5">
                      {topic.topic}
                    </p>
                  </div>
                  <p className="text-sm text-foreground/80 mb-3 ml-1 leading-relaxed">
                    {topic.explanation}
                  </p>

                  {topic.formula && (
                    <div className="ml-0 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                        Formula:
                      </p>
                      {renderFormula(topic.formula)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
  )
}

export default LastNightBeforeExamImportantTopics