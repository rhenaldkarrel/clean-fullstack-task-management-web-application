import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthSessionState = {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  clearSession: () => void;
};

export const useAuthSessionStore = create<AuthSessionState>()(
  persist(
    (set) => ({
      accessToken: null,
      setAccessToken: (accessToken) => set({ accessToken }),
      clearSession: () => set({ accessToken: null })
    }),
    {
      name: "task-app-auth-session",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
