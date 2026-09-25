import { baseApi } from "./baseApi";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET all categories
    getCategories: builder.query({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),
      providesTags: ["Categories"],
    }),

    // CREATE category
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: "/categories",
        method: "POST",
        body: categoryData,
      }),
      invalidatesTags: ["Categories"],
    }),

    // UPDATE category
    updateCategory: builder.mutation({
      query: ({ uuid, ...categoryData }) => ({
        url: `/categories/${uuid}`,
        method: "PATCH",
        body: categoryData,
      }),
      invalidatesTags: ["Categories"],
    }),

    // DELETE category
    deleteCategory: builder.mutation({
      query: (uuid) => ({
        url: `/categories/${uuid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
