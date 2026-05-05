import { create } from "zustand";

interface AuthUser { email: string; name: string }
interface AuthState {
  user: AuthUser | null;
  login: (u: AuthUser) => void;
  logout: () => void;
}
export const useAuth = create<AuthState>((set) => ({
  user: { email: "demo@billing.app", name: "Demo User" },
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
