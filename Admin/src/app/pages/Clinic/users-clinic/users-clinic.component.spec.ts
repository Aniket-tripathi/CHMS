import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersClinicComponent } from './users-clinic.component';

describe('UsersClinicComponent', () => {
  let component: UsersClinicComponent;
  let fixture: ComponentFixture<UsersClinicComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsersClinicComponent]
    });
    fixture = TestBed.createComponent(UsersClinicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
