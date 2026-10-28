import React, { useState } from 'react';
import { 
  Printer, Send, MessageCircle, FileText, CheckCircle2, 
  School, AlertCircle, Share2, Sparkles 
} from 'lucide-react';
import { Student, DailyAttendance, ClassConfig } from '../types';
import { getWhatsAppLink, createDailyAttendanceWAMessage } from '../utils/whatsapp';

interface LaporanTabProps {
  students: Student[];
  attendanceData: Record<string, DailyAttendance>;
  currentDate: string;
  config: ClassConfig;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const LaporanTab: React.FC<LaporanTabProps> = ({
  students,
  attendanceData,
  currentDate,
  config,
  showToast,
}) => {
  const [reportType, setReportType] = useState<'harian' | 'bulanan'>('harian');
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedReportDate, setSelectedReportDate] = useState<string>(currentDate);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Print handler - triggers browser print dialog optimized with @media print CSS
  const handlePrint = () => {
    window.print();
  };

  // Kumpulkan siswa yang absen (Sakit, Izin, Alpa) pada tanggal terpilih
  const activeDayRecords = attendanceData[selectedReportDate]?.records || {};
  const absentStudents = students.filter((s) => {
    const rec = activeDayRecords[s.id];
    return rec && rec.status !== 'H';
  });

  // Data rekap bulanan jika mode bulanan dipilih
  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const recordedDatesMonth = Object.keys(attendanceData)
    .filter((d) => d.startsWith(monthPrefix))
    .sort();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Action Bar (hidden when printing) */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-lg no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Laporan Presensi & Notifikasi WhatsApp
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cetak format resmi sekolah dan kirimkan laporan presensi ke orang tua siswa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Selector */}
            <div className="flex p-0.5 rounded-xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setReportType('harian')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  reportType === 'harian'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Harian
              </button>
              <button
                type="button"
                onClick={() => setReportType('bulanan')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  reportType === 'bulanan'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bulanan
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* Date Filter selector for preview */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs">
          {reportType === 'harian' ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Pilih Tanggal:</span>
              <input
                type="date"
                value={selectedReportDate}
                onChange={(e) => setSelectedReportDate(e.target.value)}
                className="px-3 py-1 rounded-lg glass-input text-xs text-white"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Bulan:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-1 rounded-lg glass-input text-xs text-white bg-slate-900"
              >
                {monthNames.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>{m}</option>
                ))}
              </select>
              <span className="text-slate-400 font-medium">Tahun:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1 rounded-lg glass-input text-xs text-white bg-slate-900"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Quick Dispatch Section (no-print) */}
      <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 shadow-xl no-print">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Notifikasi WhatsApp Orang Tua Siswa ({selectedReportDate})
              </h3>
              <p className="text-xs text-slate-400">
                Kirim pesan otomatis untuk siswa yang Sakit, Izin, atau Alpa hari ini.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
            {absentStudents.length} Siswa Perlu Diberitahukan
          </span>
        </div>

        {absentStudents.length === 0 ? (
          <div className="p-6 text-center text-slate-400 rounded-xl bg-slate-900/40 border border-white/5">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-white">Alhamdulillah, Seluruh Siswa Hadir!</p>
            <p className="text-xs text-slate-400 mt-1">
              Tidak ada siswa yang berstatus Sakit, Izin, atau Alpa pada tanggal {selectedReportDate}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {absentStudents.map((student) => {
              const rec = activeDayRecords[student.id];
              let statusLabel = 'Sakit';
              let badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-500/30';
              if (rec?.status === 'I') {
                statusLabel = 'Izin';
                badgeColor = 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30';
              } else if (rec?.status === 'A') {
                statusLabel = 'Alpa (Tanpa Keterangan)';
                badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-500/30';
              }

              const waMessage = createDailyAttendanceWAMessage(
                student,
                rec?.status || 'S',
                selectedReportDate,
                rec?.catatan,
                config
              );
              const waUrl = getWhatsAppLink(student.noHpOrtu, waMessage);

              return (
                <div
                  key={student.id}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-white/10 flex flex-col justify-between gap-3 hover:border-emerald-500/30 transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-white text-xs sm:text-sm">{student.nama}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">NIS: {student.nis} • WA: {student.noHpOrtu}</p>
                    {rec?.catatan && (
                      <p className="text-xs text-slate-300 italic mt-1.5 p-1.5 rounded bg-slate-950/60 border border-white/5">
                        "{rec.catatan}"
                      </p>
                    )}
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i>
                    <span>Kirim Pesan WA ke Ortu</span>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Official School Report Document View (Optimized for Screen & Print) */}
      <div className="print-area glass-panel p-8 sm:p-12 rounded-2xl border border-white/10 shadow-2xl bg-slate-950 text-slate-100 print:text-black print:bg-white print:p-0">
        
        {/* Kop Surat SMKS PGRI 1 KOTA SUKABUMI */}
        <div className="text-center pb-3 border-b-4 border-double border-slate-300 print:border-black mb-6">
          <div className="flex items-center justify-center gap-4 mb-2">
            {/* School Logo icon */}
            <div className="w-16 h-16 rounded-xl bg-cyan-600 print:bg-slate-200 flex items-center justify-center text-white print:text-black">
              <School className="w-10 h-10" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-slate-300 print:text-black">
                YAYASAN PEMBINA LEMBAGA PENDIDIKAN DASAR DAN MENENGAH (YPLP DASMEN) PGRI
              </p>
              <h1 className="text-xl sm:text-2xl font-black uppercase text-white print:text-black tracking-tight">
                SMK PGRI 1 KOTA SUKABUMI
              </h1>
              <p className="text-xs font-bold text-cyan-400 print:text-black uppercase">
                KOMPETENSI KEAHLIAN: {config.programKeahlian.toUpperCase()}
              </p>
              <p className="text-[11px] text-slate-400 print:text-black mt-0.5">
                {config.alamatSekolah} • Email: smkpgri1_sukabumi@yahoo.com
              </p>
            </div>
          </div>
        </div>

        {/* Report Document Title & Metadata */}
        <div className="text-center mb-6">
          <h2 className="text-base sm:text-lg font-bold uppercase underline tracking-wide text-white print:text-black">
            {reportType === 'harian'
              ? 'LAPORAN PRESENSI HARIAN PESERTA DIDIK'
              : `REKAPITULASI PRESENSI BULAN ${monthNames[selectedMonth - 1].toUpperCase()} ${selectedYear}`}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-slate-300 print:text-black mt-2">
            <span>Kelas: <strong>{config.kelas}</strong></span>
            <span>Tahun Ajaran: <strong>{config.tahunAjaran}</strong></span>
            <span>Semester: <strong>{config.semester}</strong></span>
            <span>
              {reportType === 'harian' ? (
                <>Tanggal: <strong>{selectedReportDate}</strong></>
              ) : (
                <>Jumlah Pertemuan: <strong>{recordedDatesMonth.length} Hari</strong></>
              )}
            </span>
          </div>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse print-table text-xs">
            <thead>
              <tr className="bg-slate-900 print:bg-slate-200 text-slate-200 print:text-black border border-slate-700 print:border-black font-bold">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3 w-24">NIS</th>
                <th className="py-2.5 px-4">Nama Peserta Didik</th>
                <th className="py-2.5 px-2 w-12 text-center">L/P</th>
                {reportType === 'harian' ? (
                  <>
                    <th className="py-2.5 px-4 text-center w-28">Status</th>
                    <th className="py-2.5 px-4">Keterangan</th>
                  </>
                ) : (
                  <>
                    <th className="py-2.5 px-3 text-center">H</th>
                    <th className="py-2.5 px-3 text-center">S</th>
                    <th className="py-2.5 px-3 text-center">I</th>
                    <th className="py-2.5 px-3 text-center">A</th>
                    <th className="py-2.5 px-4 text-center">% Hadir</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-black">
              {students.map((student, idx) => {
                if (reportType === 'harian') {
                  const rec = activeDayRecords[student.id] || { status: 'H', catatan: '' };
                  let statusText = 'Hadir';
                  if (rec.status === 'S') statusText = 'Sakit';
                  if (rec.status === 'I') statusText = 'Izin';
                  if (rec.status === 'A') statusText = 'Alpa';

                  return (
                    <tr key={student.id} className="border border-slate-800 print:border-black">
                      <td className="py-2 px-3 text-center font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono">{student.nis}</td>
                      <td className="py-2 px-4 font-semibold">{student.nama}</td>
                      <td className="py-2 px-2 text-center">{student.jenisKelamin}</td>
                      <td className="py-2 px-4 text-center font-bold">
                        {statusText}
                      </td>
                      <td className="py-2 px-4 text-slate-400 print:text-black">
                        {rec.catatan || '-'}
                      </td>
                    </tr>
                  );
                } else {
                  // Rekap Bulanan
                  let h = 0, s = 0, i = 0, a = 0;
                  recordedDatesMonth.forEach((d) => {
                    const st = attendanceData[d]?.records[student.id]?.status;
                    if (st === 'H') h++;
                    else if (st === 'S') s++;
                    else if (st === 'I') i++;
                    else if (st === 'A') a++;
                  });
                  const total = recordedDatesMonth.length || 1;
                  const rate = Math.round((h / total) * 100);

                  return (
                    <tr key={student.id} className="border border-slate-800 print:border-black">
                      <td className="py-2 px-3 text-center font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono">{student.nis}</td>
                      <td className="py-2 px-4 font-semibold">{student.nama}</td>
                      <td className="py-2 px-2 text-center">{student.jenisKelamin}</td>
                      <td className="py-2 px-3 text-center font-bold">{h}</td>
                      <td className="py-2 px-3 text-center">{s}</td>
                      <td className="py-2 px-3 text-center">{i}</td>
                      <td className="py-2 px-3 text-center">{a}</td>
                      <td className="py-2 px-4 text-center font-mono font-bold">{rate}%</td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>

        {/* Official Signatures Section (Tanda Tangan Resmi) */}
        <div className="grid grid-cols-2 gap-8 text-xs text-slate-200 print:text-black pt-4">
          <div className="text-center">
            <p className="mb-1">Mengetahui,</p>
            <p className="font-bold">Kepala SMKS PGRI 1 Kota Sukabumi</p>
            <div className="h-20 flex items-end justify-center">
              {/* Tempat TTD */}
            </div>
            <p className="font-bold underline text-sm">{config.kepalaSekolah}</p>
            <p className="text-[11px]">NIP. {config.nipKepalaSekolah}</p>
          </div>

          <div className="text-center">
            <p className="mb-1">Sukabumi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold">Wali Kelas {config.kelas}</p>
            <div className="h-20 flex items-end justify-center">
              {/* Tempat TTD */}
            </div>
            <p className="font-bold underline text-sm">{config.waliKelas}</p>
            <p className="text-[11px]">NIP. {config.nipWaliKelas}</p>
          </div>
        </div>

      </div>

    </div>
  );
};
