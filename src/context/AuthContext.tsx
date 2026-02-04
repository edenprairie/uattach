"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser } from '@/app/actions';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    setUser: (user: User | null) => void;
    createUser: (user: User) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    // Check localStorage on mount for PERSISTED SESSION only
    useEffect(() => {
        const savedUser = localStorage.getItem('uattach-user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const dbUser = await loginUser(username, password);

            if (dbUser) {
                const appUser: User = {
                    id: dbUser.id,
                    username: dbUser.username,
                    email: dbUser.email || undefined,
                    role: dbUser.role as User['role'],
                };

                setUser(appUser);
                localStorage.setItem('uattach-user', JSON.stringify(appUser));
                return true;
            }
        } catch (error) {
            console.error('Login failed', error);
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('uattach-user');
        router.push('/login');
    };

    const createUser = async (newUser: User) => {
        try {
            await registerUser({
                username: newUser.username,
                email: newUser.email,
                password: newUser.password,
                role: newUser.role
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create user');
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            setUser,
            createUser,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
