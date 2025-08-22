import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserDTO } from "@/types";

type UserState = {
  user: UserDTO | null;
  loading: boolean;
};
const initialState: UserState = { user: null, loading: false };

const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserDTO | null>) { state.user = action.payload; },
    setLoading(state, action: PayloadAction<boolean>) { state.loading = action.payload; },
    clearUser(state) { state.user = null; }
  }
});

export const { setUser, setLoading, clearUser } = slice.actions;
export default slice.reducer;
