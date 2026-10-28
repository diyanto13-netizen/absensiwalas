import { Student, ClassConfig, DailyAttendance, TeacherProfile, RombelInfo } from '../types';

export const DEFAULT_ROMBELS: RombelInfo[] = [
  {
    id: 'xii_tkj_2',
    nama: 'XII TKJ 2',
    jurusan: 'Teknik Komputer dan Jaringan',
    waliKelasNama: 'Diyanto, S.Kom.',
    waliKelasNip: '19850612 201001 1 014',
  },
  {
    id: 'xii_tkj_1',
    nama: 'XII TKJ 1',
    jurusan: 'Teknik Komputer dan Jaringan',
    waliKelasNama: 'Ahmad Fauzi, S.Kom.',
    waliKelasNip: '19880315 201502 1 003',
  },
  {
    id: 'xii_tkj_3',
    nama: 'XII TKJ 3',
    jurusan: 'Teknik Komputer dan Jaringan',
    waliKelasNama: 'Hendra Wijaya, S.T.',
    waliKelasNip: '19790405 200604 1 008',
  },
  {
    id: 'xi_rpl_1',
    nama: 'XI RPL 1',
    jurusan: 'Rekayasa Perangkat Lunak',
    waliKelasNama: 'Siti Rahmawati, M.Pd.',
    waliKelasNip: '19920110 201903 2 014',
  },
];

export const DEFAULT_TEACHERS: TeacherProfile[] = [
  {
    id: 'teacher-xii-tkj-2',
    nip: '198506122010011014',
    nama: 'Diyanto, S.Kom.',
    email: 'diyanto13@gmail.com',
    role: 'wali_kelas',
    assignedKelas: 'XII TKJ 2',
    kelasId: 'xii_tkj_2',
    noHp: '081289123456',
  },
  {
    id: 'teacher-xii-tkj-1',
    nip: '198803152015021003',
    nama: 'Ahmad Fauzi, S.Kom.',
    email: 'ahmadfauzi@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'XII TKJ 1',
    kelasId: 'xii_tkj_1',
    noHp: '085721345678',
  },
  {
    id: 'teacher-xi-rpl-1',
    nip: '199201102019032014',
    nama: 'Siti Rahmawati, M.Pd.',
    email: 'siti.rahma@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'XI RPL 1',
    kelasId: 'xi_rpl_1',
    noHp: '082112345679',
  },
  {
    id: 'teacher-xii-tkj-3',
    nip: '197904052006041008',
    nama: 'Hendra Wijaya, S.T.',
    email: 'hendra.wijaya@smkpgri1sukabumi.sch.id',
    role: 'wali_kelas',
    assignedKelas: 'XII TKJ 3',
    kelasId: 'xii_tkj_3',
    noHp: '087812345670',
  },
  {
    id: 'admin-kurikulum',
    nip: '197508192003121001',
    nama: 'Drs. H. Sugandi, M.M.Pd. (Kurikulum & Admin)',
    email: 'kurikulum@smkpgri1sukabumi.sch.id',
    role: 'admin',
    assignedKelas: 'Semua Rombel',
    kelasId: 'xii_tkj_2',
    noHp: '081398765432',
  },
];

export const INITIAL_CLASS_CONFIG: ClassConfig = {
  namaSekolah: 'SMKS PGRI 1 KOTA SUKABUMI',
  programKeahlian: 'Teknik Komputer dan Jaringan (TKJ)',
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
  
  // Seed dates for last 6 months (Mei s.d. Oktober 2026)
  const dates = [
    // Mei 2026
    '2026-05-12', '2026-05-19', '2026-05-26',
    // Juni 2026
    '2026-06-08', '2026-06-15', '2026-06-22',
    // Juli 2026 (Awal Tapel Baru 2026/2027)
    '2026-07-20', '2026-07-23', '2026-07-28',
    // Agustus 2026
    '2026-08-10', '2026-08-14', '2026-08-21', '2026-08-28',
    // September 2026
    '2026-09-07', '2026-09-14', '2026-09-21', '2026-09-28',
    // Oktober 2026
    '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23',
    '2026-10-26', '2026-10-27', '2026-10-28',
  ];

  dates.forEach((date, dateIdx) => {
    const records: Record<string, any> = {};
    students.forEach((s, idx) => {
      let status: 'H' | 'S' | 'I' | 'A' = 'H';
      let catatan = '';

      if ((idx + dateIdx) % 17 === 0) {
        status = 'S';
        catatan = 'Demam dan flu';
      } else if ((idx + dateIdx) % 19 === 0) {
        status = 'I';
        catatan = 'Acara keluarga';
      } else if ((idx + dateIdx) % 31 === 0 && dateIdx > 2) {
        status = 'A';
        catatan = 'Tanpa keterangan';
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
