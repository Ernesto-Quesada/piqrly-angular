import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageOwnerComponent } from './image-owner.component';

describe('ImageOwnerComponent', () => {
  let component: ImageOwnerComponent;
  let fixture: ComponentFixture<ImageOwnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageOwnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
