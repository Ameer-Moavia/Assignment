import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserType = {
  user: any | null;
  setUser: (user: any) => void;
  clearUser: () => void;
};

export const useUserStore: any = create<UserType>()(
  persist(
    (set: any) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage", // key in localStorage
    }
  )
);
