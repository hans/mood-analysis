import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as d3 from 'd3';
import _ from 'lodash';
import Matrix from 'ml-matrix';

import { Entry, FirebaseService, Stat } from '../services/firebase.service';
import { PCARecord } from '../services/stats/pca.service';


interface ChartDataItem {
  datetime: Date;
  y: number;
}


@Component({
  selector: 'app-stats-details',
  templateUrl: './stats-details.component.html',
  styleUrls: ['./stats-details.component.css']
})
export class StatsDetailsComponent implements OnInit {

  id: string;
  stat: Stat;

  pcaRecord?: PCARecord;
  entries: Entry[];

  constructor(private route: ActivatedRoute,
              private fb: FirebaseService) { }

  async ngOnInit(): Promise<void> {
    console.log("here")
    this.route.params.subscribe(async params => {
      this.id = params["id"];
      this.fb.db.collection("stats").doc(this.id).valueChanges().subscribe(async stat => {
        this.stat = stat as Stat;

        // TODO assumes PCA stats
        this.pcaRecord = this.stat.data as PCARecord;

        // Load associated entries.
        this.entries = await Promise.all(
          this.pcaRecord.involvedEntries.map(ref => ref.get().then(r => r.data())));

        this.renderChart();
      })
    });
  }

  get chartData(): ChartDataItem[] {
    let pcaData = Matrix.from1DArray(
      this.pcaRecord.involvedEntries.length,
      this.pcaRecord.emotions.length,
      this.pcaRecord.projectedData);

    return _.zip(this.entries, pcaData.to2DArray()).map(el => {
      const [entry, vector] = el;
      return {datetime: entry.createdAt.toDate(), y: vector[0]};
    })
  }

  renderChart() {
    const width = 400, height = 400;
    const data = this.chartData.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

    let svg = d3.select("#chart").append("svg")
      .attr("width", width)
      .attr("height", height);

    let g = svg.append("g")

    console.log(data);
    let x = d3.scaleTime()
      .domain(d3.extent(data, (d) => d.datetime))
      .range([0, width]);

    let y = d3.scaleLinear()
      .domain(d3.extent(data, (d) => d.y))
      .range([0, height]);

    svg.append("g").call(d3.axisLeft(y));
    svg.append("g").call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m-%d")));

    let line = svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", <any>d3.line()
        .x(d => x((d as unknown as ChartDataItem).datetime))
        .y(d => y((d as unknown as ChartDataItem).y)));
    // nv.addGraph(() => {
    //   var chart = nv.models.lineChart();
    //
    //   chart.xAxis
    //     .axisLabel("Date");
    //
    //   chart.yAxis
    //     .axisLabel("PCA 1");
    //
    //   d3.select("#chart svg")
    //     .datum(this.chartData)
    //     .call(chart);
    //
    //   return chart;
    // })
  }

}
