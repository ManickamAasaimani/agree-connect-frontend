import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'kyc',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/kyc/kyc.component').then(m => m.KycComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'marketplace',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/marketplace/marketplace.component').then(m => m.MarketplaceComponent)
  },
  {
    path: 'my-listings',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/my-listings/my-listings.component').then(m => m.MyListingsComponent)
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/orders/orders.component').then(m => m.OrdersComponent)
  },
  {
    path: 'vehicles',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/vehicles/vehicles.component').then(m => m.VehiclesComponent)
  },
  {
    path: 'manpower',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/manpower/manpower.component').then(m => m.ManpowerComponent)
  },
  {
    path: 'chat',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
