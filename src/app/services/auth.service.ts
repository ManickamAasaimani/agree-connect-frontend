import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    try { const s = localStorage.getItem('agri_user'); return s ? JSON.parse(s) : null; }
    catch { return null; }
  }

  get currentUser(): User | null { return this.currentUserSubject.value; }
  get token(): string | null { return localStorage.getItem('agri_token'); }
  get isLoggedIn(): boolean { return !!this.token; }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, req).pipe(tap(r => this.saveSession(r)));
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, req).pipe(tap(r => this.saveSession(r)));
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({ error: () => {} });
    localStorage.clear(); sessionStorage.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth']).then(() => window.location.reload());
  }

  getMe(): Observable<User> { return this.http.get<User>(`${this.apiUrl}/auth/me`); }
  updateProfile(data: any): Observable<any> { return this.http.put(`${this.apiUrl}/auth/profile`, data); }
  getUsers(role?: string): Observable<User[]> { const p = role ? `?role=${role}` : ''; return this.http.get<User[]>(`${this.apiUrl}/auth/users${p}`); }
  searchUsers(q: string): Observable<User[]> { return this.http.get<User[]>(`${this.apiUrl}/auth/users/search?q=${encodeURIComponent(q)}`); }
  getUserById(id: number): Observable<User> { return this.http.get<User>(`${this.apiUrl}/auth/user/${id}`); }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem('agri_token', res.token);
    localStorage.setItem('agri_user', JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem('agri_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
