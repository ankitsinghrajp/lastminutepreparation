import React from 'react'
import { Card } from '../../ui/card'
import { Target, TrendingUp } from 'lucide-react'

const ProgressBar = ({hasContent, progress}) => {
  return (
    <div>
        {hasContent && (
          <div className="mb-6">
            <Card className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 border-0 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">Chapter Progress</span>
                <span className="text-white text-sm font-bold">{Math.floor(progress)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-white/90">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>3 topics mastered</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>Daily Goal: 5/10 topics</span>
                </div>
              </div>
            </Card>
          </div>
        )}
        </div>
  )
}

export default ProgressBar