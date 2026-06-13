import type {
  ApiError,
  AnimalDetail,
  VerificationRequest,
  PeerVerification,
  PendingConfirmation,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Sessie verlopen');
    }

    const data = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      throw new Error(error.error || 'Er ging iets mis');
    }

    return data as T;
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: { email: string; password: string; role?: string; professionalId?: string }) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Verification (public)
  async verify(chipId: string) {
    return this.request<any>(`/verify/${encodeURIComponent(chipId)}`);
  }

  // Animals
  async getAnimals() {
    return this.request<any[]>('/animals');
  }

  async getAnimal(id: string) {
    return this.request<AnimalDetail>(`/animals/${id}`);
  }

  async registerAnimal(data: {
    chipId: string;
    species: string;
    breed?: string;
    birthDate?: string;
    motherChipId?: string;
  }) {
    return this.request<{ id: string; status: string }>('/animals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Credits
  async getCredits() {
    return this.request<{ credits: number }>('/credits');
  }

  async getCreditBundles() {
    return this.request<any[]>('/credits/bundles');
  }

  async purchaseCredits(bundleId: string) {
    return this.request<{ success?: boolean; checkoutUrl?: string }>('/credits/purchase', {
      method: 'POST',
      body: JSON.stringify({ bundleId }),
    });
  }

  async getCreditTransactions() {
    return this.request<any[]>('/credits/transactions');
  }

  // Admin
  async getAdminStats() {
    return this.request<any>('/admin/stats');
  }

  async getPendingUsers() {
    return this.request<any[]>('/admin/users/pending');
  }

  async verifyUser(userId: string, status: 'VERIFIED' | 'REJECTED') {
    return this.request<any>(`/admin/users/${userId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  // Verification flow (professionals)
  async sendVerificationEmail() {
    return this.request<{ message: string; devToken?: string }>('/verification/email/send', {
      method: 'POST',
    });
  }

  async verifyEmail(token: string) {
    return this.request<{ message: string }>('/verification/email/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async submitVerificationRequest(professionalId: string, professionalType: string) {
    return this.request<{ message: string; request: VerificationRequest }>('/verification/request', {
      method: 'POST',
      body: JSON.stringify({ professionalId, professionalType }),
    });
  }

  async getVerificationRequests() {
    return this.request<VerificationRequest[]>('/verification/requests');
  }

  async peerVerify(requestId: string) {
    return this.request<{ message: string; bondAmount: number; bondLockedUntil: string }>(
      `/verification/peer/${requestId}`,
      { method: 'POST' }
    );
  }

  async getMyVerifications() {
    return this.request<PeerVerification[]>('/verification/my-verifications');
  }

  async releaseBond(verificationId: string) {
    return this.request<{ message: string }>(`/verification/release-bond/${verificationId}`, {
      method: 'POST',
    });
  }

  // Confirmations (breeder)
  async getPendingConfirmations() {
    return this.request<PendingConfirmation[]>('/confirmations/pending');
  }

  async confirmRegistration(registrationId: string) {
    return this.request<{ message: string; txHash?: string }>(
      `/confirmations/${registrationId}/confirm`,
      { method: 'POST' }
    );
  }

  async rejectRegistration(registrationId: string, reason: string) {
    return this.request<{ message: string }>(`/confirmations/${registrationId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getConfirmationHistory() {
    return this.request<PendingConfirmation[]>('/confirmations/history');
  }
}

export const api = new ApiClient();
