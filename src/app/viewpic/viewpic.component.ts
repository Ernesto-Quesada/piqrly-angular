import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PictureService } from '../services/picture.service';
import {MatGridListModule} from '@angular/material/grid-list';


@Component({
  selector: 'app-viewpic',
  standalone: true,
  imports: [MatGridListModule],
  templateUrl: './viewpic.component.html',
  styleUrl: './viewpic.component.scss'
})
export class ViewpicComponent implements OnInit{

  userId!:string;
  qrId!:string;

  constructor(
    private route: ActivatedRoute,
    private pictureService: PictureService
  ) {}

  ngOnInit(){
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('userId')!;
      this.qrId = params.get('qrid')!;
      // Here you can check if userId and someQRId exist (e.g., via a service call)
      console.log(`User ID: ${this.userId}, QR Code: ${this.qrId}`);
      this.pictureService.getPictures(this.userId, this.qrId)
    });
  }

  }
