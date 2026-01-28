import { select, Store } from '@ngrx/store';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Component, HostListener, OnInit } from '@angular/core';
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
import { CartItem, ShopCart } from '../models/shopCart';

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
  ],
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [
    trigger('iconState', [
      state(
        'closed',
        style({
          transform: 'rotate(0deg)',
          opacity: 1,
        })
      ),
      state(
        'opened',
        style({
          transform: 'rotate(180deg)',
          opacity: 1,
        })
      ),
      transition('closed <=> opened', animate('400ms ease-in-out')),
    ]),
  ],
})
export class SidebarComponent implements OnInit {
  events: string[] = [];
  opened!: boolean;
  // isDesktop = true;
  cartBadgeCount = 0;
  isDesktop = window.innerWidth > 900;

  @HostListener('window:resize')
  onResize() {
    this.isDesktop = window.innerWidth > 900;
    if (!this.isDesktop) this.opened = false; // optional: auto-close on mobile
  }

  constructor(private store: Store<{ cart: ShopCart }>) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.store.pipe(select(selectItems)).subscribe((items) => {
      this.cartBadgeCount = items.length;
    });
  }

  checkScreenSize(): void {
    // Set isDesktop based on a 768px breakpoint.
    this.isDesktop = window.innerWidth > 768;
  }

  toggleSidenav(sidenav: any) {
    sidenav.toggle();
    this.opened = !this.opened;
  }
}
