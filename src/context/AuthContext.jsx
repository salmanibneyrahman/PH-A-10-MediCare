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
            // Read first. This context runs as soon as a session appears,
            // which can beat the register page's createUser() call. Creating
            // here with a hardcoded role would lock the account to "patient"
            // before the chosen role is ever sent.
            const freshUser = await getUserByEmail(user.email);
            if (freshUser) {
                setDbUser(freshUser);
                setUserLoading(false);
                return;
            }
        } catch {
            // 404 = no profile row yet, fall through and create one.
        }

        try {
            // A role picked at signup is stashed by the register page so it
            // survives whichever of the two calls lands first.
            let pendingRole = null;
            try {
                pendingRole = sessionStorage.getItem("pendingRole");
            } catch {
                // sessionStorage unavailable — fall back to patient.
            }

            const result = await createUser({
                name: user.name,
                email: user.email,
                photo: user.image || "",
                role: pendingRole || "patient",
            });

            try {
                sessionStorage.removeItem("pendingRole");
            } catch {
                // ignore
            }

            setDbUser(result.user || (await getUserByEmail(user.email)));
        } catch {
            setDbUser(null);
        } finally {
            setUserLoading(false);
        }
    }, [user]);

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

    // The profile page saves the avatar to the DB record (`photo`), while
    // better-auth's session carries its own `image`. Prefer the DB value so
    // an edit shows up everywhere immediately.
    const avatarUrl = dbUser?.photo || user?.image || "";
    const displayName = dbUser?.name || user?.name || "";

    const value = {
        user,
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