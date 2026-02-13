"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import RegisterModal from "@/components/RegisterModal";
import UserLoginModal from "@/components/UserLoginModal";
import ApprovalGate from "@/components/ApprovalGate";
import { useRouter } from "next/navigation";

type Creator = {
  id: string;
  name: string;
  email: string;
  instagram: string;
  category: string;
  createdAt: string;
};

type Role = "CREATOR" | "BRAND";
type CreatorStatus = "APPROVED" | "PENDING" | "REJECTED" | "NOT_APPLIED";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

// localStorage keys
const LS_LOGGED_IN = "digitag_logged_in";
const LS_PHONE = "digitag_phone";
const LS_ROLE = "digitag_role";
const LS_CREATOR_STATUS = "digitag_creator_status";

export default function HomePage() {
  const router = useRouter();

  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  const [creatorStatus, setCreatorStatus] = useState<CreatorStatus | null>(null);

  const [showApprovalGate, setShowApprovalGate] = useState(false);

  // ---- helpers ----
  const creatorBlocked = useMemo(() => {
    if (!isLoggedIn) return false;
    if (role !== "CREATOR") return false;
    if (!creatorStatus) return true; // unknown -> block until we fetch
    return creatorStatus !== "APPROVED";
  }, [isLoggedIn, role, creatorStatus]);

  async function fetchMyStatus() {
    if (!API) return;

    try {
      const res = await fetch(`${API}/creators/me/status`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) return;
      const data = await res.json();

      const r = data?.role as Role | null;
      const cs = data?.creatorStatus as CreatorStatus | null;

      if (r) {
        setRole(r);
        localStorage.setItem(LS_ROLE, r);
      }
      if (cs) {
        setCreatorStatus(cs);
        localStorage.setItem(LS_CREATOR_STATUS, cs);
      }
    } catch {
      // ignore
    }
  }

  // load persisted session (temporary until /auth/me is added)
  useEffect(() => {
    const logged = localStorage.getItem(LS_LOGGED_IN) === "1";
    const phone = localStorage.getItem(LS_PHONE);
    const r = localStorage.getItem(LS_ROLE) as Role | null;
    const cs = localStorage.getItem(LS_CREATOR_STATUS) as CreatorStatus | null;

    if (logged) {
      setIsLoggedIn(true);
      setVerifiedPhone(phone);
      setRole(r);
      setCreatorStatus(cs);
      // refresh status from server
      fetchMyStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadTopCreators() {
    setLoading(true);
    try {
      // ideally backend returns only APPROVED by default
      const res = await fetch(`${API}/creators`, { cache: "no-store" });
      setCreators(res.ok ? await res.json() : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTopCreators();
  }, []);

  function requireLogin() {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return false;
    }
    return true;
  }

  function requireCreatorApprovedOrGate() {
    if (!requireLogin()) return false;

    // Only creators are gated by approval
    if (role === "CREATOR" && creatorBlocked) {
      setShowApprovalGate(true);
      return false;
    }

    return true;
  }

  function logout() {
    localStorage.removeItem(LS_LOGGED_IN);
    localStorage.removeItem(LS_PHONE);
    localStorage.removeItem(LS_ROLE);
    localStorage.removeItem(LS_CREATOR_STATUS);

    setIsLoggedIn(false);
    setVerifiedPhone(null);
    setRole(null);
    setCreatorStatus(null);
    setShowApprovalGate(false);
  }

  // ---- Approval gate screen (full page) ----
  if (showApprovalGate && role === "CREATOR") {
    return (
      <main className="min-h-screen bg-[#05050b] text-white">
        <Navbar
          isLoggedIn={isLoggedIn}
          onCreatorsClick={() => {
            // approved creators list page (public)
            router.push("/creators");
          }}
          onAuthClick={() => setLoginOpen(true)}
          onApplyClick={() => setRegisterOpen(true)}
          onLogout={logout}
        />

        <ApprovalGate
          status={creatorStatus === "APPROVED" ? "NOT_APPLIED" : (creatorStatus ?? "NOT_APPLIED")}
          onApply={() => {
            setRegisterOpen(true);
          }}
        />

        <UserLoginModal
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          onVerified={async ({ phoneNumber, needsRegistration }) => {
            setVerifiedPhone(phoneNumber);

            // ✅ NOT VALID USER YET
            if (needsRegistration) {
              setRegisterOpen(true);
              return;
            }

            // ✅ valid user now
            setIsLoggedIn(true);
            localStorage.setItem(LS_LOGGED_IN, "1");
            localStorage.setItem(LS_PHONE, phoneNumber);

            await fetchMyStatus();
          }}
        />

        <RegisterModal
          open={registerOpen}
          phoneNumber={verifiedPhone}
          onClose={() => setRegisterOpen(false)}
          onCreatorSubmitted={async () => {
            // after submit, status should be PENDING for creators
            await fetchMyStatus();
          }}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05050b] text-white">
      <Navbar
        isLoggedIn={isLoggedIn}
        onCreatorsClick={() => {
          // creators list is separate page
          router.push("/creators");
        }}
        onAuthClick={() => setLoginOpen(true)}
        onApplyClick={() => {
          if (!requireLogin()) return;
          setRegisterOpen(true);
        }}
        onLogout={logout}
      />

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-10">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
            <span className="h-2 w-2 rounded-full bg-[#0ea5a6]" />
            Verified creators • Admin approved
          </div>

          <h1 className="mt-6 text-4xl md:text-5xl font-extrabold leading-tight">
            <span className="text-[#0ea5a6]">Book creators</span>, run ads,{" "}
            <span className="text-[#f15a2b]">scale your brand</span>.
          </h1>

          <p className="mt-4 max-w-2xl text-white/70">
            Browse top creators. Apply as a creator and get listed after admin approval. Simple OTP login.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/creators")}
              className="rounded-xl bg-white text-black px-5 py-3 font-semibold hover:opacity-90"
            >
              Explore creators
            </button>

            <button
              onClick={() => {
                if (!requireLogin()) return;
                setRegisterOpen(true);
              }}
              className="rounded-xl border border-white/10 px-5 py-3 hover:bg-white/10"
            >
              Apply as Creator
            </button>
          </div>

          {!isLoggedIn && (
            <div className="mt-4 text-sm text-white/60">
              You’re not logged in. Click <span className="text-white">Login / Register</span> to continue.
            </div>
          )}
        </div>
      </section>

      {/* TOP 10 */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Top creators</h2>
          <button
            onClick={() => {
              // brands can view; creators must be approved to proceed further
              if (!requireCreatorApprovedOrGate()) return;
              router.push("/creators");
            }}
            className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/10"
          >
            Know more
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-white/70">Loading…</p>
        ) : creators.length === 0 ? (
          <p className="mt-4 text-white/70">No approved creators yet.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-lg">{c.name}</div>
                  <span className="text-xs rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/70">
                    {c.category}
                  </span>
                </div>

                <div className="mt-2 text-sm text-white/60">{c.instagram}</div>

                <button
                  onClick={() => {
                    if (!requireCreatorApprovedOrGate()) return;
                    router.push("/creators");
                  }}
                  className="mt-4 w-full rounded-xl bg-white text-black px-4 py-2 font-semibold hover:opacity-90"
                >
                  View profile
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* OTP Login */}
      <UserLoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onVerified={async ({ phoneNumber, needsRegistration }) => {
          setVerifiedPhone(phoneNumber);

          // ✅ IMPORTANT: not logged in until registered or existing user
          if (needsRegistration) {
            setRegisterOpen(true);
            return;
          }

          setIsLoggedIn(true);

          localStorage.setItem(LS_LOGGED_IN, "1");
          localStorage.setItem(LS_PHONE, phoneNumber);

          await fetchMyStatus();
        }}
      />

      {/* Register flow after OTP */}
      <RegisterModal
        open={registerOpen}
        phoneNumber={verifiedPhone}
        onClose={() => setRegisterOpen(false)}
        onCreatorSubmitted={async () => {
          // creator usually becomes PENDING until admin approves
          await fetchMyStatus();
          // show gate so they understand next step
          if (role === "CREATOR") setShowApprovalGate(true);
        }}
      />
    </main>
  );
}
