import { Component, OnInit, Input } from '@angular/core';

import {
  Chart,
  ChartPoint,
  ChartDataSets,
  ChartOptions,
  TimeUnit,
} from 'chart.js';
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
  @Input() numComponents = 2;

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
    const pcaData: number[][] = Matrix.from1DArray(
      this.record.involvedEntries.length,
      this.record.emotions.length,
      this.record.projectedData,
    ).to2DArray();

    const datasets: ChartDataSets[] = _.range(this.numComponents).map((idx) => {
      const componentData = _.zip(this.entries, pcaData).map((el) => {
        const [entry, vector] = el;
        return { x: (<any>entry.createdAt).toDate(), y: vector[idx] };
      });

      const dataset = {
        data: _.orderBy(componentData, (el) => el.x),
        label: `PCA ${idx + 1}`,
      };

      return dataset;
    });

    // Add moving average datasets.
    // TODO extract magic number
    const movingAverageDatasets = datasets.map(
      (dataset) => this.computeMovingAverage(dataset, 1000 * 60 * 60 * 12), // 12 hour step size
    );

    return datasets.concat(movingAverageDatasets);
  }

  /**
   * Compute a moving average of the given dataset over the given time window.
   * Data points are resampled at the time window / frequency specified by
   * `window` in millisecond units.
   */
  computeMovingAverage(
    dataset: ChartDataSets,
    stepSize: number,
  ): ChartDataSets {
    const data = _.orderBy(dataset.data as ChartPoint[], (d) => d.x),
      dates = data.map((d) => d.x as Date),
      minDate = dates[0],
      maxDate = dates[dates.length - 1],
      minTime = minDate.getTime();

    const steps = _.range(minDate.getTime(), maxDate.getTime(), stepSize),
      buckets: { [bucket: number]: number[] } = _.fromPairs(
        steps.map((s) => [s, []]),
      );
    data.forEach((d) => {
      const bucket =
        Math.floor(((<Date>d.x).getTime() - minTime) / stepSize) * stepSize +
        minTime;
      buckets[bucket].push(<number>d.y);
    });

    const avgData = Object.entries(buckets).map((el) => {
      const [bucket, values] = el;
      return {
        x: new Date(Number(bucket)),
        y: _.mean(values),
      };
    });

    const avgDataset = {
      label: `${dataset.label} moving average`,
      data: avgData as ChartPoint[],
    };

    return avgDataset;
  }
}
