// inngest/route.js
import { serve } from "inngest/express";
import { inngest } from "../libs/inngest.js";
import { lastNightSummaryFn } from "./functions/last-night-summary.js";
import { lastNightImportantTopicsFn } from "./functions/last-night-importantTopics.js";
import { lastNightPredictedQuestionsFn } from "./functions/last-night-predicted-question.js";
import { lastNightMCQsFn } from "./functions/last-night-mcq.js";
import { lastNightMemoryBoosterFn } from "./functions/last-night-boosters.js";
import { lastNightAICoachFn } from "./functions/last-night-aiCoach.js";
import { smartChapterSummaryFn } from "./functions/chapter-wise-summary.js";
import { chapterWiseShortNotesFn } from "./functions/chapter-wise-shortNotes.js";
import { chapterWiseMindMapFn } from "./functions/chapter-wise-mindMap.js";
import { chapterWiseStudyQuestionsFn } from "./functions/chapter-wise-studyQuestions.js";
import { importantQuestionGeneratorFn } from "./functions/important-question-feature.js";
export const inngestHandler = serve({
  client: inngest,
  functions: [
    lastNightSummaryFn,
    lastNightImportantTopicsFn,
    lastNightPredictedQuestionsFn,
    lastNightMCQsFn,
    lastNightMemoryBoosterFn,
    lastNightAICoachFn,
    smartChapterSummaryFn,
    chapterWiseShortNotesFn,
    chapterWiseMindMapFn,
    chapterWiseStudyQuestionsFn,
    importantQuestionGeneratorFn,
  ],
});
