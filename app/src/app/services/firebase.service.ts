import { Injectable } from '@angular/core';

import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
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
    return this.db.collection("activities").valueChanges() as Observable<Activity[]>;
  }

  addEntry(entry: any) {
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

    const entryDoc = {
      createdAt: new Date(),
      emotions: emotions,
    };
    console.log(entryDoc);

    return this.db.collection("entries").add(entryDoc);
  }

}
