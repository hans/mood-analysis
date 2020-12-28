import { Injectable } from '@angular/core';

import { DocumentReference } from '@angular/fire/firestore';
import _ from "lodash";

import { Matrix } from 'ml-matrix';
import { PCA } from 'ml-pca';

import { Entry, FirebaseService } from '../firebase.service';

export interface PCARecord {
  // Mapping from emotion index to emotion string
  emotions: string[];
  involvedEntries: DocumentReference<Entry>[];

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
  providedIn: "root"
})
export class PCAService {

  constructor(private fb: FirebaseService) { }

  async run() {
    // TODO find relevant emotion subset. For now we'll just use all the
    // emotions and drop entries missing emotions. Ignore Daylio "happiness" emotion.
    this.fb.db.collection("entries").snapshotChanges().subscribe((entrySnapshots: any[]) => {
      let allEmotions = new Set(entrySnapshots.flatMap(e => Object.keys(e.payload.doc.data().emotions)));
      // Delete Daylio emotions
      allEmotions.delete("happiness");

      let compatibleEntries = entrySnapshots.filter(e =>
        _.isEqual(new Set(Object.keys(e.payload.doc.data().emotions)), allEmotions));

      let emotions = [...allEmotions];
      let emotionIdxs = Object.fromEntries(emotions.map((e, idx) => [e, idx]));

      // Construct data matrix.
      // TODO normalize
      let data = new Matrix(
          compatibleEntries.map(entry => emotions.map(em => entry.payload.doc.data().emotions[em])));

      let pca = new PCA(data, {center: true}),
          record: PCARecord = {
            emotions: emotions,
            involvedEntries: compatibleEntries.map(e => e.payload.doc.ref),

            eigenvectors: pca.getEigenvectors().to1DArray(),
            eigenvalues: pca.getEigenvalues(),

            loadings: pca.getLoadings().to1DArray(),
            explainedVariance: pca.getExplainedVariance(),

            projectedData: pca.predict(data).to1DArray()
          };

      // Compute per-entry stats (projected values)
      // TODO configurable
      let truncatedProjection = pca.predict(data).subMatrixColumn([0, 1]);
      let entryStats = Object.fromEntries(_.zip(
        compatibleEntries.map(e => e.payload.doc.id), truncatedProjection.to2DArray()));

      this.fb.addStat({type: "pca", createdAt: new Date(), data: record}, entryStats);
    });
  }

}