import React, { useState, useEffect } from 'react';
import { 
  Calendar, Search, CheckCheck, Save, MessageSquare, AlertCircle, 
  Send, RefreshCw, UserCheck, Filter, FileText, ChevronLeft, ChevronRight, 
  LayoutList, LayoutGrid, Phone, Check 
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
  
  // View mode: 'cards' (optimal untuk HP guru) vs 'table' (optimal untuk laptop/desktop)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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
        // Default Hadir
        initial[s.id] = {
          status: 'H',
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
    showToast('Aksi Cepat Berhasil', 'Seluruh siswa telah diatur ke status HADIR (H).', 'success');
  };

  // Fungsi simpan presensi
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
    showToast('Presensi Disimpan!', `Data presensi tanggal ${currentDate} berhasil disimpan.`, 'success');
  };

  // Navigasi Tanggal Cepat (< Hari Sebelumnya, Hari Berikutnya >)
  const adjustDate = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
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
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      
      {/* Date Navigation & Primary Controls */}
      <div className="glass-panel p-3.5 sm:p-5 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Date Picker with Quick Previous/Next Day Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustDate(-1)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition touch-manipulation cursor-pointer"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex-1 sm:flex-initial relative">
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl glass-input text-xs sm:text-sm text-white font-medium cursor-pointer"
              />
            </div>

            <button
              onClick={() => adjustDate(1)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition touch-manipulation cursor-pointer"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons: Set Semua Hadir & Simpan Presensi */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSetSemuaHadir}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition touch-manipulation cursor-pointer active:scale-95"
              title="Tandai semua siswa hadir"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Semua Hadir</span>
            </button>

            <button
              onClick={saveAttendance}
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition touch-manipulation cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan</span>
            </button>
          </div>
        </div>

        {/* Real-time Summary Counters Bar */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3 mt-3 pt-3 border-t border-slate-800/80">
          <div className="glass-card p-2 sm:p-3 rounded-xl border border-emerald-500/20 text-center sm:text-left">
            <span className="text-[10px] sm:text-xs text-emerald-300/90 font-medium">Hadir (H)</span>
            <p className="text-lg sm:text-2xl font-bold text-white font-mono mt-0.5">{summary.hadir}</p>
          </div>

          <div className="glass-card p-2 sm:p-3 rounded-xl border border-amber-500/20 text-center sm:text-left">
            <span className="text-[10px] sm:text-xs text-amber-300/90 font-medium">Sakit (S)</span>
            <p className="text-lg sm:text-2xl font-bold text-white font-mono mt-0.5">{summary.sakit}</p>
          </div>

          <div className="glass-card p-2 sm:p-3 rounded-xl border border-cyan-500/20 text-center sm:text-left">
            <span className="text-[10px] sm:text-xs text-cyan-300/90 font-medium">Izin (I)</span>
            <p className="text-lg sm:text-2xl font-bold text-white font-mono mt-0.5">{summary.izin}</p>
          </div>

          <div className="glass-card p-2 sm:p-3 rounded-xl border border-rose-500/20 text-center sm:text-left">
            <span className="text-[10px] sm:text-xs text-rose-300/90 font-medium">Alpa (A)</span>
            <p className="text-lg sm:text-2xl font-bold text-white font-mono mt-0.5">{summary.alpa}</p>
          </div>

          <div className="hidden sm:block glass-card p-3 rounded-xl border border-indigo-500/20">
            <span className="text-xs text-indigo-300 font-medium">Persentase</span>
            <p className="text-2xl font-bold text-indigo-200 font-mono mt-0.5">{persentaseHadir}%</p>
          </div>
        </div>
      </div>

      {/* Search, Filter, and View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nama Siswa atau NIS..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-500"
          />
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          
          {/* Quick status filters */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
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
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition touch-manipulation cursor-pointer shrink-0 ${
                  filterStatus === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Toggle View Mode: Cards (HP) vs Table (PC) */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition ${viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              title="Tampilan Kartu (Optimal untuk HP)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              title="Tampilan Tabel (Optimal untuk Komputer)"
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 ? (
        <div className="p-8 text-center text-slate-400 glass-panel rounded-2xl border border-slate-800">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="font-semibold text-white text-sm">Tidak ada siswa yang cocok.</p>
          <p className="text-xs text-slate-400 mt-0.5">Periksa kata kunci pencarian atau ganti filter status.</p>
        </div>
      ) : viewMode === 'cards' ? (
        
        /* 📱 MOBILE ERGONOMIC CARDS VIEW (Dirancang khusus untuk kenyamanan tangan guru di HP) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {filteredStudents.map((student, idx) => {
            const currentRec = localRecords[student.id] || { status: 'H', catatan: '' };
            const isAbsent = currentRec.status !== 'H';

            return (
              <div
                key={student.id}
                className="glass-panel p-3.5 rounded-2xl border border-slate-800/90 shadow-sm transition hover:border-slate-700"
              >
                {/* Student Info Row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm ${
                        student.jenisKelamin === 'L'
                          ? 'bg-slate-800 text-blue-300 border border-blue-500/20'
                          : 'bg-slate-800 text-pink-300 border border-pink-500/20'
                      }`}
                    >
                      {student.nama.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm leading-snug truncate">
                        {idx + 1}. {student.nama}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-mono text-indigo-300">{student.nis}</span>
                        <span>·</span>
                        <span>{student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Note & WA shortcuts */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openNoteModal(student)}
                      className={`p-1.5 rounded-lg border transition touch-manipulation cursor-pointer ${
                        currentRec.catatan
                          ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                      title={currentRec.catatan || 'Tambah Catatan'}
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>

                    {isAbsent && (
                      <a
                        href={getWhatsAppLink(
                          student.noHpOrtu,
                          createDailyAttendanceWAMessage(student, currentRec.status, currentDate, currentRec.catatan, config)
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 hover:text-white transition touch-manipulation"
                        title="Kirim notifikasi WA ke orang tua"
                      >
                        <i className="fa-brands fa-whatsapp text-sm"></i>
                      </a>
                    )}
                  </div>
                </div>

                {/* Optional Note Preview */}
                {currentRec.catatan && (
                  <p className="text-xs text-amber-300/90 italic mb-2.5 px-2.5 py-1 rounded-lg bg-amber-950/30 border border-amber-500/20 truncate">
                    Catatan: {currentRec.catatan}
                  </p>
                )}

                {/* 4 Ergonomic Thumb-Accessible Status Buttons (Touch target >= 44px) */}
                <div className="grid grid-cols-4 gap-1.5 touch-manipulation">
                  
                  {/* Hadir */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'H')}
                    className={`h-11 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                      currentRec.status === 'H'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-emerald-300'
                    }`}
                  >
                    {currentRec.status === 'H' && <Check className="w-3.5 h-3.5" />}
                    <span>Hadir</span>
                  </button>

                  {/* Sakit */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'S')}
                    className={`h-11 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                      currentRec.status === 'S'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                        : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-amber-300'
                    }`}
                  >
                    <span>Sakit</span>
                  </button>

                  {/* Izin */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'I')}
                    className={`h-11 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                      currentRec.status === 'I'
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                        : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-cyan-300'
                    }`}
                  >
                    <span>Izin</span>
                  </button>

                  {/* Alpa */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'A')}
                    className={`h-11 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                      currentRec.status === 'A'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                        : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-rose-300'
                    }`}
                  >
                    <span>Alpa</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        
        /* 💻 DESKTOP TABLE VIEW */
        <div className="glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3.5 w-10 text-center">No</th>
                  <th className="py-3 px-3.5 w-24">NIS</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-2 w-12 text-center">L/P</th>
                  <th className="py-3 px-4 text-center">Status Kehadiran</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-3 text-center w-24">WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.map((student, idx) => {
                  const currentRec = localRecords[student.id] || { status: 'H', catatan: '' };
                  const isAbsent = currentRec.status !== 'H';

                  return (
                    <tr key={student.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-2.5 px-3.5 text-center text-slate-400 font-mono text-xs">{idx + 1}</td>
                      <td className="py-2.5 px-3.5 font-mono text-xs text-indigo-300 font-medium">{student.nis}</td>
                      <td className="py-2.5 px-4 font-semibold text-white">{student.nama}</td>
                      <td className="py-2.5 px-2 text-center text-slate-400">{student.jenisKelamin}</td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 gap-1">
                          {(['H', 'S', 'I', 'A'] as AttendanceStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(student.id, st)}
                              className={`w-8 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                                currentRec.status === st
                                  ? st === 'H' ? 'bg-emerald-600 text-white'
                                    : st === 'S' ? 'bg-amber-500 text-slate-950'
                                    : st === 'I' ? 'bg-cyan-600 text-white'
                                    : 'bg-rose-600 text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <button
                          type="button"
                          onClick={() => openNoteModal(student)}
                          className="text-xs text-slate-400 hover:text-slate-200 truncate max-w-[150px] text-left block"
                        >
                          {currentRec.catatan || '+ Catatan'}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isAbsent ? (
                          <a
                            href={getWhatsAppLink(
                              student.noHpOrtu,
                              createDailyAttendanceWAMessage(student, currentRec.status, currentDate, currentRec.catatan, config)
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium"
                          >
                            <i className="fa-brands fa-whatsapp"></i>
                            <span className="hidden sm:inline">WA</span>
                          </a>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating Save Button on Mobile */}
      <div className="md:hidden fixed bottom-20 right-4 z-30">
        <button
          onClick={saveAttendance}
          className="px-5 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs shadow-xl shadow-indigo-600/40 flex items-center gap-2 transition active:scale-95 touch-manipulation cursor-pointer border border-indigo-400/30"
        >
          <Save className="w-4 h-4" />
          <span>Simpan ({summary.hadir} Hadir)</span>
        </button>
      </div>

      {/* Note Editing Modal */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-5 rounded-2xl glass-panel border border-slate-700 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Catatan Presensi Siswa
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              {activeNoteModal.nama} · NIS: {activeNoteModal.nis}
            </p>

            <textarea
              rows={3}
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              placeholder="Contoh: Sakit demam berdarah / Mengikuti lomba LKS..."
              className="w-full p-3 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-500 mb-4"
              autoFocus
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveNoteModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveNote}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition cursor-pointer"
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
