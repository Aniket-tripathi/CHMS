import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewVisitorsComponent } from './view-visitors.component';

describe('ViewVisitorsComponent', () => {
  let component: ViewVisitorsComponent;
  let fixture: ComponentFixture<ViewVisitorsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewVisitorsComponent]
    });
    fixture = TestBed.createComponent(ViewVisitorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
