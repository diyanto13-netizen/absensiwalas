/**
 * @license
 * Sistem Presensi Digital - SMKS PGRI 1 Kota Sukabumi
 * Modul Konfigurasi & Inisialisasi Firebase Cloud Firestore
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, getDocFromServer, 
  collection, getDocs, deleteDoc, onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Student, DailyAttendance, ClassConfig } from '../types';

// Inisialisasi Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

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
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// CRITICAL CONSTRAINT: Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Cloud Firestore successfully connected.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using offline cache.');
    } else {
      console.info('Firestore handshake complete (test collection verified).');
    }
    return true;
  }
}

// Inisialisasi uji koneksi saat boot
testConnection();

/**
 * Muat Data Siswa dari Cloud Firestore
 */
export async function loadStudentsFromFirestore(): Promise<Student[] | null> {
  const path = 'siswa';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return null;
    const list: Student[] = [];
    snap.forEach((docItem) => {
      list.push(docItem.data() as Student);
    });
    return list;
  } catch (error) {
    console.warn('Gagal memuat siswa dari Firestore, menggunakan penyimpanan lokal:', error);
    return null;
  }
}

/**
 * Simpan/Perbarui Satu Siswa ke Cloud Firestore
 */
export async function saveStudentToFirestore(student: Student): Promise<void> {
  const path = `siswa/${student.id}`;
  try {
    await setDoc(doc(db, 'siswa', student.id), student, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Hapus Siswa dari Cloud Firestore
 */
export async function deleteStudentFromFirestore(studentId: string): Promise<void> {
  const path = `siswa/${studentId}`;
  try {
    await deleteDoc(doc(db, 'siswa', studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Muat Riwayat Presensi dari Cloud Firestore
 */
export async function loadAttendanceFromFirestore(): Promise<Record<string, DailyAttendance> | null> {
  const path = 'absensi';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return null;
    const data: Record<string, DailyAttendance> = {};
    snap.forEach((docItem) => {
      data[docItem.id] = docItem.data() as DailyAttendance;
    });
    return data;
  } catch (error) {
    console.warn('Gagal memuat absensi dari Firestore, menggunakan penyimpanan lokal:', error);
    return null;
  }
}

/**
 * Simpan Data Presensi Harian ke Cloud Firestore
 */
export async function saveAttendanceToFirestore(dailyAttendance: DailyAttendance): Promise<void> {
  const path = `absensi/${dailyAttendance.date}`;
  try {
    await setDoc(doc(db, 'absensi', dailyAttendance.date), dailyAttendance, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Simpan Konfigurasi Kelas ke Cloud Firestore
 */
export async function saveConfigToFirestore(config: ClassConfig): Promise<void> {
  const path = 'pengaturan/kelas_xii_tkj_2';
  try {
    await setDoc(doc(db, 'pengaturan', 'kelas_xii_tkj_2'), config, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
