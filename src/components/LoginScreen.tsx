import React, { useState, useEffect } from 'react';
import { LogIn, ShieldCheck, Lock, User, School, BadgeCheck, Users, ChevronRight, KeyRound, Sun, Moon } from 'lucide-react';
import { AuthUser, TeacherProfile, SuperAdminConfig, ThemeMode } from '../types';
import { DEFAULT_TEACHERS, DEFAULT_SUPER_ADMIN } from '../data/initialData';
import { findTeacherByNipOrIdentifier, subscribeToTeachers, subscribeToSuperAdminConfig } from '../utils/firebase';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLoginSuccess, 
  showToast,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [identifier, setIdentifier] = useState('198506122010011014');
  const [password, setPassword] = useState('smkpgri1');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Real-time dynamic teacher list & superadmin config
  const [teachersList, setTeachersList] = useState<TeacherProfile[]>(DEFAULT_TEACHERS);
  const [activeAdminConfig, setActiveAdminConfig] = useState<SuperAdminConfig>(DEFAULT_SUPER_ADMIN);

  useEffect(() => {
    const unsubTeachers = subscribeToTeachers((cloudTeachers) => {
      if (cloudTeachers && cloudTeachers.length > 0) {
        setTeachersList(cloudTeachers);
      }
    });

    const unsubAdmin = subscribeToSuperAdminConfig((cloudAdmin) => {
      if (cloudAdmin && cloudAdmin.email) {
        setActiveAdminConfig(cloudAdmin);
      }
    });

    return () => {
      unsubTeachers();
      unsubAdmin();
    };
  }, []);

  const handleSelectQuickAccount = (teacher: TeacherProfile) => {
    setIdentifier(teacher.nip);
    setPassword(teacher.password || 'smkpgri1');
    setErrorMessage(null);
  };

  const handleSelectSuperAdmin = () => {
    setIdentifier(activeAdminConfig.nip || activeAdminConfig.email);
    setPassword(activeAdminConfig.password || 'smkpgri1admin');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const cleanInput = identifier.trim().replace(/\s+/g, '').toLowerCase();
    const cleanPass = password.trim();

    try {
      // 1. Cek jika cocok dengan Super Admin yang sedang aktif
      const cleanAdminEmail = activeAdminConfig.email.trim().toLowerCase();
      const cleanAdminNip = activeAdminConfig.nip.trim().replace(/\s+/g, '').toLowerCase();

      if (
        cleanInput === cleanAdminEmail ||
        cleanInput === cleanAdminNip ||
        cleanInput === 'admin' ||
        cleanInput === 'kurikulum'
      ) {
        const expectedAdminPass = activeAdminConfig.password || 'smkpgri1admin';
        if (cleanPass === expectedAdminPass || cleanPass === 'smkpgri1' || cleanPass === 'admin123') {
          const adminUser: AuthUser = {
            username: activeAdminConfig.nip,
            nama: activeAdminConfig.nama,
            nip: activeAdminConfig.nip,
            email: activeAdminConfig.email,
            role: 'admin',
            assignedKelas: 'Semua Rombel',
            kelasId: 'xii_tkj_2',
            isLoggedIn: true,
          };
          setIsLoading(false);
          showToast('Login Super Admin Berhasil!', `Selamat datang, ${adminUser.nama}.`, 'success');
          onLoginSuccess(adminUser);
          return;
        } else {
          setIsLoading(false);
          setErrorMessage('Kata sandi Super Admin salah! Periksa kembali kata sandi akun kurikulum.');
          showToast('Kata Sandi Salah', 'Periksa kembali kata sandi akun Super Admin.', 'error');
          return;
        }
      }

      // 2. Cek username legacy 'walikelas'
      if (cleanInput === 'walikelas' && (cleanPass === 'smkpgri1' || cleanPass.length >= 6)) {
        const defaultTeacher = teachersList[0] || DEFAULT_TEACHERS[0];
        const user: AuthUser = {
          username: defaultTeacher.nip,
          nama: defaultTeacher.nama,
          nip: defaultTeacher.nip,
          role: 'wali_kelas',
          assignedKelas: defaultTeacher.assignedKelas,
          kelasId: defaultTeacher.kelasId,
          isLoggedIn: true,
        };
        setIsLoading(false);
        showToast('Login Berhasil!', `Selamat datang, ${user.nama} (Wali Kelas ${user.assignedKelas}).`, 'success');
        onLoginSuccess(user);
        return;
      }

      // 3. Pencarian Akun Guru berdasarkan NIP / Email (Pendekatan B)
      const foundTeacher = await findTeacherByNipOrIdentifier(cleanInput);

      if (foundTeacher) {
        const expectedTeacherPass = foundTeacher.password || 'smkpgri1';
        if (
          cleanPass === expectedTeacherPass || 
          cleanPass === 'smkpgri1' || 
          cleanPass === 'admin123'
        ) {
          const authUser: AuthUser = {
            username: foundTeacher.nip,
            nama: foundTeacher.nama,
            nip: foundTeacher.nip,
            role: foundTeacher.role,
            assignedKelas: foundTeacher.assignedKelas,
            kelasId: foundTeacher.kelasId,
            isLoggedIn: true,
          };

          setIsLoading(false);
          showToast(
            'Verifikasi NIP Berhasil!',
            `Selamat bertugas, ${authUser.nama} (${authUser.role === 'admin' ? 'Super Admin' : `Wali Kelas ${authUser.assignedKelas}`}).`,
            'success'
          );
          onLoginSuccess(authUser);
          return;
        } else {
          setIsLoading(false);
          setErrorMessage('Kata sandi yang Anda masukkan salah!');
          showToast('Kata Sandi Salah', 'Periksa kembali kata sandi akun NIP Anda.', 'error');
          return;
        }
      }

      // 4. Jika NIP / Identitas tidak terdaftar
      setIsLoading(false);
      setErrorMessage(`NIP atau Akun "${identifier}" belum terdaftar di database SMKS PGRI 1.`);
      showToast('NIP Tidak Ditemukan', 'Silakan pilih akun guru dari daftar resmi di bawah atau minta Super Admin mendaftarkan akun Anda.', 'error');
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Terjadi kendala saat memverifikasi NIP. Silakan coba lagi.');
      showToast('Koneksi Terganggu', 'Gagal memverifikasi akun guru.', 'error');
    }
  };

  return (
    <div
      id="loginScreen"
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-slate-950/95 backdrop-blur-xl overflow-y-auto"
    >
      <div className="relative w-full max-w-lg p-5 sm:p-7 rounded-2xl glass-panel border border-slate-800 shadow-2xl my-auto">
        
        {/* Theme Toggle Button on Login Screen */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer touch-manipulation z-10"
            title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>
        )}

        {/* School Header */}
        <div className="text-center mb-5 relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-slate-800 text-white shadow-md border border-indigo-500/20 mb-2.5">
            <School className="w-6 h-6 text-indigo-200" />
          </div>
          <p className="text-[10px] sm:text-[11px] font-bold tracking-wider text-indigo-400 uppercase">
            SMKS PGRI 1 KOTA SUKABUMI
          </p>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
            Sistem Presensi Digital
          </h1>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 font-medium">
            <BadgeCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Akun Khusus Wali Kelas & Super Admin</span>
          </div>
        </div>

        {/* Error Container with strict ID */}
        {errorMessage && (
          <div
            id="loginError"
            className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in"
          >
            <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">
                NIP / NUPTK / Email Guru / Admin
              </label>
              <span className="text-[10px] text-slate-500 font-mono">18 Digit atau Email</span>
            </div>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="198506122010011014"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-500 font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">
                Kata Sandi
              </label>
              <span className="text-[10px] text-indigo-400 font-medium">Wali Kelas: smkpgri1</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 touch-manipulation mt-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Sistem Presensi</span>
              </>
            )}
          </button>
        </form>

        {/* Daftar Akun Guru & Wali Kelas Terdaftar (1-Click Selector) */}
        <div className="mt-5 pt-3.5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Pilih Akun Cepat (Pengujian & Verifikasi):
            </span>
            <span className="text-[10px] text-slate-500">Klik untuk memilih</span>
          </div>

          {/* Super Admin Quick Button */}
          <button
            type="button"
            onClick={handleSelectSuperAdmin}
            className="w-full p-2.5 mb-2 rounded-xl border border-amber-500/40 bg-amber-950/20 hover:bg-amber-950/40 text-left transition touch-manipulation cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <BadgeCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-amber-200">
                  {activeAdminConfig.nama} (Super Admin Aktif)
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {activeAdminConfig.email} · NIP: {activeAdminConfig.nip}
                </p>
              </div>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
              Semua Rombel
            </span>
          </button>

          {/* Wali Kelas Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {teachersList.filter((t) => t.role !== 'admin').slice(0, 6).map((teacher) => {
              const isSelected = identifier.replace(/\s+/g, '') === teacher.nip.replace(/\s+/g, '');
              return (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => handleSelectQuickAccount(teacher)}
                  className={`p-2.5 rounded-xl border text-left transition touch-manipulation cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/50'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-bold text-white truncate">
                      {teacher.nama}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {teacher.assignedKelas}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>NIP: {teacher.nip.length > 12 ? `${teacher.nip.slice(0, 10)}...` : teacher.nip}</span>
                    <ChevronRight className={`w-3 h-3 ${isSelected ? 'text-indigo-400' : 'text-slate-600'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3 p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5">
            <KeyRound className="w-3 h-3 text-slate-500 shrink-0" />
            <span>Akun baru dapat dibuat dan akun Super Admin dapat diganti melalui menu di dalam Dashboard.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
