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
        }),
        userForgotPassword: builder.mutation({
            query: ({ email }) => ({
                url: "/auth/forgot-password",
                method : "POST",
                body: { email },
            }),
        }),
        resetPassword: builder.mutation({
            query: ({ token, newPassword, confirmPassword }) => ({
                url: `/auth/reset-password?token=${encodeURIComponent(token)}`,
                method: "POST",
                body: { token, newPassword, confirmPassword },
            }),
        }),
        verifyEmail : builder.mutation({
            query : ({token}) => ({
                url : `/auth/verify-email?token=${encodeURIComponent(token)}`,
                method : "POST",
            })
        })
    })
})
export const {
    useUserLoginMutation,
    useUserRegisterMutation,
    useUserForgotPasswordMutation,
    useResetPasswordMutation,
} = authApi;
