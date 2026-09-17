import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    accessToken : "",
    refreshToken : ""
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