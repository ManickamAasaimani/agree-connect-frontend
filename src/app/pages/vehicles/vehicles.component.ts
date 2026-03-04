import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../services/services';
import { AuthService } from '../../services/auth.service';
import { Vehicle, VehicleBooking, User } from '../../models/models';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">🚜 Vehicles</h1>
        <p class="page-subtitle">Agricultural vehicle rentals — hourly or daily</p>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-outline" (click)="viewMode = viewMode === 'browse' ? 'bookings' : 'browse'">
           {{ viewMode === 'browse' ? '📋 My Bookings' : '🔍 Browse Vehicles' }}
        </button>
        <button class="btn btn-primary" *ngIf="user?.role === 'vehicle_owner'" (click)="openAddModal()">
          ➕ Add Vehicle
        </button>
      </div>
    </div>

    <div class="alert alert-success" *ngIf="success">✅ {{ success }}</div>
    <div class="alert alert-error" *ngIf="error">❌ {{ error }}</div>

    <!-- Browse Vehicles -->
    <ng-container *ngIf="viewMode === 'browse'">
      <div class="type-filters">
        <button *ngFor="let t of vehicleTypes" [class.active]="filterType === t" (click)="setType(t)" class="type-btn">{{ t }}</button>
      </div>

      <div class="vehicles-grid">
        <div *ngFor="let v of vehicles" class="vehicle-card card">
          <div class="vehicle-type-badge">{{ v.type }}</div>
          <h3 class="vehicle-name">{{ v.name }}</h3>
          <div class="vehicle-price">
            ₹{{ v.price }}<span>/day</span>
            <span class="hourly-rate" *ngIf="v.pricePerHour"> · ₹{{ v.pricePerHour }}/hr</span>
          </div>
          <div class="vehicle-details">
            <span *ngIf="v.numberPlate">🔖 {{ v.numberPlate }}</span>
            <span *ngIf="v.capacity">📦 {{ v.capacity }}</span>
            <span>📍 {{ v.location || v.ownerLocation }}</span>
            <span>👤 {{ v.ownerName }}</span>
          </div>
          <p class="vehicle-desc" *ngIf="v.description">{{ v.description | slice:0:80 }}...</p>
          <div class="vehicle-footer">
            <span class="badge badge-success" *ngIf="v.status === 'available'">✅ Available</span>
            <span class="badge badge-warning" *ngIf="v.status === 'booked'">🔒 Booked</span>
            <span class="badge badge-muted" *ngIf="v.status !== 'available' && v.status !== 'booked'">{{ v.status }}</span>
            <button class="btn btn-primary btn-sm" *ngIf="user?.role !== 'vehicle_owner' && v.status === 'available'" (click)="openBookModal(v)">
              Book Now
            </button>
            <button class="btn btn-danger btn-sm" *ngIf="user?.role === 'vehicle_owner' && v.ownerId === user?.id" (click)="deleteVehicle(v.id)">
              🗑
            </button>
          </div>
        </div>
        <div class="empty-state" *ngIf="vehicles.length === 0">
          <i class="fas fa-tractor"></i><h3>No vehicles available</h3>
        </div>
      </div>
    </ng-container>

    <!-- My Bookings -->
    <ng-container *ngIf="viewMode === 'bookings'">
      <div class="card">
        <div *ngFor="let b of bookings" class="booking-card">
          <div class="booking-header">
            <div>
              <strong>{{ b.vehicleName }}</strong> ({{ b.vehicleType }})
              <div class="booking-meta">
                📅 {{ b.hireDate | date }}
                <span *ngIf="b.bookingMode === 'hourly'">
                  · ⏰ {{ b.startHour ?? 0 }}:00 – {{ (b.startHour ?? 0) + (b.numHours ?? 0) }}:00 ({{ b.numHours ?? 0 }}h)
                </span>
                <span *ngIf="b.bookingMode !== 'hourly'">
                  · {{ b.days }} day(s)
                </span>
                · ₹{{ b.totalPrice }}
              </div>
            </div>
            <span [class]="'badge badge-' + statusColor(b.status)">{{ b.status }}</span>
          </div>
          <div class="booking-meta">
            <span *ngIf="user?.role === 'vehicle_owner'">👤 Booker: {{ b.bookerName }} {{ b.bookerPhone }}</span>
            <span *ngIf="user?.role !== 'vehicle_owner'">👤 Owner: {{ b.ownerName }} {{ b.ownerPhone }}</span>
          </div>
          <div *ngIf="b.status === 'pending' && user?.role === 'vehicle_owner'" class="booking-actions">
            <button class="btn btn-primary btn-sm" (click)="updateBooking(b.id, 'accepted')">✅ Accept</button>
            <button class="btn btn-danger btn-sm" (click)="updateBooking(b.id, 'rejected')">❌ Reject</button>
          </div>
          <div *ngIf="b.status === 'accepted' && user?.role === 'vehicle_owner'" class="booking-actions">
            <button class="btn btn-primary btn-sm" (click)="updateBooking(b.id, 'completed')">✔ Mark Completed</button>
          </div>
        </div>
        <div class="empty-state" *ngIf="bookings.length === 0">
          <i class="fas fa-calendar"></i><h3>No bookings yet</h3>
        </div>
      </div>
    </ng-container>

    <!-- Add Vehicle Modal -->
    <div class="modal-overlay" *ngIf="showAddModal" (click)="showAddModal=false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">🚜 Add Vehicle</h3>
          <button class="modal-close" (click)="showAddModal=false"><i class="fas fa-times"></i></button>
        </div>
        <form (ngSubmit)="addVehicle()">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Vehicle Name *</label>
              <input class="form-control" [(ngModel)]="addForm.name" name="name" required>
            </div>
            <div class="form-group">
              <label class="form-label">Number Plate</label>
              <input class="form-control" [(ngModel)]="addForm.numberPlate" name="numberPlate">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Type</label>
              <select class="form-control" [(ngModel)]="addForm.type" name="type">
                <option>Tractor</option><option>Mini_Truck</option><option>Heavy_Truck</option>
                <option>Harvester</option><option>Trailer</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Price/Day (₹) *</label>
              <input class="form-control" type="number" [(ngModel)]="addForm.price" name="price" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Price/Hour (₹) <span style="color:#6b8f70;font-size:0.78rem">(optional)</span></label>
              <input class="form-control" type="number" [(ngModel)]="addForm.pricePerHour" name="pricePerHour" placeholder="Leave blank to auto-calculate">
            </div>
            <div class="form-group">
              <label class="form-label">Capacity</label>
              <input class="form-control" [(ngModel)]="addForm.capacity" name="capacity" placeholder="e.g. 5 ton">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Location</label>
              <input class="form-control" [(ngModel)]="addForm.location" name="location">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-control" [(ngModel)]="addForm.description" name="description" rows="2"></textarea>
          </div>
          <div style="display:flex;gap:12px;justify-content:flex-end">
            <button type="button" class="btn btn-outline" (click)="showAddModal=false">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              <span class="spinner" *ngIf="saving"></span> Add Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Book Modal with Hour Slot Picker -->
    <div class="modal-overlay" *ngIf="selectedVehicle" (click)="selectedVehicle=null">
      <div class="modal modal-wide" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">Book: {{ selectedVehicle.name }}</h3>
          <button class="modal-close" (click)="selectedVehicle=null"><i class="fas fa-times"></i></button>
        </div>

        <!-- Booking Mode Tabs -->
        <div class="mode-tabs">
          <button class="mode-tab" [class.mode-tab-active]="bookForm.mode==='daily'" (click)="setBookMode('daily')">
            📅 Daily Booking
          </button>
          <button class="mode-tab" [class.mode-tab-active]="bookForm.mode==='hourly'" (click)="setBookMode('hourly')">
            ⏰ Hourly Booking
          </button>
        </div>

        <div class="form-group" style="margin-top:16px">
          <label class="form-label">Date *</label>
          <input class="form-control" type="date" [(ngModel)]="bookForm.hireDate" name="hireDate"
            [min]="todayStr" (change)="onDateChange()">
        </div>

        <!-- DAILY MODE -->
        <ng-container *ngIf="bookForm.mode==='daily'">
          <div class="form-group">
            <label class="form-label">Number of Days</label>
            <input class="form-control" type="number" min="1" [(ngModel)]="bookForm.days" name="days">
          </div>
          <div class="price-summary">
            💰 Total: <strong>₹{{ selectedVehicle.price * bookForm.days }}</strong>
            <span style="color:#6b8f70;font-size:0.8rem"> (₹{{ selectedVehicle.price }}/day × {{ bookForm.days }} day(s))</span>
          </div>
          <!-- Availability check for daily -->
          <div class="avail-check" *ngIf="bookForm.hireDate">
            <div *ngIf="loadingAvail" class="avail-loading">⏳ Checking availability...</div>
            <div *ngIf="!loadingAvail && availability">
              <div class="avail-blocked" *ngIf="availability.fullyBooked">
                🔒 <strong>This vehicle is fully booked on {{ bookForm.hireDate }}.</strong> Please choose a different date.
              </div>
              <div class="avail-free" *ngIf="!availability.fullyBooked">
                ✅ Available on {{ bookForm.hireDate }}
              </div>
            </div>
          </div>
        </ng-container>

        <!-- HOURLY MODE -->
        <ng-container *ngIf="bookForm.mode==='hourly'">
          <div class="slot-section">
            <div class="slot-label">
              ⏰ Select Start Hour
              <span class="slot-legend">
                <span class="slot-dot slot-free"></span>Free
                <span class="slot-dot slot-taken"></span>Booked
                <span class="slot-dot slot-selected"></span>Selected
              </span>
            </div>
            <div *ngIf="loadingAvail" class="avail-loading">⏳ Loading availability...</div>
            <div *ngIf="availability?.fullyBooked && !loadingAvail" class="avail-blocked">
              🔒 <strong>Fully booked on {{ bookForm.hireDate }}.</strong> Choose a different date.
            </div>
            <div class="hour-grid" *ngIf="!loadingAvail && availability && !availability.fullyBooked">
              <button *ngFor="let h of hours"
                class="hour-slot"
                [class.hour-taken]="isHourTaken(h)"
                [class.hour-selected]="isHourInRange(h)"
                [class.hour-start]="h === bookForm.startHour"
                [disabled]="isHourTaken(h)"
                (click)="selectStartHour(h)">
                {{ h }}:00
              </button>
            </div>
            <div class="form-group" style="margin-top:12px">
              <label class="form-label">Number of Hours</label>
              <div style="display:flex;align-items:center;gap:10px">
                <input class="form-control" type="number" min="1" max="12" [(ngModel)]="bookForm.numHours" name="numHours" style="max-width:100px" (ngModelChange)="checkHourConflict()">
                <span style="font-size:0.82rem;color:#6b8f70">{{ bookForm.startHour !== null ? bookForm.startHour + ':00' : '?' }} → {{ bookForm.startHour !== null ? (bookForm.startHour + bookForm.numHours) + ':00' : '?' }}</span>
              </div>
            </div>
            <div class="avail-blocked" *ngIf="hourConflict">
              ⚠️ {{ hourConflict }}
            </div>
            <div class="price-summary" *ngIf="bookForm.startHour !== null">
              💰 Total: <strong>₹{{ calcHourlyPrice() }}</strong>
              <span style="color:#6b8f70;font-size:0.8rem">
                (₹{{ effectiveHourlyRate() }}/hr × {{ bookForm.numHours }} hr)
              </span>
            </div>
          </div>
        </ng-container>

        <div class="form-group" style="margin-top:16px">
          <label class="form-label">Message (optional)</label>
          <textarea class="form-control" [(ngModel)]="bookForm.message" rows="2"></textarea>
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button class="btn btn-outline" (click)="selectedVehicle=null">Cancel</button>
          <button class="btn btn-primary" (click)="bookVehicle()" [disabled]="saving || (availability?.fullyBooked) || !!hourConflict">
            <span class="spinner" *ngIf="saving"></span>
            {{ saving ? 'Booking…' : 'Confirm Booking' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .type-filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    .type-btn { padding: 8px 16px; border-radius: 20px; border: 1.5px solid rgba(30,138,44,0.2); background: #fff; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: #6b8f70; transition: all 0.2s; }
    .type-btn:hover { border-color: #27a836; color: #1e8a2c; background: #f0faf2; }
    .type-btn.active { background: #27a836; border-color: #27a836; color: #fff; }
    .vehicles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .vehicle-card { position: relative; display: flex; flex-direction: column; gap: 8px; background: #fff; border: 1px solid rgba(30,138,44,0.12); border-radius: 14px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); transition: all 0.2s; }
    .vehicle-card:hover { border-color: rgba(30,138,44,0.3); box-shadow: 0 4px 16px rgba(30,138,44,0.1); transform: translateY(-2px); }
    .vehicle-type-badge { display: inline-flex; align-items: center; padding: 3px 10px; background: #fef3c7; color: #d97706; font-size: 0.72rem; font-weight: 700; border-radius: 20px; margin-bottom: 8px; width: fit-content; }
    .vehicle-name { font-size: 1.05rem; font-weight: 700; color: #1a2e1c; }
    .vehicle-price { font-size: 1.3rem; font-weight: 800; color: #1a5e2a; display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
    .vehicle-price span { font-size: 0.8rem; font-weight: 400; color: #6b8f70; }
    .hourly-rate { font-size: 0.78rem !important; color: #4a9050 !important; font-weight: 600 !important; background: #f0faf2; padding: 2px 7px; border-radius: 8px; border: 1px solid #c8e6c9; }
    .vehicle-details { display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; color: #6b8f70; }
    .vehicle-desc { font-size: 0.8rem; color: #6b8f70; line-height: 1.5; }
    .vehicle-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 12px; border-top: 1px solid rgba(30,138,44,0.1); }
    .booking-card { border: 1px solid rgba(30,138,44,0.12); border-radius: 12px; padding: 16px; margin-bottom: 12px; background: #fff; }
    .booking-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .booking-meta { font-size: 0.82rem; color: #6b8f70; margin-bottom: 8px; }
    .booking-actions { display: flex; gap: 8px; }

    /* Mode tabs */
    .mode-tabs { display: flex; gap: 0; border: 1.5px solid rgba(30,138,44,0.2); border-radius: 10px; overflow: hidden; }
    .mode-tab { flex: 1; padding: 10px; border: none; background: #fff; cursor: pointer; font-family: 'Outfit',sans-serif; font-size: 0.84rem; font-weight: 600; color: #6b8f70; transition: all 0.18s; }
    .mode-tab:first-child { border-right: 1.5px solid rgba(30,138,44,0.2); }
    .mode-tab-active { background: #f0faf2; color: #1a5e2a; }
    .mode-tab:hover { background: #f5fbf5; }

    /* Availability */
    .avail-check { margin: 8px 0 14px; }
    .avail-loading { font-size: 0.82rem; color: #6b8f70; padding: 8px 0; }
    .avail-blocked { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; margin: 8px 0; }
    .avail-free { background: #dcfce7; color: #16a34a; border: 1px solid #86efac; padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; margin: 8px 0; }

    /* Hour slot picker */
    .slot-section { background: #f8fdf9; border: 1px solid rgba(30,138,44,0.15); border-radius: 12px; padding: 16px; }
    .slot-label { font-size: 0.85rem; font-weight: 700; color: #1a5e2a; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
    .slot-legend { display: flex; align-items: center; gap: 12px; font-size: 0.75rem; font-weight: 500; color: #6b8f70; }
    .slot-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 4px; }
    .slot-free { background: #dcfce7; border: 1.5px solid #86efac; }
    .slot-taken { background: #fee2e2; border: 1.5px solid #fca5a5; }
    .slot-selected { background: #4a9050; border: 1.5px solid #357540; }
    .hour-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 7px; }
    @media(max-width:480px) { .hour-grid { grid-template-columns: repeat(4, 1fr); } }
    .hour-slot {
      padding: 8px 4px; border-radius: 8px; border: 1.5px solid rgba(30,138,44,0.2);
      background: #fff; color: #1a5e2a; font-size: 0.76rem; font-weight: 700;
      cursor: pointer; transition: all 0.15s; text-align: center;
      font-family: 'JetBrains Mono', monospace;
    }
    .hour-slot:hover:not(:disabled) { background: #f0faf2; border-color: #4a9050; transform: scale(1.05); }
    .hour-taken { background: #fee2e2 !important; border-color: #fca5a5 !important; color: #dc2626 !important; cursor: not-allowed !important; opacity: 0.7; }
    .hour-selected { background: #dcfce7 !important; border-color: #4a9050 !important; }
    .hour-start { background: #4a9050 !important; border-color: #357540 !important; color: #fff !important; }

    /* Price summary */
    .price-summary { background: #f0faf2; border: 1px solid rgba(30,138,44,0.2); border-radius: 10px; padding: 10px 14px; font-size: 0.88rem; color: #1a5e2a; margin: 8px 0 16px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .price-summary strong { font-size: 1.15rem; font-family: 'JetBrains Mono', monospace; }

    /* Modal */
    .modal-wide { max-width: 560px !important; }
  `]
})
export class VehiclesComponent implements OnInit {
  vehicles: Vehicle[] = [];
  bookings: VehicleBooking[] = [];
  viewMode = 'browse';
  filterType = 'All';
  vehicleTypes = ['All', 'Tractor', 'Mini_Truck', 'Heavy_Truck', 'Harvester', 'Trailer'];
  user: User | null = null;
  success = ''; error = ''; saving = false;
  showAddModal = false;
  selectedVehicle: Vehicle | null = null;
  loadingAvail = false;
  availability: any = null;
  hourConflict = '';
  hours = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
  todayStr = new Date().toISOString().split('T')[0];

  addForm: any = { name: '', numberPlate: '', type: 'Tractor', price: 0, pricePerHour: null, capacity: '', location: '', description: '' };
  bookForm: any = { hireDate: this.todayStr, days: 1, mode: 'daily', startHour: null, numHours: 2, message: '' };

  constructor(
    private vehicleService: VehicleService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUser;
    this.loadVehicles();
    this.loadBookings();
  }

  loadVehicles() { this.vehicleService.getAll(this.filterType !== 'All' ? this.filterType : undefined).subscribe(v => this.vehicles = v); }
  loadBookings() { this.vehicleService.getBookings().subscribe(b => this.bookings = b); }
  setType(t: string) { this.filterType = t; this.loadVehicles(); }

  openAddModal() {
    this.addForm = { name: '', numberPlate: '', type: 'Tractor', price: 0, pricePerHour: null, capacity: '', location: '', description: '' };
    this.showAddModal = true;
  }

  openBookModal(v: Vehicle) {
    this.selectedVehicle = v;
    this.bookForm = { hireDate: this.todayStr, days: 1, mode: 'daily', startHour: null, numHours: 2, message: '' };
    this.availability = null;
    this.hourConflict = '';
    this.loadAvailability();
  }

  setBookMode(mode: string) {
    this.bookForm.mode = mode;
    this.bookForm.startHour = null;
    this.hourConflict = '';
    this.loadAvailability();
  }

  onDateChange() {
    this.availability = null;
    this.bookForm.startHour = null;
    this.hourConflict = '';
    this.loadAvailability();
  }

  loadAvailability() {
    if (!this.selectedVehicle || !this.bookForm.hireDate) return;
    this.loadingAvail = true;
    this.http.get<any>(`${environment.apiUrl}/vehicles/${this.selectedVehicle.id}/availability?date=${this.bookForm.hireDate}`)
      .subscribe({
        next: (res) => { this.availability = res; this.loadingAvail = false; },
        error: () => { this.loadingAvail = false; }
      });
  }

  selectStartHour(h: number) {
    if (this.isHourTaken(h)) return;
    this.bookForm.startHour = h;
    this.checkHourConflict();
  }

  isHourTaken(h: number): boolean {
    return this.availability?.bookedHours?.includes(h) ?? false;
  }

  isHourInRange(h: number): boolean {
    if (this.bookForm.startHour === null) return false;
    return h > this.bookForm.startHour && h < this.bookForm.startHour + this.bookForm.numHours;
  }

  checkHourConflict() {
    this.hourConflict = '';
    if (this.bookForm.startHour === null || !this.availability) return;
    for (let h = this.bookForm.startHour; h < this.bookForm.startHour + this.bookForm.numHours; h++) {
      if (this.isHourTaken(h)) {
        this.hourConflict = `Hour ${h}:00 is already booked. Please adjust your selection.`;
        return;
      }
    }
  }

  effectiveHourlyRate(): number {
    if (!this.selectedVehicle) return 0;
    if (this.selectedVehicle.pricePerHour) return +this.selectedVehicle.pricePerHour;
    return +(+this.selectedVehicle.price / 8).toFixed(0);
  }

  calcHourlyPrice(): number {
    return this.effectiveHourlyRate() * this.bookForm.numHours;
  }

  addVehicle() {
    this.saving = true;
    this.vehicleService.create(this.addForm).subscribe({
      next: () => { this.success = 'Vehicle added!'; this.saving = false; this.showAddModal = false; this.loadVehicles(); setTimeout(() => this.success = '', 3000); },
      error: (err) => { this.error = err.error?.error || 'Failed'; this.saving = false; }
    });
  }

  bookVehicle() {
    if (!this.selectedVehicle || !this.bookForm.hireDate) return;
    if (this.bookForm.mode === 'hourly' && this.bookForm.startHour === null) {
      this.error = 'Please select a start hour'; return;
    }
    this.saving = true; this.error = '';
    const payload: any = {
      vehicleId: this.selectedVehicle.id,
      hireDate: this.bookForm.hireDate,
      bookingMode: this.bookForm.mode,
      message: this.bookForm.message
    };
    if (this.bookForm.mode === 'daily') {
      payload.days = this.bookForm.days;
    } else {
      payload.startHour = this.bookForm.startHour;
      payload.numHours = this.bookForm.numHours;
    }
    this.vehicleService.book(payload).subscribe({
      next: () => { this.success = 'Booking sent!'; this.saving = false; this.selectedVehicle = null; this.loadVehicles(); this.loadBookings(); setTimeout(() => this.success = '', 3000); },
      error: (err) => { this.error = err.error?.error || 'Failed to book'; this.saving = false; }
    });
  }

  updateBooking(id: number, status: string) {
    this.vehicleService.updateBooking(id, status).subscribe(() => { this.success = `Booking ${status}!`; this.loadBookings(); this.loadVehicles(); setTimeout(() => this.success = '', 3000); });
  }

  deleteVehicle(id: number) {
    if (!confirm('Delete vehicle?')) return;
    this.vehicleService.delete(id).subscribe(() => { this.success = 'Deleted!'; this.loadVehicles(); setTimeout(() => this.success = '', 3000); });
  }

  statusColor(s: string): string { const m: any = { pending: 'warning', accepted: 'info', rejected: 'danger', completed: 'success' }; return m[s] || 'muted'; }
}
