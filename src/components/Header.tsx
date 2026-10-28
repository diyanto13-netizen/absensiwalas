import React, { useState, useEffect } from 'react';
import { School, Users, CheckCircle, Clock, LogOut, Activity, CalendarDays, Award } from 'lucide-react';
import { ClassConfig, AuthUser, ActiveTab } from '../types';

interface HeaderProps {
  config: ClassConfig;
  user: AuthUser;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  totalStudents: number;
  todayStats: {
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
    belum: number;
    rate: number;
  };
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  user,
  activeTab,
  setActiveTab,
  totalStudents,
  todayStats,
  onLogout,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'absensi', label: 'Absensi Harian', icon: 'fa-clipboard-check' },
    { id: 'siswa', label: 'Data Siswa', icon: 'fa-user-graduate' },
    { id: 'rekap', label: 'Rekap & Analitik', icon: 'fa-chart-pie' },
    { id: 'laporan', label: 'Cetak & WhatsApp', icon: 'fa-file-invoice' },
    { id: 'pengaturan', label: 'Pengaturan', icon: 'fa-sliders' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/70 border-b border-white/10 shadow-lg">
      {/* Top bar with school & stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* School & Class Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 border border-white/20 shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight leading-none">
                  {config.namaSekolah}
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                  {config.kelas}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>{config.programKeahlian}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Tapel {config.tahunAjaran} ({config.semester})</span>
              </p>
            </div>
          </div>

          {/* Real-time stats badges in header */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Clock & Date Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentTime}</span>
              <span className="text-slate-600">•</span>
              <span>{currentDate}</span>
            </div>

            {/* Total Students Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400">Total:</span>
              <span className="font-bold text-white">{totalStudents}</span>
              <span className="text-slate-400">Siswa</span>
            </div>

            {/* Attendance Rate */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-xs">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-emerald-300">Kehadiran:</span>
              <span className="font-extrabold text-emerald-200">{todayStats.rate}%</span>
            </div>

            {/* Status breakdown pills */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-white/10 text-[11px] font-medium">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" title="Hadir">
                H: {todayStats.hadir}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30" title="Sakit">
                S: {todayStats.sakit}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30" title="Izin">
                I: {todayStats.izin}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30" title="Alpa">
                A: {todayStats.alpa}
              </span>
            </div>

            {/* Cloud Firestore Connected Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold">Cloud Firestore Terhubung</span>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="text-right hidden xl:block">
                <p className="text-xs font-semibold text-white leading-tight">{user.nama}</p>
                <p className="text-[10px] text-cyan-400 font-mono">Wali Kelas XII TKJ 2</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 border border-white/10 hover:border-rose-500/30 transition cursor-pointer"
                title="Keluar / Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex items-center gap-1 sm:gap-2 mt-4 pt-2 border-t border-white/10 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <i className={`fa-solid ${item.icon} text-sm ${isActive ? 'text-white' : 'text-slate-400'}`}></i>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
