import { baseApi } from "./baseApi";

export const templateApi = baseApi.injectEndpoints({
    endpoints : (builder) => ({
        getTemplates : builder.query({
            query : ({
                search,
                status,
                templateStatus,
                hasTimer,
                sort,
                pageNumber = 0,
                pageSize = 25,
            } = {}) => ({
                url : '/templates',
                method : 'GET',
                params : {
                    search,
                    status,
                    templateStatus,
                    hasTimer,
                    sort,
                    pageNumber,
                    pageSize,
                }
            }),
            providesTags : ['Templates']
        }),
        getAllTemplates : builder.query({
            query : ({
                search,
                status,
                templateStatus,
                hasTimer,
                sort,
                pageNumber = 0,
                pageSize = 25,
            } = {}) => ({
                url : '/templates/admin',
                method : 'GET',
                params : {
                    search,
                    status,
                    templateStatus,
                    hasTimer,
                    sort,
                    pageNumber,
                    pageSize,
                }
            }),
            providesTags : ['Templates']
        }),
        getTemplateById : builder.query({
            query : ({templateUuid}) => ({
                url : `/templates/${templateUuid}`,
                method : 'GET'
            }),
            providesTags : ['Templates']
        }),
        postTemplate : builder.mutation({
            query : ({userPostTemplateRequest}) => ({
                url : '/templates',
                method : 'POST',
                body : userPostTemplateRequest
            }),
            invalidatesTags : ['Templates']
        }),
        updateTemplate : builder.mutation({
            query : ({templateUuid, userUpdateTemplateRequest}) => ({
                url : `/templates/${templateUuid}`,
                method : 'PATCH',
                body : userUpdateTemplateRequest
            }),
            invalidatesTags : ['Templates']
        }),
        deleteTemplate : builder.mutation({
            query : ({templateUuid}) => ({
                url : `/templates/${templateUuid}`,
                method : 'DELETE'
            }),
            invalidatesTags : ['Templates']
        }),
        duplicateTemplate : builder.mutation({
            query : ({templateUuid, userDuplicateTemplateRequest}) => ({
                url : `/templates/${templateUuid}/duplicate`,
                method : 'POST',
                body : userDuplicateTemplateRequest
            }),
            invalidatesTags : ['Templates']
        }),
        approveTemplate : builder.mutation({
            query : ({templateUuid}) => ({
                url : `/templates/${templateUuid}/approve`,
                method : 'POST'
            }),
            invalidatesTags : ['Templates']
        }),
        rejectTemplate : builder.mutation({
            query : ({templateUuid}) => ({
                url : `/templates/${templateUuid}/reject`,
                method : 'POST'
            }),
            invalidatesTags : ['Templates']
        })
    })
})

export const {
    useGetTemplatesQuery,
    useGetAllTemplatesQuery,
    useGetTemplateByIdQuery,
    usePostTemplateMutation,
    useUpdateTemplateMutation,
    useDeleteTemplateMutation,
    useDuplicateTemplateMutation,
    useApproveTemplateMutation,
    useRejectTemplateMutation,
} = templateApi;
