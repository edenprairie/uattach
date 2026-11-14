"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '@/app/actions';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<User | null>;
    logout: () => void;
    setUser: (user: User | null) => void;
    createUser: (user: User) => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let active = true;
        getCurrentUser()
            .then((currentUser) => { if (active) setUser(currentUser as User | null); })
            .catch((error) => { console.error('Failed to restore session', error); })
            .finally(() => { if (active) setIsLoading(false); });
        return () => { active = false; };
    }, []);

    const login = useCallback(async (username: string, password: string): Promise<User | null> => {
        try {
            const dbUser = await loginUser(username, password);
            if (!dbUser) return null;
            const appUser: User = {
                id: dbUser.id,
                username: dbUser.username,
                email: dbUser.email || undefined,
                role: dbUser.role as User['role'],
            };
            setUser(appUser);
            return appUser;
        } catch (error) {
            console.error('Login failed', error);
            return null;
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        void logoutUser().catch((error) => console.error('Sign out failed', error));
        router.push('/login');
    }, [router]);

    const createUser = useCallback(async (newUser: User) => {
        if (!newUser.password) throw new Error('Password is required');
        try {
            await registerUser({
                username: newUser.username,
                email: newUser.email,
                password: newUser.password,
                role: newUser.role,
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to create user';
            throw new Error(message);
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            logout,
            setUser,
            createUser,
            isAuthenticated: !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
