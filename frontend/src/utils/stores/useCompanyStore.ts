import { create } from "zustand";
import { persist } from "zustand/middleware";

type CompanyType = {
  company: any | null;
  setCompany: (company: any) => void;
  clearCompany: () => void;
};
export const useCompanyStore = create<CompanyType>()(
  persist(
    (set) => ({
      company: null,
      setCompany: (company) => set({ company }),
      clearCompany: () => set({ company: null }),
    }),
    {
      name: "company-storage", // key in localStorage
    }
  )
);