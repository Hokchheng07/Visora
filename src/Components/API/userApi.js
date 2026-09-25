import { baseApi } from "./baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // the server counts pages from 0
    getUsers: builder.query({
      query: ({ pageNumber = 0, pageSize = 25 } = {}) => ({
        url: "/users",
        params: { pageNumber, pageSize },
      }),
      providesTags: ["Users"],
    }),
    deleteUser: builder.mutation({
      query: (uuid) => ({
        url: `/users/${uuid}`,
        method: "DELETE",
      }),
      // the users table loads again on its own after a delete
      invalidatesTags: ["Users"],
    }),
  }),
});

export const { useGetUsersQuery, useDeleteUserMutation } = userApi;
