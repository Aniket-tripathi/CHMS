import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignMenuComponent } from './assign-menu.component';

describe('AssignMenuComponent', () => {
  let component: AssignMenuComponent;
  let fixture: ComponentFixture<AssignMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssignMenuComponent]
    });
    fixture = TestBed.createComponent(AssignMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
