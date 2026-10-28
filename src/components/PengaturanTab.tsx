import React, { useState, useRef } from 'react';
import { 
  Sliders, Save, Database, Download, Upload, 
  RotateCcw, Shield, CheckCircle2, Server, Flame, Sparkles 
} from 'lucide-react';
import { ClassConfig, FirebaseConfigState, Student, DailyAttendance } from '../types';
import { exportBackupJSON } from '../utils/storage';
import { INITIAL_STUDENTS, INITIAL_CLASS_CONFIG, generateInitialAttendanceData } from '../data/initialData';

interface PengaturanTabProps {
  config: ClassConfig;
  onSaveConfig: (newConfig: ClassConfig) => void;
  firebaseConfig: FirebaseConfigState;
  onSaveFirebaseConfig: (newFirebaseConfig: FirebaseConfigState) => void;
  onRestoreData: (students: Student[], attendance: Record<string, DailyAttendance>, config: ClassConfig) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const PengaturanTab: React.FC<PengaturanTabProps> = ({
  config,
  onSaveConfig,
  firebaseConfig,
  onSaveFirebaseConfig,
  onRestoreData,
  showToast,
}) => {
  const [localConfig, setLocalConfig] = useState<ClassConfig>(config);
  const [localFirebase, setLocalFirebase] = useState<FirebaseConfigState>(firebaseConfig);
  const restoreFileRef = useRef<HTMLInputElement>(null);

  const handleSaveClassConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(localConfig);
    showToast('Pengaturan Disimpan', 'Data identitas kelas dan sekolah berhasil diperbarui.', 'success');
  };

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveFirebaseConfig(localFirebase);
    showToast('Konfigurasi Cloud Diperbarui', 'Parameter Firebase Cloud Database telah disimpan.', 'info');
  };

  // Restore dari file JSON
  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.students && parsed.config) {
          onRestoreData(parsed.students, parsed.attendance || {}, parsed.config);
          showToast('Data Dipulihkan!', 'Seluruh basis data berhasil dipulihkan dari file backup.', 'success');
        } else {
          showToast('Format Salah', 'File JSON bukan cadangan presensi yang sah.', 'error');
        }
      } catch (err: any) {
        showToast('Gagal Membaca File', err.message || 'File JSON rusak.', 'error');
      }
    };
    reader.readAsText(file);
    if (restoreFileRef.current) restoreFileRef.current.value = '';
  };

  // Reset ke awal
  const handleResetToDefault = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke kondisi default SMK PGRI 1?')) {
      const initialAttendance = generateInitialAttendanceData(INITIAL_STUDENTS);
      onRestoreData(INITIAL_STUDENTS, initialAttendance, INITIAL_CLASS_CONFIG);
      setLocalConfig(INITIAL_CLASS_CONFIG);
      showToast('Reset Selesai', 'Sistem dikembalikan ke data awal kelas XII TKJ 2.', 'info');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">
              Pengaturan Sistem & Konfigurasi Kelas
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola identitas kelas, kop surat resmi, sinkronisasi cloud Firebase, dan manajemen cadangan data.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Class & School Identity Form */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Identitas Sekolah & Wali Kelas
          </h3>

          <form onSubmit={handleSaveClassConfig} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nama Satuan Pendidikan</label>
              <input
                type="text"
                value={localConfig.namaSekolah}
                onChange={(e) => setLocalConfig({ ...localConfig, namaSekolah: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Rombel / Kelas</label>
                <input
                  type="text"
                  value={localConfig.kelas}
                  onChange={(e) => setLocalConfig({ ...localConfig, kelas: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tahun Pelajaran</label>
                <input
                  type="text"
                  value={localConfig.tahunAjaran}
                  onChange={(e) => setLocalConfig({ ...localConfig, tahunAjaran: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Program Keahlian</label>
              <input
                type="text"
                value={localConfig.programKeahlian}
                onChange={(e) => setLocalConfig({ ...localConfig, programKeahlian: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Wali Kelas</label>
                <input
                  type="text"
                  value={localConfig.waliKelas}
                  onChange={(e) => setLocalConfig({ ...localConfig, waliKelas: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">NIP Wali Kelas</label>
                <input
                  type="text"
                  value={localConfig.nipWaliKelas}
                  onChange={(e) => setLocalConfig({ ...localConfig, nipWaliKelas: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  value={localConfig.kepalaSekolah}
                  onChange={(e) => setLocalConfig({ ...localConfig, kepalaSekolah: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  value={localConfig.nipKepalaSekolah}
                  onChange={(e) => setLocalConfig({ ...localConfig, nipKepalaSekolah: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Alamat Lengkap Sekolah (Kop Surat)</label>
              <input
                type="text"
                value={localConfig.alamatSekolah}
                onChange={(e) => setLocalConfig({ ...localConfig, alamatSekolah: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 transition cursor-pointer mt-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Identitas Kelas</span>
            </button>
          </form>
        </div>

        {/* Right Column: Cloud Firebase & Backup/Restore */}
        <div className="space-y-6">
          
          {/* Cloud Database (Firebase) Config */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Integrasi Cloud Database (Firebase v10)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                Lokal + Cloud Ready
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Aplikasi menyimpan data secara instan di penyimpanan browser (Local/Offline) dan dapat disinkronkan secara aman ke Firebase Firestore.
            </p>

            <form onSubmit={handleSaveFirebase} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Project ID</label>
                <input
                  type="text"
                  placeholder="smk-pgri1-presensi"
                  value={localFirebase.projectId}
                  onChange={(e) => setLocalFirebase({ ...localFirebase, projectId: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">API Key Firebase</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={localFirebase.apiKey}
                  onChange={(e) => setLocalFirebase({ ...localFirebase, apiKey: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Server className="w-3.5 h-3.5" />
                <span>Simpan Konfigurasi Cloud</span>
              </button>
            </form>
          </div>

          {/* Backup & Restore Management */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Cadangan & Pemulihan Basis Data
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Amankan data presensi siswa secara berkala ke berkas JSON atau pulihkan data sebelumnya.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={exportBackupJSON}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/10 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Unduh Cadangan JSON</span>
              </button>

              <input
                ref={restoreFileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileRestore}
              />

              <button
                type="button"
                onClick={() => restoreFileRef.current?.click()}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/10 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pulihkan dari File</span>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Kembalikan ke data awal bawaan:</span>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Data Default</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
