import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/services';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- ── PAGE HEADER ── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">⚙️ Admin Dashboard</h1>
        <p class="page-subtitle">Full platform monitoring · Manage all users · Broadcast messages</p>
      </div>
      <div class="ph-chips">
        <div class="live-chip"><span class="live-dot"></span> Live</div>
        <div class="admin-badge"><i class="fas fa-shield-alt"></i> Admin</div>
      </div>
    </div>

    <!-- ── KPI CARDS ── -->
    <div class="kpi-row">
      <div class="kpi-card zen-card" *ngFor="let k of kpis; let i=index" [style.animation-delay]="(i*70)+'ms'">
        <div class="kc-head">
          <div class="kc-icon" [style.background]="k.bg"><i [class]="k.icon" [style.color]="k.color"></i></div>
          <div class="kc-trend" [class.trend-up]="k.trend>0" [class.trend-dn]="k.trend<0">
            <i [class]="k.trend>=0?'fas fa-arrow-trend-up':'fas fa-arrow-trend-down'"></i>
            {{ k.trend > 0 ? '+' : '' }}{{ k.trend }}%
          </div>
        </div>
        <div class="kc-val">{{ k.val }}</div>
        <div class="kc-lbl">{{ k.label }}</div>
      </div>
    </div>

    <!-- ── ROLE OVERVIEW CARDS ── -->
    <div class="role-overview-grid">
      <div class="ro-card zen-card" *ngFor="let r of roleStats"
        [class.ro-selected]="tab===r.tab"
        (click)="setTab(r.tab, r.role)">
        <div class="ro-icon" [style.background]="r.bg">
          <i [class]="r.icon" [style.color]="r.color"></i>
        </div>
        <div class="ro-val">{{ r.val }}</div>
        <div class="ro-lbl">{{ r.label }}</div>
        <div class="ro-bar-wrap"><div class="ro-bar" [style.width]="r.pct+'%'" [style.background]="r.color"></div></div>
      </div>
    </div>

    <!-- ── MAIN PANEL ── -->
    <div class="admin-panel zen-card">
      <!-- Tab bar -->
      <div class="tab-bar">
        <button class="tab-btn" [class.tab-active]="tab==='users'" (click)="setTab('users','')">
          <i class="fas fa-users"></i> All Users
        </button>
        <button class="tab-btn" [class.tab-active]="tab==='farmers'" (click)="setTab('farmers','farmer')">
          <i class="fas fa-seedling"></i> Farmers
        </button>
        <button class="tab-btn" [class.tab-active]="tab==='buyers'" (click)="setTab('buyers','buyer')">
          <i class="fas fa-shopping-cart"></i> Buyers
        </button>
        <button class="tab-btn" [class.tab-active]="tab==='vehicles'" (click)="setTab('vehicles','vehicle_owner')">
          <i class="fas fa-tractor"></i> Vehicle Owners
        </button>
        <button class="tab-btn" [class.tab-active]="tab==='manpower'" (click)="setTab('manpower','manpower')">
          <i class="fas fa-hard-hat"></i> Manpower
        </button>
        <button class="tab-btn tab-btn-msg" [class.tab-active]="tab==='broadcast'" (click)="setTab('broadcast','')">
          <i class="fas fa-bullhorn"></i> Broadcast
        </button>
      </div>

      <!-- ── BROADCAST TAB ── -->
      <div *ngIf="tab==='broadcast'" class="broadcast-panel">
        <div class="bp-header">
          <i class="fas fa-bullhorn bp-icon"></i>
          <div>
            <div class="bp-title">Broadcast Message</div>
            <div class="bp-sub">Send a message to any user directly as Admin</div>
          </div>
        </div>

        <!-- Select recipient -->
        <div class="bp-section">
          <label class="form-label">Select Recipient</label>
          <div class="bp-search-wrap">
            <i class="fas fa-search bp-si"></i>
            <input class="bp-search" type="text" placeholder="Search by name or role…"
              [(ngModel)]="msgSearch" (input)="filterRecipients()">
          </div>
          <div class="recipient-list">
            <div class="rl-item" *ngFor="let u of filteredRecipients"
              [class.rl-selected]="selectedRecipient?.id===u.id"
              (click)="selectRecipient(u)">
              <div class="rl-av" [style.background]="roleGradient(u.role)">{{ (u.name||'U').charAt(0).toUpperCase() }}</div>
              <div class="rl-info">
                <div class="rl-name">{{ u.name }}</div>
                <div class="rl-role">{{ roleLabel(u.role) }}</div>
              </div>
              <div class="rl-loc" *ngIf="u.location">{{ u.location }}</div>
              <span class="role-chip" [class]="'rc-'+u.role">{{ roleLabel(u.role) }}</span>
              <div class="rl-check" *ngIf="selectedRecipient?.id===u.id"><i class="fas fa-check"></i></div>
            </div>
            <div class="rl-empty" *ngIf="filteredRecipients.length===0">
              <i class="fas fa-search"></i> No users found
            </div>
          </div>
        </div>

        <!-- Message input -->
        <div class="bp-section" *ngIf="selectedRecipient">
          <div class="selected-recipient">
            <div class="sr-av" [style.background]="roleGradient(selectedRecipient.role)">{{ (selectedRecipient.name||'U').charAt(0).toUpperCase() }}</div>
            <div>
              <div class="sr-name">Sending to: <b>{{ selectedRecipient.name }}</b></div>
              <div class="sr-role">{{ roleLabel(selectedRecipient.role) }} {{ selectedRecipient.location ? '· '+selectedRecipient.location : '' }}</div>
            </div>
            <button class="sr-clear" (click)="selectedRecipient=null"><i class="fas fa-times"></i></button>
          </div>
          <label class="form-label" style="margin-top:14px">Message</label>
          <textarea class="msg-area" [(ngModel)]="broadcastMsg" rows="4"
            placeholder="Type your admin message here…"></textarea>
          <div class="bp-actions">
            <button class="btn btn-outline btn-sm" (click)="broadcastMsg='';selectedRecipient=null">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button class="btn btn-primary" (click)="sendBroadcast()" [disabled]="!broadcastMsg.trim() || sending">
              <span class="spinner-sm" *ngIf="sending"></span>
              <i class="fas fa-paper-plane" *ngIf="!sending"></i>
              {{ sending ? 'Sending…' : 'Send Message' }}
            </button>
          </div>
          <div class="msg-sent" *ngIf="msgSent">
            <i class="fas fa-check-circle"></i> Message sent to {{ lastRecipient }}!
          </div>
        </div>
      </div>

      <!-- ── USER TABLE TABS ── -->
      <div *ngIf="tab!=='broadcast'">
        <!-- Search row -->
        <div class="table-toolbar">
          <div class="tt-left">
            <div class="tab-title">{{ tabTitle }}</div>
            <span class="count-badge">{{ displayUsers.length }} users</span>
          </div>
          <div class="search-wrap">
            <i class="fas fa-search sw-icon"></i>
            <input class="sw-input" type="text" placeholder="Search name, email, location…"
              [(ngModel)]="search" (input)="onSearch()">
            <button class="sw-clear" *ngIf="search" (click)="search='';onSearch()">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div class="loading-row" *ngIf="loading">
          <div class="spinner"></div> Loading users…
        </div>

        <!-- Table -->
        <div class="table-wrap" *ngIf="!loading">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Location</th>
                <th>KYC</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr class="tr-anim" *ngFor="let u of displayUsers; let i=index" [style.animation-delay]="(i*30)+'ms'">
                <td class="td-id">{{ u.id }}</td>
                <td>
                  <div class="user-cell">
                    <div class="user-av" [style.background]="roleGradient(u.role)">{{ (u.name||'U').charAt(0).toUpperCase() }}</div>
                    <div>
                      <div class="user-name">{{ u.name }}</div>
                      <div class="user-email">{{ u.email }}</div>
                    </div>
                  </div>
                </td>
                <td><span class="role-chip" [class]="'rc-'+u.role">{{ roleLabel(u.role) }}</span></td>
                <td class="td-dim">{{ u.phone || '—' }}</td>
                <td class="td-dim">{{ u.location || '—' }}</td>
                <td>
                  <span class="kyc-pill" [class.kyc-ok]="u.kycVerified">
                    <i [class]="u.kycVerified ? 'fas fa-shield-check' : 'fas fa-clock'"></i>
                    {{ u.kycVerified ? 'Verified' : 'Pending' }}
                  </span>
                </td>
                <td>
                  <span class="status-dot active">
                    Active
                  </span>
                </td>
                <td class="td-date">{{ fmtDate(u.createdAt) }}</td>
                <td>
                  <button class="msg-btn" title="Send message" (click)="quickMessage(u)">
                    <i class="fas fa-comment-dots"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="displayUsers.length===0">
                <td colspan="9">
                  <div class="empty-block">
                    <div class="empty-ico"><i class="fas fa-users-slash"></i></div>
                    <h3>No users found</h3>
                    <p>Try a different search term</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Activity section -->
    <div class="two-col-grid" style="margin-top:20px">
      <div class="zen-card" style="padding:20px">
        <div class="card-header"><h3><i class="fas fa-chart-bar"></i> Platform Activity</h3></div>
        <div class="bar-chart">
          <div class="bc-row" *ngFor="let a of activityData">
            <div class="bc-label">{{ a.label }}</div>
            <div class="bc-track"><div class="bc-fill" [style.width]="a.pct+'%'" [style.background]="a.color"></div></div>
            <div class="bc-val">{{ a.val }}</div>
          </div>
        </div>
      </div>
      <div class="zen-card" style="padding:20px">
        <div class="card-header"><h3><i class="fas fa-bolt"></i> Recent Events</h3></div>
        <div class="event-list">
          <div class="event-row" *ngFor="let e of recentEvents">
            <div class="event-icon" [style.background]="e.bg"><i [class]="e.icon" [style.color]="e.color"></i></div>
            <div>
              <div class="event-text">{{ e.text }}</div>
              <div class="event-time">{{ e.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Page header ── */
    .page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
    .page-title   { font-size:1.5rem; font-weight:900; color:var(--text-primary); letter-spacing:-0.02em; }
    .page-subtitle{ font-size:0.85rem; color:var(--text-muted); margin-top:3px; }
    .ph-chips { display:flex; gap:8px; }
    .live-chip { display:inline-flex; align-items:center; gap:5px; background:#dcfce7; color:#16a34a; padding:5px 12px; border-radius:99px; font-size:0.75rem; font-weight:700; }
    .live-dot { width:7px; height:7px; border-radius:50%; background:#22c55e; animation:pulse 1.5s infinite; }
    .admin-badge { display:inline-flex; align-items:center; gap:5px; background:#ede9fe; color:#7c3aed; padding:5px 12px; border-radius:99px; font-size:0.75rem; font-weight:700; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

    /* ── KPI row ── */
    .kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px; }
    @media(max-width:1000px) { .kpi-row{grid-template-columns:repeat(2,1fr);} }
    .zen-card { background:#fff; border-radius:16px; border:1px solid rgba(53,117,64,0.1); box-shadow:0 2px 10px rgba(0,0,0,0.05); transition:transform 0.2s,box-shadow 0.2s; animation:fadeUp 0.4s ease both; }
    .kpi-card { padding:18px; }
    .kc-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
    .kc-icon { width:42px; height:42px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:1rem; }
    .kc-trend { font-size:0.74rem; font-weight:800; display:flex; align-items:center; gap:3px; }
    .trend-up { color:#16a34a; } .trend-dn { color:#dc2626; }
    .kc-val { font-size:1.6rem; font-weight:900; color:var(--text-primary); line-height:1; }
    .kc-lbl { font-size:0.72rem; color:var(--text-muted); margin-top:4px; }

    /* ── Role overview ── */
    .role-overview-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
    @media(max-width:900px) { .role-overview-grid{grid-template-columns:repeat(2,1fr);} }
    .ro-card { padding:20px; cursor:pointer; border:2px solid transparent !important; transition:all 0.18s; }
    .ro-card:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(0,0,0,0.09); border-color:rgba(53,117,64,0.15) !important; }
    .ro-selected { border-color:var(--sage-400) !important; box-shadow:0 0 0 3px rgba(74,144,80,0.12) !important; }
    .ro-icon { width:48px; height:48px; border-radius:13px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; margin-bottom:12px; }
    .ro-val { font-size:1.5rem; font-weight:900; color:var(--text-primary); }
    .ro-lbl { font-size:0.74rem; color:var(--text-muted); margin:3px 0 10px; }
    .ro-bar-wrap { height:4px; background:#f0f9f0; border-radius:99px; overflow:hidden; }
    .ro-bar { height:100%; border-radius:99px; transition:width 1s ease; }

    /* ── Admin panel ── */
    .admin-panel { margin-bottom:20px; overflow:hidden; }
    .tab-bar { display:flex; gap:3px; flex-wrap:wrap; padding:8px; border-bottom:1px solid rgba(53,117,64,0.08); background:#fafcfa; }
    .tab-btn { display:flex; align-items:center; gap:6px; padding:8px 14px; border:none; cursor:pointer; border-radius:9px; font-size:0.8rem; font-weight:600; color:var(--text-muted); background:transparent; transition:all 0.15s; font-family:'Outfit',sans-serif; }
    .tab-btn:hover { background:var(--sage-50); color:var(--sage-600); }
    .tab-active { background:linear-gradient(135deg,var(--sage-500),var(--sage-700)); color:#fff !important; box-shadow:0 3px 10px rgba(74,144,80,0.28); }
    .tab-btn-msg.tab-active { background:linear-gradient(135deg,#2563eb,#1d4ed8) !important; }

    /* ── Toolbar ── */
    .table-toolbar { display:flex; align-items:center; justify-content:space-between; padding:14px 18px 12px; flex-wrap:wrap; gap:10px; }
    .tt-left { display:flex; align-items:center; gap:10px; }
    .tab-title { font-size:0.95rem; font-weight:700; color:var(--text-primary); }
    .count-badge { background:var(--sage-100); color:var(--sage-700); padding:2px 10px; border-radius:99px; font-size:0.74rem; font-weight:700; }
    .search-wrap { position:relative; display:flex; align-items:center; }
    .sw-icon { position:absolute; left:11px; font-size:0.78rem; color:var(--text-muted); pointer-events:none; }
    .sw-input { padding:8px 32px 8px 32px; border:1.5px solid var(--border); border-radius:10px; font-size:0.84rem; font-family:'Outfit',sans-serif; outline:none; color:var(--text-primary); min-width:220px; transition:border-color 0.2s,box-shadow 0.2s; }
    .sw-input:focus { border-color:var(--sage-500); box-shadow:0 0 0 3px rgba(74,144,80,0.12); }
    .sw-clear { position:absolute; right:10px; background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.78rem; }
    .sw-clear:hover { color:var(--danger); }

    /* ── Table ── */
    .loading-row { display:flex; align-items:center; gap:12px; padding:48px; justify-content:center; color:var(--text-muted); }
    .spinner { width:28px; height:28px; border-radius:50%; border:3px solid var(--sage-100); border-top-color:var(--sage-500); animation:spin 0.7s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg)} }
    .table-wrap { overflow-x:auto; }
    table { width:100%; border-collapse:collapse; }
    thead tr { background:var(--sage-50); }
    th { padding:10px 14px; text-align:left; font-size:0.7rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; border-bottom:2px solid var(--border); white-space:nowrap; }
    td { padding:13px 14px; border-bottom:1px solid var(--border); font-size:0.85rem; color:var(--text-primary); vertical-align:middle; }
    .tr-anim { animation:fadeIn 0.3s ease both; }
    tbody tr { transition:background 0.15s; }
    tbody tr:hover { background:var(--sage-50); }
    tbody tr:last-child td { border-bottom:none; }
    .td-id { color:var(--text-faint); font-size:0.78rem; font-family:'JetBrains Mono',monospace; }
    .td-dim { color:var(--text-muted); font-size:0.82rem; }
    .td-date { color:var(--text-faint); font-size:0.76rem; white-space:nowrap; }

    .user-cell { display:flex; align-items:center; gap:10px; }
    .user-av { width:34px; height:34px; border-radius:50%; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.82rem; flex-shrink:0; transition:transform 0.2s; }
    tbody tr:hover .user-av { transform:scale(1.1); }
    .user-name  { font-weight:700; font-size:0.85rem; }
    .user-email { font-size:0.72rem; color:var(--text-muted); }

    .role-chip { display:inline-flex; align-items:center; padding:3px 10px; border-radius:99px; font-size:0.7rem; font-weight:700; }
    .rc-farmer        { background:#dcfce7; color:#16a34a; }
    .rc-buyer         { background:#dbeafe; color:#2563eb; }
    .rc-vehicle_owner { background:#fef3c7; color:#d97706; }
    .rc-manpower      { background:#fce7f3; color:#db2777; }
    .rc-admin         { background:#ede9fe; color:#7c3aed; }

    .kyc-pill { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:99px; font-size:0.7rem; font-weight:600; background:#f3f4f6; color:#6b7280; }
    .kyc-ok { background:#dcfce7; color:#16a34a; }
    .status-dot { display:inline-flex; align-items:center; gap:5px; font-size:0.72rem; font-weight:600; color:#9ca3af; }
    .status-dot::before { content:''; display:inline-block; width:6px; height:6px; border-radius:50%; background:#d1d5db; }
    .status-dot.active { color:#16a34a; }
    .status-dot.active::before { background:#22c55e; animation:pulse 1.8s infinite; }
    .msg-btn { width:30px; height:30px; border-radius:8px; border:1.5px solid rgba(37,99,235,0.2); background:#dbeafe; color:#2563eb; cursor:pointer; transition:all 0.15s; display:flex; align-items:center; justify-content:center; font-size:0.78rem; }
    .msg-btn:hover { background:#2563eb; color:#fff; transform:scale(1.1); }

    /* ── Broadcast panel ── */
    .broadcast-panel { padding:20px 24px; }
    .bp-header { display:flex; align-items:flex-start; gap:14px; margin-bottom:20px; padding:16px; background:linear-gradient(135deg,#eff6ff,#dbeafe); border-radius:12px; border:1px solid #bfdbfe; }
    .bp-icon { font-size:1.4rem; color:#2563eb; margin-top:2px; }
    .bp-title { font-size:1rem; font-weight:800; color:#1e3a5f; }
    .bp-sub   { font-size:0.82rem; color:#3b82f6; margin-top:2px; }
    .bp-section { margin-bottom:18px; }
    .form-label { display:block; font-size:0.82rem; font-weight:600; color:var(--text-secondary); margin-bottom:7px; }
    .bp-search-wrap { position:relative; margin-bottom:10px; }
    .bp-si { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); font-size:0.8rem; }
    .bp-search { width:100%; padding:10px 14px 10px 34px; border:1.5px solid var(--border); border-radius:10px; font-family:'Outfit',sans-serif; font-size:0.875rem; outline:none; transition:border-color 0.2s; }
    .bp-search:focus { border-color:var(--sage-500); box-shadow:0 0 0 3px rgba(74,144,80,0.12); }
    .recipient-list { border:1px solid var(--border); border-radius:12px; overflow:hidden; max-height:240px; overflow-y:auto; }
    .rl-item { display:flex; align-items:center; gap:10px; padding:10px 14px; cursor:pointer; transition:background 0.15s; border-bottom:1px solid var(--border); }
    .rl-item:last-child { border-bottom:none; }
    .rl-item:hover { background:var(--sage-50); }
    .rl-selected { background:#eff6ff !important; }
    .rl-av { width:32px; height:32px; border-radius:50%; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.82rem; flex-shrink:0; }
    .rl-info { flex:1; }
    .rl-name { font-size:0.84rem; font-weight:700; color:var(--text-primary); }
    .rl-role { font-size:0.72rem; color:var(--text-muted); }
    .rl-loc  { font-size:0.72rem; color:var(--text-faint); white-space:nowrap; }
    .rl-check { width:20px; height:20px; border-radius:50%; background:#2563eb; color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.6rem; animation:bounceIn 0.2s ease; }
    .rl-empty { padding:24px; text-align:center; color:var(--text-muted); font-size:0.84rem; }
    .selected-recipient { display:flex; align-items:center; gap:10px; padding:12px 14px; background:var(--sage-50); border:1.5px solid var(--border-mid); border-radius:10px; }
    .sr-av { width:36px; height:36px; border-radius:50%; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; flex-shrink:0; }
    .sr-name { font-size:0.84rem; font-weight:600; color:var(--text-primary); }
    .sr-role { font-size:0.72rem; color:var(--text-muted); }
    .sr-clear { margin-left:auto; background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.85rem; }
    .msg-area { width:100%; padding:12px 14px; border:1.5px solid var(--border); border-radius:10px; font-family:'Outfit',sans-serif; font-size:0.875rem; outline:none; resize:vertical; transition:border-color 0.2s; }
    .msg-area:focus { border-color:var(--sage-500); box-shadow:0 0 0 3px rgba(74,144,80,0.12); }
    .bp-actions { display:flex; gap:10px; margin-top:12px; justify-content:flex-end; }
    .btn { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; border-radius:10px; font-family:'Outfit',sans-serif; font-size:0.875rem; font-weight:700; cursor:pointer; border:none; transition:all 0.18s; }
    .btn-primary { background:linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; }
    .btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 4px 12px rgba(37,99,235,0.35); }
    .btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
    .btn-outline { background:transparent; color:var(--text-secondary); border:1.5px solid var(--border); }
    .btn-outline:hover { background:var(--sage-50); }
    .btn-sm { padding:7px 14px; font-size:0.8rem; }
    .spinner-sm { width:14px; height:14px; border-radius:50%; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; animation:spin 0.6s linear infinite; }
    .msg-sent { margin-top:12px; display:flex; align-items:center; gap:8px; background:#dcfce7; color:#16a34a; padding:10px 14px; border-radius:9px; font-size:0.84rem; font-weight:600; animation:scaleIn 0.2s ease; }

    /* ── Activity ── */
    .two-col-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
    @media(max-width:900px) { .two-col-grid{grid-template-columns:1fr;} }
    .card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid var(--border); }
    .card-header h3 { font-size:0.88rem; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:7px; }
    .card-header h3 i { color:var(--sage-500); }
    .bar-chart { display:flex; flex-direction:column; gap:10px; }
    .bc-row { display:flex; align-items:center; gap:10px; }
    .bc-label { width:66px; font-size:0.78rem; font-weight:600; color:var(--text-secondary); }
    .bc-track { flex:1; height:8px; background:var(--sage-50); border-radius:99px; overflow:hidden; }
    .bc-fill  { height:100%; border-radius:99px; transition:width 1.2s ease; }
    .bc-val   { width:30px; text-align:right; font-size:0.8rem; font-weight:700; }
    .event-list { display:flex; flex-direction:column; gap:12px; }
    .event-row { display:flex; align-items:flex-start; gap:10px; padding:6px 0; }
    .event-icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:0.82rem; flex-shrink:0; }
    .event-text { font-size:0.82rem; font-weight:500; color:var(--text-primary); }
    .event-time { font-size:0.7rem; color:var(--text-faint); margin-top:2px; }
    /* Empty */
    .empty-block { text-align:center; padding:48px 20px; color:var(--text-muted); }
    .empty-ico { width:56px; height:56px; border-radius:50%; background:var(--sage-50); display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:1.3rem; color:var(--sage-500); }
    .empty-block h3 { font-size:0.95rem; color:var(--text-secondary); }
    .empty-block p  { font-size:0.82rem; margin-top:4px; }

    @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
    @keyframes bounceIn { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
  `]
})
export class AdminComponent implements OnInit {
  Math = Math;
  tab = 'users';
  loading = true;
  search = '';
  msgSearch = '';
  broadcastMsg = '';
  sending = false;
  msgSent = false;
  lastRecipient = '';
  allUsers: any[] = [];
  displayUsers: any[] = [];
  filteredRecipients: any[] = [];
  selectedRecipient: any = null;

  kpis = [
    { icon:'fas fa-users',             val:'0',    label:'Total Users',    bg:'#e8faea', color:'#16a34a', trend:12 },
    { icon:'fas fa-seedling',          val:'0',    label:'Farmers',        bg:'#dcfce7', color:'#16a34a', trend:8  },
    { icon:'fas fa-shopping-bag',      val:'0',    label:'Buyers',         bg:'#dbeafe', color:'#2563eb', trend:15 },
    { icon:'fas fa-indian-rupee-sign', val:'₹48L+',label:'Total Traded',   bg:'#fef3c7', color:'#d97706', trend:22 },
  ];

  activityData = [
    { label:'Orders',   val:124, pct:80, color:'#27a836' },
    { label:'Listings', val:89,  pct:60, color:'#2563eb' },
    { label:'Vehicles', val:45,  pct:35, color:'#d97706' },
    { label:'Manpower', val:37,  pct:28, color:'#db2777' },
    { label:'Messages', val:201, pct:100,color:'#7c3aed' },
  ];

  recentEvents = [
    { icon:'fas fa-seedling',     text:'New listing: Tomatoes by Ravi Kumar', time:'2 min ago',  bg:'#dcfce7', color:'#16a34a' },
    { icon:'fas fa-shopping-cart',text:'Order placed — ₹4,500 by Priya Singh', time:'8 min ago',  bg:'#dbeafe', color:'#2563eb' },
    { icon:'fas fa-tractor',      text:'Vehicle booked: Mahindra Tractor',    time:'15 min ago', bg:'#fef3c7', color:'#d97706' },
    { icon:'fas fa-user-plus',    text:'New registration: Suresh Manpower',   time:'22 min ago', bg:'#fce7f3', color:'#db2777' },
    { icon:'fas fa-shield-check', text:'KYC verified: Arun Farmer',           time:'35 min ago', bg:'#ede9fe', color:'#7c3aed' },
  ];

  roleStats: any[] = [];

  get tabTitle(): string {
    const t: Record<string,string> = { users:'All Users', farmers:'Farmers', buyers:'Buyers', vehicles:'Vehicle Owners', manpower:'Manpower Workers' };
    return t[this.tab] || 'Users';
  }
  get currentRole(): string {
    const m: Record<string,string> = { farmers:'farmer', buyers:'buyer', vehicles:'vehicle_owner', manpower:'manpower' };
    return m[this.tab] || '';
  }

  constructor(private authService: AuthService, private chatService: ChatService) {}

  ngOnInit() {
    this.authService.getUsers().subscribe({
      next: (users) => { this.allUsers = users; this.displayUsers = [...users]; this.filteredRecipients = [...users]; this.updateKpis(); this.buildRoleStats(); this.loading = false; },
      error: () => { this.allUsers = this.demoUsers(); this.displayUsers = [...this.allUsers]; this.filteredRecipients = [...this.allUsers]; this.updateKpis(); this.buildRoleStats(); this.loading = false; }
    });
  }

  setTab(tabName: string, role: string) {
    this.tab = tabName; this.search = '';
    if (tabName === 'broadcast') return;
    this.displayUsers = role ? this.allUsers.filter(u => u.role === role) : [...this.allUsers];
  }

  onSearch() {
    const q = this.search.toLowerCase().trim();
    const base = this.currentRole ? this.allUsers.filter(u => u.role === this.currentRole) : [...this.allUsers];
    this.displayUsers = q ? base.filter(u => (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q) || (u.location||'').toLowerCase().includes(q)) : base;
  }

  filterRecipients() {
    const q = this.msgSearch.toLowerCase().trim();
    this.filteredRecipients = q ? this.allUsers.filter(u => (u.name||'').toLowerCase().includes(q) || (u.role||'').toLowerCase().includes(q)) : [...this.allUsers];
  }

  selectRecipient(u: any) { this.selectedRecipient = u; this.msgSent = false; }

  quickMessage(u: any) {
    this.selectedRecipient = u;
    this.msgSearch = u.name;
    this.filterRecipients();
    this.tab = 'broadcast';
  }

  sendBroadcast() {
    if (!this.selectedRecipient || !this.broadcastMsg.trim()) return;
    this.sending = true;
    this.chatService.sendMessage(this.selectedRecipient.id, this.broadcastMsg.trim()).subscribe({
      next: () => {
        this.lastRecipient = this.selectedRecipient!.name;
        this.broadcastMsg = ''; this.sending = false; this.msgSent = true;
        setTimeout(() => this.msgSent = false, 4000);
      },
      error: () => { this.sending = false; }
    });
  }

  updateKpis() {
    this.kpis[0].val = String(this.allUsers.length);
    this.kpis[1].val = String(this.allUsers.filter(u => u.role==='farmer').length);
    this.kpis[2].val = String(this.allUsers.filter(u => u.role==='buyer').length);
  }

  buildRoleStats() {
    const total = this.allUsers.length || 1;
    const defs = [
      { role:'farmer',        tab:'farmers',  icon:'fas fa-seedling',    color:'#16a34a', bg:'#dcfce7', label:'Farmers' },
      { role:'buyer',         tab:'buyers',   icon:'fas fa-shopping-bag',color:'#2563eb', bg:'#dbeafe', label:'Buyers' },
      { role:'vehicle_owner', tab:'vehicles', icon:'fas fa-tractor',     color:'#d97706', bg:'#fef3c7', label:'Vehicles' },
      { role:'manpower',      tab:'manpower', icon:'fas fa-hard-hat',    color:'#db2777', bg:'#fce7f3', label:'Manpower' },
    ];
    this.roleStats = defs.map(d => { const cnt = this.allUsers.filter(u => u.role===d.role).length; return { ...d, val:cnt, pct:Math.round((cnt/total)*100) }; });
  }

  roleGradient(r: string): string { const m: Record<string,string> = { farmer:'linear-gradient(135deg,#4a9050,#255c30)', buyer:'linear-gradient(135deg,#3b82f6,#1d4ed8)', vehicle_owner:'linear-gradient(135deg,#f59e0b,#b45309)', manpower:'linear-gradient(135deg,#ec4899,#9d174d)', admin:'linear-gradient(135deg,#8b5cf6,#4c1d95)' }; return m[r]||'linear-gradient(135deg,#6b7280,#374151)'; }
  roleLabel(r: string): string { const m: Record<string,string> = { farmer:'🌾 Farmer', buyer:'🛒 Buyer', vehicle_owner:'🚜 Vehicle Owner', manpower:'👷 Manpower', admin:'⚙️ Admin' }; return m[r]||r; }
  fmtDate(d: any): string { if (!d) return 'Recently'; return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' }); }

  demoUsers() {
    return [
      { id:1, name:'Ravi Kumar',    email:'ravi@farmer.com',   role:'farmer',        phone:'9876543210', location:'Thanjavur, TN', kycVerified:true,  isOnline:true  },
      { id:2, name:'Priya Singh',   email:'priya@buyer.com',   role:'buyer',         phone:'9876543211', location:'Chennai, TN',   kycVerified:true,  isOnline:false },
      { id:3, name:'Mohan Tractor', email:'mohan@vehicle.com', role:'vehicle_owner', phone:'9876543212', location:'Coimbatore',    kycVerified:false, isOnline:true  },
      { id:4, name:'Suresh Labour', email:'suresh@work.com',   role:'manpower',      phone:'9876543213', location:'Madurai, TN',   kycVerified:true,  isOnline:false },
    ];
  }
}
