import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventPackageSuccessComponent } from './event-package-success.component';

describe('EventPackageSuccessComponent', () => {
  let component: EventPackageSuccessComponent;
  let fixture: ComponentFixture<EventPackageSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventPackageSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventPackageSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
