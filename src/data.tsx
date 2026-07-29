import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileCog,
  FileText,
  FolderOpen,
  MessageSquareText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  UserCog,
  Users,
} from "lucide-react";
import type { NavItem, PageKey, CompanyUser, NotaryUser, RegistrationRequest } from "./types";

export const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "usersCompanies", label: "Users Management", icon: Users },
  { key: "orders", label: "Orders Management", icon: ShoppingCart },
  { key: "communications", label: "Communications", icon: MessageSquareText },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "analytics", label: "Analytics", icon: Activity },
  { key: "settings", label: "Settings", icon: Settings },
];

export const pageGroups: Record<PageKey, NavItem["key"]> = {
  dashboard: "dashboard",
  usersCompanies: "usersCompanies",
  usersNotaries: "usersCompanies",
  usersRequests: "usersCompanies",
  companyDetails: "usersCompanies",
  notaryProfile: "usersCompanies",
  orders: "orders",
  orderDetails: "orders",
  communications: "communications",
  documents: "documents",
  documentView: "documents",
  analytics: "analytics",
  settings: "settings",
  notifications: "settings",
};

export type MetricCard = {
  title: string;
  value: string;
  note?: string;
  tone?: "blue" | "green" | "amber" | "slate";
  icon: LucideIcon;
};

export const dashboardMetrics: MetricCard[] = [];

export const analyticsMetrics: MetricCard[] = [];

export const companyRows: CompanyUser[] = [];

export const notaryRows: NotaryUser[] = [];

export const orderRows = [] as const;

export const quickActions = [
  { title: "Add User", description: "Create new internal or partner accounts", icon: UserCog, tone: "blue" },
  { title: "Assign Orders", description: "Route pending files to available notaries", icon: ClipboardList, tone: "slate" },
  { title: "Approve Documents", description: "Verify and sign-off on 28 pending items", icon: ShieldCheck, tone: "amber" },
] as const;

export const teamMembers = [] as const;

export const recentOrders = [] as const;

export const assignedOrders = [] as const;

export const uploadActivity = [] as const;

export const orderTimeline = [] as const;

export const documentTimeline = [] as const;

export const assignableNotaries = [] as const;

export const stepItems = ["Received", "Assigned", "Under Review", "Approved", "Completed"] as const;

export const statusConfig = {
  Active: "bg-[#EEF9F0] text-[#2F9E54]",
  Pending: "bg-[#FFF4DB] text-[#C79016]",
  Inactive: "bg-[#E9EEF6] text-[#6A7280]",
  Approved: "bg-[#E8F8EA] text-[#2C9A4D]",
  Rejected: "bg-[#FDE8E7] text-[#D25753]",
  Declined: "bg-[#FDE8E7] text-[#D25753]",
  Assigned: "bg-[#DFEAFE] text-[#2E68CF]",
  Received: "bg-[#EDF1F6] text-[#7B8492]",
  Completed: "bg-[#DCF9E5] text-[#3DAE66]",
  "In Progress": "bg-[#E7EEFF] text-[#336DDA]",
  Submitted: "bg-[#E7EEFF] text-[#336DDA]",
  "Pending Upload": "bg-[#FFF4DB] text-[#C79016]",
  Verified: "bg-[#DFEAFE] text-[#2E68CF]",
  "Pending Review": "bg-[#FFE8D8] text-[#CE7E3B]",
  "Under Review": "bg-[#E7EEFF] text-[#336DDA]",
} as const;

export const profileGradients = {
  jane:
    "bg-[radial-gradient(circle_at_35%_30%,#f0d0bc_0_12%,transparent_13%),radial-gradient(circle_at_42%_34%,#3d2c30_0_11%,transparent_12%),radial-gradient(circle_at_55%_34%,#3d2c30_0_10%,transparent_11%),radial-gradient(circle_at_50%_70%,#d48c6e_0_19%,transparent_20%),linear-gradient(180deg,#9fd3ff_0%,#dfeeff_100%)]",
  alex:
    "bg-[radial-gradient(circle_at_48%_28%,#f2c6a9_0_9%,transparent_10%),radial-gradient(circle_at_47%_24%,#0f172a_0_17%,transparent_18%),radial-gradient(circle_at_50%_64%,#5973cf_0_20%,transparent_21%),linear-gradient(180deg,#0d172d_0%,#2c5eb8_100%)]",
  mark:
    "bg-[radial-gradient(circle_at_48%_28%,#f0c4a5_0_9%,transparent_10%),radial-gradient(circle_at_47%_24%,#211a1a_0_17%,transparent_18%),radial-gradient(circle_at_50%_64%,#253858_0_20%,transparent_21%),linear-gradient(180deg,#131a28_0%,#40598d_100%)]",
};

export const initialRegistrationRequests: RegistrationRequest[] = [];
