import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {server} from "../../constants"

const api = createApi({
    reducerPath:"api",
    baseQuery: fetchBaseQuery({
        baseUrl: `${server}/api/v1/`,
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
        summarizer: builder.mutation({
            query: (data)=>({
                url:"ai/summarizer",
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
            })
        }),
        getChapters: builder.query({
            query:({selectedClass,selectedSubject})=>({
                url:`info/chapters/${selectedClass}/${selectedSubject}`,
                credentials:"include"
            })
        })
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
   useGetSubjectsQuery,
   useLazyGetChaptersQuery,
} = api;
