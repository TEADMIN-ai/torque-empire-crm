"use client";

import {
  User,
  getIdTokenResult,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { auth } from "@/lib/firebase";

export type UserRole = "admin" | "staff" | "contractor";

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const parseUserRole = (rawRole: unknown): UserRole => {
  if (rawRole === "admin" || rawRole === "staff" || rawRole === "contractor") {
    return rawRole;
  }

  return "staff";
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const tokenResult = await getIdTokenResult(nextUser);
        setRole(parseUserRole(tokenResult.claims.role));
      } catch {
        setRole("staff");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, role, loading, logout }),
    [loading, logout, role, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
