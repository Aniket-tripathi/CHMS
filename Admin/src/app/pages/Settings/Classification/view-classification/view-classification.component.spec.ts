import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewClassificationComponent } from './view-classification.component';

describe('ViewClassificationComponent', () => {
  let component: ViewClassificationComponent;
  let fixture: ComponentFixture<ViewClassificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewClassificationComponent]
    });
    fixture = TestBed.createComponent(ViewClassificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
