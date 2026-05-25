import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAhQmQucj8embP72boYhwcD_BBor-MHFwk",
  authDomain: "treinamentolgpd-37780.firebaseapp.com",
  projectId: "treinamentolgpd-37780",
  storageBucket: "treinamentolgpd-37780.firebasestorage.app",
  messagingSenderId: "778170312539",
  appId: "1:778170312539:web:50a962fb5d248ac6455c7e",
  measurementId: "G-4PP3ZNKSHZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
