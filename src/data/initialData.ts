import { Student, ClassConfig, DailyAttendance, TeacherProfile, RombelInfo, SuperAdminConfig } from '../types';

export const DEFAULT_SUPER_ADMIN: SuperAdminConfig = {
  email: 'diyanto13@gmail.com',
  nama: 'Diyanto, S.Kom., M.T.',
  nip: '198506122010011014',
  noHp: '081289123456',
  password: 'smkpgri1admin',
  updatedAt: new Date().toISOString(),
  updatedBy: 'Sistem Inisialisasi',
};

// 4 Program Keahlian Resmi SMKS PGRI 1 Kota Sukabumi:
// 1. TKJ (Teknik Komputer & Jaringan): X TKJ 1-2, XI TKJ 1-2, XII TKJ 1-2
// 2. AKL (Akuntansi): X AKL, XI AKL, XII AKL (1 rombel per tingkat)
// 3. MPLB (Manajemen Perkantoran): X MPLB 1-2, XI MPLB 1-2, XII MPLB 1-2
// 4. PM (Bisnis Daring/Pemasaran): X PM 1-2, XI PM 1-2, XII PM 1-2
// Total: 21 Rombel Resmi
export const PROGRAM_KEAHLIAN_RESMI = [
  { kode: 'TKJ', nama: 'Teknik Komputer & Jaringan', rombelsPerTingkat: 2, totalRombel: 6 },
  { kode: 'AKL', nama: 'Akuntansi', rombelsPerTingkat: 1, totalRombel: 3 },
  { kode: 'MPLB', nama: 'Manajemen Perkantoran', rombelsPerTingkat: 2, totalRombel: 6 },
  { kode: 'PM', nama: 'Bisnis Daring/Pemasaran', rombelsPerTingkat: 2, totalRombel: 6 },
] as const;

export const ALL_SMK_PGRI_1_ROMBELS: RombelInfo[] = [
  // --- TINGKAT KELAS X (7 Rombel) ---
  { id: 'x_tkj_1', nama: 'X TKJ 1', jurusan: 'TKJ (Teknik Komputer & Jaringan)', tingkat: 'X', waliKelasNama: 'Wildani, S.Kom.', waliKelasNip: '19930412 202012 1 005' },
  { id: 'x_tkj_2', nama: 'X TKJ 2', jurusan: 'TKJ (Teknik Komputer & Jaringan)', tingkat: 'X', waliKelasNama: 'Budi Santoso, S.Kom.', waliKelasNip: '19910515 201903 1 008' },
  { id: 'x_akl', nama: 'X AKL', jurusan: 'AKL (Akuntansi)', tingkat: 'X', waliKelasNama: 'Dewi Sartika, S.E.', waliKelasNip: '19870912 201402 2 004' },
  { id: 'x_mplb_1', nama: 'X MPLB 1', jurusan: 'MPLB (Manajemen Perkantoran)', tingkat: 'X', waliKelasNama: 'Sri Mulyani, S.Pd.', waliKelasNip: '19890218 201503 2 006' },
  { id: 'x_mplb_2', nama: 'X MPLB 2', jurusan: 'MPLB (Manajemen Perkantoran)', tingkat: 'X', waliKelasNama: 'Indah Permata, S.Pd.', waliKelasNip: '19900620 201602 2 009' },
  { id: 'x_pm_1', nama: 'X PM 1', jurusan: 'PM (Bisnis Daring/Pemasaran)', tingkat: 'X', waliKelasNama: 'Agus Setiawan, S.Pd.', waliKelasNip: '19861108 201101 1 003' },
  { id: 'x_pm_2', nama: 'X PM 2', jurusan: 'PM (Bisnis Daring/Pemasaran)', tingkat: 'X', waliKelasNama: 'Novi Anggraeni, S.E.', waliKelasNip: '19920314 201802 2 007' },

  // --- TINGKAT KELAS XI (7 Rombel) ---
  { id: 'xi_tkj_1', nama: 'XI TKJ 1', jurusan: 'TKJ (Teknik Komputer & Jaringan)', tingkat: 'XI', waliKelasNama: 'Hendra Wijaya, S.T.', waliKelasNip: '19790405 200604 1 008' },
  { id: 'xi_tkj_2', nama: 'XI TKJ 2', jurusan: 'TKJ (Teknik Komputer & Jaringan)', tingkat: 'XI', waliKelasNama: 'Rizki Ramadhan, S.Kom.', waliKelasNip: '19840810 200902 1 004' },
  { id: 'xi_akl', nama: 'XI AKL', jurusan: 'AKL (Akuntansi)', tingkat: 'XI', waliKelasNama: 'Siti Rahmawati, S.E., M.Ak.', waliKelasNip: '19920110 201903 2 014' },
  { id: 'xi_mplb_1', nama: 'XI MPLB 1', jurusan: 'MPLB (Manajemen Perkantoran)', tingkat: 'XI', waliKelasNama: 'Yuni Astuti, S.Pd.', waliKelasNip: '19830514 200801 2 005' },
  { id: 'xi_mplb_2', nama: 'XI MPLB 2', jurusan: 'MPLB (Manajemen Perkantoran)', tingkat: 'XI', waliKelasNama: 'Fitri Handayani, S.Pd.', waliKelasNip: '19881025 201403 2 008' },
  { id: 'xi_pm_1', nama: 'XI PM 1', jurusan: 'PM (Bisnis Daring/Pemasaran)', tingkat: 'XI', waliKelasNama: 'Rina Agustina, S.Pd.', waliKelasNip: '19900824 201602 2 007' },
  { id: 'xi_pm_2', nama: 'XI PM 2', jurusan: 'PM (Bisnis Daring/Pemasaran)', tingkat: 'XI', waliKelasNama: 'Bayu Pratama, S.E.', waliKelasNip: '19871203 201202 1 006' },

  // --- TINGKAT KELAS XII (7 Rombel) ---
  { id: 'xii_tkj_1', nama: 'XII TKJ 1', jurusan: 'TKJ (Teknik Komputer & Jaringan)', tingkat: 'XII', waliKelasNama: 'Ahmad Fauzi, S.Kom.', waliKelasNip: '19880315 201502 1 003' },
  { id: 'xii_tkj_2', nama: 'XII TKJ 2', jurusan: 'TKJ (Teknik Komputer & Jaringan)', tingkat: 'XII', waliKelasNama: 'Diyanto, S.Kom.', waliKelasNip: '19850612 201001 1 014' },
  { id: 'xii_akl', nama: 'XII AKL', jurusan: 'AKL (Akuntansi)', tingkat: 'XII', waliKelasNama: 'Hj. Ratna Ningsih, S.E., M.Si.', waliKelasNip: '19810719 200604 2 008' },
  { id: 'xii_mplb_1', nama: 'XII MPLB 1', jurusan: 'MPLB (Manajemen Perkantoran)', tingkat: 'XII', waliKelasNama: 'Dra. Hj. Nurlaela, M.M.', waliKelasNip: '19710318 199602 2 001' },
  { id: 'xii_mplb_2', nama: 'XII MPLB 2', jurusan: 'MPLB (Manajemen Perkantoran)', tingkat: 'XII', waliKelasNama: 'Eni Suryani, S.Pd.', waliKelasNip: '19820921 200701 2 006' },
  { id: 'xii_pm_1', nama: 'XII PM 1', jurusan: 'PM (Bisnis Daring/Pemasaran)', tingkat: 'XII', waliKelasNama: 'Cecep Suherman, S.E.', waliKelasNip: '19851110 201001 1 009' },
  { id: 'xii_pm_2', nama: 'XII PM 2', jurusan: 'PM (Bisnis Daring/Pemasaran)', tingkat: 'XII', waliKelasNama: 'Maya Sofiani, S.Pd.', waliKelasNip: '19890416 201602 2 005' },
];

export const DEFAULT_ROMBELS: RombelInfo[] = ALL_SMK_PGRI_1_ROMBELS;

export const DEFAULT_TEACHERS: TeacherProfile[] = [
  // --- TINGKAT KELAS X (7 Rombel) ---
  {
    id: 'teacher-x-tkj-1',
    nip: '199304122020121005',
    nama: 'Wildani, S.Kom.',
    email: 'wildani@smkpgri1',
    role: 'wali_kelas',
    assignedKelas: 'X TKJ 1',
    kelasId: 'x_tkj_1',
    noHp: '085712345678',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-x-tkj-2',
    nip: '199105152019031008',
    nama: 'Budi Santoso, S.Kom.',
    email: 'budi.santoso@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'X TKJ 2',
    kelasId: 'x_tkj_2',
    noHp: '081299887766',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-x-akl',
    nip: '198709122014022004',
    nama: 'Dewi Sartika, S.E.',
    email: 'dewi.sartika@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'X AKL',
    kelasId: 'x_akl',
    noHp: '085611223355',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-x-mplb-1',
    nip: '198902182015032006',
    nama: 'Sri Mulyani, S.Pd.',
    email: 'sri.mulyani@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'X MPLB 1',
    kelasId: 'x_mplb_1',
    noHp: '082133445566',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-x-mplb-2',
    nip: '199006202016022009',
    nama: 'Indah Permata, S.Pd.',
    email: 'indah.permata@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'X MPLB 2',
    kelasId: 'x_mplb_2',
    noHp: '081344556688',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-x-pm-1',
    nip: '198611082011011003',
    nama: 'Agus Setiawan, S.Pd.',
    email: 'agus.setiawan@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'X PM 1',
    kelasId: 'x_pm_1',
    noHp: '087855667799',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-x-pm-2',
    nip: '199203142018022007',
    nama: 'Novi Anggraeni, S.E.',
    email: 'novi.anggraeni@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'X PM 2',
    kelasId: 'x_pm_2',
    noHp: '085866778800',
    password: 'smkpgri1',
  },

  // --- TINGKAT KELAS XI (7 Rombel) ---
  {
    id: 'teacher-xi-tkj-1',
    nip: '197904052006041008',
    nama: 'Hendra Wijaya, S.T.',
    email: 'hendra.wijaya@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'XI TKJ 1',
    kelasId: 'xi_tkj_1',
    noHp: '087812345670',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-xi-tkj-2',
    nip: '198408102009021004',
    nama: 'Rizki Ramadhan, S.Kom.',
    email: 'rizki.ramadhan@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'XI TKJ 2',
    kelasId: 'xi_tkj_2',
    noHp: '081922334466',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-xi-akl',
    nip: '199201102019032014',
    nama: 'Siti Rahmawati, S.E., M.Ak.',
    email: 'siti.rahma@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'XI AKL',
    kelasId: 'xi_akl',
    noHp: '082112345679',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-xi-mplb-1',
    nip: '198305142008012005',
    nama: 'Yuni Astuti, S.Pd.',
    email: 'yuni.astuti@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'XI MPLB 1',
    kelasId: 'xi_mplb_1',
    noHp: '081277665555',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-xi-mplb-2',
    nip: '198810252014032008',
    nama: 'Fitri Handayani, S.Pd.',
    email: 'fitri.handayani@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'XI MPLB 2',
    kelasId: 'xi_mplb_2',
    noHp: '085733445577',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-xi-pm-1',
    nip: '199008242016022007',
    nama: 'Rina Agustina, S.Pd.',
    email: 'rina.agustina@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'XI PM 1',
    kelasId: 'xi_pm_1',
    noHp: '085611223344',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-xi-pm-2',
    nip: '198712032012021006',
    nama: 'Bayu Pratama, S.E.',
    email: 'bayu.pratama@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'XI PM 2',
    kelasId: 'xi_pm_2',
    noHp: '082166778811',
    password: 'smkpgri1',
  },

  // --- TINGKAT KELAS XII (7 Rombel) ---
  {
    id: 'teacher-xii-tkj-1',
    nip: '198803152015021003',
    nama: 'Ahmad Fauzi, S.Kom.',
    email: 'ahmadfauzi@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'XII TKJ 1',
    kelasId: 'xii_tkj_1',
    noHp: '085721345678',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-xii-tkj-2',
    nip: '198506122010011014',
    nama: 'Diyanto, S.Kom.',
    email: 'diyanto13@gmail.com',
    role: 'wali_kelas',
    assignedKelas: 'XII TKJ 2',
    kelasId: 'xii_tkj_2',
    noHp: '081289123456',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-xii-akl',
    nip: '198107192006042008',
    nama: 'Hj. Ratna Ningsih, S.E., M.Si.',
    email: 'ratna.ningsih@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'XII AKL',
    kelasId: 'xii_akl',
    noHp: '081311223355',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-xii-mplb-1',
    nip: '197103181996022001',
    nama: 'Dra. Hj. Nurlaela, M.M.',
    email: 'nurlaela@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'XII MPLB 1',
    kelasId: 'xii_mplb_1',
    noHp: '081322334455',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-xii-mplb-2',
    nip: '198209212007012006',
    nama: 'Eni Suryani, S.Pd.',
    email: 'eni.suryani@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'XII MPLB 2',
    kelasId: 'xii_mplb_2',
    noHp: '087822334466',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-xii-pm-1',
    nip: '198511102010011009',
    nama: 'Cecep Suherman, S.E.',
    email: 'cecep.suherman@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'XII PM 1',
    kelasId: 'xii_pm_1',
    noHp: '085844556688',
    password: 'smkpgri1',
  },
  {
    id: 'teacher-xii-pm-2',
    nip: '198904162016022005',
    nama: 'Maya Sofiani, S.Pd.',
    email: 'maya.sofiani@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'XII PM 2',
    kelasId: 'xii_pm_2',
    noHp: '081955667799',
    password: 'smkpgri1',
  },

  // --- AKUN SUPER ADMIN / KURIKULUM ---
  {
    id: 'admin-kurikulum',
    nip: '197508192003121001',
    nama: 'Drs. H. Sugandi, M.M.Pd. (Kurikulum)',
    email: 'diyanto13@gmail.com',
    role: 'admin',
    assignedKelas: 'Semua Rombel',
    kelasId: 'xii_tkj_2',
    noHp: '081398765432',
    password: 'smkpgri1admin',
  },
];

export const INITIAL_CLASS_CONFIG: ClassConfig = {
  namaSekolah: 'SMKS PGRI 1 KOTA SUKABUMI',
  programKeahlian: 'TKJ (Teknik Komputer & Jaringan)',
  kelas: 'XII TKJ 2',
  waliKelas: 'Diyanto, S.Kom.',
  nipWaliKelas: '19850612 201001 1 014',
  kepalaSekolah: 'Drs. H. Sugandi, M.M.Pd.',
  nipKepalaSekolah: '19680315 199303 1 008',
  tahunAjaran: '2026/2027',
  semester: 'Ganjil',
  alamatSekolah: 'Jl. Pelabuhan II KM. 5, Lembursitu, Kota Sukabumi, Jawa Barat 43168',
};

export const INITIAL_STUDENTS: Student[] = [
  { id: 'std-01', nis: '22231001', nama: 'Aditya Pratama Nugraha', jenisKelamin: 'L', noHpOrtu: '081289123456', alamat: 'Cikole, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-02', nis: '22231002', nama: 'Alifia Zahra Ramadhani', jenisKelamin: 'P', noHpOrtu: '085721345678', alamat: 'Baros, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-03', nis: '22231003', nama: 'Andhika Rizky Maulana', jenisKelamin: 'L', noHpOrtu: '082112345679', alamat: 'Warudoyong, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-04', nis: '22231004', nama: 'Annisa Fitri Nurfadilah', jenisKelamin: 'P', noHpOrtu: '081398765432', alamat: 'Gunungpuyuh, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-05', nis: '22231005', nama: 'Arya Bima Sena', jenisKelamin: 'L', noHpOrtu: '087812345670', alamat: 'Lembursitu, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-06', nis: '22231006', nama: 'Bagus Setiawan', jenisKelamin: 'L', noHpOrtu: '085811223344', alamat: 'Citamiang, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-07', nis: '22231007', nama: 'Cantika Putri Maharani', jenisKelamin: 'P', noHpOrtu: '081900112233', alamat: 'Cisaat, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-08', nis: '22231008', nama: 'Daffa Raihan Alfarizi', jenisKelamin: 'L', noHpOrtu: '081299887766', alamat: 'Baros, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-09', nis: '22231009', nama: 'Dimas Aditya Pamungkas', jenisKelamin: 'L', noHpOrtu: '085712334455', alamat: 'Cibeureum, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-10', nis: '22231010', nama: 'Dinda Ayu Lestari', jenisKelamin: 'P', noHpOrtu: '082199001122', alamat: 'Cikole, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-11', nis: '22231011', nama: 'Fajar Nugraha', jenisKelamin: 'L', noHpOrtu: '081388776655', alamat: 'Lembursitu, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-12', nis: '22231012', nama: 'Farhan Maulana', jenisKelamin: 'L', noHpOrtu: '087766554433', alamat: 'Warudoyong, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-13', nis: '22231013', nama: 'Fasya Aulia Rahman', jenisKelamin: 'P', noHpOrtu: '085933221100', alamat: 'Gunungpuyuh, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-14', nis: '22231014', nama: 'Galih Rakasiwi', jenisKelamin: 'L', noHpOrtu: '081233445566', alamat: 'Cisaat, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-15', nis: '22231015', nama: 'Hana Khairunnisa', jenisKelamin: 'P', noHpOrtu: '085677889900', alamat: 'Citamiang, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-16', nis: '22231016', nama: 'Ihsan Kamil Robbani', jenisKelamin: 'L', noHpOrtu: '082211445566', alamat: 'Cikole, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-17', nis: '22231017', nama: 'Indra Lesmana', jenisKelamin: 'L', noHpOrtu: '081344556677', alamat: 'Baros, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-18', nis: '22231018', nama: 'Kayla Salsabila', jenisKelamin: 'P', noHpOrtu: '087855667788', alamat: 'Lembursitu, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-19', nis: '22231019', nama: 'Muhammad Bilal Ramadhan', jenisKelamin: 'L', noHpOrtu: '085899887766', alamat: 'Cibeureum, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-20', nis: '22231020', nama: 'Muhammad Fadhil Firdaus', jenisKelamin: 'L', noHpOrtu: '081922334455', alamat: 'Cisaat, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-21', nis: '22231021', nama: 'Muhammad Rafiandra', jenisKelamin: 'L', noHpOrtu: '081277665544', alamat: 'Gunungpuyuh, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-22', nis: '22231022', nama: 'Nabila Syahrani', jenisKelamin: 'P', noHpOrtu: '085733445566', alamat: 'Warudoyong, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-23', nis: '22231023', nama: 'Najwa Maulida', jenisKelamin: 'P', noHpOrtu: '082166778899', alamat: 'Citamiang, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-24', nis: '22231024', nama: 'Pratama Yudha Perkasa', jenisKelamin: 'L', noHpOrtu: '081311223344', alamat: 'Cikole, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-25', nis: '22231025', nama: 'Rafi Ahmad Syauqi', jenisKelamin: 'L', noHpOrtu: '087822334455', alamat: 'Lembursitu, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-26', nis: '22231026', nama: 'Rangga Dwi Kurniawan', jenisKelamin: 'L', noHpOrtu: '085844556677', alamat: 'Baros, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-27', nis: '22231027', nama: 'Ratu Bilqis Zulaikha', jenisKelamin: 'P', noHpOrtu: '081955667788', alamat: 'Cibeureum, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-28', nis: '22231028', nama: 'Rehan Saputra', jenisKelamin: 'L', noHpOrtu: '081244332211', alamat: 'Cisaat, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-29', nis: '22231029', nama: 'Rian Hidayatullah', jenisKelamin: 'L', noHpOrtu: '085788990011', alamat: 'Gunungpuyuh, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-30', nis: '22231030', nama: 'Siti Sarah Nurhaliza', jenisKelamin: 'P', noHpOrtu: '082177889900', alamat: 'Warudoyong, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-31', nis: '22231031', nama: 'Taufik Hidayat', jenisKelamin: 'L', noHpOrtu: '081366554433', alamat: 'Citamiang, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-32', nis: '22231032', nama: 'Wildan Syahputra', jenisKelamin: 'L', noHpOrtu: '087877665544', alamat: 'Lembursitu, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-33', nis: '22231033', nama: 'Yusuf Maulana Alamsyah', jenisKelamin: 'L', noHpOrtu: '085866778899', alamat: 'Cikole, Sukabumi', kelasId: 'xii_tkj_2' },
  { id: 'std-34', nis: '22231034', nama: 'Zahra Amelia Azzahro', jenisKelamin: 'P', noHpOrtu: '081944556677', alamat: 'Baros, Sukabumi', kelasId: 'xii_tkj_2' },
];

export const generateInitialAttendanceData = (students: Student[]): Record<string, DailyAttendance> => {
  const data: Record<string, DailyAttendance> = {};
  
  const dates = [
    '2026-05-12', '2026-05-19', '2026-05-26',
    '2026-06-08', '2026-06-15', '2026-06-22',
    '2026-07-20', '2026-07-23', '2026-07-28',
    '2026-08-10', '2026-08-14', '2026-08-21', '2026-08-28',
    '2026-09-07', '2026-09-14', '2026-09-21', '2026-09-28',
    '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23',
    '2026-10-26', '2026-10-27', '2026-10-28',
  ];

  dates.forEach((date, dateIdx) => {
    const records: Record<string, any> = {};
    students.forEach((s, idx) => {
      let status: 'H' | 'S' | 'I' | 'A' = 'H';
      let catatan = '';

      // Default siswa hadir 100% riil sesuai seluruh hari efektif KBM.
      // Hanya ada 2 contoh kasus realistis siswa sakit/izin untuk keperluan demonstrasi visual.
      if (s.id === 'std-03' && date === '2026-10-23') {
        status = 'S';
        catatan = 'Sakit flu & demam (Surat Dokter terlampir)';
      } else if (s.id === 'std-07' && date === '2026-10-26') {
        status = 'I';
        catatan = 'Izin keperluan keluarga (Surat Orang Tua)';
      }

      records[s.id] = {
        studentId: s.id,
        status,
        catatan,
        time: '07:15',
      };
    });

    data[date] = {
      date,
      records,
      updatedAt: `${date}T07:30:00.000Z`,
      updatedBy: 'Wali Kelas XII TKJ 2',
      kelasId: 'xii_tkj_2',
    };
  });

  return data;
};
