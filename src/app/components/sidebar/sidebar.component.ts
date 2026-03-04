import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <!-- Brand -->
      <div class="sb-brand">
        <div class="sb-logo-wrap">
          <div class="sb-logo">
            <svg width="20" height="20" viewBox="0 0 34 34" fill="none">
              <path d="M17 8v12M13 12l4-4 4 4" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="17" cy="24" r="2.5" fill="rgba(255,255,255,0.9)"/>
              <path d="M9 16c-1-3 1-6 4-6-1 3-1 5 0 7" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
              <path d="M25 16c1-3-1-6-4-6 1 3 1 5 0 7" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
            </svg>
          </div>
        </div>
        <div>
          <div class="sb-name">AgriConnect</div>
          <div class="sb-ver">Hub · v5.0</div>
        </div>
      </div>

      <!-- User card -->
      <div class="sb-user" *ngIf="user">
        <div class="sb-av" [style.background]="roleGradient(user.role)">{{ (user.name||'U').charAt(0).toUpperCase() }}</div>
        <div class="sb-user-info">
          <div class="sb-uname">{{ user.name }}</div>
          <div class="sb-urole">{{ formatRole(user.role) }}</div>
        </div>
        <div class="sb-kyc" [class.kyc-ok]="user.kycVerified" [title]="user.kycVerified ? 'KYC Verified' : 'KYC Pending'">
          <i [class]="user.kycVerified ? 'fas fa-shield-check' : 'fas fa-clock'"></i>
        </div>
      </div>

      <div class="sb-divider"></div>

      <!-- Nav -->
      <nav class="sb-nav">

        <!-- ADMIN -->
        <ng-container *ngIf="user?.role==='admin'">
          <div class="nav-group">
            <div class="nav-group-label">Platform</div>
            <a routerLink="/admin" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-tachometer-alt"></i></span>
              <span>Admin Dashboard</span>
            </a>
            <a routerLink="/marketplace" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-store"></i></span>
              <span>Marketplace</span>
            </a>
          </div>
        </ng-container>

        <!-- FARMER -->
        <ng-container *ngIf="user?.role==='farmer'">
          <div class="nav-group">
            <div class="nav-group-label">Overview</div>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-seedling"></i></span><span>Dashboard</span>
            </a>
            <a routerLink="/marketplace" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-store"></i></span><span>Marketplace</span>
            </a>
          </div>
          <div class="nav-group">
            <div class="nav-group-label">My Farm</div>
            <a routerLink="/my-listings" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-leaf"></i></span><span>My Listings</span>
            </a>
            <a routerLink="/orders" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-receipt"></i></span><span>Orders</span>
            </a>
          </div>
          <div class="nav-group">
            <div class="nav-group-label">Services</div>
            <a routerLink="/vehicles" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-tractor"></i></span><span>Hire Vehicle</span>
            </a>
            <a routerLink="/manpower" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-people-carry"></i></span><span>Find Manpower</span>
            </a>
            <a routerLink="/chat" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-comment-dots"></i></span><span>Messages</span>
            </a>
          </div>
        </ng-container>

        <!-- BUYER -->
        <ng-container *ngIf="user?.role==='buyer'">
          <div class="nav-group">
            <div class="nav-group-label">Overview</div>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-th-large"></i></span><span>Dashboard</span>
            </a>
            <a routerLink="/marketplace" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-store"></i></span><span>Marketplace</span>
            </a>
          </div>
          <div class="nav-group">
            <div class="nav-group-label">Shopping</div>
            <a routerLink="/orders" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-shopping-basket"></i></span><span>My Orders</span>
            </a>
          </div>
          <div class="nav-group">
            <div class="nav-group-label">Services</div>
            <a routerLink="/vehicles" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-tractor"></i></span><span>Hire Vehicle</span>
            </a>
            <a routerLink="/manpower" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-people-carry"></i></span><span>Find Manpower</span>
            </a>
            <a routerLink="/chat" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-comment-dots"></i></span><span>Messages</span>
            </a>
          </div>
        </ng-container>

        <!-- VEHICLE OWNER -->
        <ng-container *ngIf="user?.role==='vehicle_owner'">
          <div class="nav-group">
            <div class="nav-group-label">Overview</div>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-th-large"></i></span><span>Dashboard</span>
            </a>
          </div>
          <div class="nav-group">
            <div class="nav-group-label">My Fleet</div>
            <a routerLink="/vehicles" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-tractor"></i></span><span>My Vehicles</span>
            </a>
          </div>
          <div class="nav-group">
            <div class="nav-group-label">Connect</div>
            <a routerLink="/marketplace" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-store"></i></span><span>Marketplace</span>
            </a>
            <a routerLink="/chat" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-comment-dots"></i></span><span>Messages</span>
            </a>
          </div>
        </ng-container>

        <!-- MANPOWER -->
        <ng-container *ngIf="user?.role==='manpower'">
          <div class="nav-group">
            <div class="nav-group-label">Overview</div>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-th-large"></i></span><span>Dashboard</span>
            </a>
          </div>
          <div class="nav-group">
            <div class="nav-group-label">Work</div>
            <a routerLink="/manpower" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-people-carry"></i></span><span>My Profile</span>
            </a>
          </div>
          <div class="nav-group">
            <div class="nav-group-label">Connect</div>
            <a routerLink="/marketplace" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-store"></i></span><span>Marketplace</span>
            </a>
            <a routerLink="/chat" routerLinkActive="active" class="nav-item">
              <span class="ni-icon"><i class="fas fa-comment-dots"></i></span><span>Messages</span>
            </a>
          </div>
        </ng-container>

        <!-- Account (non-admin) -->
        <div class="nav-group" *ngIf="user?.role!=='admin'">
          <div class="nav-group-label">Account</div>
          <a routerLink="/profile" routerLinkActive="active" class="nav-item">
            <span class="ni-icon"><i class="fas fa-user-circle"></i></span><span>Profile</span>
          </a>
          <button class="nav-item nav-logout" (click)="logout()">
            <span class="ni-icon"><i class="fas fa-sign-out-alt"></i></span><span>Logout</span>
          </button>
        </div>

        <!-- Admin logout -->
        <div class="nav-group" *ngIf="user?.role==='admin'">
          <button class="nav-item nav-logout" (click)="logout()">
            <span class="ni-icon"><i class="fas fa-sign-out-alt"></i></span><span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width:264px; height:100vh; position:fixed; left:0; top:0;
      background:linear-gradient(180deg, #2e9e2e 0%, #1e7a1e 100%);
      display:flex; flex-direction:column; z-index:100;
      box-shadow:4px 0 24px rgba(0,0,0,0.2);
      overflow:hidden;
    }
    .sb-brand {
      display:flex; align-items:center; gap:10px;
      padding:22px 18px 16px; flex-shrink:0;
    }
    .sb-logo-wrap { position:relative; flex-shrink:0; }
    .sb-logo {
      width:40px; height:40px; border-radius:12px;
      background:rgba(255,255,255,0.1);
      border:1.5px solid rgba(255,255,255,0.18);
      display:flex; align-items:center; justify-content:center;
      animation:logoFloat 4s ease-in-out infinite;
    }
    @keyframes logoFloat {
      0%,100% { transform:translateY(0); }
      50%      { transform:translateY(-4px); }
    }
    .sb-name { font-size:0.96rem; font-weight:800; color:#fff; letter-spacing:-0.01em; }
    .sb-ver  { font-size:0.58rem; color:rgba(255,255,255,0.32); margin-top:1px; }

    .sb-user { display:flex; align-items:center; gap:9px; padding:8px 16px 12px; flex-shrink:0; }
    .sb-av {
      width:36px; height:36px; border-radius:50%; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
      font-weight:800; font-size:0.9rem; color:#fff;
      border:2px solid rgba(255,255,255,0.15);
    }
    .sb-user-info { flex:1; min-width:0; }
    .sb-uname { font-size:0.82rem; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .sb-urole { font-size:0.62rem; color:rgba(255,255,255,0.45); }
    .sb-kyc {
      width:22px; height:22px; border-radius:50%;
      background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12);
      display:flex; align-items:center; justify-content:center;
      font-size:0.58rem; color:rgba(255,255,255,0.3); flex-shrink:0;
    }
    .kyc-ok { background:rgba(74,222,128,0.2); border-color:#4ade80; color:#4ade80; }

    .sb-divider { height:1px; background:rgba(255,255,255,0.07); margin:0 16px 8px; flex-shrink:0; }

    .sb-nav { flex:1; overflow-y:auto; padding:0 10px 16px; }
    .sb-nav::-webkit-scrollbar { width:3px; }
    .sb-nav::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }

    .nav-group { margin-bottom:16px; }
    .nav-group-label {
      font-size:0.58rem; font-weight:700; text-transform:uppercase;
      letter-spacing:0.1em; color:rgba(255,255,255,0.28);
      padding:0 10px 6px;
    }
    .nav-item {
      display:flex; align-items:center; gap:9px;
      padding:8px 10px; border-radius:10px;
      color:rgba(255,255,255,0.58); text-decoration:none;
      font-size:0.84rem; font-weight:500; transition:all 0.15s;
      margin-bottom:1px; cursor:pointer;
      border:none; background:transparent; width:100%; text-align:left;
      font-family:'Outfit',sans-serif;
    }
    .nav-item:hover { color:#fff; background:rgba(255,255,255,0.08); }
    .nav-item.active {
      color:#fff; background:rgba(74,222,128,0.14);
      border-left:2px solid #4ade80; padding-left:8px;
    }
    .ni-icon { width:17px; text-align:center; font-size:0.78rem; flex-shrink:0; }
    .nav-item.active .ni-icon { color:#4ade80; }
    .nav-logout { color:rgba(255,120,120,0.65) !important; }
    .nav-logout:hover { color:#ff6464 !important; background:rgba(255,100,100,0.1) !important; }

    @media(max-width:768px) { .sidebar { transform:translateX(-100%); } }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  user: User | null = null;
  private sub!: Subscription;
  constructor(private authService: AuthService) {}
  ngOnInit() { this.sub = this.authService.currentUser$.subscribe(u => this.user = u); }
  ngOnDestroy() { if (this.sub) this.sub.unsubscribe(); }
  logout() { this.authService.logout(); }
  formatRole(role?: string): string {
    const m: Record<string,string> = { farmer:'🌾 Farmer', buyer:'🛒 Buyer', vehicle_owner:'🚜 Vehicle Owner', manpower:'👷 Manpower', admin:'⚙️ Admin' };
    return m[role||''] || role || '';
  }
  roleGradient(role?: string): string {
    const m: Record<string,string> = { farmer:'linear-gradient(135deg,#4a9050,#255c30)', buyer:'linear-gradient(135deg,#3b82f6,#1d4ed8)', vehicle_owner:'linear-gradient(135deg,#f59e0b,#b45309)', manpower:'linear-gradient(135deg,#ec4899,#9d174d)', admin:'linear-gradient(135deg,#8b5cf6,#4c1d95)' };
    return m[role||''] || 'linear-gradient(135deg,#6b7280,#374151)';
  }
}
