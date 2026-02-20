"use client";

import { useState } from "react";

type Role = "CREATOR" | "BRAND";

export default function RoleSelectModal({
    open,
    phoneNumber,
    onClose,
    onSelect,
}: {
    open: boolean;
    phoneNumber: string | null;
    onClose: () => void;
    onSelect: (role: Role) => void;
}) {
    const [selected, setSelected] = useState<Role>("CREATOR");
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={onClose} />

            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b14] p-6 text-white">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Create your account</h3>
                    <button onClick={onClose} className="rounded-lg px-3 py-1 hover:bg-white/10">
                        ✕
                    </button>
                </div>

                <p className="mt-3 text-sm text-white/70">
                    We couldn’t find <span className="text-white font-semibold">{phoneNumber}</span> in DigiTag.
                    Choose who you are to continue.
                </p>

                <div className="mt-5 grid gap-3">
                    <button
                        type="button"
                        onClick={() => setSelected("CREATOR")}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${selected === "CREATOR"
                                ? "border-white/30 bg-white/10"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                    >
                        <div className="font-bold">Creator</div>
                        <div className="text-xs text-white/60 mt-1">
                            Apply to get listed. Admin approval required.
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelected("BRAND")}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${selected === "BRAND"
                                ? "border-white/30 bg-white/10"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                    >
                        <div className="font-bold">Brand</div>
                        <div className="text-xs text-white/60 mt-1">
                            Submit KYC details. Admin approval required.
                        </div>
                    </button>

                    <button
                        onClick={() => onSelect(selected)}
                        className="mt-2 rounded-xl bg-white text-black px-4 py-3 font-semibold hover:opacity-90"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}
