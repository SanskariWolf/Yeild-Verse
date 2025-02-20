import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YieldStatsComponent } from './yield-stats.component';

describe('YieldStatsComponent', () => {
  let component: YieldStatsComponent;
  let fixture: ComponentFixture<YieldStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YieldStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YieldStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
