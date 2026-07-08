"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import type {
    AuthenticatedUser,
} from "@/modules/auth/types";

type AuthContextValue = {

    user: AuthenticatedUser | null;

    loading: boolean;

    isAuthenticated: boolean;

    refresh: () => Promise<void>;

};

const AuthContext =
    createContext<AuthContextValue | null>(null);

export function AuthProvider({
                                 children,
                                 initialUser,
                             }: {
    children: React.ReactNode;
    initialUser: AuthenticatedUser | null;
}) {

    const [user, setUser] =
        useState(initialUser);

    const [loading, setLoading] =
        useState(false);



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
                loading,
                isAuthenticated: !!user,
                refresh,
            }}
        >
            {children}
        </AuthContext.Provider>
    );

}

export function useAuth() {

    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within AuthProvider"
        );
    }

    return context;

}