import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreDocument, DocumentChangeAction, DocumentReference, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Emotion { id?: string, name: string };
export interface Activity { id?: string, count: number };
export interface Entry {
  createdAt: Date,
  emotions: Record<string, number>,
  activities: string[]
}


@Injectable({
  providedIn: "root"
})
export class FirebaseService {

  constructor(public db: AngularFirestore) { }

  get emotions() {
    return this.db.collection("emotions")
      .snapshotChanges() as Observable<DocumentChangeAction<Emotion>[]>;
  }

  get activities() {
    return this.db.collection("activities")
      .snapshotChanges() as Observable<DocumentChangeAction<Activity>[]>;
  }

  getRecentEntries(limit = 50): Observable<Entry[]> {
    return this.db.collection("entries", ref => ref.orderBy("createdAt", "desc").limit(limit))
      .valueChanges() as Observable<Entry[]>;
  }

  /**
   * Retrieve an activity document, creating if necessary.
   */
  async getActivity(name: string): Promise<AngularFirestoreDocument> {
    let doc = this.db.collection("activities").doc(name);

    let docSnapshot = await doc.get().toPromise();
    if (!(docSnapshot && docSnapshot.exists)) {
      // Create the document
      doc.set({createdAt: new Date()});
    }

    return doc;
  }

  async addEntry(entry: any) {
    entry.createdAt = new Date();
    console.log(entry);

    // TODO run this in a transaction?
    // Get documents for each activity
    entry.activities.forEach((activity: string) => {
      var activityDoc: AngularFirestoreDocument<Activity> =
        this.db.collection("activities").doc(activity);
      activityDoc.get().subscribe(doc => {
        var count = doc.exists ? doc.data().count || 0 : 0;
        activityDoc.set({count: count + 1}, {merge: true});
      })
    });

    this.db.collection("entries").add(entry);
  }

}
