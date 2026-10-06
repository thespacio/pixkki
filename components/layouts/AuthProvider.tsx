"use client";


import { createContext, useState } from "react";
import {Props} from "next/script";
import {AuthUser} from "@/modules/auth/repository";

interface AuthProviderProps {
    children: React.ReactNode;
    initialUser: AuthUser | null;
}
export const AuthContext = createContext<{
    user: AuthUser | null;
    isAuthenticated: boolean;
    setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
} | undefined>(undefined);

export function AuthProvider({
                                 initialUser,
                                 children,
                             }: AuthProviderProps) {
    const [user, setUser] = useState(initialUser);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}