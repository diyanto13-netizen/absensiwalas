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

Wali Kelas *${config.kelas}*:
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
  // Hitung riil: total hari efektif pertemuan siswa (H + S + I + A)
  const totalDiabsen = recap.hadir + recap.sakit + recap.izin + recap.alpa;
  const totalHari = totalDiabsen > 0 ? totalDiabsen : recap.total;
  const persentaseRiil = totalHari > 0 ? Math.round((recap.hadir / totalHari) * 100) : (recap.persentase || 100);

  let statusDisiplin = '';
  if (persentaseRiil === 100) {
    statusDisiplin = '🌟 *Kehadiran Sempurna (100%)* — Sangat disiplin dan hadir penuh pada seluruh hari efektif KBM.';
  } else if (persentaseRiil >= 90) {
    statusDisiplin = '🌟 *Sangat Baik* — Pertahankan kedisiplinan dan semangat belajar ananda!';
  } else if (persentaseRiil >= 85) {
    statusDisiplin = '✅ *Baik* — Memenuhi standar kedisiplinan presensi sekolah.';
  } else {
    statusDisiplin = '⚠️ *Perhatian Khusus* — Persentase kehadiran berada di bawah batas minimum (85%). Mohon bantuan Bapak/Ibu untuk meningkatkan kedisiplinan ananda.';
  }

  return `*LAPORAN REKAP KEHADIRAN BULANAN*
*${config.namaSekolah}*
--------------------------------------------------
Yth. Bapak/Ibu Orang Tua/Wali dari:
Nama Siswa: *${student.nama}*
NIS: *${student.nis}*
Kelas: *${config.kelas}* (${config.programKeahlian})

Berikut adalah rincian kehadiran riil putra/putri Bapak/Ibu pada bulan *${monthName} ${year}*:
• Hadir (H): *${recap.hadir} hari*
• Sakit (S): *${recap.sakit} hari*
• Izin (I): *${recap.izin} hari*
• Alpa (A): *${recap.alpa} hari*
--------------------------------------------------
• Total Hari Efektif Diabsen: *${totalHari} hari*
• Persentase Kehadiran Riil: *${persentaseRiil}%*
${totalHari > 0 ? `_(Perhitungan Riil: ${recap.hadir} hadir dari ${totalHari} hari efektif = ${persentaseRiil}%)_\n` : ''}
${statusDisiplin}

Demikian informasi rekap presensi ini kami sampaikan. Terima kasih atas kerja sama dan perhatian Bapak/Ibu dalam mendampingi putra/putri kita.

Wali Kelas *${config.kelas}*:
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
