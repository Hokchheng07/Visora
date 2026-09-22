import { baseApi } from "./baseApi";

export const storageApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        userUpload: builder.mutation({
            query: ({ userUploadRequest }) => ({
                url: '/storage',
                method: 'POST',
                body: userUploadRequest,
            }),
        }),
    }),
});

export const getStorageUrl = (fileName) =>
    `${import.meta.env.VITE_STORAGE_URL}/${fileName}`;

export const { useUserUploadMutation } = storageApi;
