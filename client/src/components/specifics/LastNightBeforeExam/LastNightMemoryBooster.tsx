import { Zap } from 'lucide-react'
import { renderFormula } from './renderFormula'
import AIOutput from '../AIOutput';

const LastNightMemoryBooster = ({ memoryBooster }) => {
  return (
    <div className="rounded-none shadow-sm border-y overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-bold text-lg text-white">Memory Boosters</h3>
        </div>
      </div>

      <div className="py-4 space-y-3">
        {memoryBooster.map((booster, idx) => (
          <div key={idx} className="bg-muted/50 rounded-xl p-4 border border-border overflow-hidden">
            <div className="flex gap-3">
              <Zap className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />

              <div className="flex-1 min-w-0">
                <div className="text-sm leading-relaxed text-foreground/90 mb-3">
                 <AIOutput content={booster?.content}/>
                </div>

                {booster?.formula && (
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 overflow-x-auto">
                    <div className="min-w-fit">
                      {renderFormula(booster?.formula)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LastNightMemoryBooster
