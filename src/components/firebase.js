import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCVEZav3cowC4fYhzYyr6ZSxGqYIPxVVwE",
  authDomain: "fitness-tracker-50698.firebaseapp.com",
  projectId: "fitness-tracker-50698",
  storageBucket: "fitness-tracker-50698.firebasestorage.app",
  messagingSenderId: "75984258247",
  appId: "1:75984258247:web:610390c41c9c8556eaeae2",
  measurementId: "G-BCTFHJT6RP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and firestore for use throughout the app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;





// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';
// const firebaseConfig = {
//   apiKey: "AIzaSyCVEZav3cowC4fYhzYyr6ZSxGqYIPxVVwE",
//   authDomain: "fitness-tracker-50698.firebaseapp.com",
//   projectId: "fitness-tracker-50698",
//   storageBucket: "fitness-tracker-50698.firebasestorage.app",
//   messagingSenderId: "75984258247",
//   appId: "1:75984258247:web:610390c41c9c8556eaeae2",
//   measurementId: "G-BCTFHJT6RP"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Export auth and firestore for use throughout the app
// export const auth = getAuth(app);
// export const db = getFirestore(app);

// export default app;