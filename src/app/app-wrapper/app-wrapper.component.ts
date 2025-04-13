import { Component } from '@angular/core';
import { NavComponent } from './../nav/nav/nav.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
@Component({
  selector: 'app-app-wrapper',
  imports: [
    SidebarComponent,
    // NavComponent,
  ],
  standalone: true,
  templateUrl: './app-wrapper.component.html',
  styleUrl: './app-wrapper.component.scss'
})
export class AppWrapperComponent {

}
