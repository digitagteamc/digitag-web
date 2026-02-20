"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function RegisterModal({
    open,
    phoneNumber,
    onClose,
    onCreatorSubmitted,
}: {
    open: boolean;
    phoneNumber: string | null; // comes from OTP verified phone
    onClose: () => void;
    onCreatorSubmitted?: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // creator fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [instagram, setInstagram] = useState("");
    const [category, setCategory] = useState("");

    const [location, setLocation] = useState("");
    const [creatorName, setCreatorName] = useState("");
    const [industry, setIndustry] = useState("");
    const [adsPreference, setAdsPreference] = useState("");
    const [primaryPlatform, setPrimaryPlatform] = useState("");
    const [socialLinks, setSocialLinks] = useState({ instagram: "", youtube: "", tiktok: "", other: "" });
    const [followerCount, setFollowerCount] = useState("");
    const [profilePicture, setProfilePicture] = useState("");
    const [bio, setBio] = useState("");
    const [collaborationInterests, setCollaborationInterests] = useState("");
    const [state, setState] = useState("");
    const [district, setDistrict] = useState("");
    const [language, setLanguage] = useState("");

    if (!open) return null;

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
                phoneNumber,
                location,
                creatorName,
                industry,
                adsPreference,
                primaryPlatform,
                socialLinks,
                followerCount: parseInt(followerCount) || 0,
                profilePicture,
                bio,
                collaborationInterests,
                state,
                district,
                language,
                // fallback for legacy
                instagram: socialLinks.instagram || instagram,
                category: industry || category,
            };

            const res = await fetch(`${API}/creators/register`, {
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
            setLocation("");
            setCreatorName("");
            setIndustry("");
            setAdsPreference("");
            setPrimaryPlatform("");
            setSocialLinks({ instagram: "", youtube: "", tiktok: "", other: "" });
            setFollowerCount("");
            setProfilePicture("");
            setBio("");
            setCollaborationInterests("");
            setState("");
            setDistrict("");
            setLanguage("");

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

            <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0b14] p-6 text-white max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Creator Application</h3>
                    <button onClick={onClose} className="rounded-lg px-3 py-1 hover:bg-white/10">
                        ✕
                    </button>
                </div>

                <p className="mt-2 text-sm text-white/60">
                    Submit your profile. Admin approval is required to go live.
                </p>

                <form onSubmit={submitCreator} className="mt-5 grid gap-4">
                    <div className="text-sm text-white/70">
                        Verified phone: <span className="text-white">{phoneNumber ?? "—"}</span>
                    </div>

                    {/* Section 1: Basic Info */}
                    <div className="grid gap-2">
                        <label className="text-xs font-semibold uppercase text-white/40">Basic Info</label>
                        <input
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="Full Name"
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
                            placeholder="Location (City, Country)"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>

                    {/* Section 2: Creator Identity */}
                    <div className="grid gap-2">
                        <label className="text-xs font-semibold uppercase text-white/40">Creator Identity</label>
                        <input
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="Creator / Stage Name"
                            value={creatorName}
                            onChange={(e) => setCreatorName(e.target.value)}
                            required
                        />
                        <input
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="Industry (Beauty, Fitness, Tech, etc.)"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            required
                        />
                        <select
                            className="p-3 rounded-xl bg-black/30 border border-white/10 text-white/70"
                            value={adsPreference}
                            onChange={(e) => setAdsPreference(e.target.value)}
                            required
                        >
                            <option value="">Ads Preference</option>
                            <option value="YES">Open to Ads</option>
                            <option value="NO">Not open to Ads</option>
                        </select>
                    </div>

                    {/* Section 3: Social Presence */}
                    <div className="grid gap-2">
                        <label className="text-xs font-semibold uppercase text-white/40">Social Presence</label>
                        <select
                            className="p-3 rounded-xl bg-black/30 border border-white/10 text-white/70"
                            value={primaryPlatform}
                            onChange={(e) => setPrimaryPlatform(e.target.value)}
                            required
                        >
                            <option value="">Primary Platform</option>
                            <option value="Instagram">Instagram</option>
                            <option value="YouTube">YouTube</option>
                            <option value="TikTok">TikTok</option>
                            <option value="Twitter">Twitter/X</option>
                        </select>
                        <input
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="Instagram Link"
                            value={socialLinks.instagram}
                            onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                        />
                        <input
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="YouTube Link"
                            value={socialLinks.youtube}
                            onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                        />
                        <input
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="Follower Count (Total across platforms)"
                            type="number"
                            value={followerCount}
                            onChange={(e) => setFollowerCount(e.target.value)}
                            required
                        />
                    </div>

                    {/* Section 4: Profile Essentials */}
                    <div className="grid gap-2">
                        <label className="text-xs font-semibold uppercase text-white/40">Profile Essentials</label>
                        <input
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="Profile Picture URL"
                            value={profilePicture}
                            onChange={(e) => setProfilePicture(e.target.value)}
                        />
                        <textarea
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="Short Bio (1 line)"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={1}
                        />
                        <textarea
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="Collaboration Interests (Paid, Barter, etc.)"
                            value={collaborationInterests}
                            onChange={(e) => setCollaborationInterests(e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Section 5: Geographical (For Unique Key) */}
                    <div className="grid gap-2">
                        <label className="text-xs font-semibold uppercase text-white/40">Regional Info</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                className="p-3 rounded-xl bg-black/30 border border-white/10"
                                placeholder="State"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                required
                            />
                            <input
                                className="p-3 rounded-xl bg-black/30 border border-white/10"
                                placeholder="District"
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                required
                            />
                        </div>
                        <input
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                            placeholder="Primary Language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            required
                        />
                    </div>

                    {/* Legacy Fields (hidden or optional) - removed from direct UI to keep clean */}

                    {error && <div className="text-red-300 text-sm bg-red-900/20 p-3 rounded-xl border border-red-500/30">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 p-4 rounded-xl bg-white text-black font-bold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                        {loading ? "Submitting..." : "Apply as Creator"}
                    </button>
                    <p className="text-[10px] text-center text-white/30">
                        By applying, you agree to our terms of service.
                    </p>
                </form>
            </div>
        </div>
    );
}
