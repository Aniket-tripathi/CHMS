import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VitalViewComponent } from './vital-view.component';

describe('VitalViewComponent', () => {
  let component: VitalViewComponent;
  let fixture: ComponentFixture<VitalViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VitalViewComponent]
    });
    fixture = TestBed.createComponent(VitalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
