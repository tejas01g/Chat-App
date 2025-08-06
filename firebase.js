// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyCX91KlBwAuE5pKuUjqsnww1eP1P5I22mo',
  // authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'chatapp-6bab5',
  // storageBucket: 'YOUR_STORAGE_BUCKET',
  // messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: '1:276314288872:android:7aa21abe1c7d689313cf5d',
};

export const app = initializeApp(firebaseConfig);