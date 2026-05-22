import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PublicUser } from "../types/auth-api-types";

type AuthSessionState = {
  accessToken: string | null;
  currentUser: PublicUser | null;
  setSession: (params: { accessToken: string; user: PublicUser }) => void;
  setCurrentUser: (user: PublicUser | null) => void;
  clearSession: () => void;
};

export const useAuthSessionStore = create<AuthSessionState>()(
  persist(
    (set) => ({
      accessToken: null,
      currentUser: null,
      setSession: ({ accessToken, user }) =>
        set({ accessToken, currentUser: user }),
      setCurrentUser: (currentUser) => set({ currentUser }),
      clearSession: () => set({ accessToken: null, currentUser: null })
    }),
    {
      name: "task-app-auth-session",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
