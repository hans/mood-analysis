import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcaTimeseriesComponent } from './pca-timeseries.component';

describe('PcaTimeseriesComponent', () => {
  let component: PcaTimeseriesComponent;
  let fixture: ComponentFixture<PcaTimeseriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PcaTimeseriesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PcaTimeseriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
