import React, { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

export type AuthRole = "patient" | "hospital" | "pharmacist" | "coordinator" | "admin" | "doctor";
export type AuthUserType = "patient" | "staff" | "doctor";

export interface ActiveUser {
  id: string;
  openId: string;
  name: string;
  email?: string;
  role: AuthRole;
  userType: AuthUserType;
  hospitalName?: string;
  employeeId?: string;
  specialization?: string;
  registrationNumber?: string;
  patientAllergies?: string[];
  patientConditions?: string[];
}

interface AuthContextType {
  currentUser: ActiveUser | null;
  isAuthenticated: boolean;
  loginAs: (user: Partial<ActiveUser> & { name: string; role: AuthRole; userType: AuthUserType }) => void;
  logout: () => void;
}

const STORAGE_KEY = "medrisq_auth_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<ActiveUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const utils = trpc.useUtils();

  const loginAs = (user: Partial<ActiveUser> & { name: string; role: AuthRole; userType: AuthUserType }) => {
    const active: ActiveUser = {
      id: user.id || `${user.userType}-${Date.now()}`,
      openId: user.openId || `${user.userType}-${user.role}-${Date.now().toString(36)}`,
      name: user.name,
      email: user.email || `${user.role}@saintelara.org`,
      role: user.role,
      userType: user.userType,
      hospitalName: user.hospitalName || "Saint Elara Medical Centre",
      employeeId: user.employeeId || (user.userType === "staff" ? "EMP-2024-0456" : undefined),
      specialization: user.specialization,
      registrationNumber: user.registrationNumber,
      patientAllergies: user.patientAllergies || [],
      patientConditions: user.patientConditions || [],
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
    } catch {}
    setCurrentUser(active);
    utils.auth.me.invalidate();
    utils.portal.snapshot.invalidate();
    utils.demo.snapshot.invalidate();
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem("manus-cookie");
    } catch {}
    setCurrentUser(null);
    utils.auth.me.invalidate();
    utils.portal.snapshot.invalidate();
    utils.demo.snapshot.invalidate();
  };

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      } catch {}
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        loginAs,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthUser() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthUser must be used within an AuthProvider");
  }
  return ctx;
}
