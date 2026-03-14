import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintQrDialogComponent } from './print-qr-dialog.component';

describe('PrintQrDialogComponent', () => {
  let component: PrintQrDialogComponent;
  let fixture: ComponentFixture<PrintQrDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintQrDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintQrDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
