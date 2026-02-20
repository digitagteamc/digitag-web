"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type Props = {
    open: boolean;
    creatorId: string;
    creatorName: string;
    onClose: () => void;
    onSent?: () => void; // called after a request is successfully sent
};

export default function ContactModal({ open, creatorId, creatorName, onClose, onSent }: Props) {
    const [requirement, setRequirement] = useState("");
    const [budget, setBudget] = useState("");
    const [timeline, setTimeline] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!open) return null;

    function reset() {
        setRequirement(""); setBudget(""); setTimeline(""); setMessage("");
        setError(null); setSuccess(false);
    }

    function handleClose() {
        reset(); onClose();
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch(`${API}/collaborations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    creatorId,
                    requirement: requirement.trim(),
                    budget: budget.trim() || undefined,
                    timeline: timeline.trim() || undefined,
                    message: message.trim() || undefined,
                }),
            });
            const body = await res.json().catch(() => null);
            if (!res.ok) throw new Error(body?.message || "Failed to send request");
            setSuccess(true);
            onSent?.(); // notify parent
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0b14] p-6 text-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-xl font-bold">Contact Creator</h3>
                        <p className="text-sm text-white/50 mt-0.5">{creatorName}</p>
                    </div>
                    <button onClick={handleClose} className="rounded-lg px-3 py-1 hover:bg-white/10 text-white/70">✕</button>
                </div>

                {success ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-3">🎉</div>
                        <h4 className="text-lg font-semibold">Request Sent!</h4>
                        <p className="text-white/60 mt-2 text-sm">
                            Your collaboration request has been sent to <strong>{creatorName}</strong>. They will review and respond shortly.
                        </p>
                        <button
                            onClick={handleClose}
                            className="mt-6 w-full rounded-xl bg-white text-black font-semibold py-3 hover:opacity-90"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        {/* Requirement */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">
                                What's your requirement? <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={requirement}
                                onChange={(e) => setRequirement(e.target.value)}
                                required
                                rows={3}
                                placeholder="e.g. We need a product review video for our new smartphone launch..."
                                className="w-full rounded-xl bg-black/30 border border-white/10 p-3 text-sm resize-none focus:outline-none focus:border-white/30"
                            />
                        </div>

                        {/* Budget + Timeline side by side */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Budget (approx.)</label>
                                <input
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    placeholder="e.g. ₹20,000 – ₹50,000"
                                    className="w-full rounded-xl bg-black/30 border border-white/10 p-3 text-sm focus:outline-none focus:border-white/30"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Timeline</label>
                                <input
                                    value={timeline}
                                    onChange={(e) => setTimeline(e.target.value)}
                                    placeholder="e.g. Within 2 weeks"
                                    className="w-full rounded-xl bg-black/30 border border-white/10 p-3 text-sm focus:outline-none focus:border-white/30"
                                />
                            </div>
                        </div>

                        {/* Additional message */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">Additional message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={2}
                                placeholder="Any extra details, links, or specific requirements..."
                                className="w-full rounded-xl bg-black/30 border border-white/10 p-3 text-sm resize-none focus:outline-none focus:border-white/30"
                            />
                        </div>

                        {error && (
                            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !requirement.trim()}
                            className="w-full rounded-xl bg-white text-black font-semibold py-3 hover:opacity-90 disabled:opacity-50 transition"
                        >
                            {loading ? "Sending…" : "Send Request"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
