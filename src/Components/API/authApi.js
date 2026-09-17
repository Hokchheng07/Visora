import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
    endpoints : (builder) => ({
        userLogin : builder.mutation({
            query: ({userLoginRequest}) => ({
                url:'/auth/login',
                method : 'POST',
                body: userLoginRequest
            })
        }),
        userRegister : builder.mutation({
            query: ({userRegisterRequest}) => ({
                url:'/auth/register',
                method : 'POST',
                body : userRegisterRequest
            })
        })
    })
})
export const {
    useUserLoginMutation,
    useUserRegisterMutation
} = authApi