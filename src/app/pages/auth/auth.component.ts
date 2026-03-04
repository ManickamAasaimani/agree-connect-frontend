import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="auth-root">

      <!-- LEFT HERO PANEL -->
      <div class="auth-hero">
        <div class="hero-blob hero-blob-1"></div>
        <div class="hero-blob hero-blob-2"></div>
        <div class="hero-blob hero-blob-3"></div>
        <div class="hero-grid"></div>

        <div class="hero-inner">
          <!-- ANIMATED LOGO -->
          <div class="brand-lockup">
            <div class="brand-logo-wrap">
              <div class="brand-logo" [class.logo-shake]="logoShake" (animationend)="logoShake=false">
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                  <circle cx="17" cy="17" r="16" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
                  <path d="M17 8v12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
                  <path d="M13 12l4-4 4 4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M11 20c1.5-2 3.5-3.5 6-3.5s4.5 1.5 6 3.5" stroke="rgba(255,255,255,0.75)" stroke-width="1.5" stroke-linecap="round"/>
                  <circle cx="17" cy="24" r="2.5" fill="rgba(255,255,255,0.9)"/>
                  <path d="M9 16c-1-3 1-6 4-6-1 3-1 5 0 7" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
                  <path d="M25 16c1-3-1-6-4-6 1 3 1 5 0 7" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
                </svg>
              </div>
              <div class="logo-ring"></div>
            </div>
            <div class="brand-text">
              <div class="brand-name">AgriConnect <span class="brand-name-hub">Hub</span></div>
              <div class="brand-tag">India's Smart Agricultural Platform</div>
            </div>
          </div>

          <div class="hero-headline">
            <h1 class="headline-main">
              <span class="hl-line">Where Farmers</span>
              <span class="hl-line hl-accent font-serif">Meet Markets</span>
            </h1>
            <p class="headline-sub">Buy & sell crops, hire vehicles, find skilled workers — all in one verified platform built for Indian agriculture.</p>
          </div>

          <div class="hero-stats">
            <div class="stat-item" *ngFor="let s of stats; let i=index" [style.animation-delay]="(i*0.1)+'s'">
              <div class="stat-icon">{{ s.icon }}</div>
              <div class="stat-val">{{ s.val }}</div>
              <div class="stat-lbl">{{ s.lbl }}</div>
            </div>
          </div>

          <div class="hero-pills">
            <span class="pill" *ngFor="let p of pills">
              <i [class]="p.icon"></i> {{ p.text }}
            </span>
          </div>

          <div class="hero-quote">
            <i class="fas fa-quote-left quote-icon"></i>
            <p class="font-serif">"AgriConnect helped me sell my entire paddy harvest directly to buyers — no middlemen, better prices."</p>
            <div class="quote-author">— Rajadurga, Paddy Farmer · Thanjavur</div>
          </div>
        </div>
      </div>

      <!-- RIGHT FORM PANEL -->
      <div class="auth-panel">
        <div class="auth-form-wrap">

          <!-- Mobile logo -->
          <div class="mobile-brand">
            <div class="mb-logo">
              <svg width="22" height="22" viewBox="0 0 34 34" fill="none">
                <path d="M17 8v12M13 12l4-4 4 4" stroke="#357540" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="17" cy="24" r="2.5" fill="#357540"/>
              </svg>
            </div>
            <span>AgriConnect Hub</span>
          </div>

          <!-- Tab switch (hidden in forgot/reset modes) -->
          <div class="form-tabs" *ngIf="mode==='login' || mode==='register'">
            <button class="ftab" [class.ftab-active]="mode==='login'" (click)="mode='login'">Sign In</button>
            <button class="ftab" [class.ftab-active]="mode==='register'" (click)="mode='register'">Create Account</button>
          </div>

          <!-- Error/Success alerts -->
          <div class="error-box" *ngIf="error">
            <i class="fas fa-circle-exclamation"></i> {{ error }}
          </div>
          <div class="success-box" *ngIf="successMsg">
            <i class="fas fa-circle-check"></i> {{ successMsg }}
          </div>

          <!-- ── LOGIN ── -->
          <form *ngIf="mode==='login'" (ngSubmit)="doLogin()" class="auth-form" #lf="ngForm">
            <div class="form-greeting">
              <h2 class="greeting-title">Welcome Back 👋</h2>
              <p class="greeting-sub">AgriConnect Hub — Sign in to continue</p>
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <div class="input-wrap">
                <i class="fas fa-envelope input-icon"></i>
                <input [(ngModel)]="loginData.email" name="email" type="email"
                  class="form-control form-control-icon" placeholder="farmer@gmail.com" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" style="display:flex;justify-content:space-between;align-items:center">
                Password
                <button type="button" class="link-btn forgot-link" (click)="openForgot()">
                  <i class="fas fa-key"></i> Forgot Password?
                </button>
              </label>
              <div class="input-wrap">
                <i class="fas fa-lock input-icon"></i>
                <input [(ngModel)]="loginData.password" name="password"
                  [type]="showPwd ? 'text' : 'password'"
                  class="form-control form-control-icon form-control-icon-r" placeholder="••••••••" required>
                <button type="button" class="pwd-toggle" (click)="showPwd=!showPwd">
                  <i [class]="showPwd ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="demo-row">
              <span class="demo-lbl">Quick demo:</span>
              <button type="button" class="demo-chip demo-farmer" (click)="fillDemo('farmer')">🌾 Farmer</button>
              <button type="button" class="demo-chip demo-buyer"  (click)="fillDemo('buyer')">🛒 Buyer</button>
              <button type="button" class="demo-chip demo-admin"  (click)="fillDemo('admin')">⚙️ Admin</button>
            </div>

            <button type="submit" class="btn btn-primary btn-xl w-full" [disabled]="loading">
              <span class="spinner-sm" *ngIf="loading"></span>
              <i class="fas fa-arrow-right-to-bracket" *ngIf="!loading"></i>
              {{ loading ? 'Signing in…' : 'Sign In' }}
            </button>

            <div class="form-footer">
              New to AgriConnect? <button type="button" class="link-btn" (click)="mode='register'">Create account →</button>
            </div>
          </form>

          <!-- ── REGISTER ── -->
          <form *ngIf="mode==='register'" (ngSubmit)="doRegister()" class="auth-form">
            <div class="form-greeting">
              <h2 class="greeting-title">Join the Community 🌱</h2>
              <p class="greeting-sub">AgriConnect Hub — Create your account</p>
            </div>
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <div class="input-wrap">
                  <i class="fas fa-user input-icon"></i>
                  <input [(ngModel)]="regData.name" name="name" type="text"
                    class="form-control form-control-icon" placeholder="Rajadurga" required>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <div class="input-wrap phone-wrap">
                  <span class="phone-prefix">+91</span>
                  <input [(ngModel)]="regData.phone" name="phone" type="tel"
                    class="form-control form-control-phone" placeholder="6/7/8/9XXXXXXXX"
                    maxlength="10" (keypress)="phoneKeyOnly($event)"
                    (blur)="phoneTouched=true">
                </div>
                <div class="field-err" *ngIf="phoneTouched && regData.phone && regData.phone.length !== 10">
                  Must be exactly 10 digits
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Email Address * <span class="label-note">(Gmail only)</span></label>
              <div class="input-wrap">
                <i class="fas fa-envelope input-icon"></i>
                <input [(ngModel)]="regData.email" name="email" type="email"
                  class="form-control form-control-icon" placeholder="name@gmail.com"
                  (blur)="emailTouched=true" required>
              </div>
              <div class="field-err" *ngIf="emailTouched && regData.email && !isValidEmail(regData.email)">
                Please use a valid Gmail address
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Password *</label>
                <div class="input-wrap">
                  <i class="fas fa-lock input-icon"></i>
                  <input [(ngModel)]="regData.password" name="password"
                    [type]="showPwd ? 'text' : 'password'"
                    class="form-control form-control-icon form-control-icon-r" placeholder="Min 6 chars" required
                    (blur)="pwdTouched=true">
                  <button type="button" class="pwd-toggle" (click)="showPwd=!showPwd">
                    <i [class]="showPwd ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Confirm Password *</label>
                <div class="input-wrap">
                  <i class="fas fa-lock-open input-icon"></i>
                  <input [(ngModel)]="regData.confirmPassword" name="confirmPassword"
                    [type]="showConfirmPwd ? 'text' : 'password'"
                    class="form-control form-control-icon form-control-icon-r" placeholder="Re-enter password" required
                    (blur)="confirmPwdTouched=true">
                  <button type="button" class="pwd-toggle" (click)="showConfirmPwd=!showConfirmPwd">
                    <i [class]="showConfirmPwd ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <div class="field-err" *ngIf="confirmPwdTouched && regData.confirmPassword && regData.password !== regData.confirmPassword">
                  Passwords do not match
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Register as *</label>
              <div class="role-grid">
                <div class="role-option" *ngFor="let r of roles"
                  [class.role-selected]="regData.role===r.val"
                  (click)="regData.role=r.val">
                  <span class="role-emoji">{{ r.icon }}</span>
                  <span class="role-label">{{ r.label }}</span>
                  <div class="role-check" *ngIf="regData.role===r.val">
                    <i class="fas fa-check"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Location <span class="label-note">(optional)</span></label>
              <div class="input-wrap">
                <i class="fas fa-location-dot input-icon"></i>
                <input [(ngModel)]="regData.location" name="location" type="text"
                  class="form-control form-control-icon" placeholder="City, State">
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-xl w-full" [disabled]="loading">
              <span class="spinner-sm" *ngIf="loading"></span>
              <i class="fas fa-seedling" *ngIf="!loading"></i>
              {{ loading ? 'Creating account…' : 'Create Account' }}
            </button>

            <div class="form-footer">
              Already registered? <button type="button" class="link-btn" (click)="mode='login'">Sign in →</button>
            </div>
          </form>

          <!-- ── FORGOT PASSWORD ── -->
          <div *ngIf="mode==='forgot'" class="auth-form">
            <div class="form-greeting">
              <button type="button" class="back-btn" (click)="mode='login'">
                <i class="fas fa-arrow-left"></i> Back to Sign In
              </button>
              <h2 class="greeting-title" style="margin-top:14px">Forgot Password 🔑</h2>
              <p class="greeting-sub">Enter your registered email and we'll generate a reset code for you.</p>
            </div>
            <div class="form-group">
              <label class="form-label">Registered Email Address</label>
              <div class="input-wrap">
                <i class="fas fa-envelope input-icon"></i>
                <input [(ngModel)]="forgotEmail" name="forgotEmail" type="email"
                  class="form-control form-control-icon" placeholder="your@gmail.com" required>
              </div>
            </div>
            <button class="btn btn-primary btn-xl w-full" (click)="doForgot()" [disabled]="loading">
              <span class="spinner-sm" *ngIf="loading"></span>
              <i class="fas fa-paper-plane" *ngIf="!loading"></i>
              {{ loading ? 'Sending…' : 'Send Reset Code' }}
            </button>
          </div>

          <!-- ── RESET PASSWORD ── -->
          <div *ngIf="mode==='reset'" class="auth-form">
            <div class="form-greeting">
              <div class="reset-badge"><i class="fas fa-shield-check"></i> Reset Code Received</div>
              <h2 class="greeting-title" style="margin-top:14px">Set New Password 🔒</h2>
              <p class="greeting-sub">Enter the reset code and choose a new password.</p>
            </div>
            <div class="form-group">
              <label class="form-label">Reset Code</label>
              <div class="input-wrap">
                <i class="fas fa-hashtag input-icon"></i>
                <input [(ngModel)]="resetData.token" name="resetToken" type="text"
                  class="form-control form-control-icon" placeholder="Paste reset code here" required>
              </div>
            </div>
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">New Password *</label>
                <div class="input-wrap">
                  <i class="fas fa-lock input-icon"></i>
                  <input [(ngModel)]="resetData.newPassword" name="newPwd"
                    [type]="showPwd ? 'text' : 'password'"
                    class="form-control form-control-icon form-control-icon-r" placeholder="Min 6 chars" required>
                  <button type="button" class="pwd-toggle" (click)="showPwd=!showPwd">
                    <i [class]="showPwd ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Confirm New Password *</label>
                <div class="input-wrap">
                  <i class="fas fa-lock-open input-icon"></i>
                  <input [(ngModel)]="resetData.confirmPassword" name="confirmNewPwd"
                    [type]="showConfirmPwd ? 'text' : 'password'"
                    class="form-control form-control-icon form-control-icon-r" placeholder="Re-enter password" required>
                  <button type="button" class="pwd-toggle" (click)="showConfirmPwd=!showConfirmPwd">
                    <i [class]="showConfirmPwd ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <div class="field-err" *ngIf="resetData.confirmPassword && resetData.newPassword !== resetData.confirmPassword">
                  Passwords do not match
                </div>
              </div>
            </div>
            <button class="btn btn-primary btn-xl w-full" (click)="doReset()" [disabled]="loading">
              <span class="spinner-sm" *ngIf="loading"></span>
              <i class="fas fa-key" *ngIf="!loading"></i>
              {{ loading ? 'Resetting…' : 'Reset Password' }}
            </button>
            <div class="form-footer">
              <button type="button" class="link-btn" (click)="mode='forgot'">← Request new code</button>
            </div>
          </div>

          <!-- Copyright footer -->
          <div class="auth-copyright">
            © AgriConnect Hub 2026 · All rights reserved<br>
            <span>Support &amp; Developed by <strong>Rajadurga</strong></span>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; }
    .auth-root {
      display:grid; grid-template-columns:1fr 1fr;
      min-height:100vh;
    }
    @media(max-width:900px) { .auth-root { grid-template-columns:1fr; } }

    /* ── Hero Panel ── */
    .auth-hero {
      background: linear-gradient(160deg, #2e9e2e 0%, #3ab53a 45%, #5ec85e 100%);
      position:relative; overflow:hidden;
      display:flex; align-items:center; justify-content:center;
      padding:48px 52px;
    }
    @media(max-width:900px) { .auth-hero { display:none; } }
    .hero-blob { position:absolute; border-radius:50%; background:rgba(255,255,255,0.04); pointer-events:none; }
    .hero-blob-1 { width:480px; height:480px; top:-120px; right:-100px; }
    .hero-blob-2 { width:320px; height:320px; bottom:-80px; left:-60px; }
    .hero-blob-3 { width:200px; height:200px; top:50%; left:10%; background:rgba(255,255,255,0.03); }
    .hero-grid { position:absolute; inset:0; background-image:radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px); background-size:28px 28px; pointer-events:none; }
    .hero-inner { position:relative; z-index:2; max-width:460px; width:100%; }

    /* ── Animated Logo ── */
    .brand-lockup { display:flex; align-items:center; gap:14px; margin-bottom:44px; }
    .brand-logo-wrap { position:relative; flex-shrink:0; }
    .brand-logo { width:60px; height:60px; border-radius:18px; background:rgba(255,255,255,0.1); border:1.5px solid rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; cursor:pointer; animation:logoShake 3s ease-in-out infinite; }
    .logo-ring { position:absolute; inset:-6px; border-radius:24px; border:2px solid rgba(255,255,255,0.12); animation:glow 3s ease-in-out infinite; pointer-events:none; }
    @keyframes logoShake { 0%,100%{transform:translateY(0) rotate(0deg)} 20%{transform:translateY(-7px) rotate(1deg)} 40%{transform:translateY(0) rotate(0deg)} 60%{transform:translateY(-4px) rotate(-1deg)} 80%{transform:translateY(0) rotate(0deg)} }
    @keyframes glow { 0%,100%{box-shadow:0 0 10px rgba(255,255,255,0.1),0 0 20px rgba(74,144,80,0.2);opacity:0.6} 50%{box-shadow:0 0 20px rgba(255,255,255,0.2),0 0 40px rgba(74,144,80,0.4);opacity:1} }
    .brand-name { font-size:1.5rem; font-weight:800; color:#fff; letter-spacing:-0.02em; line-height:1.1; }
    .brand-name-hub { color:rgba(255,255,255,0.65); }
    .brand-tag { font-size:0.72rem; color:rgba(255,255,255,0.5); margin-top:3px; letter-spacing:0.04em; }

    /* ── Headline ── */
    .hero-headline { margin-bottom:36px; }
    .headline-main { display:flex; flex-direction:column; gap:0; margin-bottom:14px; }
    .hl-line { font-size:2.4rem; font-weight:800; color:rgba(255,255,255,0.88); line-height:1.15; letter-spacing:-0.03em; }
    .hl-accent { font-size:2.6rem; color:#fff; font-style:italic; }
    .headline-sub { font-size:0.92rem; color:rgba(255,255,255,0.65); line-height:1.7; max-width:360px; }

    /* ── Stats ── */
    .hero-stats { display:flex; gap:24px; margin-bottom:28px; }
    .stat-item { text-align:center; animation:fadeUp 0.5s ease both; }
    .stat-icon { font-size:1.3rem; margin-bottom:4px; }
    .stat-val { font-size:1.4rem; font-weight:800; color:#fff; line-height:1; }
    .stat-lbl { font-size:0.7rem; color:rgba(255,255,255,0.55); margin-top:3px; }

    /* ── Pills ── */
    .hero-pills { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:28px; }
    .pill { display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.88); padding:6px 13px; border-radius:99px; font-size:0.78rem; font-weight:500; border:1px solid rgba(255,255,255,0.14); backdrop-filter:blur(4px); }
    .pill i { font-size:0.7rem; }

    /* ── Quote ── */
    .hero-quote { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:20px 22px; border-left:3px solid rgba(255,255,255,0.35); }
    .quote-icon { color:rgba(255,255,255,0.3); font-size:0.9rem; margin-bottom:8px; display:block; }
    .hero-quote p { font-size:0.88rem; color:rgba(255,255,255,0.8); font-style:italic; line-height:1.6; margin-bottom:10px; }
    .quote-author { font-size:0.74rem; color:rgba(255,255,255,0.5); font-weight:500; }

    /* ── Form Panel ── */
    .auth-panel { display:flex; align-items:center; justify-content:center; background:#fff; padding:48px 40px; overflow-y:auto; }
    @media(max-width:900px) { .auth-panel { padding:32px 20px; min-height:100vh; } }
    .auth-form-wrap { width:100%; max-width:440px; }

    /* ── Mobile brand ── */
    .mobile-brand { display:none; align-items:center; gap:10px; font-size:1.1rem; font-weight:800; color:var(--sage-700); margin-bottom:32px; }
    .mb-logo { width:38px; height:38px; border-radius:10px; background:var(--sage-100); display:flex; align-items:center; justify-content:center; }
    @media(max-width:900px) { .mobile-brand { display:flex; } }

    /* ── Tabs ── */
    .form-tabs { display:flex; background:var(--sage-50); border-radius:12px; padding:4px; margin-bottom:28px; border:1px solid var(--border); }
    .ftab { flex:1; padding:9px; border:none; border-radius:9px; font-family:'Outfit',sans-serif; font-size:0.875rem; font-weight:600; color:var(--text-muted); background:transparent; cursor:pointer; transition:all 0.18s; }
    .ftab:hover { color:var(--text-secondary); }
    .ftab-active { background:#fff; color:var(--sage-700); box-shadow:0 2px 8px rgba(0,0,0,0.08); }

    /* ── Alerts ── */
    .error-box { display:flex; align-items:center; gap:8px; background:#fee2e2; color:#dc2626; border:1px solid #fecaca; padding:10px 14px; border-radius:10px; font-size:0.85rem; margin-bottom:18px; animation:scaleIn 0.2s ease; }
    .success-box { display:flex; align-items:center; gap:8px; background:#dcfce7; color:#16a34a; border:1px solid #86efac; padding:10px 14px; border-radius:10px; font-size:0.85rem; margin-bottom:18px; animation:scaleIn 0.2s ease; }

    /* ── Form ── */
    .auth-form { animation:fadeUp 0.35s ease both; }
    .form-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    @media(max-width:480px) { .form-grid-2 { grid-template-columns:1fr; } }
    .form-group { margin-bottom:16px; }
    .form-label { display:block; font-size:0.82rem; font-weight:600; color:var(--text-secondary); margin-bottom:6px; }
    .label-note { font-weight:400; color:var(--text-faint); }
    .field-err { font-size:0.76rem; color:#dc2626; margin-top:4px; }

    .input-wrap { position:relative; }
    .input-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:var(--text-faint); font-size:0.8rem; pointer-events:none; transition:color 0.2s; }
    .form-control { width:100%; padding:11px 14px; border:1.5px solid var(--border); border-radius:10px; font-family:'Outfit',sans-serif; font-size:0.875rem; color:var(--text-primary); background:#fff; outline:none; transition:border-color 0.2s, box-shadow 0.2s; }
    .form-control-icon { padding-left:38px; }
    .form-control-icon-r { padding-right:40px; }
    .form-control:focus { border-color:var(--sage-500); box-shadow:0 0 0 3px rgba(74,144,80,0.14); }
    .input-wrap:focus-within .input-icon { color:var(--sage-500); }
    .form-control::placeholder { color:var(--text-faint); }

    .pwd-toggle { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-faint); cursor:pointer; font-size:0.8rem; transition:color 0.15s; }
    .pwd-toggle:hover { color:var(--text-secondary); }

    /* ── Demo chips ── */
    .demo-row { display:flex; align-items:center; gap:7px; margin-bottom:18px; flex-wrap:wrap; }
    .demo-lbl { font-size:0.74rem; color:var(--text-muted); }
    .demo-chip { padding:4px 11px; border-radius:99px; font-size:0.76rem; font-weight:600; border:1.5px solid; cursor:pointer; transition:all 0.15s; background:transparent; font-family:'Outfit',sans-serif; }
    .demo-farmer { border-color:#86efac; color:#16a34a; }
    .demo-farmer:hover { background:#dcfce7; }
    .demo-buyer  { border-color:#93c5fd; color:#2563eb; }
    .demo-buyer:hover  { background:#dbeafe; }
    .demo-admin  { border-color:#c4b5fd; color:#7c3aed; }
    .demo-admin:hover  { background:#ede9fe; }

    /* ── Forgot password link ── */
    .forgot-link { font-size:0.78rem; font-weight:600; display:inline-flex; align-items:center; gap:4px; }

    /* ── Back button ── */
    .back-btn { display:inline-flex; align-items:center; gap:7px; background:none; border:none; color:var(--sage-600); font-size:0.82rem; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; padding:0; transition:color 0.15s; }
    .back-btn:hover { color:var(--sage-800); }

    /* ── Reset badge ── */
    .reset-badge { display:inline-flex; align-items:center; gap:7px; background:var(--sage-50); color:var(--sage-700); border:1px solid var(--sage-200); padding:5px 12px; border-radius:99px; font-size:0.78rem; font-weight:600; }

    /* ── Role grid ── */
    .role-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:9px; }
    .role-option { display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:10px; border:1.5px solid var(--border); background:#fff; cursor:pointer; transition:all 0.18s; position:relative; }
    .role-option:hover { border-color:var(--sage-400); background:var(--sage-50); }
    .role-selected { border-color:var(--sage-500) !important; background:var(--sage-50) !important; box-shadow:0 0 0 3px rgba(74,144,80,0.12); }
    .role-emoji { font-size:1.2rem; }
    .role-label { font-size:0.82rem; font-weight:600; color:var(--text-secondary); }
    .role-check { position:absolute; top:6px; right:8px; width:16px; height:16px; border-radius:50%; background:var(--sage-500); color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.55rem; animation:bounceIn 0.25s ease; }

    /* ── Buttons ── */
    .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:12px 24px; border-radius:10px; font-family:'Outfit',sans-serif; font-size:0.9rem; font-weight:700; cursor:pointer; border:none; transition:all 0.2s; text-decoration:none; white-space:nowrap; }
    .btn-primary { background:linear-gradient(135deg,#3ab53a,#2e9e2e); color:#fff; box-shadow:0 4px 14px rgba(58,181,58,0.35); }
    .btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(74,144,80,0.45); }
    .btn-primary:disabled { opacity:0.7; cursor:not-allowed; }
    .btn-xl { padding:14px 28px; font-size:0.95rem; border-radius:12px; }
    .w-full { width:100%; }
    .spinner-sm { width:16px; height:16px; border-radius:50%; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; animation:spin 0.6s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    @keyframes scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
    @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes bounceIn { 0%{transform:scale(0)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }

    /* ── Form Greeting ── */
    .form-greeting { margin-bottom:20px; }
    .greeting-title { font-size:1.4rem; font-weight:800; color:var(--text-primary); margin-bottom:4px; }
    .greeting-sub { font-size:0.82rem; color:var(--text-muted); }

    .phone-wrap { display:flex; align-items:center; }
    .phone-prefix { padding:11px 10px; background:var(--sage-50); border:1.5px solid var(--border); border-right:none; border-radius:10px 0 0 10px; font-size:0.875rem; font-weight:700; color:var(--text-secondary); white-space:nowrap; flex-shrink:0; }
    .form-control-phone { border-radius:0 10px 10px 0 !important; padding-left:12px !important; }

    /* ── Copyright ── */
    .auth-copyright { text-align:center; margin-top:24px; font-size:0.72rem; color:var(--text-faint); line-height:1.8; padding-top:16px; border-top:1px solid var(--border); }
    .auth-copyright strong { color:var(--sage-600); }

    /* ── Footer link ── */
    .form-footer { text-align:center; font-size:0.83rem; color:var(--text-muted); margin-top:20px; }
    .link-btn { background:none; border:none; color:var(--sage-600); font-weight:600; cursor:pointer; font-size:inherit; font-family:inherit; }
    .link-btn:hover { color:var(--sage-800); text-decoration:underline; }
  `]
})
export class AuthComponent {
  mode: 'login' | 'register' | 'forgot' | 'reset' = 'login';
  loading = false;
  error = '';
  successMsg = '';
  showPwd = false;
  showConfirmPwd = false;
  logoShake = false;
  emailTouched = false;
  phoneTouched = false;
  pwdTouched = false;
  confirmPwdTouched = false;

  loginData  = { email: '', password: '' };
  regData    = { name:'', email:'', password:'', confirmPassword:'', role:'', phone:'', location:'' };
  forgotEmail = '';
  resetData  = { token: '', newPassword: '', confirmPassword: '' };

  stats = [
    { icon:'🌾', val:'2,400+', lbl:'Farmers' },
    { icon:'🛒', val:'₹48L+',  lbl:'Traded' },
    { icon:'🚜', val:'340+',   lbl:'Vehicles' },
    { icon:'📦', val:'12K+',   lbl:'Orders' },
  ];

  pills = [
    { icon:'fas fa-store',        text:'Live Marketplace' },
    { icon:'fas fa-tractor',      text:'Vehicle Hire' },
    { icon:'fas fa-people-carry', text:'Manpower' },
    { icon:'fas fa-shield-alt',   text:'KYC Secured' },
    { icon:'fas fa-comments',     text:'Direct Chat' },
  ];

  roles = [
    { val:'farmer',        icon:'🌾', label:'Farmer' },
    { val:'buyer',         icon:'🛒', label:'Buyer' },
    { val:'vehicle_owner', icon:'🚜', label:'Vehicle Owner' },
    { val:'manpower',      icon:'👷', label:'Manpower' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  fillDemo(role: string) {
    if (role === 'farmer') this.loginData = { email:'farmer@demo.com', password:'demo123' };
    if (role === 'buyer')  this.loginData = { email:'buyer@demo.com',  password:'demo123' };
    if (role === 'admin')  this.loginData = { email:'admin@demo.com',  password:'admin123' };
  }

  doLogin() {
    this.error = ''; this.loading = true;
    this.authService.login(this.loginData).subscribe({
      next: () => {
        const user = this.authService.currentUser;
        if (user?.role === 'admin')         this.router.navigate(['/admin']);
        else if (!user?.kycVerified)        this.router.navigate(['/kyc']);
        else                                this.router.navigate(['/dashboard']);
      },
      error: (err) => { this.error = err.error?.error || 'Login failed. Check your credentials.'; this.loading = false; }
    });
  }

  doRegister() {
    this.error = ''; this.emailTouched = true; this.phoneTouched = true; this.confirmPwdTouched = true;
    if (!this.regData.role)  { this.error = 'Please select your role'; return; }
    if (!this.regData.email || !this.isValidEmail(this.regData.email))
      { this.error = 'Please enter a valid Gmail address'; return; }
    if (this.regData.phone && this.regData.phone.length !== 10)
      { this.error = 'Phone must be exactly 10 digits'; return; }
    if (this.regData.phone && !this.isValidPhone(this.regData.phone))
      { this.error = 'Phone must start with 6, 7, 8, or 9'; return; }
    if (!this.regData.password || this.regData.password.length < 6)
      { this.error = 'Password must be at least 6 characters'; return; }
    if (this.regData.password !== this.regData.confirmPassword)
      { this.error = 'Passwords do not match'; return; }
    this.loading = true;
    const { confirmPassword, ...payload } = this.regData;
    this.authService.register(payload).subscribe({
      next: () => this.router.navigate(['/kyc']),
      error: (err) => { this.error = err.error?.error || 'Registration failed'; this.loading = false; }
    });
  }

  openForgot() {
    this.error = ''; this.successMsg = '';
    this.forgotEmail = this.loginData.email || '';
    this.mode = 'forgot';
  }

  doForgot() {
    this.error = ''; this.successMsg = '';
    if (!this.forgotEmail || !this.forgotEmail.includes('@'))
      { this.error = 'Please enter a valid email address'; return; }
    this.loading = true;
    this.http.post<any>(`${environment.apiUrl}/auth/forgot-password`, { email: this.forgotEmail }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.resetToken) {
          // Demo mode: token returned directly
          this.resetData.token = res.resetToken;
          this.successMsg = 'Reset code generated! Copy the code and set your new password.';
          setTimeout(() => { this.successMsg = ''; this.mode = 'reset'; }, 2000);
        } else {
          this.successMsg = res.message || 'If that email exists, a reset link has been sent.';
          setTimeout(() => { this.successMsg = ''; this.mode = 'login'; }, 3000);
        }
      },
      error: (err) => { this.error = err.error?.error || 'Failed to send reset code'; this.loading = false; }
    });
  }

  doReset() {
    this.error = ''; this.successMsg = '';
    if (!this.resetData.token) { this.error = 'Please enter the reset code'; return; }
    if (!this.resetData.newPassword || this.resetData.newPassword.length < 6)
      { this.error = 'New password must be at least 6 characters'; return; }
    if (this.resetData.newPassword !== this.resetData.confirmPassword)
      { this.error = 'Passwords do not match'; return; }
    this.loading = true;
    this.http.post<any>(`${environment.apiUrl}/auth/reset-password`, {
      resetToken: this.resetData.token,
      newPassword: this.resetData.newPassword
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMsg = res.message || 'Password reset successfully!';
        this.resetData = { token:'', newPassword:'', confirmPassword:'' };
        setTimeout(() => { this.successMsg = ''; this.mode = 'login'; }, 2500);
      },
      error: (err) => { this.error = err.error?.error || 'Reset failed. Token may be expired.'; this.loading = false; }
    });
  }

  isValidEmail(e: string): boolean { return /^[a-zA-Z0-9._%+\-]+@gmail\.com$/.test((e||'').trim()); }
  isValidPhone(p: string): boolean { return /^[6-9][0-9]{9}$/.test((p||'').trim()); }
  phoneKeyOnly(e: KeyboardEvent) { if (!/[0-9]/.test(e.key)) e.preventDefault(); }
}
