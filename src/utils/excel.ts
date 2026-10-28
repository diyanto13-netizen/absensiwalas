import * as XLSX from 'xlsx';
import { Student, ClassConfig, DailyAttendance } from '../types';

/**
 * Ekspor Data Master Siswa ke File Excel (.xlsx)
 */
export const exportStudentsToExcel = (students: Student[], kelasName = 'XII TKJ 2'): void => {
  const rows = students.map((s, index) => ({
    'No': index + 1,
    'NIS': s.nis,
    'Nama Lengkap': s.nama,
    'Jenis Kelamin (L/P)': s.jenisKelamin,
    'No HP / WhatsApp Ortu': s.noHpOrtu,
    'Alamat / Domisili': s.alamat || '-',
    'Catatan Khusus': s.catatan || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

  // Atur lebar kolom
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 14 }, // NIS
    { wch: 30 }, // Nama
    { wch: 18 }, // JK
    { wch: 22 }, // No HP
    { wch: 28 }, // Alamat
    { wch: 20 }, // Catatan
  ];

  XLSX.writeFile(workbook, `Data_Siswa_${kelasName.replace(/\s+/g, '_')}.xlsx`);
};

/**
 * Unduh Template Excel untuk Input Siswa Massal
 */
export const downloadStudentTemplateExcel = (): void => {
  const sampleData = [
    {
      'NIS': '22231035',
      'Nama Lengkap': 'Contoh Siswa Baru',
      'Jenis Kelamin': 'L',
      'No HP Ortu': '081234567890',
      'Alamat': 'Jl. Pelabuhan II, Kota Sukabumi',
      'Catatan': 'Pindahan dari SMK X',
    },
    {
      'NIS': '22231036',
      'Nama Lengkap': 'Contoh Siswi Baru',
      'Jenis Kelamin': 'P',
      'No HP Ortu': '085712345678',
      'Alamat': 'Baros, Kota Sukabumi',
      'Catatan': '',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa');
  XLSX.writeFile(workbook, 'Template_Import_Siswa_SMK_PGRI_1.xlsx');
};

/**
 * Parse File Excel (.xlsx / .xls) untuk Impor Siswa Massal
 */
export const parseStudentsFromExcel = async (file: File, defaultKelasId?: string): Promise<Student[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!jsonRows || jsonRows.length === 0) {
          throw new Error('File Excel kosong atau format tidak sesuai.');
        }

        const parsedStudents: Student[] = [];

        jsonRows.forEach((row, idx) => {
          // Cari field nama (bisa 'Nama Lengkap', 'Nama', 'nama', 'Nama Siswa')
          const nama =
            row['Nama Lengkap'] ||
            row['Nama'] ||
            row['nama'] ||
            row['Nama Siswa'] ||
            row['NAMA'] ||
            '';

          // Cari NIS
          const nis = String(row['NIS'] || row['nis'] || row['Nis'] || row['No Induk'] || `2223${1050 + idx}`).trim();

          if (!nama || String(nama).trim() === '') {
            return; // lewati baris tanpa nama
          }

          // Cari Jenis Kelamin
          const jkRaw = String(row['Jenis Kelamin'] || row['JK'] || row['L/P'] || row['Jenis Kelamin (L/P)'] || 'L').toUpperCase();
          const jenisKelamin: 'L' | 'P' = jkRaw.startsWith('P') ? 'P' : 'L';

          // Cari No HP Ortu
          const noHp = String(
            row['No HP / WhatsApp Ortu'] ||
            row['No HP Ortu'] ||
            row['No HP'] ||
            row['Telepon'] ||
            row['WhatsApp'] ||
            '081200000000'
          ).trim();

          const alamat = String(row['Alamat / Domisili'] || row['Alamat'] || row['alamat'] || '').trim();
          const catatan = String(row['Catatan Khusus'] || row['Catatan'] || row['catatan'] || '').trim();

          parsedStudents.push({
            id: `std-imp-${Date.now()}-${idx}`,
            nis,
            nama: String(nama).trim(),
            jenisKelamin,
            noHpOrtu: noHp,
            alamat: alamat || undefined,
            catatan: catatan || undefined,
            kelasId: defaultKelasId || 'xii-tkj-2',
          });
        });

        resolve(parsedStudents);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Ekspor Rekap Presensi Bulanan ke Format Excel
 */
export const exportMonthlyRecapToExcel = (
  config: ClassConfig,
  month: number, // 1-12
  year: number,
  students: Student[],
  attendanceData: Record<string, DailyAttendance>
): void => {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const namaBulan = monthNames[month - 1];

  // Kumpulkan tanggal-tanggal dalam bulan ini yang ada data presensinya
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const relevantDates = Object.keys(attendanceData)
    .filter((d) => d.startsWith(monthPrefix))
    .sort();

  const rows = students.map((s, index) => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;

    relevantDates.forEach((d) => {
      const rec = attendanceData[d]?.records[s.id];
      if (rec) {
        if (rec.status === 'H') hadir++;
        else if (rec.status === 'S') sakit++;
        else if (rec.status === 'I') izin++;
        else if (rec.status === 'A') alpa++;
      }
    });

    const totalHari = relevantDates.length || 1;
    const persentase = Math.round((hadir / totalHari) * 100);

    return {
      'No': index + 1,
      'NIS': s.nis,
      'Nama Siswa': s.nama,
      'L/P': s.jenisKelamin,
      'Hadir (H)': hadir,
      'Sakit (S)': sakit,
      'Izin (I)': izin,
      'Alpa (A)': alpa,
      'Total Pertemuan': relevantDates.length,
      'Kehadiran (%)': `${persentase}%`,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap ${namaBulan} ${year}`);

  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 14 }, // NIS
    { wch: 30 }, // Nama
    { wch: 6 },  // L/P
    { wch: 10 }, // H
    { wch: 10 }, // S
    { wch: 10 }, // I
    { wch: 10 }, // A
    { wch: 16 }, // Total
    { wch: 14 }, // %
  ];

  XLSX.writeFile(workbook, `Rekap_Presensi_${config.kelas.replace(/\s+/g, '_')}_${namaBulan}_${year}.xlsx`);
};
