import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {server} from "../../constants"

const api = createApi({
    reducerPath:"api",
    baseQuery: fetchBaseQuery({
        baseUrl: `${server}/api/v1/`,
    }),
    tagTypes:[],
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data)=>({
                url:"user/register",
                method:"post",
                credentials:"include",
                body:data
            }),
        }),
    })
})

export default api;

export const {
   useLoginMutation
} = api;
