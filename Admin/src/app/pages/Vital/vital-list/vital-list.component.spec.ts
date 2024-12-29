import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VitalListComponent } from './vital-list.component';

describe('VitalListComponent', () => {
  let component: VitalListComponent;
  let fixture: ComponentFixture<VitalListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VitalListComponent]
    });
    fixture = TestBed.createComponent(VitalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
