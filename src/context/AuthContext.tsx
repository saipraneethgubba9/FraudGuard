import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  theme: "light" | "dark";
  login: (user: User) => void;
  logout: () => void;
  updateLanguage: (lang: string) => void;
  updateProfile: (data: { name: string; phone?: string; location?: string }) => Promise<void>;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const login = (userData: User) => setUser(userData);
  const logout = () => {
    fetch("/api/auth/logout", { method: "POST" }).then(() => setUser(null));
  };
  const updateLanguage = (lang: string) => {
    if (user) {
      setUser({ ...user, language: lang });
      fetch("/api/users/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang }),
      });
    }
  };

  const updateProfile = async (data: { name: string; phone?: string; location?: string }) => {
    if (user) {
      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setUser({ ...user, ...data });
      }
    }
  };

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

  return (
    <AuthContext.Provider value={{ user, loading, theme, login, logout, updateLanguage, updateProfile, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
