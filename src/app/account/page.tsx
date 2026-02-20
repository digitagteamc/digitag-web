"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ─── Types ────────────────────────────────────────────────── */
type CollabStatus = "PENDING" | "APPROVED" | "REJECTED";

type InboxRequest = {
    id: string;
    requirement: string;
    budget?: string;
    timeline?: string;
    message?: string;
    status: CollabStatus;
    createdAt: string;
    brand: { id: string; brandName: string; city?: string; state?: string };
};

type SentRequest = {
    id: string;
    requirement: string;
    budget?: string;
    timeline?: string;
    message?: string;
    status: CollabStatus;
    createdAt: string;
    creator: { id: string; name: string; instagram?: string; category?: string };
};

/* ─── Status badge ─────────────────────────────────────────── */
function StatusBadge({ status }: { status: CollabStatus }) {
    const map: Record<CollabStatus, string> = {
        PENDING: "border-amber-500/40 bg-amber-500/10 text-amber-400",
        APPROVED: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
        REJECTED: "border-red-500/40 bg-red-500/10 text-red-400",
    };
    return (
        <span className={`text-xs rounded-full border px-3 py-1 font-medium ${map[status]}`}>
            {status}
        </span>
    );
}

/* ─── Creator Inbox ─────────────────────────────────────────── */
function CreatorInbox() {
    const [items, setItems] = useState<InboxRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/collaborations/inbox`, { credentials: "include", cache: "no-store" })
            .then(r => r.ok ? r.json() : [])
            .then(d => setItems(Array.isArray(d) ? d : []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    async function respond(id: string, action: "approve" | "reject") {
        const res = await fetch(`${API}/collaborations/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ action }),
        });
        if (res.ok) {
            setItems(prev => prev.map(r =>
                r.id === id ? { ...r, status: action === "approve" ? "APPROVED" : "REJECTED" } : r
            ));
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Collaboration Requests</h2>
            {loading ? (
                <p className="text-white/40">Loading…</p>
            ) : items.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/40">
                    No collaboration requests yet. Brands will reach out here once they discover your profile.
                </div>
            ) : (
                <div className="grid gap-4">
                    {items.map(req => (
                        <div key={req.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-start justify-between flex-wrap gap-3">
                                <div>
                                    <p className="font-semibold text-lg">{req.brand.brandName}</p>
                                    {(req.brand.city || req.brand.state) && (
                                        <p className="text-xs text-white/40">
                                            {[req.brand.city, req.brand.state].filter(Boolean).join(", ")}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={req.status} />
                                    <p className="text-xs text-white/30">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 grid gap-1 text-sm text-white/70">
                                <p><span className="text-white/40">Requirement:</span> {req.requirement}</p>
                                {req.budget && <p><span className="text-white/40">Budget:</span> {req.budget}</p>}
                                {req.timeline && <p><span className="text-white/40">Timeline:</span> {req.timeline}</p>}
                                {req.message && <p><span className="text-white/40">Message:</span> {req.message}</p>}
                            </div>

                            {req.status === "PENDING" && (
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => respond(req.id, "approve")}
                                        className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-2 transition"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => respond(req.id, "reject")}
                                        className="flex-1 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 font-semibold py-2 transition"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Brand Sent ────────────────────────────────────────────── */
function BrandSent() {
    const router = useRouter();
    const [items, setItems] = useState<SentRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/collaborations/sent`, { credentials: "include", cache: "no-store" })
            .then(r => r.ok ? r.json() : [])
            .then(d => setItems(Array.isArray(d) ? d : []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Creators You've Contacted</h2>
            {loading ? (
                <p className="text-white/40">Loading…</p>
            ) : items.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/40">
                    You haven't contacted any creators yet.{" "}
                    <button
                        onClick={() => router.push("/creators")}
                        className="underline text-white/60 hover:text-white"
                    >
                        Browse creators →
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {items.map(req => (
                        <div key={req.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-start justify-between flex-wrap gap-3">
                                <div
                                    className="cursor-pointer group"
                                    onClick={() => router.push(`/creators/${req.creator.id}`)}
                                >
                                    <p className="font-semibold text-lg group-hover:underline">{req.creator.name}</p>
                                    {req.creator.instagram && (
                                        <p className="text-xs text-white/40">@{req.creator.instagram}</p>
                                    )}
                                    {req.creator.category && (
                                        <span className="mt-1.5 inline-block text-xs rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-white/60">
                                            {req.creator.category}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={req.status} />
                                    <p className="text-xs text-white/30">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 grid gap-1 text-sm text-white/70">
                                <p><span className="text-white/40">Requirement:</span> {req.requirement}</p>
                                {req.budget && <p><span className="text-white/40">Budget:</span> {req.budget}</p>}
                                {req.timeline && <p><span className="text-white/40">Timeline:</span> {req.timeline}</p>}
                                {req.message && <p><span className="text-white/40">Message:</span> {req.message}</p>}
                            </div>

                            <div className="mt-4 text-xs text-white/30">
                                {req.status === "PENDING" && "⏳ Waiting for creator to respond"}
                                {req.status === "APPROVED" && "✅ Creator approved your request"}
                                {req.status === "REJECTED" && "❌ Creator declined this request"}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function AccountPage() {
    const { isLoggedIn, authReady, openLoginModal } = useAuth();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        if (authReady) setRole(localStorage.getItem("digitag_role"));
    }, [authReady]);

    useEffect(() => {
        if (authReady && !isLoggedIn) openLoginModal();
    }, [authReady, isLoggedIn]);

    if (!authReady) {
        return (
            <main className="min-h-screen bg-[#05050b] text-white">
                <Navbar />
                <div className="flex items-center justify-center h-64 text-white/40">Loading…</div>
            </main>
        );
    }

    if (!isLoggedIn) {
        return (
            <main className="min-h-screen bg-[#05050b] text-white">
                <Navbar />
                <div className="flex items-center justify-center h-64 text-white/40">Please log in to view your account.</div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#05050b] text-white">
            <Navbar />
            <section className="mx-auto max-w-3xl px-6 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">My Account</h1>
                    <p className="text-white/40 mt-1 text-sm capitalize">{role?.toLowerCase()} account</p>
                </div>

                {role === "CREATOR" && <CreatorInbox />}
                {role === "BRAND" && <BrandSent />}
                {!role && (
                    <p className="text-white/40">Could not determine account type.</p>
                )}
            </section>
        </main>
    );
}
