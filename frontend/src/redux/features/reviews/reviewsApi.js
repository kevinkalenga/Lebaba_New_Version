import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getBaseUrl } from '../../../utils/baseURL';

export const reviewApi = createApi({
    reducerPath: 'reviewApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getBaseUrl()}/api/reviews`,
        credentials: 'include',
    }),
    tagTypes: ["Reviews"],
    endpoints: (builder) => ({
        postReview: builder.mutation({
            query: (reviewData) => ({
                url: "/post-review",
                method: "POST",
                body: reviewData
            }),
            invalidatesTags: (result, error, { productId }) => [
               { type: "Reviews", id: productId },
               { type: "Products", id: productId }
            ]
            // invalidatesTags: (result, error, { postId }) => [{ type: "Reviews", id: postId }]
        }),
        getReviewsCount: builder.query({
            query: () => ({
                url: "/total-review"
            })
        }),
        getReviewsByUserId: builder.query({
            query: (userId) => ({
                url: `/${userId}`
            }),
             providesTags: (result, error, userId) => [
               { type: "Reviews", id: userId }
            ]
            // providesTags: (result) => result ? [{ type: "Reviews", id: result[0]?.email }] : []
        })
    })
})

export const { usePostReviewMutation, useGetReviewsCountQuery, useGetReviewsByUserIdQuery } = reviewApi;

export default reviewApi;