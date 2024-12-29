import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutPatientComponent } from './out-patient.component';

describe('OutPatientComponent', () => {
  let component: OutPatientComponent;
  let fixture: ComponentFixture<OutPatientComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OutPatientComponent]
    });
    fixture = TestBed.createComponent(OutPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
