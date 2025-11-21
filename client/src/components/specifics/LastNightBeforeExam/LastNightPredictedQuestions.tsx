import { FileText } from 'lucide-react';
import { parseAnswer, renderFormula } from './renderFormula';

const LastNightPredictedQuestions = ({predictedQuestion}) => {
  // Helper function to convert **text** to bold
  const convertMarkdownBold = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Helper function to detect and render text with potential formulas
  const renderTextWithFormulas = (text) => {
    // Check for "Formula: **" or "Formula:" pattern followed by equation
    if (text.includes('Formula:')) {
      const parts = text.split(/(Formula:\s*\*?\*?\s*[A-Z_Φ][^,\n]+)/);
      return parts.map((part, idx) => {
        const formulaMatch = part.match(/Formula:\s*\*?\*?\s*([A-Z_Φ][^,\n]+)/);
        if (formulaMatch) {
          return (
            <span key={idx}>
              <strong>Formula:</strong> {renderFormula(formulaMatch[1])}
            </span>
          );
        }
        return <span key={idx}>{convertMarkdownBold(part)}</span>;
      });
    }
    
    // Check for standalone formulas (E = F/q, etc.) at start of line
    const standaloneFormulaMatch = text.match(/^([A-Z_Φ]+\s*=\s*[^,\.\n]+[²³\/\*\^][^,\.\n]*)/);
    if (standaloneFormulaMatch) {
      const formula = standaloneFormulaMatch[0];
      const afterFormula = text.substring(formula.length);
      
      return (
        <>
          {renderFormula(formula)}
          {afterFormula && <span>{convertMarkdownBold(afterFormula)}</span>}
        </>
      );
    }
    
    return <span>{convertMarkdownBold(text)}</span>;
  };

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
              {predictedQuestion.map((q, idx) => {
                const answerParts = parseAnswer(q.answer);

                return (
                  <div key={idx} className="bg-muted/50 rounded-xl p-4 border border-border">
                    <div className="flex gap-3 mb-4">
                     
                      <p className="font-bold text-base text-foreground pt-1">
                        {q.question}
                      </p>
                    </div>
                 <div className="ml-1">
                      <div className="p-4 bg-green-500/5 rounded-xl border-l-4 border-green-500">
                        <div className="space-y-3 text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                          {q.answer.split(/\\n|\\\\n/).filter(line => line.trim()).map((line, i) => {
                            const trimmedLine = line.trim();
                            
                            // Numbered points (1., 2., 3., etc.)
                            const numberedMatch = trimmedLine.match(/^(\d+)\.\s*(.+)/);
                            if (numberedMatch) {
                              return (
                                <div key={i} className="flex gap-2.5 mb-2">
                                  <span className="text-green-600 dark:text-green-400 font-bold flex-shrink-0">{numberedMatch[1]}.</span>
                                  <div className="flex-1">{renderTextWithFormulas(numberedMatch[2])}</div>
                                </div>
                              );
                            }
                            
                            // Main bullet points (start with -)
                            if (trimmedLine.startsWith('- ')) {
                              const content = trimmedLine.substring(2);
                              // Check if it contains a colon (like "Positive Charge:")
                              if (content.includes(':')) {
                                const [label, ...rest] = content.split(':');
                                const restContent = rest.join(':').trim();
                                return (
                                  <div key={i} className="flex gap-2.5 mb-2">
                                    <span className="text-green-600 dark:text-green-400 font-bold mt-0.5 flex-shrink-0">•</span>
                                    <div>
                                      <span className="font-semibold text-foreground">{label}:</span>
                                      <span className="ml-1">{renderTextWithFormulas(restContent)}</span>
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div key={i} className="flex gap-2.5 mb-2">
                                  <span className="text-green-600 dark:text-green-400 font-bold mt-0.5 flex-shrink-0">•</span>
                                  <div>{renderTextWithFormulas(content)}</div>
                                </div>
                              );
                            }
                            
                            // Regular paragraphs - check for formulas
                            return (
                              <div key={i} className="mb-3 leading-relaxed">
                                {renderTextWithFormulas(trimmedLine)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {q.formula && (
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