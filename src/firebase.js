import firebase from 'firebase';

const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyAzX3y-FZyuae2JimoJ7jbVw8BXtAK45fk",
  authDomain: "hak-instagram.firebaseapp.com",
  databaseURL: "https://hak-instagram.firebaseio.com",
  projectId: "hak-instagram",
  storageBucket: "hak-instagram.appspot.com",
  messagingSenderId: "824274110917",
  appId: "1:824274110917:web:410517be9d842246d423ac",
  measurementId: "G-2C4YSX3GT2"
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };