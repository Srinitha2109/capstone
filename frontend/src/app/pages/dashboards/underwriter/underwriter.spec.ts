import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Underwriter } from './underwriter';

describe('Underwriter', () => {
  let component: Underwriter;
  let fixture: ComponentFixture<Underwriter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Underwriter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Underwriter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
