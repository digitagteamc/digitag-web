
export type Role = "CREATOR" | "BRAND";
export type CreatorStatus = "APPROVED" | "PENDING" | "REJECTED" | "NOT_APPLIED";

export type Creator = {
    id: string;
    name: string;
    email: string;
    instagram: string;
    category: string;
    createdAt: string;
};
