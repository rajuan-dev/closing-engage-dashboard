import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { CompanyUser, NotaryUser, RegistrationRequest } from "../types";

export interface AdminProfile {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  companyEmail: string;
  contactNumber: string;
  businessAddress: string;
  avatarUrl?: string;
  notifications?: {
    email: boolean;
    orders: boolean;
    documents: boolean;
  };
}

export interface AppContextType {
  companies: CompanyUser[];
  setCompanies: Dispatch<SetStateAction<CompanyUser[]>>;
  notaries: NotaryUser[];
  setNotaries: Dispatch<SetStateAction<NotaryUser[]>>;
  orders: any[];
  setOrders: Dispatch<SetStateAction<any[]>>;
  documents: any[];
  setDocuments: Dispatch<SetStateAction<any[]>>;
  registrationRequests: RegistrationRequest[];
  setRegistrationRequests: Dispatch<SetStateAction<RegistrationRequest[]>>;
  adminProfile: AdminProfile;
  setAdminProfile: Dispatch<SetStateAction<AdminProfile>>;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText?: string,
    variant?: "danger" | "warning" | "info"
  ) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("Missing AppContext");
  return ctx;
};
