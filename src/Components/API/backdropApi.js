import { baseApi } from "./baseApi";

export const backdropApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBackdrops: builder.query({
      query: ({
        search,
        status,
        hasTimer,
        sort,
        pageNumber = 0,
        pageSize = 25,
      } = {}) => ({
        url: "/backdrops",
        method: "GET",
        params: {
          search,
          status,
          hasTimer,
          sort,
          pageNumber,
          pageSize,
        },
      }),
      providesTags: ["Backdrops"],
    }),

    getBackdropById: builder.query({
      query: ({ backdropUuid }) => ({
        url: `/backdrops/${backdropUuid}`,
        method: "GET",
      }),
      providesTags: ["Backdrops"],
    }),

    createBackdrop: builder.mutation({
      query: ({ backdropRequest }) => ({
        url: "/backdrops",
        method: "POST",
        body: backdropRequest,
      }),
      invalidatesTags: ["Backdrops"],
    }),

    updateBackdrop: builder.mutation({
      query: ({ backdropUuid, backdropRequest }) => ({
        url: `/backdrops/${backdropUuid}`,
        method: "PATCH",
        body: backdropRequest,
      }),
      invalidatesTags: ["Backdrops"],
    }),

    deleteBackdrop: builder.mutation({
      query: ({ backdropUuid }) => ({
        url: `/backdrops/${backdropUuid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Backdrops"],
    }),

    duplicateBackdrop: builder.mutation({
      query: ({ backdropUuid, duplicateBackdropRequest }) => ({
        url: `/backdrops/${backdropUuid}/duplicate`,
        method: "POST",
        body: duplicateBackdropRequest,
      }),
      invalidatesTags: ["Backdrops"],
    }),

    submitPublicationRequest: builder.mutation({
      query: ({ backdropUuid, submitTemplateRequest }) => ({
        url: `/backdrops/${backdropUuid}/templates`,
        method: "POST",
        body: submitTemplateRequest,
      }),
      invalidatesTags: ["Backdrops", "Templates"],
    }),

    withdrawPublicationRequest: builder.mutation({
      query: ({ backdropUuid }) => ({
        url: `/backdrops/${backdropUuid}/templates`,
        method: "DELETE",
      }),
      invalidatesTags: ["Backdrops", "Templates"],
    }),
  }),
});

export const {
  useGetBackdropsQuery,
  useGetBackdropByIdQuery,
  useCreateBackdropMutation,
  useUpdateBackdropMutation,
  useDeleteBackdropMutation,
  useDuplicateBackdropMutation,
  useSubmitPublicationRequestMutation,
  useWithdrawPublicationRequestMutation,
} = backdropApi;
