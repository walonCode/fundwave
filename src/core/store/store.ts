"use client"

import { configureStore } from "@reduxjs/toolkit"
import campaignReducer from "@/core/store/features/campaigns/campaignSlice"
import commentReducer from "@/core/store/features/comments/commentSlice"
import userReducer from "@/core/store/features/user/userSlice"

export const store = configureStore({
    reducer:{
        campaign:campaignReducer,
        comment:commentReducer,
        user:userReducer
    }
})

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch