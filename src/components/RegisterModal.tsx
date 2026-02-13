"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type Role = "CREATOR" | "BRAND";

export default function RegisterModal({
    open,
    phoneNumber,
    onClose,
    onCreatorSubmitted,
}: {
    open: boolean;
    phoneNumber: string | null; // comes from OTP modal verified phone
    onClose: () => void;
    onCreatorSubmitted?: () => void;
}) {
    const [role, setRole] = useState<Role | "">("");
    const [step, setStep] = useState<"ROLE" | "CREATOR_FORM">("ROLE");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // creator fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [instagram, setInstagram] = useState("");
    const [category, setCategory] = useState("");

    if (!open) return null;

    async function submitRole(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!phoneNumber) {
            setError("Phone not verified. Please login first.");
            return;
        }
        if (role !== "CREATOR" && role !== "BRAND") {
            setError("Select Creator or Brand");
            return;
        }

        setLoading(true);
        try {
            // Store role in backend + sets user_token cookie
            const res = await fetch(`${API}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ phoneNumber, role }),
            });

            const body = await res.json().catch(() => null);
            if (!res.ok) throw new Error(body?.message || "Registration failed");

            if (role === "BRAND") {
                // Brand registration done (no extra fields for now)
                onClose();
                return;
            }

            // Creator -> show creator application form
            setStep("CREATOR_FORM");
        } catch (err: any) {
            setError(err?.message || "Error");
        } finally {
            setLoading(false);
        }
    }

    async function submitCreator(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!phoneNumber) {
            setError("Phone not verified. Please login first.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name,
                email,
                phoneNumber, // ✅ saved in Creator table too
                instagram,
                category,
            };

            const res = await fetch(`${API}/creators`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const body = await res.json().catch(() => null);
            if (!res.ok) throw new Error(body?.message || "Creator submit failed");

            // reset & close
            setName("");
            setEmail("");
            setInstagram("");
            setCategory("");
            setRole("");
            setStep("ROLE");
            onCreatorSubmitted?.();
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

            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b14] p-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Register</h3>
                    <button onClick={onClose} className="rounded-lg px-3 py-1 hover:bg-white/10">
                        ✕
                    </button>
                </div>

                {/* Step 1: Choose role */}
                {step === "ROLE" && (
                    <form onSubmit={submitRole} className="mt-5 grid gap-3">
                        <div className="text-sm text-white/70">
                            Verified phone: <span className="text-white">{phoneNumber ?? "—"}</span>
                        </div>

                        <label className="text-sm text-white/70">Register as</label>
                        <select
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            value={role}
                            onChange={(e) => setRole(e.target.value as Role)}
                            required
                        >
                            <option value="" disabled>
                                Select…
                            </option>
                            <option value="CREATOR">Creator</option>
                            <option value="BRAND">Brand</option>
                        </select>

                        <button
                            disabled={loading}
                            className="p-3 rounded-xl bg-white text-black font-semibold disabled:opacity-60"
                        >
                            {loading ? "Saving..." : "Continue"}
                        </button>

                        {error && <div className="text-red-300">{error}</div>}
                    </form>
                )}

                {/* Step 2: Creator application */}
                {step === "CREATOR_FORM" && (
                    <form onSubmit={submitCreator} className="mt-5 grid gap-3">
                        <div className="text-sm text-white/70">
                            Applying as Creator • Phone: <span className="text-white">{phoneNumber}</span>
                        </div>

                        <input
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="Creator name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <input
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="Instagram handle / link"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            required
                        />

                        <input
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="Category (e.g., Fitness, Tech)"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setStep("ROLE")}
                                className="flex-1 p-3 rounded-xl border border-white/10 hover:bg-white/10"
                            >
                                Back
                            </button>
                            <button
                                disabled={loading}
                                className="flex-1 p-3 rounded-xl bg-white text-black font-semibold disabled:opacity-60"
                            >
                                {loading ? "Submitting..." : "Submit for approval"}
                            </button>
                        </div>

                        {error && <div className="text-red-300">{error}</div>}
                    </form>
                )}
            </div>
        </div>
    );
}
