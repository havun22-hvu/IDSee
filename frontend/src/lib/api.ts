import type {
  ApiError,
  AnimalDetail,
  VerifyResult,
  VerificationRequest,
  PeerVerification,
  PendingConfirmation,
  FraudReport,
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
    return this.request<VerifyResult>(`/verify/${encodeURIComponent(chipId)}`);
  }

  // Paid check flow (€2)
  async initiateCheck(chipId: string) {
    return this.request<{ sessionId: string; checkoutUrl: string | null }>('/verify/initiate-check', {
      method: 'POST',
      body: JSON.stringify({ chipId }),
    });
  }

  async getCheckStatus(sessionId: string) {
    return this.request<{ status: 'PENDING' | 'PAID' | 'FAILED' }>(`/verify/check-status/${sessionId}`);
  }

  async getCheckResult(sessionId: string) {
    return this.request<VerifyResult>(`/verify/result/${sessionId}`);
  }

  async reportSoftSignal(sessionId: string, description: string) {
    return this.request<{ message: string }>('/verify/report-soft', {
      method: 'POST',
      body: JSON.stringify({ sessionId, description }),
    });
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

  async getConfig() {
    return this.request<{
      red: number;
      block: number;
      cards: { yellow: number; red: number };
    }>('/admin/config');
  }

  async updateConfig(t: { red: number; block: number }) {
    return this.request<{ message: string }>('/admin/config', {
      method: 'PUT',
      body: JSON.stringify(t),
    });
  }

  async updateCardConfig(t: { yellow: number; red: number }) {
    return this.request<{ message: string }>('/admin/config/cards', {
      method: 'PUT',
      body: JSON.stringify(t),
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

  // Fraud signals
  async reportFraud(data: { type: string; description: string; chipId?: string; animalId?: string; subjectUserId?: string }) {
    return this.request<{ message: string; report: FraudReport }>('/fraud/report', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPendingFraudReports() {
    return this.request<FraudReport[]>('/fraud/pending');
  }

  // category SIGNAAL (cascades) | FEIT (neutral verified fact, no cascade) — §9.
  async confirmFraud(id: string, note?: string, category: 'SIGNAAL' | 'FEIT' = 'SIGNAAL') {
    return this.request<{ subjectUserId: string; category: string; newStatus: string }>(
      `/fraud/${id}/confirm`,
      { method: 'POST', body: JSON.stringify({ note, category }) }
    );
  }

  async rejectFraud(id: string, note?: string) {
    return this.request<{ reportId: string }>(`/fraud/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  // Resolve a confirmed discrepancy — verified arts/chipper only (§4).
  async resolveFraud(id: string, note?: string) {
    return this.request<{ reportId: string; subjectUserId: string; newStatus: string }>(
      `/fraud/${id}/resolve`,
      { method: 'POST', body: JSON.stringify({ note }) }
    );
  }

  // Record an IMPORT chain link for an animal (verified vet, §3a).
  async recordImport(data: {
    chipId: string;
    countryOfOrigin: string;
    foreignOriginId?: string;
    euPassportNumber?: string;
    passportConverted?: boolean;
    vetCheckedDocuments?: boolean;
  }) {
    return this.request<{ message: string; recordId: string }>('/imports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Record a verified discrepancy note on a professional (§4).
  async addProfessionalNote(data: {
    type: string;
    description: string;
    subjectUserId?: string;
    animalId?: string;
    chipId?: string;
  }) {
    return this.request<{ message: string; subjectUserId: string; newCardStatus: string }>(
      '/fraud/note',
      { method: 'POST', body: JSON.stringify(data) }
    );
  }
}

export const api = new ApiClient();
