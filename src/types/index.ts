export type AttendanceStatus = 'H' | 'S' | 'I' | 'A';

export interface Student {
  id: string;
  nis: string;
  nisn?: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  noHpOrtu: string;
  alamat?: string;
  catatan?: string;
}

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  catatan?: string;
  time?: string;
}

export interface DailyAttendance {
  date: string; // Format: YYYY-MM-DD
  records: Record<string, AttendanceRecord>; // key: studentId
  updatedAt: string;
  updatedBy?: string;
}

export interface ClassConfig {
  namaSekolah: string;
  programKeahlian: string;
  kelas: string;
  waliKelas: string;
  nipWaliKelas: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  alamatSekolah: string;
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  enabled: boolean;
}

export interface AuthUser {
  username: string;
  nama: string;
  role: 'admin' | 'guru';
  isLoggedIn: boolean;
}

export type ActiveTab = 'absensi' | 'siswa' | 'rekap' | 'laporan' | 'pengaturan';
