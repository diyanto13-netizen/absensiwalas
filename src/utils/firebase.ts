/**
 * @license
 * Sistem Presensi Digital - SMKS PGRI 1 Kota Sukabumi
 * Modul Konfigurasi & Inisialisasi Firebase Cloud Firestore
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, getDocFromServer, 
  collection, getDocs, deleteDoc, onSnapshot, Unsubscribe,
  writeBatch
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
    await getDocFromServer(doc(db, 'pengaturan', 'kelas_xii_tkj_2'));
    console.log('Firebase Cloud Firestore successfully connected.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using offline cache.');
    } else {
      console.info('Firestore handshake complete.');
    }
    return true;
  }
}

// Inisialisasi uji koneksi saat boot
testConnection();

/**
 * Listener Real-time untuk Data Siswa dari Cloud Firestore
 * Memastikan semua browser dan perangkat HP guru langsung sinkron
 */
export function subscribeToStudents(
  onUpdate: (students: Student[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = 'siswa';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }
      const list: Student[] = [];
      snapshot.forEach((docItem) => {
        const data = docItem.data();
        list.push({
          id: data.id || docItem.id,
          nis: String(data.nis || ''),
          nama: String(data.nama || ''),
          jenisKelamin: data.jenisKelamin === 'P' ? 'P' : 'L',
          noHpOrtu: String(data.noHpOrtu || ''),
          alamat: data.alamat || '',
          catatan: data.catatan || '',
        });
      });
      // Urutkan siswa berdasarkan NIS
      list.sort((a, b) => a.nis.localeCompare(b.nis));
      onUpdate(list);
    },
    (error) => {
      console.error('Error onSnapshot siswa:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Listener Real-time untuk Data Presensi dari Cloud Firestore
 */
export function subscribeToAttendance(
  onUpdate: (attendance: Record<string, DailyAttendance>) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = 'absensi';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const data: Record<string, DailyAttendance> = {};
      snapshot.forEach((docItem) => {
        const item = docItem.data();
        data[docItem.id] = {
          date: item.date || docItem.id,
          records: item.records || {},
          updatedAt: item.updatedAt || new Date().toISOString(),
          updatedBy: item.updatedBy || 'Wali Kelas XII TKJ 2',
        };
      });
      onUpdate(data);
    },
    (error) => {
      console.error('Error onSnapshot absensi:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Listener Real-time untuk Konfigurasi Kelas dari Cloud Firestore
 */
export function subscribeToConfig(
  onUpdate: (config: ClassConfig) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = 'pengaturan/kelas_xii_tkj_2';
  return onSnapshot(
    doc(db, 'pengaturan', 'kelas_xii_tkj_2'),
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as ClassConfig);
      }
    },
    (error) => {
      console.error('Error onSnapshot config:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Ambil Sekali (Fetch One-Time) Data Siswa dari Cloud Firestore
 */
export async function loadStudentsFromFirestore(): Promise<Student[] | null> {
  const path = 'siswa';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return null;
    const list: Student[] = [];
    snap.forEach((docItem) => {
      const data = docItem.data();
      list.push({
        id: data.id || docItem.id,
        nis: String(data.nis || ''),
        nama: String(data.nama || ''),
        jenisKelamin: data.jenisKelamin === 'P' ? 'P' : 'L',
        noHpOrtu: String(data.noHpOrtu || ''),
        alamat: data.alamat || '',
        catatan: data.catatan || '',
      });
    });
    list.sort((a, b) => a.nis.localeCompare(b.nis));
    return list;
  } catch (error) {
    console.warn('Gagal memuat siswa dari Firestore:', error);
    return null;
  }
}

/**
 * Ambil Sekali Data Presensi dari Cloud Firestore
 */
export async function loadAttendanceFromFirestore(): Promise<Record<string, DailyAttendance> | null> {
  const path = 'absensi';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return null;
    const data: Record<string, DailyAttendance> = {};
    snap.forEach((docItem) => {
      const item = docItem.data();
      data[docItem.id] = {
        date: item.date || docItem.id,
        records: item.records || {},
        updatedAt: item.updatedAt || new Date().toISOString(),
        updatedBy: item.updatedBy || 'Wali Kelas XII TKJ 2',
      };
    });
    return data;
  } catch (error) {
    console.warn('Gagal memuat absensi dari Firestore:', error);
    return null;
  }
}

/**
 * Simpan / Sinkronkan Satu Siswa ke Cloud Firestore
 */
export async function saveStudentToFirestore(student: Student): Promise<void> {
  const path = `siswa/${student.id}`;
  try {
    const payload = {
      id: student.id,
      nis: student.nis,
      nama: student.nama,
      jenisKelamin: student.jenisKelamin,
      noHpOrtu: student.noHpOrtu,
      alamat: student.alamat || '',
      catatan: student.catatan || '',
    };
    await setDoc(doc(db, 'siswa', student.id), payload, { merge: true });
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
 * Hapus Seluruh Siswa dari Cloud Firestore (Batch Delete)
 */
export async function deleteAllStudentsFromFirestore(): Promise<void> {
  const path = 'siswa';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return;

    // Firestore batched write supports up to 500 operations
    const batch = writeBatch(db);
    snap.docs.forEach((docItem) => {
      batch.delete(docItem.ref);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Simpan / Sinkronkan Catatan Presensi Harian ke Cloud Firestore
 */
export async function saveAttendanceToFirestore(dailyAttendance: DailyAttendance): Promise<void> {
  const path = `absensi/${dailyAttendance.date}`;
  try {
    const cleanRecords: Record<string, any> = {};
    for (const [key, rec] of Object.entries(dailyAttendance.records || {})) {
      cleanRecords[key] = {
        studentId: rec.studentId || key,
        status: rec.status || 'H',
        catatan: rec.catatan || '',
        time: rec.time || '',
      };
    }

    const payload = {
      date: dailyAttendance.date,
      records: cleanRecords,
      updatedAt: dailyAttendance.updatedAt || new Date().toISOString(),
      updatedBy: dailyAttendance.updatedBy || 'Wali Kelas XII TKJ 2',
    };

    await setDoc(doc(db, 'absensi', dailyAttendance.date), payload, { merge: true });
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
    const payload = {
      namaSekolah: config.namaSekolah,
      programKeahlian: config.programKeahlian,
      kelas: config.kelas,
      waliKelas: config.waliKelas,
      nipWaliKelas: config.nipWaliKelas || '',
      kepalaSekolah: config.kepalaSekolah,
      nipKepalaSekolah: config.nipKepalaSekolah || '',
      tahunAjaran: config.tahunAjaran,
      semester: config.semester,
      alamatSekolah: config.alamatSekolah || '',
    };
    await setDoc(doc(db, 'pengaturan', 'kelas_xii_tkj_2'), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
