/**
 * Marketplace API client
 * Connects to backend at NEXT_PUBLIC_API_URL via central Axios instance
 */

import api from "./axios";

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ─── URL helper ─────────────────────────────────────────────────────── */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API}${path}`;
}

export function isVideoPath(path: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi)$/i.test(path);
}

export function isImagePath(path: string): boolean {
  return /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(path);
}

/* ─── Types ──────────────────────────────────────────────────────────── */
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];         // can include video paths too
  category: string;
  condition: string;
  productType: 'physical' | 'digital';
  digitalSubType?: string;
  status: string;
  isApproved: boolean;
  views: number;
  createdAt: string;
  seller: { id: string; name: string; email: string; phone?: string };
  college: { name: string };
  _count?: { buyRequests: number };
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface BuyRequest {
  id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  buyer?: { id: string; name: string; email: string };
  seller?: { id: string; name: string; email: string };
  product: { id: string; title: string; price: number; images: string[] };
}

export interface ChatThread {
  id: string;
  status: string;
  updatedAt: string;
  request: BuyRequest & { buyer: NonNullable<BuyRequest['buyer']>; seller: NonNullable<BuyRequest['seller']> };
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  text: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string };
}

/* ─── Products ───────────────────────────────────────────────────────── */
export async function fetchProducts(params: {
  category?: string; type?: string; search?: string;
  sort?: string; page?: number; limit?: number;
} = {}): Promise<ProductsResponse> {
  const res = await api.get('/api/marketplace/products', { params });
  return res.data;
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await api.get(`/api/marketplace/products/${id}`);
  return res.data;
}

export async function fetchMyListings(): Promise<Product[]> {
  const res = await api.get('/api/marketplace/my-listings');
  return res.data;
}

export async function createProduct(formData: FormData): Promise<Product> {
  const res = await api.post('/api/marketplace/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function updateProduct(id: string, formData: FormData): Promise<Product> {
  const res = await api.put(`/api/marketplace/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/api/marketplace/products/${id}`);
}

/* ─── Buy Requests ───────────────────────────────────────────────────── */
export async function createBuyRequest(productId: string, message: string): Promise<BuyRequest> {
  const res = await api.post(`/api/marketplace/products/${productId}/request`, { message });
  return res.data;
}

export async function fetchReceivedRequests(): Promise<BuyRequest[]> {
  const res = await api.get('/api/marketplace/requests/received');
  return res.data;
}

export async function fetchSentRequests(): Promise<BuyRequest[]> {
  const res = await api.get('/api/marketplace/requests/sent');
  return res.data;
}

export async function updateRequestStatus(id: string, status: 'accepted' | 'rejected'): Promise<BuyRequest> {
  const res = await api.patch(`/api/marketplace/requests/${id}`, { status });
  return res.data;
}

/* ─── Chat ───────────────────────────────────────────────────────────── */
export async function fetchThreads(): Promise<ChatThread[]> {
  const res = await api.get('/api/marketplace/threads');
  return res.data;
}

export async function fetchMessages(threadId: string): Promise<ChatMessage[]> {
  const res = await api.get(`/api/marketplace/threads/${threadId}/messages`);
  return res.data;
}

export async function sendMessage(threadId: string, text: string): Promise<ChatMessage> {
  const res = await api.post(`/api/marketplace/threads/${threadId}/messages`, { text });
  return res.data;
}

/* ─── Orders ─────────────────────────────────────────────────────────── */
export interface Order {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  product: {
    id: string; title: string; images: string[];
    productType: string; digitalSubType?: string; category?: string;
  };
  seller: { id: string; name: string; email: string };
}

export async function fetchMyOrders(): Promise<Order[]> {
  const res = await api.get('/api/marketplace/orders');
  return res.data;
}

export async function createOrder(productId: string, amount: number, method = 'upi'): Promise<Order> {
  const res = await api.post('/api/marketplace/orders', { productId, amount, method });
  return res.data;
}

/* ─── Wishlist ────────────────────────────────────────────────────────── */
export interface WishlistItem {
  id: string;
  createdAt: string;
  product: Product;
}

export async function fetchWishlist(): Promise<WishlistItem[]> {
  const res = await api.get('/api/marketplace/wishlist');
  return res.data;
}

export async function addToWishlist(productId: string): Promise<{ id: string }> {
  const res = await api.post('/api/marketplace/wishlist', { productId });
  return res.data;
}

export async function removeFromWishlist(productId: string): Promise<void> {
  await api.delete(`/api/marketplace/wishlist/${productId}`);
}

/* ─── Profile / Stats ─────────────────────────────────────────────────── */
export interface MarketplaceProfile {
  stats: { listed: number; sold: number; purchased: number; revenue: number };
  recentListings: {
    id: string; title: string; price: number; status: string;
    views: number; images: string[]; productType: string;
  }[];
  recentPurchases: {
    id: string; amount: number; createdAt: string;
    product: { id: string; title: string; images: string[]; productType: string };
  }[];
}

export async function fetchMyProfile(): Promise<MarketplaceProfile> {
  const res = await api.get('/api/marketplace/me');
  return res.data;
}
