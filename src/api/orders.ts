import { adminAuth } from "./auth";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:5000/api/v1";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export type OrderStatus =
  | "Received"
  | "Assigned"
  | "In Progress"
  | "Under Review"
  | "Approved"
  | "Completed"
  | "Rejected"
  | "Pending Upload"
  | "Submitted";
export type OrderRow = [string, string, string, string, string, string, OrderStatus, "none" | "jane" | "mark"];

export interface OrderTimelineEvent {
  title: string;
  date: string;
  tone: "blue" | "slate" | "green" | "red";
}

export interface OrderDetail {
  id: string;
  clientName: string;
  propertyAddress: string;
  location: string;
  date: string;
  time: string;
  status: OrderStatus;
  notaryNotes: string;
  specialInstructions: string;
  timeline?: OrderTimelineEvent[];
}

export interface CreateOrderPayload {
  titleCompany: string;
  propertyAddress: string;
  signerName?: string;
  signerPhone?: string;
  signingDate: string;
  signingTime: string;
  status: "Received" | "Assigned" | "In Progress" | "Under Review" | "Pending Upload" | "Submitted";
  priority: "Standard" | "Rush" | "High Touch";
  notaryPreference: "First available" | "Verified only" | "Manual assignment";
  instructions?: string;
  documents?: Array<{ name: string; meta: string }>;
}

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

const orderPath = (id: string) => `/orders/${encodeURIComponent(id)}`;

export const ordersApi = {
  getOrders(): Promise<OrderRow[]> {
    return request<OrderRow[]>("/orders");
  },

  getTimeline(id: string): Promise<OrderTimelineEvent[]> {
    return request<OrderTimelineEvent[]>(`${orderPath(id)}/timeline`);
  },

  getOrderDetail(id: string): Promise<OrderDetail> {
    return request<OrderDetail>(orderPath(id));
  },

  createOrder(payload: CreateOrderPayload): Promise<OrderRow> {
    return request<OrderRow>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deleteOrder(id: string): Promise<boolean> {
    return request<Record<string, never>>(orderPath(id), { method: "DELETE" }).then(() => true);
  },

  updateStatus(id: string, status: OrderStatus): Promise<OrderRow> {
    return request<OrderRow>(`${orderPath(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  assignNotary(
    id: string,
    payload: { notaryName?: string; notaryId?: string; notaryEmail?: string; openForAll?: boolean },
  ): Promise<OrderRow> {
    return request<OrderRow>(`${orderPath(id)}/assign-notary`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
