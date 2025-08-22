import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import eventsReducer from "./eventsSlice";

export const store = configureStore({
  reducer: { user: userReducer, events: eventsReducer },
  devTools: process.env.NODE_ENV !== "production"
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
