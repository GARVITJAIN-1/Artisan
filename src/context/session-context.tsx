"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

const SESSION_KEY = "artisan_session";

interface Session {
  isLoggedIn: boolean;
  username: string | null;
}

interface SessionContextType {
  session: Session;
  loading: boolean;
  login: (username: string) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({
    isLoggedIn: false,
    username: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        setSession(JSON.parse(savedSession));
      }
    } catch (e) {
      console.error("Failed to parse session from localStorage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (username: string) => {
    const newSession = { isLoggedIn: true, username };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    } catch (e) {
      console.error("Failed to save session to localStorage", e);
    }
    setSession(newSession);
  };

  const logout = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error("Failed to remove session from localStorage", e);
    }
    setSession({ isLoggedIn: false, username: null });
  };

  return (
    <SessionContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
