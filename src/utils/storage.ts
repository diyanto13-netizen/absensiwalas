import { Student, DailyAttendance, ClassConfig, FirebaseConfigState, AuthUser } from '../types';
import { INITIAL_STUDENTS, INITIAL_CLASS_CONFIG, generateInitialAttendanceData } from '../data/initialData';

const KEYS = {
  STUDENTS: 'smk_pgri1_presensi_students_v1',
  ATTENDANCE: 'smk_pgri1_presensi_attendance_v1',
  CONFIG: 'smk_pgri1_presensi_config_v1',
  FIREBASE: 'smk_pgri1_presensi_firebase_v1',
  AUTH: 'smk_pgri1_presensi_auth_v2', // v2 for Pendekatan B role-based
};

export const getStoredStudents = (kelasId: string = 'xii_tkj_2'): Student[] => {
  const normKelas = (kelasId || 'xii_tkj_2').replace(/[- ]/g, '_').toLowerCase();
  try {
    const raw = localStorage.getItem(`${KEYS.STUDENTS}_${normKelas}`);
    if (!raw) {
      // Jika XII TKJ 2, gunakan data awal siswa
      if (normKelas === 'xii_tkj_2') {
        const legacyRaw = localStorage.getItem('smk_pgri1_presensi_students_v1');
        if (legacyRaw) {
          return JSON.parse(legacyRaw);
        }
        saveStudents(INITIAL_STUDENTS, normKelas);
        return INITIAL_STUDENTS;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading students from storage', e);
    return normKelas === 'xii_tkj_2' ? INITIAL_STUDENTS : [];
  }
};

export const saveStudents = (students: Student[], kelasId: string = 'xii_tkj_2'): void => {
  const normKelas = (kelasId || 'xii_tkj_2').replace(/[- ]/g, '_').toLowerCase();
  try {
    localStorage.setItem(`${KEYS.STUDENTS}_${normKelas}`, JSON.stringify(students));
    // Simpan juga ke key legacy untuk kompatibilitas jika xii_tkj_2
    if (normKelas === 'xii_tkj_2') {
      localStorage.setItem('smk_pgri1_presensi_students_v1', JSON.stringify(students));
    }
  } catch (e) {
    console.error('Error saving students to storage', e);
  }
};

export const getStoredAttendance = (kelasId: string = 'xii_tkj_2'): Record<string, DailyAttendance> => {
  const normKelas = (kelasId || 'xii_tkj_2').replace(/[- ]/g, '_').toLowerCase();
  try {
    const raw = localStorage.getItem(`${KEYS.ATTENDANCE}_${normKelas}`);
    if (!raw) {
      if (normKelas === 'xii_tkj_2') {
        const legacyRaw = localStorage.getItem('smk_pgri1_presensi_attendance_v1');
        if (legacyRaw) {
          return JSON.parse(legacyRaw);
        }
        const students = getStoredStudents(normKelas);
        const initial = generateInitialAttendanceData(students);
        saveAttendanceData(initial, normKelas);
        return initial;
      }
      return {};
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading attendance from storage', e);
    return {};
  }
};

export const saveAttendanceData = (data: Record<string, DailyAttendance>, kelasId: string = 'xii_tkj_2'): void => {
  const normKelas = (kelasId || 'xii_tkj_2').replace(/[- ]/g, '_').toLowerCase();
  try {
    localStorage.setItem(`${KEYS.ATTENDANCE}_${normKelas}`, JSON.stringify(data));
    if (normKelas === 'xii_tkj_2') {
      localStorage.setItem('smk_pgri1_presensi_attendance_v1', JSON.stringify(data));
    }
  } catch (e) {
    console.error('Error saving attendance to storage', e);
  }
};

export const getStoredConfig = (kelasId: string = 'xii_tkj_2'): ClassConfig => {
  const normKelas = (kelasId || 'xii_tkj_2').replace(/[- ]/g, '_').toLowerCase();
  try {
    const raw = localStorage.getItem(`${KEYS.CONFIG}_${normKelas}`);
    if (!raw) {
      if (normKelas === 'xii_tkj_2') {
        const legacyRaw = localStorage.getItem('smk_pgri1_presensi_config_v1');
        if (legacyRaw) return JSON.parse(legacyRaw);
      }
      return INITIAL_CLASS_CONFIG;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_CLASS_CONFIG;
  }
};

export const saveConfig = (config: ClassConfig, kelasId: string = 'xii_tkj_2'): void => {
  const normKelas = (kelasId || 'xii_tkj_2').replace(/[- ]/g, '_').toLowerCase();
  try {
    localStorage.setItem(`${KEYS.CONFIG}_${normKelas}`, JSON.stringify(config));
    if (normKelas === 'xii_tkj_2') {
      localStorage.setItem('smk_pgri1_presensi_config_v1', JSON.stringify(config));
    }
  } catch (e) {
    console.error('Error saving config', e);
  }
};

export const getStoredFirebaseConfig = (): FirebaseConfigState => {
  try {
    const raw = localStorage.getItem(KEYS.FIREBASE);
    if (!raw) {
      return {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
        enabled: false,
      };
    }
    return JSON.parse(raw);
  } catch (e) {
    return {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      enabled: false,
    };
  }
};

export const saveFirebaseConfig = (config: FirebaseConfigState): void => {
  try {
    localStorage.setItem(KEYS.FIREBASE, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving Firebase config', e);
  }
};

export const getStoredAuth = (): AuthUser | null => {
  try {
    // Hapus token auto-login lama di localStorage agar saat pertama kali buka aplikasi
    // di tab/jendela baru selalu menampilkan Halaman Login terlebih dahulu.
    localStorage.removeItem(KEYS.AUTH);
    localStorage.removeItem('smk_pgri1_presensi_auth_v1');

    const raw = sessionStorage.getItem('smk_pgri1_presensi_session_auth_v3');
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const saveAuth = (auth: AuthUser | null): void => {
  try {
    localStorage.removeItem(KEYS.AUTH);
    localStorage.removeItem('smk_pgri1_presensi_auth_v1');
    if (auth) {
      sessionStorage.setItem('smk_pgri1_presensi_session_auth_v3', JSON.stringify(auth));
    } else {
      sessionStorage.removeItem('smk_pgri1_presensi_session_auth_v3');
    }
  } catch (e) {
    console.error('Error saving auth state', e);
  }
};

// Export full backup as JSON file
export const exportBackupJSON = (kelasId: string = 'xii_tkj_2'): void => {
  const config = getStoredConfig(kelasId);
  const backup = {
    app: `Sistem Presensi Digital ${config.kelas} SMKS PGRI 1 Sukabumi`,
    version: '2.0.0 (Pendekatan B: Role-Based)',
    kelasId,
    exportDate: new Date().toISOString(),
    config,
    students: getStoredStudents(kelasId),
    attendance: getStoredAttendance(kelasId),
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `Backup_Presensi_${kelasId}_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
