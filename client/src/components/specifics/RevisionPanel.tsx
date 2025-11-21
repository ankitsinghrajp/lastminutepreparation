import "katex/dist/katex.min.css";
import LastNightBeforeExamSummary from "./LastNightBeforeExam/LastNightBeforeExamSummary";
import LastNightBeforeExamImportantTopics from "./LastNightBeforeExam/LastNightBeforeExamImportantTopics";
import LastNightPredictedQuestions from "./LastNightBeforeExam/LastNightPredictedQuestions";
import LastNightMcqs from "./LastNightBeforeExam/LastNightMcqs";
import LastNightMemoryBooster from "./LastNightBeforeExam/LastNightMemoryBooster";
import LastNightAiCoach from "./LastNightBeforeExam/LastNightAiCoach";


const RevisionPanel = ({ summary, importantTopics, predictedQuestion, mcqs, memoryBooster, aiCoach }) => {

  return (
    <div className="bg-background overflow-y-auto h-full">
      <div className=" space-y-4 px-0">

        {/* Chapter Summary */}
        {summary && summary.length > 0 && (
          <LastNightBeforeExamSummary summary={summary}/>
        )}

        {/* Important Topics */}
        {importantTopics && importantTopics.length > 0 && (
          <LastNightBeforeExamImportantTopics importantTopics={importantTopics}/>
        )}

        {/* Predicted Questions */}
        {predictedQuestion && predictedQuestion.length > 0 && (
          <LastNightPredictedQuestions predictedQuestion={predictedQuestion}/>
        )}

        {/* MCQs */}
        {mcqs && mcqs.length > 0 && (
           <LastNightMcqs mcqs={mcqs}/>
        )}

        {/* Memory Boosters */}
        {memoryBooster && memoryBooster.length > 0 && (
          <LastNightMemoryBooster memoryBooster={memoryBooster}/>
        )}

        {/* AI Coach */}
        {aiCoach && aiCoach.length > 0 && (
           <LastNightAiCoach aiCoach={aiCoach}/>
        )}

      </div>
    </div>
  );
};

export default RevisionPanel;