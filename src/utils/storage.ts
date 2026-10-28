import { Student, DailyAttendance, ClassConfig, FirebaseConfigState, AuthUser } from '../types';
import { INITIAL_STUDENTS, INITIAL_CLASS_CONFIG, generateInitialAttendanceData } from '../data/initialData';

const KEYS = {
  STUDENTS: 'smk_pgri1_presensi_students_v1',
  ATTENDANCE: 'smk_pgri1_presensi_attendance_v1',
  CONFIG: 'smk_pgri1_presensi_config_v1',
  FIREBASE: 'smk_pgri1_presensi_firebase_v1',
  AUTH: 'smk_pgri1_presensi_auth_v1',
};

export const getStoredStudents = (): Student[] => {
  try {
    const raw = localStorage.getItem(KEYS.STUDENTS);
    if (!raw) {
      saveStudents(INITIAL_STUDENTS);
      return INITIAL_STUDENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading students from storage', e);
    return INITIAL_STUDENTS;
  }
};

export const saveStudents = (students: Student[]): void => {
  try {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Error saving students to storage', e);
  }
};

export const getStoredAttendance = (): Record<string, DailyAttendance> => {
  try {
    const raw = localStorage.getItem(KEYS.ATTENDANCE);
    if (!raw) {
      const students = getStoredStudents();
      const initial = generateInitialAttendanceData(students);
      saveAttendanceData(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading attendance from storage', e);
    return {};
  }
};

export const saveAttendanceData = (data: Record<string, DailyAttendance>): void => {
  try {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving attendance to storage', e);
  }
};

export const getStoredConfig = (): ClassConfig => {
  try {
    const raw = localStorage.getItem(KEYS.CONFIG);
    if (!raw) {
      saveConfig(INITIAL_CLASS_CONFIG);
      return INITIAL_CLASS_CONFIG;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_CLASS_CONFIG;
  }
};

export const saveConfig = (config: ClassConfig): void => {
  try {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
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
    const raw = localStorage.getItem(KEYS.AUTH);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const saveAuth = (auth: AuthUser | null): void => {
  try {
    if (auth) {
      localStorage.setItem(KEYS.AUTH, JSON.stringify(auth));
    } else {
      localStorage.removeItem(KEYS.AUTH);
    }
  } catch (e) {
    console.error('Error saving auth state', e);
  }
};

// Export full backup as JSON file
export const exportBackupJSON = (): void => {
  const backup = {
    app: 'Sistem Presensi Digital XII TKJ 2 SMKS PGRI 1 Sukabumi',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    config: getStoredConfig(),
    students: getStoredStudents(),
    attendance: getStoredAttendance(),
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `Backup_Presensi_XII_TKJ_2_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
