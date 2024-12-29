import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayPharmacyScreenComponent } from './display-pharmacy-screen.component';

describe('DisplayPharmacyScreenComponent', () => {
  let component: DisplayPharmacyScreenComponent;
  let fixture: ComponentFixture<DisplayPharmacyScreenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DisplayPharmacyScreenComponent]
    });
    fixture = TestBed.createComponent(DisplayPharmacyScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
