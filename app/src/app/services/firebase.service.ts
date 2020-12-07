import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';


@Injectable({
  providedIn: "root"
})
export class FirebaseService {

  constructor(public db: AngularFirestore) { }

  getEmotions() {
    return this.db.collection("emotions").snapshotChanges();
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
