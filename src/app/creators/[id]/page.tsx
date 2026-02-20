"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import ContactModal from "@/components/ContactModal";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function CreatorProfilePage() {
    const { id } = useParams<{ id: string }>();
    const { user, requireAuth, isLoggedIn, authReady } = useAuth();

    const [creator, setCreator] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Brand: approval status
    const [brandStatus, setBrandStatus] = useState<string | null>(null);
    const [brandStatusLoading, setBrandStatusLoading] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);
    const [contactStatus, setContactStatus] = useState<null | { contacted: boolean; status: string | null }>(null);


    // Read role safely on client after mount
    const [storedRole, setStoredRole] = useState<string | null>(null);
    useEffect(() => {
        if (authReady) setStoredRole(localStorage.getItem("digitag_role"));
    }, [authReady]);
    const isBrand = storedRole === "BRAND";

    // ── Fetch creator profile ────────────────────────────────────────────
    useEffect(() => {
        if (!authReady) return; // wait for localStorage hydration
        if (!requireAuth({ redirectTo: `/creators/${id}` })) return;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API}/creators/${id}`, { cache: "no-store" });
                if (!res.ok) {
                    if (res.status === 404) throw new Error("Creator not found");
                    throw new Error("Failed to load creator");
                }
                setCreator(await res.json());
            } catch (err: any) {
                setError(err.message);
                setCreator(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [id, isLoggedIn, authReady]);


    // ── Brand: fetch own approval status ────────────────────────────────
    useEffect(() => {
        if (!isBrand || !isLoggedIn) return;
        setBrandStatusLoading(true);
        Promise.all([
            fetch(`${API}/brands/me/status`, { credentials: "include", cache: "no-store" })
                .then(r => r.json()).catch(() => null),
            fetch(`${API}/collaborations/check/${id}`, { credentials: "include", cache: "no-store" })
                .then(r => r.ok ? r.json() : null).catch(() => null),
        ]).then(([brandData, checkData]) => {
            setBrandStatus(brandData?.brandStatus ?? null);
            if (checkData) setContactStatus(checkData);
        }).finally(() => setBrandStatusLoading(false));
    }, [isBrand, isLoggedIn, authReady, id]);



    // ── Render states ────────────────────────────────────────────────────
    if (loading) {
        return (
            <main className="min-h-screen bg-[#05050b] text-white">
                <Navbar />
                <div className="flex items-center justify-center h-64 text-white/50">Loading…</div>
            </main>
        );
    }
    if (error || !creator) {
        return (
            <main className="min-h-screen bg-[#05050b] text-white">
                <Navbar />
                <div className="flex items-center justify-center h-64 text-red-400">{error ?? "Creator not found"}</div>
            </main>
        );
    }

    const canContact = isBrand && brandStatus === "APPROVED";

    return (
        <main className="min-h-screen bg-[#05050b] text-white">
            <Navbar />

            <section className="mx-auto max-w-3xl px-6 py-10">
                {/* ── Profile Header ── */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-3xl font-bold">{creator.name}</h1>
                            <p className="text-white/60 mt-1">{creator.instagram}</p>
                            <span className="mt-3 inline-block text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                                {creator.category}
                            </span>
                        </div>

                        {/* Brand: Contact button */}
                        {isBrand && (
                            <div className="flex flex-col items-end gap-2">
                                {brandStatusLoading ? (
                                    <p className="text-xs text-white/50">Checking status…</p>
                                ) : contactStatus?.contacted ? (
                                    /* Already contacted — show status badge */
                                    <div className="flex flex-col items-end gap-1.5">
                                        <span className="rounded-xl bg-white/10 border border-white/20 text-white/60 px-5 py-2.5 text-sm font-semibold cursor-default">
                                            ✓ Contacted
                                        </span>
                                        {contactStatus.status && (
                                            <p className="text-xs">
                                                {contactStatus.status === "PENDING" && <span className="text-amber-400">Awaiting creator response</span>}
                                                {contactStatus.status === "APPROVED" && <span className="text-emerald-400">✅ Request approved!</span>}
                                                {contactStatus.status === "REJECTED" && <span className="text-red-400">❌ Request declined</span>}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setContactOpen(true)}
                                            disabled={brandStatus !== "APPROVED"}
                                            title={
                                                brandStatus === "APPROVED" ? ""
                                                    : brandStatus === "PENDING" ? "Your brand is pending admin approval"
                                                        : brandStatus === "REJECTED" ? "Your brand was rejected"
                                                            : "Complete brand registration to contact creators"
                                            }
                                            className="rounded-xl bg-white text-black px-5 py-2.5 font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                        >
                                            Contact Creator
                                        </button>
                                        {brandStatus === "PENDING" && (
                                            <p className="text-xs text-amber-400">Your brand is pending approval</p>
                                        )}
                                        {brandStatus === "REJECTED" && (
                                            <p className="text-xs text-red-400">Your brand was rejected</p>
                                        )}
                                        {brandStatus === "NOT_REGISTERED" && (
                                            <p className="text-xs text-white/50">Complete brand registration first</p>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </section>


            {/* Contact Modal */}
            <ContactModal
                open={contactOpen}
                creatorId={creator.id}
                creatorName={creator.name}
                onClose={() => setContactOpen(false)}
                onSent={() => setContactStatus({ contacted: true, status: "PENDING" })}
            />

        </main>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        PENDING: "border-amber-500/40 bg-amber-500/10 text-amber-400",
        APPROVED: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
        REJECTED: "border-red-500/40 bg-red-500/10 text-red-400",
    };
    return (
        <span className={`text-xs rounded-full border px-3 py-1 font-medium ${map[status] ?? ""}`}>
            {status}
        </span>
    );
}
