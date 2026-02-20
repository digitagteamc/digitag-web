"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type Role = "CREATOR" | "BRAND";

export default function UserLoginModal({
    open,
    onClose,
    onVerified,
}: {
    open: boolean;
    onClose: () => void;
    onVerified: (payload: {
        phoneNumber: string;
        needsRegistration: boolean;
        role: Role | null;
        exists: boolean;
    }) => void;
}) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");

    const [exists, setExists] = useState<boolean>(false);
    const [existingRole, setExistingRole] = useState<Role | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    function normalizePhone(p: string) {
        const x = p.replace(/\s+/g, "");
        if (/^\d{10}$/.test(x)) return `+91${x}`;
        return x;
    }

    async function requestOtp(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const phone = normalizePhone(phoneNumber);

            const res = await fetch(`${API}/auth/request-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ phoneNumber: phone }),
            });

            const body = await res.json().catch(() => null);
            if (!res.ok) throw new Error(body?.message || "OTP request failed");

            setExists(!!body?.exists);
            setExistingRole((body?.role as Role) ?? null);
            setStep("OTP");
        } catch (err: any) {
            setError(err?.message || "Error");
        } finally {
            setLoading(false);
        }
    }

    async function verifyOtp(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const phone = normalizePhone(phoneNumber);

            const res = await fetch(`${API}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ phoneNumber: phone, otp }),
            });

            const body = await res.json().catch(() => null);
            if (!res.ok) throw new Error(body?.message || "OTP verify failed");

            const needsRegistration = !!body?.needsRegistration;
            const role = (body?.user?.role as Role) ?? existingRole ?? null;

            onVerified({ phoneNumber: phone, needsRegistration, role, exists });

            // reset
            setOtp("");
            setStep("PHONE");
            setExists(false);
            setExistingRole(null);
      
        } catch (err: any) {
            setError(err?.message || "Error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={onClose} />

            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b14] p-6 text-white">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Login</h3>
                    <button onClick={onClose} className="rounded-lg px-3 py-1 hover:bg-white/10">✕</button>
                </div>

                {step === "PHONE" && (
                    <form onSubmit={requestOtp} className="mt-5 grid gap-3">
                        <label className="text-sm text-white/70">Mobile number</label>
                        <input
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="10-digit or +91..."
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />

                        <button disabled={loading} className="p-3 rounded-xl bg-white text-black font-semibold disabled:opacity-60">
                            {loading ? "Sending..." : "Send OTP"}
                        </button>

                        {error && <div className="text-red-300">{error}</div>}
                        <p className="text-xs text-white/60">Dev OTP: <b>1234</b></p>
                    </form>
                )}

                {step === "OTP" && (
                    <form onSubmit={verifyOtp} className="mt-5 grid gap-3">
                        <div className="text-sm text-white/70">
                            OTP sent to <span className="text-white">{normalizePhone(phoneNumber)}</span>
                        </div>

                        {!exists && (
                            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                                New number detected. After OTP verification you must sign up as <b>Creator</b> or <b>Brand</b>.
                            </div>
                        )}

                        {exists && existingRole && (
                            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                                Account found: <b>{existingRole}</b>. Continue to login.
                            </div>
                        )}

                        <input
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="Enter OTP (1234)"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setStep("PHONE")}
                                className="flex-1 p-3 rounded-xl border border-white/10 hover:bg-white/10"
                            >
                                Back
                            </button>
                            <button
                                disabled={loading}
                                className="flex-1 p-3 rounded-xl bg-white text-black font-semibold disabled:opacity-60"
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </button>
                        </div>

                        {error && <div className="text-red-300">{error}</div>}
                    </form>
                )}
            </div>
        </div>
    );
}
