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
                             }: {
    children: React.ReactNode;
    initialUser: AuthenticatedUser | null;
}) {

    const [user, setUser] =
        useState(initialUser);

    const [loading, setLoading] =
        useState(false);

    useEffect(() => {
        setUser(initialUser);
    }, [initialUser]);



    async function refresh() {
        setLoading(true);
        try {
            const response = await fetch(
                "/api/auth/me",
                {
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                setUser(null);
                return;
            }

            const data =
                await response.json();

            setUser(data);

        } finally {
            setLoading(false);
        }

    }

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