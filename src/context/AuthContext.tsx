"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

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

    // Check localStorage on mount and seed if empty
    useEffect(() => {
        const savedUser = localStorage.getItem('uattach-user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        // Seed users or repair default users
        const storedUsers = localStorage.getItem('uattach-users');
        let users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
        let updated = false;

        const defaults = [
            {
                id: 'admin-user-001',
                username: 'admin',
                email: 'admin@uattach.com',
                password: 'Admin#987',
                role: 'admin' as const
            },
            {
                id: 'demo-user-001',
                username: 'demo',
                email: 'demo@uattach.com',
                password: 'Demo#123',
                role: 'user' as const
            }
        ];

        // Ensure defaults exist and have correct credentials
        defaults.forEach(def => {
            const index = users.findIndex(u => u.id === def.id);
            if (index === -1) {
                users.push(def);
                updated = true;
            } else if (users[index].username !== def.username) {
                // Fix potential bad seed data from previous version
                users[index] = def;
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem('uattach-users', JSON.stringify(users));
        }
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const storedUsers = localStorage.getItem('uattach-users');
        if (storedUsers) {
            const users: User[] = JSON.parse(storedUsers);
            // Case insensitive username match
            const found = users.find(u =>
                u.username.toLowerCase() === username.toLowerCase() ||
                (u.email && u.email.toLowerCase() === username.toLowerCase()) // Allow login by email too
            );

            if (found && found.password === password) {
                // Don't store password in session
                const { password: _, ...safeUser } = found;
                setUser(safeUser as User);
                localStorage.setItem('uattach-user', JSON.stringify(safeUser));
                return true;
            }
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('uattach-user');
        router.push('/login');
    };

    const createUser = (newUser: User) => {
        const storedUsers = localStorage.getItem('uattach-users');
        const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

        // Simple duplicate check
        if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
            throw new Error('Username already exists');
        }

        users.push(newUser);
        localStorage.setItem('uattach-users', JSON.stringify(users));
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
