
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../API/baseApi.js";
import editorReducer from "./editorSlice.js";

export const store = configureStore({
  reducer: {
    editor: editorReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});
