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

  // ✅ Observable of the current Firebase user (null when logged out)
  currentUser$ = user(this.auth);

  // ✅ Token key in localStorage
  private readonly TOKEN_KEY = 'access_token';

  // -------------------------
  // Public helpers
  // -------------------------

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
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
    signOut(this.auth);
    this.router.navigate(['/']);
  }

  // -------------------------
  // Private: exchange Firebase token → backend JWT
  // -------------------------
  private _exchangeForBackendJwt(cred: UserCredential): Observable<string> {
    return from(cred.user.getIdToken()).pipe(
      tap((firebaseToken) => {
        console.log('🔥 Firebase token length:', firebaseToken?.length);
      }),
      switchMap((firebaseToken) =>
        this.http.post<{ accessToken: string }>(
          `${environment.apiBaseUrl}/api/auth/login`,
          {}, // ✅ empty body
          {
            headers: {
              Authorization: `Bearer ${firebaseToken}`, // ✅ token in header
            },
          },
        ),
      ),
      tap((res) => {
        // ✅ backend returns accessToken not token
        localStorage.setItem(this.TOKEN_KEY, res.accessToken);
      }),
      switchMap((res) => [res.accessToken]),
    );
  }
}
