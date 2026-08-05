import type { LucideIcon } from "lucide-react";

export type PageKey =
  | "dashboard"
  | "usersCompanies"
  | "usersNotaries"
  | "usersRequests"
  | "companyDetails"
  | "notaryProfile"
  | "orders"
  | "orderDetails"
  | "communications"
  | "documents"
  | "documentView"
  | "analytics"
  | "settings"
  | "notifications";

export type NavItem = {
  key: "dashboard" | "usersCompanies" | "orders" | "communications" | "documents" | "analytics" | "settings";
  label: string;
  icon: LucideIcon;
};

export type StatusKey =
  | "Active"
  | "Pending"
  | "Inactive"
  | "Approved"
  | "Rejected"
  | "Declined"
  | "Assigned"
  | "Received"
  | "Completed"
  | "In Progress"
  | "Submitted"
  | "Pending Upload"
  | "Verified"
  | "Pending Review"
  | "Under Review";

export interface CompanyUser {
  id: string; // e.g., "COMP-1"
  publicId?: string; // e.g., "CE-COMP-2026-A1B2C3"
  initials: string;
  color: string;
  companyName: string;
  contactPerson: string;
  businessEmail: string;
  phone: string;
  status: "Active" | "Inactive" | "Pending";
  createdDate: string;
  address?: string;
  state?: string;
  contactEmail?: string;
  userName?: string;
  avatarUrl?: string;
  password?: string;
  adminVisiblePassword?: string;
  passwordChangedBy?: "admin" | "user";
  passwordChangedAt?: string;
  passwordStatus?: string;
  sendInvite?: boolean;
  verify?: boolean;
}

export interface NotaryUser {
  id: string; // e.g., "NOT-1"
  publicId?: string; // e.g., "CE-NOT-2026-A1B2C3"
  initials: string;
  color: string;
  fullName: string;
  specialty: string;
  email: string;
  phone: string;
  license: string;
  status: "Active" | "Inactive" | "Pending";
  createdDate: string;
  expiry?: string;
  serviceArea?: string;
  state?: string;
  userName?: string;
  avatarUrl?: string;
  password?: string;
  adminVisiblePassword?: string;
  passwordChangedBy?: "admin" | "user";
  passwordChangedAt?: string;
  passwordStatus?: string;
  sendInvite?: boolean;
  verify?: boolean;
}

export interface RegistrationRequest {
  id: string; // e.g., "REQ-1"
  role: "notary" | "company";
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  contactType?: string;
  requestType?: string;
  commissionNumber?: string;
  commissionExpiration?: string;
  eoInsurance?: string;
  certifications?: string;
  coverageArea: string;
  message?: string;
  status: "Pending" | "Approved" | "Declined";
  createdDate: string;
}
