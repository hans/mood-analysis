import { Injectable } from '@angular/core';

import * as firestore from '@angular/fire/firestore';
import * as _ from 'lodash';

import { Matrix } from 'ml-matrix';
import { PCA } from 'ml-pca';

import { Entry, Stat, FirebaseService } from '../firebase.service';

export interface PCARecord {
  // Mapping from emotion index to emotion string
  emotions: string[];
  involvedEntries: firestore.DocumentReference<Entry>[];

  // Parameters
  // Eigenvectors as 1D array
  eigenvectors: number[];
  eigenvalues: number[];

  // Other views
  // Dimension loadings as 1D array
  loadings: number[];
  explainedVariance: number[];

  // 1D array form of projected data
  projectedData: number[];
}

@Injectable({
  providedIn: 'root',
})
export class PCAService {
  constructor(private fb: FirebaseService) {}

  async run(): Promise<Stat> {
    // TODO find relevant emotion subset. For now we'll just use all the
    // emotions and drop entries missing emotions. Ignore Daylio "happiness" emotion.
    return new Promise((resolve, reject) => {
      this.fb.db
        .collection('entries')
        .snapshotChanges()
        .subscribe(
          (entrySnapshots: firestore.DocumentChangeAction<Entry>[]) => {
            const allEmotions = new Set(
              entrySnapshots.flatMap((e) =>
                Object.keys(e.payload.doc.data().emotions),
              ),
            );
            // Delete Daylio emotions
            allEmotions.delete('happiness');

            const compatibleEntries = entrySnapshots.filter((e) =>
              _.isEqual(
                new Set(Object.keys(e.payload.doc.data().emotions)),
                allEmotions,
              ),
            );

            const emotions = [...allEmotions];

            // Construct data matrix.
            // TODO normalize
            const data = new Matrix(
              compatibleEntries.map((entry) =>
                emotions.map((em) => entry.payload.doc.data().emotions[em]),
              ),
            );

            const pca = new PCA(data, { center: true }),
              record: PCARecord = {
                emotions: emotions,
                involvedEntries: compatibleEntries.map(
                  (e) =>
                    e.payload.doc.ref as firestore.DocumentReference<Entry>,
                ),

                eigenvectors: pca.getEigenvectors().to1DArray(),
                eigenvalues: pca.getEigenvalues(),

                loadings: pca.getLoadings().to1DArray(),
                explainedVariance: pca.getExplainedVariance(),

                projectedData: pca.predict(data).to1DArray(),
              };

            // Compute per-entry stats (projected values)
            // TODO configurable
            const truncatedProjection = pca
              .predict(data)
              .subMatrixColumn([0, 1]);
            const entryStats = Object.fromEntries(
              _.zip(
                compatibleEntries.map((e) => e.payload.doc.id),
                truncatedProjection.to2DArray(),
              ),
            );

            const stat = { type: 'pca', createdAt: new Date(), data: record };
            this.fb.addStat(stat, entryStats).then((stat) => resolve(stat));
          },
        );
    });
  }
}
