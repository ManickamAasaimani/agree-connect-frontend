import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/services';
import { User, Notification } from '../../models/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar">
      <!-- Left: breadcrumb / greeting -->
      <div class="nb-left">
        <div class="nb-time">
          <div class="nb-live"><span class="nb-dot"></span>Live</div>
          <div class="nb-clock">{{ currentTime }}</div>
        </div>
      </div>

      <!-- Right: actions -->
      <div class="nb-right">

        <!-- Notifications -->
        <div class="nb-action" (click)="toggleNotif()" style="position:relative">
          <button class="nb-btn" [class.nb-btn-active]="showNotif">
            <i class="fas fa-bell"></i>
            <span class="nb-badge" *ngIf="unreadCount>0">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
          </button>
          <!-- Dropdown -->
          <div class="notif-panel" *ngIf="showNotif" (click)="$event.stopPropagation()">
            <div class="np-header">
              <span class="np-title">Notifications</span>
              <span class="np-count">{{ unreadCount }} new</span>
            </div>
            <div class="np-empty" *ngIf="notifications.length===0">
              <i class="fas fa-bell-slash"></i><br>No notifications yet
            </div>
            <div class="notif-list" *ngIf="notifications.length>0">
              <div class="notif-item" *ngFor="let n of notifications.slice(0,8)"
                [class.notif-unread]="!n.isRead"
                (click)="markRead(n)">
                <div class="ni-icon-wrap" [class]="'ni-'+n.type">
                  <i [class]="getNotifIcon(n.type)"></i>
                </div>
                <div class="ni-body">
                  <div class="ni-title">{{ n.title }}</div>
                  <div class="ni-msg">{{ n.message }}</div>
                  <div class="ni-time">{{ fmtTime(n.createdAt) }}</div>
                </div>
                <div class="ni-dot" *ngIf="!n.isRead"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- User chip -->
        <div class="nb-user" *ngIf="user">
          <div class="nb-av" [style.background]="roleGradient(user.role)">
            <img *ngIf="user.profileImg" [src]="user.profileImg" style="width:100%;height:100%;object-fit:cover;border-radius:50%">
            <span *ngIf="!user.profileImg">{{ (user.name||'U').charAt(0).toUpperCase() }}</span>
          </div>
          <div class="nb-user-info">
            <div class="nb-uname">{{ user.name }}</div>
            <div class="nb-urole">{{ formatRole(user.role) }}</div>
          </div>
        </div>

        <!-- Logout -->
        <button class="nb-btn nb-logout" (click)="logout()" title="Logout">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </header>

    <!-- Backdrop -->
    <div class="nb-backdrop" *ngIf="showNotif" (click)="showNotif=false"></div>
  `,
  styles: [`
    .navbar {
      position:fixed; top:0; left:264px; right:0; height:66px;
      background:rgba(255,255,255,0.95);
      backdrop-filter:blur(12px);
      border-bottom:1px solid rgba(53,117,64,0.1);
      display:flex; align-items:center; justify-content:space-between;
      padding:0 28px; z-index:90;
      box-shadow:0 2px 12px rgba(0,0,0,0.04);
    }
    @media(max-width:768px) { .navbar { left:0; padding:0 16px; } }

    .nb-left { display:flex; align-items:center; gap:16px; }
    .nb-time { display:flex; align-items:center; gap:10px; }
    .nb-live { display:flex; align-items:center; gap:5px; font-size:0.72rem; font-weight:700; color:#16a34a; background:#dcfce7; padding:3px 9px; border-radius:99px; }
    .nb-dot { width:6px; height:6px; border-radius:50%; background:#16a34a; animation:pulse 1.5s infinite; }
    .nb-clock { font-family:'JetBrains Mono',monospace; font-size:0.82rem; color:var(--text-muted); }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

    .nb-right { display:flex; align-items:center; gap:8px; }
    .nb-btn {
      width:38px; height:38px; border-radius:10px;
      border:1.5px solid rgba(53,117,64,0.12); background:transparent;
      cursor:pointer; color:var(--text-muted); font-size:0.9rem;
      transition:all 0.15s; display:flex; align-items:center; justify-content:center;
      position:relative;
    }
    .nb-btn:hover { background:var(--sage-50); color:var(--sage-600); border-color:var(--border-mid); }
    .nb-btn-active { background:var(--sage-50); color:var(--sage-600); border-color:var(--border-mid); }
    .nb-badge {
      position:absolute; top:-5px; right:-5px;
      min-width:17px; height:17px; border-radius:99px;
      background:#dc2626; color:#fff; font-size:0.6rem; font-weight:800;
      display:flex; align-items:center; justify-content:center;
      border:2px solid #fff; padding:0 3px;
      animation:bounceIn 0.3s ease;
    }
    @keyframes bounceIn { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }

    .nb-user { display:flex; align-items:center; gap:8px; padding:6px 12px; border-radius:10px; border:1.5px solid var(--border); background:#fff; margin-left:4px; }
    .nb-av { width:30px; height:30px; border-radius:50%; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.8rem; flex-shrink:0; }
    .nb-uname { font-size:0.82rem; font-weight:700; color:var(--text-primary); white-space:nowrap; }
    .nb-urole { font-size:0.62rem; color:var(--text-muted); }
    @media(max-width:640px) { .nb-user-info { display:none; } .nb-clock { display:none; } }

    .nb-logout { color:#dc2626 !important; border-color:rgba(220,38,38,0.2) !important; }
    .nb-logout:hover { background:#fee2e2 !important; }

    /* Notification panel */
    .notif-panel {
      position:absolute; top:calc(100% + 10px); right:0;
      width:340px; background:#fff;
      border:1px solid var(--border); border-radius:16px;
      box-shadow:0 16px 48px rgba(0,0,0,0.14);
      overflow:hidden; z-index:200;
      animation:slideDown 0.2s ease;
    }
    @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
    .np-header { display:flex; align-items:center; justify-content:space-between; padding:14px 16px 10px; border-bottom:1px solid var(--border); }
    .np-title { font-size:0.9rem; font-weight:700; color:var(--text-primary); }
    .np-count { font-size:0.72rem; background:var(--sage-100); color:var(--sage-700); padding:2px 8px; border-radius:99px; font-weight:700; }
    .np-empty { padding:32px; text-align:center; color:var(--text-muted); font-size:0.85rem; line-height:1.8; }
    .notif-list { max-height:340px; overflow-y:auto; }
    .notif-item { display:flex; align-items:flex-start; gap:10px; padding:11px 14px; transition:background 0.15s; cursor:pointer; position:relative; border-bottom:1px solid var(--border); }
    .notif-item:last-child { border-bottom:none; }
    .notif-item:hover { background:var(--sage-50); }
    .notif-unread { background:#fafcfa; }
    .ni-icon-wrap { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:0.8rem; flex-shrink:0; }
    .ni-order { background:#dcfce7; color:#16a34a; }
    .ni-vehicle { background:#fef3c7; color:#d97706; }
    .ni-manpower { background:#fce7f3; color:#db2777; }
    .ni-message,.ni-general { background:#dbeafe; color:#2563eb; }
    .ni-system,.ni-price { background:#f3f4f6; color:#6b7280; }
    .ni-body { flex:1; min-width:0; }
    .ni-title { font-size:0.82rem; font-weight:700; color:var(--text-primary); }
    .ni-msg { font-size:0.76rem; color:var(--text-muted); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .ni-time { font-size:0.68rem; color:var(--text-faint); margin-top:4px; }
    .ni-dot { width:7px; height:7px; border-radius:50%; background:var(--sage-500); flex-shrink:0; margin-top:6px; }
    .nb-backdrop { position:fixed; inset:0; z-index:89; }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: User | null = null;
  notifications: Notification[] = [];
  showNotif = false;
  currentTime = '';
  private sub!: Subscription;
  private timer: any;

  constructor(private authService: AuthService, private orderService: OrderService, private router: Router) {}

  ngOnInit() {
    this.sub = this.authService.currentUser$.subscribe(u => {
      this.user = u;
      if (u) this.loadNotifications();
    });
    this.updateTime();
    this.timer = setInterval(() => this.updateTime(), 1000);
  }
  ngOnDestroy() { if (this.sub) this.sub.unsubscribe(); clearInterval(this.timer); }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  }

  loadNotifications() {
    this.orderService.getNotifications().subscribe({ next: n => this.notifications = n as any, error: () => {} });
  }

  get unreadCount() { return this.notifications.filter(n => !n.isRead).length; }

  toggleNotif() {
    this.showNotif = !this.showNotif;
    if (this.showNotif) this.loadNotifications();
  }

  markRead(n: any) {
    if (!n.isRead) {
      this.orderService.markNotifRead(n.id).subscribe(() => n.isRead = true);
    }
    // Navigate to chat for message-type notifications
    this.showNotif = false;
    this.router.navigate(['/chat']);
  }

  logout() { this.authService.logout(); }

  getNotifIcon(type: string): string {
    const m: Record<string,string> = { order:'fas fa-receipt', vehicle:'fas fa-tractor', manpower:'fas fa-people-carry', message:'fas fa-comment-dots', general:'fas fa-comment-dots', price:'fas fa-chart-line', system:'fas fa-info-circle' };
    return m[type] || 'fas fa-bell';
  }

  fmtTime(d: any): string {
    if (!d) return '';
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
    return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
  }

  formatRole(r?: string): string {
    const m: Record<string,string> = { farmer:'Farmer', buyer:'Buyer', vehicle_owner:'Vehicle Owner', manpower:'Manpower', admin:'Admin' };
    return m[r||''] || r || '';
  }

  roleGradient(role?: string): string {
    const m: Record<string,string> = { farmer:'linear-gradient(135deg,#4a9050,#255c30)', buyer:'linear-gradient(135deg,#3b82f6,#1d4ed8)', vehicle_owner:'linear-gradient(135deg,#f59e0b,#b45309)', manpower:'linear-gradient(135deg,#ec4899,#9d174d)', admin:'linear-gradient(135deg,#8b5cf6,#4c1d95)' };
    return m[role||''] || 'linear-gradient(135deg,#6b7280,#374151)';
  }
}
