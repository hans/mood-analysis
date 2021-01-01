import { Component, OnInit, Input } from '@angular/core';

import { Chart, ChartDataSets, ChartOptions, TimeUnit } from 'chart.js';
import * as pluginZoom from 'chartjs-plugin-zoom';
import { Color } from 'ng2-charts';

import * as _ from 'lodash';
import Matrix from 'ml-matrix';

import { Entry } from '../services/firebase.service';
import { PCARecord } from '../services/stats/pca.service';

@Component({
  selector: 'app-pca-timeseries',
  templateUrl: './pca-timeseries.component.html',
  styleUrls: ['./pca-timeseries.component.css'],
})
export class PcaTimeseriesComponent implements OnInit {
  @Input() entries: Entry[];
  @Input() record: PCARecord;

  chartData: ChartDataSets[];

  ngOnInit(): void {
    Chart.pluginService.register(pluginZoom);

    this.chartData = this._chartData();
  }

  public chartOptions: ChartOptions = {
    responsive: true,
    tooltips: {
      enabled: true,
      intersect: false,
    },
    scales: {
      xAxes: [
        {
          type: 'time',
          time: {
            unit: <TimeUnit>'day',
            displayFormats: {
              day: 'MMM D',
            },
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            suggestedMin: -2,
            suggestedMax: 2,
          },
        },
      ],
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          enabled: true,
        },
      },
    },
  };

  public chartColors: Color[] = [
    { borderColor: 'black', backgroundColor: 'rgba(255, 0, 0, 0.3)' },
  ];

  _chartData(): ChartDataSets[] {
    const pcaData = Matrix.from1DArray(
      this.record.involvedEntries.length,
      this.record.emotions.length,
      this.record.projectedData,
    );

    const dataset = _.zip(this.entries, pcaData.to2DArray()).map((el) => {
      const [entry, vector] = el;
      return { x: (<any>entry.createdAt).toDate(), y: vector[0] };
    });

    const sortedData = _.orderBy(dataset, (el) => el.x);

    return [{ data: sortedData, label: 'PCA 1' }];
  }
}
