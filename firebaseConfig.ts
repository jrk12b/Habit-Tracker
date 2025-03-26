import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "routinerocket.firebaseapp.com",
  projectId: "routinerocket",
  storageBucket: "routinerocket.appspot.com",
  messagingSenderId: "531068901519",
  appId: "1:531068901519:ios:50288561a826231179f8fa"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const register = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  return signOut(auth);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};