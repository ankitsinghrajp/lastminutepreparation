import { Target } from 'lucide-react'

import { renderFormula } from './renderFormula'

const LastNightAiCoach = ({aiCoach}) => {
  return (
      <div className="rounded-none shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-white">AI Coach - Study Plan</h3>
              </div>
            </div>

            <div className="py-4 space-y-3">
              {aiCoach.map((step, idx) => (
                <div key={idx} className="flex gap-3 bg-muted/50 rounded-xl p-4 border border-border">
                  

                  <div className="flex-1">
                    <p className="text-sm leading-relaxed text-foreground/90 mb-2">
                      {step.action}
                    </p>

                    {step.formula && (
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 mt-3">
                        {renderFormula(step.formula)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
  )
}

export default LastNightAiCoach