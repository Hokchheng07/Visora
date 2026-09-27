import { baseApi } from "./baseApi";

export const favoriteApi = baseApi.injectEndpoints({
    endpoints : (builder) => ({
        getFavorites : builder.query({
            query : ({
                type,
                sort,
                pageNumber = 0,
                pageSize = 25,
            } = {}) => ({
                url : '/favorites',
                method : 'GET',
                params : {
                    type,
                    sort,
                    pageNumber,
                    pageSize,
                }
            }),
            providesTags : ['Favorites']
        }),
        getFavoriteById : builder.query({
            query : ({favoriteUuid}) => ({
                url : `/favorites/${favoriteUuid}`,
                method : 'GET'
            }),
            providesTags : ['Favorites']
        }),
        addFavorite : builder.mutation({
            query : ({userFavoriteRequest}) => ({
                url : '/favorites',
                method : 'POST',
                body : userFavoriteRequest
            }),
            invalidatesTags : ['Favorites']
        }),
        removeFavorite : builder.mutation({
            query : ({favoriteUuid}) => ({
                url : `/favorites/${favoriteUuid}`,
                method : 'DELETE'
            }),
            invalidatesTags : ['Favorites']
        })
    })
})

export const {
    useGetFavoritesQuery,
    useGetFavoriteByIdQuery,
    useAddFavoriteMutation,
    useRemoveFavoriteMutation,
} = favoriteApi;
