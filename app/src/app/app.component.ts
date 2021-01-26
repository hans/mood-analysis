import { Component } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'app';

  constructor(public auth: AngularFireAuth) {
    this.auth.currentUser.then((x) => console.log("current user", x));
  }

  login() {
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((c) => console.log(c));
  }

}
