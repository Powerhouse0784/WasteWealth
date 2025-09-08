export interface User {
  id: string;
  uid: string; 
  email: string;
  phone: string;
  name: string;
  role: 'user' | 'worker' | 'admin';
  profileCompleted: boolean;
  addresses?: Address[];
  walletBalance: number;
  avatar?: string; 
  createdAt: Date;
}

export interface Address {
  id: string;
  type: 'home' | 'office' | 'other';
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface WasteType {
  id: string;
  name: string;
  pricePerKg: number;
  icon: string;
  color: string;
  gradient: [string, string];
  description?: string;  // Add this line
  category?: string; 
}

export interface PickupRequest {
  id: string;
  userId: string;
  workerId?: string;
  wasteItems: WasteItem[];
  address: Address;
  scheduledDate: Date;
  status: 'pending' | 'accepted' | 'on_the_way' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: Date;
  completedAt?: Date;
  userRating?: number;
  userFeedback?: string;
}

export interface WasteItem {
  wasteType: WasteType;
  quantity: number;
  unit: 'kg' | 'liters' | 'items';
  estimatedValue: number;
}

export interface Worker {
  id: string;
  userId: string;
  isAvailable: boolean;
  rating: number;
  totalEarnings: number;
  completedRequests: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'pickup_update' | 'payment' | 'general';
  read: boolean;
  createdAt: Date;
  data?: any;
}