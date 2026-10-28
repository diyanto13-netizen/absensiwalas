import React, { useState, useEffect } from 'react';
import { 
  Calendar, Search, CheckCheck, Save, MessageSquare, AlertCircle, 
  Send, RefreshCw, UserCheck, Filter, FileText 
} from 'lucide-react';
import { Student, AttendanceStatus, DailyAttendance, ClassConfig } from '../types';
import { getWhatsAppLink, createDailyAttendanceWAMessage } from '../utils/whatsapp';

interface AbsensiTabProps {
  students: Student[];
  currentDate: string;
  setCurrentDate: (date: string) => void;
  attendanceData: Record<string, DailyAttendance>;
  onSaveAttendance: (date: string, records: Record<string, any>) => void;
  config: ClassConfig;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const AbsensiTab: React.FC<AbsensiTabProps> = ({
  students,
  currentDate,
  setCurrentDate,
  attendanceData,
  onSaveAttendance,
  config,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | AttendanceStatus | 'BELUM'>('ALL');
  const [localRecords, setLocalRecords] = useState<Record<string, { status: AttendanceStatus; catatan?: string }>>({});
  const [activeNoteModal, setActiveNoteModal] = useState<Student | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Sinkronisasi record lokal saat tanggal atau data presensi berubah
  useEffect(() => {
    const dayData = attendanceData[currentDate];
    const initial: Record<string, { status: AttendanceStatus; catatan?: string }> = {};

    students.forEach((s) => {
      if (dayData && dayData.records[s.id]) {
        initial[s.id] = {
          status: dayData.records[s.id].status,
          catatan: dayData.records[s.id].catatan || '',
        };
      } else {
        // Default belum diisi
        initial[s.id] = {
          status: 'H', // default rekomendasi hadir untuk efisiensi guru
          catatan: '',
        };
      }
    });

    setLocalRecords(initial);
  }, [currentDate, attendanceData, students]);

  // Set status presensi untuk siswa tertentu
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setLocalRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  // Buka modal catatan
  const openNoteModal = (student: Student) => {
    setActiveNoteModal(student);
    setTempNote(localRecords[student.id]?.catatan || '');
  };

  // Simpan catatan
  const saveNote = () => {
    if (activeNoteModal) {
      setLocalRecords((prev) => ({
        ...prev,
        [activeNoteModal.id]: {
          ...prev[activeNoteModal.id],
          catatan: tempNote,
        },
      }));
      setActiveNoteModal(null);
      showToast('Catatan Disimpan', `Keterangan untuk ${activeNoteModal.nama} berhasil diperbarui.`, 'info');
    }
  };

  // Fitur massal: "Set Semua Hadir"
  const handleSetSemuaHadir = () => {
    const updated: Record<string, { status: AttendanceStatus; catatan?: string }> = {};
    students.forEach((s) => {
      updated[s.id] = {
        status: 'H',
        catatan: '',
      };
    });
    setLocalRecords(updated);
    showToast('Aksi Massal Berhasil', 'Semua siswa telah diatur ke status HADIR (H).', 'success');
  };

  // Fungsi saveAttendance sesuai instruksi teknis
  const saveAttendance = () => {
    const recordsToSave: Record<string, any> = {};
    const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    students.forEach((s) => {
      const rec = localRecords[s.id];
      recordsToSave[s.id] = {
        studentId: s.id,
        status: rec ? rec.status : 'H',
        catatan: rec ? rec.catatan : '',
        time: currentTime,
      };
    });

    onSaveAttendance(currentDate, recordsToSave);
    showToast('Presensi Disimpan!', `Data presensi tanggal ${currentDate} berhasil disimpan ke database.`, 'success');
  };

  // Hitung ringkasan status harian
  const summary = students.reduce(
    (acc, s) => {
      const st = localRecords[s.id]?.status;
      if (st === 'H') acc.hadir++;
      else if (st === 'S') acc.sakit++;
      else if (st === 'I') acc.izin++;
      else if (st === 'A') acc.alpa++;
      else acc.belum++;
      return acc;
    },
    { hadir: 0, sakit: 0, izin: 0, alpa: 0, belum: 0 }
  );

  const total = students.length || 1;
  const persentaseHadir = Math.round((summary.hadir / total) * 100);

  // Filter siswa berdasarkan pencarian dan filter status
  const filteredStudents = students.filter((s) => {
    const matchQuery =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchQuery) return false;

    if (filterStatus === 'ALL') return true;
    return localRecords[s.id]?.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Controls Card */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Date Picker & School Day Info */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-0.5">
                Tanggal Presensi:
              </label>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg glass-input text-sm text-white font-medium focus:border-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons: Set Semua Hadir & Simpan Presensi */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSetSemuaHadir}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-2 transition cursor-pointer shadow-sm hover:shadow-emerald-500/10"
              title="Set semua siswa berstatus Hadir"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Set Semua Hadir</span>
            </button>

            <button
              onClick={saveAttendance}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Presensi</span>
            </button>
          </div>
        </div>

        {/* Real-time Summary Counters Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="glass-card p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-300 font-medium">Hadir (H)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{summary.hadir}</p>
            <p className="text-[10px] text-emerald-400/80 mt-0.5">{persentaseHadir}% dari total siswa</p>
          </div>

          <div className="glass-card p-3 rounded-xl border border-amber-500/20 bg-amber-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-300 font-medium">Sakit (S)</span>
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{summary.sakit}</p>
            <p className="text-[10px] text-amber-400/80 mt-0.5">{Math.round((summary.sakit / total) * 100)}% siswa</p>
          </div>

          <div className="glass-card p-3 rounded-xl border border-cyan-500/20 bg-cyan-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-cyan-300 font-medium">Izin (I)</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{summary.izin}</p>
            <p className="text-[10px] text-cyan-400/80 mt-0.5">{Math.round((summary.izin / total) * 100)}% siswa</p>
          </div>

          <div className="glass-card p-3 rounded-xl border border-rose-500/20 bg-rose-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-rose-300 font-medium">Alpa (A)</span>
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{summary.alpa}</p>
            <p className="text-[10px] text-rose-400/80 mt-0.5">{Math.round((summary.alpa / total) * 100)}% tanpa ket.</p>
          </div>

          <div className="glass-card p-3 rounded-xl border border-blue-500/20 bg-blue-950/20 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-300 font-medium">Tingkat Hadir</span>
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-2xl font-extrabold text-cyan-200 mt-1">{persentaseHadir}%</p>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${persentaseHadir}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nama Siswa atau NIS..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-400"
          />
        </div>

        {/* Quick status pill filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'H', label: 'Hadir' },
            { id: 'S', label: 'Sakit' },
            { id: 'I', label: 'Izin' },
            { id: 'A', label: 'Alpa' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterStatus(item.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filterStatus === item.id
                  ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200'
                  : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Student Attendance Table */}
      <div className="glass-panel rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 w-28">NIS</th>
                <th className="py-3.5 px-4">Nama Peserta Didik</th>
                <th className="py-3.5 px-3 w-16 text-center">L/P</th>
                <th className="py-3.5 px-4 text-center">Status Kehadiran</th>
                <th className="py-3.5 px-4">Keterangan</th>
                <th className="py-3.5 px-4 text-center w-28">Hubungi Ortu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="font-medium text-slate-300">Tidak ada siswa ditemukan.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Coba sesuaikan kata kunci pencarian atau filter status.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const currentRec = localRecords[student.id] || { status: 'H', catatan: '' };
                  const isAbsent = currentRec.status !== 'H';
                  
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-800/40 transition duration-150"
                    >
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-cyan-300 font-medium">
                        {student.nis}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                            student.jenisKelamin === 'L'
                              ? 'bg-gradient-to-tr from-cyan-600 to-blue-700'
                              : 'bg-gradient-to-tr from-pink-600 to-purple-700'
                          }`}>
                            {student.nama.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white leading-snug">{student.nama}</p>
                            <p className="text-[11px] text-slate-400 sm:hidden">NIS: {student.nis}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            student.jenisKelamin === 'L'
                              ? 'bg-blue-950/70 text-blue-300 border border-blue-500/30'
                              : 'bg-pink-950/70 text-pink-300 border border-pink-500/30'
                          }`}
                        >
                          {student.jenisKelamin}
                        </span>
                      </td>

                      {/* Status Selector Buttons (H, S, I, A) */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex p-1 rounded-xl bg-slate-900/80 border border-white/10 gap-1">
                          {/* Hadir */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'H')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              currentRec.status === 'H'
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/30'
                            }`}
                            title="Hadir"
                          >
                            H
                          </button>

                          {/* Sakit */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'S')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              currentRec.status === 'S'
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                                : 'text-slate-400 hover:text-amber-300 hover:bg-amber-950/30'
                            }`}
                            title="Sakit"
                          >
                            S
                          </button>

                          {/* Izin */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'I')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              currentRec.status === 'I'
                                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                                : 'text-slate-400 hover:text-blue-300 hover:bg-blue-950/30'
                            }`}
                            title="Izin"
                          >
                            I
                          </button>

                          {/* Alpa */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'A')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              currentRec.status === 'A'
                                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                                : 'text-slate-400 hover:text-rose-300 hover:bg-rose-950/30'
                            }`}
                            title="Alpa / Tanpa Keterangan"
                          >
                            A
                          </button>
                        </div>
                      </td>

                      {/* Catatan / Keterangan */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openNoteModal(student)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition cursor-pointer ${
                              currentRec.catatan
                                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                                : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/20'
                            }`}
                            title="Klik untuk mengubah catatan"
                          >
                            <FileText className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="truncate max-w-[120px] sm:max-w-[160px]">
                              {currentRec.catatan || 'Tambah catatan...'}
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* WA Link to Parent */}
                      <td className="py-3 px-4 text-center">
                        {isAbsent ? (
                          <a
                            href={getWhatsAppLink(
                              student.noHpOrtu,
                              createDailyAttendanceWAMessage(student, currentRec.status, currentDate, currentRec.catatan, config)
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium transition cursor-pointer"
                            title={`Kirim WA ke ortu ${student.nama} (${student.noHpOrtu})`}
                          >
                            <i className="fa-brands fa-whatsapp text-emerald-400"></i>
                            <span>Kirim WA</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note Editing Modal */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel border border-white/20 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              Catatan Kehadiran Siswa
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {activeNoteModal.nama} • NIS: {activeNoteModal.nis}
            </p>

            <textarea
              rows={3}
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              placeholder="Contoh: Sakit demam berdarah / Mengikuti lomba LKS / Tanpa surat dokter..."
              className="w-full p-3 rounded-xl glass-input text-sm text-white placeholder-slate-500 mb-4"
              autoFocus
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveNoteModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveNote}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition cursor-pointer"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
