import { FileText } from 'lucide-react';
import { parseAnswer, renderFormula } from './renderFormula';

const LastNightPredictedQuestions = ({predictedQuestion}) => {

  return (
       <div className="rounded-none shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-white">Predicted Questions</h3>
              </div>
            </div>
            <div className="py-4 space-y-5">
              {predictedQuestion?.map((q, idx) => {
                return (
                  <div key={idx} className="bg-muted/50 rounded-xl p-4 border border-border">
                   <div className="flex items-start gap-3 mb-4">
  <span className="min-w-8 min-h-8 flex items-center justify-center 
                   text-xs font-semibold rounded-full 
                   bg-gradient-to-r from-purple-500 to-pink-500 
                   text-white">
    Q.{idx + 1}
  </span>

  <p className="font-semibold text-base text-foreground leading-relaxed">
    {q.question}
  </p>
</div>

                    {q?.formula && (
                      <div className="ml-1 mt-3">
                        <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Key Formula</p>
                          </div>
                          {renderFormula(q.formula)}
                        </div>
                      </div>
                    )}

                    {q.keywords && q.keywords.length > 0 && (
                      <div className="ml-11 mt-3 flex flex-wrap gap-2">
                        {q.keywords.map((keyword, i) => (
                          <span key={i} className="px-3 py-1.5 bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold border border-purple-500/20">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
  )
}

export default LastNightPredictedQuestions