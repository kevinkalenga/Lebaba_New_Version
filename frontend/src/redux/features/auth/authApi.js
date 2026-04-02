import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getBaseUrl } from "../../../utils/baseURL"


const authApi = createApi({
   reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getBaseUrl()}/api/auth`,
        credentials: 'include',
    }),
     tagTypes: ["User"],
    // mutation if you want to push something in the backend and query if you want to get something in the backend
      endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (newUser) => ({
                url: "/register",
                method: "POST",
                body: newUser
            })
        }),

        loginUser: builder.mutation({
            query: (credentials) => ({
                url: "/login",
                method: "POST",
                body: credentials
            })
        }),
      })
})


export const {
    useRegisterUserMutation,
    useLoginUserMutation,
   
} = authApi;

export default authApi