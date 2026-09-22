import {baseApi}from "./baseApi";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    userProfile: builder.query({
      query: () => `/users/me`,
      // lets a future "update profile" mutation refresh this with invalidatesTags: ["Profile"]
      providesTags: ["Profile"],
    }),
  }),
});
export const { useUserProfileQuery } = profileApi;
