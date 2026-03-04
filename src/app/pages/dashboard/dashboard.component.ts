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
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CropService, OrderService, StatsService, VehicleService, ManpowerService } from '../../services/services';
import { User, CropListing } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- ── ZEN HERO BANNER ── -->
    <div class="hero-banner">
      <div class="hb-bg-pattern"></div>
      <div class="hb-orb hb-orb-1"></div>
      <div class="hb-orb hb-orb-2"></div>
      <div class="hb-content">
        <div class="hb-left">
          <div class="hb-avatar" [style.background]="roleGradient(user?.role)">
            {{ userName.charAt(0).toUpperCase() }}
          </div>
          <div>
            <div class="hb-greet">Good {{ timeOfDay }} ✦</div>
            <h1 class="hb-name">{{ userName }}</h1>
            <div class="hb-badges">
              <span class="hb-role-badge" [class]="'rb-'+user?.role">
                <i class="fas fa-{{ getRoleIcon(user?.role) }}"></i> {{ formatRole(user?.role) }}
              </span>
              <span class="hb-date-badge">{{ today }}</span>
            </div>
          </div>
        </div>
        <div class="hb-right">
          <a routerLink="/marketplace" class="hb-cta">
            <i class="fas fa-store"></i> Browse Market
          </a>
          <a routerLink="/chat" class="hb-cta hb-cta-ghost">
            <i class="fas fa-comment-dots"></i> Chat
          </a>
        </div>
      </div>
      <!-- Platform stats strip inside banner -->
      <div class="hb-stats" *ngIf="platformStats">
        <div class="hbs-item" *ngFor="let s of platformStats">
          <span class="hbs-icon">{{ s.icon }}</span>
          <span class="hbs-val">{{ s.val }}</span>
          <span class="hbs-lbl">{{ s.label }}</span>
        </div>
      </div>
    </div>

    <!-- ── FARMER VIEW ── -->
    <ng-container *ngIf="user?.role==='farmer'">
      <div class="kpi-row">
        <div class="kpi-card zen-card" *ngFor="let k of farmerKpis; let i=index" [style.animation-delay]="(i*80)+'ms'">
          <div class="kc-head">
            <div class="kc-icon" [style.background]="k.bg"><i [class]="k.icon" [style.color]="k.color"></i></div>
            <span class="kc-tag" [style.color]="k.color" [style.background]="k.bg">{{ k.badge }}</span>
          </div>
          <div class="kc-value">{{ k.val }}</div>
          <div class="kc-label">{{ k.label }}</div>
          <div class="kc-track"><div class="kc-fill" [style.width]="k.pct+'%'" [style.background]="k.color"></div></div>
        </div>
      </div>

      <div class="dual-grid">
        <!-- My Listings -->
        <div class="zen-card dash-card">
          <div class="dc-header">
            <div class="dc-title"><span class="dc-dot dot-green"></span>My Listings</div>
            <a routerLink="/my-listings" class="dc-link">See all <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="empty-zen" *ngIf="listings.length===0">
            <div class="ez-ico">🌱</div>
            <div class="ez-msg">No listings yet</div>
            <a routerLink="/my-listings" class="btn-mini">+ Add Crop</a>
          </div>
          <div class="item-stack" *ngIf="listings.length>0">
            <div class="is-row" *ngFor="let l of listings.slice(0,5)">
              <img
                [src]="l.imageUrl || placeholderFor(l.category)"
                [alt]="l.cropName"
                class="is-crop-img"
                (error)="onImgError($event, l.category)"
              >
              <div class="is-body">
                <div class="is-name">{{ l.cropName }}</div>
                <div class="is-meta">{{ l.quantity }}{{ l.unit }} · <b>₹{{ l.pricePerUnit }}</b>/{{ l.unit }}</div>
              </div>
              <span class="status-tag" [class.st-green]="l.status==='available'" [class.st-amber]="l.status!=='available'">{{ l.status }}</span>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="zen-card dash-card">
          <div class="dc-header">
            <div class="dc-title"><span class="dc-dot dot-blue"></span>Recent Orders</div>
            <a routerLink="/orders" class="dc-link">See all <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="empty-zen" *ngIf="recentOrders.length===0">
            <div class="ez-ico">📭</div>
            <div class="ez-msg">No orders received yet</div>
          </div>
          <div class="item-stack" *ngIf="recentOrders.length>0">
            <div class="is-row" *ngFor="let o of recentOrders.slice(0,5)">
              <div class="is-emoji">🧾</div>
              <div class="is-body">
                <div class="is-name">{{ o.cropName }}</div>
                <div class="is-meta">{{ o.buyerName }} · ₹{{ o.totalPrice }}</div>
              </div>
              <span class="status-tag" [class]="'st-'+getStatusColor(o.status)">{{ o.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick actions for farmer -->
      <div class="section-divider"><span>Quick Actions</span></div>
      <div class="qa-grid">
        <a routerLink="/my-listings" class="qa-card">
          <div class="qa-ico" style="background:#dcfce7;color:#16a34a"><i class="fas fa-plus-circle"></i></div>
          <div class="qa-label">Add Listing</div>
          <div class="qa-sub">List your crop</div>
          <i class="fas fa-arrow-up-right qa-arrow"></i>
        </a>
        <a routerLink="/vehicles" class="qa-card">
          <div class="qa-ico" style="background:#fef3c7;color:#d97706"><i class="fas fa-tractor"></i></div>
          <div class="qa-label">Hire Vehicle</div>
          <div class="qa-sub">For transport</div>
          <i class="fas fa-arrow-up-right qa-arrow"></i>
        </a>
        <a routerLink="/manpower" class="qa-card">
          <div class="qa-ico" style="background:#fce7f3;color:#db2777"><i class="fas fa-people-carry"></i></div>
          <div class="qa-label">Find Workers</div>
          <div class="qa-sub">Harvest help</div>
          <i class="fas fa-arrow-up-right qa-arrow"></i>
        </a>
        <a routerLink="/chat" class="qa-card">
          <div class="qa-ico" style="background:#dbeafe;color:#2563eb"><i class="fas fa-comment-dots"></i></div>
          <div class="qa-label">Messages</div>
          <div class="qa-sub">Chat with buyers</div>
          <i class="fas fa-arrow-up-right qa-arrow"></i>
        </a>
      </div>
    </ng-container>

    <!-- ── BUYER VIEW ── -->
    <ng-container *ngIf="user?.role==='buyer'">
      <div class="kpi-row">
        <div class="kpi-card zen-card" *ngFor="let k of buyerKpis; let i=index" [style.animation-delay]="(i*80)+'ms'">
          <div class="kc-head">
            <div class="kc-icon" [style.background]="k.bg"><i [class]="k.icon" [style.color]="k.color"></i></div>
            <span class="kc-tag" [style.color]="k.color" [style.background]="k.bg">{{ k.badge }}</span>
          </div>
          <div class="kc-value">{{ k.val }}</div>
          <div class="kc-label">{{ k.label }}</div>
          <div class="kc-track"><div class="kc-fill" [style.width]="k.pct+'%'" [style.background]="k.color"></div></div>
        </div>
      </div>

      <div class="dual-grid">
        <div class="zen-card dash-card">
          <div class="dc-header">
            <div class="dc-title"><span class="dc-dot dot-green"></span>Fresh Listings</div>
            <a routerLink="/marketplace" class="dc-link">Browse all <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="item-stack">
            <div class="is-row" *ngFor="let l of listings.slice(0,5)">
              <img
                [src]="l.imageUrl || placeholderFor(l.category)"
                [alt]="l.cropName"
                class="is-crop-img"
                (error)="onImgError($event, l.category)"
              >
              <div class="is-body">
                <div class="is-name">{{ l.cropName }}</div>
                <div class="is-meta">{{ l.farmerName }} · ₹{{ l.pricePerUnit }}/{{ l.unit }}</div>
              </div>
              <a [routerLink]="['/marketplace']" class="btn-mini">Buy</a>
            </div>
            <div class="empty-zen" *ngIf="listings.length===0">
              <div class="ez-ico">🌾</div><div class="ez-msg">No listings available</div>
            </div>
          </div>
        </div>

        <div class="zen-card dash-card">
          <div class="dc-header">
            <div class="dc-title"><span class="dc-dot dot-blue"></span>My Orders</div>
            <a routerLink="/orders" class="dc-link">See all <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="empty-zen" *ngIf="recentOrders.length===0">
            <div class="ez-ico">📦</div>
            <div class="ez-msg">No orders placed yet</div>
            <a routerLink="/marketplace" class="btn-mini">Shop Now</a>
          </div>
          <div class="item-stack" *ngIf="recentOrders.length>0">
            <div class="is-row" *ngFor="let o of recentOrders.slice(0,5)">
              <div class="is-emoji">🧾</div>
              <div class="is-body">
                <div class="is-name">{{ o.cropName }}</div>
                <div class="is-meta">{{ o.farmerName }} · ₹{{ o.totalPrice }}</div>
              </div>
              <span class="status-tag" [class]="'st-'+getStatusColor(o.status)">{{ o.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section-divider"><span>Quick Actions</span></div>
      <div class="qa-grid">
        <a routerLink="/marketplace" class="qa-card">
          <div class="qa-ico" style="background:#dcfce7;color:#16a34a"><i class="fas fa-store"></i></div>
          <div class="qa-label">Marketplace</div><div class="qa-sub">Browse crops</div>
          <i class="fas fa-arrow-up-right qa-arrow"></i>
        </a>
        <a routerLink="/vehicles" class="qa-card">
          <div class="qa-ico" style="background:#fef3c7;color:#d97706"><i class="fas fa-tractor"></i></div>
          <div class="qa-label">Hire Vehicle</div><div class="qa-sub">Book transport</div>
          <i class="fas fa-arrow-up-right qa-arrow"></i>
        </a>
        <a routerLink="/manpower" class="qa-card">
          <div class="qa-ico" style="background:#fce7f3;color:#db2777"><i class="fas fa-people-carry"></i></div>
          <div class="qa-label">Find Workers</div><div class="qa-sub">Labour help</div>
          <i class="fas fa-arrow-up-right qa-arrow"></i>
        </a>
        <a routerLink="/chat" class="qa-card">
          <div class="qa-ico" style="background:#dbeafe;color:#2563eb"><i class="fas fa-comment-dots"></i></div>
          <div class="qa-label">Messages</div><div class="qa-sub">Chat with farmers</div>
          <i class="fas fa-arrow-up-right qa-arrow"></i>
        </a>
      </div>
    </ng-container>

    <!-- ── VEHICLE OWNER VIEW ── -->
    <ng-container *ngIf="user?.role==='vehicle_owner'">
      <div class="role-hero-card zen-card" style="--role-color:#d97706;--role-bg:#fef3c7">
        <div class="rhc-glow"></div>
        <div class="rhc-emoji">🚜</div>
        <div class="rhc-body">
          <div class="rhc-title">Vehicle Owner Dashboard</div>
          <div class="rhc-sub">Manage your fleet, accept bookings and grow your business.</div>
        </div>
        <a routerLink="/vehicles" class="rhc-cta">Manage Fleet <i class="fas fa-arrow-right"></i></a>
      </div>
      <div class="qa-grid">
        <a routerLink="/vehicles" class="qa-card">
          <div class="qa-ico" style="background:#fef3c7;color:#d97706"><i class="fas fa-tractor"></i></div>
          <div class="qa-label">My Vehicles</div><div class="qa-sub">Add & manage</div>
          <i class="fas fa-arrow-up-right qa-arrow"></i>
        </a>
        <a routerLink="/marketplace" class="qa-card">
          <div class="qa-ico" style="background:#dcfce7;color:#16a34a"><i class="fas fa-store"></i></div>
          <div class="qa-label">Marketplace</div><div class="qa-sub">Find clients</div>
          <i class="fas fa-arrow-up-right qa-arrow"></i>
        </a>
        <a routerLink="/chat" class="qa-card">
          <div class="qa-ico" style="background:#dbeafe;color:#2563eb"><i class="fas fa-comment-dots"></i></div>
          <div class="qa-label">Messages</div><div class="qa-sub">Client enquiries</div>
          <i class="fas fa-arrow-up-right qa-arrow"></i>
        </a>
        <a routerLink="/profile" class="qa-card">
          <div class="qa-ico" style="background:#ede9fe;color:#7c3aed"><i class="fas fa-user-circle"></i></div>
          <div class="qa-label">My Profile</div><div class="qa-sub">Edit details</div>
          <i class="fas fa-arrow-up-right qa-arrow"></i>
        </a>
      </div>
    </ng-container>

    <!-- ── MANPOWER VIEW ── -->
    <ng-container *ngIf="user?.role==='manpower'">
      <div class="role-hero-card zen-card" style="--role-color:#db2777;--role-bg:#fce7f3">
        <div class="rhc-glow"></div>
        <div class="rhc-emoji">👷</div>
        <div class="rhc-body">
          <div class="rhc-title">Manpower Dashboard</div>
          <div class="rhc-sub">Showcase your skills, get hired by farmers and grow your income.</div>
        </div>
        <a routerLink="/manpower" class="rhc-cta">My Profile <i class="fas fa-arrow-right"></i></a>
      </div>
      <div class="qa-grid">
        <a routerLink="/manpower" class="qa-card">
          <div class="qa-ico" style="background:#fce7f3;color:#db2777"><i class="fas fa-id-card"></i></div>
          <div class="qa-label">My Profile</div><div class="qa-sub">Skills & rate</div>
          <i class="fas fa-arrow-up-right qa-arrow"></i>
        </a>
        <a routerLink="/marketplace" class="qa-card">
          <div class="qa-ico" style="background:#dcfce7;color:#16a34a"><i class="fas fa-store"></i></div>
          <div class="qa-label">Marketplace</div><div class="qa-sub">Browse listings</div>
          <i class="fas fa-arrow-up-right qa-arrow"></i>
        </a>
        <a routerLink="/chat" class="qa-card">
          <div class="qa-ico" style="background:#dbeafe;color:#2563eb"><i class="fas fa-comment-dots"></i></div>
          <div class="qa-label">Messages</div><div class="qa-sub">Farmer requests</div>
          <i class="fas fa-arrow-up-right qa-arrow"></i>
        </a>
        <a routerLink="/profile" class="qa-card">
          <div class="qa-ico" style="background:#ede9fe;color:#7c3aed"><i class="fas fa-user-circle"></i></div>
          <div class="qa-label">Account</div><div class="qa-sub">Edit profile</div>
          <i class="fas fa-arrow-up-right qa-arrow"></i>
        </a>
      </div>
    </ng-container>
  `,
  styles: [`
    /* ── Hero Banner ── */
    .hero-banner {
      background:linear-gradient(140deg,#1a3d24 0%,#255c30 55%,#4a9050 100%);
      border-radius:20px; margin-bottom:24px;
      overflow:hidden; position:relative;
      animation:fadeUp 0.5s ease both;
    }
    .hb-bg-pattern {
      position:absolute; inset:0;
      background-image:radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
      background-size:20px 20px; pointer-events:none;
    }
    .hb-orb { position:absolute; border-radius:50%; pointer-events:none; }
    .hb-orb-1 { width:280px; height:280px; top:-80px; right:-60px; background:rgba(255,255,255,0.04); }
    .hb-orb-2 { width:160px; height:160px; bottom:-40px; left:10%; background:rgba(255,255,255,0.03); }
    .hb-content { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; padding:28px 32px 20px; position:relative; z-index:2; }
    .hb-left  { display:flex; align-items:center; gap:16px; }
    .hb-avatar {
      width:56px; height:56px; border-radius:16px; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
      font-weight:900; font-size:1.4rem; color:#fff;
      border:2px solid rgba(255,255,255,0.2);
    }
    .hb-greet { font-size:0.78rem; color:rgba(255,255,255,0.55); margin-bottom:2px; }
    .hb-name  { font-size:1.6rem; font-weight:900; color:#fff; letter-spacing:-0.02em; line-height:1; }
    .hb-badges { display:flex; align-items:center; gap:8px; margin-top:8px; flex-wrap:wrap; }
    .hb-role-badge {
      display:inline-flex; align-items:center; gap:5px;
      padding:4px 11px; border-radius:99px; font-size:0.74rem; font-weight:700;
    }
    .rb-farmer  { background:rgba(74,222,128,0.2); color:#86efac; }
    .rb-buyer   { background:rgba(147,197,253,0.2); color:#93c5fd; }
    .rb-vehicle_owner { background:rgba(253,211,77,0.2); color:#fde047; }
    .rb-manpower { background:rgba(249,168,212,0.2); color:#f9a8d4; }
    .rb-admin   { background:rgba(196,181,253,0.2); color:#c4b5fd; }
    .hb-date-badge { font-size:0.72rem; color:rgba(255,255,255,0.45); }
    .hb-right { display:flex; gap:10px; flex-wrap:wrap; }
    .hb-cta {
      display:inline-flex; align-items:center; gap:7px;
      padding:9px 18px; border-radius:10px; font-size:0.85rem; font-weight:700;
      background:rgba(255,255,255,0.15); color:#fff; text-decoration:none;
      border:1.5px solid rgba(255,255,255,0.25); transition:all 0.18s;
    }
    .hb-cta:hover { background:rgba(255,255,255,0.25); }
    .hb-cta-ghost { background:transparent; border-color:rgba(255,255,255,0.18); color:rgba(255,255,255,0.75); }
    /* Platform stats inside banner */
    .hb-stats { display:flex; gap:0; border-top:1px solid rgba(255,255,255,0.08); position:relative; z-index:2; }
    .hbs-item {
      flex:1; display:flex; align-items:center; gap:8px;
      padding:14px 20px; border-right:1px solid rgba(255,255,255,0.08);
    }
    .hbs-item:last-child { border-right:none; }
    .hbs-icon { font-size:1.1rem; }
    .hbs-val  { font-size:0.96rem; font-weight:800; color:#fff; }
    .hbs-lbl  { font-size:0.7rem; color:rgba(255,255,255,0.45); }
    @media(max-width:768px) { .hbs-item { padding:10px 12px; } .hb-content { padding:20px 18px 14px; } .hb-name { font-size:1.3rem; } }

    /* ── KPI Row ── */
    .kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
    @media(max-width:1100px) { .kpi-row { grid-template-columns:repeat(2,1fr); } }
    @media(max-width:480px)  { .kpi-row { grid-template-columns:1fr; } }

    /* ── Zen Card ── */
    .zen-card {
      background:#fff; border-radius:16px;
      border:1px solid rgba(53,117,64,0.1);
      box-shadow:0 2px 10px rgba(0,0,0,0.05);
      transition:transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      animation:fadeUp 0.4s ease both;
    }
    .zen-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.09); border-color:rgba(53,117,64,0.2); }

    /* KPI card innards */
    .kpi-card { padding:20px; }
    .kc-head  { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
    .kc-icon  { width:42px; height:42px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:1rem; }
    .kc-tag   { padding:3px 9px; border-radius:99px; font-size:0.68rem; font-weight:700; }
    .kc-value { font-size:1.7rem; font-weight:900; color:#1c2e1e; line-height:1; font-family:'Outfit',sans-serif; }
    .kc-label { font-size:0.74rem; color:var(--text-muted); margin:4px 0 12px; }
    .kc-track { height:4px; background:#f0faf2; border-radius:99px; overflow:hidden; }
    .kc-fill  { height:100%; border-radius:99px; transition:width 1.2s cubic-bezier(0.34,1.56,0.64,1); }

    /* ── Dual grid ── */
    .dual-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:24px; }
    @media(max-width:900px) { .dual-grid { grid-template-columns:1fr; } }
    .dash-card { padding:20px; }
    .dc-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
    .dc-title  { display:flex; align-items:center; gap:8px; font-size:0.9rem; font-weight:700; color:var(--text-primary); }
    .dc-dot    { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .dot-green { background:#22c55e; box-shadow:0 0 6px rgba(34,197,94,0.5); }
    .dot-blue  { background:#3b82f6; box-shadow:0 0 6px rgba(59,130,246,0.5); }
    .dc-link   { font-size:0.78rem; font-weight:600; color:var(--sage-600); text-decoration:none; display:flex; align-items:center; gap:4px; }
    .dc-link:hover { color:var(--sage-800); }

    /* Item stack */
    .item-stack { display:flex; flex-direction:column; gap:2px; }
    .is-row { display:flex; align-items:center; gap:11px; padding:9px 8px; border-radius:10px; transition:background 0.15s; }
    .is-row:hover { background:var(--sage-50); }
    .is-crop-img { width:40px; height:40px; object-fit:cover; border-radius:8px; flex-shrink:0; }
    .is-body  { flex:1; min-width:0; }
    .is-name  { font-size:0.85rem; font-weight:700; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .is-meta  { font-size:0.74rem; color:var(--text-muted); }
    .status-tag { padding:3px 9px; border-radius:99px; font-size:0.68rem; font-weight:700; white-space:nowrap; flex-shrink:0; }
    .st-green { background:#dcfce7; color:#16a34a; }
    .st-amber { background:#fef3c7; color:#d97706; }
    .st-blue  { background:#dbeafe; color:#2563eb; }
    .st-red   { background:#fee2e2; color:#dc2626; }

    /* ── Role Hero Card ── */
    .role-hero-card {
      display:flex; align-items:center; gap:20px;
      padding:24px 28px; margin-bottom:24px;
      position:relative; overflow:hidden; flex-wrap:wrap;
    }
    .rhc-glow { position:absolute; top:-30px; right:-30px; width:180px; height:180px; border-radius:50%; background:radial-gradient(circle, var(--role-bg, #fef3c7) 0%, transparent 70%); opacity:0.8; }
    .rhc-emoji { font-size:2.8rem; position:relative; z-index:2; animation:float 3s ease-in-out infinite; }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    .rhc-body { flex:1; position:relative; z-index:2; }
    .rhc-title { font-size:1.1rem; font-weight:800; color:var(--text-primary); }
    .rhc-sub   { font-size:0.85rem; color:var(--text-muted); margin-top:4px; }
    .rhc-cta   {
      display:inline-flex; align-items:center; gap:7px;
      padding:10px 20px; border-radius:10px; font-size:0.875rem; font-weight:700;
      background:var(--role-color, #d97706); color:#fff; text-decoration:none;
      transition:all 0.2s; position:relative; z-index:2;
    }
    .rhc-cta:hover { filter:brightness(1.1); transform:translateY(-1px); }

    /* ── Section Divider ── */
    .section-divider { display:flex; align-items:center; gap:12px; margin:24px 0 16px; }
    .section-divider::before, .section-divider::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,rgba(53,117,64,0.12),transparent); }
    .section-divider::after { background:linear-gradient(270deg,rgba(53,117,64,0.12),transparent); }
    .section-divider span { font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:var(--text-muted); white-space:nowrap; }

    /* ── Quick Actions ── */
    .qa-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px; }
    @media(max-width:1000px) { .qa-grid { grid-template-columns:repeat(2,1fr); } }
    @media(max-width:480px)  { .qa-grid { grid-template-columns:repeat(2,1fr); } }
    .qa-card {
      display:block; background:#fff; border:1px solid rgba(53,117,64,0.1);
      border-radius:14px; padding:18px 16px; cursor:pointer; text-decoration:none;
      transition:all 0.2s; position:relative; overflow:hidden;
      animation:fadeUp 0.4s ease both;
    }
    .qa-card:hover { transform:translateY(-3px); box-shadow:0 8px 20px rgba(0,0,0,0.1); border-color:rgba(53,117,64,0.22); }
    .qa-ico { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.05rem; margin-bottom:12px; }
    .qa-label { font-size:0.88rem; font-weight:800; color:var(--text-primary); margin-bottom:2px; }
    .qa-sub   { font-size:0.74rem; color:var(--text-muted); }
    .qa-arrow { position:absolute; top:14px; right:14px; color:#d1d5db; font-size:0.75rem; transition:all 0.2s; }
    .qa-card:hover .qa-arrow { color:var(--sage-500); transform:translate(2px,-2px); }

    /* Empty & btn-mini */
    .empty-zen { text-align:center; padding:24px 16px; }
    .ez-ico  { font-size:2rem; margin-bottom:6px; }
    .ez-msg  { font-size:0.84rem; color:var(--text-muted); margin-bottom:12px; }
    .btn-mini { display:inline-flex; align-items:center; gap:5px; padding:6px 14px; border-radius:8px; font-size:0.78rem; font-weight:700; background:var(--sage-100); color:var(--sage-700); text-decoration:none; transition:all 0.15s; border:none; cursor:pointer; font-family:'Outfit',sans-serif; }
    .btn-mini:hover { background:var(--sage-500); color:#fff; }

    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  `]
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  userName = '';
  today = '';
  timeOfDay = 'morning';
  listings: CropListing[] = [];
  recentOrders: any[] = [];
  platformStats: any[] | null = null;

  farmerKpis = [
    { icon:'fas fa-seedling',          val:'0',   label:'Active Listings', bg:'#dcfce7', color:'#16a34a', pct:60, badge:'Live'   },
    { icon:'fas fa-receipt',           val:'0',   label:'Total Orders',    bg:'#dbeafe', color:'#2563eb', pct:40, badge:'Orders' },
    { icon:'fas fa-indian-rupee-sign', val:'₹0',  label:'Revenue Earned',  bg:'#fef3c7', color:'#d97706', pct:75, badge:'Earned' },
    { icon:'fas fa-star',              val:'4.8', label:'Rating',          bg:'#ede9fe', color:'#7c3aed', pct:96, badge:'Top'    },
  ];
  buyerKpis = [
    { icon:'fas fa-shopping-bag',      val:'0',  label:'My Orders',       bg:'#dbeafe', color:'#2563eb', pct:50,  badge:'Placed'  },
    { icon:'fas fa-store',             val:'0',  label:'Items Available', bg:'#dcfce7', color:'#16a34a', pct:100, badge:'Fresh'   },
    { icon:'fas fa-indian-rupee-sign', val:'₹0', label:'Total Spent',     bg:'#fef3c7', color:'#d97706', pct:35,  badge:'Spent'   },
    { icon:'fas fa-map-marker-alt',    val:'12', label:'States Covered',  bg:'#fce7f3', color:'#db2777', pct:80,  badge:'Pan-IN'  },
  ];

  constructor(
    private authService: AuthService,
    private cropService: CropService,
    private orderService: OrderService,
    private statsService: StatsService
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUser;
    this.userName = this.user?.name?.split(' ')[0] || 'there';
    const h = new Date().getHours();
    this.timeOfDay = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
    this.today = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

    this.cropService.getAllListings().subscribe({ next: d => { this.listings = d; this.farmerKpis[0].val = String(d.length); this.buyerKpis[1].val = String(d.length); }, error: () => {} });
    this.orderService.getMyOrders().subscribe({ next: orders => {
      this.recentOrders = orders;
      const total = orders.reduce((s: number, o: any) => s + (o.totalPrice || 0), 0);
      if (this.user?.role === 'farmer') { this.farmerKpis[1].val = String(orders.length); this.farmerKpis[2].val = '₹' + this.fmtMoney(total); this.farmerKpis[1].pct = Math.min(100, orders.length*10); }
      else if (this.user?.role === 'buyer') { this.buyerKpis[0].val = String(orders.length); this.buyerKpis[2].val = '₹' + this.fmtMoney(total); this.buyerKpis[0].pct = Math.min(100, orders.length*10); }
    }, error: () => {} });
    this.statsService.getStats().subscribe({ next: s => {
      this.platformStats = [
        { icon:'🌾', val:(s.total_farmers||0)+'+',  label:'Farmers'  },
        { icon:'🛒', val:(s.total_buyers||0)+'+',   label:'Buyers'   },
        { icon:'📦', val:(s.active_listings||0)+'+',label:'Listings' },
        { icon:'🚜', val:(s.total_vehicles||0)+'+', label:'Vehicles' },
      ];
    }, error: () => {} });
  }

  fmtMoney(n: number): string {
    if (n >= 100000) return (n/100000).toFixed(1)+'L';
    if (n >= 1000) return (n/1000).toFixed(1)+'K';
    return String(Math.round(n));
  }
  getRoleIcon(r?: string): string { const m: Record<string,string> = { farmer:'leaf', buyer:'shopping-bag', vehicle_owner:'tractor', manpower:'hard-hat', admin:'shield-alt' }; return m[r||'']||'user'; }
  formatRole(r?: string): string { const m: Record<string,string> = { farmer:'Farmer', buyer:'Buyer', vehicle_owner:'Vehicle Owner', manpower:'Manpower', admin:'Admin' }; return m[r||'']||r||''; }
  getCropEmoji(c?: string): string { const m: Record<string,string> = { Vegetables:'🥬', Fruits:'🍎', Grains:'🌾', Pulses:'🫘', Spices:'🌶️', Flowers:'🌸' }; return m[c||'']||'🌱'; }
  placeholderFor(category?: string): string { return CROP_PLACEHOLDERS[category || 'default'] || CROP_PLACEHOLDERS['default']; }
  onImgError(event: Event, category?: string) { (event.target as HTMLImageElement).src = CROP_PLACEHOLDERS[category || 'default'] || CROP_PLACEHOLDERS['default']; }
  getStatusColor(s: string): string { const m: Record<string,string> = { pending:'amber', accepted:'green', completed:'blue', rejected:'red', cancelled:'red' }; return m[s]||''; }
  roleGradient(r?: string): string { const m: Record<string,string> = { farmer:'linear-gradient(135deg,#4a9050,#255c30)', buyer:'linear-gradient(135deg,#3b82f6,#1d4ed8)', vehicle_owner:'linear-gradient(135deg,#f59e0b,#b45309)', manpower:'linear-gradient(135deg,#ec4899,#9d174d)', admin:'linear-gradient(135deg,#8b5cf6,#4c1d95)' }; return m[r||'']||'linear-gradient(135deg,#6b7280,#374151)'; }
}
