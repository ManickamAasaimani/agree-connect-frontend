import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/services';
import { AuthService } from '../../services/auth.service';
import { Order, User } from '../../models/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">📋 My Orders</h1>
        <p class="page-subtitle">{{ user?.role === 'buyer' ? 'Your purchase history and active orders' : 'Incoming orders for your crops' }}</p>
      </div>
    </div>

    <div class="alert alert-success" *ngIf="success">
      <i class="fas fa-check-circle"></i> {{ success }}
    </div>

    <!-- Loading -->
    <div class="loading-wrap" *ngIf="loading">
      <span class="spinner spinner-primary"></span>
      <span>Loading orders...</span>
    </div>

    <!-- Empty -->
    <div class="empty-state card" *ngIf="!loading && orders.length === 0">
      <i class="fas fa-clipboard-list"></i>
      <h3>No orders yet</h3>
      <p>{{ user?.role === 'buyer' ? 'Visit the marketplace to place your first order' : 'Orders from buyers will appear here' }}</p>
      <a routerLink="/marketplace" class="btn btn-primary btn-sm">
        <i class="fas fa-store"></i> Go to Marketplace
      </a>
    </div>

    <!-- Orders list -->
    <div class="orders-list" *ngIf="!loading && orders.length > 0">
      <div class="order-card" *ngFor="let o of orders; let i = index" [style.animation-delay]="i*0.05+'s'">

        <!-- Header -->
        <div class="oc-header">
          <div class="oc-left">
            <div class="oc-emoji">🌱</div>
            <div>
              <div class="oc-title">{{ o.cropName }}</div>
              <div class="oc-id">#{{ o.id }}</div>
            </div>
          </div>
          <span class="status-pill" [class]="getStatusColor(o.status)">
            <i [class]="getStatusIcon(o.status)"></i> {{ o.status }}
          </span>
        </div>

        <!-- Body -->
        <div class="oc-body">

          <!-- Quantity & Price breakdown -->
          <div class="oc-price-section">
            <div class="oc-detail-row">
              <span class="od-label"><i class="fas fa-box"></i> Quantity</span>
              <span class="od-value">{{ o.quantity }} {{ o.unit }}</span>
            </div>

            <!-- Product amount (always shown) -->
            <div class="oc-detail-row">
              <span class="od-label"><i class="fas fa-seedling"></i> Crop Amount</span>
              <span class="od-value mono">₹{{ getProductAmount(o) | number:'1.2-2' }}</span>
            </div>

            <!-- Vehicle amount (only if vehicle was booked) -->
            <div class="oc-detail-row vehicle-row" *ngIf="o.vehicleId || o.vehicleAmount">
              <span class="od-label"><i class="fas fa-tractor"></i> Vehicle ({{ o.vehicleName || 'Transport' }})</span>
              <span class="od-value mono vehicle-amt">₹{{ (o.vehicleAmount || 0) | number:'1.2-2' }}</span>
            </div>

            <!-- Divider if vehicle -->
            <div class="oc-price-divider" *ngIf="o.vehicleId || o.vehicleAmount"></div>

            <!-- Total -->
            <div class="oc-detail-row oc-total-row">
              <span class="od-label total-label">
                <i class="fas fa-indian-rupee-sign"></i>
                {{ (o.vehicleId || o.vehicleAmount) ? 'Grand Total' : 'Total Amount' }}
              </span>
              <span class="od-value total-val mono">₹{{ o.totalPrice | number:'1.2-2' }}</span>
            </div>
          </div>

          <!-- Who is on the other side -->
          <!-- Buyer sees farmer info -->
          <div class="oc-person-card buyer-side" *ngIf="user?.role === 'buyer'">
            <div class="opc-header">
              <i class="fas fa-tractor"></i>
              <span>Farmer Details</span>
            </div>
            <div class="opc-name">{{ o.farmerName }}</div>
            <div class="opc-info" *ngIf="o.farmerPhone">
              <i class="fas fa-phone"></i> {{ o.farmerPhone }}
            </div>
            <div class="opc-info" *ngIf="o.farmerLocation">
              <i class="fas fa-map-pin"></i> {{ o.farmerLocation }}
            </div>
          </div>

          <!-- Farmer sees buyer info -->
          <div class="oc-person-card farmer-side" *ngIf="user?.role === 'farmer'">
            <div class="opc-header">
              <i class="fas fa-user"></i>
              <span>Buyer Details</span>
            </div>
            <div class="opc-name">{{ o.buyerName }}</div>
            <div class="opc-info" *ngIf="o.buyerPhone">
              <i class="fas fa-phone"></i> {{ o.buyerPhone }}
            </div>
          </div>

          <!-- Message -->
          <div class="oc-msg" *ngIf="o.message">
            <i class="fas fa-comment-alt"></i> {{ o.message }}
          </div>

          <!-- Payment method badge -->
          <div class="oc-payment" *ngIf="o.paymentMethod">
            <span class="pay-badge">
              <i class="fas fa-credit-card"></i>
              Paid via {{ o.paymentMethod === 'cod' ? 'Cash on Delivery' : (o.paymentMethod || '').toUpperCase() }}
            </span>
          </div>
        </div>

        <!-- Footer -->
        <div class="oc-footer">
          <div class="oc-date">
            <i class="fas fa-calendar-alt"></i>
            {{ o.createdAt | date:'dd MMM yyyy, hh:mm a' }}
          </div>
          <div class="oc-actions">
            <ng-container *ngIf="o.status === 'pending' && user?.role === 'farmer'">
              <button class="btn btn-success btn-sm" (click)="updateStatus(o, 'accepted')">
                <i class="fas fa-check"></i> Accept
              </button>
              <button class="btn btn-danger btn-sm" (click)="updateStatus(o, 'rejected')">
                <i class="fas fa-times"></i> Reject
              </button>
            </ng-container>
            <ng-container *ngIf="o.status === 'pending' && user?.role === 'buyer'">
              <button class="btn btn-danger btn-sm" (click)="updateStatus(o, 'cancelled')">
                <i class="fas fa-ban"></i> Cancel
              </button>
            </ng-container>
            <ng-container *ngIf="o.status === 'accepted' && user?.role === 'farmer'">
              <button class="btn btn-primary btn-sm" (click)="updateStatus(o, 'completed')">
                <i class="fas fa-check-double"></i> Mark Completed
              </button>
            </ng-container>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .orders-list { display: flex; flex-direction: column; gap: 16px; }
    .order-card {
      background: #fff; border-radius: 14px; border: 1px solid rgba(30,138,44,0.12);
      overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      animation: fadeUp 0.4s ease both; transition: box-shadow 0.2s;
    }
    .order-card:hover { box-shadow: 0 4px 16px rgba(30,138,44,0.1); }

    /* Header */
    .oc-header { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid rgba(30,138,44,0.08); }
    .oc-left   { display:flex; align-items:center; gap:12px; }
    .oc-emoji  { font-size:1.5rem; }
    .oc-title  { font-size:1rem; font-weight:700; color:#1a2e1c; }
    .oc-id     { font-size:0.75rem; color:#6b8f70; font-family:'JetBrains Mono',monospace; }

    /* Body */
    .oc-body { padding:16px 20px; display:flex; flex-direction:column; gap:12px; }

    /* Price section */
    .oc-price-section { background:#f7fdf8; border-radius:10px; padding:14px; border:1px solid rgba(30,138,44,0.1); }
    .oc-detail-row { display:flex; align-items:center; justify-content:space-between; padding:5px 0; }
    .od-label { font-size:0.82rem; color:#6b8f70; display:flex; align-items:center; gap:7px; }
    .od-label i { color:#27a836; font-size:0.78rem; }
    .od-value { font-size:0.875rem; color:#1a2e1c; font-weight:600; }
    .vehicle-row .od-label { color:#d97706; }
    .vehicle-row .od-label i { color:#d97706; }
    .vehicle-amt { color:#d97706; }
    .oc-price-divider { height:1px; background:rgba(30,138,44,0.15); margin:8px 0; }
    .oc-total-row { margin-top:2px; }
    .total-label { font-size:0.9rem; font-weight:700; color:#1a2e1c; }
    .total-label i { color:#1e8a2c; }
    .total-val { font-size:1.1rem; font-weight:800; color:#1a5e2a; }

    /* Person card */
    .oc-person-card { border-radius:10px; padding:12px 14px; border:1.5px solid; }
    .buyer-side  { background:#f0fdf4; border-color:rgba(30,138,44,0.2); }
    .farmer-side { background:#eff6ff; border-color:rgba(59,130,246,0.2); }
    .opc-header { display:flex; align-items:center; gap:7px; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; }
    .buyer-side  .opc-header { color:#16a34a; }
    .farmer-side .opc-header { color:#2563eb; }
    .opc-name { font-size:0.95rem; font-weight:700; color:#1a2e1c; margin-bottom:4px; }
    .opc-info { font-size:0.8rem; color:#6b8f70; display:flex; align-items:center; gap:6px; margin-top:3px; }
    .opc-info i { color:#9ca3af; font-size:0.75rem; }

    /* Message & payment */
    .oc-msg { font-size:0.82rem; color:#6b8f70; background:#f7fdf8; border-radius:7px; padding:8px 12px; }
    .oc-msg i { margin-right:6px; color:#27a836; }
    .oc-payment { display:flex; }
    .pay-badge { display:inline-flex; align-items:center; gap:6px; font-size:0.75rem; font-weight:600; color:#6b8f70; background:#f3f4f6; border-radius:20px; padding:4px 12px; border:1px solid rgba(0,0,0,0.07); }
    .pay-badge i { color:#9ca3af; }

    /* Footer */
    .oc-footer  { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; background:#f7fdf8; border-top:1px solid rgba(30,138,44,0.07); }
    .oc-date    { display:flex; align-items:center; gap:6px; font-size:0.78rem; color:#6b8f70; }
    .oc-date i  { color:#27a836; }
    .oc-actions { display:flex; gap:8px; }

    @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  `]
})
export class OrdersComponent implements OnInit {
  user: User | null = null;
  orders: Order[] = [];
  loading = true;
  success = '';

  constructor(private orderService: OrderService, private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.currentUser;
    this.orderService.getMyOrders().subscribe({
      next: (data) => { this.orders = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  updateStatus(order: Order, status: string) {
    this.orderService.updateStatus(order.id, status).subscribe({
      next: () => {
        (order as any).status = status;
        this.success = `Order ${status} successfully.`;
        setTimeout(() => this.success = '', 3000);
      },
      error: () => {}
    });
  }

  // If backend returns productAmount use it, else derive from total minus vehicle
  getProductAmount(o: Order): number {
    if (o.productAmount != null) return o.productAmount;
    if (o.vehicleAmount) return o.totalPrice - o.vehicleAmount;
    return o.totalPrice;
  }

  getStatusColor(s: string): string {
    const m: Record<string,string> = { pending:'amber', accepted:'green', completed:'blue', rejected:'red', cancelled:'red' };
    return m[s] || 'default';
  }
  getStatusIcon(s: string): string {
    const m: Record<string,string> = { pending:'fas fa-clock', accepted:'fas fa-check', completed:'fas fa-check-double', rejected:'fas fa-times', cancelled:'fas fa-ban' };
    return m[s] || 'fas fa-circle';
  }
}
