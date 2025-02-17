import { configureStore } from "@reduxjs/toolkit";
import { repositoriesReducer, repositoriesSlice } from "./reposSlice";

export const store = configureStore({
  reducer: {
    [repositoriesSlice.name]: repositoriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
