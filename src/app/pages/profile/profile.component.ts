import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">My Profile</h1>
        <p class="page-subtitle">Manage your account & identity</p>
      </div>
    </div>

    <div class="profile-layout">
      <!-- Identity Card -->
      <div class="id-card">
        <div class="id-card-bg">
          <div class="idc-circuit"></div>
        </div>
        <div class="id-card-body">
          <div class="idc-avatar-ring">
            <div class="idc-avatar" *ngIf="!user?.profileImg">{{ user?.name?.[0]?.toUpperCase() }}</div>
            <img class="idc-avatar-img" *ngIf="user?.profileImg" [src]="user?.profileImg" alt="Profile photo">
            <label class="idc-photo-btn" title="Upload photo">
              <i class="fas fa-camera"></i>
              <input type="file" accept="image/*" (change)="onPhotoSelect($event)" style="display:none">
            </label>
          </div>
          <div class="idc-name">{{ user?.name }}</div>
          <div class="idc-email">{{ user?.email }}</div>
          <div class="idc-role-chip">
            <i class="fas fa-id-badge"></i> {{ formatRole(user?.role) }}
          </div>
          <div class="idc-divider"></div>
          <div class="idc-fields">
            <div class="idf" *ngIf="user?.location">
              <div class="idf-ic"><i class="fas fa-location-dot"></i></div>
              <div><div class="idf-l">Location</div><div class="idf-v">{{ user?.location }}</div></div>
            </div>
            <div class="idf" *ngIf="user?.phone">
              <div class="idf-ic"><i class="fas fa-phone-flip"></i></div>
              <div><div class="idf-l">Phone</div><div class="idf-v">{{ user?.phone }}</div></div>
            </div>
            <div class="idf" *ngIf="user?.createdAt">
              <div class="idf-ic"><i class="fas fa-calendar-check"></i></div>
              <div><div class="idf-l">Member since</div><div class="idf-v">{{ user?.createdAt | date:'mediumDate' }}</div></div>
            </div>
          </div>
          <div class="idc-bio" *ngIf="user?.bio">{{ user?.bio }}</div>
        </div>
      </div>

      <!-- Edit Form -->
      <div class="card edit-form-card">
        <div class="card-header">
          <h3><i class="fas fa-pen-to-square"></i> Edit Profile</h3>
        </div>
        <div class="alert alert-success" *ngIf="success"><i class="fas fa-check-circle"></i> {{ success }}</div>
        <div class="alert alert-error"   *ngIf="error"><i class="fas fa-triangle-exclamation"></i> {{ error }}</div>
        <form (ngSubmit)="save()">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <div class="input-wrap">
                <i class="fas fa-user input-icon"></i>
                <input class="form-control has-icon" [(ngModel)]="form.name" name="name" placeholder="Your name">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <div class="input-wrap">
                <i class="fas fa-phone input-icon"></i>
                <input class="form-control has-icon" [(ngModel)]="form.phone" name="phone" placeholder="+91 ...">
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Location</label>
            <div class="input-wrap">
              <i class="fas fa-location-dot input-icon"></i>
              <input class="form-control has-icon" [(ngModel)]="form.location" name="location" placeholder="City, State">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Bio</label>
            <textarea class="form-control" [(ngModel)]="form.bio" name="bio" rows="4" placeholder="Tell others about yourself or your farm..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Profile Photo</label>
            <div class="photo-upload-row">
              <div class="photo-preview" *ngIf="form.profileImg || user?.profileImg">
                <img [src]="form.profileImg || user?.profileImg" alt="Preview">
              </div>
              <div class="photo-upload-btns">
                <label class="btn btn-outline btn-sm photo-file-btn">
                  <i class="fas fa-upload"></i> Upload Photo
                  <input type="file" accept="image/*" (change)="onPhotoSelect($event)" style="display:none">
                </label>
                <div class="input-wrap" style="flex:1">
                  <i class="fas fa-image input-icon"></i>
                  <input class="form-control has-icon" [(ngModel)]="form.profileImg" name="profileImg" placeholder="or paste image URL">
                </div>
              </div>
            </div>
          </div>
          <div class="form-btns">
            <button class="btn btn-ghost" type="button" (click)="resetForm()"><i class="fas fa-arrow-rotate-left"></i> Reset</button>
            <button class="btn btn-primary" type="submit" [disabled]="saving">
              <span class="spinner" *ngIf="saving"></span>
              <i class="fas fa-floppy-disk" *ngIf="!saving"></i>
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-layout { display: grid; grid-template-columns: 300px 1fr; gap: 22px; }
    @media (max-width: 900px) { .profile-layout { grid-template-columns: 1fr; } }

    .idc-avatar-img {
      width: 68px; height: 68px; border-radius: 50%; object-fit: cover;
      border: 2px solid #fff;
    }
    .idc-photo-btn {
      position: absolute; bottom: 0; right: 0;
      width: 24px; height: 24px; border-radius: 50%;
      background: #2e9e2e; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.6rem; cursor: pointer; border: 2px solid #fff;
    }

    /* ID Card */
    .id-card { border-radius: var(--r-xl); overflow: hidden; border: 1px solid rgba(30,138,44,0.3); box-shadow: var(--glow-sm); }
    .id-card-bg {
      height: 110px; position: relative;
      background: linear-gradient(135deg, var(--g-900), var(--g-800), rgba(201,162,39,0.15));
      overflow: hidden;
    }
    .id-card-bg::after {
      content: '';
      position: absolute; inset: 0;
      background: repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(39,168,54,0.04) 12px, rgba(39,168,54,0.04) 13px);
    }
    /* Circuit lines decoration */
    .idc-circuit {
      position: absolute; inset: 0;
      background:
        linear-gradient(var(--g-800) 1px, transparent 1px),
        linear-gradient(90deg, var(--g-800) 1px, transparent 1px);
      background-size: 20px 20px; opacity: 0.4;
    }
    .id-card-body {
      background: #fff; padding: 0 20px 24px;
      display: flex; flex-direction: column; align-items: center;
    }
    .idc-avatar-ring {
      width: 80px; height: 80px; border-radius: 50%;
      background: linear-gradient(135deg, var(--g-600), var(--gold-dim));
      display: flex; align-items: center; justify-content: center;
      margin-top: -40px; position: relative; z-index: 1;
      box-shadow: 0 0 24px rgba(39,168,54,0.4);
    }
    .idc-avatar {
      width: 68px; height: 68px; border-radius: 50%;
      background: linear-gradient(135deg, var(--g-800), var(--g-600));
      color: #b4f0bc; display: flex; align-items: center; justify-content: center;
      font-family: 'Poppins', sans-serif; font-size: 1.8rem; font-weight: 800;
      border: 2px solid #fff;
    }
    .idc-name { font-family: 'Poppins', sans-serif; font-size: 1.15rem; font-weight: 800; color: #1a2e1c; margin-top: 10px; }
    .idc-email { font-size: 0.78rem; color: #6b8f70; margin-top: 2px; }
    .idc-role-chip {
      display: flex; align-items: center; gap: 6px;
      padding: 4px 12px; border-radius: 20px; margin-top: 10px;
      background: rgba(39,168,54,0.1); color: #3ec951;
      border: 1px solid rgba(30,138,44,0.3);
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    }
    .idc-divider { width: 100%; height: 1px; background: rgba(30,138,44,0.15); margin: 16px 0; }
    .idc-fields { width: 100%; display: flex; flex-direction: column; gap: 12px; }
    .idf { display: flex; align-items: center; gap: 10px; }
    .idf-ic {
      width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
      background: #f7fdf8; border: 1px solid rgba(30,138,44,0.15);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; color: var(--g-500);
    }
    .idf-l { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em; color: #6b8f70; font-family: 'JetBrains Mono', monospace; }
    .idf-v { font-size: 0.83rem; font-weight: 600; color: #1a2e1c; }
    .idc-bio {
      width: 100%; margin-top: 14px; font-size: 0.78rem; color: #6b8f70;
      line-height: 1.7; background: #f7fdf8; border-radius: var(--r-sm);
      padding: 10px 12px; border: 1px solid rgba(30,138,44,0.15); font-style: italic;
    }

    /* Edit form */
    .edit-form-card { }
    .form-btns { display: flex; gap: 10px; justify-content: flex-end; padding-top: 4px; }
    .photo-upload-row { display: flex; flex-direction: column; gap: 10px; }
    .photo-preview img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(30,138,44,0.3); }
    .photo-upload-btns { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .photo-file-btn { cursor: pointer; }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  form: any = { name: '', phone: '', location: '', bio: '', profileImg: '' };
  saving = false; success = ''; error = '';

  constructor(private authService: AuthService) {}
  ngOnInit() { this.authService.getMe().subscribe(u => { this.user = u; this.resetForm(); }); }

  resetForm() {
    if (!this.user) return;
    this.form = { name: this.user.name || '', phone: this.user.phone || '', location: this.user.location || '', bio: this.user.bio || '', profileImg: this.user.profileImg || '' };
  }
  save() {
    this.saving = true; this.success = ''; this.error = '';
    this.authService.updateProfile(this.form).subscribe({
      next: () => { this.success = 'Profile updated!'; this.saving = false; if (this.user) this.user = { ...this.user, ...this.form }; setTimeout(() => this.success = '', 3000); },
      error: err => { this.error = err.error?.error || 'Update failed'; this.saving = false; }
    });
  }
  formatRole(role?: string): string {
    const m: any = { farmer:'Farmer', buyer:'Buyer', vehicle_owner:'Vehicle Owner', manpower:'Manpower' };
    return m[role || ''] || role || '';
  }

  onPhotoSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.form.profileImg = e.target.result;
      if (this.user) this.user = { ...this.user, profileImg: e.target.result };
    };
    reader.readAsDataURL(file);
  }
}
