import { Injectable } from '@angular/core';

import * as firestore from '@angular/fire/firestore';
import { forkJoin, Observable } from 'rxjs';
import { first, map, mergeMap, concatAll } from 'rxjs/operators';

export interface Emotion extends firestore.DocumentData {
  id?: string;
  name: string;
}
export interface Activity extends firestore.DocumentData {
  id?: string;
  count: number;
}
export interface Entry extends firestore.DocumentData {
  createdAt: Date;
  emotions: Record<string, number>;
  activities: string[];
}

export interface Stat extends firestore.DocumentData {
  createdAt: Date;
  type: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(public db: firestore.AngularFirestore) {}

  get emotions(): Observable<firestore.DocumentChangeAction<Emotion>[]> {
    return this.db.collection('emotions').snapshotChanges() as Observable<
      firestore.DocumentChangeAction<Emotion>[]
    >;
  }

  get activities(): Observable<firestore.DocumentChangeAction<Activity>[]> {
    return this.db.collection('activities').snapshotChanges() as Observable<
      firestore.DocumentChangeAction<Activity>[]
    >;
  }

  getFrequentActivities(
    limit = 20,
  ): Observable<firestore.DocumentChangeAction<Activity>[]> {
    return this.db
      .collection('activities', (ref) =>
        ref.orderBy('count', 'desc').limit(limit),
      )
      .snapshotChanges() as Observable<
      firestore.DocumentChangeAction<Activity>[]
    >;
  }

  getRecentEntries(limit = 50): Observable<Entry[]> {
    return this.db
      .collection('entries', (ref) =>
        ref.orderBy('createdAt', 'desc').limit(limit),
      )
      .valueChanges() as Observable<Entry[]>;
  }

  /**
   * Get a limited sequence of recent entries, and possibly include stats
   * information for an analysis with the ID `statsId`.
   */
  getRecentEntriesWithStats(
    limit = 50,
    statsId: string = null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Observable<{ entry: Entry; stats: any }> {
    const entrySnapshots = this.db
      .collection('entries', (ref) =>
        ref.orderBy('createdAt', 'desc').limit(limit),
      )
      .snapshotChanges()
      .pipe(first(), concatAll()) as Observable<
      firestore.DocumentChangeAction<Entry>
    >;

    return entrySnapshots.pipe(
      mergeMap(
        (entrySnapshot) => {
          // Get associated stat.
          return this.db
            .collection('entries')
            .doc(entrySnapshot.payload.doc.id)
            .collection('stats')
            .doc(statsId)
            .get()
            .pipe(map((x) => x.data()));
        },
        (entrySnapshot, statDoc) => ({
          entry: entrySnapshot.payload.doc.data(),
          stats: statDoc,
        }),
      ),
    );
  }

  getEntriesById(...ids: string[]): Observable<Entry[]> {
    return forkJoin(
      ids.map(
        (id) =>
          this.db
            .collection('entries')
            .doc(id)
            .valueChanges() as Observable<Entry>,
      ),
    );
  }

  /**
   * Retrieve an activity document, creating if necessary.
   */
  async getActivity(name: string): Promise<firestore.AngularFirestoreDocument> {
    const doc = this.db.collection('activities').doc(name);

    const docSnapshot = await doc.get().toPromise();
    if (!(docSnapshot && docSnapshot.exists)) {
      // Create the document
      doc.set({ createdAt: new Date() });
    }

    return doc;
  }

  async addEntry(entry: Entry): Promise<void> {
    // TODO run this in a transaction?
    // Get documents for each activity
    entry.activities.forEach((activity: string) => {
      const activityDoc: firestore.AngularFirestoreDocument<Activity> = this.db
        .collection('activities')
        .doc(activity);
      activityDoc.get().subscribe((doc) => {
        const count = doc.exists ? doc.data().count || 0 : 0;
        activityDoc.set({ count: count + 1 }, { merge: true });
      });
    });

    this.db.collection('entries').add(entry);
  }

  /**
   * Record statistical model results, and optionally propagate data onto entries.
   *
   * @param entryData Maps entry document IDs to arbitrary result blobs
   */
  async addStat(stat: Stat, entryData?: Record<string, any>): Promise<Stat> {
    const statRef = await this.db.collection('stats').add(stat);
    const ret = { ...stat, ...{ id: statRef.id } };

    if (entryData) {
      const entryStatOps = Object.entries(entryData).map((el) => {
        const [id, docStats] = el;

        const docUpdate = {};
        docUpdate[stat.type] = docStats;
        console.log('docStats', docStats);
        return this.db
          .collection('entries')
          .doc(id)
          .collection('stats')
          .doc(statRef.id)
          .set(docUpdate);
      });

      await forkJoin(entryStatOps).toPromise();
    }

    return ret;
  }
}
