import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BarChart3, BookMarked, BookOpen, Play, ChevronLeft } from 'lucide-react'

const ContentArea = ({hasContent, selectedMode, aiContent, currentSectionIndex, setCurrentSectionIndex}) => {
  const sections = aiContent?.sections || [];
  
  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  return (
    <div>
      {hasContent && (
        <div className="space-y-6">
          {/* Concept Mode Content */}
          {selectedMode === "concept" && sections.length > 0 && (
            <Card className=" bg-card/50 border-border/50">
              {/* Section Progress Indicator */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Section {currentSectionIndex + 1} of {sections.length}
                </span>
                <div className="flex gap-1">
                  {sections.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 w-8 rounded-full transition-colors ${
                        idx === currentSectionIndex
                          ? 'bg-blue-500'
                          : idx < currentSectionIndex
                          ? 'bg-blue-500/30'
                          : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Current Section Content */}
              {(() => {
                const section = sections[currentSectionIndex];
                return (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold">{section?.title}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {section?.examImportance && (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-700">
                              {section.examImportance}
                            </span>
                          )}
                          {section?.marksWeightage && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-700">
                              {section.marksWeightage} marks
                            </span>
                          )}
                          {section?.previousYearFrequency && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-700">
                              {section.previousYearFrequency}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Topic Cards */}
                    <div className="space-y-4">
                      {section?.topics?.map((topic, topicIndex) => (
                        <Card key={topicIndex} className="p-4 bg-background border-border">
                          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <BookMarked className="h-5 w-5 text-blue-500" />
                            {topic?.name}
                          </h3>
                          
                          {/* Subtopics */}
                          {topic?.subtopics?.map((subtopic, subtopicIndex) => (
                            <div key={subtopicIndex} className="space-y-4 mb-6">
                              <div>
                                <h4 className="font-semibold text-base mb-2">{subtopic?.title}</h4>
                                
                                {/* Concept Summary */}
                                {subtopic?.content?.summary && (
                                  <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 mb-3">
                                    <p className="text-sm font-medium mb-1 text-blue-700">📝 Concept Summary</p>
                                    <p className="text-sm text-muted-foreground">
                                      {subtopic.content.summary}
                                    </p>
                                  </div>
                                )}

                                {/* NCERT Definition */}
                                {subtopic?.content?.ncertDefinition && (
                                  <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20 mb-3">
                                    <p className="text-sm font-medium mb-1 text-indigo-700">📚 NCERT Definition</p>
                                    <p className="text-sm text-muted-foreground">
                                      {subtopic.content.ncertDefinition}
                                    </p>
                                  </div>
                                )}

                                {/* Simple Definition */}
                                {subtopic?.content?.simpleDefinition && (
                                  <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 mb-3">
                                    <p className="text-sm font-medium mb-1 text-cyan-700">💬 Simple Explanation</p>
                                    <p className="text-sm text-muted-foreground">
                                      {subtopic.content.simpleDefinition}
                                    </p>
                                  </div>
                                )}

                                {/* Formula */}
                                {subtopic?.content?.formula && (
                                  <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 mb-3">
                                    <p className="text-sm font-medium mb-1 text-purple-700">📐 Formula</p>
                                    <code className="text-sm font-mono bg-purple-500/10 px-2 py-1 rounded">
                                      {subtopic.content.formula}
                                    </code>
                                  </div>
                                )}

                                {/* Key Terms */}
                                {subtopic?.content?.keyTerms?.length > 0 && (
                                  <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 mb-3">
                                    <p className="text-sm font-medium mb-2 text-green-700">🔑 Key Terms</p>
                                    <div className="flex flex-wrap gap-2">
                                      {subtopic.content.keyTerms.map((term, termIndex) => (
                                        <span key={termIndex} className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-700">
                                          {term}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Example Problem */}
                                {subtopic?.content?.exampleProblem && (
                                  <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 mb-3">
                                    <p className="text-sm font-medium mb-1 text-orange-700">💡 Example Problem</p>
                                    <p className="text-sm text-muted-foreground">
                                      {subtopic.content.exampleProblem}
                                    </p>
                                  </div>
                                )}

                                {/* Diagram Tip */}
                                {subtopic?.content?.diagramTip && (
                                  <div className="p-3 rounded-lg bg-teal-500/5 border border-teal-500/20 mb-3">
                                    <p className="text-sm font-medium mb-1 text-teal-700">🎨 Diagram Tip</p>
                                    <p className="text-sm text-muted-foreground">
                                      {subtopic.content.diagramTip}
                                    </p>
                                  </div>
                                )}

                                {/* Common Mistakes */}
                                {subtopic?.content?.commonMistakes?.length > 0 && (
                                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 mb-3">
                                    <p className="text-sm font-medium mb-1 text-red-700">⚠️ Common Mistakes</p>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                      {subtopic.content.commonMistakes.map((mistake, mistakeIndex) => (
                                        <li key={mistakeIndex}>• {mistake}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Exam Tip */}
                                {subtopic?.content?.examTip && (
                                  <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 mb-3">
                                    <p className="text-sm font-medium mb-1 text-yellow-700">🎯 Exam Tip</p>
                                    <p className="text-sm text-muted-foreground">
                                      {subtopic.content.examTip}
                                    </p>
                                  </div>
                                )}

                                {/* Answer Format */}
                                {subtopic?.content?.answerFormat && (
                                  <div className="p-3 rounded-lg bg-pink-500/5 border border-pink-500/20">
                                    <p className="text-sm font-medium mb-1 text-pink-700">✍️ Answer Format</p>
                                    <p className="text-sm text-muted-foreground">
                                      {subtopic.content.answerFormat}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </Card>
                      ))}

                      {/* Comparative Tables */}
                      {section?.comparativeTables?.map((table, tableIndex) => (
                        <Card key={tableIndex} className="p-4 bg-background border-border">
                          <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-purple-500" />
                            {table?.title}
                          </h4>
                          {table?.examRelevance && (
                            <p className="text-sm text-muted-foreground mb-3">{table.examRelevance}</p>
                          )}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border">
                                  {table?.headers?.map((header, headerIndex) => (
                                    <th key={headerIndex} className="text-left p-2 font-semibold">{header}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table?.rows?.map((row, rowIndex) => (
                                  <tr key={rowIndex} className="border-b border-border/50">
                                    {table.headers?.map((header, cellIndex) => (
                                      <td key={cellIndex} className="p-2">{row[header]}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </Card>
                      ))}

                      {/* Important Questions */}
                      {section?.importantQuestions?.length > 0 && (
                        <Card className="p-4 bg-background border-border">
                          <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-amber-500" />
                            Important Questions
                          </h4>
                          <div className="space-y-4">
                            {section.importantQuestions.map((q, qIndex) => (
                              <div key={qIndex} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                                <p className="text-sm font-medium mb-1 text-amber-700">
                                  Q{qIndex + 1}. {q?.question} ({q?.marks} marks)
                                </p>
                                <p className="text-sm text-muted-foreground mb-2">
                                  <strong>Answer:</strong> {q?.modelAnswer}
                                </p>
                                {q?.answerStructure && (
                                  <p className="text-xs text-muted-foreground italic">
                                    Structure: {q.answerStructure}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </Card>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between px-4 pb-6 mt-6 pt-6 border-t border-border">
                      <Button 
                        variant="outline" 
                        disabled={currentSectionIndex === 0}
                        onClick={handlePreviousSection}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous Section
                      </Button>
                      <Button 
                        className="bg-gradient-to-r from-blue-500 to-purple-500"
                        disabled={currentSectionIndex === sections.length - 1}
                        onClick={handleNextSection}
                      >
                        Next Section
                        <Play className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </Card>
          )}

          {/* Formula Mode */}
          {selectedMode === "formula" && (
            <Card className="p-4 sm:p-6 bg-card/50 border-border/50">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">📐 Formula Reference Sheet</h2>
              {(!aiContent?.formulaSheets || aiContent.formulaSheets.length === 0) ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 mb-4">
                    <span className="text-3xl">📚</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Formulas Required</h3>
                  <p className="text-sm text-muted-foreground">
                    This chapter focuses on conceptual understanding and doesn't require specific formulas to memorize.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiContent.formulaSheets.map((formula, formulaIndex) => (
                    <Card key={formulaIndex} className="p-4 bg-purple-500/5 border-purple-500/20">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold">{formula?.title}</h3>
                        {formula?.mustMemorize && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-700">
                            Must Memorize
                          </span>
                        )}
                      </div>
                      
                      <code className="text-lg font-mono bg-purple-500/10 px-3 py-2 rounded block mb-3">
                        {formula?.expression}
                      </code>
                      
                      {formula?.explanation && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {formula.explanation}
                        </p>
                      )}
                      
                      {formula?.variables?.length > 0 && (
                        <>
                          <p className="text-sm text-muted-foreground mb-2 font-medium">Where:</p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            {formula.variables.map((variable, varIndex) => (
                              <li key={varIndex}>
                                • <strong>{variable?.symbol}</strong> = {variable?.meaning} ({variable?.unit})
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      
                      {formula?.howToApply && (
                        <div className="mt-3 p-2 rounded bg-blue-500/10 border border-blue-500/20">
                          <p className="text-xs font-medium text-blue-700 mb-1">How to Apply:</p>
                          <p className="text-xs text-muted-foreground">{formula.howToApply}</p>
                        </div>
                      )}
                      
                      {formula?.examTip && (
                        <div className="mt-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                          <p className="text-xs font-medium text-yellow-700 mb-1">Exam Tip:</p>
                          <p className="text-xs text-muted-foreground">{formula.examTip}</p>
                        </div>
                      )}
                      
                      {formula?.derivationRequired && (
                        <div className="mt-2">
                          <span className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-700">
                            ⚠️ Derivation may be asked
                          </span>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Practice Mode */}
          {selectedMode === "practice" && (
            <Card className="p-4 sm:p-6 bg-card/50 border-border/50">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">🎯 Practice Questions</h2>
              
              {/* Numerical Problems */}
              {aiContent?.numericalProblems?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-4">Numerical Problems</h3>
                  <div className="space-y-4">
                    {aiContent.numericalProblems.map((problem, problemIndex) => (
                      <Card key={problemIndex} className="p-4 bg-background border-border">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{problem?.topic}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            problem?.difficultyLevel === 'easy' ? 'bg-green-500/20 text-green-700' :
                            problem?.difficultyLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-700' :
                            'bg-red-500/20 text-red-700'
                          }`}>
                            {problem?.difficultyLevel}
                          </span>
                        </div>
                        
                        {problem?.formulasUsed?.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-purple-700 mb-1">Formulas Used:</p>
                            {problem.formulasUsed.map((formula, fIndex) => (
                              <code key={fIndex} className="text-sm font-mono bg-purple-500/10 px-2 py-1 rounded mr-2">
                                {formula}
                              </code>
                            ))}
                          </div>
                        )}
                        
                        {problem?.solutionSteps && (
                          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 mb-3">
                            <p className="text-sm font-medium mb-1 text-blue-700">Solution Steps:</p>
                            <p className="text-sm text-muted-foreground">{problem.solutionSteps}</p>
                          </div>
                        )}
                        
                        {problem?.commonErrors?.length > 0 && (
                          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                            <p className="text-sm font-medium mb-1 text-red-700">Common Errors to Avoid:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {problem.commonErrors.map((error, errorIndex) => (
                                <li key={errorIndex}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagrams Required */}
              {aiContent?.diagramsRequired?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-4">Important Diagrams</h3>
                  <div className="space-y-4">
                    {aiContent.diagramsRequired.map((diagram, diagramIndex) => (
                      <Card key={diagramIndex} className="p-4 bg-background border-border">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{diagram?.title}</h4>
                          {diagram?.marks && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-700">
                              {diagram.marks} marks
                            </span>
                          )}
                        </div>
                        
                        {diagram?.stepByStepDrawing && (
                          <div className="p-3 rounded-lg bg-teal-500/5 border border-teal-500/20 mb-3">
                            <p className="text-sm font-medium mb-1 text-teal-700">Drawing Steps:</p>
                            <p className="text-sm text-muted-foreground">{diagram.stepByStepDrawing}</p>
                          </div>
                        )}
                        
                        {diagram?.labelsRequired?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Required Labels:</p>
                            <div className="flex flex-wrap gap-2">
                              {diagram.labelsRequired.map((label, labelIndex) => (
                                <span key={labelIndex} className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-700">
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Answers */}
              {aiContent?.sampleAnswers?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-4">Sample Answers</h3>
                  <div className="space-y-4">
                    {aiContent.sampleAnswers.map((sample, sampleIndex) => (
                      <Card key={sampleIndex} className="p-4 bg-background border-border">
                        <div className="mb-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-700">
                            {sample?.questionType}
                          </span>
                        </div>
                        
                        <p className="font-semibold mb-3 text-base">{sample?.sampleQuestion}</p>
                        
                        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 mb-3">
                          <p className="text-sm font-medium mb-1 text-green-700">Perfect Answer:</p>
                          <p className="text-sm text-muted-foreground">{sample?.perfectAnswer}</p>
                        </div>
                        
                        {sample?.whyThisWorks && (
                          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                            <p className="text-sm font-medium mb-1 text-blue-700">Why This Works:</p>
                            <p className="text-sm text-muted-foreground">{sample.whyThisWorks}</p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Quick Revision Mode */}
          {selectedMode === "revision" && (
            <Card className="p-4 sm:p-6 bg-card/50 border-border/50">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">⚡ Quick Revision</h2>
              
              {/* Quick Revision Points */}
              {aiContent?.quickRevisionPoints?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-4">Key Points</h3>
                  <div className="space-y-2">
                    {aiContent.quickRevisionPoints.map((point, pointIndex) => (
                      <div key={pointIndex} className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                        <p className="text-sm">✓ {point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Definitions to Memorize */}
              {aiContent?.definitionsToMemorize?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-4">Must-Know Definitions</h3>
                  <div className="space-y-4">
                    {aiContent.definitionsToMemorize.map((def, defIndex) => (
                      <Card key={defIndex} className="p-4 bg-background border-border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{def?.term}</h4>
                          {def?.marks && (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-700">
                              {def.marks} marks
                            </span>
                          )}
                        </div>
                        
                        <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20 mb-2">
                          <p className="text-sm font-medium mb-1 text-indigo-700">Official Definition:</p>
                          <p className="text-sm text-muted-foreground">{def?.officialDefinition}</p>
                        </div>
                        
                        {def?.simpleVersion && (
                          <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 mb-2">
                            <p className="text-sm font-medium mb-1 text-cyan-700">In Simple Words:</p>
                            <p className="text-sm text-muted-foreground">{def.simpleVersion}</p>
                          </div>
                        )}
                        
                        {def?.writingTip && (
                          <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/20 mb-2">
                            <p className="text-xs font-medium text-yellow-700 mb-1">Writing Tip:</p>
                            <p className="text-xs text-muted-foreground">{def.writingTip}</p>
                          </div>
                        )}
                        
                        {def?.mustInclude && (
                          <div className="p-2 rounded bg-orange-500/10 border border-orange-500/20">
                            <p className="text-xs font-medium text-orange-700 mb-1">Must Include:</p>
                            <p className="text-xs text-muted-foreground">{def.mustInclude}</p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Minute Tips */}
              {aiContent?.lastMinuteTips?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-4">Last Minute Tips</h3>
                  <div className="space-y-2">
                    {aiContent.lastMinuteTips.map((tip, tipIndex) => (
                      <div key={tipIndex} className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                        <p className="text-sm">💡 {tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Clear Button */}
          <div className="mt-6">
            <Button
              onClick={()=>{}}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Start New Chapter
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentArea