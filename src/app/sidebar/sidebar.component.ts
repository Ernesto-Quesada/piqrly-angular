import { RouterOutlet } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {MatGridListModule} from '@angular/material/grid-list';

@Component({
  selector: 'app-sidebar',
  imports: [ CommonModule, MatGridListModule,
    RouterOutlet,MatIconModule, MatListModule,MatSidenavModule, MatCheckboxModule, FormsModule, MatButtonModule],
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [
    trigger('iconState', [
      state('closed', style({
        transform: 'rotate(0deg)',
        opacity: 1
      })),
      state('opened', style({
        transform: 'rotate(180deg)',
        opacity: 1
      })),
      transition('closed <=> opened', animate('400ms ease-in-out'))
    ])
  ]
})
export class SidebarComponent implements OnInit {

  events: string[] = [];
  opened!: boolean;
  isDesktop = true;


  ngOnInit(): void {
    this.checkScreenSize();
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

