import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CropService } from '../../services/services';
import { CropListing } from '../../models/models';

// Crop-specific dummy images (SVG data URIs — no network needed, always shows a relevant placeholder)
const CROP_PLACEHOLDERS: Record<string, string> = {
  Vegetables: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%23dcfce7'/%3E%3Ctext x='100' y='75' text-anchor='middle' font-size='48'%3E%F0%9F%A5%A6%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' font-size='13' fill='%23166534' font-family='sans-serif'%3EVegetables%3C/text%3E%3C/svg%3E`,
  Fruits: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%23fef9c3'/%3E%3Ctext x='100' y='75' text-anchor='middle' font-size='48'%3E%F0%9F%8D%8A%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' font-size='13' fill='%23713f12' font-family='sans-serif'%3EFruits%3C/text%3E%3C/svg%3E`,
  Grains: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%23fef3c7'/%3E%3Ctext x='100' y='75' text-anchor='middle' font-size='48'%3E%F0%9F%8C%BE%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' font-size='13' fill='%2392400e' font-family='sans-serif'%3EGrains%3C/text%3E%3C/svg%3E`,
  Pulses: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%23fce7f3'/%3E%3Ctext x='100' y='75' text-anchor='middle' font-size='48'%3E%F0%9F%AB%98%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' font-size='13' fill='%239d174d' font-family='sans-serif'%3EPulses%3C/text%3E%3C/svg%3E`,
  Spices: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%23ffedd5'/%3E%3Ctext x='100' y='75' text-anchor='middle' font-size='48'%3E%F0%9F%8C%B6%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' font-size='13' fill='%239a3412' font-family='sans-serif'%3ESpices%3C/text%3E%3C/svg%3E`,
  Oilseeds: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%23fef9c3'/%3E%3Ctext x='100' y='75' text-anchor='middle' font-size='48'%3E%F0%9F%A5%9C%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' font-size='13' fill='%23713f12' font-family='sans-serif'%3EOilseeds%3C/text%3E%3C/svg%3E`,
  default: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%23f0fdf4'/%3E%3Ctext x='100' y='75' text-anchor='middle' font-size='48'%3E%F0%9F%8C%BF%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' font-size='13' fill='%23166534' font-family='sans-serif'%3ECrop%3C/text%3E%3C/svg%3E`,
};

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">🌾 My Listings</h1>
        <p class="page-subtitle">Manage your crop listings</p>
      </div>
      <button class="btn btn-primary" (click)="openModal()">
        ➕ Add Listing
      </button>
    </div>

    <div class="alert alert-error" *ngIf="error">{{ error }}</div>
    <div class="alert alert-success" *ngIf="success">{{ success }}</div>

    <!-- Cards Grid with images -->
    <div class="empty-state card" *ngIf="listings.length === 0 && !loading">
      <div style="font-size:3rem;margin-bottom:12px">🌾</div>
      <h3>No listings yet</h3>
      <p>Start by adding your first crop listing</p>
    </div>

    <div class="listings-grid" *ngIf="listings.length > 0">
      <div class="listing-card" *ngFor="let l of listings">

        <!-- ── Crop Image ── -->
        <div class="card-img-wrap" (click)="edit(l)" title="Click to edit">
          <img
            [src]="l.imageUrl || placeholderFor(l.category)"
            [alt]="l.cropName"
            class="card-img"
            (error)="onImgError($event, l.category)"
          >
          <div class="img-overlay">
            <span class="img-edit-badge">✏️ Edit</span>
          </div>
          <div class="card-cat-badge" *ngIf="l.category">{{ l.category }}</div>
        </div>

        <!-- ── Card Body ── -->
        <div class="card-body">
          <div class="card-title-row">
            <h3 class="card-crop-name">{{ l.cropName }}</h3>
            <span [class]="'status-pill status-' + l.status">{{ l.status }}</span>
          </div>

          <div class="card-price">
            ₹{{ l.pricePerUnit }}
            <span class="price-unit">/ {{ l.unit }}</span>
          </div>

          <div class="card-meta">
            <span *ngIf="l.quantity"><i class="fas fa-weight-hanging"></i> {{ l.quantity }} {{ l.unit }}</span>
            <span *ngIf="l.location"><i class="fas fa-map-marker-alt"></i> {{ l.location }}</span>
            <span *ngIf="l.harvestDate"><i class="fas fa-calendar-alt"></i> {{ l.harvestDate | date:'dd MMM yyyy' }}</span>
            <span><i class="fas fa-eye"></i> {{ l.views }} views</span>
          </div>

          <p class="card-desc" *ngIf="l.description">{{ l.description | slice:0:70 }}{{ l.description.length > 70 ? '…' : '' }}</p>

          <div class="card-actions">
            <button class="btn btn-outline btn-sm" (click)="edit(l)">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" (click)="delete(l.id)">🗑 Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── ADD / EDIT MODAL ── -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal modal-wide" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ editId ? '✏️ Edit' : '➕ Add' }} Crop Listing</h3>
          <button class="modal-close" (click)="closeModal()"><i class="fas fa-times"></i></button>
        </div>

        <form (ngSubmit)="save()">

          <!-- ── IMAGE UPLOAD ── -->
          <div class="img-upload-section">
            <div class="img-preview-wrap" (click)="triggerFileInput()" title="Click to upload image">
              <img
                [src]="form.imageUrl || placeholderFor(form.category)"
                alt="Crop image"
                class="img-preview"
                (error)="onFormImgError($event)"
              >
              <div class="img-upload-overlay">
                <i class="fas fa-camera"></i>
                <span>{{ form.imageUrl ? 'Change Photo' : 'Upload Photo' }}</span>
              </div>
            </div>
            <input #fileInput type="file" accept="image/*" style="display:none" (change)="onFileSelected($event)">
            <div class="img-upload-hint">
              <i class="fas fa-info-circle"></i>
              Click the image to upload a photo of your crop (JPG, PNG, max 2MB).
              <span *ngIf="!form.imageUrl"> A category placeholder is shown until you upload.</span>
            </div>
            <button *ngIf="form.imageUrl" type="button" class="btn-remove-img" (click)="form.imageUrl=''">
              <i class="fas fa-times"></i> Remove photo
            </button>
          </div>

          <!-- ── FORM FIELDS ── -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Crop Name *</label>
              <input class="form-control" [(ngModel)]="form.cropName" name="cropName" required placeholder="e.g. Paddy, Tomato">
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-control" [(ngModel)]="form.category" name="category">
                <option value="">Select Category</option>
                <option *ngFor="let c of categories">{{ c }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Quantity *</label>
              <input class="form-control" type="number" [(ngModel)]="form.quantity" name="quantity" required min="0">
            </div>
            <div class="form-group">
              <label class="form-label">Unit</label>
              <select class="form-control" [(ngModel)]="form.unit" name="unit">
                <option value="kg">kg</option>
                <option value="quintal">quintal</option>
                <option value="ton">ton</option>
                <option value="dozen">dozen</option>
                <option value="piece">piece</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Price per {{ form.unit }} (₹) *</label>
              <input class="form-control" type="number" [(ngModel)]="form.pricePerUnit" name="pricePerUnit" required min="0">
              <div *ngIf="form.pricePerUnit > 0 && form.quantity > 0" class="price-hint">
                💰 Total value: <strong>₹{{ form.pricePerUnit * form.quantity | number }}</strong>
                <span *ngIf="form.unit==='ton'"> · ₹{{ (form.pricePerUnit/1000).toFixed(2) }}/kg</span>
                <span *ngIf="form.unit==='quintal'"> · ₹{{ (form.pricePerUnit/100).toFixed(2) }}/kg</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Location</label>
              <input class="form-control" [(ngModel)]="form.location" name="location" placeholder="City, State">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              Harvest Date
              <span class="label-note">(Today or past dates only)</span>
            </label>
            <input class="form-control" type="date" [(ngModel)]="form.harvestDate" name="harvestDate" [max]="todayDate">
            <div *ngIf="form.harvestDate && form.harvestDate > todayDate" class="field-err">
              ⚠️ Future dates are not allowed.
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-control" [(ngModel)]="form.description" name="description" rows="2"
              placeholder="Quality, variety, growing method, etc."></textarea>
          </div>

          <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:8px">
            <button type="button" class="btn btn-outline" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              <span class="spinner" *ngIf="saving"></span>
              {{ saving ? 'Saving...' : (editId ? 'Update Listing' : 'Create Listing') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* ── Cards Grid ── */
    .listings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    /* ── Listing Card ── */
    .listing-card {
      background: #fff;
      border: 1px solid rgba(30,138,44,0.12);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      display: flex;
      flex-direction: column;
    }
    .listing-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(30,138,44,0.13);
      border-color: rgba(30,138,44,0.28);
    }

    /* ── Card Image ── */
    .card-img-wrap {
      position: relative;
      height: 160px;
      overflow: hidden;
      cursor: pointer;
      flex-shrink: 0;
    }
    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .listing-card:hover .card-img { transform: scale(1.05); }
    .img-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .listing-card:hover .img-overlay { background: rgba(0,0,0,0.28); }
    .img-edit-badge {
      background: rgba(255,255,255,0.9);
      color: #1a5e2a;
      padding: 5px 13px;
      border-radius: 99px;
      font-size: 0.78rem;
      font-weight: 700;
      opacity: 0;
      transform: translateY(6px);
      transition: all 0.2s;
    }
    .listing-card:hover .img-edit-badge { opacity: 1; transform: translateY(0); }
    .card-cat-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(255,255,255,0.92);
      color: #166534;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 99px;
      backdrop-filter: blur(4px);
    }

    /* ── Card Body ── */
    .card-body { padding: 14px 16px 16px; display: flex; flex-direction: column; flex: 1; }
    .card-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
    .card-crop-name { font-size: 1rem; font-weight: 800; color: #1a2e1c; line-height: 1.2; }
    .card-price { font-size: 1.35rem; font-weight: 900; color: #1a5e2a; font-family: 'JetBrains Mono', monospace; margin-bottom: 8px; }
    .price-unit { font-size: 0.78rem; font-weight: 400; color: #6b8f70; font-family: 'Outfit', sans-serif; }
    .card-meta { display: flex; flex-direction: column; gap: 4px; font-size: 0.78rem; color: #6b8f70; margin-bottom: 8px; }
    .card-meta span { display: flex; align-items: center; gap: 6px; }
    .card-meta i { color: #27a836; width: 13px; }
    .card-desc { font-size: 0.78rem; color: #6b8f70; line-height: 1.5; margin-bottom: 12px; flex: 1; }
    .card-actions { display: flex; gap: 8px; margin-top: auto; padding-top: 10px; border-top: 1px solid rgba(30,138,44,0.1); }

    /* ── Status pills ── */
    .status-pill { font-size: 0.68rem; font-weight: 700; padding: 3px 9px; border-radius: 99px; white-space: nowrap; }
    .status-available { background: #dcfce7; color: #16a34a; }
    .status-sold      { background: #f3f4f6; color: #6b7280; }
    .status-reserved  { background: #fef9c3; color: #b45309; }

    /* ── Modal ── */
    .modal-wide { max-width: 540px !important; }

    /* ── Image Upload Section ── */
    .img-upload-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 16px;
      background: #f8fdf9;
      border: 1.5px dashed rgba(30,138,44,0.25);
      border-radius: 14px;
      margin-bottom: 20px;
      cursor: pointer;
    }
    .img-preview-wrap {
      position: relative;
      width: 200px;
      height: 160px;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 2px solid rgba(30,138,44,0.15);
    }
    .img-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.25s;
    }
    .img-preview-wrap:hover .img-preview { transform: scale(1.04); }
    .img-upload-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.38);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .img-preview-wrap:hover .img-upload-overlay { opacity: 1; }
    .img-upload-overlay i { color: #fff; font-size: 1.4rem; }
    .img-upload-overlay span { color: #fff; font-size: 0.82rem; font-weight: 700; }
    .img-upload-hint { font-size: 0.76rem; color: #6b8f70; text-align: center; max-width: 300px; line-height: 1.6; }
    .img-upload-hint i { color: #4a9050; }
    .btn-remove-img {
      background: none; border: 1.5px solid #fca5a5; color: #dc2626;
      border-radius: 8px; padding: 4px 12px; font-size: 0.78rem; font-weight: 600;
      cursor: pointer; font-family: 'Outfit', sans-serif; transition: all 0.15s;
      display: flex; align-items: center; gap: 5px;
    }
    .btn-remove-img:hover { background: #fee2e2; }

    /* ── Form ── */
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media(max-width:480px) { .form-row { grid-template-columns: 1fr; } }
    .form-group { margin-bottom: 14px; }
    .form-label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 5px; }
    .label-note { font-weight: 400; color: var(--text-faint); font-size: 0.76rem; }
    .field-err { font-size: 0.76rem; color: #dc2626; margin-top: 4px; }
    .price-hint { font-size: 0.76rem; color: #16a34a; margin-top: 4px; background: #f0fdf4; padding: 5px 9px; border-radius: 7px; }
  `]
})
export class MyListingsComponent implements OnInit {
  listings: CropListing[] = [];
  loading = true;
  showModal = false;
  editId: number | null = null;
  saving = false;
  error = ''; success = '';
  categories = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Oilseeds', 'Others'];
  todayDate = new Date().toISOString().split('T')[0];
  form: any = { cropName: '', category: '', quantity: 0, unit: 'kg', pricePerUnit: 0, location: '', harvestDate: '', description: '', imageUrl: '' };

  constructor(private cropService: CropService) {}
  ngOnInit() { this.load(); }

  load() {
    this.cropService.getMyListings().subscribe({
      next: l => { this.listings = l; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openModal() {
    this.form = { cropName: '', category: '', quantity: 0, unit: 'kg', pricePerUnit: 0, location: '', harvestDate: '', description: '', imageUrl: '' };
    this.editId = null;
    this.showModal = true;
  }

  edit(l: CropListing) {
    this.form = {
      cropName: l.cropName, category: l.category, quantity: l.quantity,
      unit: l.unit, pricePerUnit: l.pricePerUnit, location: l.location,
      harvestDate: l.harvestDate, description: l.description,
      imageUrl: l.imageUrl || ''
    };
    this.editId = l.id;
    this.showModal = true;
  }

  closeModal() { this.showModal = false; }

  triggerFileInput() {
    // Programmatically click the hidden file input
    const input = document.querySelector('input[type=file]') as HTMLInputElement;
    if (input) input.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    if (file.size > 2 * 1024 * 1024) {
      this.error = 'Image too large. Max 2MB allowed.';
      setTimeout(() => this.error = '', 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.form.imageUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onImgError(event: Event, category?: string) {
    (event.target as HTMLImageElement).src = CROP_PLACEHOLDERS[category || 'default'] || CROP_PLACEHOLDERS['default'];
  }

  onFormImgError(event: Event) {
    (event.target as HTMLImageElement).src = CROP_PLACEHOLDERS[this.form.category || 'default'] || CROP_PLACEHOLDERS['default'];
  }

  placeholderFor(category?: string): string {
    return CROP_PLACEHOLDERS[category || 'default'] || CROP_PLACEHOLDERS['default'];
  }

  save() {
    if (this.form.harvestDate && this.form.harvestDate > this.todayDate) {
      this.error = 'Harvest date cannot be a future date.';
      return;
    }
    this.saving = true; this.error = '';
    const obs = this.editId
      ? this.cropService.update(this.editId, this.form)
      : this.cropService.create(this.form);
    obs.subscribe({
      next: () => {
        this.success = this.editId ? 'Listing updated!' : 'Listing created!';
        this.saving = false;
        this.closeModal();
        this.load();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => { this.error = err.error?.error || 'Failed to save'; this.saving = false; }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this listing?')) return;
    this.cropService.delete(id).subscribe({
      next: () => { this.success = 'Deleted!'; this.load(); setTimeout(() => this.success = '', 3000); }
    });
  }
}
