import { createSlice } from "@reduxjs/toolkit";

// The access token lives only in memory, so a page reload clears it. The refresh
// token survives in sessionStorage; starting from it lets the app know the user
// is still signed in, and the first request refreshes the access token.
const initialState = {
    accessToken : "",
    refreshToken : typeof window !== "undefined" ? sessionStorage.getItem("refreshToken") || "" : ""
}
export const authSlice = createSlice({
    name : "auth",
    initialState,
    reducers : {
        setAccessToken : (state, action) => {
            state.accessToken = action.payload;
        },
        setRefreshToken : (state,action) => {
            state.refreshToken = action.payload;
        },
        setLogout : (state) =>{
            state.accessToken = "";
            state.refreshToken = "";
            sessionStorage.removeItem('refreshToken');
        },
    },
});
export const { setAccessToken, setLogout,setRefreshToken } = authSlice.actions;
export default authSlice.reducer;