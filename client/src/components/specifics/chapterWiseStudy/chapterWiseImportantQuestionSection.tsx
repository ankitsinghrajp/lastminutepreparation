import React from 'react'
import AIOutput from '../AIOutput'

const ChapterWiseImportantQuestionSection = ({importantQuestions}) => {
  return (
     <div className="space-y-3">
              {Object.entries(importantQuestions).map(([key, value], index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-pink-500/5 to-rose-500/5 rounded-xl p-4 border border-pink-500/10"
                >
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-pink-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-pink-500">
                        Q{index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <AIOutput content={typeof value === 'string' ? value : JSON.stringify(value?.question)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
  )
}

export default ChapterWiseImportantQuestionSection