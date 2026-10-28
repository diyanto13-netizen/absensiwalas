import React, { useState } from 'react';
import { LogIn, ShieldCheck, Lock, User, Sparkles, School } from 'lucide-react';
import { AuthUser } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, showToast }) => {
  const [username, setUsername] = useState('walikelas');
  const [password, setPassword] = useState('smkpgri1');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      // Validasi kredensial login
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      if (
        (cleanUser === 'walikelas' && cleanPass === 'smkpgri1') ||
        (cleanUser === 'admin' && cleanPass === 'admin123') ||
        (cleanUser.includes('@') && cleanPass.length >= 6)
      ) {
        const user: AuthUser = {
          username: cleanUser,
          nama: cleanUser === 'walikelas' ? 'Diyanto, S.Kom. (Wali Kelas)' : 'Administrator Presensi',
          role: 'admin',
          isLoggedIn: true,
        };
        setIsLoading(false);
        showToast('Login Berhasil!', `Selamat datang, ${user.nama}.`, 'success');
        onLoginSuccess(user);
      } else {
        setIsLoading(false);
        setErrorMessage('Username atau password salah! Gunakan akun wali kelas (walikelas / smkpgri1).');
        showToast('Gagal Masuk', 'Periksa kembali kredensial akun Anda.', 'error');
      }
    }, 400);
  };

  const handleUseDemo = () => {
    setUsername('walikelas');
    setPassword('smkpgri1');
    setErrorMessage(null);
  };

  return (
    <div
      id="loginScreen"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 20%, rgba(6, 182, 212, 0.15), transparent 50%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.12), transparent 45%)`,
      }}
    >
      <div className="relative w-full max-w-md p-8 rounded-2xl glass-panel border border-white/15 shadow-2xl overflow-hidden">
        {/* Glow orb */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* School Header */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-lg shadow-cyan-500/25 mb-4 border border-white/20">
            <School className="w-8 h-8" />
          </div>
          <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold tracking-wider text-cyan-300 uppercase rounded-full bg-cyan-950/60 border border-cyan-800/60">
            SMKS PGRI 1 KOTA SUKABUMI
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Sistem Presensi Digital
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelas XII TKJ 2 • Tahun Pelajaran 2026/2027
          </p>
        </div>

        {/* Error Container with strict ID */}
        {errorMessage && (
          <div
            id="loginError"
            className="mb-6 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-sm flex items-start gap-2.5 animate-in fade-in"
          >
            <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-rose-300">Autentikasi Gagal</p>
              <p className="text-xs text-rose-200/90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Username / NIP / Email
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="walikelas"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500 focus:border-cyan-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500 focus:border-cyan-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.99] transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Masuk ke Dashboard
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Access helper */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-slate-400 mb-2">Akses Cepat Pengujian (Demo):</p>
          <button
            type="button"
            onClick={handleUseDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs text-cyan-300 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Isi Kredensial Wali Kelas (walikelas / smkpgri1)
          </button>
        </div>
      </div>
    </div>
  );
};
