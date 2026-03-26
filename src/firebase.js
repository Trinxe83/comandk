// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

// TODO: REEMPLAZA ESTE OBJETO CON LA CONFIGURACIÓN DE TU PROYECTO FIREBASE
// Lo encontrarás en la Consola de Firebase -> Configuración del Proyecto -> General
const firebaseConfig = {
  apiKey: "AIzaSyDmPfpa7wXYeBgFDhNRgdSsxZnTtayLGgw",
  authDomain: "comandk.firebaseapp.com",
  projectId: "comandk",
  storageBucket: "comandk.firebasestorage.app",
  messagingSenderId: "401974005061",
  appId: "1:401974005061:web:449aa0b14ed51e0a12422c",
  measurementId: "G-BE0FZXFWHC"
};

let app, auth, provider;

// Inicializamos Firebase solo si has pegado tu configuración
if (firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
} else {
  console.warn("⚠️ FALTA CONFIGURACIÓN: Pega tu firebaseConfig en src/firebase.js para habilitar el Login.");
}

export { auth, provider, signInWithPopup, onAuthStateChanged, signOut };
