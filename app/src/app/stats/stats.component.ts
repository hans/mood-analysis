import { Component, OnInit, ViewChild } from '@angular/core';

import { PCAService } from '../services/stats/pca.service';
import { StatsDetailsComponent } from '../stats-details/stats-details.component';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
})
export class StatsComponent implements OnInit {
  @ViewChild(StatsDetailsComponent) details: StatsDetailsComponent;

  constructor(private pca: PCAService) {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ngOnInit(): void {}

  runPCA(): void {
    this.pca.run().then(() => {
      // Reload details component.
      this.details.ngOnInit();
    });
  }
}
