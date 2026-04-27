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

        logoutUser: builder.mutation({
            query: () => ({
                url: "/logout",
                method: "POST",

            }),

        }),


        forgotPassword: builder.mutation({
            query: ({email}) => ({
                url: "/forgot-password",
                method: "POST",
                body:  {email} 
            })
        }),

        resetPassword: builder.mutation({
                query: ({ token, password }) => ({
                    url: `/reset-password/${token}`,
                    method: "POST",
                    body: { password }
                })
        }),

        getUser: builder.query({
            query: () => ({
                url: "/users",
                method: "GET"
            }),
            refetchOnMount: true,
            invalidatesTags: ["User"],
        }),
        deleteUser: builder.mutation({
            query: (userId) => ({
                url: `/users/${userId}`,
                method: "DELETE",

            }),
            invalidatesTags: ["User"],
        }),
        updateUserRole: builder.mutation({
            query: ({ userId, role }) => ({
                url: `/users/${userId}`,
                method: "PUT",
                body: { role }
            }),
            refetchOnMount: true,
            invalidatesTags: ["User"],
        }),
        editProfile: builder.mutation({
            query: (profileData) => ({
                url: `/edit-profile`,
                method: 'PATCH',
                body: profileData
            })
        }),
       
      })
})


export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useGetUserQuery,
    useDeleteUserMutation,
    useUpdateUserRoleMutation,
    useEditProfileMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation
   
} = authApi;

export default authApi