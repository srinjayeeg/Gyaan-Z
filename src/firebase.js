import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCaXlEZbsAgatbTCordxKQirTPYrFYavEo",
    authDomain: "rag-tutor-88.firebaseapp.com",
    projectId: "rag-tutor-88",
    storageBucket: "rag-tutor-88.firebasestorage.app",
    messagingSenderId: "729988400600",
    appId: "1:729988400600:web:ae9d41705e2ff40474dead"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);