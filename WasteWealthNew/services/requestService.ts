// services/requestService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PickupRequest {
  id: string;
  userId: string;
  userName: string;
  userRating: number;
  userPhone?: string;
  wasteTypes: { name: string; quantity: number; unit: string }[];
  totalAmount: number;
  distance: number;
  address: string;
  scheduledDate: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  pickupType: 'instant' | 'scheduled' | 'daily';
  imageUrl?: string;
  estimatedWeight?: number;
  preferredTime?: string;
  createdAt: string;
  updatedAt: string;
  acceptedBy?: string;
  completedAt?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface WorkerStats {
  todayRequests: number;
  completedToday: number;
  earnings: number;
  monthlyEarnings: number;
  rating: number;
  totalCollections: number;
  wasteProcessed: number;
  activeRequests: number;
  completedPickups: number;
  efficiency: number;
}

// Lightweight event emitter
type Listener<T = any> = (payload: T) => void;
class SimpleEventEmitter<Events extends Record<string, any>> {
  private listeners: { [K in keyof Events]?: Listener<Events[K]>[] } = {};

  emit<K extends keyof Events>(event: K, data: Events[K]) {
    this.listeners[event]?.forEach(fn => fn(data));
  }
  on<K extends keyof Events>(event: K, fn: Listener<Events[K]>) {
    (this.listeners[event] ||= []).push(fn);
    return () => this.off(event, fn);
  }
  off<K extends keyof Events>(event: K, fn: Listener<Events[K]>) {
    this.listeners[event] = (this.listeners[event] || []).filter(f => f !== fn);
  }
}

interface ReqEvents {
  request_added: PickupRequest;
  requests_updated: PickupRequest[];
  stats_updated: WorkerStats;
  request_accepted: PickupRequest;
  request_updated: PickupRequest;
}

class RequestManager {
  private static instance: RequestManager;
  private requests: PickupRequest[] = [];
  private workerStats: WorkerStats = {
    todayRequests: 0,
    completedToday: 0,
    earnings: 0,
    monthlyEarnings: 0,
    rating: 4.8,
    totalCollections: 0,
    wasteProcessed: 0,
    activeRequests: 0,
    completedPickups: 0,
    efficiency: 95,
  };
  private events = new SimpleEventEmitter<ReqEvents>();

  private constructor() {
    this.loadRequests();
    this.loadStats();
  }

  static getInstance() {
    if (!RequestManager.instance) {
      RequestManager.instance = new RequestManager();
    }
    return RequestManager.instance;
  }

  // Load requests from AsyncStorage
  private async loadRequests() {
    try {
      const storedRequests = await AsyncStorage.getItem('pickup_requests');
      this.requests = storedRequests ? JSON.parse(storedRequests) : this.generateSampleRequests();
      if (!storedRequests) await this.saveRequests();
    } catch {
      this.requests = this.generateSampleRequests();
    }
  }

  private async saveRequests() {
    await AsyncStorage.setItem('pickup_requests', JSON.stringify(this.requests));
  }

  // Load worker stats from AsyncStorage
  private async loadStats() {
    try {
      const storedStats = await AsyncStorage.getItem('worker_stats');
      if (storedStats) this.workerStats = { ...this.workerStats, ...JSON.parse(storedStats) };
      this.updateStatsFromRequests();
    } catch {}
  }

  private async saveStats() {
    await AsyncStorage.setItem('worker_stats', JSON.stringify(this.workerStats));
  }

  private updateStatsFromRequests() {
    const now = new Date();
    const today = now.toDateString();

    const todayRequests = this.requests.filter(req => new Date(req.createdAt).toDateString() === today);
    const completedToday = todayRequests.filter(req => req.status === 'completed');
    const activeRequests = this.requests.filter(req =>
      req.status === 'pending' || req.status === 'accepted' || req.status === 'in-progress'
    );
    const completedRequests = this.requests.filter(req => req.status === 'completed');
    const todayEarnings = completedToday.reduce((sum, req) => sum + req.totalAmount, 0);
    const monthlyEarnings = this.requests.filter(req => {
      const reqDate = new Date(req.completedAt || req.createdAt);
      return reqDate.getMonth() === now.getMonth() && reqDate.getFullYear() === now.getFullYear() && req.status === 'completed';
    }).reduce((sum, req) => sum + req.totalAmount, 0);
    const totalWasteProcessed = completedRequests.reduce((sum, req) => sum + (req.estimatedWeight || 0), 0);

    this.workerStats = {
      ...this.workerStats,
      todayRequests: todayRequests.length,
      completedToday: completedToday.length,
      earnings: todayEarnings,
      monthlyEarnings,
      activeRequests: activeRequests.length,
      completedPickups: completedRequests.length,
      totalCollections: completedRequests.length,
      wasteProcessed: totalWasteProcessed,
    };

    this.saveStats();
  }

  private generateSampleRequests(): PickupRequest[] {
    const sampleNames = ['Emma Thompson', 'Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sarah Wilson'];
    const sampleAddresses = [
      '789 Green Valley Apartments, Sector 22, Chandigarh',
      '456 Eco Heights, Sector 17, Chandigarh',
      '123 Sustainable Living Complex, Sector 34, Chandigarh',
      '321 Green Park Society, Sector 15, Chandigarh',
      '567 Environmental Plaza, Sector 43, Chandigarh'
    ];
    const wasteTypeOptions = [
      { name: 'Plastic', quantity: 15, unit: 'kg' },
      { name: 'Paper', quantity: 25, unit: 'kg' },
      { name: 'E-Waste', quantity: 8, unit: 'kg' },
      { name: 'Metal', quantity: 12, unit: 'kg' },
      { name: 'Glass', quantity: 20, unit: 'kg' },
    ];

    return Array.from({ length: 3 }, (_, index) => ({
      id: `sample_${index + 1}_${Date.now()}`,
      userId: `user_${index + 1}`,
      userName: sampleNames[index],
      userRating: 4.5 + Math.random() * 0.5,
      wasteTypes: [wasteTypeOptions[index]],
      totalAmount: 200 + Math.random() * 500,
      distance: 1 + Math.random() * 5,
      address: sampleAddresses[index],
      scheduledDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      urgency: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      status: 'pending' as const,
      pickupType: ['instant', 'scheduled', 'daily'][Math.floor(Math.random() * 3)] as any,
      estimatedWeight: 10 + Math.random() * 30,
      preferredTime: '10:00 AM - 12:00 PM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentStatus: 'pending' as const,
    }));
  }

  // Public API methods

  async addRequest(requestData: Omit<PickupRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'paymentStatus'>): Promise<PickupRequest> {
    const newRequest: PickupRequest = {
      ...requestData,
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.requests.unshift(newRequest);
    await this.saveRequests();
    this.updateStatsFromRequests();

    this.events.emit('request_added', newRequest);
    this.events.emit('requests_updated', this.getAvailableRequests());
    this.events.emit('stats_updated', this.workerStats);

    return newRequest;
  }

  getAvailableRequests(): PickupRequest[] {
    return this.requests.filter(req => req.status === 'pending')
      .sort((a, b) => {
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        if (urgencyDiff !== 0) return urgencyDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  getRequestsByStatus(status?: string): PickupRequest[] {
    if (!status || status === 'all') {
      return this.requests.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    return this.requests.filter(req => req.status === status)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async acceptRequest(requestId: string, workerId: string = 'worker_1'): Promise<boolean> {
    const requestIndex = this.requests.findIndex(req => req.id === requestId);
    if (requestIndex === -1 || this.requests[requestIndex].status !== 'pending') return false;

    this.requests[requestIndex] = {
      ...this.requests[requestIndex],
      status: 'accepted',
      acceptedBy: workerId,
      updatedAt: new Date().toISOString(),
    };

    await this.saveRequests();
    this.updateStatsFromRequests();

    this.events.emit('request_accepted', this.requests[requestIndex]);
    this.events.emit('requests_updated', this.getAvailableRequests());
    this.events.emit('stats_updated', this.workerStats);

    return true;
  }

  async updateRequestStatus(requestId: string, status: PickupRequest['status'], notes?: string): Promise<boolean> {
    const requestIndex = this.requests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) return false;

    const updateData: Partial<PickupRequest> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (notes) updateData.notes = notes;
    if (status === 'completed') {
      updateData.completedAt = new Date().toISOString();
      updateData.paymentStatus = 'paid';
    }

    this.requests[requestIndex] = { ...this.requests[requestIndex], ...updateData };

    await this.saveRequests();
    this.updateStatsFromRequests();

    this.events.emit('request_updated', this.requests[requestIndex]);
    this.events.emit('requests_updated', this.getAvailableRequests());
    this.events.emit('stats_updated', this.workerStats);

    return true;
  }

  getWorkerStats(): WorkerStats {
    this.updateStatsFromRequests();
    return { ...this.workerStats };
  }

  getRecentActivity(): Array<{ id: string; time: string; action: string; icon: string; color: string }> {
    const activities: Array<{ id: string; time: string; action: string; icon: string; color: string }> = [];

    const sortedRequests = [...this.requests]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);

    sortedRequests.forEach(req => {
      const timeDiff = Date.now() - new Date(req.updatedAt).getTime();
      const timeString = this.getTimeAgo(timeDiff);

      switch (req.status) {
        case 'completed':
          activities.push({ id: `complete_${req.id}`, time: timeString, action: `Completed pickup from ${req.userName} - Earned ₹${req.totalAmount}`, icon: 'check-circle', color: '#4CAF50' });
          break;
        case 'accepted':
          activities.push({ id: `accept_${req.id}`, time: timeString, action: `Accepted pickup request from ${req.userName}`, icon: 'handshake', color: '#2196F3' });
          break;
        case 'pending':
          if (new Date(req.createdAt).getTime() === new Date(req.updatedAt).getTime()) {
            activities.push({ id: `new_${req.id}`, time: timeString, action: `New pickup request from ${req.userName}`, icon: 'bell', color: '#FF9800' });
          }
          break;
      }
    });

    return activities.slice(0, 6);
  }

  private getTimeAgo(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  async removeRequest(requestId: string): Promise<boolean> {
    const initialLength = this.requests.length;
    this.requests = this.requests.filter(req => req.id !== requestId);
    if (this.requests.length < initialLength) {
      await this.saveRequests();
      this.updateStatsFromRequests();
      this.events.emit('requests_updated', this.getAvailableRequests());
      this.events.emit('stats_updated', this.workerStats);
      return true;
    }
    return false;
  }

  async clearAllRequests(): Promise<void> {
    this.requests = [];
    await this.saveRequests();
    this.updateStatsFromRequests();
    this.events.emit('requests_updated', []);
    this.events.emit('stats_updated', this.workerStats);
  }

  // Event subscription
  onRequestsUpdated(callback: (requests: PickupRequest[]) => void): () => void {
    return this.events.on('requests_updated', callback);
  }
  onStatsUpdated(callback: (stats: WorkerStats) => void): () => void {
    return this.events.on('stats_updated', callback);
  }
  onRequestAdded(callback: (request: PickupRequest) => void): () => void {
    return this.events.on('request_added', callback);
  }
  onRequestAccepted(callback: (request: PickupRequest) => void): () => void {
    return this.events.on('request_accepted', callback);
  }
}

// Export singleton instance and API
export const requestManager = RequestManager.getInstance();

export const workerAPI = {
  getAvailableRequests: async () => ({ data: { requests: requestManager.getAvailableRequests() } }),
  getWorkerStats: async () => ({ data: { stats: requestManager.getWorkerStats() } }),
  acceptRequest: async (requestId: string) => {
    const success = await requestManager.acceptRequest(requestId);
    if (!success) throw new Error('Failed to accept request');
    return { success: true };
  },
  updateRequestStatus: async (requestId: string, status: string, notes?: string) => {
    const success = await requestManager.updateRequestStatus(requestId, status as any, notes);
    if (!success) throw new Error('Failed to update request status');
    return { success: true };
  }
};

