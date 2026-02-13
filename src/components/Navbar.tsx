"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Navbar({
    isLoggedIn,
    onCreatorsClick,
    onAuthClick,
    onApplyClick,
    onLogout,
}: {
    isLoggedIn: boolean;
    onCreatorsClick: () => void;
    onAuthClick: () => void;
    onApplyClick: () => void;
    onLogout: () => void;
}) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    return (
        <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/50 backdrop-blur">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                {/* Logo + Brand */}
                <div className="flex items-center gap-3">
                    {/* Put your logo at: /public/theteamc.png */}
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
                        onClick={onCreatorsClick}
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
                    >
                        Creators
                    </button>

                    {/* Single auth button */}
                    {!isLoggedIn ? (
                        <button
                            onClick={onAuthClick}
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
                                            onApplyClick();
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm hover:bg-white/10"
                                    >
                                        Apply as Creator
                                    </button>

                                    <div className="h-px bg-white/10" />

                                    <button
                                        onClick={() => {
                                            setOpen(false);
                                            onLogout();
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
