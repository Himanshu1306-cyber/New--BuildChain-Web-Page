import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"; // Yeh line add karein

const firebaseConfig = {
  apiKey: "AIzaSyDtfKbz0tHmC-2gjB0C18wePRzisUjhtWs",
  authDomain: "chainbuild-30d6d.firebaseapp.com",
  projectId: "chainbuild-30d6d",
  storageBucket: "chainbuild-30d6d.firebasestorage.app",
  messagingSenderId: "822085929688",
  appId: "1:822085929688:web:9ee4e4204229828c5ca5ad",
  measurementId: "G-TE3SM6DC4K"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Auth initialize karein

export { db, auth }; // Inhe export karein taaki contractor.js ise use kar sake


