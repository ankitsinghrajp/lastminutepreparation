import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {server} from "../../constants"

const api = createApi({
    reducerPath:"api",
    baseQuery: fetchBaseQuery({
        baseUrl: `${server}/api/v1/`,
        prepareHeaders: (headers) => {
        headers.set("Content-Type", "application/json");
        return headers;
    }
    }),
    tagTypes:[],
    endpoints: (builder) => ({
        register: builder.mutation({
            query: (data)=>({
                url:"user/register",
                method:"post",
                credentials:"include",
                body:data
            }),
        }),
        login: builder.mutation({
           query: (data)=>({
            url:"user/login",
            method:"post",
            credentials:"include",
            body:data
           }) 
        }),
        logout: builder.mutation({
           query: ()=>({
            url:"user/logout",
            method:"post",
            credentials:"include"
           })
        }),
        refreshToken: builder.mutation({
            query:()=>({
              url:"user/refresh-token",
              method:"post",
              credentials:"include"  
            })
        }),
        verifyEmail: builder.query({
            query: ({id,token})=>({
                url: `user/verify-email?token=${token}&id=${id}`,
                credentials:"include"
            })
        }),
        resendEmail: builder.query({
            query: ()=>({
                url:"user/resend-email",
                credentials:"include" 
            })
        }),
        checkExpiry: builder.mutation({
            query:()=>({
                url:"user/check-plan-expiry",
                method:"post",
                credentials:"include"
            })
        }),
        summarizer: builder.mutation({
            query: (data)=>({
                url:"ai/summarizer",
                method:"post",
                credentials:"include",
                body:data
            })
        }),

        chatWithPDF: builder.mutation({
            query: (data)=>({
                url:"ai/chat-with-pdf",
                method:"post",
                credentials:"include",
                body:data
            })
        }),

        // Last minute preparation apis
        getClassName: builder.query({
            query:()=>({
               url:"info/classes",
               credentials:"include"
            })
        }),

        getSubjects: builder.query({
            query:({selectedClass})=>({
                url:`info/subjects/${selectedClass}`,
                credentials:"include"
            }),
            keepUnusedDataFor:0,
            refetchOnMountOrArgChange:true
        }),
        getChapters: builder.query({
            query:({selectedClass,selectedSubject})=>({
                url:`info/chapters/${selectedClass}/${selectedSubject}`,
                credentials:"include"
            }),
            keepUnusedDataFor:0,
            refetchOnMountOrArgChange:true
        }),

        // Last Night Before Exam APIs
        getLastNightSummary: builder.mutation({
          query:({className,subject, chapter, index})=>({
            url:"ai/last-night-before-exam/summary",
            method:"post",
            credentials:"include",
            body:{className,subject,chapter,index}
          })  
        }),

        getLastNightImportantTopics: builder.mutation({
          query:({className,subject, chapter, index})=>({
            url:"ai/last-night-before-exam/important-topics",
            method:"post",
            credentials:"include",
            body:{className,subject,chapter,index}
          })  
        }),

        getLastNightQuickShots: builder.mutation({
          query:({className,subject, chapter, index})=>({
            url:"ai/last-night-before-exam/quick-shots",
            method:"post",
            credentials:"include",
            body:{className,subject,chapter,index}
          })  
        }),

        getLastNightPredictedQuestions: builder.mutation({
          query:({className,subject, chapter, index})=>({
            url:"ai/last-night-before-exam/predicted-questions",
            method:"post",
            credentials:"include",
            body:{className,subject,chapter,index}
          })  
        }),

        getLastNightMcqs: builder.mutation({
          query:({className,subject, chapter, index})=>({
            url:"ai/last-night-before-exam/mcqs",
            method:"post",
            credentials:"include",
            body:{className,subject,chapter,index}
          })  
        }),

        getLastNightMemoryBooster: builder.mutation({
          query:({className,subject, chapter, index})=>({
            url:"ai/last-night-before-exam/memory-booster",
            method:"post",
            credentials:"include",
            body:{className,subject,chapter,index}
          })  
        }),

        getLastNightAiCoach: builder.mutation({
          query:({className,subject, chapter, index})=>({
            url:"ai/last-night-before-exam/ai-coach",
            method:"post",
            credentials:"include",
            body:{className,subject,chapter,index}
          })  
        }),

        //Topper style answer api
        topperStyle: builder.mutation({
          query:({user_question})=>({
            url:"ai/topper-style-answer",
            method:"post",
            credentials:"include",
            body:{user_question}
          })  
        }),

        // Chapter Wise Study
        getChapterWiseSummary: builder.mutation({
          query:({className,subject, chapter, index})=>({
            url:"ai/chapter-wise-study/summary",
            method:"post",
            credentials:"include",
            body:{className,subject,chapter,index}
          }) 
        }),
        
        getChapterWiseShortNotes: builder.mutation({
          query:({className,subject, chapter, index})=>({
            url:"ai/chapter-wise-study/short-notes",
            method:"post",
            credentials:"include",
            body:{className,subject,chapter,index}
          }) 
        }),

        getChapterWiseMindMap: builder.mutation({
          query:({className,subject, chapter, index})=>({
            url:"ai/chapter-wise-study/mind-map",
            method:"post",
            credentials:"include",
            body:{className,subject,chapter,index}
          }) 
        }),

        getChapterWiseImportantQuestion: builder.mutation({
          query:({className,subject, chapter, index})=>({
            url:"ai/chapter-wise-study/important-questions",
            method:"post",
            credentials:"include",
            body:{className,subject,chapter,index}
          }) 
        }),

        getChapterWiseKeySheet: builder.mutation({
          query:({className,subject, chapter, index})=>({
            url:"ai/chapter-wise-study/key-sheet",
            method:"post",
            credentials:"include",
            body:{className,subject,chapter,index}
          }) 
        }),





        importantQuestionGenerator: builder.mutation({
            query:({className,subject, chapter, index})=>({
                url:"ai/important-question-generator",
                method:"post",
                credentials:"include",
                body:{className, subject, chapter, index}
            })
        }),
        QuizGenerator: builder.mutation({
            query:({className,subject, chapter, index})=>({
                url:"ai/quiz-fillups",
                method:"post",
                credentials:"include",
                body:{className, subject, chapter, index}
            })
        }),
        
        PyqsGenerator: builder.mutation({
            query:({className,subject, chapter, year})=>({
                url:"ai/get-pyqs",
                method:"post",
                credentials:"include",
                body:{className, subject, chapter, year}
            })
        }),

        askAny: builder.mutation({
            query:({question})=>({
                url:"ai/ask-any",
                method:"post",
                credentials:"include",
                body:{question}
            })
        }),

        

    })
})

export default api;

export const {
   useRegisterMutation,
   useLoginMutation,
   useLogoutMutation,
   useSummarizerMutation,
   useRefreshTokenMutation,
   useVerifyEmailQuery,
   useLazyResendEmailQuery,
   useGetClassNameQuery,
   useLazyGetSubjectsQuery,
   useLazyGetChaptersQuery,
   useImportantQuestionGeneratorMutation,
   useQuizGeneratorMutation,
   useAskAnyMutation,
   useCheckExpiryMutation,
   useChatWithPDFMutation,

   // Last Night Before Exam Apis
   useGetLastNightSummaryMutation,
   useGetLastNightAiCoachMutation,
   useGetLastNightPredictedQuestionsMutation,
   useGetLastNightImportantTopicsMutation,
   useGetLastNightMcqsMutation,
   useGetLastNightMemoryBoosterMutation,
   useGetLastNightQuickShotsMutation,

   // Topper
   useTopperStyleMutation,

   // Chapter Wise Study Apis
  useGetChapterWiseSummaryMutation,
  useGetChapterWiseShortNotesMutation,
  useGetChapterWiseMindMapMutation,
  useGetChapterWiseImportantQuestionMutation,
  useGetChapterWiseKeySheetMutation,

  // Year wise pyqs generator
  usePyqsGeneratorMutation,



} = api;

