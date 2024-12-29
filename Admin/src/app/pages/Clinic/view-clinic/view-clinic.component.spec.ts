import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewClinicComponent } from './view-clinic.component';

describe('ViewClinicComponent', () => {
  let component: ViewClinicComponent;
  let fixture: ComponentFixture<ViewClinicComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewClinicComponent]
    });
    fixture = TestBed.createComponent(ViewClinicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
