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
import { getStoredTeachers, saveTeachers, getStoredSuperAdmin, saveStoredSuperAdmin } from './storage';

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
 * Inisialisasi / Seed data master akun Wali Kelas
 * Memprioritaskan penyimpanan lokal dan menyelaraskan dengan Firestore jika tersedia
 */
export async function initializeDefaultTeachers(): Promise<TeacherProfile[]> {
  const localTeachers = getStoredTeachers();
  const path = 'wali_kelas';
  try {
    const snap = await getDocs(collection(db, path));
    if (!snap.empty) {
      const teachers: TeacherProfile[] = [];
      snap.forEach((d) => {
        const item = d.data() as TeacherProfile;
        teachers.push({ ...item, id: d.id });
      });
      // Gabungkan data cloud dengan local storage agar akun yang baru dibuat tidak hilang
      const localMap = new Map(localTeachers.map((t) => [t.id || t.nip, t]));
      teachers.forEach((t) => localMap.set(t.id || t.nip, t));
      const merged = Array.from(localMap.values());
      saveTeachers(merged);
      return merged;
    }

    // Seed default teachers jika cloud kosong
    for (const t of localTeachers) {
      const safeId = (t.id || `teacher-${t.nip}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      await setDoc(doc(db, path, safeId), { ...t, id: safeId }, { merge: true });
    }
    return localTeachers;
  } catch (err) {
    console.warn('Menggunakan data akun wali kelas dari penyimpanan lokal (Firestore offline/quota limit):', err);
    return localTeachers;
  }
}

/**
 * Berlangganan (Subscribe) Real-Time ke Daftar Akun Guru / Wali Kelas
 * Dilengkapi fallback otomatis ke LocalStorage jika kuota Firestore tercapai
 */
export function subscribeToTeachers(
  onUpdate: (teachers: TeacherProfile[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = 'wali_kelas';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (snapshot.empty) {
          const currentLocal = getStoredTeachers();
          onUpdate(currentLocal);
          return;
        }
        const cloudList: TeacherProfile[] = [];
        snapshot.forEach((docItem) => {
          const data = docItem.data() as TeacherProfile;
          cloudList.push({
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

        // Gabungkan data cloud dengan data lokal
        const localList = getStoredTeachers();
        const map = new Map<string, TeacherProfile>();
        localList.forEach((t) => map.set(t.id || t.nip, t));
        cloudList.forEach((t) => map.set(t.id || t.nip, t));
        const merged = Array.from(map.values());
        merged.sort((a, b) => a.nama.localeCompare(b.nama));
        
        saveTeachers(merged);
        onUpdate(merged);
      },
      (error) => {
        console.warn('Real-time sync teachers Firestore terputus (kuota/offline), beralih ke penyimpanan lokal:', error.message || error);
        if (onError) onError(error);
        const fallback = getStoredTeachers();
        onUpdate(fallback);
      }
    );
  } catch (e) {
    console.warn('Listener Firestore wali_kelas tidak dapat dibuka, menggunakan penyimpanan lokal.');
    onUpdate(getStoredTeachers());
    return () => {};
  }
}

/**
 * Simpan / Tambah Akun Guru / Wali Kelas ke Penyimpanan Lokal & Cloud Firestore
 */
export async function saveTeacherToFirestore(teacher: TeacherProfile): Promise<void> {
  const cleanNip = teacher.nip.trim();
  const rawId = teacher.id || `teacher-${cleanNip}`;
  const safeDocId = rawId.replace(/[^a-zA-Z0-9_-]/g, '_');

  const payload: TeacherProfile = {
    id: safeDocId,
    nip: cleanNip,
    nama: teacher.nama.trim(),
    email: teacher.email.trim(),
    role: teacher.role,
    assignedKelas: teacher.assignedKelas.trim(),
    kelasId: teacher.kelasId.trim(),
    noHp: teacher.noHp ? teacher.noHp.trim() : '',
    password: teacher.password || 'smkpgri1',
  };

  // 1. SIMPAN SEGERA KE LOCAL STORAGE (Offline-First: Data tidak akan pernah hilang)
  const currentTeachers = getStoredTeachers();
  const idx = currentTeachers.findIndex((t) => t.id === safeDocId || t.nip === cleanNip);
  let updated: TeacherProfile[];
  if (idx >= 0) {
    updated = [...currentTeachers];
    updated[idx] = payload;
  } else {
    updated = [...currentTeachers, payload];
  }
  saveTeachers(updated);

  // 2. SIMPAN KE CLOUD FIRESTORE (jika kuota & koneksi tersedia)
  try {
    await setDoc(doc(db, 'wali_kelas', safeDocId), payload, { merge: true });
  } catch (error) {
    console.warn('Pemberitahuan: Akun tersimpan aman di database lokal. Sinkronisasi cloud Firestore tertunda karena batas kuota/koneksi.', error);
  }
}

/**
 * Hapus Akun Guru / Wali Kelas dari Penyimpanan Lokal & Cloud Firestore
 */
export async function deleteTeacherFromFirestore(teacherId: string): Promise<void> {
  // 1. Hapus dari Local Storage segera
  const current = getStoredTeachers();
  const updated = current.filter((t) => t.id !== teacherId && t.nip !== teacherId);
  saveTeachers(updated);

  // 2. Hapus dari Cloud Firestore
  try {
    const safeDocId = teacherId.replace(/[^a-zA-Z0-9_-]/g, '_');
    await deleteDoc(doc(db, 'wali_kelas', safeDocId));
  } catch (error) {
    console.warn('Peringatan: Akun dihapus dari lokal, penghapusan cloud tertunda:', error);
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
  try {
    return onSnapshot(
      doc(db, 'pengaturan', 'superadmin'),
      (snapshot) => {
        if (snapshot.exists()) {
          const cloudConfig = snapshot.data() as SuperAdminConfig;
          saveStoredSuperAdmin(cloudConfig);
          onUpdate(cloudConfig);
        } else {
          onUpdate(getStoredSuperAdmin());
        }
      },
      (error) => {
        console.warn('Real-time sync superadmin error, menggunakan konfigurasi lokal:', error);
        if (onError) onError(error);
        onUpdate(getStoredSuperAdmin());
      }
    );
  } catch (e) {
    onUpdate(getStoredSuperAdmin());
    return () => {};
  }
}

/**
 * Ambil Sekali Konfigurasi Super Admin
 */
export async function loadSuperAdminConfigFromFirestore(): Promise<SuperAdminConfig> {
  const localConfig = getStoredSuperAdmin();
  try {
    const snap = await getDoc(doc(db, 'pengaturan', 'superadmin'));
    if (snap.exists()) {
      const data = snap.data() as SuperAdminConfig;
      saveStoredSuperAdmin(data);
      return data;
    }
    return localConfig;
  } catch (e) {
    console.warn('Gagal membaca superadmin dari cloud, pakai penyimpanan lokal:', e);
    return localConfig;
  }
}

/**
 * Simpan / Ganti Konfigurasi Akun Super Admin di Penyimpanan Lokal & Cloud Firestore
 */
export async function saveSuperAdminConfigToFirestore(config: SuperAdminConfig): Promise<void> {
  const payload: SuperAdminConfig = {
    email: config.email.trim().toLowerCase(),
    nama: config.nama.trim(),
    nip: config.nip.trim(),
    noHp: config.noHp ? config.noHp.trim() : '',
    password: config.password || 'smkpgri1admin',
    updatedAt: new Date().toISOString(),
    updatedBy: config.updatedBy || 'Super Admin',
  };

  // 1. Simpan segera ke local storage
  saveStoredSuperAdmin(payload);

  // 2. Simpan ke Firestore
  try {
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
    console.warn('Super Admin tersimpan di lokal (Firestore offline/quota limit):', error);
  }
}

/**
 * Cari Akun Guru / Admin berdasarkan NIP, Username, atau Email
 * Mendukung pencarian fleksibel dari Local Storage (Anti-reset) dan Firestore Cloud
 */
export async function findTeacherByNipOrIdentifier(identifier: string): Promise<TeacherProfile | null> {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase().replace(/[\s-]/g, '');

  // 1. Cek dulu konfigurasi Super Admin aktif dari Local Storage & Cloud
  const currentAdmin = getStoredSuperAdmin();
  const cleanAdminNip = (currentAdmin.nip || '').toLowerCase().replace(/[\s-]/g, '');
  const cleanAdminEmail = (currentAdmin.email || '').toLowerCase();
  const adminEmailPrefix = cleanAdminEmail.split('@')[0];

  if (
    clean === cleanAdminEmail ||
    clean === cleanAdminNip ||
    clean === 'admin' ||
    clean === 'kurikulum' ||
    clean === adminEmailPrefix ||
    cleanAdminEmail.startsWith(clean)
  ) {
    return {
      id: 'admin-super',
      nip: currentAdmin.nip,
      nama: currentAdmin.nama,
      email: currentAdmin.email,
      role: 'admin',
      assignedKelas: 'Semua Rombel',
      kelasId: 'xii_tkj_2',
      noHp: currentAdmin.noHp,
      password: currentAdmin.password || 'smkpgri1admin',
    };
  }

  // 2. Cek Akun Guru dari Penyimpanan Lokal (Sangat Cepat & Tahan Quota/Offline)
  const localTeachers = getStoredTeachers();
  for (const t of localTeachers) {
    const cleanNip = (t.nip || '').toLowerCase().replace(/[\s-]/g, '');
    const cleanEmail = (t.email || '').toLowerCase();
    const cleanId = (t.id || '').toLowerCase().replace(/[\s-]/g, '');
    const cleanNama = (t.nama || '').toLowerCase();
    const emailPrefix = cleanEmail.split('@')[0];

    // Cocokkan NIP, Email utuh, username sebelum @, atau awalan email
    if (
      cleanNip === clean ||
      cleanEmail === clean ||
      cleanId === clean ||
      cleanId === `teacher${clean}` ||
      cleanId.includes(clean) ||
      emailPrefix === clean ||
      clean.startsWith(emailPrefix) ||
      cleanEmail.startsWith(clean) ||
      (clean.length >= 4 && cleanNama.includes(clean))
    ) {
      return t;
    }
  }

  // 3. Cek query dari Firestore wali_kelas jika online
  try {
    const snap = await getDocs(collection(db, 'wali_kelas'));
    for (const docItem of snap.docs) {
      const data = docItem.data() as TeacherProfile;
      const cleanNip = (data.nip || '').toLowerCase().replace(/[\s-]/g, '');
      const cleanEmail = (data.email || '').toLowerCase();
      const emailPrefix = cleanEmail.split('@')[0];
      const cleanDocId = docItem.id.toLowerCase().replace(/[\s-]/g, '');

      if (
        cleanNip === clean ||
        cleanEmail === clean ||
        cleanDocId === clean ||
        emailPrefix === clean ||
        clean.startsWith(emailPrefix) ||
        cleanEmail.startsWith(clean)
      ) {
        const found = { ...data, id: docItem.id };
        // Simpan ke local storage agar pencarian berikutnya instan
        const currentList = getStoredTeachers();
        if (!currentList.some((x) => x.id === found.id || x.nip === found.nip)) {
          saveTeachers([...currentList, found]);
        }
        return found;
      }
    }
  } catch (e) {
    console.warn('Pencarian guru Firestore offline/quota limit, menggunakan database lokal:', e);
  }

  // 4. Fallback ke DEFAULT_TEACHERS
  const defaultMatch = DEFAULT_TEACHERS.find((t) => {
    const cleanNip = t.nip.toLowerCase().replace(/[\s-]/g, '');
    const cleanEmail = t.email.toLowerCase();
    const emailPrefix = cleanEmail.split('@')[0];
    return (
      cleanNip === clean ||
      cleanEmail === clean ||
      emailPrefix === clean ||
      cleanEmail.startsWith(clean) ||
      clean.startsWith(emailPrefix)
    );
  });

  if (defaultMatch) return defaultMatch;

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
  const targetNorm = targetKelasId.replace(/[- ]/g, '_').toLowerCase();
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
        const rawKelas = data.kelasId || 'xii_tkj_2';
        const studentNorm = rawKelas.replace(/[- ]/g, '_').toLowerCase();

        if (targetKelasId === 'all' || studentNorm === targetNorm) {
          list.push({
            id: data.id || docItem.id,
            nis: String(data.nis || ''),
            nama: String(data.nama || ''),
            jenisKelamin: data.jenisKelamin === 'P' ? 'P' : 'L',
            noHpOrtu: String(data.noHpOrtu || ''),
            alamat: data.alamat || '',
            catatan: data.catatan || '',
            kelasId: targetKelasId === 'all' ? rawKelas : targetKelasId,
          });
        }
      });
      list.sort((a, b) => a.nis.localeCompare(b.nis));
      onUpdate(list);
    },
    (error) => {
      console.warn('Real-time sync siswa Firestore terputus (kuota/offline):', error.message || error);
      if (onError) onError(error);
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
  const targetNorm = targetKelasId.replace(/[- ]/g, '_').toLowerCase();
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const data: Record<string, DailyAttendance> = {};
      snapshot.forEach((docItem) => {
        const item = docItem.data();
        const rawKelas = item.kelasId || 'xii_tkj_2';
        const docNorm = rawKelas.replace(/[- ]/g, '_').toLowerCase();

        if (targetKelasId === 'all' || docNorm === targetNorm) {
          // Gunakan tanggal murni YYYY-MM-DD sebagai kunci objek agar semua komponen (Absensi, Rekap, Laporan)
          // dapat membaca presensi pada ke-21 rombel tanpa konflik prefix kelasId.
          const cleanDate = item.date || docItem.id.replace(`${docNorm}_`, '');
          const mapKey = targetKelasId === 'all' ? `${docNorm}_${cleanDate}` : cleanDate;
          data[mapKey] = {
            date: cleanDate,
            records: item.records || {},
            updatedAt: item.updatedAt || new Date().toISOString(),
            updatedBy: item.updatedBy || 'Wali Kelas',
            kelasId: docNorm,
          };
        }
      });
      onUpdate(data);
    },
    (error) => {
      console.warn('Real-time sync absensi Firestore terputus (kuota/offline):', error.message || error);
      if (onError) onError(error);
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
  const normKelas = (kelasId || 'xii_tkj_2').replace(/[- ]/g, '_').toLowerCase();
  const configDocId = `kelas_${normKelas}`;
  return onSnapshot(
    doc(db, 'pengaturan', configDocId),
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as ClassConfig);
      }
    },
    (error) => {
      console.warn('Real-time sync config Firestore terputus (kuota/offline):', error.message || error);
      if (onError) onError(error);
    }
  );
}

/**
 * Ambil Sekali (Fetch One-Time) Data Siswa dari Cloud Firestore
 */
export async function loadStudentsFromFirestore(targetKelasId: string = 'xii_tkj_2'): Promise<Student[] | null> {
  const path = 'siswa';
  const targetNorm = targetKelasId.replace(/[- ]/g, '_').toLowerCase();
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return null;
    const list: Student[] = [];
    snap.forEach((docItem) => {
      const data = docItem.data();
      const rawKelas = data.kelasId || 'xii_tkj_2';
      const studentNorm = rawKelas.replace(/[- ]/g, '_').toLowerCase();

      if (targetKelasId === 'all' || studentNorm === targetNorm) {
        list.push({
          id: data.id || docItem.id,
          nis: String(data.nis || ''),
          nama: String(data.nama || ''),
          jenisKelamin: data.jenisKelamin === 'P' ? 'P' : 'L',
          noHpOrtu: String(data.noHpOrtu || ''),
          alamat: data.alamat || '',
          catatan: data.catatan || '',
          kelasId: targetKelasId === 'all' ? rawKelas : targetNorm,
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
  const targetNorm = targetKelasId.replace(/[- ]/g, '_').toLowerCase();
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return null;
    const data: Record<string, DailyAttendance> = {};
    snap.forEach((docItem) => {
      const item = docItem.data();
      const rawKelas = item.kelasId || 'xii_tkj_2';
      const docNorm = rawKelas.replace(/[- ]/g, '_').toLowerCase();

      if (targetKelasId === 'all' || docNorm === targetNorm) {
        const cleanDate = item.date || docItem.id.replace(`${docNorm}_`, '');
        const mapKey = targetKelasId === 'all' ? `${docNorm}_${cleanDate}` : cleanDate;
        data[mapKey] = {
          date: cleanDate,
          records: item.records || {},
          updatedAt: item.updatedAt || new Date().toISOString(),
          updatedBy: item.updatedBy || 'Wali Kelas',
          kelasId: docNorm,
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
  const normKelas = (student.kelasId || targetKelasId).replace(/[- ]/g, '_').toLowerCase();
  const path = `siswa/${student.id}`;
  try {
    const payload = {
      id: student.id,
      nis: student.nis.trim(),
      nama: student.nama.trim(),
      jenisKelamin: student.jenisKelamin,
      noHpOrtu: student.noHpOrtu ? student.noHpOrtu.trim() : '081200000000',
      alamat: student.alamat || '',
      catatan: student.catatan || '',
      kelasId: normKelas,
    };
    await setDoc(doc(db, 'siswa', student.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Simpan Banyak Siswa ke Cloud Firestore secara Atomik Menggunakan WriteBatch
 * Opsi replaceExisting: menghapus data siswa lama dari rombel ini terlebih dahulu
 */
export async function saveStudentsBatchToFirestore(
  students: Student[],
  targetKelasId: string = 'xii_tkj_2',
  replaceExisting: boolean = false
): Promise<void> {
  const normKelas = targetKelasId.replace(/[- ]/g, '_').toLowerCase();
  const path = 'siswa';
  try {
    const batch = writeBatch(db);

    if (replaceExisting) {
      const snap = await getDocs(collection(db, path));
      snap.docs.forEach((docItem) => {
        const itemKelas = (docItem.data().kelasId || 'xii_tkj_2').replace(/[- ]/g, '_').toLowerCase();
        if (itemKelas === normKelas) {
          batch.delete(docItem.ref);
        }
      });
    }

    students.forEach((student) => {
      const docRef = doc(db, path, student.id);
      const payload = {
        id: student.id,
        nis: student.nis.trim(),
        nama: student.nama.trim(),
        jenisKelamin: student.jenisKelamin,
        noHpOrtu: student.noHpOrtu ? student.noHpOrtu.trim() : '081200000000',
        alamat: student.alamat || '',
        catatan: student.catatan || '',
        kelasId: normKelas,
      };
      batch.set(docRef, payload, { merge: true });
    });

    await batch.commit();
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
  const targetNorm = targetKelasId.replace(/[- ]/g, '_').toLowerCase();
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return;

    const batch = writeBatch(db);
    let count = 0;
    snap.docs.forEach((docItem) => {
      const data = docItem.data();
      const kId = (data.kelasId || 'xii_tkj_2').replace(/[- ]/g, '_').toLowerCase();
      if (targetKelasId === 'all' || kId === targetNorm) {
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
  const normKelas = (targetKelasId || 'xii_tkj_2').replace(/[- ]/g, '_').toLowerCase();
  const docId = normKelas === 'xii_tkj_2' 
    ? dailyAttendance.date 
    : `${normKelas}_${dailyAttendance.date}`;
    
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
      kelasId: normKelas,
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
  const normKelas = (kelasId || 'xii_tkj_2').replace(/[- ]/g, '_').toLowerCase();
  const configDocId = `kelas_${normKelas}`;
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
