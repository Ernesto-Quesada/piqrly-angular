import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  qrForm;
  inviteForm;

  submitted = signal(false);
  // heroImages = [
  //   '/assets/landing/granada.jpg',
  //   '/assets/landing/machupichu.jpg',
  //   '/assets/landing/theqbros.jpg',
  // ];
  get isMobile(): boolean {
    return window.innerWidth <= 768;
  }
  heroSlides = [
    { url: 'assets/landing/hero-1', focalPoint: 'center center' },
    { url: 'assets/landing/hero-2', focalPoint: '30% 50%' }, // focus lower
    { url: 'assets/landing/hero-3', focalPoint: 'center 70%' }, // focus upper
  ];
  get heroImages() {
    const suffix = this.isMobile ? 'S' : 'L';
    return this.heroSlides.map((s) => ({
      url: `${s.url}-${suffix}.webp`,
      focalPoint: s.focalPoint,
    }));
  }
  // seconds per slide
  slideDuration = 5;

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.qrForm = this.fb.group({
      qrid: ['', [Validators.required, Validators.minLength(4)]],
    });

    this.inviteForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  qrInvalid = computed(() => {
    const c = this.qrForm.controls.qrid;
    return this.submitted() && (c.invalid || !c.value?.trim());
  });

  inviteInvalid = computed(() => {
    const c = this.inviteForm.controls.code;
    return this.submitted() && (c.invalid || !c.value?.trim());
  });

  goQr() {
    this.submitted.set(true);
    if (this.qrForm.invalid) return;

    const qrid = (this.qrForm.value.qrid ?? '').trim();
    if (!qrid) return;

    this.router.navigate(['/viewpics', qrid]);
  }

  goInvite() {
    this.submitted.set(true);
    if (this.inviteForm.invalid) return;

    const code = (this.inviteForm.value.code ?? '').trim();
    if (!code) return;

    this.router.navigate(['/events/invite', code]);
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
