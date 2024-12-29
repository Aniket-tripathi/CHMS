import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayPharmacyComponent } from './display-pharmacy.component';

describe('DisplayPharmacyComponent', () => {
  let component: DisplayPharmacyComponent;
  let fixture: ComponentFixture<DisplayPharmacyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DisplayPharmacyComponent]
    });
    fixture = TestBed.createComponent(DisplayPharmacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
