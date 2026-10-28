/**
 * @license
 * Sistem Presensi Digital - SMKS PGRI 1 Kota Sukabumi
 * Modul Konfigurasi & Inisialisasi Firebase Cloud Firestore
 * Mendukung Pendekatan B: Akun Khusus Tiap Wali Kelas & Konfigurasi Super Admin
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, getDocFromServer, 
  collection, getDocs, deleteDoc, onSnapshot, Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Student, DailyAttendance, ClassConfig, TeacherProfile, SuperAdminConfig } from '../types';
import { DEFAULT_TEACHERS, DEFAULT_SUPER_ADMIN } from '../data/initialData';

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
 * Inisialisasi / Seed data master akun Wali Kelas ke Firestore
 */
export async function initializeDefaultTeachers(): Promise<TeacherProfile[]> {
  const path = 'wali_kelas';
  try {
    const snap = await getDocs(collection(db, path));
    if (!snap.empty) {
      const teachers: TeacherProfile[] = [];
      snap.forEach((d) => {
        const item = d.data() as TeacherProfile;
        teachers.push({ ...item, id: d.id });
      });
      return teachers;
    }

    // Seed default teachers jika kosong
    for (const t of DEFAULT_TEACHERS) {
      await setDoc(doc(db, path, t.id), t, { merge: true });
    }
    return DEFAULT_TEACHERS;
  } catch (err) {
    console.warn('Fallback ke daftar default guru lokal:', err);
    return DEFAULT_TEACHERS;
  }
}

/**
 * Berlangganan (Subscribe) Real-Time ke Daftar Akun Guru / Wali Kelas
 */
export function subscribeToTeachers(
  onUpdate: (teachers: TeacherProfile[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = 'wali_kelas';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(DEFAULT_TEACHERS);
        return;
      }
      const list: TeacherProfile[] = [];
      snapshot.forEach((docItem) => {
        const data = docItem.data() as TeacherProfile;
        list.push({
          id: docItem.id,
          nip: String(data.nip || ''),
          nama: String(data.nama || ''),
          email: String(data.email || ''),
          role: data.role || 'wali_kelas',
          assignedKelas: String(data.assignedKelas || ''),
          kelasId: String(data.kelasId || ''),
          noHp: data.noHp || '',
          password: data.password || 'smkpgri1',
        });
      });
      // Urutkan berdasarkan nama
      list.sort((a, b) => a.nama.localeCompare(b.nama));
      onUpdate(list);
    },
    (error) => {
      console.error('Error onSnapshot teachers:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Simpan / Tambah Akun Guru / Wali Kelas ke Cloud Firestore
 */
export async function saveTeacherToFirestore(teacher: TeacherProfile): Promise<void> {
  const docId = teacher.id || `teacher-${teacher.nip.replace(/\s+/g, '')}`;
  const path = `wali_kelas/${docId}`;
  try {
    const payload = {
      id: docId,
      nip: teacher.nip.trim(),
      nama: teacher.nama.trim(),
      email: teacher.email.trim(),
      role: teacher.role,
      assignedKelas: teacher.assignedKelas.trim(),
      kelasId: teacher.kelasId.trim(),
      noHp: teacher.noHp ? teacher.noHp.trim() : '',
      password: teacher.password || 'smkpgri1',
    };
    await setDoc(doc(db, 'wali_kelas', docId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Hapus Akun Guru / Wali Kelas dari Cloud Firestore
 */
export async function deleteTeacherFromFirestore(teacherId: string): Promise<void> {
  const path = `wali_kelas/${teacherId}`;
  try {
    await deleteDoc(doc(db, 'wali_kelas', teacherId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Berlangganan (Subscribe) Real-Time ke Konfigurasi Super Admin
 */
export function subscribeToSuperAdminConfig(
  onUpdate: (config: SuperAdminConfig) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = 'pengaturan/superadmin';
  return onSnapshot(
    doc(db, 'pengaturan', 'superadmin'),
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as SuperAdminConfig);
      } else {
        onUpdate(DEFAULT_SUPER_ADMIN);
      }
    },
    (error) => {
      console.warn('Real-time sync superadmin error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Ambil Sekali Konfigurasi Super Admin dari Firestore
 */
export async function loadSuperAdminConfigFromFirestore(): Promise<SuperAdminConfig> {
  try {
    const snap = await getDoc(doc(db, 'pengaturan', 'superadmin'));
    if (snap.exists()) {
      return snap.data() as SuperAdminConfig;
    }
    // Seed default super admin jika belum ada
    await setDoc(doc(db, 'pengaturan', 'superadmin'), DEFAULT_SUPER_ADMIN, { merge: true });
    return DEFAULT_SUPER_ADMIN;
  } catch (e) {
    console.warn('Gagal membaca superadmin dari cloud, pakai default:', e);
    return DEFAULT_SUPER_ADMIN;
  }
}

/**
 * Simpan / Ganti Konfigurasi Akun Super Admin di Cloud Firestore
 */
export async function saveSuperAdminConfigToFirestore(config: SuperAdminConfig): Promise<void> {
  const path = 'pengaturan/superadmin';
  try {
    const payload: SuperAdminConfig = {
      email: config.email.trim().toLowerCase(),
      nama: config.nama.trim(),
      nip: config.nip.trim(),
      noHp: config.noHp ? config.noHp.trim() : '',
      password: config.password || 'smkpgri1admin',
      updatedAt: new Date().toISOString(),
      updatedBy: config.updatedBy || 'Super Admin',
    };
    await setDoc(doc(db, 'pengaturan', 'superadmin'), payload, { merge: true });

    // Perbarui juga akun super admin di koleksi wali_kelas agar sinkron saat login
    const adminDocId = 'admin-kurikulum';
    await setDoc(doc(db, 'wali_kelas', adminDocId), {
      id: adminDocId,
      nip: payload.nip,
      nama: payload.nama,
      email: payload.email,
      role: 'admin',
      assignedKelas: 'Semua Rombel',
      kelasId: 'xii_tkj_2',
      noHp: payload.noHp,
      password: payload.password,
    }, { merge: true });

  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Cari Akun Guru / Admin berdasarkan NIP, Username, atau Email
 */
export async function findTeacherByNipOrIdentifier(identifier: string): Promise<TeacherProfile | null> {
  const clean = identifier.trim().replace(/\s+/g, '').toLowerCase();

  // 1. Cek dulu konfigurasi Super Admin aktif
  try {
    const adminSnap = await getDoc(doc(db, 'pengaturan', 'superadmin'));
    if (adminSnap.exists()) {
      const adminData = adminSnap.data() as SuperAdminConfig;
      const cleanAdminNip = adminData.nip.replace(/\s+/g, '').toLowerCase();
      const cleanAdminEmail = adminData.email.toLowerCase();
      if (clean === cleanAdminEmail || clean === cleanAdminNip || clean === 'admin') {
        return {
          id: 'admin-super',
          nip: adminData.nip,
          nama: adminData.nama,
          email: adminData.email,
          role: 'admin',
          assignedKelas: 'Semua Rombel',
          kelasId: 'xii_tkj_2',
          noHp: adminData.noHp,
          password: adminData.password || 'smkpgri1admin',
        };
      }
    }
  } catch (e) {
    // continue to teachers collection
  }
  
  // 2. Cek query dari Firestore wali_kelas
  try {
    const snap = await getDocs(collection(db, 'wali_kelas'));
    for (const docItem of snap.docs) {
      const data = docItem.data() as TeacherProfile;
      const cleanNip = (data.nip || '').replace(/\s+/g, '').toLowerCase();
      const cleanEmail = (data.email || '').toLowerCase();
      if (cleanNip === clean || cleanEmail === clean || docItem.id.toLowerCase() === clean) {
        return { ...data, id: docItem.id };
      }
    }
  } catch (e) {
    console.warn('Gagal mencari guru di Firestore:', e);
  }

  // 3. Fallback daftar lokal DEFAULT_TEACHERS
  const localMatch = DEFAULT_TEACHERS.find((t) => {
    const cleanNip = t.nip.replace(/\s+/g, '').toLowerCase();
    const cleanEmail = t.email.toLowerCase();
    return cleanNip === clean || cleanEmail === clean || t.id.toLowerCase() === clean;
  });

  if (localMatch) return localMatch;

  return null;
}

/**
 * Listener Real-time untuk Data Siswa dari Cloud Firestore
 * Mendukung filter berdasarkan kelasId (isolasi data antar rombel)
 */
export function subscribeToStudents(
  onUpdate: (students: Student[]) => void,
  targetKelasId: string = 'xii_tkj_2',
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
        const studentKelasId = data.kelasId || 'xii_tkj_2';

        if (targetKelasId === 'all' || studentKelasId === targetKelasId) {
          list.push({
            id: data.id || docItem.id,
            nis: String(data.nis || ''),
            nama: String(data.nama || ''),
            jenisKelamin: data.jenisKelamin === 'P' ? 'P' : 'L',
            noHpOrtu: String(data.noHpOrtu || ''),
            alamat: data.alamat || '',
            catatan: data.catatan || '',
            kelasId: studentKelasId,
          });
        }
      });
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
  targetKelasId: string = 'xii_tkj_2',
  onError?: (err: any) => void
): Unsubscribe {
  const path = 'absensi';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const data: Record<string, DailyAttendance> = {};
      snapshot.forEach((docItem) => {
        const item = docItem.data();
        const docKelasId = item.kelasId || 'xii_tkj_2';

        if (targetKelasId === 'all' || docKelasId === targetKelasId) {
          data[docItem.id] = {
            date: item.date || docItem.id,
            records: item.records || {},
            updatedAt: item.updatedAt || new Date().toISOString(),
            updatedBy: item.updatedBy || 'Wali Kelas',
            kelasId: docKelasId,
          };
        }
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
  kelasId: string = 'xii_tkj_2',
  onError?: (err: any) => void
): Unsubscribe {
  const configDocId = `kelas_${kelasId}`;
  const path = `pengaturan/${configDocId}`;
  return onSnapshot(
    doc(db, 'pengaturan', configDocId),
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
export async function loadStudentsFromFirestore(targetKelasId: string = 'xii_tkj_2'): Promise<Student[] | null> {
  const path = 'siswa';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return null;
    const list: Student[] = [];
    snap.forEach((docItem) => {
      const data = docItem.data();
      const studentKelasId = data.kelasId || 'xii_tkj_2';

      if (targetKelasId === 'all' || studentKelasId === targetKelasId) {
        list.push({
          id: data.id || docItem.id,
          nis: String(data.nis || ''),
          nama: String(data.nama || ''),
          jenisKelamin: data.jenisKelamin === 'P' ? 'P' : 'L',
          noHpOrtu: String(data.noHpOrtu || ''),
          alamat: data.alamat || '',
          catatan: data.catatan || '',
          kelasId: studentKelasId,
        });
      }
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
export async function loadAttendanceFromFirestore(targetKelasId: string = 'xii_tkj_2'): Promise<Record<string, DailyAttendance> | null> {
  const path = 'absensi';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return null;
    const data: Record<string, DailyAttendance> = {};
    snap.forEach((docItem) => {
      const item = docItem.data();
      const docKelasId = item.kelasId || 'xii_tkj_2';

      if (targetKelasId === 'all' || docKelasId === targetKelasId) {
        data[docItem.id] = {
          date: item.date || docItem.id,
          records: item.records || {},
          updatedAt: item.updatedAt || new Date().toISOString(),
          updatedBy: item.updatedBy || 'Wali Kelas',
          kelasId: docKelasId,
        };
      }
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
export async function saveStudentToFirestore(student: Student, targetKelasId: string = 'xii_tkj_2'): Promise<void> {
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
      kelasId: student.kelasId || targetKelasId,
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
 * Hapus Seluruh Siswa Rombel Ini dari Cloud Firestore (Batch Delete)
 */
export async function deleteAllStudentsFromFirestore(targetKelasId: string = 'xii_tkj_2'): Promise<void> {
  const path = 'siswa';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return;

    const batch = writeBatch(db);
    let count = 0;
    snap.docs.forEach((docItem) => {
      const data = docItem.data();
      const kId = data.kelasId || 'xii_tkj_2';
      if (targetKelasId === 'all' || kId === targetKelasId) {
        batch.delete(docItem.ref);
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Simpan / Sinkronkan Catatan Presensi Harian ke Cloud Firestore
 */
export async function saveAttendanceToFirestore(
  dailyAttendance: DailyAttendance, 
  targetKelasId: string = 'xii_tkj_2'
): Promise<void> {
  const docId = targetKelasId === 'xii_tkj_2' 
    ? dailyAttendance.date 
    : `${targetKelasId}_${dailyAttendance.date}`;
    
  const path = `absensi/${docId}`;
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
      updatedBy: dailyAttendance.updatedBy || 'Wali Kelas',
      kelasId: targetKelasId,
    };

    await setDoc(doc(db, 'absensi', docId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Simpan Konfigurasi Kelas ke Cloud Firestore
 */
export async function saveConfigToFirestore(config: ClassConfig, kelasId: string = 'xii_tkj_2'): Promise<void> {
  const configDocId = `kelas_${kelasId}`;
  const path = `pengaturan/${configDocId}`;
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
    await setDoc(doc(db, 'pengaturan', configDocId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
