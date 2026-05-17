import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = 'ar';
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export type JobCategory = 'military' | 'remote' | 'company' | 'government' | 'university' | 'training' | 'employment_training';
export type JobStatus = 'active' | 'soon' | 'expiring' | 'expired';

export interface Job {
  id: string;
  title: string;
  description: string;
  company?: string;
  category: JobCategory;
  location?: string;
  image?: string;
  createdAt: Timestamp;
  externalLink?: string;
  status: JobStatus;
}

export interface Ad {
  id: string;
  title: string;
  image: string;
  link?: string;
  position: 'home_hero' | 'sidebar' | 'job_detail';
  createdAt: Timestamp;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
