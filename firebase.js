// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCoAYs3DCOoOnucAE4Mk7vv3lEUSlxcyb8",
  authDomain: "inventory-managment-8ddef.firebaseapp.com",
  projectId: "inventory-managment-8ddef",
  storageBucket: "inventory-managment-8ddef.appspot.com",
  messagingSenderId: "812713140174",
  appId: "1:812713140174:web:a1775951cecf0a8112d59f",
  measurementId: "G-RT20FSB9Y3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };