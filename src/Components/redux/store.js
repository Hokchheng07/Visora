import { configureStore } from "@reduxjs/toolkit";

export function store () {
    return configureStore({
        // Keep the store valid until feature slices are added.
        reducer: (state = {}) => state,
    })
}
