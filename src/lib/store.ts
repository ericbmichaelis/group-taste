import { create } from "zustand";

type Tab = "markets" | "groups" | "leaderboard";

interface AppState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  deepLinkBetId: string | null;
  setDeepLinkBetId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: "markets",
  setActiveTab: (tab) => set({ activeTab: tab }),
  deepLinkBetId: null,
  setDeepLinkBetId: (id) => set({ deepLinkBetId: id }),
}));
