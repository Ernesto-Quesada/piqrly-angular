import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  user,
  UserCredential,
} from '@angular/fire/auth';
import { from, Observable, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser$ = user(this.auth);

  private readonly TOKEN_KEY = 'access_token';
  private readonly ROLE_KEY = 'user_role';

  // -------------------------
  // Public helpers
  // -------------------------

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  // -------------------------
  // Email + Password Login
  // -------------------------
  loginWithEmail(email: string, password: string): Observable<string> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((cred) => this._exchangeForBackendJwt(cred)),
    );
  }

  // -------------------------
  // Email + Password Register
  // -------------------------
  registerWithEmail(email: string, password: string): Observable<string> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password),
    ).pipe(switchMap((cred) => this._exchangeForBackendJwt(cred)));
  }

  // -------------------------
  // Google Sign-In
  // -------------------------
  loginWithGoogle(): Observable<string> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider)).pipe(
      switchMap((cred) => this._exchangeForBackendJwt(cred)),
    );
  }

  // -------------------------
  // Logout
  // -------------------------
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    signOut(this.auth);
    this.router.navigate(['/']);
  }

  // -------------------------
  // Redirect based on role
  // Called from LoginComponent after successful login
  // -------------------------
  redirectAfterLogin(returnUrl: string = '/'): void {
    const role = this.getRole();
    if (role === 'ADMIN') {
      this.router.navigate(['/admin/feedback']);
    } else {
      this.router.navigateByUrl(returnUrl);
    }
  }

  // -------------------------
  // Private: exchange Firebase token → backend JWT → fetch role
  // -------------------------
  private _exchangeForBackendJwt(cred: UserCredential): Observable<string> {
    return from(cred.user.getIdToken()).pipe(
      tap((firebaseToken) => {
        console.log('🔥 Firebase token length:', firebaseToken?.length);
      }),
      switchMap((firebaseToken) =>
        this.http.post<{ accessToken: string }>(
          `${environment.apiBaseUrl}/api/auth/login`,
          {},
          {
            headers: {
              Authorization: `Bearer ${firebaseToken}`,
            },
          },
        ),
      ),
      tap((res) => {
        localStorage.setItem(this.TOKEN_KEY, res.accessToken);
      }),
      // ✅ after storing JWT fetch role from /api/profile/me
      switchMap((res) =>
        this.http
          .get<{
            email: string;
            role: string;
          }>(`${environment.apiBaseUrl}/api/profile/me`)
          .pipe(
            tap((profile) => {
              localStorage.setItem(this.ROLE_KEY, profile.role);
              console.log('✅ Role stored:', profile.role);
            }),
            // return the access token to keep Observable<string> type
            switchMap(() => [res.accessToken]),
          ),
      ),
    );
  }
}
