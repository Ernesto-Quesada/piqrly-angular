import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailStripComponent } from './thumbnail-strip.component';

describe('ThumbnailStripComponent', () => {
  let component: ThumbnailStripComponent;
  let fixture: ComponentFixture<ThumbnailStripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThumbnailStripComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThumbnailStripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
