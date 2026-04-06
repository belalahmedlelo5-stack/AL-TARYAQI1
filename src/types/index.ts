// User Types
export type UserRole = 'doctor' | 'supplier' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  joined: string;
  lastActive: string;
  orders: number;
  rating?: number;
  isVerified: boolean;
}

export interface AuthUser {
  id: string;
  role: UserRole;
  token: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  qty: number;
  brand: string;
  unit: string;
}

export interface OfferItem {
  name: string;
  available: boolean;
  unitPrice: number;
  qty: number;
  altBrand: string | null;
}

export interface SupplierOffer {
  items: OfferItem[];
  submitted: boolean;
  deliveryCode: string | null;
  submittedAt?: string;
}

// Order Types
export type OrderStatus = 'pending' | 'offered' | 'delivering' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  doctorId: string;
  date: string;
  status: OrderStatus;
  products: Product[];
  notes: string;
  offers: Record<string, SupplierOffer>;
  selectedSuppliers: Record<string, string[]> | null;
  paymentMethod: string | null;
  total: number | null;
  shippingAddress?: string;
  shippingPhone1?: string;
  shippingPhone2?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

// Featured Product Types
export interface FeaturedProduct {
  id: string;
  supplierId: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  image?: string;
  createdAt: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  fees: number;
  total: number;
  method: 'instapay' | 'bank' | 'cash';
  status: 'pending' | 'completed' | 'failed';
  date: string;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

// Rating Types
export interface Rating {
  id: string;
  orderId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Security Types
export interface Violation {
  id: string;
  userId: string;
  reason: string;
  preview: string;
  text: string;
  time: string;
  flagged: boolean;
}

export interface LiveNote {
  id: string;
  userId: string;
  text: string;
  time: string;
  flagged: boolean;
}

// Shipping Settings
export interface ShippingSettings {
  address: string;
  phone1: string;
  phone2: string;
}

// Smart Basket Types
export interface SmartBasketItem {
  supId: string;
  supName: string;
  unitPrice: number;
  qty: number;
  unit: string;
  lineTotal: number;
}

export interface SmartBasketResult {
  orderId: string;
  smartBasket: Record<string, SmartBasketItem>;
  grouped: Record<string, {
    name: string;
    items: SmartBasketItem[];
    subtotal: number;
  }>;
  smartTotal: number;
  bestSingleTotal: number;
  bestSingleName: string;
  savings: number;
  savingsPct: number;
  unavailable: string[];
  numSuppliers: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// Toast Types
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}
