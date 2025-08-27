import { create } from "zustand";
import { persist } from "zustand/middleware";

type EventType = {
  events: any | null;
  setEvents: (event: any) => void;
};

export const useEventStore: any = create<EventType>()(
    persist(
        (set: any) => ({
        events: null,
        setEvents: (events) => set({ events }),
        }),
        {
        name: "event-storage",
        }
    )
);