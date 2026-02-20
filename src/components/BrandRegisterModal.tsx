"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function BrandRegisterModal({
    open,
    phoneNumber,
    onClose,
    onSubmitted,
}: {
    open: boolean;
    phoneNumber: string | null;
    onClose: () => void;
    onSubmitted: () => void;
}) {
    const [brandName, setBrandName] = useState("");
    const [pan, setPan] = useState("");
    const [gstin, setGstin] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!open) return null;

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (!phoneNumber) throw new Error("Missing phoneNumber");

            const res = await fetch(`${API}/brands/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    phoneNumber,
                    brandName,
                    pan,
                    gstin: gstin || undefined,
                    city: city || undefined,
                    state: state || undefined,
                }),
            });

            const body = await res.json().catch(() => null);
            if (!res.ok) throw new Error(body?.message || "Brand registration failed");

            onSubmitted();
            onClose();
        } catch (err: any) {
            setError(err?.message || "Error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0b14] p-6 text-white">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Brand registration</h3>
                    <button onClick={onClose} className="rounded-lg px-3 py-1 hover:bg-white/10">✕</button>
                </div>

                <p className="mt-2 text-sm text-white/60">
                    Submit your details. Admin will verify and approve.
                </p>

                <form onSubmit={submit} className="mt-5 grid gap-3">
                    <input
                        className="p-3 rounded-xl bg-black/30 border border-white/10"
                        placeholder="Brand / Company name"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        required
                    />

                    <input
                        className="p-3 rounded-xl bg-black/30 border border-white/10"
                        placeholder="PAN (eg: ABCDE1234F)"
                        value={pan}
                        onChange={(e) => setPan(e.target.value.toUpperCase())}
                        required
                    />

                    <input
                        className="p-3 rounded-xl bg-black/30 border border-white/10"
                        placeholder="GSTIN (optional)"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <input
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="City (optional)"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                        <input
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="State (optional)"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                        />
                    </div>

                    {error && <div className="text-red-300 text-sm">{error}</div>}

                    <button
                        disabled={loading}
                        className="mt-2 p-3 rounded-xl bg-white text-black font-semibold disabled:opacity-60"
                    >
                        {loading ? "Submitting..." : "Submit for approval"}
                    </button>

                    <p className="text-xs text-white/50">
                        Phone: <span className="text-white">{phoneNumber}</span>
                    </p>
                </form>
            </div>
        </div>
    );
}
