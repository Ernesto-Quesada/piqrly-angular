import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Location } from '@angular/common';

@Component({
  selector: 'app-comingsoon',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './comingsoon.component.html',
  styleUrl: './comingsoon.component.scss',
})
export class ComingSoonComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
