"use client";

<<<<<<< HEAD
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
=======

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
>>>>>>> origin/main

    return (
        <AuthContext.Provider
            value={{
                user,
<<<<<<< HEAD
                loading,
                isAuthenticated: !!user,
                refresh,
=======
                isAuthenticated: user !== null,
                setUser,
>>>>>>> origin/main
            }}
        >
            {children}
        </AuthContext.Provider>
    );
<<<<<<< HEAD

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

=======
>>>>>>> origin/main
}