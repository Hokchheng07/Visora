import {baseApi}from "./baseApi";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    userProfile: builder.query({
      query: () => `/users/me`,
      providesTags: ["Profile"],
    }),
    updateUserProfile: builder.mutation({
      query: ({ uuid, userUpdateRequest }) => ({
        url: `/users/${uuid}`,
        method: "PUT",
        body: userUpdateRequest,
      }),
      // after a save, /users/me is fetched again on its own
      invalidatesTags: ["Profile"],
    }),
  }),
});
export const { useUserProfileQuery, useUpdateUserProfileMutation } = profileApi;
