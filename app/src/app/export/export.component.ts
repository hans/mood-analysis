import { Component, OnInit } from '@angular/core';

import { csvFormat } from 'd3-dsv';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';

import { FirebaseService, Entry } from '../services/firebase.service';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.css'],
})
export class ExportComponent implements OnInit {
  constructor(private fb: FirebaseService) {}

  ngOnInit(): void {}

  async export(): Promise<void> {
    this.fb.db
      .collection('entries')
      .valueChanges()
      .subscribe((entries: Entry[]) => {
        this._exportAndDownload(entries);
      });
  }

  async _exportAndDownload(entries: Entry[]): Promise<void> {
    const zip = new JSZip();

    zip.file('emotions.csv', this.generateEmotionCsv(entries));
    zip.file('activities.csv', this.generateActivityCsv(entries));

    zip.generateAsync({ type: 'blob' }).then((blob) => {
      console.log(blob);
      const now = new Date();
      saveAs(
        blob,
        `mood-analysis_${now.getFullYear()}-${(now.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.zip`,
      );
    });
  }

  /**
   * Generate long emotion dataframe in CSV format.
   */
  generateEmotionCsv(entries: Entry[]): string {
    const rows = entries.flatMap((en) => {
      return Object.entries(en.emotions).map(([em, value]) => ({
        datetime: en.createdAt?.toDate(),
        emotion: em,
        value: value,
      }));
    });

    return csvFormat(rows);
  }

  /**
   * Generate long activity dataframe in CSV format.
   */
  generateActivityCsv(entries: Entry[]): string {
    const rows = entries.flatMap((en) => {
      return (
        en.activities
          ?.map((act) =>
            act.length > 0
              ? {
                  datetime: en.createdAt?.toDate(),
                  activity: act,
                }
              : null,
          )
          .filter((x) => !!x) || []
      );
    });

    return csvFormat(rows);
  }
}
