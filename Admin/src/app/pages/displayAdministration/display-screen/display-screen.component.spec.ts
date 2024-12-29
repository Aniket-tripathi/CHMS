import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayScreenComponent } from './display-screen.component';

describe('DisplayScreenComponent', () => {
  let component: DisplayScreenComponent;
  let fixture: ComponentFixture<DisplayScreenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DisplayScreenComponent]
    });
    fixture = TestBed.createComponent(DisplayScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
