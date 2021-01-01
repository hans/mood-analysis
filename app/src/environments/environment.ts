// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  // TODO don't store here ..
  firebase: {
    apiKey: 'AIzaSyAW_6zYywvUy67RXZwGiMZ3R_jsSykygmc',
    authDomain: 'mood-85e71.firebaseapp.com',
    projectId: 'mood-85e71',
    storageBucket: 'mood-85e71.appspot.com',
    messagingSenderId: '81154981835',
    appId: '1:81154981835:web:712f625042460cd47b004e',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
