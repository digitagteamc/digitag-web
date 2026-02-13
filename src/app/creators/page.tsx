"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type Creator = {
    id: string;
    name: string;
    instagram: string;
    category: string;
};

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function CreatorsPage() {
    const [rows, setRows] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadApproved() {
        setLoading(true);
        try {
            // ✅ only approved creators
            const res = await fetch(`${API}/creators?status=APPROVED`, { cache: "no-store" });
            setRows(res.ok ? await res.json() : []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadApproved();
    }, []);

    return (
        <main className="min-h-screen bg-[#05050b] text-white">
            <Navbar
                isLoggedIn={false}
                onCreatorsClick={() => { }}
                onAuthClick={() => { }}
                onApplyClick={() => { }}
                onLogout={() => { }}
            />

            <section className="mx-auto max-w-6xl px-6 py-10">
                <h1 className="text-3xl font-extrabold">Creators</h1>
                <p className="mt-2 text-white/70">Only verified creators are listed here.</p>

                {loading ? (
                    <p className="mt-6 text-white/70">Loading…</p>
                ) : rows.length === 0 ? (
                    <p className="mt-6 text-white/70">No approved creators yet.</p>
                ) : (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {rows.map((c) => (
                            <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <div className="font-bold text-lg">{c.name}</div>
                                <div className="text-white/70">{c.category}</div>
                                <div className="mt-2 text-sm text-white/60">{c.instagram}</div>

                                <button className="mt-4 w-full rounded-xl bg-white text-black px-4 py-2 font-semibold hover:opacity-90">
                                    View profile
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
