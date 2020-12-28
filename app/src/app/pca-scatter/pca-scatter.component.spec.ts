import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcaScatterComponent } from './pca-scatter.component';

describe('PcaScatterComponent', () => {
  let component: PcaScatterComponent;
  let fixture: ComponentFixture<PcaScatterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PcaScatterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PcaScatterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
