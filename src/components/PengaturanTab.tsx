import React, { useState, useRef } from 'react';
import { 
  Sliders, Save, Database, Download, Upload, 
  RotateCcw, Shield, CheckCircle2, Server, Flame, Sparkles,
  Sun, Moon
} from 'lucide-react';
import { ClassConfig, FirebaseConfigState, Student, DailyAttendance, ThemeMode } from '../types';
import { exportBackupJSON } from '../utils/storage';
import { INITIAL_STUDENTS, INITIAL_CLASS_CONFIG, generateInitialAttendanceData } from '../data/initialData';

interface PengaturanTabProps {
  config: ClassConfig;
  onSaveConfig: (newConfig: ClassConfig) => void;
  firebaseConfig: FirebaseConfigState;
  onSaveFirebaseConfig: (newFirebaseConfig: FirebaseConfigState) => void;
  onRestoreData: (students: Student[], attendance: Record<string, DailyAttendance>, config: ClassConfig) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onOpenAkunTab?: () => void;
  isAdmin?: boolean;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  onChangeTheme?: (theme: ThemeMode) => void;
}

export const PengaturanTab: React.FC<PengaturanTabProps> = ({
  config,
  onSaveConfig,
  firebaseConfig,
  onSaveFirebaseConfig,
  onRestoreData,
  showToast,
  onOpenAkunTab,
  isAdmin = false,
  theme = 'dark',
  onToggleTheme,
  onChangeTheme,
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
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      
      {/* Title */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <Sliders className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Pengaturan Sistem & Rombel
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola identitas kelas, kop surat resmi, akun wali kelas, dan konfigurasi Cloud Firestore.
              </p>
            </div>
          </div>

          {isAdmin && onOpenAkunTab && (
            <button
              type="button"
              onClick={onOpenAkunTab}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 transition cursor-pointer touch-manipulation self-start sm:self-auto"
            >
              <Shield className="w-4 h-4 text-indigo-200" />
              <span>Kelola Akun Wali Kelas & Super Admin</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Class & School Identity Form */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3.5 pb-2 border-b border-slate-800 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            Identitas Sekolah & Wali Kelas
          </h3>

          {/* School Official Logo Badge Display */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 mb-4">
            <div className="w-12 h-14 flex items-center justify-center p-1 rounded-lg bg-slate-950/80 border border-slate-800 shrink-0">
              <img
                src="/logo-smk.png"
                alt="Logo SMKS PGRI 1"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Logo Utama Sekolah Terpasang</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">Aktif</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                SMK PGRI 1 Kota Sukabumi — YPLP PGRI
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveClassConfig} className="space-y-3.5 text-xs sm:text-sm">
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

            <div className="grid grid-cols-2 gap-2.5">
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

            <div className="grid grid-cols-2 gap-2.5">
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

            <div className="grid grid-cols-2 gap-2.5">
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
              className="w-full h-11 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer mt-2 touch-manipulation"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Identitas Rombel</span>
            </button>
          </form>
        </div>

        {/* Right Column: Theme, Cloud Firebase & Backup/Restore */}
        <div className="space-y-6">
          
          {/* Theme Mode & Background Palette Selector Card */}
          <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Tema & Warna Latar Belakang
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                {theme === 'sunrise' ? 'Sunrise Foto 1' : theme === 'neon' ? 'Neon Foto 2' : theme === 'light' ? 'Mode Terang' : 'Default Slate'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3.5 leading-relaxed">
              Pilih palet warna latar belakang sesuai selera atau rekomendasi desain dari foto identitas sekolah:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Opsi 1: Default Slate Dark */}
              <button
                type="button"
                onClick={() => {
                  if (onChangeTheme) onChangeTheme('dark');
                  else if (onToggleTheme && theme !== 'dark') onToggleTheme();
                }}
                className={`p-3 rounded-xl border flex items-center gap-3 transition cursor-pointer text-left touch-manipulation ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/60 shadow-md'
                    : 'bg-slate-900/50 hover:bg-slate-800/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
                  <Moon className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white truncate">Default Slate Dark</p>
                    {theme === 'dark' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">Deep Slate Glassmorphism</p>
                </div>
              </button>

              {/* Opsi 2: Sunrise PGRI & Ocean Amber (Rekomendasi Foto 1) */}
              <button
                type="button"
                onClick={() => {
                  if (onChangeTheme) onChangeTheme('sunrise');
                }}
                className={`p-3 rounded-xl border flex items-center gap-3 transition cursor-pointer text-left touch-manipulation ${
                  theme === 'sunrise'
                    ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400/60 shadow-md'
                    : 'bg-slate-900/50 hover:bg-slate-800/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 via-amber-500 to-orange-600 border border-cyan-400/30 flex items-center justify-center shrink-0 shadow-sm">
                  <div className="w-4 h-4 rounded-full bg-slate-950/70 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white truncate">Sunrise PGRI Horizon</p>
                    <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">Foto 1</span>
                    {theme === 'sunrise' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-cyan-300/80 truncate">Ocean Teal & Warm Amber</p>
                </div>
              </button>

              {/* Opsi 3: Cyber Midnight & Neon Fuchsia (Rekomendasi Foto 2) */}
              <button
                type="button"
                onClick={() => {
                  if (onChangeTheme) onChangeTheme('neon');
                }}
                className={`p-3 rounded-xl border flex items-center gap-3 transition cursor-pointer text-left touch-manipulation ${
                  theme === 'neon'
                    ? 'bg-fuchsia-950/60 border-fuchsia-500 ring-1 ring-fuchsia-500/60 shadow-md'
                    : 'bg-slate-900/50 hover:bg-slate-800/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-900 via-purple-700 to-pink-500 border border-fuchsia-400/30 flex items-center justify-center shrink-0 shadow-sm">
                  <div className="w-4 h-4 rounded-full bg-slate-950/70 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white truncate">Cyber Midnight Neon</p>
                    <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-pink-500/20 text-pink-300">Foto 2</span>
                    {theme === 'neon' && <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-pink-300/80 truncate">Deep Violet & Fuchsia Glow</p>
                </div>
              </button>

              {/* Opsi 4: Mode Terang (Siang) */}
              <button
                type="button"
                onClick={() => {
                  if (onChangeTheme) onChangeTheme('light');
                  else if (onToggleTheme && theme !== 'light') onToggleTheme();
                }}
                className={`p-3 rounded-xl border flex items-center gap-3 transition cursor-pointer text-left touch-manipulation ${
                  theme === 'light'
                    ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/60 shadow-md'
                    : 'bg-slate-900/50 hover:bg-slate-800/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0">
                  <Sun className="w-4 h-4 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-200 truncate">Mode Terang (Siang)</p>
                    {theme === 'light' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">Light Clean High-Contrast</p>
                </div>
              </button>

            </div>
          </div>

          {/* Cloud Database (Firebase) Config */}
          <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Koneksi Google Firebase Cloud
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/30">
                Firestore Aktif
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Presensi tersimpan instan di penyimpanan HP guru (offline-first) dan otomatis tersinkron ke Google Firestore.
            </p>

            <form onSubmit={handleSaveFirebase} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Project ID</label>
                <input
                  type="text"
                  placeholder="smk-pgri1-presensi"
                  value={localFirebase.projectId}
                  onChange={(e) => setLocalFirebase({ ...localFirebase, projectId: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">API Key Firebase</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={localFirebase.apiKey}
                  onChange={(e) => setLocalFirebase({ ...localFirebase, apiKey: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-white font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center justify-center gap-2 transition cursor-pointer touch-manipulation"
              >
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                <span>Simpan Pengaturan Cloud</span>
              </button>
            </form>
          </div>

          {/* Backup & Restore Management */}
          <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              Cadangan & Pemulihan Berkas JSON
            </h3>
            <p className="text-xs text-slate-400 mb-3.5">
              Unduh salinan data presensi siswa secara berkala ke berkas JSON atau pulihkan data sebelumnya.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => exportBackupJSON()}
                className="flex-1 h-10 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center justify-center gap-2 transition cursor-pointer touch-manipulation"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Unduh JSON</span>
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
                className="flex-1 h-10 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center justify-center gap-2 transition cursor-pointer touch-manipulation"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pulihkan JSON</span>
              </button>
            </div>

            <div className="mt-3.5 pt-3.5 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Kembalikan data default:</span>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/20 flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Awal</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
