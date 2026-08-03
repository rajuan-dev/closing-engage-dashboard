import { Building2, CheckCircle2, ClipboardList, FileCog, UserCog } from "lucide-react";
import { io, type Socket } from "socket.io-client";

import type { MetricCard } from "../data";
import { adminAuth } from "./auth";

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "order" | "document" | "user" | "system";
  linkId?: string;
}

export interface QuickActionItem {
  title: string;
  description: string;
  icon: any;
  tone: string;
}

export interface DashboardData {
  metrics: MetricCard[];
  chartData: ChartDataPoint[];
  notifications: NotificationItem[];
  quickActions: QuickActionItem[];
}

export interface DashboardOverview {
  generatedAt: string;
  trendPeriod: "7d" | "30d" | "90d";
  metrics: {
    totalCompanies: { value: number; note?: string };
    totalNotaries: { value: number; note?: string };
    totalOrders: { value: number };
    pendingApprovalOrders: { value: number; note?: string };
    completedOrders: { value: number; note?: string };
  };
  activeUsersTrend: ChartDataPoint[];
  quickActions: Array<{
    key: string;
    title: string;
    description: string;
    tone: string;
  }>;
}

export interface AnalyticsOverview {
  range: "today" | "7d" | "30d" | "90d" | "custom";
  generatedAt: string;
  filters: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalOrders: {
      value: number;
      note?: string;
    };
    completedOrders: number;
    pendingOrders: number;
    activeNotaries: number;
    titleCompanies: number;
  };
  ordersByStatus: Array<{
    label: string;
    shortLabel: string;
    value: number;
  }>;
  ordersTrend: Array<{
    label: string;
    value: number;
  }>;
  topNotaries: Array<{
    id: string;
    initials: string;
    name: string;
    completedOrders: number;
  }>;
  topCompanies: Array<{
    id: string;
    name: string;
    subtitle: string;
    orderCount: number;
  }>;
}

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "order" | "notary" | "document" | "company";
}

const TREND_LABELS: Record<DashboardOverview["trendPeriod"], string[]> = {
  "7d": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "30d": ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"],
  "90d": ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:5000/api/v1";
const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/v\d+$/, "");

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface NotificationServerToClientEvents {
  "notifications:new": (payload: NotificationItem) => void;
  "notifications:read": (payload: { id: string }) => void;
  "notifications:read-all": () => void;
  "notifications:deleted": (payload: { id: string }) => void;
  "notifications:cleared": () => void;
}

interface NotificationClientToServerEvents {}

export type NotificationSocket = Socket<NotificationServerToClientEvents, NotificationClientToServerEvents>;

const toSafeNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const toSafeString = (value: unknown, fallback = ""): string => (typeof value === "string" ? value : fallback);

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = adminAuth.getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const result = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "Request failed");
  }

  return result.data;
};

export const createFallbackDashboardOverview = (
  period: "7d" | "30d" | "90d" = "30d"
): DashboardOverview => ({
  generatedAt: new Date().toISOString(),
  trendPeriod: period,
  metrics: {
    totalCompanies: { value: 0 },
    totalNotaries: { value: 0 },
    totalOrders: { value: 0 },
    pendingApprovalOrders: { value: 0 },
    completedOrders: { value: 0 },
  },
  activeUsersTrend: TREND_LABELS[period].map((label) => ({ label, value: 0 })),
  quickActions: [
    {
      key: "add-user",
      title: "Add User",
      description: "Manage company and notary accounts when the connection is restored",
      tone: "blue",
    },
    {
      key: "assign-orders",
      title: "Assign Orders",
      description: "Assignment counts will load again when the backend reconnects",
      tone: "slate",
    },
    {
      key: "approve-documents",
      title: "Approve Documents",
      description: "Pending review counts will appear after the backend reconnects",
      tone: "amber",
    },
  ],
});

export const normalizeDashboardOverview = (
  value: unknown,
  period: "7d" | "30d" | "90d" = "30d"
): DashboardOverview => {
  const fallback = createFallbackDashboardOverview(period);

  if (!value || typeof value !== "object") {
    return fallback;
  }

  const source = value as Partial<DashboardOverview> & Record<string, unknown>;
  const sourceMetrics =
    source.metrics && typeof source.metrics === "object" ? (source.metrics as Record<string, unknown>) : {};

  const trendPeriod =
    source.trendPeriod === "7d" || source.trendPeriod === "30d" || source.trendPeriod === "90d"
      ? source.trendPeriod
      : period;

  const metricBlock = (entry: unknown): { value: number; note?: string } => {
    if (!entry || typeof entry !== "object") return { value: 0 };
    const row = entry as Record<string, unknown>;
    return {
      value: toSafeNumber(row.value),
      note: typeof row.note === "string" ? row.note : undefined,
    };
  };

  const activeUsersTrend = Array.isArray(source.activeUsersTrend)
    ? source.activeUsersTrend.map((item, index) => {
        const row = item as Partial<ChartDataPoint> | undefined;
        return {
          label: toSafeString(row?.label, TREND_LABELS[trendPeriod][index] ?? `Point ${index + 1}`),
          value: toSafeNumber(row?.value),
        };
      })
    : fallback.activeUsersTrend;

  const quickActions = Array.isArray(source.quickActions)
    ? source.quickActions.map((item, index) => {
        const row = item as Record<string, unknown>;
        const fallbackAction = fallback.quickActions[index] ?? fallback.quickActions[fallback.quickActions.length - 1];
        return {
          key: toSafeString(row.key, fallbackAction.key),
          title: toSafeString(row.title, fallbackAction.title),
          description: toSafeString(row.description, fallbackAction.description),
          tone: toSafeString(row.tone, fallbackAction.tone),
        };
      })
    : fallback.quickActions;

  return {
    generatedAt: toSafeString(source.generatedAt, fallback.generatedAt),
    trendPeriod,
    metrics: {
      totalCompanies: metricBlock(sourceMetrics.totalCompanies),
      totalNotaries: metricBlock(sourceMetrics.totalNotaries),
      totalOrders: metricBlock(sourceMetrics.totalOrders),
      pendingApprovalOrders: metricBlock(sourceMetrics.pendingApprovalOrders),
      completedOrders: metricBlock(sourceMetrics.completedOrders),
    },
    activeUsersTrend: activeUsersTrend.length ? activeUsersTrend : fallback.activeUsersTrend,
    quickActions: quickActions.length ? quickActions : fallback.quickActions,
  };
};

export async function fetchDashboardOverview(
  period: "7d" | "30d" | "90d" = "30d"
): Promise<DashboardOverview> {
  const result = await request<DashboardOverview>(`/dashboard/overview?period=${encodeURIComponent(period)}`);
  return normalizeDashboardOverview(result, period);
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  return request<NotificationItem[]>("/notifications");
}

export async function markNotificationRead(id: string): Promise<void> {
  await request<NotificationItem>(`/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead(): Promise<void> {
  await request<Record<string, never>>("/notifications/read-all", { method: "PATCH" });
}

export async function deleteNotification(id: string): Promise<void> {
  await request<Record<string, never>>(`/notifications/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function clearAllNotifications(): Promise<void> {
  await request<Record<string, never>>("/notifications/clear-all", { method: "DELETE" });
}

export function createNotificationSocket(): NotificationSocket | null {
  const token = adminAuth.getToken();
  if (!token) return null;

  return io(SOCKET_BASE_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });
}

export const toMetricCards = (overview: DashboardOverview): MetricCard[] => [
  {
    title: "Total Title Companies",
    value: overview.metrics.totalCompanies.value.toLocaleString("en-US"),
    note: overview.metrics.totalCompanies.note,
    tone: "blue",
    icon: Building2,
  },
  {
    title: "Total Notaries",
    value: overview.metrics.totalNotaries.value.toLocaleString("en-US"),
    note: overview.metrics.totalNotaries.note,
    tone: "blue",
    icon: UserCog,
  },
  {
    title: "Total Orders",
    value: overview.metrics.totalOrders.value.toLocaleString("en-US"),
    tone: "slate",
    icon: ClipboardList,
  },
  {
    title: "Orders Pending Approval",
    value: overview.metrics.pendingApprovalOrders.value.toLocaleString("en-US"),
    note: overview.metrics.pendingApprovalOrders.note,
    tone: "amber",
    icon: FileCog,
  },
  {
    title: "Completed Orders",
    value: overview.metrics.completedOrders.value.toLocaleString("en-US"),
    note: overview.metrics.completedOrders.note,
    tone: "green",
    icon: CheckCircle2,
  },
];

export const toQuickActions = (overview: DashboardOverview): QuickActionItem[] =>
  overview.quickActions.map((action) => ({
    title: action.title,
    description: action.description,
    icon: action.title === "Add User" ? UserCog : action.title === "Assign Orders" ? ClipboardList : CheckCircle2,
    tone: action.tone,
  }));

export async function fetchQuickActions(
  period: "7d" | "30d" | "90d" = "30d"
): Promise<readonly QuickActionItem[]> {
  const overview = await fetchDashboardOverview(period);
  return toQuickActions(overview);
}

export async function fetchAnalyticsOverview(params: {
  range: "today" | "7d" | "30d" | "90d" | "custom";
  startDate?: string;
  endDate?: string;
}): Promise<AnalyticsOverview> {
  const query = new URLSearchParams({ range: params.range });

  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);

  return request<AnalyticsOverview>(`/analytics/overview?${query.toString()}`);
}

export async function exportDashboardReport(
  format: "csv" | "pdf" = "pdf"
): Promise<{ success: boolean; fileName: string }> {
  await delay(1800);
  return {
    success: true,
    fileName: `Dashboard_Report_${new Date().toISOString().slice(0, 10)}.${format}`,
  };
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  return request<SearchResult[]>(`/search?q=${encodeURIComponent(query.trim())}`);
}
