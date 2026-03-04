// ─── Auth & User ─────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'farmer' | 'buyer' | 'vehicle_owner' | 'manpower' | 'admin';
  phone?: string;
  location?: string;
  profileImg?: string;
  bio?: string;
  isOnline?: boolean;
  kycVerified?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  location?: string;
}

// ─── Crop ─────────────────────────────────────────────────
export interface CropListing {
  id: number;
  farmerId: number;
  farmerName: string;
  farmerLocation?: string;
  farmerPhone?: string;
  farmerOnline?: boolean;
  cropName: string;
  category?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  imageUrl?: string;
  description?: string;
  location?: string;
  harvestDate?: string;
  status: 'available' | 'sold' | 'reserved';
  views: number;
  createdAt: string;
}

export interface MarketPrice {
  id: number;
  cropName: string;
  price: number;
  unit: string;
  market: string;
  priceChange: number;
}

// ─── Order ────────────────────────────────────────────────
export interface Order {
  id: number;
  listingId: number;
  cropName: string;
  unit: string;
  buyerId: number;
  buyerName: string;
  buyerPhone?: string;
  farmerId: number;
  farmerName: string;
  farmerPhone?: string;
  farmerLocation?: string;
  quantity: number;
  totalPrice: number;
  productAmount?: number;   // crop price only
  vehicleAmount?: number;   // vehicle rate (if booked)
  vehicleId?: number;
  vehicleName?: string;
  paymentMethod?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  message?: string;
  createdAt: string;
}

// ─── Vehicle ──────────────────────────────────────────────
export interface Vehicle {
  id: number;
  ownerId: number;
  ownerName: string;
  ownerPhone?: string;
  ownerLocation?: string;
  name: string;
  numberPlate?: string;
  type: string;
  price: number;
  pricePerHour?: number;
  capacity?: string;
  location?: string;
  description?: string;
  status: 'available' | 'booked' | 'unavailable';
  createdAt: string;
}

export interface VehicleBooking {
  id: number;
  vehicleId: number;
  vehicleName: string;
  vehicleType: string;
  vehiclePrice: number;
  bookerId: number;
  bookerName: string;
  bookerPhone?: string;
  ownerId: number;
  ownerName: string;
  ownerPhone?: string;
  hireDate: string;
  days: number;
  bookingMode?: string;
  startHour?: number;
  numHours?: number;
  totalPrice: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message?: string;
  createdAt: string;
}

// ─── Manpower ─────────────────────────────────────────────
export interface ManpowerListing {
  id: number;
  workerId: number;
  workerName: string;
  workerPhone?: string;
  workerLocation?: string;
  workerProfileImg?: string;
  workerOnline?: boolean;
  title: string;
  skills?: string;
  dailyRate: number;
  hourlyRate?: number;
  location?: string;
  experience?: string;
  availability: 'available' | 'busy' | 'unavailable';
  description?: string;
  createdAt: string;
}

// ─── Chat ─────────────────────────────────────────────────
export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Notification ─────────────────────────────────────────
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Stats ────────────────────────────────────────────────
export interface Stats {
  total_farmers: number;
  total_buyers: number;
  active_listings: number;
  total_orders: number;
  total_vehicles: number;
}

// ─── KYC ──────────────────────────────────────────────────
export interface KycOtpResponse {
  message: string;
  otp: string; // Simulated OTP returned in response for academic demo
  expiresInMinutes: number;
}

export interface KycVerifyResponse {
  message: string;
  kycVerified: boolean;
}

export interface KycStatusResponse {
  kycVerified: boolean;
  aadhaarNumber: string;
}
