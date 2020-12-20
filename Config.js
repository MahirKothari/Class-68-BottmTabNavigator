import firebase from 'firebase';
require('@firebase/firestore')
var firebaseConfig = {
    apiKey: "AIzaSyCTJBBrxUNHXsc4QFVd_F4_y0ImdT7-28o",
    authDomain: "wily-2aff0.firebaseapp.com",
    databaseURL: "https://wily-2aff0.firebaseio.com",
    projectId: "wily-2aff0",
    storageBucket: "wily-2aff0.appspot.com",
    messagingSenderId: "118439947542",
    appId: "1:118439947542:web:f011f6e7e5a3261fdf7437"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore()