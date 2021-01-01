import { Component, OnInit } from '@angular/core';
import { PCAService } from '../services/stats/pca.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
})
export class StatsComponent implements OnInit {
  constructor(private pca: PCAService) {}

  ngOnInit(): void {}

  runPCA(): void {
    console.log('here', this.pca);
    this.pca.run();
  }
}
