/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sistem Presensi Digital - SMKS PGRI 1 Kota Sukabumi
 * Pendekatan B: Akun Khusus Tiap Wali Kelas & Manajemen Super Admin
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  getStoredStudents, saveStudents, 
  getStoredAttendance, saveAttendanceData, 
  getStoredConfig, saveConfig, 
  getStoredFirebaseConfig, saveFirebaseConfig, 
  getStoredAuth, saveAuth 
} from './utils/storage';
import { 
  loadStudentsFromFirestore, saveStudentToFirestore, 
  loadAttendanceFromFirestore, saveAttendanceToFirestore, 
  saveConfigToFirestore, deleteStudentFromFirestore, deleteAllStudentsFromFirestore,
  subscribeToStudents, subscribeToAttendance, subscribeToConfig,
  initializeDefaultTeachers, subscribeToTeachers, saveTeacherToFirestore, deleteTeacherFromFirestore,
  subscribeToSuperAdminConfig, saveSuperAdminConfigToFirestore
} from './utils/firebase';
import { 
  Student, DailyAttendance, ClassConfig, FirebaseConfigState, 
  AuthUser, ActiveTab, TeacherProfile, SuperAdminConfig, ThemeMode 
} from './types';
import { getStoredTheme, applyTheme } from './utils/theme';
import { DEFAULT_ROMBELS, DEFAULT_TEACHERS, DEFAULT_SUPER_ADMIN, ALL_SMK_PGRI_1_ROMBELS } from './data/initialData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LoginScreen } from './components/LoginScreen';
import { AbsensiTab } from './components/AbsensiTab';
import { SiswaTab } from './components/SiswaTab';
import { RekapTab } from './components/RekapTab';
import { LaporanTab } from './components/LaporanTab';
import { PengaturanTab } from './components/PengaturanTab';
import { AkunGuruTab } from './components/AkunGuruTab';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  // State Autentikasi Pengguna
  const [user, setUser] = useState<AuthUser | null>(() => getStoredAuth());

  // State Rombel / Kelas Aktif
  const [activeKelasId, setActiveKelasId] = useState<string>(() => {
    const stored = getStoredAuth();
    return stored?.kelasId || 'xii_tkj_2';
  });

  // State Tab Navigasi Aktif
  const [activeTab, setActiveTab] = useState<ActiveTab>('absensi');

  // Tanggal Presensi Terpilih (Default Hari Ini: YYYY-MM-DD)
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // State Data Master (Tersinkronkan per Rombel / Kelas Aktif)
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents(activeKelasId));
  const [attendanceData, setAttendanceData] = useState<Record<string, DailyAttendance>>(() => getStoredAttendance(activeKelasId));
  const [config, setConfig] = useState<ClassConfig>(() => getStoredConfig(activeKelasId));
  const [firebaseConfig, setFirebaseConfigState] = useState<FirebaseConfigState>(() => getStoredFirebaseConfig());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // State Manajemen Akun Wali Kelas & Super Admin
  const [teachers, setTeachers] = useState<TeacherProfile[]>(DEFAULT_TEACHERS);
  const [superAdminConfig, setSuperAdminConfig] = useState<SuperAdminConfig>(DEFAULT_SUPER_ADMIN);

  // State Tema (Mode Gelap, Sunrise Foto 1, Neon Foto 2, Mode Terang)
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: ThemeMode = prev === 'light' ? 'dark' : 'light';
      applyTheme(next);
      return next;
    });
  }, []);

  const handleChangeTheme = useCallback((newTheme: ThemeMode) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  }, []);

  // State Sistem Notifikasi Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Inisialisasi awal Master Guru & Berlangganan Real-Time Akun Guru & Super Admin
  useEffect(() => {
    let isMounted = true;

    // Seed jika perlu
    initializeDefaultTeachers().catch((err) => {
      console.warn('Inisialisasi akun guru:', err);
    });

    // 1. Berlangganan real-time daftar akun wali kelas
    const unsubTeachers = subscribeToTeachers(
      (cloudTeachers) => {
        if (!isMounted) return;
        if (cloudTeachers && cloudTeachers.length > 0) {
          setTeachers(cloudTeachers);
        }
      },
      (err) => {
        console.warn('Gagal subscribe teachers:', err);
      }
    );

    // 2. Berlangganan real-time konfigurasi super admin
    const unsubSuperAdmin = subscribeToSuperAdminConfig(
      (cloudSuperAdmin) => {
        if (!isMounted) return;
        if (cloudSuperAdmin && cloudSuperAdmin.email) {
          setSuperAdminConfig(cloudSuperAdmin);
        }
      },
      (err) => {
        console.warn('Gagal subscribe superadmin config:', err);
      }
    );

    return () => {
      isMounted = false;
      unsubTeachers();
      unsubSuperAdmin();
    };
  }, []);

  // Update data lokal saat activeKelasId berganti
  useEffect(() => {
    const loadedStudents = getStoredStudents(activeKelasId);
    const loadedAttendance = getStoredAttendance(activeKelasId);
    let loadedConfig = getStoredConfig(activeKelasId);

    // Sesuaikan konfigurasi dengan rombel terpilih jika default
    const rombelInfo = ALL_SMK_PGRI_1_ROMBELS.find((r) => r.id === activeKelasId);
    if (rombelInfo) {
      // Cari wali kelas yang ditugaskan ke rombel ini
      const assignedTeacher = teachers.find((t) => t.kelasId === activeKelasId);
      loadedConfig = {
        ...loadedConfig,
        kelas: rombelInfo.nama,
        programKeahlian: rombelInfo.jurusan,
        waliKelas: assignedTeacher?.nama || rombelInfo.waliKelasNama || loadedConfig.waliKelas,
        nipWaliKelas: assignedTeacher?.nip || rombelInfo.waliKelasNip || loadedConfig.nipWaliKelas,
      };
    }

    setStudents(loadedStudents);
    setAttendanceData(loadedAttendance);
    setConfig(loadedConfig);
  }, [activeKelasId, teachers]);

  // Sinkronisasi Real-Time dengan Firebase Cloud Firestore (onSnapshot) sesuai Kelas Aktif
  useEffect(() => {
    let isMounted = true;
    setIsSyncing(true);

    // 1. Berlangganan (Subscribe) perubahan real-time data Siswa untuk kelas aktif
    const unsubStudents = subscribeToStudents(
      (cloudStudents) => {
        if (!isMounted) return;
        setIsSyncing(false);
        if (cloudStudents && cloudStudents.length > 0) {
          setStudents(cloudStudents);
          saveStudents(cloudStudents, activeKelasId);
        }
      },
      activeKelasId,
      (err) => {
        console.warn(`Real-time sync siswa [${activeKelasId}] offline:`, err);
        if (isMounted) setIsSyncing(false);
      }
    );

    // 2. Berlangganan (Subscribe) perubahan real-time data Absensi untuk kelas aktif
    const unsubAttendance = subscribeToAttendance(
      (cloudAttendance) => {
        if (!isMounted) return;
        if (cloudAttendance && Object.keys(cloudAttendance).length > 0) {
          setAttendanceData(cloudAttendance);
          saveAttendanceData(cloudAttendance, activeKelasId);
        }
      },
      activeKelasId,
      (err) => {
        console.warn(`Real-time sync absensi [${activeKelasId}] offline:`, err);
      }
    );

    // 3. Berlangganan (Subscribe) perubahan profil / pengaturan kelas
    const unsubConfig = subscribeToConfig(
      (cloudConfig) => {
        if (!isMounted) return;
        if (cloudConfig && cloudConfig.kelas) {
          setConfig(cloudConfig);
          saveConfig(cloudConfig, activeKelasId);
        }
      },
      activeKelasId,
      (err) => {
        console.warn(`Real-time sync config [${activeKelasId}] offline:`, err);
      }
    );

    // Initial check: jika cloud kosong dan kelas adalah xii_tkj_2, seed ke cloud
    (async () => {
      try {
        const [cloudSiswa, cloudAbsen] = await Promise.all([
          loadStudentsFromFirestore(activeKelasId),
          loadAttendanceFromFirestore(activeKelasId),
        ]);
        if (!isMounted) return;

        if (cloudSiswa && cloudSiswa.length > 0) {
          setStudents(cloudSiswa);
          saveStudents(cloudSiswa, activeKelasId);
        } else if (activeKelasId === 'xii_tkj_2') {
          // Inisialisasi awal ke cloud jika database kosong
          const localStudents = getStoredStudents(activeKelasId);
          for (const s of localStudents) {
            await saveStudentToFirestore({ ...s, kelasId: activeKelasId }, activeKelasId);
          }
        }

        if (cloudAbsen && Object.keys(cloudAbsen).length > 0) {
          setAttendanceData(cloudAbsen);
          saveAttendanceData(cloudAbsen, activeKelasId);
        }
      } catch (e) {
        console.warn('Inisialisasi Firestore background:', e);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    })();

    return () => {
      isMounted = false;
      unsubStudents();
      unsubAttendance();
      unsubConfig();
    };
  }, [activeKelasId]);

  // Handler Sinkronisasi Manual dari Header
  const handleManualSync = async () => {
    setIsSyncing(true);
    showToast(
      'Sinkronisasi Cloud...',
      `Mengambil data terbaru kelas ${config.kelas} langsung dari Cloud Firestore...`,
      'info'
    );
    try {
      const [cloudStudents, cloudAttendance] = await Promise.all([
        loadStudentsFromFirestore(activeKelasId),
        loadAttendanceFromFirestore(activeKelasId),
      ]);

      let syncCount = 0;
      if (cloudStudents && cloudStudents.length > 0) {
        setStudents(cloudStudents);
        saveStudents(cloudStudents, activeKelasId);
        syncCount += cloudStudents.length;
      }
      if (cloudAttendance && Object.keys(cloudAttendance).length > 0) {
        setAttendanceData(cloudAttendance);
        saveAttendanceData(cloudAttendance, activeKelasId);
      }

      showToast(
        'Sinkronisasi Berhasil!',
        `Data ${syncCount > 0 ? `${syncCount} siswa & riwayat absensi` : 'terbaru'} ${config.kelas} sukses disinkronkan dengan Cloud Firestore.`,
        'success'
      );
    } catch (err) {
      console.error('Manual sync failed:', err);
      showToast('Status Sinkronisasi', 'Koneksi ke Firestore tetap tersimpan dan termuat.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handler Ganti Kelas (Khusus Super Admin)
  const handleChangeKelas = (newKelasId: string) => {
    setActiveKelasId(newKelasId);
    const targetRombel = ALL_SMK_PGRI_1_ROMBELS.find((r) => r.id === newKelasId);
    showToast(
      'Beralih Rombel',
      `Menampilkan data presensi dan siswa untuk kelas ${targetRombel?.nama || newKelasId}.`,
      'info'
    );
  };

  // Handler Tambah / Update Akun Guru & Wali Kelas
  const handleSaveTeacher = async (teacher: TeacherProfile) => {
    await saveTeacherToFirestore(teacher);
    setTeachers((prev) => {
      const idx = prev.findIndex((t) => t.id === teacher.id || t.nip === teacher.nip);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = teacher;
        return copy;
      }
      return [...prev, teacher];
    });
  };

  // Handler Hapus Akun Guru
  const handleDeleteTeacher = async (teacherId: string) => {
    await deleteTeacherFromFirestore(teacherId);
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
  };

  // Handler Ganti Akun Super Admin
  const handleSaveSuperAdminConfig = async (newConfig: SuperAdminConfig) => {
    await saveSuperAdminConfigToFirestore(newConfig);
    setSuperAdminConfig(newConfig);

    // Jika user yang sedang login adalah super admin, perbarui sesi aktifnya
    if (user?.role === 'admin') {
      const updatedUser: AuthUser = {
        ...user,
        nama: newConfig.nama,
        nip: newConfig.nip,
        username: newConfig.nip,
        email: newConfig.email,
      };
      setUser(updatedUser);
      saveAuth(updatedUser);
    }
  };

  // Handler Hapus Siswa (Lokal + Cloud Firestore)
  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudentFromFirestore(studentId);
    } catch (err) {
      console.warn('Gagal menghapus siswa dari Firestore:', err);
    }
  };

  // Handler Hapus Seluruh Siswa Rombel Ini (Lokal + Cloud Firestore)
  const handleDeleteAllStudents = async () => {
    try {
      await deleteAllStudentsFromFirestore(activeKelasId);
      setStudents([]);
      saveStudents([], activeKelasId);
    } catch (err) {
      console.warn('Gagal menghapus seluruh siswa dari Firestore:', err);
      setStudents([]);
      saveStudents([], activeKelasId);
    }
  };

  // Handler Login & Logout
  const handleLoginSuccess = (authUser: AuthUser) => {
    setUser(authUser);
    setActiveKelasId(authUser.kelasId || 'xii_tkj_2');
    saveAuth(authUser);
  };

  const handleLogout = () => {
    setUser(null);
    saveAuth(null);
    showToast('Berhasil Keluar', 'Sesi login guru telah diakhiri dengan aman.', 'info');
  };

  // Handler Simpan Presensi Harian (Lokal + Cloud Firestore)
  const handleSaveAttendance = async (date: string, records: Record<string, any>) => {
    const updatedDaily: DailyAttendance = {
      date,
      records,
      updatedAt: new Date().toISOString(),
      updatedBy: `${user?.nama || 'Wali Kelas'} (${user?.nip ? `NIP: ${user.nip}` : config.kelas})`,
      kelasId: activeKelasId,
    };

    const newAttendance = {
      ...attendanceData,
      [date]: updatedDaily,
    };

    setAttendanceData(newAttendance);
    saveAttendanceData(newAttendance, activeKelasId);

    // Sinkronisasi langsung ke Firebase Cloud Firestore
    try {
      await saveAttendanceToFirestore(updatedDaily, activeKelasId);
    } catch (e) {
      console.warn('Disimpan secara lokal, akan disinkronkan ke Firestore saat terhubung.');
    }
  };

  // Handler Simpan Master Siswa (Lokal + Cloud Firestore)
  const handleSaveStudents = async (newStudents: Student[]) => {
    const taggedStudents = newStudents.map((s) => ({
      ...s,
      kelasId: s.kelasId || activeKelasId,
    }));

    setStudents(taggedStudents);
    saveStudents(taggedStudents, activeKelasId);

    // Simpan ke Cloud Firestore
    try {
      for (const student of taggedStudents) {
        await saveStudentToFirestore(student, activeKelasId);
      }
    } catch (e) {
      console.warn('Data siswa tersimpan di cache lokal.');
    }
  };

  // Handler Simpan Identitas Kelas
  const handleSaveConfig = async (newConfig: ClassConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig, activeKelasId);

    try {
      await saveConfigToFirestore(newConfig, activeKelasId);
    } catch (e) {
      console.warn('Konfigurasi tersimpan lokal.');
    }
  };

  // Handler Simpan Konfigurasi Firebase
  const handleSaveFirebaseConfig = (newFirebaseConfig: FirebaseConfigState) => {
    setFirebaseConfigState(newFirebaseConfig);
    saveFirebaseConfig(newFirebaseConfig);
  };

  // Handler Pulihkan Data (Backup Restore)
  const handleRestoreData = (
    newStudents: Student[],
    newAttendance: Record<string, DailyAttendance>,
    newConfig: ClassConfig
  ) => {
    const taggedStudents = newStudents.map((s) => ({
      ...s,
      kelasId: s.kelasId || activeKelasId,
    }));

    setStudents(taggedStudents);
    saveStudents(taggedStudents, activeKelasId);
    setAttendanceData(newAttendance);
    saveAttendanceData(newAttendance, activeKelasId);
    setConfig(newConfig);
    saveConfig(newConfig, activeKelasId);
  };

  // Hitung Statistik Presensi Hari Ini Secara Real-time untuk Header
  const todayStats = useMemo(() => {
    const todayRecords = attendanceData[currentDate]?.records || {};
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;

    students.forEach((s) => {
      const rec = todayRecords[s.id];
      if (rec) {
        if (rec.status === 'H') hadir++;
        else if (rec.status === 'S') sakit++;
        else if (rec.status === 'I') izin++;
        else if (rec.status === 'A') alpa++;
      }
    });

    const totalFilled = hadir + sakit + izin + alpa;
    const rate = totalFilled > 0 ? Math.round((hadir / totalFilled) * 100) : 100;

    return {
      hadir,
      sakit,
      izin,
      alpa,
      belum: Math.max(0, students.length - totalFilled),
      rate,
    };
  }, [attendanceData, currentDate, students]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] relative selection:bg-cyan-500 selection:text-white transition-colors duration-500">
      
      {/* Background Decorative Gradients & Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 no-print transition-opacity duration-700">
        {theme === 'sunrise' ? (
          <>
            {/* Palette Foto 1: Ocean Cyan, Golden Amber & Sunset Orange */}
            <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-cyan-500/18 rounded-full blur-[100px]" />
            <div className="absolute top-1/4 -right-32 w-[32rem] h-[32rem] bg-amber-500/16 rounded-full blur-[110px]" />
            <div className="absolute -bottom-36 left-1/4 w-[36rem] h-[36rem] bg-orange-600/15 rounded-full blur-[120px]" />
          </>
        ) : theme === 'neon' ? (
          <>
            {/* Palette Foto 2: Deep Indigo, Electric Violet & Neon Fuchsia */}
            <div className="absolute -top-32 right-1/4 w-[32rem] h-[32rem] bg-indigo-600/16 rounded-full blur-[100px]" />
            <div className="absolute top-1/3 -right-28 w-[34rem] h-[34rem] bg-purple-600/20 rounded-full blur-[110px]" />
            <div className="absolute -bottom-32 -left-20 w-[36rem] h-[36rem] bg-pink-500/22 rounded-full blur-[120px]" />
          </>
        ) : theme === 'light' ? (
          <>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 left-1/4 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl" />
          </>
        ) : (
          <>
            {/* Default Dark Slate */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
          </>
        )}
      </div>

      {/* Login Screen (Tampil jika belum login) */}
      {!user && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          showToast={showToast}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      )}

      {/* Main Dashboard UI (Hanya aktif jika sudah login) */}
      {user && (
        <>
          <Header
            config={config}
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            totalStudents={students.length}
            todayStats={todayStats}
            isSyncing={isSyncing}
            onManualSync={handleManualSync}
            onLogout={handleLogout}
            activeKelasId={activeKelasId}
            onChangeKelas={handleChangeKelas}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 z-10 relative">
            {activeTab === 'absensi' && (
              <AbsensiTab
                students={students}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                attendanceData={attendanceData}
                onSaveAttendance={handleSaveAttendance}
                config={config}
                showToast={showToast}
              />
            )}

            {activeTab === 'siswa' && (
              <SiswaTab
                students={students}
                onSaveStudents={handleSaveStudents}
                onDeleteStudent={handleDeleteStudent}
                onDeleteAllStudents={handleDeleteAllStudents}
                showToast={showToast}
              />
            )}

            {activeTab === 'rekap' && (
              <RekapTab
                students={students}
                attendanceData={attendanceData}
                config={config}
                showToast={showToast}
              />
            )}

            {activeTab === 'laporan' && (
              <LaporanTab
                students={students}
                attendanceData={attendanceData}
                currentDate={currentDate}
                config={config}
                showToast={showToast}
              />
            )}

            {activeTab === 'akun' && user.role === 'admin' && (
              <AkunGuruTab
                currentUser={user}
                teachers={teachers}
                superAdminConfig={superAdminConfig}
                onSaveTeacher={handleSaveTeacher}
                onDeleteTeacher={handleDeleteTeacher}
                onSaveSuperAdminConfig={handleSaveSuperAdminConfig}
                showToast={showToast}
              />
            )}

            {activeTab === 'pengaturan' && (
              <PengaturanTab
                config={config}
                onSaveConfig={handleSaveConfig}
                firebaseConfig={firebaseConfig}
                onSaveFirebaseConfig={handleSaveFirebaseConfig}
                onRestoreData={handleRestoreData}
                showToast={showToast}
                onOpenAkunTab={() => setActiveTab('akun')}
                isAdmin={user.role === 'admin'}
                theme={theme}
                onToggleTheme={handleToggleTheme}
                onChangeTheme={handleChangeTheme}
              />
            )}
          </main>

          {/* Mobile Bottom Navigation */}
          <BottomNav 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isAdmin={user.role === 'admin'} 
          />

          {/* Desktop Footer (Hidden on print & hidden on mobile) */}
          <footer className="w-full border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 no-print z-10 hidden md:block">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
              <p>
                Sistem Presensi Digital &copy; 2026 · <strong>SMKS PGRI 1 Kota Sukabumi</strong> · {config.kelas}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>
                  Wali Kelas: <strong className="text-indigo-400 font-medium">{config.waliKelas}</strong>
                  {config.nipWaliKelas ? ` (NIP: ${config.nipWaliKelas})` : ''}
                </span>
                <span className="text-slate-700">|</span>
                <span className="text-emerald-400 font-mono text-[10px]">
                  Hak Akses: {user.role === 'admin' ? 'SUPER ADMIN (PENGELOLA)' : `WALI KELAS (${user.assignedKelas})`}
                </span>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Toast Notification Container with #toast ID */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
