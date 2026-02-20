"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Navbar() {
    const { isLoggedIn, logout, openLoginModal, authReady } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement | null>(null);

    // Bell notification — pending collab requests count (creators only)
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    useEffect(() => {
        if (!isLoggedIn || !authReady) return;
        const role = typeof window !== "undefined" ? localStorage.getItem("digitag_role") : null;
        if (role !== "CREATOR") return;

        fetch(`${API}/collaborations/inbox`, { credentials: "include", cache: "no-store" })
            .then(r => r.ok ? r.json() : [])
            .then((data: any[]) => {
                const count = Array.isArray(data) ? data.filter(r => r.status === "PENDING").length : 0;
                setPendingCount(count);
            })
            .catch(() => setPendingCount(0));
    }, [isLoggedIn, authReady]);

    return (
        <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/50 backdrop-blur">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                {/* Logo + Brand */}
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => router.push("/")}
                >
                    <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                        <Image src="/theteamc.png" alt="Logo" fill className="object-contain" />
                    </div>

                    <div className="leading-tight">
                        <div className="font-extrabold tracking-wide">
                            <span className="text-[#0ea5a6]">Digi</span>
                            <span className="text-[#f15a2b]">Tag</span>
                        </div>
                        <div className="text-xs text-white/60">Creators × Brands</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push("/creators")}
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
                    >
                        Creators
                    </button>

                    {/* Notification bell — visible only when logged in */}
                    {isLoggedIn && (
                        <button
                            onClick={() => router.push("/account")}
                            className="relative rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10 transition"
                            title="Collaboration requests"
                        >
                            <span className="text-base leading-none">🔔</span>
                            {pendingCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                                    {pendingCount > 9 ? "9+" : pendingCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* Single auth button */}
                    {!isLoggedIn ? (
                        <button
                            onClick={openLoginModal}
                            className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:opacity-90"
                        >
                            Login / Register
                        </button>
                    ) : (
                        <div className="relative" ref={wrapRef}>
                            <button
                                onClick={() => setOpen((v) => !v)}
                                className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:opacity-90"
                            >
                                Account ▾
                            </button>

                            {open && (
                                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b14] shadow-xl">

                                    <button
                                        onClick={() => {
                                            setOpen(false);
                                            router.push("/account");
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 flex items-center justify-between"
                                    >
                                        <span>My Account</span>
                                        {pendingCount > 0 && (
                                            <span className="rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 leading-none">
                                                {pendingCount}
                                            </span>
                                        )}
                                    </button>

                                    <div className="h-px bg-white/10" />

                                    <button
                                        onClick={() => {
                                            setOpen(false);
                                            logout();
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm text-red-300 hover:bg-white/10"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}


