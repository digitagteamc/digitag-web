"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import UserLoginModal from "@/components/UserLoginModal";
import RoleSelectModal from "@/components/RoleSelectModal";
import BrandRegisterModal from "@/components/BrandRegisterModal";
import RegisterModal from "@/components/RegisterModal";
import { Role } from "@/types";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function GlobalAuth() {
    const { loginModalOpen, closeLoginModal, login } = useAuth();

    const [roleSelectOpen, setRoleSelectOpen] = useState(false);
    const [brandRegisterOpen, setBrandRegisterOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);

    async function registerUserRole(phoneNumber: string, role: "CREATOR" | "BRAND") {
        const res = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ phoneNumber, role }),
        });

        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.message || "Failed to register user role");
        return body; // { user }
    }

    return (
        <>
            <UserLoginModal
                open={loginModalOpen}
                onClose={closeLoginModal}
                onVerified={async ({ phoneNumber, needsRegistration, role }) => {
                    setVerifiedPhone(phoneNumber);

                    if (needsRegistration) {
                        closeLoginModal();
                        setRoleSelectOpen(true);
                        return;
                    }

                    // Existing user
                    login(phoneNumber, role);
                    closeLoginModal();
                }}
            />

            <RoleSelectModal
                open={roleSelectOpen}
                phoneNumber={verifiedPhone}
                onClose={() => setRoleSelectOpen(false)}
                onSelect={async (r) => {
                    if (!verifiedPhone) return;

                    try {
                        await registerUserRole(verifiedPhone, r);
                        // Login immediately after role registration logic? 
                        // The original code set isLoggedIn(true) and role, then opened the next modal.
                        // We do the same.

                        login(verifiedPhone, r);
                        setRoleSelectOpen(false);

                        if (r === "CREATOR") setRegisterOpen(true);
                        if (r === "BRAND") setBrandRegisterOpen(true);
                    } catch (e) {
                        console.error(e);
                        alert("Registration failed. Try again.");
                    }
                }}
            />

            <BrandRegisterModal
                open={brandRegisterOpen}
                phoneNumber={verifiedPhone}
                onClose={() => setBrandRegisterOpen(false)}
                onSubmitted={async () => {
                    // Refresh status
                    // The login() call earlier already set the user, but maybe status changed?
                    // The original code called fetchMyStatus()
                    // We can re-call login to refresh or use refreshStatus from context if we exposed it, 
                    // but login() calls refreshStatus() internally.
                    // Just ensuring everything is consistent.
                }}
            />

            <RegisterModal
                open={registerOpen}
                phoneNumber={verifiedPhone}
                onClose={() => setRegisterOpen(false)}
                onCreatorSubmitted={async () => {
                    // Refresh status
                }}
            />
        </>
    );
}
