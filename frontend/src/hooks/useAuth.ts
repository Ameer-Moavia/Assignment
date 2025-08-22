"use client";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state/redux/store";
import { clearUser, setUser } from "@/state/redux/userSlice";
import api from "@/lib/api/axios";

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user.user);

  async function me() {
    try {
      const { data } = await api.get("/auth/me");
      dispatch(setUser(data));
    } catch {
      dispatch(clearUser());
    }
  }

  async function logout() {
    await api.post("/auth/logout");
    dispatch(clearUser());
  }

  return { user, me, logout };
}
