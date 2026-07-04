// 
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// we get two things: auth and signInWithEmailAndPassword for users 
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfnAKPVCDZdGHCPD8IwQxKZzmbWeYeXOc",
  authDomain: "grow2gether-70369.firebaseapp.com",
  databaseURL: "https://grow2gether-70369-default-rtdb.firebaseio.com",
  projectId: "grow2gether-70369",
  storageBucket: "grow2gether-70369.firebasestorage.app",
  messagingSenderId: "529851986921",
  appId: "1:529851986921:web:aa215e5991d3c271805178",
  measurementId: "G-HSFR4BFK7M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);