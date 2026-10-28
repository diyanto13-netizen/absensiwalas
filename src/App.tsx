/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sistem Presensi Digital XII TKJ 2 - SMKS PGRI 1 Kota Sukabumi
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
  saveConfigToFirestore, deleteStudentFromFirestore,
  subscribeToStudents, subscribeToAttendance, subscribeToConfig
} from './utils/firebase';
import { Student, DailyAttendance, ClassConfig, FirebaseConfigState, AuthUser, ActiveTab } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LoginScreen } from './components/LoginScreen';
import { AbsensiTab } from './components/AbsensiTab';
import { SiswaTab } from './components/SiswaTab';
import { RekapTab } from './components/RekapTab';
import { LaporanTab } from './components/LaporanTab';
import { PengaturanTab } from './components/PengaturanTab';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  // State Autentikasi Pengguna
  const [user, setUser] = useState<AuthUser | null>(() => getStoredAuth());

  // State Tab Navigasi Aktif
  const [activeTab, setActiveTab] = useState<ActiveTab>('absensi');

  // Tanggal Presensi Terpilih (Default Hari Ini: YYYY-MM-DD)
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // State Data Master
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());
  const [attendanceData, setAttendanceData] = useState<Record<string, DailyAttendance>>(() => getStoredAttendance());
  const [config, setConfig] = useState<ClassConfig>(() => getStoredConfig());
  const [firebaseConfig, setFirebaseConfigState] = useState<FirebaseConfigState>(() => getStoredFirebaseConfig());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

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

  // Sinkronisasi Real-Time dengan Firebase Cloud Firestore (onSnapshot)
  useEffect(() => {
    let isMounted = true;
    setIsSyncing(true);

    // 1. Berlangganan (Subscribe) perubahan real-time data Siswa
    const unsubStudents = subscribeToStudents(
      (cloudStudents) => {
        if (!isMounted) return;
        setIsSyncing(false);
        if (cloudStudents && cloudStudents.length > 0) {
          setStudents(cloudStudents);
          saveStudents(cloudStudents);
        }
      },
      (err) => {
        console.warn('Real-time sync siswa offline:', err);
        if (isMounted) setIsSyncing(false);
      }
    );

    // 2. Berlangganan (Subscribe) perubahan real-time data Absensi
    const unsubAttendance = subscribeToAttendance(
      (cloudAttendance) => {
        if (!isMounted) return;
        if (cloudAttendance && Object.keys(cloudAttendance).length > 0) {
          setAttendanceData(cloudAttendance);
          saveAttendanceData(cloudAttendance);
        }
      },
      (err) => {
        console.warn('Real-time sync absensi offline:', err);
      }
    );

    // 3. Berlangganan (Subscribe) perubahan profil / pengaturan kelas
    const unsubConfig = subscribeToConfig(
      (cloudConfig) => {
        if (!isMounted) return;
        if (cloudConfig && cloudConfig.kelas) {
          setConfig(cloudConfig);
          saveConfig(cloudConfig);
        }
      },
      (err) => {
        console.warn('Real-time sync config offline:', err);
      }
    );

    // Initial check: jika cloud kosong, seed dari data default
    (async () => {
      try {
        const [cloudSiswa, cloudAbsen] = await Promise.all([
          loadStudentsFromFirestore(),
          loadAttendanceFromFirestore(),
        ]);
        if (!isMounted) return;

        if (cloudSiswa && cloudSiswa.length > 0) {
          setStudents(cloudSiswa);
          saveStudents(cloudSiswa);
        } else {
          // Inisialisasi awal ke cloud jika database kosong
          const localStudents = getStoredStudents();
          for (const s of localStudents) {
            await saveStudentToFirestore(s);
          }
        }

        if (cloudAbsen && Object.keys(cloudAbsen).length > 0) {
          setAttendanceData(cloudAbsen);
          saveAttendanceData(cloudAbsen);
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
  }, []);

  // Handler Sinkronisasi Manual dari Header
  const handleManualSync = async () => {
    setIsSyncing(true);
    showToast('Sinkronisasi Cloud...', 'Mengambil data terbaru langsung dari Cloud Firestore...', 'info');
    try {
      const [cloudStudents, cloudAttendance] = await Promise.all([
        loadStudentsFromFirestore(),
        loadAttendanceFromFirestore(),
      ]);

      let syncCount = 0;
      if (cloudStudents && cloudStudents.length > 0) {
        setStudents(cloudStudents);
        saveStudents(cloudStudents);
        syncCount += cloudStudents.length;
      }
      if (cloudAttendance && Object.keys(cloudAttendance).length > 0) {
        setAttendanceData(cloudAttendance);
        saveAttendanceData(cloudAttendance);
      }

      showToast(
        'Sinkronisasi Berhasil!',
        `Data ${syncCount > 0 ? `${syncCount} siswa & riwayat absensi` : 'terbaru'} sukses disinkronkan dengan Cloud Firestore.`,
        'success'
      );
    } catch (err) {
      console.error('Manual sync failed:', err);
      showToast('Status Sinkronisasi', 'Koneksi ke Firestore tetap tersimpan dan termuat.', 'info');
    } finally {
      setIsSyncing(false);
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

  // Handler Login & Logout
  const handleLoginSuccess = (authUser: AuthUser) => {
    setUser(authUser);
    saveAuth(authUser);
  };

  const handleLogout = () => {
    setUser(null);
    saveAuth(null);
    showToast('Berhasil Keluar', 'Sesi admin telah diakhiri dengan aman.', 'info');
  };

  // Handler Simpan Presensi Harian (Lokal + Cloud Firestore)
  const handleSaveAttendance = async (date: string, records: Record<string, any>) => {
    const updatedDaily: DailyAttendance = {
      date,
      records,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.nama || 'Wali Kelas XII TKJ 2',
    };

    const newAttendance = {
      ...attendanceData,
      [date]: updatedDaily,
    };

    setAttendanceData(newAttendance);
    saveAttendanceData(newAttendance);

    // Sinkronisasi langsung ke Firebase Cloud Firestore
    try {
      await saveAttendanceToFirestore(updatedDaily);
    } catch (e) {
      console.warn('Disimpan secara lokal, akan disinkronkan ke Firestore saat terhubung.');
    }
  };

  // Handler Simpan Master Siswa (Lokal + Cloud Firestore)
  const handleSaveStudents = async (newStudents: Student[]) => {
    setStudents(newStudents);
    saveStudents(newStudents);

    // Simpan ke Cloud Firestore
    try {
      for (const student of newStudents) {
        await saveStudentToFirestore(student);
      }
    } catch (e) {
      console.warn('Data siswa tersimpan di cache lokal.');
    }
  };

  // Handler Simpan Identitas Kelas
  const handleSaveConfig = async (newConfig: ClassConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);

    try {
      await saveConfigToFirestore(newConfig);
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
    setStudents(newStudents);
    saveStudents(newStudents);
    setAttendanceData(newAttendance);
    saveAttendanceData(newAttendance);
    setConfig(newConfig);
    saveConfig(newConfig);
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
      } else {
        // jika belum ada catatan pada tanggal ini, hitung sebagai belum diabsen
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] relative selection:bg-cyan-500 selection:text-white">
      
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 no-print">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Login Screen (Tampil jika belum login) */}
      {!user && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          showToast={showToast}
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

            {activeTab === 'pengaturan' && (
              <PengaturanTab
                config={config}
                onSaveConfig={handleSaveConfig}
                firebaseConfig={firebaseConfig}
                onSaveFirebaseConfig={handleSaveFirebaseConfig}
                onRestoreData={handleRestoreData}
                showToast={showToast}
              />
            )}
          </main>

          {/* Mobile Bottom Navigation (Only visible on smartphones) */}
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Desktop Footer (Hidden on print & hidden on mobile) */}
          <footer className="w-full border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 no-print z-10 hidden md:block">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
              <p>
                Sistem Presensi Digital &copy; 2026 · <strong>SMKS PGRI 1 Kota Sukabumi</strong> · Kelas XII TKJ 2
              </p>
              <p className="text-[11px] text-slate-400">
                Wali Kelas: <span className="text-indigo-400 font-medium">{config.waliKelas}</span>
              </p>
            </div>
          </footer>
        </>
      )}

      {/* Toast Notification Container with #toast ID */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
