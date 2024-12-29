import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudittrialComponent } from './audittrial.component';

describe('AudittrialComponent', () => {
  let component: AudittrialComponent;
  let fixture: ComponentFixture<AudittrialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AudittrialComponent]
    });
    fixture = TestBed.createComponent(AudittrialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
