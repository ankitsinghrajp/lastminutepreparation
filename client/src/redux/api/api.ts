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

} = api;
