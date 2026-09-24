import { baseApi } from "./baseApi";

export const publicationApi = baseApi.injectEndpoints({
    endpoints : (builder) => ({
        userPostPublication : builder.mutation({
            query : ({userPublicationPostRequest}) => ({    
                url : '',
                method : 'POST',
                body : userPublicationPostRequest
            })
        })
    })
})