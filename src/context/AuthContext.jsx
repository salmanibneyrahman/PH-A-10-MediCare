"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { useSession, signOut } from "@/lib/authClient";
import { createUser, getUserByEmail, clearAuthToken } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const { data: session, isPending } = useSession();
    const [dbUser, setDbUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    const user = session?.user || null;

    const syncUser = useCallback(async () => {
        if (!user?.email) {
            setDbUser(null);
            setUserLoading(false);
            return;
        }
        setUserLoading(true);
        try {
            const result = await createUser({
                name: user.name,
                email: user.email,
                photo: user.image || "",
                role: "patient",
            });
            if (result.existing) {
                setDbUser(result.user);
            } else {
                const freshUser = await getUserByEmail(user.email);
                setDbUser(freshUser);
            }
        } catch {
            try {
                const freshUser = await getUserByEmail(user.email);
                setDbUser(freshUser);
            } catch {
                setDbUser(null);
            }
        } finally {
            setUserLoading(false);
        }
    }, [user, user?.email, user?.name, user?.image]);

    useEffect(() => {
        if (!isPending) {
            syncUser();
        }
    }, [isPending, syncUser]);

    // Re-read the DB record without a full page reload — used after the
    // profile page saves, so the sidebar and avatar update immediately.
    const refreshUser = useCallback(async () => {
        if (!user?.email) return null;
        try {
            const freshUser = await getUserByEmail(user.email);
            setDbUser(freshUser);
            return freshUser;
        } catch {
            return null;
        }
    }, [user]);

    const logout = async () => {
        await signOut();
        clearAuthToken();
        setDbUser(null);
    };

    const avatarUrl = dbUser?.photo || user?.image || "";
    const displayName = dbUser?.name || user?.name || "";
    const mergedUser = user ? { ...user, name: displayName, image: avatarUrl } : null;
    const value = {
        user: mergedUser,
        dbUser,
        session,
        avatarUrl,
        displayName,
        loading: isPending || userLoading,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: dbUser?.role === "admin",
        isDoctor: dbUser?.role === "doctor",
        isPatient: dbUser?.role === "patient" || (!dbUser?.role && !!user),
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}