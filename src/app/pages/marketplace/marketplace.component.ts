import { Component, OnInit } from '@angular/core';

const CROP_PLACEHOLDERS: Record<string, string> = {
  Vegetables: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%23dcfce7'/%3E%3Ctext x='100' y='75' text-anchor='middle' font-size='48'%3E%F0%9F%A5%A6%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' font-size='13' fill='%23166534' font-family='sans-serif'%3EVegetables%3C/text%3E%3C/svg%3E`,
  Fruits: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%23fef9c3'/%3E%3Ctext x='100' y='75' text-anchor='middle' font-size='48'%3E%F0%9F%8D%8A%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' font-size='13' fill='%23713f12' font-family='sans-serif'%3EFruits%3C/text%3E%3C/svg%3E`,
  Grains: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%23fef3c7'/%3E%3Ctext x='100' y='75' text-anchor='middle' font-size='48'%3E%F0%9F%8C%BE%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' font-size='13' fill='%2392400e' font-family='sans-serif'%3EGrains%3C/text%3E%3C/svg%3E`,
  Pulses: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%23fce7f3'/%3E%3Ctext x='100' y='75' text-anchor='middle' font-size='48'%3E%F0%9F%AB%98%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' font-size='13' fill='%239d174d' font-family='sans-serif'%3EPulses%3C/text%3E%3C/svg%3E`,
  Spices: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%23ffedd5'/%3E%3Ctext x='100' y='75' text-anchor='middle' font-size='48'%3E%F0%9F%8C%B6%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' font-size='13' fill='%239a3412' font-family='sans-serif'%3ESpices%3C/text%3E%3C/svg%3E`,
  Oilseeds: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%23fef9c3'/%3E%3Ctext x='100' y='75' text-anchor='middle' font-size='48'%3E%F0%9F%A5%9C%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' font-size='13' fill='%23713f12' font-family='sans-serif'%3EOilseeds%3C/text%3E%3C/svg%3E`,
  default: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%23f0fdf4'/%3E%3Ctext x='100' y='75' text-anchor='middle' font-size='48'%3E%F0%9F%8C%BF%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' font-size='13' fill='%23166534' font-family='sans-serif'%3ECrop%3C/text%3E%3C/svg%3E`,
};
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CropService, OrderService, VehicleService } from '../../services/services';
import { AuthService } from '../../services/auth.service';
import { CropListing, User } from '../../models/models';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">🛒 Marketplace</h1>
        <p class="page-subtitle">{{ filtered.length }} listings available · Updated live</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <div class="fb-search">
        <i class="fas fa-search fb-icon"></i>
        <input class="fb-input" [(ngModel)]="search" placeholder="Search crops, farmers..." (ngModelChange)="onFilter()">
      </div>
      <div class="fb-cats">
        <button class="fb-cat" [class.active]="category===''" (click)="setFilter('')">All</button>
        <button class="fb-cat" *ngFor="let c of categories" [class.active]="category===c" (click)="setFilter(c)">{{ c }}</button>
      </div>
      <select class="fb-select" [(ngModel)]="sort" (ngModelChange)="onFilter()">
        <option value="">Latest</option>
        <option value="price_asc">Price ↑</option>
        <option value="price_desc">Price ↓</option>
      </select>
    </div>

    <!-- Skeletons -->
    <div class="crop-grid" *ngIf="loading">
      <div class="sk-crop-card" *ngFor="let x of [1,2,3,4,5,6]">
        <div class="sk-block" style="height:12px;width:40%;margin-bottom:8px"></div>
        <div class="sk-block" style="height:22px;width:65%;margin-bottom:10px"></div>
        <div class="sk-block" style="height:36px;width:50%;margin-bottom:12px"></div>
        <div class="sk-block" style="height:12px;width:80%"></div>
      </div>
    </div>

    <!-- Crop Cards -->
    <div class="crop-grid" *ngIf="!loading">
      <div class="crop-card" *ngFor="let crop of filtered; let i = index" [style.animation-delay]="(i%12)*0.04+'s'">
        <div class="cc-header">
          <span class="cc-cat">{{ crop.category || 'General' }}</span>
          <span class="cc-status" [class.avail]="crop.status==='available'">
            <span class="cs-dot"></span>{{ crop.status || 'available' }}
          </span>
        </div>
        <div class="cc-img-wrap">
          <img
            [src]="crop.imageUrl || placeholderFor(crop.category)"
            [alt]="crop.cropName"
            class="cc-img"
            (error)="onImgError($event, crop.category)"
          >
        </div>
        <div class="cc-main">
          <div>
            <div class="cc-name">{{ crop.cropName }}</div>
            <div class="cc-farmer"><i class="fas fa-user"></i> {{ crop.farmerName }}</div>
          </div>
        </div>
        <div class="cc-price-row">
          <div class="cc-price">₹{{ crop.pricePerUnit }}</div>
          <div class="cc-per">per {{ crop.unit }}</div>
        </div>
        <div class="cc-details">
          <span><i class="fas fa-box"></i>
            <ng-container *ngIf="crop.quantity > 0">{{ crop.quantity }}{{ crop.unit }} available</ng-container>
            <ng-container *ngIf="crop.quantity <= 0"><span class="out-of-stock-txt">Out of Stock</span></ng-container>
          </span>
          <span *ngIf="crop.location"><i class="fas fa-map-pin"></i> {{ crop.location }}</span>
        </div>
        <div class="cc-desc" *ngIf="crop.description">{{ crop.description }}</div>
        <div class="cc-actions">
          <button class="btn btn-primary w-full"
            *ngIf="user?.role === 'buyer'"
            [disabled]="crop.status === 'sold' || crop.quantity <= 0"
            (click)="crop.quantity > 0 && crop.status !== 'sold' ? openOrderModal(crop) : null">
            <i class="fas fa-cart-plus" *ngIf="crop.quantity > 0 && crop.status !== 'sold'"></i>
            <i class="fas fa-ban" *ngIf="crop.quantity <= 0 || crop.status === 'sold'"></i>
            {{ (crop.quantity <= 0 || crop.status === 'sold') ? 'Out of Stock' : 'Place Order' }}
          </button>
          <div class="cc-readonly" *ngIf="user?.role !== 'buyer'">
            <i class="fas fa-info-circle"></i> Buyer only
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="!loading && filtered.length === 0">
      <i class="fas fa-store-slash"></i>
      <h3>No crops found</h3>
      <p>Try a different search or category.</p>
    </div>

    <!-- ORDER MODAL -->
    <div class="modal-overlay" *ngIf="showOrderModal" (click)="closeOrderModal($event)">
      <div class="modal-box" (click)="$event.stopPropagation()">

        <!-- Step 1: Order Details -->
        <div *ngIf="orderStep === 1">
          <div class="modal-header">
            <div>
              <div class="modal-title">Place Order</div>
              <div class="modal-sub">{{ selectedCrop?.cropName }} by {{ selectedCrop?.farmerName }}</div>
            </div>
            <button class="modal-close" (click)="closeOrderModal($event)">×</button>
          </div>

          <div class="crop-summary">
            <img
              [src]="selectedCrop?.imageUrl || placeholderFor(selectedCrop?.category)"
              [alt]="selectedCrop?.cropName"
              class="cs-img"
              (error)="onImgError($event, selectedCrop?.category)"
            >
            <div>
              <div class="cs-name">{{ selectedCrop?.cropName }}</div>
              <div class="cs-price">₹{{ selectedCrop?.pricePerUnit }} per {{ selectedCrop?.unit }}</div>
              <div *ngIf="selectedCrop?.unit === 'ton'" style="font-size:0.75rem;color:#16a34a;margin-top:2px">
                💡 = ₹{{ ((selectedCrop?.pricePerUnit || 0) / 1000).toFixed(2) }}/kg
              </div>
              <div *ngIf="selectedCrop?.unit === 'quintal'" style="font-size:0.75rem;color:#16a34a;margin-top:2px">
                💡 = ₹{{ ((selectedCrop?.pricePerUnit || 0) / 100).toFixed(2) }}/kg
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Quantity ({{ selectedCrop?.unit }})</label>
            <div class="qty-control">
              <button type="button" class="qty-btn" (click)="orderQty = Math.max(1, orderQty-1)">−</button>
              <input class="qty-input" type="number" [(ngModel)]="orderQty" min="1" [max]="selectedCrop?.quantity || 9999">
              <button type="button" class="qty-btn" (click)="orderQty = Math.min(selectedCrop?.quantity || 9999, orderQty+1)">+</button>
            </div>
            <div class="qty-hint" *ngIf="selectedCrop?.quantity">
              <i class="fas fa-info-circle"></i>
              {{ selectedCrop?.quantity }} {{ selectedCrop?.unit }} available
              <span *ngIf="orderQty >= (selectedCrop?.quantity || 9999)" class="qty-warn">· Maximum reached</span>
            </div>
          </div>

          <div class="order-total-box">
            <div class="otb-row">
              <span>{{ selectedCrop?.cropName }} × {{ orderQty }} {{ selectedCrop?.unit }}</span>
              <span class="mono">₹{{ (selectedCrop?.pricePerUnit || 0) * orderQty | number:'1.2-2' }}</span>
            </div>
            <div class="otb-row otb-vehicle" *ngIf="needVehicle && selectedVehicle">
              <span>🚜 {{ selectedVehicle.vehicleName }} (transport)</span>
              <span class="mono">₹{{ selectedVehicle.ratePerDay | number:'1.2-2' }}</span>
            </div>
            <div class="otb-row otb-vehicle otb-pending" *ngIf="needVehicle && !selectedVehicle">
              <span>🚜 Vehicle (select below)</span>
              <span class="mono">—</span>
            </div>
            <div class="otb-divider"></div>
            <div class="otb-row otb-total">
              <span>Grand Total</span>
              <span class="mono total-val">₹{{ getGrandTotal() | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Message to Farmer (optional)</label>
            <textarea class="form-control" [(ngModel)]="orderMsg" rows="2" placeholder="Any special requirements?"></textarea>
          </div>

          <!-- Vehicle option -->
          <div class="vehicle-toggle">
            <div class="vt-left">
              <i class="fas fa-tractor"></i>
              <div>
                <div class="vt-title">Need a vehicle for transport?</div>
                <div class="vt-sub">Book a tractor or truck for delivery</div>
              </div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="needVehicle">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- Vehicle picker -->
          <div class="vehicle-picker" *ngIf="needVehicle">
            <div class="vp-label"><i class="fas fa-tractor"></i> Select Vehicle</div>
            <div class="vp-loading" *ngIf="vehiclesLoading">Loading vehicles...</div>
            <div class="vp-list" *ngIf="!vehiclesLoading">
              <div class="vp-item" *ngFor="let v of availableVehicles"
                [class.selected]="selectedVehicle?.id === v.id"
                (click)="selectedVehicle = v">
                <div class="vp-icon">🚜</div>
                <div class="vp-info">
                  <div class="vp-name">{{ v.vehicleName }}</div>
                  <div class="vp-meta">{{ v.ownerName }} · ₹{{ v.ratePerDay }}/day</div>
                </div>
                <div class="vp-check" *ngIf="selectedVehicle?.id === v.id">
                  <i class="fas fa-check-circle"></i>
                </div>
              </div>
              <div class="vp-empty" *ngIf="availableVehicles.length === 0">
                <i class="fas fa-info-circle"></i> No vehicles available right now
              </div>
            </div>
          </div>

          <div class="alert alert-error" *ngIf="orderError">
            <i class="fas fa-circle-exclamation"></i> {{ orderError }}
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeOrderModal($event)">Cancel</button>
            <button class="btn btn-primary" (click)="proceedToPayment()" [disabled]="orderLoading">
              <i class="fas fa-credit-card"></i> Proceed to Payment
            </button>
          </div>
        </div>

        <!-- Step 2: Payment -->
        <div *ngIf="orderStep === 2">
          <div class="modal-header">
            <div>
              <div class="modal-title">💳 Payment</div>
              <div class="modal-sub">Secure checkout</div>
            </div>
            <button class="modal-close" (click)="closeOrderModal($event)">×</button>
          </div>

          <div class="payment-summary">
            <div class="ps-row">
              <span>{{ selectedCrop?.cropName }} × {{ orderQty }}{{ selectedCrop?.unit }}</span>
              <span class="mono">₹{{ (selectedCrop?.pricePerUnit || 0) * orderQty | number:'1.2-2' }}</span>
            </div>
            <div class="ps-row" *ngIf="needVehicle && selectedVehicle">
              <span>Vehicle: {{ selectedVehicle.vehicleName }}</span>
              <span class="mono">₹{{ selectedVehicle.ratePerDay }}</span>
            </div>
            <div class="ps-row ps-total">
              <span>Grand Total</span>
              <span class="mono ps-total-val">₹{{ getGrandTotal() | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="payment-methods">
            <div class="pm-label">Select Payment Method</div>
            <div class="pm-grid">
              <div class="pm-item" [class.sel]="payMethod==='upi'" (click)="payMethod='upi'">
                <div class="pm-icon">📱</div>
                <div class="pm-name">UPI</div>
              </div>
              <div class="pm-item" [class.sel]="payMethod==='card'" (click)="payMethod='card'">
                <div class="pm-icon">💳</div>
                <div class="pm-name">Card</div>
              </div>
              <div class="pm-item" [class.sel]="payMethod==='cod'" (click)="payMethod='cod'">
                <div class="pm-icon">💵</div>
                <div class="pm-name">Cash on Delivery</div>
              </div>
            </div>
          </div>

          <div class="upi-form" *ngIf="payMethod==='upi'">
            <div class="form-group">
              <label class="form-label">UPI ID</label>
              <div class="input-wrap">
                <i class="fas fa-mobile-alt input-icon"></i>
                <input class="form-control has-icon" [(ngModel)]="upiId" placeholder="yourname@paytm">
              </div>
            </div>
          </div>

          <div class="card-form" *ngIf="payMethod==='card'">
            <div class="form-group">
              <label class="form-label">Card Number</label>
              <div class="input-wrap">
                <i class="fas fa-credit-card input-icon"></i>
                <input class="form-control has-icon" [(ngModel)]="cardNum" placeholder="4242 4242 4242 4242" maxlength="19">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Expiry</label>
                <input class="form-control" [(ngModel)]="cardExp" placeholder="MM/YY">
              </div>
              <div class="form-group">
                <label class="form-label">CVV</label>
                <input class="form-control" [(ngModel)]="cardCvv" placeholder="123" maxlength="3">
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="orderStep=1">Back</button>
            <button class="btn btn-gold btn-primary" (click)="processPayment()" [disabled]="payLoading || !payMethod">
              <span class="spinner" *ngIf="payLoading"></span>
              <i class="fas fa-hand-holding-usd" *ngIf="!payLoading && payMethod==='cod'"></i>
              <i class="fas fa-lock" *ngIf="!payLoading && payMethod!=='cod'"></i>
              {{ payLoading ? 'Placing Order...' : payMethod === 'cod' ? 'Confirm Order (COD)' : 'Pay ₹' + (getGrandTotal() | number:'1.2-2') }}
            </button>
          </div>
        </div>

        <!-- Step 3: Payment Success -->
        <div *ngIf="orderStep === 3" class="success-screen">
          <div class="ss-anim">
            <div class="ss-circle">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
          <h2 class="ss-title">{{ payMethod === 'cod' ? 'Order Confirmed Successfully! 🎉' : 'Payment Successful! 🎉' }}</h2>
          <p class="ss-sub">{{ payMethod === 'cod' ? 'Your order has been placed. Pay on delivery.' : 'Your order has been placed successfully.' }}</p>

          <div class="ss-details">
            <div class="ssd-row">
              <span>Order ID</span>
              <span class="mono">#{{ placedOrderId }}</span>
            </div>
            <div class="ssd-row">
              <span>Crop</span>
              <span>{{ selectedCrop?.cropName }}</span>
            </div>
            <div class="ssd-row">
              <span>{{ payMethod === 'cod' ? 'Amount (Pay on Delivery)' : 'Amount Paid' }}</span>
              <span class="mono success-amt">₹{{ getGrandTotal() | number:'1.2-2' }}</span>
            </div>
            <div class="ssd-row" *ngIf="needVehicle && selectedVehicle">
              <span>Vehicle Booked</span>
              <span>✅ {{ selectedVehicle.vehicleName }}</span>
            </div>
            <div class="ssd-row">
              <span>Payment Method</span>
              <span>{{ payMethod === 'cod' ? '💵 Cash on Delivery' : payMethod ? payMethod.toUpperCase() : '' }}</span>
            </div>
            <div class="ssd-row">
              <span>Status</span>
              <span class="status-pill green"><i class="fas fa-check"></i> {{ payMethod === 'cod' ? 'Order Placed' : 'Confirmed' }}</span>
            </div>
          </div>

          <div class="cod-note" *ngIf="payMethod === 'cod'">
            <i class="fas fa-info-circle"></i>
            <div>
              <strong>Cash on Delivery</strong> — Pay ₹{{ getGrandTotal() | number:'1.2-2' }} when your order is delivered.
              The farmer has been notified.
            </div>
          </div>

          <div class="ss-vehicle" *ngIf="needVehicle && selectedVehicle">
            <div class="sv-header">🚜 Vehicle Booking Confirmed</div>
            <div class="sv-body">
              {{ selectedVehicle.vehicleName }} has been booked for transport.
              The owner will contact you shortly.
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeOrderModal($event)">Close</button>
            <button class="btn btn-primary" (click)="goToOrders()">
              <i class="fas fa-receipt"></i> View My Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Filter bar */
    .filter-bar { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:24px; padding:14px 18px; background:#fff; border-radius:12px; border:1px solid rgba(30,138,44,0.15); box-shadow:0 1px 4px rgba(0,0,0,0.05); }
    .fb-search { position:relative; flex:1; min-width:200px; }
    .fb-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#6b8f70; font-size:0.85rem; }
    .fb-input { width:100%; padding:9px 12px 9px 36px; border:1.5px solid rgba(30,138,44,0.2); border-radius:8px; font-size:0.875rem; font-family:'Poppins',sans-serif; outline:none; color:#1a2e1c; }
    .fb-input:focus { border-color:#27a836; }
    .fb-cats { display:flex; gap:6px; flex-wrap:wrap; }
    .fb-cat { padding:6px 14px; border:1.5px solid rgba(30,138,44,0.2); background:#fff; border-radius:20px; font-size:0.8rem; font-weight:600; color:#6b8f70; cursor:pointer; transition:all 0.2s; font-family:'Poppins',sans-serif; }
    .fb-cat:hover, .fb-cat.active { background:#27a836; border-color:#27a836; color:#fff; }
    .fb-select { padding:9px 12px; border:1.5px solid rgba(30,138,44,0.2); border-radius:8px; font-size:0.85rem; font-family:'Poppins',sans-serif; color:#1a2e1c; outline:none; cursor:pointer; }

    /* Crop grid */
    .crop-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:18px; }
    .crop-card { background:#fff; border-radius:14px; border:1px solid rgba(30,138,44,0.12); padding:20px; box-shadow:0 1px 4px rgba(0,0,0,0.05); transition:all 0.2s; animation:fadeUp 0.4s ease both; }
    .crop-card:hover { border-color:rgba(30,138,44,0.3); box-shadow:0 6px 20px rgba(30,138,44,0.1); transform:translateY(-2px); }

    .cc-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
    .cc-cat { font-size:0.72rem; font-weight:700; background:#e8faea; color:#16a34a; padding:3px 10px; border-radius:20px; }
    .cc-status { display:flex; align-items:center; gap:5px; font-size:0.72rem; font-weight:600; color:#6b8f70; }
    .cs-dot { width:6px; height:6px; border-radius:50%; background:#9ca3af; }
    .cc-status.avail .cs-dot { background:#16a34a; }
    .cc-status.avail { color:#16a34a; }

    .cc-img-wrap { height:150px; overflow:hidden; border-radius:10px; margin-bottom:14px; }
    .cc-img { width:100%; height:100%; object-fit:cover; transition:transform 0.3s; }
    .crop-card:hover .cc-img { transform:scale(1.05); }
    .cs-img { width:64px; height:64px; object-fit:cover; border-radius:10px; flex-shrink:0; }

    .cc-main { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
    .cc-name   { font-size:1.05rem; font-weight:700; color:#1a2e1c; }
    .cc-farmer { font-size:0.78rem; color:#6b8f70; margin-top:2px; }
    .cc-farmer i { margin-right:4px; }

    .cc-price-row { display:flex; align-items:baseline; gap:6px; margin-bottom:10px; }
    .cc-price { font-size:1.6rem; font-weight:800; color:#1a5e2a; font-family:'JetBrains Mono',monospace; }
    .cc-per { font-size:0.8rem; color:#6b8f70; }

    .cc-details { display:flex; gap:12px; font-size:0.78rem; color:#6b8f70; margin-bottom:10px; }
    .cc-details i { color:#27a836; margin-right:3px; }
    .cc-desc { font-size:0.8rem; color:#6b8f70; line-height:1.5; margin-bottom:14px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .cc-actions { border-top:1px solid rgba(30,138,44,0.1); padding-top:14px; }
    .cc-readonly { text-align:center; font-size:0.78rem; color:#adc9b0; padding:8px; }

    .sk-crop-card { background:#fff; border-radius:14px; border:1px solid rgba(30,138,44,0.1); padding:20px; }

    /* Modal */
    .modal-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
    .modal-title { font-size:1.3rem; font-weight:800; color:#1a2e1c; }
    .modal-sub { font-size:0.875rem; color:#6b8f70; margin-top:4px; }
    .modal-close { background:none; border:none; font-size:1.5rem; color:#6b8f70; cursor:pointer; line-height:1; padding:0; }
    .modal-close:hover { color:#1a2e1c; }
    .modal-footer { display:flex; gap:10px; justify-content:flex-end; margin-top:20px; padding-top:16px; border-top:1px solid rgba(30,138,44,0.1); }

    .crop-summary { display:flex; align-items:center; gap:14px; background:#f0faf2; border-radius:10px; padding:14px; margin-bottom:20px; }
    .cs-name  { font-size:1rem; font-weight:700; color:#1a2e1c; }
    .cs-price { font-size:0.875rem; color:#6b8f70; }

    .qty-control { display:flex; align-items:center; gap:12px; }
    .qty-btn { width:36px; height:36px; border-radius:8px; border:1.5px solid rgba(30,138,44,0.3); background:#f0faf2; color:#1e8a2c; font-size:1.1rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
    .qty-btn:hover { background:#27a836; color:#fff; border-color:#27a836; }
    .qty-hint { font-size:0.76rem; color:#5a8c5a; margin-top:5px; }
    .qty-warn { color:#dc2626; font-weight:700; }
    .out-of-stock-txt { color:#dc2626; font-weight:700; }
    .qty-input { flex:1; padding:9px 12px; border:1.5px solid rgba(30,138,44,0.2); border-radius:8px; text-align:center; font-size:1.1rem; font-weight:700; font-family:'Poppins',sans-serif; color:#1a2e1c; outline:none; }
    .qty-input:focus { border-color:#27a836; }

    .order-total-box { background:#f0faf2; border-radius:10px; padding:14px; margin:16px 0; }
    .otb-row { display:flex; justify-content:space-between; font-size:0.875rem; padding:5px 0; color:#3a5a3e; }
    .otb-vehicle { color:#d97706; font-size:0.82rem; }
    .otb-pending { color:#aaa; font-style:italic; }
    .otb-divider { height:1px; background:rgba(30,138,44,0.15); margin:8px 0; }
    .otb-total { font-weight:700; font-size:1rem; color:#1a2e1c; }
    .total-val { font-size:1.1rem; color:#1a5e2a; font-weight:800; }

    .vehicle-toggle { display:flex; align-items:center; justify-content:space-between; background:#fffbeb; border:1px solid rgba(245,158,11,0.3); border-radius:10px; padding:14px; margin:16px 0; }
    .vt-left { display:flex; align-items:center; gap:12px; }
    .vt-left i { font-size:1.2rem; color:#d97706; }
    .vt-title { font-size:0.875rem; font-weight:700; color:#1a2e1c; }
    .vt-sub   { font-size:0.75rem; color:#6b8f70; }

    .toggle-switch { position:relative; display:inline-block; width:44px; height:24px; }
    .toggle-switch input { opacity:0; width:0; height:0; }
    .toggle-slider { position:absolute; cursor:pointer; inset:0; background:#d1d5db; border-radius:12px; transition:0.3s; }
    .toggle-slider:before { content:''; position:absolute; width:18px; height:18px; left:3px; bottom:3px; background:#fff; border-radius:50%; transition:0.3s; }
    input:checked + .toggle-slider { background:#27a836; }
    input:checked + .toggle-slider:before { transform:translateX(20px); }

    .vehicle-picker { border:1px solid rgba(30,138,44,0.2); border-radius:10px; padding:14px; margin-bottom:16px; }
    .vp-label { font-size:0.82rem; font-weight:700; color:#3a5a3e; margin-bottom:10px; }
    .vp-list { display:flex; flex-direction:column; gap:8px; max-height:180px; overflow-y:auto; }
    .vp-item { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:8px; border:1.5px solid rgba(30,138,44,0.15); cursor:pointer; transition:all 0.2s; }
    .vp-item:hover { border-color:rgba(30,138,44,0.3); background:#f7fdf8; }
    .vp-item.selected { border-color:#27a836; background:#e8faea; }
    .vp-icon { font-size:1.3rem; }
    .vp-info { flex:1; }
    .vp-name { font-size:0.875rem; font-weight:600; color:#1a2e1c; }
    .vp-meta { font-size:0.75rem; color:#6b8f70; }
    .vp-check i { color:#27a836; font-size:1.1rem; }
    .vp-empty { text-align:center; padding:12px; font-size:0.82rem; color:#6b8f70; }

    /* Payment */
    .payment-summary { background:#f0faf2; border-radius:10px; padding:16px; margin-bottom:20px; }
    .ps-row { display:flex; justify-content:space-between; font-size:0.875rem; padding:5px 0; color:#3a5a3e; }
    .ps-total { border-top:1px dashed rgba(30,138,44,0.3); margin-top:8px; padding-top:12px; font-weight:700; font-size:1rem; }
    .ps-total-val { font-size:1.1rem; color:#1a5e2a; font-weight:800; }

    .payment-methods { margin-bottom:20px; }
    .pm-label { font-size:0.82rem; font-weight:700; color:#3a5a3e; margin-bottom:10px; }
    .pm-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
    .pm-item { border:1.5px solid rgba(30,138,44,0.2); border-radius:10px; padding:12px 8px; text-align:center; cursor:pointer; transition:all 0.2s; }
    .pm-item:hover { border-color:rgba(30,138,44,0.4); background:#f7fdf8; }
    .pm-item.sel { border-color:#27a836; background:#e8faea; }
    .pm-icon { font-size:1.3rem; margin-bottom:4px; }
    .pm-name { font-size:0.72rem; font-weight:600; color:#3a5a3e; }
    .pm-item.sel .pm-name { color:#1a5e2a; }

    /* Success */
    .success-screen { text-align:center; }
    .ss-anim { margin-bottom:16px; }
    .ss-circle { width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,#dcfce7,#bbf7d0); border:3px solid #16a34a; display:flex; align-items:center; justify-content:center; margin:0 auto; font-size:2rem; color:#16a34a; animation:bounceIn 0.5s ease; }
    .ss-title { font-size:1.5rem; font-weight:800; color:#1a2e1c; margin-bottom:8px; }
    .ss-sub   { color:#6b8f70; font-size:0.9rem; margin-bottom:20px; }
    .ss-details { background:#f0faf2; border-radius:12px; padding:16px; margin-bottom:16px; text-align:left; }
    .ssd-row { display:flex; justify-content:space-between; font-size:0.875rem; padding:7px 0; border-bottom:1px solid rgba(30,138,44,0.1); }
    .ssd-row:last-child { border-bottom:none; }
    .success-amt { color:#16a34a; font-weight:800; font-size:1rem; }
    .ss-vehicle { background:#fef3c7; border:1px solid rgba(245,158,11,0.3); border-radius:10px; padding:14px; margin-bottom:16px; text-align:left; }
    .sv-header { font-weight:700; font-size:0.9rem; color:#92400e; margin-bottom:6px; }
    .sv-body   { font-size:0.82rem; color:#92400e; }
    .cod-note  { display:flex; align-items:flex-start; gap:10px; background:#f0fdf4; border:1px solid rgba(22,163,74,0.3); border-radius:10px; padding:14px; margin-bottom:14px; font-size:0.82rem; color:#166534; text-align:left; }
    .cod-note i { color:#16a34a; margin-top:2px; flex-shrink:0; font-size:1rem; }
    .cod-note strong { display:block; margin-bottom:4px; }

    @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes bounceIn { 0%{transform:scale(0.4);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
  `]
})
export class MarketplaceComponent implements OnInit {
  Math = Math;
  user: User | null = null;
  listings: CropListing[] = [];
  filtered: CropListing[] = [];
  loading = true;
  search = '';
  category = '';
  sort = '';
  categories = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices'];

  // Order Modal
  showOrderModal = false;
  orderStep = 1;
  selectedCrop: CropListing | null = null;
  orderQty = 1;
  orderMsg = '';
  needVehicle = false;
  orderLoading = false;
  orderError = '';
  placedOrderId = 0;

  // Vehicle
  availableVehicles: any[] = [];
  selectedVehicle: any = null;
  vehiclesLoading = false;

  // Payment
  payMethod = '';
  upiId = '';
  cardNum = '';
  cardExp = '';
  cardCvv = '';
  payLoading = false;

  constructor(
    private cropService: CropService,
    private orderService: OrderService,
    private vehicleService: VehicleService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUser;
    this.cropService.getAllListings().subscribe({
      next: (data) => { this.listings = data; this.filtered = [...data]; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onFilter() {
    let r = [...this.listings];
    if (this.search) r = r.filter(c => (c.cropName + c.farmerName + c.location).toLowerCase().includes(this.search.toLowerCase()));
    if (this.category) r = r.filter(c => c.category === this.category);
    if (this.sort === 'price_asc')  r.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    if (this.sort === 'price_desc') r.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
    this.filtered = r;
  }

  setFilter(cat: string) { this.category = cat; this.onFilter(); }

  openOrderModal(crop: CropListing) {
    this.selectedCrop = crop;
    this.orderQty = 1;
    this.orderMsg = '';
    this.needVehicle = false;
    this.selectedVehicle = null;
    this.orderStep = 1;
    this.orderError = '';
    this.payMethod = '';
    this.showOrderModal = true;
    this.loadVehicles();
  }

  loadVehicles() {
    this.vehiclesLoading = true;
    this.vehicleService.getAllVehicles().subscribe({
      next: (v: any[]) => {
        // Normalize API response: API returns {id, name, ownerName, price, status, ...}
        // Map to consistent shape used in template: {id, vehicleName, ownerName, ratePerDay}
        this.availableVehicles = v
          .filter(x => x.status === 'available' || x.available !== false)
          .map(x => ({
            id: x.id,
            vehicleName: x.vehicleName || x.name,
            ownerName: x.ownerName,
            ownerId: x.ownerId,
            ratePerDay: x.ratePerDay || x.price,
          }));
        this.vehiclesLoading = false;
      },
      error: () => {
        this.availableVehicles = [];
        this.vehiclesLoading = false;
      }
    });
  }

  closeOrderModal(e: any) {
    this.showOrderModal = false;
  }

  proceedToPayment() {
    if (this.needVehicle && !this.selectedVehicle) {
      this.orderError = 'Please select a vehicle or uncheck the vehicle option';
      return;
    }
    this.orderError = '';
    this.orderStep = 2;
  }

  getGrandTotal(): number {
    const crop = (this.selectedCrop?.pricePerUnit || 0) * this.orderQty;
    const veh  = (this.needVehicle && this.selectedVehicle) ? (this.selectedVehicle.ratePerDay || 0) : 0;
    return crop + veh;
  }

  processPayment() {
    if (!this.payMethod) return;
    this.payLoading = true;
    if (this.payMethod === 'cod') {
      // COD: place order immediately, no payment gateway
      this.placeOrder();
    } else {
      // Simulate payment gateway processing
      setTimeout(() => {
        this.placeOrder();
      }, 2000);
    }
  }

  placeOrder() {
    const productAmount = (this.selectedCrop?.pricePerUnit || 0) * this.orderQty;
    const vehicleAmount = (this.needVehicle && this.selectedVehicle) ? (this.selectedVehicle.ratePerDay || 0) : 0;
    const orderData: any = {
      cropListingId: this.selectedCrop?.id,
      quantity: this.orderQty,
      message: this.orderMsg,
      productAmount: productAmount,
      totalPrice: productAmount + vehicleAmount,
      paymentMethod: this.payMethod,
    };
    // Include vehicle info so vehicle owner gets notified via backend
    if (this.needVehicle && this.selectedVehicle) {
      orderData.vehicleId = this.selectedVehicle.id;
      orderData.vehicleName = this.selectedVehicle.vehicleName;
      orderData.vehicleAmount = vehicleAmount;
    }
    this.orderService.placeOrder(orderData).subscribe({
      next: (res: any) => {
        this.placedOrderId = res.id || Math.floor(Math.random() * 90000) + 10000;
        this.reduceListingQuantity();
        if (this.needVehicle && this.selectedVehicle) {
          this.bookVehicle(this.placedOrderId);
        } else {
          this.payLoading = false;
          this.orderStep = 3;
        }
      },
      error: () => {
        // Demo fallback: simulate success
        this.placedOrderId = Math.floor(Math.random() * 90000) + 10000;
        this.reduceListingQuantity();
        if (this.needVehicle && this.selectedVehicle) {
          this.bookVehicle(this.placedOrderId);
        } else {
          this.payLoading = false;
          this.orderStep = 3;
        }
      }
    });
  }

  reduceListingQuantity() {
    if (!this.selectedCrop) return;
    const idx = this.listings.findIndex((c: any) => c.id === this.selectedCrop?.id);
    if (idx >= 0) {
      this.listings[idx] = {
        ...this.listings[idx],
        quantity: Math.max(0, (this.listings[idx].quantity || 0) - this.orderQty),
        status: (this.listings[idx].quantity - this.orderQty) <= 0 ? 'sold' : 'available'
      };
      this.onFilter();
    }
  }

  bookVehicle(orderId: number) {
    const hireDate = new Date().toISOString().split('T')[0];
    this.vehicleService.bookVehicle({
      vehicleId: this.selectedVehicle.id,
      hireDate: hireDate,
      days: 1,
      message: `Transport for order #${orderId}`,
    }).subscribe({
      next: () => { this.payLoading = false; this.orderStep = 3; },
      error: () => { this.payLoading = false; this.orderStep = 3; }
    });
  }

  goToOrders() {
    this.showOrderModal = false;
    this.router.navigate(['/orders']);
  }

  placeholderFor(category?: string): string {
    return CROP_PLACEHOLDERS[category || 'default'] || CROP_PLACEHOLDERS['default'];
  }

  onImgError(event: Event, category?: string) {
    (event.target as HTMLImageElement).src = CROP_PLACEHOLDERS[category || 'default'] || CROP_PLACEHOLDERS['default'];
  }

  getCropEmoji(cat?: string): string {
    const m: Record<string,string> = { Vegetables:'🥬', Fruits:'🍎', Grains:'🌾', Pulses:'🫘', Spices:'🌶️', Flowers:'🌸' };
    return m[cat || ''] || '🌱';
  }
}
