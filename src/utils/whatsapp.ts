import { Student, ClassConfig, AttendanceStatus } from '../types';

/**
 * Normalisasi nomor HP ke format internasional WhatsApp (628...)
 */
export const formatWhatsAppNumber = (phoneNumber: string): string => {
  let cleaned = phoneNumber.replace(/[^0-9]/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }

  return cleaned;
};

/**
 * Format status presensi ke teks bahasa Indonesia
 */
export const getStatusText = (status: AttendanceStatus): string => {
  switch (status) {
    case 'H':
      return 'HADIR';
    case 'S':
      return 'SAKIT';
    case 'I':
      return 'IZIN';
    case 'A':
      return 'ALPA / TANPA KETERANGAN';
    default:
      return status;
  }
};

/**
 * Buat pesan dinamis WhatsApp untuk laporan kehadiran harian siswa ke orang tua
 */
export const createDailyAttendanceWAMessage = (
  student: Student,
  status: AttendanceStatus,
  dateString: string,
  catatan: string | undefined,
  config: ClassConfig
): string => {
  const statusStr = getStatusText(status);

  return `*PEMBERITAHUAN PRESENSI SISWA*
*${config.namaSekolah}*
--------------------------------------------------
Yth. Bapak/Ibu Orang Tua/Wali dari:
Nama Siswa: *${student.nama}*
NIS: ${student.nis}
Kelas: *${config.kelas}* (${config.programKeahlian})

Memberitahukan bahwa pada hari ini:
Tanggal: *${dateString}*
Status Kehadiran: *${statusStr}*
${catatan ? `Keterangan: _${catatan}_\n` : ''}
${status === 'A' ? '⚠️ Mohon konfirmasi kepada pihak sekolah / wali kelas mengenai ketidakhadiran putra/putri Bapak/Ibu.' : ''}
${status === 'S' ? 'Semoga putra/putri Bapak/Ibu lekas sembuh dan dapat beraktivitas kembali.' : ''}

Demikian informasi ini kami sampaikan. Terima kasih atas perhatian dan kerja samanya.

Wali Kelas XII TKJ 2:
*${config.waliKelas}*
NIP: ${config.nipWaliKelas}`;
};

/**
 * Buat pesan dinamis WhatsApp untuk laporan rekap bulanan siswa
 */
export const createMonthlyRecapWAMessage = (
  student: Student,
  monthName: string,
  year: number,
  recap: { hadir: number; sakit: number; izin: number; alpa: number; total: number; persentase: number },
  config: ClassConfig
): string => {
  return `*LAPORAN REKAP KEHADIRAN BULANAN*
*${config.namaSekolah}*
--------------------------------------------------
Yth. Bapak/Ibu Orang Tua/Wali dari:
Nama Siswa: *${student.nama}*
NIS: ${student.nis}
Kelas: *${config.kelas}*

Berikut adalah ringkasan kehadiran putra/putri Bapak/Ibu pada bulan *${monthName} ${year}*:
- Hadir: *${recap.hadir} hari*
- Sakit: *${recap.sakit} hari*
- Izin: *${recap.izin} hari*
- Alpa: *${recap.alpa} hari*
- Total Pertemuan Efektif: ${recap.total} hari
- Persentase Kehadiran: *${recap.persentase}%*

${recap.persentase >= 90 ? '🌟 Pertahankan kedisiplinan dan semangat belajar ananda!' : ''}
${recap.persentase < 80 ? '⚠️ Perhatian: Persentase kehadiran berada di bawah batas minimum (80%). Mohon bantuan Bapak/Ibu untuk meningkatkan kedisiplinan ananda.' : ''}

Terima kasih atas kerja sama Bapak/Ibu dalam mendampingi putra/putri kita.

Wali Kelas:
*${config.waliKelas}*
NIP: ${config.nipWaliKelas}`;
};

/**
 * Buat URL WhatsApp API untuk mengirim pesan
 */
export const getWhatsAppLink = (phoneNumber: string, message: string): string => {
  const normalizedPhone = formatWhatsAppNumber(phoneNumber);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
};
