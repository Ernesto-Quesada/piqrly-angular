import { select, Store } from '@ngrx/store';
import {
  Router,
  RouterModule,
  RouterOutlet,
  NavigationEnd,
} from '@angular/router';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { selectItems } from '../store/selectors/shopcart.selector';
import { ShopCart } from '../models/shopCart';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs';
import { FeedbackFormComponent } from '../admin/feedback-form/feedback-form.component';

// Routes that should render fullscreen with no shell
const SHELL_FREE_ROUTES = ['/login'];

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    MatGridListModule,
    RouterOutlet,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatCheckboxModule,
    FormsModule,
    MatButtonModule,
    RouterModule,
    MatBadgeModule,
    FeedbackFormComponent,
  ],
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [
    trigger('iconState', [
      state('closed', style({ transform: 'rotate(0deg)', opacity: 1 })),
      state('opened', style({ transform: 'rotate(180deg)', opacity: 1 })),
      transition('closed <=> opened', animate('400ms ease-in-out')),
    ]),
  ],
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  events: string[] = [];
  opened!: boolean;
  cartBadgeCount = 0;
  isDesktop = window.innerWidth > 900;

  // ✅ true when current route should hide the shell entirely
  isShellFree = false;

  // ✅ true when user is logged in
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  @HostListener('window:resize')
  onResize() {
    this.isDesktop = window.innerWidth > 900;
    if (!this.isDesktop) this.opened = false;
  }

  constructor(private store: Store<{ cart: ShopCart }>) {}

  ngOnInit(): void {
    this.checkScreenSize();

    this.store.pipe(select(selectItems)).subscribe((items) => {
      this.cartBadgeCount = items.length;
    });

    // ✅ watch route changes to toggle shell visibility
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.isShellFree = SHELL_FREE_ROUTES.some((r) =>
          (e.urlAfterRedirects as string).startsWith(r),
        );
      });

    // ✅ check on first load too
    this.isShellFree = SHELL_FREE_ROUTES.some((r) =>
      this.router.url.startsWith(r),
    );
  }

  checkScreenSize(): void {
    this.isDesktop = window.innerWidth > 768;
  }

  toggleSidenav(sidenav: any) {
    sidenav.toggle();
    this.opened = !this.opened;
  }

  logout(): void {
    this.authService.logout();
  }

  goToLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url },
    });
  }
}
