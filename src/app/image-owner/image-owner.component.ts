import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'image-owner',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './image-owner.component.html',
  styleUrl: './image-owner.component.scss'
})
export class ImageOwnerComponent implements OnInit {
  @Input() imageCredit : any = '';

  ngOnInit(): void {
    console.log('ImageOwnerComponent initialized');
  }

}
