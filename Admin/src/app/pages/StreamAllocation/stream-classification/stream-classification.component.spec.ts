import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamClassificationComponent } from './stream-classification.component';

describe('StreamClassificationComponent', () => {
  let component: StreamClassificationComponent;
  let fixture: ComponentFixture<StreamClassificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StreamClassificationComponent]
    });
    fixture = TestBed.createComponent(StreamClassificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
