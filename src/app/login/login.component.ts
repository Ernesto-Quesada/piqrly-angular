import { Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ✅ Toggle between login and register
  isRegisterMode = signal<boolean>(false);

  // Form fields
  email = '';
  password = '';
  confirmPassword = '';

  // UI state
  isLoading = signal<boolean>(false);
  errorMsg = signal<string>('');

  // ✅ Where to go after login (private event redirect)
  private get returnUrl(): string {
    return this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
  }

  toggleMode(): void {
    this.isRegisterMode.update((v) => !v);
    this.errorMsg.set('');
    this.password = '';
    this.confirmPassword = '';
  }

  submitEmail(): void {
    this.errorMsg.set('');

    if (!this.email || !this.password) {
      this.errorMsg.set('Please fill in all fields.');
      return;
    }

    if (this.isRegisterMode()) {
      if (this.password !== this.confirmPassword) {
        this.errorMsg.set('Passwords do not match.');
        return;
      }
      if (this.password.length < 6) {
        this.errorMsg.set('Password must be at least 6 characters.');
        return;
      }
    }

    this.isLoading.set(true);

    const action$ = this.isRegisterMode()
      ? this.auth.registerWithEmail(this.email, this.password)
      : this.auth.loginWithEmail(this.email, this.password);

    action$.subscribe({
      next: () => this._onSuccess(),
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set(this._friendlyError(err));
      },
    });
  }

  loginWithGoogle(): void {
    this.errorMsg.set('');
    this.isLoading.set(true);

    this.auth.loginWithGoogle().subscribe({
      next: () => this._onSuccess(),
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set(this._friendlyError(err));
      },
    });
  }

  private _onSuccess(): void {
    this.isLoading.set(false);
    this.router.navigateByUrl(this.returnUrl);
  }

  private _friendlyError(err: any): string {
    const code = err?.code ?? '';

    if (
      code === 'auth/user-not-found' ||
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential'
    )
      return 'Invalid email or password.';
    if (code === 'auth/email-already-in-use')
      return 'An account with this email already exists.';
    if (code === 'auth/invalid-email')
      return 'Please enter a valid email address.';
    if (code === 'auth/weak-password')
      return 'Password must be at least 6 characters.';
    if (code === 'auth/popup-closed-by-user')
      return 'Google sign-in was cancelled.';
    if (code === 'auth/network-request-failed')
      return 'Network error. Please check your connection.';

    return err?.message ?? 'Something went wrong. Please try again.';
  }
}
