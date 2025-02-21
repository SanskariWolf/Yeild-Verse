import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioCreateComponent } from './portfolio-create.component';

describe('PortfolioCreateComponent', () => {
  let component: PortfolioCreateComponent;
  let fixture: ComponentFixture<PortfolioCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
