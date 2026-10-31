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
  kelasId?: string;
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
  kelasId?: string;
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

export interface TeacherProfile {
  id: string;
  nip: string;
  nama: string;
  email: string;
  role: 'wali_kelas' | 'kurikulum' | 'admin';
  assignedKelas: string;
  kelasId: string;
  noHp?: string;
  password?: string;
}

export interface SuperAdminConfig {
  email: string;
  nama: string;
  nip: string;
  noHp?: string;
  password?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface RombelInfo {
  id: string;
  nama: string;
  jurusan: string;
  tingkat: 'X' | 'XI' | 'XII';
  waliKelasNama?: string;
  waliKelasNip?: string;
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
  nip: string;
  role: 'wali_kelas' | 'kurikulum' | 'admin';
  assignedKelas: string;
  kelasId: string;
  isLoggedIn: boolean;
  email?: string;
}

export type ActiveTab = 'absensi' | 'siswa' | 'rekap' | 'laporan' | 'pengaturan' | 'akun';

export type ThemeMode = 'dark' | 'sunrise' | 'neon' | 'light';
