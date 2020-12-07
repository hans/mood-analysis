import { AngularFirestore } from '@angular/fire/firestore';


export class FirebaseService {

  constructor(public db: AngularFirestore) { }

  getEmotions() {
    return this.db.collection("emotions").snapshotChanges();
  }

}
