
import { baseApi } from "./baseApi";

export const backdropApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBackdrops: builder.query({
      query: () => ({
        url: "/backdrops",
        method: "GET",
      }),
    }),

    getBackdropById: builder.query({
      query: ({ backdropUuid }) => ({
        url: `/backdrops/${backdropUuid}`,
        method: "GET",
      }),
    }),

    createBackdrop: builder.mutation({
      query: ({ backdropRequest }) => ({
        url: "/backdrops",
        method: "POST",
        body: backdropRequest,
      }),
    }),

    updateBackdrop: builder.mutation({
      query: ({ backdropUuid, backdropRequest }) => ({
        url: `/backdrops/${backdropUuid}`,
        method: "PATCH",
        body: backdropRequest,
      }),
    }),

    deleteBackdrop: builder.mutation({
      query: ({ backdropUuid }) => ({
        url: `/backdrops/${backdropUuid}`,
        method: "DELETE",
      }),
    }),

    duplicateBackdrop: builder.mutation({
      query: ({ backdropUuid }) => ({
        url: `/backdrops/${backdropUuid}/duplicate`,
        method: "POST",
      }),
    }),

    submitPublicationRequest: builder.mutation({
      query: ({ backdropUuid }) => ({
        url: `/backdrops/${backdropUuid}/publication-requests`,
        method: "POST",
      }),
    }),

    withdrawPublicationRequest: builder.mutation({
      query: ({ backdropUuid }) => ({
        url: `/backdrops/${backdropUuid}/publication-requests`,
        method: "DELETE",
      }),
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