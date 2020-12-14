import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreDocument, DocumentChangeAction, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';


export interface Emotion { id?: string, name: string };
export interface Activity { id?: string, name: string };


@Injectable({
  providedIn: "root"
})
export class FirebaseService {

  constructor(public db: AngularFirestore) { }

  get emotions() {
    return this.db.collection("emotions", ref => ref.orderBy("name"))
      .snapshotChanges() as Observable<DocumentChangeAction<Emotion>[]>;
  }

  get activities() {
    return this.db.collection("activities")
      .snapshotChanges() as Observable<DocumentChangeAction<Activity>[]>;
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
    // Build entry document with reference to emotions
    const emotions = [];
    for (let e_id in entry.emotions) {
      const value = entry.emotions[e_id];
      if (value == "")
        // Don't save missing values
        continue;

      emotions.push({
        emotion: this.db.doc(`emotions/${e_id}`).ref,
        value: entry.emotions[e_id]
      })
    }

    const activityDocs: AngularFirestoreDocument[] =
      entry.activities ? await Promise.all(entry.activities.map(el => this.getActivity(el.value)))
                       : [];
    const activityRefs = activityDocs?.map(d => d.ref);

    const entryDoc = {
      createdAt: new Date(),
      emotions: emotions,
      activities: activityRefs,
    };
    console.log(entryDoc);

    return this.db.collection("entries").add(entryDoc);
  }

}
