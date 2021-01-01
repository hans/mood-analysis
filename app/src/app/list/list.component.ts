import { Component, OnInit } from '@angular/core';
import { Entry, FirebaseService } from '../services/firebase.service';

import { forkJoin } from 'rxjs';
import { concat, toArray } from 'rxjs/operators';

import * as _ from 'lodash';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent implements OnInit {
  entryData: { entry: Entry; stats: any }[];
  entryStats: [{ pca: [number] }];
  displayedColumns = ['createdAt', 'pca1', 'activities'];

  // TODO make this configurable
  activeStat? = '3mPNep3p4vuiPJvBkCiU';

  constructor(private firebase: FirebaseService) {}

  ngOnInit(): void {
    const entriesStream = this.firebase.getRecentEntriesWithStats(
      50,
      this.activeStat,
    );
    entriesStream.pipe(toArray()).subscribe((data) => {
      this.entryData = data;
    });
  }
}
