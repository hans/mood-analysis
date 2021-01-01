import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';
import { first } from 'rxjs/operators';

import { Entry, FirebaseService, Stat } from '../services/firebase.service';
import { PCARecord } from '../services/stats/pca.service';

@Component({
  selector: 'app-stats-details',
  templateUrl: './stats-details.component.html',
  styleUrls: ['./stats-details.component.css'],
})
export class StatsDetailsComponent implements OnInit {
  @Input() id: string;

  stat: Stat;

  pcaRecord?: PCARecord;
  entries: Entry[];

  numComponents = 2;
  statCreated: Date;
  firstEntryDate: Date;
  lastEntryDate: Date;
  explainedVariance: number[];
  totalExplainedVariance: number;

  chartReady = false;

  constructor(private route: ActivatedRoute, private fb: FirebaseService) {}

  async ngOnInit(): Promise<void> {
    if (!this.id) {
      if (this.route.snapshot.params.id) {
        this.id = this.route.snapshot.params.id;
      } else {
        // Get most recent analysis.
        const query = this.fb.db.collection('stats', (ref) =>
          ref.orderBy('createdAt', 'desc').limit(1),
        );
        const statSnapshot = await query
          .snapshotChanges()
          .pipe(first())
          .toPromise();
        if (!statSnapshot) {
          // TODO handle no stats
        }

        this.id = statSnapshot[0].payload.doc.id;
        this.stat = statSnapshot[0].payload.doc.data() as Stat;
      }
    }

    if (!this.stat) {
      this.stat = (await this.fb.db
        .collection('stats')
        .doc(this.id)
        .valueChanges()
        .pipe(first())
        .toPromise()) as Stat;
    }

    this.reload();
  }

  async reload(): Promise<void> {
    // TODO assumes PCA stats
    this.pcaRecord = this.stat.data as PCARecord;

    // Load associated entries.
    this.entries = await Promise.all(
      this.pcaRecord.involvedEntries.map((ref) =>
        ref.get().then((r) => r.data()),
      ),
    );

    this.statCreated = this.stat.createdAt;
    this.firstEntryDate = _.min(
      this.entries.map((e) => (<any>e.createdAt).toDate()),
    );
    this.lastEntryDate = _.max(
      this.entries.map((e) => (<any>e.createdAt).toDate()),
    );
    this.explainedVariance = _.take(
      this.pcaRecord.explainedVariance,
      this.numComponents,
    ).map((v) => v * 100);
    this.totalExplainedVariance = _.sum(this.explainedVariance);

    this.chartReady = true;
  }

  // renderChart() {
  //   const width = 400, height = 400;
  //   const margin = {top: 20, right: 80, bottom: 30, left: 150};
  //   const data = this.chartData.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
  //
  //   let svg = d3.select("#chart").append("svg")
  //     .attr("id", "chart-pca")
  //     .attr("width", width + margin.left + margin.right)
  //     .attr("height", height + margin.top + margin.bottom)
  //
  //   let g = svg.append("g")
  //     .attr("transform", `translate(${margin.left}, ${margin.top})`);
  //
  //   console.log(data);
  //   let x = d3.scaleTime()
  //     .domain(d3.extent(data, (d) => d.datetime))
  //     .range([0, width]);
  //
  //   let y = d3.scaleLinear()
  //     .domain(d3.extent(data, (d) => d.y))
  //     .range([0, height]);
  //
  //   // Axes
  //
  //   const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%m-%d"));
  //   const yAxis = d3.axisLeft(y);
  //
  //   g.append("g")
  //     .call(yAxis)
  //     .append("text")
  //     .attr("transform", "rotate(-90)")
  //     .style("text-anchor", "end")
  //     .text("PCA dim 1");
  //
  //   g.append("g")
  //     .attr("class", "x axis")
  //     .attr("transform", `translate(0, ${height})`)
  //     .call(xAxis);
  //
  //   // X grid lines
  //   g.append("g")
  //     .attr("class", "grid")
  //     .attr("transform", `translate(0, ${height})`)
  //     .call(d3.axisBottom(x).ticks(5).tickSize(-height).tickFormat(<null>""))
  //
  //   // Y grid lines
  //   g.append("g")
  //     .attr("class", "grid")
  //     .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(<null>""))
  //
  //   let line = g.append("path")
  //     .datum(data)
  //     .attr("class", "line")
  //     .attr("d", <any>d3.line()
  //       .x(d => x((d as unknown as ChartDataItem).datetime))
  //       .y(d => y((d as unknown as ChartDataItem).y)));
  //
  //   // Overlay for catching mouseover
  //   g.append("rect")
  //     .attr("class", "overlay")
  //     .attr("width", width)
  //     .attr("height", height)
  //     .on("mousemove", mousemove);
  //
  //   function mousemove() {
  //     //const x0 = x.invert(d3.pointer(this)[0]);
  //     console.log(d3.pointer(this));
  //   }

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
  // }
}
