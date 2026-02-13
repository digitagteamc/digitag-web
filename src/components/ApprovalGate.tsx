"use client";

export default function ApprovalGate({
    status,
    onApply,
}: {
    status: "NOT_APPLIED" | "PENDING" | "REJECTED";
    onApply: () => void;
}) {
    const title =
        status === "PENDING"
            ? "Waiting for admin approval"
            : status === "REJECTED"
                ? "Your creator application was rejected"
                : "Complete your creator application";

    const desc =
        status === "PENDING"
            ? "Your application is submitted. Once admin approves, your profile will go live."
            : status === "REJECTED"
                ? "Please update your details and re-apply."
                : "You need to submit creator details before you can access creator features.";

    return (
        <div className="mx-auto max-w-3xl px-6 py-10">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
                    <span className="h-2 w-2 rounded-full bg-[#f15a2b]" />
                    Creator Access Restricted
                </div>

                <h1 className="mt-6 text-3xl font-extrabold">{title}</h1>
                <p className="mt-3 text-white/70">{desc}</p>

                {status !== "PENDING" && (
                    <button
                        onClick={onApply}
                        className="mt-8 rounded-xl bg-white text-black px-5 py-3 font-semibold hover:opacity-90"
                    >
                        {status === "REJECTED" ? "Re-apply now" : "Apply as Creator"}
                    </button>
                )}

                {status === "PENDING" && (
                    <div className="mt-8 text-sm text-white/60">
                        You can still browse the homepage, but creator actions will unlock after approval.
                    </div>
                )}
            </div>
        </div>
    );
}
