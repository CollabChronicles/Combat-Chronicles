// Replace with your own Firebase config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {

  apiKey: "AIzaSyDxlL7iXC-jcRfYbi2OL7mS-AW03UjFERw",

  authDomain: "combat-chronicles.firebaseapp.com",

  projectId: "combat-chronicles",

  storageBucket: "combat-chronicles.firebasestorage.app",

  messagingSenderId: "221232184545",

  appId: "1:221232184545:web:77c615eac7598b08c98ba0"

};



const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
