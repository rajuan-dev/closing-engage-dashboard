const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:5000/api/v1';

const ADMIN_TOKEN_KEY = 'admin_auth_token';

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

export interface AdminAccount {
  id: string;
  email: string;
  role: 'admin';
  profile: AdminProfile;
}

interface AdminSession {
  admin: AdminAccount;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    throw new ApiError(payload?.message || "Request failed", response.status);
  }

  return payload.data;
};

export const adminAuth = {
  tokenKey: ADMIN_TOKEN_KEY,
  getToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem('admin_auth', 'true');
  },
  clearToken(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem('admin_auth');
  },
  async login(email: string, password: string): Promise<AdminSession> {
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await parseResponse<{ token: string; admin: AdminSession['admin'] }>(response);
    this.setToken(data.token);

    return { admin: data.admin };
  },
  async fetchMe(): Promise<AdminSession> {
    const token = this.getToken();

    if (!token) {
      throw new Error('Missing admin token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/admin/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return parseResponse<AdminSession>(response);
  },
  async updateProfile(profile: AdminProfile): Promise<AdminSession> {
    const token = this.getToken();

    if (!token) {
      throw new Error('Missing admin token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/admin/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    });

    return parseResponse<AdminSession>(response);
  },
  async updatePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    const token = this.getToken();

    if (!token) {
      throw new Error('Missing admin token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/admin/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });

    await parseResponse<Record<string, never>>(response);
  },
};
