// Importar las funciones necesarias desde los SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

// Configuración de Firebase de tu proyecto
const firebaseConfig = {
  apiKey: "AIzaSyAvcgnGFTQfIvAnsNQ-OMPfTvCD2ihfjsI",
  authDomain: "click-and-conquer-tycoon.firebaseapp.com",
  projectId: "click-and-conquer-tycoon",
  storageBucket: "click-and-conquer-tycoon.firebasestorage.app",
  messagingSenderId: "800609694823",
  appId: "1:800609694823:web:79a8581b217bb6f31cd0c2",
  measurementId: "G-7MYX9Q60B8"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

// Exportar las instancias y funciones necesarias
export {
  auth,
  database,
  ref,
  set,
  get,
  child,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
};