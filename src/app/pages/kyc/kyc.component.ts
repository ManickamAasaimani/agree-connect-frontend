import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { KycService } from '../../services/services';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="kyc-root">
      <div class="kyc-card">

        <!-- Brand -->
        <div class="kyc-brand">
          <div class="kyc-logo-wrap">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M13 2L4 7v12l9 5 9-5V7L13 2z" stroke="#1e8a2c" stroke-width="1.5"/>
              <path d="M13 6v8M10 9l3-3 3 3" stroke="#27a836" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="13" cy="16" r="2" fill="#1e8a2c"/>
            </svg>
          </div>
          <span class="kyc-logo-name">AgriConnect Hub</span>
        </div>

        <!-- ✅ SUCCESS SCREEN -->
        <div *ngIf="verified" class="verified-screen">
          <div class="verified-circle">
            <i class="fas fa-shield-check"></i>
          </div>
          <h2 class="verified-title">Identity Verified! 🎉</h2>
          <p class="verified-sub">Your Aadhaar has been verified successfully.<br>Welcome to AgriConnect Hub!</p>
          <button class="btn btn-primary btn-xl w-full" (click)="goToDashboard()">
            <i class="fas fa-arrow-right"></i> Enter Dashboard
          </button>
        </div>

        <!-- KYC FLOW -->
        <div *ngIf="!verified">

          <!-- Step indicator -->
          <div class="kyc-steps">
            <div class="ks-step" [class.active]="step >= 1" [class.done]="step > 1">
              <div class="ks-dot">
                <i class="fas fa-check" *ngIf="step > 1"></i>
                <span *ngIf="step <= 1">1</span>
              </div>
              <div class="ks-label">Aadhaar</div>
            </div>
            <div class="ks-line" [class.done]="step > 1"></div>
            <div class="ks-step" [class.active]="step >= 2">
              <div class="ks-dot"><span>2</span></div>
              <div class="ks-label">OTP</div>
            </div>
          </div>

          <!-- STEP 1: Aadhaar Input -->
          <div *ngIf="step === 1" class="kyc-body">
            <div class="aadhaar-card-mock">
              <div class="acm-header">
                <span>🏛️</span>
                <span class="acm-gov">Government of India</span>
              </div>
              <div class="acm-label">Aadhaar</div>
              <div class="acm-num">{{ aadhaar.length > 0 ? maskAadhaar() : 'XXXX XXXX XXXX' }}</div>
            </div>

            <h2 class="step-title">Enter Your Aadhaar</h2>
            <p class="step-sub">We'll send a one-time password to verify your identity</p>

            <div class="form-group">
              <label class="form-label">12-digit Aadhaar Number</label>
              <div class="input-wrap">
                <i class="fas fa-id-card input-icon"></i>
                <input class="form-control has-icon mono-input"
                  [(ngModel)]="aadhaar" name="aadhaar"
                  placeholder="Enter 12-digit Aadhaar number"
                  maxlength="12" inputmode="numeric"
                  (input)="onAadhaarInput($event)">
              </div>
              <div class="char-count" [class.ready]="aadhaar.length === 12">
                {{ aadhaar.length }}/12 digits {{ aadhaar.length === 12 ? '✓' : '' }}
              </div>
            </div>

            <div class="info-note">
              <i class="fas fa-lock"></i>
              <span>Your OTP will expire in <strong>5 minutes</strong> after sending. Please enter the correct OTP to proceed.</span>
            </div>

            <div class="alert alert-error" *ngIf="kycError">
              <i class="fas fa-circle-exclamation"></i> {{ kycError }}
            </div>

            <button class="btn btn-primary btn-xl w-full" (click)="sendOtp()"
              [disabled]="aadhaar.length !== 12 || kycLoading">
              <span class="spinner" *ngIf="kycLoading"></span>
              <i class="fas fa-paper-plane" *ngIf="!kycLoading"></i>
              {{ kycLoading ? 'Sending OTP...' : 'Send OTP' }}
            </button>
          </div>

          <!-- STEP 2: OTP Verification -->
          <div *ngIf="step === 2" class="kyc-body">

            <div class="otp-sent-banner">
              <div class="osb-icon"><i class="fas fa-mobile-screen-button"></i></div>
              <div class="osb-text">
                <div class="osb-title">OTP Generated for Demo</div>
                <div class="osb-sub">Use this OTP to verify. Expires in <strong class="timer-val" [class.urgent]="timeLeft <= 60">{{ formatTime(timeLeft) }}</strong></div>
                <div class="osb-otp-row">
                  <span class="osb-otp-label">Your OTP:</span>
                  <span class="osb-otp-val">{{ simulatedOtp }}</span>
                  <button type="button" class="otp-copy-btn" (click)="autoFillOtp()" title="Auto-fill OTP">
                    <i class="fas fa-wand-magic-sparkles"></i> Fill
                  </button>
                </div>
              </div>
            </div>

            <!-- Timer bar -->
            <div class="timer-bar-wrap">
              <div class="timer-bar" [style.width]="(timeLeft/300*100)+'%'" [class.urgent]="timeLeft <= 60"></div>
            </div>

            <h2 class="step-title">Enter OTP</h2>
            <p class="step-sub">Type the 5-digit code sent to your registered mobile number</p>

            <!-- OTP boxes -->
            <div class="otp-boxes-wrap">
              <input *ngFor="let i of [0,1,2,3,4]"
                type="text" maxlength="1"
                class="otp-box" [class.filled]="otpDigits[i]" [class.wrong]="wrongOtp"
                [value]="otpDigits[i]"
                (input)="onOtpInput($event, i)"
                (keydown)="onOtpKeydown($event, i)"
                (paste)="onOtpPaste($event)"
                [id]="'otp-'+i" inputmode="numeric" autocomplete="one-time-code">
            </div>

            <!-- Wrong OTP message -->
            <div class="alert alert-error" *ngIf="wrongOtp">
              <i class="fas fa-circle-xmark"></i>
              <div>
                <strong>Incorrect OTP.</strong> Please enter the correct OTP.
                <span *ngIf="attemptsLeft > 0"> You have <strong>{{ attemptsLeft }}</strong> attempt(s) remaining.</span>
                <span *ngIf="attemptsLeft === 0"> Please resend OTP.</span>
              </div>
            </div>

            <!-- Expired message -->
            <div class="alert alert-warning" *ngIf="otpExpired">
              <i class="fas fa-clock"></i>
              <div><strong>OTP Expired.</strong> Please resend a new OTP to continue.</div>
            </div>

            <div class="alert alert-error" *ngIf="kycError && !wrongOtp && !otpExpired">
              <i class="fas fa-circle-exclamation"></i> {{ kycError }}
            </div>

            <button class="btn btn-primary btn-xl w-full" (click)="verifyOtp()"
              [disabled]="otpDigits.join('').length !== 5 || kycLoading || otpExpired || attemptsLeft === 0">
              <span class="spinner" *ngIf="kycLoading"></span>
              <i class="fas fa-check-shield" *ngIf="!kycLoading"></i>
              {{ kycLoading ? 'Verifying...' : 'Verify OTP' }}
            </button>

            <div class="otp-actions">
              <button class="otp-action-btn" (click)="resendOtp()" [disabled]="resendCooldown > 0">
                <i class="fas fa-rotate-right"></i>
                {{ resendCooldown > 0 ? 'Resend in ' + resendCooldown + 's' : 'Resend OTP' }}
              </button>
              <button class="otp-action-btn" (click)="step = 1; resetOtp()">
                <i class="fas fa-arrow-left"></i> Change Aadhaar
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .kyc-root {
      min-height: 100vh;
      background: linear-gradient(145deg, #f0faf2 0%, #e0f5e4 100%);
      display: flex; align-items: center; justify-content: center; padding: 24px;
      font-family: 'Poppins', sans-serif;
    }
    .kyc-card {
      background: #fff; border-radius: 24px; padding: 36px 40px;
      width: 100%; max-width: 460px;
      box-shadow: 0 16px 56px rgba(30,138,44,0.13), 0 2px 8px rgba(0,0,0,0.05);
      border: 1px solid rgba(30,138,44,0.15);
      animation: fadeUp 0.4s ease both;
    }

    .kyc-brand { display:flex; align-items:center; gap:10px; margin-bottom:28px; }
    .kyc-logo-wrap { width:40px; height:40px; border-radius:10px; background:#e8faea; border:1px solid rgba(30,138,44,0.2); display:flex; align-items:center; justify-content:center; }
    .kyc-logo-name { font-size:1.1rem; font-weight:800; color:#1a2e1c; }

    /* Steps */
    .kyc-steps { display:flex; align-items:center; margin-bottom:28px; }
    .ks-step { display:flex; align-items:center; gap:8px; }
    .ks-dot { width:32px; height:32px; border-radius:50%; background:#f0faf2; border:2px solid rgba(30,138,44,0.2); display:flex; align-items:center; justify-content:center; font-size:0.82rem; font-weight:700; color:#6b8f70; transition:all 0.3s; }
    .ks-step.active .ks-dot { background:linear-gradient(135deg,#27a836,#1a5e2a); border-color:#27a836; color:#fff; }
    .ks-step.done  .ks-dot { background:#dcfce7; border-color:#16a34a; color:#16a34a; }
    .ks-label { font-size:0.78rem; font-weight:600; color:#6b8f70; }
    .ks-step.active .ks-label { color:#1e8a2c; font-weight:700; }
    .ks-line { flex:1; height:2px; background:rgba(30,138,44,0.15); margin:0 12px; transition:background 0.3s; }
    .ks-line.done { background:#27a836; }

    /* Aadhaar mock card */
    .aadhaar-card-mock { background:linear-gradient(135deg,#1a5e2a 0%,#27a836 100%); border-radius:14px; padding:18px 20px; color:#fff; margin-bottom:22px; }
    .acm-header { display:flex; align-items:center; gap:8px; margin-bottom:10px; font-size:0.72rem; opacity:0.8; }
    .acm-gov    { font-weight:600; }
    .acm-label  { font-size:1rem; font-weight:700; margin-bottom:5px; }
    .acm-num    { font-family:'JetBrains Mono',monospace; font-size:1.1rem; letter-spacing:0.15em; opacity:0.85; }

    .step-title { font-size:1.35rem; font-weight:800; color:#1a2e1c; margin-bottom:5px; }
    .step-sub   { font-size:0.875rem; color:#6b8f70; margin-bottom:20px; line-height:1.5; }

    .mono-input { font-family:'JetBrains Mono',monospace; font-size:1.05rem; letter-spacing:0.12em; }
    .char-count { font-size:0.75rem; color:#6b8f70; margin-top:5px; text-align:right; }
    .char-count.ready { color:#16a34a; font-weight:600; }

    .info-note { display:flex; align-items:flex-start; gap:9px; background:#f0faf2; border-radius:9px; padding:11px 13px; margin-bottom:18px; font-size:0.8rem; color:#3a5a3e; line-height:1.5; }
    .info-note i { color:#27a836; margin-top:2px; flex-shrink:0; }

    .otp-sent-banner { display:flex; align-items:flex-start; gap:13px; background:#e8faea; border:1px solid rgba(30,138,44,0.2); border-radius:12px; padding:14px 16px; margin-bottom:10px; }
    .osb-icon { width:38px; height:38px; border-radius:10px; background:#27a836; display:flex; align-items:center; justify-content:center; color:#fff; font-size:1rem; flex-shrink:0; }
    .osb-title { font-size:0.9rem; font-weight:700; color:#1a2e1c; }
    .osb-sub   { font-size:0.78rem; color:#6b8f70; margin-top:2px; }
    .timer-val { color:#1e8a2c; font-weight:700; }
    .timer-val.urgent { color:#dc2626; animation: pulse 1s infinite; }
    .osb-otp-row { display:flex; align-items:center; gap:10px; margin-top:8px; }
    .osb-otp-label { font-size:0.78rem; color:#3a5a3e; font-weight:600; }
    .osb-otp-val { font-family:'JetBrains Mono',monospace; font-size:1.6rem; font-weight:900; color:#1a5e2a; letter-spacing:0.25em; background:#fff; border:2px dashed #27a836; border-radius:8px; padding:3px 12px; }
    .otp-copy-btn { display:flex; align-items:center; gap:5px; padding:5px 10px; background:#27a836; color:#fff; border:none; border-radius:7px; font-size:0.75rem; font-weight:700; cursor:pointer; font-family:'Poppins',sans-serif; transition:all 0.2s; }
    .otp-copy-btn:hover { background:#1a5e2a; }

    /* Timer bar */
    .timer-bar-wrap { height:4px; background:#f0faf2; border-radius:2px; margin-bottom:22px; overflow:hidden; }
    .timer-bar { height:100%; background:linear-gradient(90deg,#27a836,#3ec951); border-radius:2px; transition:width 1s linear; }
    .timer-bar.urgent { background:linear-gradient(90deg,#dc2626,#f87171); }

    /* OTP Boxes */
    .otp-boxes-wrap { display:flex; gap:10px; justify-content:center; margin:8px 0 20px; }
    .otp-box { width:54px; height:58px; border:2px solid rgba(30,138,44,0.25); border-radius:12px; text-align:center; font-size:1.5rem; font-weight:800; color:#1a2e1c; font-family:'JetBrains Mono',monospace; background:#f7fdf8; outline:none; transition:all 0.2s; }
    .otp-box:focus { border-color:#27a836; background:#fff; box-shadow:0 0 0 3px rgba(30,138,44,0.15); }
    .otp-box.filled { border-color:#27a836; background:#e8faea; }
    .otp-box.wrong  { border-color:#dc2626; background:#fee2e2; animation: shake 0.4s ease; }

    /* OTP actions */
    .otp-actions { display:flex; gap:10px; margin-top:12px; }
    .otp-action-btn { flex:1; padding:9px; border:1.5px solid rgba(30,138,44,0.2); background:#f7fdf8; border-radius:8px; font-size:0.8rem; font-weight:600; color:#1e8a2c; cursor:pointer; transition:all 0.2s; font-family:'Poppins',sans-serif; display:flex; align-items:center; justify-content:center; gap:6px; }
    .otp-action-btn:hover { background:#e8faea; border-color:#27a836; }
    .otp-action-btn:disabled { opacity:0.5; cursor:not-allowed; }

    /* Success */
    .verified-screen { text-align:center; padding:16px 0; animation:bounceIn 0.5s ease both; }
    .verified-circle { width:90px; height:90px; border-radius:50%; background:linear-gradient(135deg,#dcfce7,#86efac); border:3px solid #16a34a; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:2.5rem; color:#16a34a; }
    .verified-title { font-size:1.7rem; font-weight:800; color:#1a2e1c; margin-bottom:10px; }
    .verified-sub { color:#6b8f70; font-size:0.9rem; margin-bottom:28px; line-height:1.7; }

    /* Alerts */
    .alert { display:flex; align-items:flex-start; gap:10px; padding:12px 14px; border-radius:10px; font-size:0.85rem; font-weight:500; margin-bottom:14px; }
    .alert i { margin-top:2px; flex-shrink:0; }
    .alert-error   { background:#fee2e2; color:#dc2626; border:1px solid rgba(220,38,38,0.2); }
    .alert-warning { background:#fef3c7; color:#d97706; border:1px solid rgba(217,119,6,0.2); }

    /* Form */
    .form-group { margin-bottom:16px; }
    .form-label { display:block; font-size:0.82rem; font-weight:600; color:#3a5a3e; margin-bottom:6px; }
    .form-control { width:100%; padding:11px 14px; background:#f7fdf8; border:1.5px solid rgba(30,138,44,0.2); border-radius:10px; color:#1a2e1c; font-family:'Poppins',sans-serif; font-size:0.9rem; transition:all 0.2s; outline:none; }
    .form-control:focus { border-color:#27a836; background:#fff; box-shadow:0 0 0 3px rgba(30,138,44,0.12); }
    .form-control.has-icon { padding-left:40px; }
    .input-wrap { position:relative; }
    .input-icon  { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#6b8f70; font-size:0.85rem; pointer-events:none; }

    /* Button */
    .btn { display:inline-flex; align-items:center; gap:8px; padding:10px 20px; border-radius:10px; font-family:'Poppins',sans-serif; font-size:0.9rem; font-weight:600; cursor:pointer; border:none; text-decoration:none; transition:all 0.2s; white-space:nowrap; }
    .btn-primary { background:linear-gradient(135deg,#27a836,#166a21); color:#fff; box-shadow:0 3px 10px rgba(30,138,44,0.3); }
    .btn-primary:hover { transform:translateY(-1px); box-shadow:0 5px 18px rgba(30,138,44,0.4); }
    .btn-primary:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
    .btn-xl  { padding:13px 24px; font-size:1rem; }
    .w-full  { width:100%; justify-content:center; }
    .spinner { display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; flex-shrink:0; }

    @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes bounceIn { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
    @keyframes spin     { to{transform:rotate(360deg)} }
    @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.5} }
    @keyframes shake    { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
  `]
})
export class KycComponent implements OnDestroy {
  step = 1;
  aadhaar = '';
  otpDigits: string[] = ['', '', '', '', ''];
  simulatedOtp = '';
  kycLoading = false;
  kycError = '';
  verified = false;
  wrongOtp = false;
  otpExpired = false;
  attemptsLeft = 3;

  // Timer: 5 minutes = 300 seconds
  timeLeft = 300;
  resendCooldown = 0;
  private timerInterval: any = null;
  private resendInterval: any = null;

  constructor(
    private authService: AuthService,
    private kycService: KycService,
    private router: Router
  ) {}

  ngOnDestroy() {
    this.clearTimers();
  }

  clearTimers() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.resendInterval) clearInterval(this.resendInterval);
  }

  maskAadhaar(): string {
    if (this.aadhaar.length <= 4) return this.aadhaar;
    const last4 = this.aadhaar.slice(-4);
    const masked = 'X'.repeat(this.aadhaar.length - 4);
    const full = masked + last4;
    // Format as groups of 4
    return full.replace(/(.{4})/g, '$1 ').trim();
  }

  onAadhaarInput(event: any) {
    this.aadhaar = event.target.value.replace(/\D/g, '').slice(0, 12);
    event.target.value = this.aadhaar;
    this.kycError = '';
  }

  sendOtp() {
    this.kycError = '';
    if (this.aadhaar.length !== 12) { this.kycError = 'Please enter a valid 12-digit Aadhaar number.'; return; }
    this.kycLoading = true;

    // Generate OTP immediately — no need to wait for backend
    this.simulatedOtp = this.generateOtp();

    // Simulate a small delay (like real OTP sending)
    setTimeout(() => {
      this.startSession();
      // Also try backend in background (optional, non-blocking)
      this.kycService.sendOtp(this.aadhaar).subscribe({
        next: (res: any) => {
          // If backend returns an OTP, use it; otherwise keep the local one
          if (res?.otp) { this.simulatedOtp = res.otp; }
        },
        error: () => { /* Keep the locally generated OTP — already shown */ }
      });
    }, 600);
  }

  generateOtp(): string {
    return String(Math.floor(10000 + Math.random() * 90000));
  }

  startSession() {
    this.kycLoading = false;
    this.step = 2;
    this.timeLeft = 300;
    this.attemptsLeft = 3;
    this.wrongOtp = false;
    this.otpExpired = false;
    this.otpDigits = ['', '', '', '', ''];
    this.clearTimers();

    // Countdown timer
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.otpExpired = true;
        clearInterval(this.timerInterval);
      }
    }, 1000);

    // Resend cooldown: 30 seconds
    this.resendCooldown = 30;
    this.resendInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        this.resendCooldown = 0;
        clearInterval(this.resendInterval);
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  onOtpInput(event: any, index: number) {
    const val = event.target.value.replace(/\D/g, '');
    this.otpDigits[index] = val.slice(-1);
    this.wrongOtp = false;
    this.kycError = '';
    if (val && index < 4) {
      const next = document.getElementById('otp-' + (index + 1)) as HTMLInputElement;
      if (next) { next.focus(); }
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const prev = document.getElementById('otp-' + (index - 1)) as HTMLInputElement;
      if (prev) prev.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 5);
    for (let i = 0; i < 5; i++) {
      this.otpDigits[i] = pasted[i] || '';
    }
    const lastFilled = Math.min(pasted.length, 4);
    setTimeout(() => {
      const el = document.getElementById('otp-' + lastFilled) as HTMLInputElement;
      if (el) el.focus();
    }, 0);
  }

  verifyOtp() {
    const entered = this.otpDigits.join('');
    this.kycError = '';
    this.wrongOtp = false;

    if (entered.length !== 5) { this.kycError = 'Please enter the complete 5-digit OTP.'; return; }
    if (this.otpExpired) { this.kycError = 'OTP has expired. Please resend a new OTP.'; return; }

    this.kycLoading = true;

    setTimeout(() => {
      // ✅ STRICT CHECK: entered OTP must match the generated OTP exactly
      if (entered === this.simulatedOtp) {
        this.clearTimers();
        this.kycService.verifyOtp(this.aadhaar, entered).subscribe({
          next: () => this.onVerifySuccess(),
          error: () => this.onVerifySuccess() // fallback for demo
        });
      } else {
        // ❌ WRONG OTP
        this.attemptsLeft--;
        this.wrongOtp = true;
        this.kycLoading = false;
        this.otpDigits = ['', '', '', '', ''];
        // Shake effect resets after 400ms
        setTimeout(() => {
          const el = document.getElementById('otp-0') as HTMLInputElement;
          if (el) el.focus();
        }, 100);
        if (this.attemptsLeft === 0) {
          this.kycError = 'Too many wrong attempts. Please resend OTP.';
          this.wrongOtp = false;
        }
      }
    }, 800);
  }

  onVerifySuccess() {
    const user = this.authService.currentUser;
    if (user) {
      this.authService.updateCurrentUser({ ...user, kycVerified: true });
    }
    this.kycLoading = false;
    this.verified = true;
  }

  autoFillOtp() {
    for (let i = 0; i < 5; i++) {
      this.otpDigits[i] = this.simulatedOtp[i] || '';
    }
    this.wrongOtp = false;
    this.kycError = '';
    // Focus last box
    setTimeout(() => {
      const el = document.getElementById('otp-4') as HTMLInputElement;
      if (el) el.focus();
    }, 50);
  }

  resendOtp() {
    if (this.resendCooldown > 0) return;
    this.otpDigits = ['', '', '', '', ''];
    this.wrongOtp = false;
    this.otpExpired = false;
    this.kycError = '';
    this.kycLoading = true;

    // Generate new OTP immediately
    this.simulatedOtp = this.generateOtp();

    setTimeout(() => {
      this.startSession();
      this.kycService.sendOtp(this.aadhaar).subscribe({
        next: (res: any) => { if (res?.otp) { this.simulatedOtp = res.otp; } },
        error: () => { /* Keep local OTP */ }
      });
    }, 600);
  }

  resetOtp() {
    this.clearTimers();
    this.otpDigits = ['', '', '', '', ''];
    this.wrongOtp = false;
    this.otpExpired = false;
    this.kycError = '';
    this.simulatedOtp = '';
    this.attemptsLeft = 3;
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
