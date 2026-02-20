"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Role, CreatorStatus } from "@/types";
import { useRouter } from "next/navigation";

type User = {
    phoneNumber: string;
    role: Role | null;
    creatorStatus: CreatorStatus | null;
};

type AuthContextType = {
    isLoggedIn: boolean;
    user: User | null;
    authReady: boolean; // ✅ true once localStorage has been read

    login: (phoneNumber: string, role: Role | null) => void;
    logout: () => void;

    refreshStatus: () => Promise<void>;

    loginModalOpen: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;

    // ✅ One consistent guard
    requireAuth: (opts?: { redirectTo?: string }) => boolean;

    // ✅ for “continue after login”
    pendingRedirect: string | null;
    setPendingRedirect: (path: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

// localStorage keys
const LS_LOGGED_IN = "digitag_logged_in";
const LS_PHONE = "digitag_phone";
const LS_ROLE = "digitag_role";
const LS_CREATOR_STATUS = "digitag_creator_status";
const LS_PENDING_REDIRECT = "digitag_pending_redirect";

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false); // ✅ false until localStorage is read

    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [pendingRedirect, _setPendingRedirect] = useState<string | null>(null);

    const setPendingRedirect = (path: string | null) => {
        _setPendingRedirect(path);
        if (path) localStorage.setItem(LS_PENDING_REDIRECT, path);
        else localStorage.removeItem(LS_PENDING_REDIRECT);
    };

    async function refreshStatus() {
        if (!API) return;

        try {
            // ✅ Best: a single endpoint that returns role + statuses
            // Expected response example:
            // { phoneNumber, role, creatorStatus }
            const res = await fetch(`${API}/auth/me`, {
                credentials: "include",
                cache: "no-store",
            });

            if (res.ok) {
                const data = await res.json();
                const role = (data?.role as Role) ?? null;
                const creatorStatus = (data?.creatorStatus as CreatorStatus) ?? null;

                const phone = data?.phoneNumber || user?.phoneNumber || localStorage.getItem(LS_PHONE) || "";

                const newUser: User = { phoneNumber: phone, role, creatorStatus };
                setUser(newUser);

                if (role) localStorage.setItem(LS_ROLE, role);
                if (creatorStatus) localStorage.setItem(LS_CREATOR_STATUS, creatorStatus);
                return;
            }

            // ✅ Fallback (if /auth/me not implemented yet):
            // Try creators status; if fails, keep role from LS
            const res2 = await fetch(`${API}/creators/me/status`, {
                credentials: "include",
                cache: "no-store",
            });

            if (res2.ok) {
                const data2 = await res2.json();
                const role = (data2?.role as Role) ?? (user?.role ?? (localStorage.getItem(LS_ROLE) as Role | null));
                const creatorStatus = (data2?.creatorStatus as CreatorStatus) ?? null;

                const phone = user?.phoneNumber || localStorage.getItem(LS_PHONE) || "";
                const newUser: User = { phoneNumber: phone, role, creatorStatus };
                setUser(newUser);

                if (role) localStorage.setItem(LS_ROLE, role);
                if (creatorStatus) localStorage.setItem(LS_CREATOR_STATUS, creatorStatus);
            }
        } catch (e) {
            console.error("Failed to refresh status", e);
        }
    }

    useEffect(() => {
        const logged = localStorage.getItem(LS_LOGGED_IN) === "1";
        const phone = localStorage.getItem(LS_PHONE);
        const role = (localStorage.getItem(LS_ROLE) as Role | null) ?? null;
        const creatorStatus = (localStorage.getItem(LS_CREATOR_STATUS) as CreatorStatus | null) ?? null;

        const pr = localStorage.getItem(LS_PENDING_REDIRECT);
        if (pr) _setPendingRedirect(pr);

        if (logged && phone) {
            setIsLoggedIn(true);
            setUser({ phoneNumber: phone, role, creatorStatus });
            refreshStatus();
        }
        setAuthReady(true); // ✅ mark hydration complete regardless of login state
    }, []);

    // ✅ when login completes, auto-redirect if needed
    useEffect(() => {
        if (!isLoggedIn) return;
        if (!pendingRedirect) return;

        const path = pendingRedirect;
        setPendingRedirect(null);
        router.push(path);
    }, [isLoggedIn, pendingRedirect, router]);

    const login = (phoneNumber: string, role: Role | null) => {
        setIsLoggedIn(true);
        setUser({ phoneNumber, role, creatorStatus: null });

        localStorage.setItem(LS_LOGGED_IN, "1");
        localStorage.setItem(LS_PHONE, phoneNumber);
        if (role) localStorage.setItem(LS_ROLE, role);

        refreshStatus();
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);

        localStorage.removeItem(LS_LOGGED_IN);
        localStorage.removeItem(LS_PHONE);
        localStorage.removeItem(LS_ROLE);
        localStorage.removeItem(LS_CREATOR_STATUS);
        localStorage.removeItem(LS_PENDING_REDIRECT);
        _setPendingRedirect(null);
    };

    const requireAuth = (opts?: { redirectTo?: string }) => {
        if (isLoggedIn) return true;

        if (opts?.redirectTo) setPendingRedirect(opts.redirectTo);
        setLoginModalOpen(true);
        return false;
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                user,
                authReady,
                login,
                logout,
                refreshStatus,
                loginModalOpen,
                openLoginModal: () => setLoginModalOpen(true),
                closeLoginModal: () => setLoginModalOpen(false),
                requireAuth,
                pendingRedirect,
                setPendingRedirect,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
