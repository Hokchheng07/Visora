import { baseApi } from "./baseApi";
import { hasStorageBase, storageUrl, STORAGE_URL_VARIABLE } from "./storageUrl.js";

export const storageApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        userUpload: builder.mutation({
            query: ({ userUploadRequest }) => ({
                url: '/storage',
                method: 'POST',
                body: userUploadRequest,
            }),
            invalidatesTags: ['Storage'],
        }),
        userStorage : builder.query({
            query : ({uuid,page=0,size=25}) => ({
                url : `/storages/${uuid}?pageNumber=${page}&pageSize=${size}`,
                method : "GET",
            }),
            providesTags : ["Storage"],
        }),
    }),
});

const STORAGE_BASE = import.meta.env.VITE_STORAGE_URL;

/* Said once, at startup, because the symptom is silent: every uploaded picture
   turns into a broken-image placeholder and nothing else reports why. */
export const STORAGE_CONFIGURED = hasStorageBase(STORAGE_BASE);
if (!STORAGE_CONFIGURED) {
    console.error(`[Visora] ${STORAGE_URL_VARIABLE} is not set, so uploaded images have no address and cannot be shown. Set it where this build is made (a local .env, or the hosting project's environment) and build again.`);
}

export const getStorageUrl = (fileName) => storageUrl(STORAGE_BASE, fileName);

export const { useUserUploadMutation, useUserStorageQuery} = storageApi;
