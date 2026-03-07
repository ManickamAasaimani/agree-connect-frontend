import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-layout">
      <ng-container *ngIf="authService.isLoggedIn">
        <app-sidebar></app-sidebar>
        <app-navbar></app-navbar>
      </ng-container>
      <div [class.main-content]="authService.isLoggedIn">
        <router-outlet></router-outlet>
        <footer class="app-footer" *ngIf="authService.isLoggedIn">
          <span>© AgriConnect Hub 2026 · All rights reserved</span>
          <span class="footer-sep">|</span>
          <span>Support &amp; Developed by <strong>Manickam</strong></span>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .app-footer {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      padding: 18px 20px; margin-top: 32px;
      font-size: 0.78rem; color: #5a8c5a;
      border-top: 1px solid rgba(58,181,58,0.15);
      background: #f0faf0;
    }
    .footer-sep { opacity: 0.4; }
    .app-footer strong { color: #2e9e2e; }
  `]
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}
