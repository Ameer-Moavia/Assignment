import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EventDTO, Paginated } from "@/types";

type EventsState = {
  list: EventDTO[];
  total: number;
  page: number;
  pageSize: number;
  status: "idle" | "loading" | "error";
};
const initialState: EventsState = {
  list: [],
  total: 0,
  page: 1,
  pageSize: 10,
  status: "idle"
};

const slice = createSlice({
  name: "events",
  initialState,
  reducers: {
    setEvents(state, action: PayloadAction<Paginated<EventDTO>>) {
      state.list = action.payload.items;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.pageSize = action.payload.pageSize;
      state.status = "idle";
    },
    setStatus(state, action: PayloadAction<EventsState["status"]>) {
      state.status = action.payload;
    }
  }
});

export const { setEvents, setStatus } = slice.actions;
export default slice.reducer;
