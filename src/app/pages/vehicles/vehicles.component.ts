import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../services/services';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/models';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `

    <!-- ===== HEADER ===== -->
    <div class="page-header">
      <div>
        <h1 class="page-title">&#x1F69C; Vehicles</h1>
        <p class="page-subtitle">Book agricultural vehicles instantly</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <div class="live-dot-wrap"><span class="live-dot"></span> Live</div>
        <button class="btn btn-outline" (click)="switchView(viewMode==='browse'?'bookings':'browse')">
          {{ viewMode==='browse' ? '&#x1F4CB; My Bookings' : '&#x1F50D; Browse' }}
        </button>
        <button class="btn btn-primary" *ngIf="user?.role==='vehicle_owner'" (click)="openAddModal()">
          &#x2795; Add Vehicle
        </button>
      </div>
    </div>

    <div class="alert alert-success" *ngIf="success">&#x2705; {{ success }}</div>
    <div class="alert alert-error"   *ngIf="error">&#x274C; {{ error }}</div>

    <!-- ===== BROWSE ===== -->
    <ng-container *ngIf="viewMode==='browse'">
      <div class="type-filters">
        <button *ngFor="let t of vehicleTypes"
                [class.active]="filterType===t"
                (click)="setType(t)" class="type-btn">{{ t }}</button>
      </div>

      <div class="vehicles-grid">
        <div *ngFor="let v of vehicles" class="vehicle-card"
             [class.card-available]="v.status==='available'"
             [class.card-booked]="v.status!=='available'"
             (click)="user?.role!=='vehicle_owner' && v.status==='available' ? openBookFlow(v) : null"
             [class.card-clickable]="user?.role!=='vehicle_owner' && v.status==='available'">

          <div class="vc-top">
            <div class="vc-type-badge">{{ v.type }}</div>
            <div class="vc-status-wrap">
              <span class="vc-live-dot" [class.dot-green]="v.status==='available'" [class.dot-red]="v.status!=='available'"></span>
              <span class="vc-status-txt" [class.txt-green]="v.status==='available'" [class.txt-red]="v.status!=='available'">
                {{ v.status==='available' ? 'Available' : 'Booked' }}
              </span>
            </div>
          </div>

          <div class="vc-name">{{ v.name }}</div>
          <div class="vc-plate">{{ v.numberPlate }}</div>

          <div class="vc-price-row">
            <div class="vc-price-day">&#x20B9;{{ v.price }}<span>/day</span></div>
            <div class="vc-price-hr" *ngIf="v.pricePerHour">&#x20B9;{{ v.pricePerHour }}/hr</div>
          </div>

          <div class="vc-meta">
            <div><i class="fas fa-box"></i> {{ v.capacity }}</div>
            <div><i class="fas fa-map-pin"></i> {{ v.location || v.ownerLocation }}</div>
            <div><i class="fas fa-user"></i> {{ v.ownerName }}</div>
          </div>

          <p class="vc-desc" *ngIf="v.description">{{ v.description | slice:0:65 }}...</p>

          <div class="vc-footer">
            <button class="btn-book" *ngIf="user?.role!=='vehicle_owner' && v.status==='available'"
                    (click)="$event.stopPropagation(); openBookFlow(v)">
              <i class="fas fa-bolt"></i> Book Now
            </button>
            <button class="btn btn-outline btn-sm" *ngIf="user?.role==='vehicle_owner' && v.ownerId===user?.id"
                    (click)="$event.stopPropagation(); deleteVehicle(v.id)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="empty-state" *ngIf="vehicles.length===0">
          <i class="fas fa-tractor"></i><h3>No vehicles available</h3>
        </div>
      </div>
    </ng-container>

    <!-- ===== MY BOOKINGS with live status tracker ===== -->
    <ng-container *ngIf="viewMode==='bookings'">
      <div class="bookings-list">
        <div *ngFor="let b of bookings" class="bk-card">

          <!-- Booking header -->
          <div class="bk-header">
            <div class="bk-vehicle-info">
              <span class="bk-vehicle-icon">&#x1F69C;</span>
              <div>
                <div class="bk-name">{{ b.vehicleName }}</div>
                <div class="bk-type-tag">{{ b.vehicleType }}</div>
              </div>
            </div>
            <div class="bk-badge-wrap">
              <span class="bk-badge" [class]="'bk-'+statusColor(b.status)">
                <span class="bk-badge-dot"></span>{{ b.status | titlecase }}
              </span>
            </div>
          </div>

          <!-- Live status tracker bar -->
          <div class="tracker">
            <div class="tracker-step" [class.done]="isStepDone(b,'pending')" [class.active]="b.status==='pending'">
              <div class="tr-dot"><i class="fas fa-clock"></i></div>
              <div class="tr-label">Requested</div>
            </div>
            <div class="tracker-line" [class.done]="isStepDone(b,'accepted')"></div>
            <div class="tracker-step" [class.done]="isStepDone(b,'accepted')" [class.active]="b.status==='accepted'">
              <div class="tr-dot"><i class="fas fa-check"></i></div>
              <div class="tr-label">Accepted</div>
            </div>
            <div class="tracker-line" [class.done]="isStepDone(b,'completed')"></div>
            <div class="tracker-step" [class.done]="b.status==='completed'" [class.active]="b.status==='completed'">
              <div class="tr-dot"><i class="fas fa-flag-checkered"></i></div>
              <div class="tr-label">Completed</div>
            </div>
          </div>

          <!-- Booking details -->
          <div class="bk-details">
            <div class="bk-detail-item"><i class="fas fa-calendar"></i> {{ b.hireDate | date:'dd MMM yyyy' }}</div>
            <div class="bk-detail-item" *ngIf="b.bookingMode==='hourly'">
              <i class="fas fa-clock"></i> {{ b.startHour }}:00 - {{ (b.startHour||0)+(b.numHours||0) }}:00
            </div>
            <div class="bk-detail-item" *ngIf="b.bookingMode!=='hourly'">
              <i class="fas fa-sun"></i> {{ b.days }} day(s)
            </div>
            <div class="bk-detail-item bk-price"><i class="fas fa-indian-rupee-sign"></i> {{ b.totalPrice }}</div>
          </div>

          <!-- Contact -->
          <div class="bk-contact" *ngIf="user?.role==='vehicle_owner'">
            <i class="fas fa-user"></i> {{ b.bookerName }}
            <span *ngIf="b.bookerPhone"> &bull; <i class="fas fa-phone"></i> {{ b.bookerPhone }}</span>
          </div>
          <div class="bk-contact" *ngIf="user?.role!=='vehicle_owner'">
            <i class="fas fa-user-tie"></i> {{ b.ownerName }}
            <span *ngIf="b.ownerPhone"> &bull; <i class="fas fa-phone"></i> {{ b.ownerPhone }}</span>
          </div>

          <!-- Owner actions -->
          <div class="bk-actions" *ngIf="b.status==='pending' && user?.role==='vehicle_owner'">
            <button class="bk-accept-btn" (click)="updateBooking(b.id,'accepted')">
              <i class="fas fa-check"></i> Accept Booking
            </button>
            <button class="bk-reject-btn" (click)="updateBooking(b.id,'rejected')">
              <i class="fas fa-times"></i> Reject
            </button>
          </div>
          <div class="bk-actions" *ngIf="b.status==='accepted' && user?.role==='vehicle_owner'">
            <button class="bk-complete-btn" (click)="updateBooking(b.id,'completed')">
              <i class="fas fa-flag-checkered"></i> Mark Completed
            </button>
          </div>

          <!-- Rejected/cancelled state -->
          <div class="bk-rejected" *ngIf="b.status==='rejected'">
            <i class="fas fa-times-circle"></i> This booking was rejected by the owner.
          </div>
        </div>

        <div class="empty-state" *ngIf="bookings.length===0">
          <i class="fas fa-calendar"></i><h3>No bookings yet</h3>
          <p>Browse vehicles and make your first booking</p>
        </div>
      </div>
    </ng-container>

    <!-- ===== ADD VEHICLE MODAL ===== -->
    <div class="modal-overlay" *ngIf="showAddModal" (click)="showAddModal=false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">&#x1F69C; Add Vehicle</h3>
          <button class="modal-close" (click)="showAddModal=false"><i class="fas fa-times"></i></button>
        </div>
        <form (ngSubmit)="addVehicle()">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Vehicle Name *</label>
              <input class="form-control" [(ngModel)]="addForm.name" name="name" placeholder="e.g. John Deere Tractor">
            </div>
            <div class="form-group">
              <label class="form-label">Number Plate *</label>
              <input class="form-control" [(ngModel)]="addForm.numberPlate" name="plate" placeholder="TN 01 AB 1234">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Type *</label>
              <select class="form-control" [(ngModel)]="addForm.type" name="type">
                <option>Tractor</option><option>Mini_Truck</option><option>Heavy_Truck</option>
                <option>Harvester</option><option>Trailer</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Price / Day (&#x20B9;) *</label>
              <input class="form-control" type="number" [(ngModel)]="addForm.price" name="price">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Price / Hour (&#x20B9;) <span class="opt">optional</span></label>
              <input class="form-control" type="number" [(ngModel)]="addForm.pricePerHour" name="pph" placeholder="Auto if blank">
            </div>
            <div class="form-group">
              <label class="form-label">Capacity *</label>
              <input class="form-control" [(ngModel)]="addForm.capacity" name="cap" placeholder="e.g. 5 ton">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Location *</label>
            <input class="form-control" [(ngModel)]="addForm.location" name="loc" placeholder="City, State">
          </div>
          <div class="form-group">
            <label class="form-label">Description <span class="opt">optional</span></label>
            <textarea class="form-control" [(ngModel)]="addForm.description" name="desc" rows="2"></textarea>
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

    <!-- ===== RAPIDO BOOKING FLOW ===== -->
    <div class="rp-overlay" *ngIf="bookStep>0" (click)="closeBook()">
      <div class="rp-sheet" (click)="$event.stopPropagation()">

        <!-- Progress pills -->
        <div class="rp-pills">
          <div class="rp-pill" [class.rp-pill-done]="bookStep>=1" [class.rp-pill-active]="bookStep===1">
            <span>1</span> Vehicle
          </div>
          <div class="rp-pill-line" [class.rp-pill-line-done]="bookStep>=2"></div>
          <div class="rp-pill" [class.rp-pill-done]="bookStep>=2" [class.rp-pill-active]="bookStep===2">
            <span>2</span> Date &amp; Time
          </div>
          <div class="rp-pill-line" [class.rp-pill-line-done]="bookStep>=3"></div>
          <div class="rp-pill" [class.rp-pill-done]="bookStep>=3" [class.rp-pill-active]="bookStep===3">
            <span>3</span> Confirm
          </div>
        </div>

        <!-- STEP 1: Choose type (daily/hourly) -->
        <div *ngIf="bookStep===1" class="rp-body">
          <div class="rp-header">
            <button class="rp-back" (click)="closeBook()"><i class="fas fa-times"></i></button>
            <div class="rp-header-info">
              <div class="rp-title">Choose Booking Type</div>
              <div class="rp-sub">{{ selectedVehicle?.name }}</div>
            </div>
          </div>

          <!-- Vehicle info card -->
          <div class="rp-vehicle-card">
            <div class="rp-vc-avatar">&#x1F69C;</div>
            <div class="rp-vc-body">
              <div class="rp-vc-name">{{ selectedVehicle?.name }}</div>
              <div class="rp-vc-meta">{{ selectedVehicle?.type }} &bull; {{ selectedVehicle?.capacity }} &bull; <i class="fas fa-map-pin"></i> {{ selectedVehicle?.location }}</div>
              <div class="rp-vc-owner"><i class="fas fa-user-circle"></i> {{ selectedVehicle?.ownerName }}</div>
            </div>
            <div class="rp-vc-status"><span class="vc-live-dot dot-green"></span> Available</div>
          </div>

          <!-- Type cards -->
          <div class="rp-type-grid">
            <div class="rp-type-card" [class.selected]="bookForm.mode==='daily'" (click)="bookForm.mode='daily'">
              <div class="rtc-icon">&#x1F4C5;</div>
              <div class="rtc-name">Daily Booking</div>
              <div class="rtc-price">&#x20B9;{{ selectedVehicle?.price }}<span>/day</span></div>
              <div class="rtc-desc">Hire for full day(s)</div>
              <div class="rtc-check" *ngIf="bookForm.mode==='daily'"><i class="fas fa-check-circle"></i></div>
            </div>
            <div class="rp-type-card" [class.selected]="bookForm.mode==='hourly'" (click)="bookForm.mode='hourly'">
              <div class="rtc-icon">&#x23F0;</div>
              <div class="rtc-name">Hourly Booking</div>
              <div class="rtc-price">&#x20B9;{{ effectiveHourlyRate() }}<span>/hr</span></div>
              <div class="rtc-desc">Hire for a few hours</div>
              <div class="rtc-check" *ngIf="bookForm.mode==='hourly'"><i class="fas fa-check-circle"></i></div>
            </div>
          </div>

          <button class="rp-next" (click)="goStep(2)">
            Continue <i class="fas fa-arrow-right"></i>
          </button>
        </div>

        <!-- STEP 2: Date & Time -->
        <div *ngIf="bookStep===2" class="rp-body">
          <div class="rp-header">
            <button class="rp-back" (click)="goStep(1)"><i class="fas fa-arrow-left"></i></button>
            <div class="rp-header-info">
              <div class="rp-title">{{ bookForm.mode==='daily' ? 'Select Date & Days' : 'Select Date & Time Slot' }}</div>
              <div class="rp-sub">{{ bookForm.mode | titlecase }} &bull; {{ selectedVehicle?.name }}</div>
            </div>
          </div>

          <!-- Date -->
          <div class="rp-field">
            <label><i class="fas fa-calendar-alt"></i> Date *</label>
            <input class="form-control" type="date" [(ngModel)]="bookForm.hireDate" [min]="todayStr" (change)="onDateChange()">
          </div>

          <!-- DAILY: days counter + avail -->
          <ng-container *ngIf="bookForm.mode==='daily'">
            <div class="rp-counter-row">
              <div class="rp-counter-label"><i class="fas fa-sun"></i> Number of Days</div>
              <div class="rp-counter">
                <button class="rc-btn" (click)="adjDays(-1)">-</button>
                <span class="rc-val">{{ bookForm.days }}</span>
                <button class="rc-btn" (click)="adjDays(1)">+</button>
              </div>
            </div>
            <!-- Live availability status -->
            <div class="avail-row" *ngIf="bookForm.hireDate">
              <div class="avail-checking" *ngIf="loadingAvail">
                <i class="fas fa-circle-notch fa-spin"></i> Checking live availability...
              </div>
              <div class="avail-ok" *ngIf="!loadingAvail && availability && !availability.fullyBooked">
                <i class="fas fa-check-circle"></i> Available on {{ bookForm.hireDate | date:'EEE, dd MMM yyyy' }}
              </div>
              <div class="avail-no" *ngIf="!loadingAvail && availability?.fullyBooked">
                <i class="fas fa-lock"></i> Fully booked on this date &mdash; pick another
              </div>
            </div>
          </ng-container>

          <!-- HOURLY: live slot picker -->
          <ng-container *ngIf="bookForm.mode==='hourly'">
            <div class="slot-panel">
              <div class="slot-panel-header">
                <span><i class="fas fa-clock"></i> Tap a start hour</span>
                <div class="slot-legend-row">
                  <span class="sl sl-free"></span>Free
                  <span class="sl sl-taken"></span>Booked
                  <span class="sl sl-sel"></span>Selected
                </div>
              </div>

              <!-- Live pulse when checking -->
              <div class="slot-live-bar" *ngIf="!loadingAvail">
                <span class="live-dot"></span> Live slots &mdash; updates every 10s
              </div>
              <div class="slot-loading" *ngIf="loadingAvail">
                <i class="fas fa-circle-notch fa-spin"></i> Loading live slots...
              </div>

              <div class="hour-grid" *ngIf="!loadingAvail && availability && !availability.fullyBooked">
                <button *ngFor="let h of hours"
                        class="hs"
                        [class.hs-free]="!isHourTaken(h) && h!==bookForm.startHour && !isHourInRange(h)"
                        [class.hs-taken]="isHourTaken(h)"
                        [class.hs-range]="isHourInRange(h)"
                        [class.hs-start]="h===bookForm.startHour"
                        [disabled]="isHourTaken(h)"
                        (click)="selectStartHour(h)">
                  {{ h }}:00
                </button>
              </div>

              <div class="avail-no" *ngIf="!loadingAvail && availability?.fullyBooked">
                <i class="fas fa-lock"></i> Fully booked on this date
              </div>

              <!-- Hours counter -->
              <div class="rp-counter-row" style="margin-top:14px" *ngIf="bookForm.startHour!==null">
                <div class="rp-counter-label"><i class="fas fa-hourglass-half"></i> Hours</div>
                <div class="rp-counter">
                  <button class="rc-btn" (click)="adjHours(-1)">-</button>
                  <span class="rc-val">{{ bookForm.numHours }}</span>
                  <button class="rc-btn" (click)="adjHours(1)">+</button>
                </div>
              </div>

              <!-- Time range display -->
              <div class="time-range" *ngIf="bookForm.startHour!==null">
                <i class="fas fa-clock"></i>
                <span class="tr-from">{{ bookForm.startHour }}:00</span>
                <span class="tr-arrow">&#x2192;</span>
                <span class="tr-to">{{ bookForm.startHour+bookForm.numHours }}:00</span>
                <span class="tr-dur">({{ bookForm.numHours }} hr)</span>
              </div>

              <div class="avail-no" *ngIf="hourConflict">
                <i class="fas fa-exclamation-triangle"></i> {{ hourConflict }}
              </div>
            </div>
          </ng-container>

          <!-- Live price preview -->
          <div class="rp-price-preview" *ngIf="livePrice()>0">
            <div class="rpp-left">
              <div class="rpp-label">Estimated Total</div>
              <div class="rpp-note">{{ bookForm.mode==='daily' ? bookForm.days+' day(s) x ₹'+selectedVehicle?.price : bookForm.numHours+' hr(s) x ₹'+effectiveHourlyRate() }}</div>
            </div>
            <div class="rpp-price">&#x20B9;{{ livePrice() }}</div>
          </div>

          <div class="rp-field">
            <label><i class="fas fa-comment-alt"></i> Message to owner <span class="opt">optional</span></label>
            <textarea class="form-control" [(ngModel)]="bookForm.message" rows="2" placeholder="Any special requirement?"></textarea>
          </div>

          <button class="rp-next" (click)="goStep(3)"
                  [disabled]="availability?.fullyBooked || !!hourConflict || (bookForm.mode==='hourly' && bookForm.startHour===null)">
            Review Booking <i class="fas fa-arrow-right"></i>
          </button>
        </div>

        <!-- STEP 3: Confirm -->
        <div *ngIf="bookStep===3" class="rp-body">
          <div class="rp-header">
            <button class="rp-back" (click)="goStep(2)"><i class="fas fa-arrow-left"></i></button>
            <div class="rp-header-info">
              <div class="rp-title">Confirm Booking</div>
              <div class="rp-sub">Review before confirming</div>
            </div>
          </div>

          <div class="rp-confirm-card">
            <!-- Vehicle row -->
            <div class="rcc-vehicle">
              <div class="rcc-icon">&#x1F69C;</div>
              <div>
                <div class="rcc-name">{{ selectedVehicle?.name }}</div>
                <div class="rcc-meta">{{ selectedVehicle?.type }} &bull; {{ selectedVehicle?.capacity }}</div>
                <div class="rcc-owner"><i class="fas fa-user"></i> {{ selectedVehicle?.ownerName }}</div>
              </div>
            </div>
            <div class="rcc-divider"></div>

            <!-- Booking details -->
            <div class="rcc-row"><span><i class="fas fa-calendar"></i> Date</span><span>{{ bookForm.hireDate | date:'EEE, dd MMM yyyy' }}</span></div>
            <div class="rcc-row" *ngIf="bookForm.mode==='daily'">
              <span><i class="fas fa-sun"></i> Duration</span><span>{{ bookForm.days }} day(s)</span>
            </div>
            <div class="rcc-row" *ngIf="bookForm.mode==='hourly'">
              <span><i class="fas fa-clock"></i> Time Slot</span><span>{{ bookForm.startHour }}:00 &rarr; {{ bookForm.startHour+bookForm.numHours }}:00</span>
            </div>
            <div class="rcc-row" *ngIf="bookForm.mode==='hourly'">
              <span><i class="fas fa-hourglass"></i> Duration</span><span>{{ bookForm.numHours }} hour(s)</span>
            </div>

            <div class="rcc-divider"></div>

            <!-- Price breakdown -->
            <div class="rcc-row rcc-price-row">
              <span>{{ bookForm.mode==='daily' ? 'Daily Rate' : 'Hourly Rate' }}</span>
              <span>&#x20B9;{{ bookForm.mode==='daily' ? selectedVehicle?.price : effectiveHourlyRate() }}
                &times; {{ bookForm.mode==='daily' ? bookForm.days+' day(s)' : bookForm.numHours+' hr(s)' }}</span>
            </div>
            <div class="rcc-row rcc-total-row">
              <span><strong>Total Amount</strong></span>
              <span class="rcc-total">&#x20B9;{{ livePrice() }}</span>
            </div>
          </div>

          <div class="rp-info-note">
            <i class="fas fa-info-circle"></i>
            Request sent to owner. You get a notification when they accept or reject.
          </div>

          <button class="rp-confirm-btn" (click)="bookVehicle()" [disabled]="saving">
            <span class="spinner" *ngIf="saving"></span>
            <i class="fas fa-bolt" *ngIf="!saving"></i>
            {{ saving ? 'Sending Request...' : 'Confirm &amp; Book' }}
          </button>
        </div>

        <!-- STEP 4: SUCCESS -->
        <div *ngIf="bookStep===4" class="rp-body rp-success">
          <div class="rp-success-ring">
            <div class="rp-success-icon"><i class="fas fa-check"></i></div>
          </div>
          <div class="rp-success-title">Booking Requested!</div>
          <div class="rp-success-sub">
            Your request has been sent to <strong>{{ selectedVehicle?.ownerName }}</strong>.
            You will be notified once they respond.
          </div>

          <!-- Mini tracker in success screen -->
          <div class="tracker" style="margin:20px 0">
            <div class="tracker-step done active">
              <div class="tr-dot"><i class="fas fa-check"></i></div>
              <div class="tr-label">Requested</div>
            </div>
            <div class="tracker-line"></div>
            <div class="tracker-step">
              <div class="tr-dot"><i class="fas fa-clock"></i></div>
              <div class="tr-label">Awaiting</div>
            </div>
            <div class="tracker-line"></div>
            <div class="tracker-step">
              <div class="tr-dot"><i class="fas fa-flag-checkered"></i></div>
              <div class="tr-label">Complete</div>
            </div>
          </div>

          <div class="rp-success-detail">
            <div class="rcc-row"><span>Vehicle</span><span>{{ selectedVehicle?.name }}</span></div>
            <div class="rcc-row"><span>Date</span><span>{{ bookForm.hireDate | date:'dd MMM yyyy' }}</span></div>
            <div class="rcc-row"><span>Amount</span><span class="rcc-total">&#x20B9;{{ livePrice() }}</span></div>
          </div>

          <div style="display:flex;gap:10px;margin-top:16px">
            <button class="rp-track-btn" (click)="closeBook(); switchView('bookings')">
              <i class="fas fa-list"></i> Track Booking
            </button>
            <button class="btn btn-outline" style="flex:1" (click)="closeBook()">Done</button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Live indicator */
    .live-dot-wrap { display:flex; align-items:center; gap:6px; font-size:0.78rem; font-weight:600; color:#16a34a; }
    .live-dot { width:8px; height:8px; border-radius:50%; background:#16a34a; animation:livePulse 1.5s infinite; }
    @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }

    /* Type filters */
    .type-filters { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
    .type-btn { padding:7px 16px; border-radius:20px; border:1.5px solid rgba(30,138,44,0.2); background:#fff; cursor:pointer; font-size:0.8rem; font-weight:600; color:#6b8f70; transition:all 0.2s; }
    .type-btn.active,.type-btn:hover { background:#27a836; border-color:#27a836; color:#fff; }

    /* Vehicle cards */
    .vehicles-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }
    .vehicle-card { background:#fff; border:2px solid rgba(30,138,44,0.1); border-radius:16px; padding:18px; display:flex; flex-direction:column; gap:10px; transition:all 0.2s; }
    .card-clickable { cursor:pointer; }
    .card-clickable:hover { border-color:#27a836; box-shadow:0 6px 24px rgba(30,138,44,0.15); transform:translateY(-3px); }
    .card-booked { opacity:0.65; }
    .vc-top { display:flex; justify-content:space-between; align-items:center; }
    .vc-type-badge { padding:3px 10px; background:#fef3c7; color:#d97706; font-size:0.7rem; font-weight:700; border-radius:20px; }
    .vc-status-wrap { display:flex; align-items:center; gap:5px; }
    .vc-live-dot { width:7px; height:7px; border-radius:50%; }
    .dot-green { background:#16a34a; animation:livePulse 2s infinite; }
    .dot-red { background:#dc2626; }
    .vc-status-txt { font-size:0.72rem; font-weight:700; }
    .txt-green { color:#16a34a; } .txt-red { color:#dc2626; }
    .vc-name { font-size:1rem; font-weight:700; color:#1a2e1c; }
    .vc-plate { font-size:0.75rem; color:#9ca3af; letter-spacing:0.05em; }
    .vc-price-row { display:flex; align-items:baseline; gap:10px; }
    .vc-price-day { font-size:1.35rem; font-weight:800; color:#1a5e2a; }
    .vc-price-day span { font-size:0.78rem; font-weight:400; color:#6b8f70; }
    .vc-price-hr { font-size:0.78rem; background:#f0faf2; color:#4a9050; padding:3px 9px; border-radius:8px; border:1px solid #c8e6c9; font-weight:600; }
    .vc-meta { display:flex; flex-direction:column; gap:4px; font-size:0.78rem; color:#6b8f70; }
    .vc-meta i { color:#27a836; width:14px; margin-right:4px; }
    .vc-desc { font-size:0.76rem; color:#6b8f70; line-height:1.5; }
    .vc-footer { margin-top:auto; padding-top:12px; border-top:1px solid rgba(30,138,44,0.08); display:flex; justify-content:flex-end; }
    .btn-book { display:flex; align-items:center; gap:7px; padding:9px 20px; background:linear-gradient(135deg,#27a836,#1a8a2a); color:#fff; border:none; border-radius:10px; font-size:0.85rem; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:inherit; }
    .btn-book:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(30,138,44,0.35); }

    /* Bookings list */
    .bookings-list { display:flex; flex-direction:column; gap:16px; }
    .bk-card { background:#fff; border:1.5px solid rgba(30,138,44,0.1); border-radius:16px; padding:18px; }
    .bk-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
    .bk-vehicle-info { display:flex; align-items:center; gap:10px; }
    .bk-vehicle-icon { font-size:1.8rem; }
    .bk-name { font-size:0.95rem; font-weight:700; color:#1a2e1c; }
    .bk-type-tag { font-size:0.7rem; background:#fef3c7; color:#d97706; padding:2px 8px; border-radius:10px; font-weight:600; margin-top:3px; display:inline-block; }
    .bk-badge { display:flex; align-items:center; gap:5px; padding:5px 12px; border-radius:20px; font-size:0.75rem; font-weight:700; }
    .bk-badge-dot { width:6px; height:6px; border-radius:50%; background:currentColor; }
    .bk-warning { background:#fef3c7; color:#d97706; } .bk-info { background:#dbeafe; color:#2563eb; } .bk-success { background:#dcfce7; color:#16a34a; } .bk-danger { background:#fee2e2; color:#dc2626; } .bk-muted { background:#f3f4f6; color:#6b7280; }

    /* Status tracker */
    .tracker { display:flex; align-items:center; gap:0; margin:12px 0; padding:10px 16px; background:#f8fdf9; border-radius:12px; border:1px solid rgba(30,138,44,0.1); }
    .tracker-step { display:flex; flex-direction:column; align-items:center; gap:5px; flex-shrink:0; }
    .tr-dot { width:32px; height:32px; border-radius:50%; border:2px solid #d1d5db; background:#fff; display:flex; align-items:center; justify-content:center; font-size:0.75rem; color:#9ca3af; transition:all 0.3s; }
    .tr-label { font-size:0.65rem; font-weight:600; color:#9ca3af; text-align:center; }
    .tracker-step.done .tr-dot { border-color:#27a836; background:#27a836; color:#fff; }
    .tracker-step.done .tr-label { color:#16a34a; }
    .tracker-step.active .tr-dot { border-color:#27a836; background:#fff; color:#27a836; box-shadow:0 0 0 4px rgba(39,168,54,0.15); animation:trackerPulse 1.5s infinite; }
    .tracker-step.active .tr-label { color:#27a836; font-weight:700; }
    @keyframes trackerPulse { 0%,100%{box-shadow:0 0 0 4px rgba(39,168,54,0.15)} 50%{box-shadow:0 0 0 8px rgba(39,168,54,0.08)} }
    .tracker-line { flex:1; height:2px; background:#e5e7eb; margin:0 4px; margin-bottom:18px; transition:background 0.3s; }
    .tracker-line.done { background:#27a836; }

    .bk-details { display:flex; flex-wrap:wrap; gap:12px; font-size:0.8rem; color:#6b8f70; margin:8px 0; }
    .bk-details i { color:#27a836; margin-right:4px; }
    .bk-price { color:#1a5e2a; font-weight:700; }
    .bk-contact { font-size:0.78rem; color:#6b8f70; padding:6px 0; }
    .bk-contact i { margin-right:4px; }
    .bk-actions { display:flex; gap:8px; margin-top:10px; flex-wrap:wrap; }
    .bk-accept-btn { flex:1; padding:10px; background:linear-gradient(135deg,#27a836,#1a8a2a); color:#fff; border:none; border-radius:10px; font-size:0.85rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; font-family:inherit; transition:all 0.2s; }
    .bk-accept-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(30,138,44,0.3); }
    .bk-reject-btn { padding:10px 16px; border:1.5px solid #fca5a5; background:#fff; color:#dc2626; border-radius:10px; font-size:0.85rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:7px; font-family:inherit; transition:all 0.15s; }
    .bk-reject-btn:hover { background:#fee2e2; }
    .bk-complete-btn { flex:1; padding:10px; background:linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; border:none; border-radius:10px; font-size:0.85rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; font-family:inherit; transition:all 0.2s; }
    .bk-complete-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(37,99,235,0.3); }
    .bk-rejected { background:#fee2e2; color:#dc2626; border-radius:8px; padding:8px 12px; font-size:0.8rem; margin-top:8px; }
    .bk-rejected i { margin-right:6px; }

    /* Opt tag */
    .opt { font-size:0.72rem; color:#9ca3af; font-weight:400; margin-left:4px; }

    /* ===== RAPIDO OVERLAY ===== */
    .rp-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:1000; display:flex; align-items:flex-end; justify-content:center; }
    @media(min-width:600px) { .rp-overlay { align-items:center; } }

    .rp-sheet {
      background:#fff; border-radius:24px 24px 0 0; width:100%; max-width:520px;
      max-height:92vh; overflow-y:auto;
      animation:sheetUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    @media(min-width:600px) { .rp-sheet { border-radius:24px; } }
    @keyframes sheetUp { from{opacity:0;transform:translateY(60px)} to{opacity:1;transform:translateY(0)} }

    /* Progress pills */
    .rp-pills { display:flex; align-items:center; justify-content:center; gap:0; padding:18px 20px 0; }
    .rp-pill { display:flex; align-items:center; gap:6px; padding:6px 14px; border-radius:20px; font-size:0.75rem; font-weight:600; color:#9ca3af; border:1.5px solid #e5e7eb; background:#fff; transition:all 0.3s; }
    .rp-pill span { width:18px; height:18px; border-radius:50%; background:#e5e7eb; display:flex; align-items:center; justify-content:center; font-size:0.65rem; font-weight:800; }
    .rp-pill-active { color:#1a5e2a; border-color:#27a836; background:#f0faf2; }
    .rp-pill-active span { background:#27a836; color:#fff; }
    .rp-pill-done { color:#16a34a; border-color:#86efac; background:#f0fdf4; }
    .rp-pill-done span { background:#16a34a; color:#fff; }
    .rp-pill-line { flex:1; height:2px; background:#e5e7eb; max-width:30px; margin:0 4px; }
    .rp-pill-line-done { background:#27a836; }

    .rp-body { padding:20px; }
    .rp-header { display:flex; align-items:center; gap:12px; margin-bottom:18px; }
    .rp-back { background:none; border:1.5px solid #e5e7eb; border-radius:50%; width:36px; height:36px; cursor:pointer; color:#374151; display:flex; align-items:center; justify-content:center; transition:all 0.15s; flex-shrink:0; }
    .rp-back:hover { background:#f3f4f6; border-color:#9ca3af; }
    .rp-title { font-size:1.05rem; font-weight:800; color:#1a2e1c; }
    .rp-sub { font-size:0.75rem; color:#6b8f70; margin-top:2px; }

    /* Vehicle card in step 1 */
    .rp-vehicle-card { display:flex; align-items:flex-start; gap:14px; background:linear-gradient(135deg,#f0faf2,#e8f5e9); border:1.5px solid rgba(30,138,44,0.2); border-radius:16px; padding:16px; margin-bottom:18px; }
    .rp-vc-avatar { font-size:2.4rem; }
    .rp-vc-body { flex:1; }
    .rp-vc-name { font-size:0.95rem; font-weight:700; color:#1a2e1c; }
    .rp-vc-meta { font-size:0.75rem; color:#6b8f70; margin-top:3px; }
    .rp-vc-meta i { margin-right:4px; }
    .rp-vc-owner { font-size:0.75rem; color:#4a9050; margin-top:3px; font-weight:600; }
    .rp-vc-owner i { margin-right:4px; }
    .rp-vc-status { display:flex; align-items:center; gap:5px; font-size:0.72rem; font-weight:700; color:#16a34a; flex-shrink:0; }

    /* Type selector */
    .rp-type-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; }
    .rp-type-card { border:2px solid #e5e7eb; border-radius:16px; padding:16px; cursor:pointer; transition:all 0.2s; position:relative; text-align:center; }
    .rp-type-card:hover { border-color:rgba(30,138,44,0.35); background:#f7fdf8; transform:translateY(-2px); }
    .rp-type-card.selected { border-color:#27a836; background:#f0faf2; }
    .rtc-icon { font-size:1.8rem; margin-bottom:8px; }
    .rtc-name { font-size:0.85rem; font-weight:700; color:#1a2e1c; }
    .rtc-price { font-size:1rem; font-weight:800; color:#1a5e2a; margin:4px 0; }
    .rtc-price span { font-size:0.72rem; font-weight:400; color:#6b8f70; }
    .rtc-desc { font-size:0.7rem; color:#6b8f70; }
    .rtc-check { position:absolute; top:10px; right:10px; color:#27a836; font-size:1.1rem; }

    /* Counter */
    .rp-counter-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; }
    .rp-counter-label { font-size:0.85rem; font-weight:600; color:#374151; }
    .rp-counter-label i { color:#27a836; margin-right:6px; }
    .rp-counter { display:flex; align-items:center; gap:14px; }
    .rc-btn { width:34px; height:34px; border-radius:50%; border:2px solid rgba(30,138,44,0.25); background:#fff; color:#1a5e2a; font-size:1.1rem; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
    .rc-btn:hover { background:#27a836; color:#fff; border-color:#27a836; }
    .rc-val { font-size:1.3rem; font-weight:800; color:#1a2e1c; min-width:28px; text-align:center; }

    /* Availability */
    .avail-row { margin:8px 0 12px; }
    .avail-checking { font-size:0.8rem; color:#6b8f70; display:flex; align-items:center; gap:7px; }
    .avail-ok  { background:#dcfce7; color:#16a34a; border:1px solid #86efac; padding:10px 14px; border-radius:10px; font-size:0.82rem; display:flex; align-items:center; gap:8px; }
    .avail-no  { background:#fee2e2; color:#dc2626; border:1px solid #fecaca; padding:10px 14px; border-radius:10px; font-size:0.82rem; display:flex; align-items:center; gap:8px; margin:8px 0; }
    .avail-ok i,.avail-no i { font-size:0.9rem; }

    /* Slot picker */
    .slot-panel { background:#f8fdf9; border:1px solid rgba(30,138,44,0.15); border-radius:14px; padding:16px; }
    .slot-panel-header { display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; font-weight:700; color:#1a5e2a; margin-bottom:10px; flex-wrap:wrap; gap:6px; }
    .slot-legend-row { display:flex; align-items:center; gap:8px; font-size:0.7rem; color:#6b8f70; font-weight:400; }
    .sl { display:inline-block; width:9px; height:9px; border-radius:50%; margin-right:2px; }
    .sl-free { background:#dcfce7; border:1.5px solid #86efac; }
    .sl-taken { background:#fee2e2; border:1.5px solid #fca5a5; }
    .sl-sel { background:#27a836; border:1.5px solid #15803d; }
    .slot-live-bar { font-size:0.72rem; color:#6b8f70; display:flex; align-items:center; gap:6px; margin-bottom:10px; }
    .slot-loading { font-size:0.8rem; color:#6b8f70; padding:8px 0; display:flex; align-items:center; gap:7px; }
    .hour-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:6px; }
    .hs { padding:8px 4px; border-radius:9px; border:1.5px solid; font-size:0.73rem; font-weight:700; cursor:pointer; text-align:center; transition:all 0.12s; font-family:inherit; }
    .hs-free   { background:#fff; border-color:rgba(30,138,44,0.2); color:#1a5e2a; }
    .hs-free:hover { background:#f0faf2; border-color:#4a9050; transform:scale(1.06); }
    .hs-taken  { background:#fee2e2; border-color:#fca5a5; color:#dc2626; cursor:not-allowed; opacity:0.7; }
    .hs-range  { background:#dcfce7; border-color:#4a9050; color:#166534; }
    .hs-start  { background:#27a836; border-color:#15803d; color:#fff; }
    .time-range { display:flex; align-items:center; gap:8px; background:#f0faf2; border:1px solid rgba(30,138,44,0.2); border-radius:8px; padding:9px 14px; font-size:0.82rem; color:#1a5e2a; font-weight:600; margin-top:10px; }
    .time-range i { color:#27a836; }
    .tr-from,.tr-to { font-weight:800; }
    .tr-arrow { color:#27a836; font-size:1rem; }
    .tr-dur { color:#6b8f70; font-size:0.75rem; font-weight:400; margin-left:4px; }

    /* Live price preview */
    .rp-price-preview { display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,#f0faf2,#e8f5e9); border:1.5px solid rgba(30,138,44,0.2); border-radius:12px; padding:14px 18px; margin:14px 0; }
    .rpp-label { font-size:0.78rem; font-weight:700; color:#374151; }
    .rpp-note { font-size:0.72rem; color:#6b8f70; margin-top:2px; }
    .rpp-price { font-size:1.6rem; font-weight:900; color:#1a5e2a; }

    /* Field */
    .rp-field { margin-bottom:14px; }
    .rp-field label { display:block; font-size:0.82rem; font-weight:600; color:#374151; margin-bottom:6px; }
    .rp-field label i { color:#27a836; margin-right:6px; }

    /* Next / Confirm buttons */
    .rp-next { width:100%; padding:14px; border:none; border-radius:12px; background:linear-gradient(135deg,#27a836,#1a8a2a); color:#fff; font-size:0.95rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition:all 0.2s; font-family:inherit; margin-top:6px; }
    .rp-next:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 5px 18px rgba(30,138,44,0.35); }
    .rp-next:disabled { opacity:0.45; cursor:not-allowed; }
    .rp-confirm-btn { width:100%; padding:14px; border:none; border-radius:12px; background:linear-gradient(135deg,#f97316,#ea580c); color:#fff; font-size:0.95rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition:all 0.2s; font-family:inherit; margin-top:14px; }
    .rp-confirm-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 5px 18px rgba(234,88,12,0.35); }
    .rp-confirm-btn:disabled { opacity:0.45; cursor:not-allowed; }
    .rp-track-btn { flex:1; padding:12px; border:none; border-radius:10px; background:linear-gradient(135deg,#27a836,#1a8a2a); color:#fff; font-size:0.88rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; font-family:inherit; transition:all 0.2s; }
    .rp-track-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(30,138,44,0.3); }

    /* Confirm card */
    .rp-confirm-card { background:#f8fdf9; border:1px solid rgba(30,138,44,0.15); border-radius:16px; padding:18px; }
    .rcc-vehicle { display:flex; align-items:flex-start; gap:14px; padding-bottom:12px; }
    .rcc-icon { font-size:2.2rem; }
    .rcc-name { font-size:0.95rem; font-weight:700; color:#1a2e1c; }
    .rcc-meta { font-size:0.75rem; color:#6b8f70; margin-top:2px; }
    .rcc-owner { font-size:0.75rem; color:#4a9050; margin-top:2px; }
    .rcc-owner i { margin-right:4px; }
    .rcc-divider { height:1px; background:rgba(30,138,44,0.12); margin:6px 0; }
    .rcc-row { display:flex; justify-content:space-between; align-items:center; padding:7px 0; font-size:0.83rem; color:#374151; border-bottom:1px solid rgba(30,138,44,0.06); }
    .rcc-row:last-child { border-bottom:none; }
    .rcc-row i { margin-right:7px; color:#27a836; }
    .rcc-price-row { color:#4a9050; }
    .rcc-total-row { font-weight:700; font-size:0.95rem; color:#1a2e1c; }
    .rcc-total { font-size:1.2rem; font-weight:900; color:#1a5e2a; }
    .rp-info-note { background:#fffbeb; border:1px solid rgba(245,158,11,0.3); border-radius:10px; padding:10px 14px; font-size:0.76rem; color:#92400e; margin-top:14px; }
    .rp-info-note i { margin-right:6px; }

    /* Success */
    .rp-success { text-align:center; padding:28px 22px 22px; }
    .rp-success-ring { width:96px; height:96px; border-radius:50%; border:4px solid rgba(39,168,54,0.2); display:flex; align-items:center; justify-content:center; margin:0 auto 18px; animation:ringPulse 2s infinite; }
    .rp-success-icon { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#27a836,#1a8a2a); color:#fff; font-size:2rem; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 24px rgba(30,138,44,0.35); animation:bounceIn 0.5s ease; }
    @keyframes ringPulse { 0%,100%{border-color:rgba(39,168,54,0.2)} 50%{border-color:rgba(39,168,54,0.5)} }
    @keyframes bounceIn { 0%{transform:scale(0.3);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
    .rp-success-title { font-size:1.45rem; font-weight:900; color:#1a2e1c; margin-bottom:8px; }
    .rp-success-sub { font-size:0.83rem; color:#6b8f70; line-height:1.6; margin-bottom:4px; max-width:340px; margin-left:auto; margin-right:auto; }
    .rp-success-detail { background:#f0faf2; border-radius:12px; padding:14px; text-align:left; }
  `]
})
export class VehiclesComponent implements OnInit, OnDestroy {
  vehicles: any[] = [];
  bookings: any[] = [];
  viewMode = 'browse';
  filterType = 'All';
  vehicleTypes = ['All','Tractor','Mini_Truck','Heavy_Truck','Harvester','Trailer'];
  user: User | null = null;
  success = ''; error = ''; saving = false;
  showAddModal = false;

  // Rapido booking state
  bookStep = 0;
  selectedVehicle: any = null;
  loadingAvail = false;
  availability: any = null;
  hourConflict = '';
  hours = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
  todayStr = new Date().toISOString().split('T')[0];
  bookForm: any = { hireDate: this.todayStr, days:1, mode:'daily', startHour:null, numHours:2, message:'' };

  addForm: any = { name:'',numberPlate:'',type:'Tractor',price:0,pricePerHour:null,capacity:'',location:'',description:'' };

  // Live polling subscriptions
  private pollVehicles?: Subscription;
  private pollBookings?: Subscription;
  private pollSlots?: Subscription;

  constructor(
    private vehicleService: VehicleService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUser;
    this.loadVehicles();
    this.loadBookings();
    // Poll vehicles every 8 seconds -- status changes are reflected live
    this.pollVehicles = interval(8000).subscribe(() => this.loadVehicles());
    // Poll bookings every 6 seconds -- owner accept/reject shows instantly to booker
    this.pollBookings = interval(6000).subscribe(() => this.loadBookings());
  }

  ngOnDestroy() {
    this.pollVehicles?.unsubscribe();
    this.pollBookings?.unsubscribe();
    this.pollSlots?.unsubscribe();
  }

  switchView(mode: string) {
    this.viewMode = mode;
    if (mode === 'bookings') { this.loadBookings(); }
    if (mode === 'browse')   { this.loadVehicles(); }
  }

  loadVehicles() {
    const type = this.filterType !== 'All' ? this.filterType : undefined;
    this.vehicleService.getAll(type).subscribe({ next: v => this.vehicles = v, error: () => {} });
  }

  loadBookings() {
    this.vehicleService.getBookings().subscribe({ next: b => this.bookings = b, error: () => {} });
  }

  setType(t: string) { this.filterType = t; this.loadVehicles(); }

  openAddModal() {
    this.addForm = { name:'',numberPlate:'',type:'Tractor',price:0,pricePerHour:null,capacity:'',location:'',description:'' };
    this.error = '';
    this.showAddModal = true;
  }

  // ---- RAPIDO FLOW ----
  openBookFlow(v: any) {
    if (this.user?.role === 'vehicle_owner') { return; }
    this.selectedVehicle = v;
    this.bookForm = { hireDate: this.todayStr, days:1, mode:'daily', startHour:null, numHours:2, message:'' };
    this.availability = null;
    this.hourConflict = '';
    this.bookStep = 1;
  }

  goStep(step: number) {
    if (step === 2) {
      this.loadAvailability();
      // Start live slot polling every 10 seconds while picking time
      this.pollSlots?.unsubscribe();
      this.pollSlots = interval(10000).subscribe(() => {
        if (this.bookStep === 2) { this.loadAvailability(); }
      });
    }
    if (step !== 2) { this.pollSlots?.unsubscribe(); }
    this.bookStep = step;
  }

  closeBook() {
    this.bookStep = 0;
    this.selectedVehicle = null;
    this.pollSlots?.unsubscribe();
  }

  onDateChange() {
    this.availability = null;
    this.bookForm.startHour = null;
    this.hourConflict = '';
    this.loadAvailability();
  }

  loadAvailability() {
    if (!this.selectedVehicle || !this.bookForm.hireDate) { return; }
    this.loadingAvail = true;
    this.http.get<any>(`${environment.apiUrl}/vehicles/${this.selectedVehicle.id}/availability?date=${this.bookForm.hireDate}`)
      .subscribe({
        next: res => {
          // Merge new availability without resetting startHour if still valid
          const prevStart = this.bookForm.startHour;
          this.availability = res;
          this.loadingAvail = false;
          if (prevStart !== null && this.isHourTaken(prevStart)) {
            this.bookForm.startHour = null;
            this.hourConflict = `Hour ${prevStart}:00 was just booked by someone else. Please pick a new slot.`;
          } else {
            this.checkHourConflict();
          }
        },
        error: () => { this.loadingAvail = false; }
      });
  }

  selectStartHour(h: number) {
    if (this.isHourTaken(h)) { return; }
    this.bookForm.startHour = h;
    this.hourConflict = '';
    this.checkHourConflict();
  }

  isHourTaken(h: number): boolean { return this.availability?.bookedHours?.includes(h) ?? false; }

  isHourInRange(h: number): boolean {
    if (this.bookForm.startHour === null) { return false; }
    return h > this.bookForm.startHour && h < this.bookForm.startHour + this.bookForm.numHours;
  }

  checkHourConflict() {
    this.hourConflict = '';
    if (this.bookForm.startHour === null || !this.availability) { return; }
    for (let h = this.bookForm.startHour; h < this.bookForm.startHour + this.bookForm.numHours; h++) {
      if (this.isHourTaken(h)) { this.hourConflict = `Hour ${h}:00 is already booked. Adjust your selection.`; return; }
    }
  }

  adjDays(d: number) { this.bookForm.days = Math.max(1, this.bookForm.days + d); }
  adjHours(d: number) { this.bookForm.numHours = Math.max(1, Math.min(12, this.bookForm.numHours + d)); this.checkHourConflict(); }

  effectiveHourlyRate(): number {
    if (!this.selectedVehicle) { return 0; }
    return this.selectedVehicle.pricePerHour ? +this.selectedVehicle.pricePerHour : +(+this.selectedVehicle.price / 8).toFixed(0);
  }

  livePrice(): number {
    if (!this.selectedVehicle) { return 0; }
    return this.bookForm.mode === 'daily'
      ? +this.selectedVehicle.price * this.bookForm.days
      : this.effectiveHourlyRate() * this.bookForm.numHours;
  }

  addVehicle() {
    if (!this.addForm.name?.trim())        { this.error = 'Vehicle Name is required.'; return; }
    if (!this.addForm.numberPlate?.trim()) { this.error = 'Number Plate is required.'; return; }
    if (!this.addForm.type)                { this.error = 'Vehicle Type is required.'; return; }
    if (!this.addForm.price || this.addForm.price <= 0) { this.error = 'Price per Day must be > 0.'; return; }
    if (!this.addForm.capacity?.trim())    { this.error = 'Capacity is required.'; return; }
    if (!this.addForm.location?.trim())    { this.error = 'Location is required.'; return; }
    this.error = '';
    this.saving = true;
    this.vehicleService.create(this.addForm).subscribe({
      next: () => { this.success='Vehicle added!'; this.saving=false; this.showAddModal=false; this.loadVehicles(); setTimeout(()=>this.success='',3000); },
      error: (e:any) => { this.error=e.error?.error||'Failed'; this.saving=false; }
    });
  }

  bookVehicle() {
    if (!this.selectedVehicle || !this.bookForm.hireDate) { return; }
    if (this.bookForm.mode==='hourly' && this.bookForm.startHour===null) { this.error='Please select a start hour'; return; }
    this.saving = true; this.error = '';
    const payload: any = { vehicleId:this.selectedVehicle.id, hireDate:this.bookForm.hireDate, bookingMode:this.bookForm.mode, message:this.bookForm.message };
    if (this.bookForm.mode==='daily') { payload.days = this.bookForm.days; }
    else { payload.startHour = this.bookForm.startHour; payload.numHours = this.bookForm.numHours; }
    this.vehicleService.book(payload).subscribe({
      next: () => { this.saving=false; this.bookStep=4; this.loadVehicles(); this.loadBookings(); },
      error: (e:any) => { this.error=e.error?.error||'Failed to book'; this.saving=false; }
    });
  }

  updateBooking(id: number, status: string) {
    this.vehicleService.updateBooking(id, status).subscribe({
      next: () => { this.success=`Booking ${status}!`; this.loadBookings(); this.loadVehicles(); setTimeout(()=>this.success='',3000); },
      error: () => {}
    });
  }

  deleteVehicle(id: number) {
    if (!confirm('Delete this vehicle?')) { return; }
    this.vehicleService.delete(id).subscribe({ next:()=>{ this.success='Deleted!'; this.loadVehicles(); setTimeout(()=>this.success='',3000); }, error:()=>{} });
  }

  // Status tracker helpers
  isStepDone(b: any, step: string): boolean {
    const order = ['pending','accepted','completed'];
    return order.indexOf(b.status) > order.indexOf(step);
  }

  statusColor(s: string): string {
    const m: any = { pending:'warning', accepted:'info', rejected:'danger', completed:'success' };
    return m[s] || 'muted';
  }
}
