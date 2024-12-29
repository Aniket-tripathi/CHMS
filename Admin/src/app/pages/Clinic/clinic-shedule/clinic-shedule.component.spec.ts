import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicSheduleComponent } from './clinic-shedule.component';

describe('ClinicSheduleComponent', () => {
  let component: ClinicSheduleComponent;
  let fixture: ComponentFixture<ClinicSheduleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClinicSheduleComponent]
    });
    fixture = TestBed.createComponent(ClinicSheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
