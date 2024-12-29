import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenPdfComponent } from './token-pdf.component';

describe('TokenPdfComponent', () => {
  let component: TokenPdfComponent;
  let fixture: ComponentFixture<TokenPdfComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TokenPdfComponent]
    });
    fixture = TestBed.createComponent(TokenPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
