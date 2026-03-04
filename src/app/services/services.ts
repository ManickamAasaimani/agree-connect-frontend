import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CropListing, MarketPrice, Order, Vehicle, VehicleBooking, ManpowerListing, Message, Notification, Stats, KycOtpResponse, KycVerifyResponse, KycStatusResponse } from '../models/models';

// ─── Crop Service ─────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class CropService {
  private url = `${environment.apiUrl}/crops`;
  constructor(private http: HttpClient) {}

  getAll(filters?: { search?: string; category?: string; location?: string; sort?: string }): Observable<CropListing[]> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.location) params = params.set('location', filters.location);
    if (filters?.sort) params = params.set('sort', filters.sort);
    return this.http.get<CropListing[]>(this.url, { params });
  }

  getAllListings(): Observable<CropListing[]> { return this.http.get<CropListing[]>(this.url); }

  getOne(id: number): Observable<CropListing> { return this.http.get<CropListing>(`${this.url}/${id}`); }
  getMyListings(): Observable<CropListing[]> { return this.http.get<CropListing[]>(`${this.url}/my/listings`); }
  getMarketPrices(): Observable<MarketPrice[]> { return this.http.get<MarketPrice[]>(`${this.url}/market/prices`); }
  create(data: any): Observable<any> { return this.http.post(this.url, data); }
  update(id: number, data: any): Observable<any> { return this.http.put(`${this.url}/${id}`, data); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.url}/${id}`); }
}

// ─── Order Service ────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class OrderService {
  private url = `${environment.apiUrl}/orders`;
  constructor(private http: HttpClient) {}

  placeOrder(data: any): Observable<any> { return this.http.post(this.url, data); }
  getMyOrders(): Observable<Order[]> { return this.http.get<Order[]>(`${this.url}/my`); }
  updateStatus(id: number, status: string): Observable<any> { return this.http.patch(`${this.url}/${id}/status`, { status }); }
  getNotifications(): Observable<Notification[]> { return this.http.get<Notification[]>(`${this.url}/notifications`); }
  markNotifRead(id: number): Observable<any> { return this.http.patch(`${this.url}/notifications/${id}/read`, {}); }
}

// ─── Vehicle Service ──────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class VehicleService {
  private url = `${environment.apiUrl}/vehicles`;
  constructor(private http: HttpClient) {}

  getAll(type?: string, location?: string): Observable<Vehicle[]> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    if (location) params = params.set('location', location);
    return this.http.get<Vehicle[]>(this.url, { params });
  }

  getAllVehicles(): Observable<Vehicle[]> { return this.http.get<Vehicle[]>(this.url); }
  bookVehicle(data: any): Observable<any> { return this.http.post(`${this.url}/book`, data); }

  getMyVehicles(): Observable<Vehicle[]> { return this.http.get<Vehicle[]>(`${this.url}/my`); }
  getBookings(): Observable<VehicleBooking[]> { return this.http.get<VehicleBooking[]>(`${this.url}/bookings`); }
  create(data: any): Observable<any> { return this.http.post(this.url, data); }
  book(data: any): Observable<any> { return this.http.post(`${this.url}/book`, data); }
  updateBooking(id: number, status: string): Observable<any> { return this.http.patch(`${this.url}/bookings/${id}`, { status }); }
  updateStatus(id: number, status: string): Observable<any> { return this.http.patch(`${this.url}/${id}/status`, { status }); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.url}/${id}`); }
}

// ─── Manpower Service ─────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ManpowerService {
  private url = `${environment.apiUrl}/manpower`;
  constructor(private http: HttpClient) {}

  getAll(location?: string, skill?: string): Observable<ManpowerListing[]> {
    let params = new HttpParams();
    if (location) params = params.set('location', location);
    if (skill) params = params.set('skill', skill);
    return this.http.get<ManpowerListing[]>(this.url, { params });
  }

  getMyListings(): Observable<ManpowerListing[]> { return this.http.get<ManpowerListing[]>(`${this.url}/my`); }
  create(data: any): Observable<any> { return this.http.post(this.url, data); }
  update(id: number, data: any): Observable<any> { return this.http.put(`${this.url}/${id}`, data); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.url}/${id}`); }
  hire(data: any): Observable<any> { return this.http.post(`${this.url}/hire`, data); }
  getBookings(): Observable<any[]> { return this.http.get<any[]>(`${this.url}/bookings`); }
  updateBooking(id: number, status: string): Observable<any> { return this.http.patch(`${this.url}/bookings/${id}`, { status }); }
}

// ─── Chat Service ─────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ChatService {
  private url = `${environment.apiUrl}/chat`;
  constructor(private http: HttpClient) {}

  getConversations(): Observable<any[]> { return this.http.get<any[]>(`${this.url}/conversations`); }
  getMessages(userId: number): Observable<Message[]> { return this.http.get<Message[]>(`${this.url}/${userId}`); }
  sendMessage(receiverId: number, message: string): Observable<any> {
    return this.http.post(`${this.url}/send`, { receiverId, message });
  }
}

// ─── Stats Service ────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private http: HttpClient) {}
  getStats(): Observable<Stats> { return this.http.get<Stats>(`${environment.apiUrl}/stats`); }
}

// ─── KYC Service ──────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class KycService {
  private url = `${environment.apiUrl}/kyc`;
  constructor(private http: HttpClient) {}

  getStatus(): Observable<any> { return this.http.get(`${this.url}/status`); }
  sendOtp(aadhaarNumber: string): Observable<any> { return this.http.post(`${this.url}/send-otp`, { aadhaarNumber }); }
  verifyOtp(aadhaarNumber: string, otp: string): Observable<any> { return this.http.post(`${this.url}/verify-otp`, { aadhaarNumber, otp }); }
}
