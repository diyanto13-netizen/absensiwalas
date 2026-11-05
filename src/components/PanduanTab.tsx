import React, { useState } from 'react';
import {
  BookOpen,
  ClipboardCheck,
  Users,
  BarChart3,
  FileText,
  Sliders,
  Shield,
  FileSpreadsheet,
  CheckCircle2,
  Database,
  HardDrive,
  Clock,
  Lock,
  HelpCircle,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Printer,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import { ActiveTab, ClassConfig } from '../types';

interface PanduanTabProps {
  config: ClassConfig;
  isAdmin?: boolean;
  onNavigateTab: (tab: ActiveTab) => void;
  totalStudents: number;
}

export const PanduanTab: React.FC<PanduanTabProps> = ({
  config,
  isAdmin = false,
  onNavigateTab,
  totalStudents,
}) => {
  const [activeSection, setActiveSection] = useState<'menu' | 'sop' | 'kapasitas' | 'faq'>('menu');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const menuGuides = [
    {
      id: 'absensi' as ActiveTab,
      badge: 'Menu Utama 1',
      title: 'Absensi Harian Peserta Didik',
      subtitle: 'Input kehadiran harian kurang dari 1 menit & kirim WA instan ke Orang Tua',
      icon: <ClipboardCheck className="w-5 h-5 text-amber-400" />,
      color: 'amber',
      steps: [
        'Pilih tanggal presensi pada kolom tanggal di bagian atas (secara otomatis terisi tanggal hari ini).',
        'Gunakan tombol cepat "Set Semua Hadir" agar seluruh siswa langsung berstatus Hadir (H), lalu cukup ubah siswa yang tidak hadir.',
        'Klik tombol status: H (Hadir - Hijau), S (Sakit - Kuning), I (Izin - Biru), atau A (Alpa - Merah) pada baris nama siswa.',
        'Klik ikon "Catatan" untuk menambahkan keterangan khusus (contoh: "Surat Dokter Klinik" atau "Izin Urusan Keluarga").',
        'Klik tombol "Simpan Presensi" agar data langsung tersimpan permanen ke Cloud Firestore dan perangkat.',
        'Klik tombol "WA Ortu" pada kartu/baris siswa untuk mengirim pemberitahuan kehadiran harian otomatis ke WhatsApp orang tua.',
      ],
    },
    {
      id: 'siswa' as ActiveTab,
      badge: 'Menu Utama 2',
      title: 'Master Data Siswa & Impor Excel (.xlsx)',
      subtitle: 'Kelola biodata siswa, nomor WA orang tua, dan unggah massal via Microsoft Excel',
      icon: <Users className="w-5 h-5 text-emerald-400" />,
      color: 'emerald',
      steps: [
        'Klik tombol "Template Excel" untuk mengunduh format resmi Microsoft Excel (.xlsx) SMKS PGRI 1 Kota Sukabumi.',
        'Isi data siswa kelas Anda (NIS, Nama Lengkap, Jenis Kelamin L/P, No HP Ortu, Alamat, Catatan) di dalam file Excel tersebut.',
        'Klik tombol "Impor Excel", pilih file .xlsx yang sudah diisi, lalu periksa tabel pratinjau yang muncul di layar.',
        'Pilih metode impor: "Gantikan Data Lama (Timpa)" untuk mengganti data contoh dengan data kelas Anda, atau "Gabungkan Data" untuk menambah siswa baru.',
        'Klik "Gantikan & Simpan ke Kelas" — seluruh data siswa langsung tersimpan ke Cloud Firestore dan tidak akan hilang saat dibuka kembali.',
        'Anda juga dapat menambah siswa satu per satu ("Tambah Siswa"), mengubah biodata, atau mengunduh cadangan Excel ("Ekspor").',
      ],
    },
    {
      id: 'rekap' as ActiveTab,
      badge: 'Menu Utama 3',
      title: 'Rekap Bulanan & Analitik Kehadiran Riil',
      subtitle: 'Pantau persentase kehadiran riil (100% akurat), grafik tren 6 bulan, & WA rekap bulanan',
      icon: <BarChart3 className="w-5 h-5 text-cyan-400" />,
      color: 'cyan',
      steps: [
        'Pilih Bulan dan Tahun yang ingin dievaluasi pada bagian filter atas.',
        'Sistem menghitung Persentase Kehadiran Riil secara murni: (Jumlah Hadir ÷ Total Hari Efektif Diabsen) × 100%.',
        'Jika siswa hadir penuh pada seluruh pertemuan yang diabsen, persentase otomatis tercatat 100% (Status: Tertib).',
        'Siswa dengan kehadiran di bawah standar minimal (< 85%) otomatis ditandai label merah "Perhatian" untuk pembinaan wali kelas.',
        'Klik tombol "Kirim Rekap" (ikon WhatsApp) pada kolom kanan tabel untuk mengirimkan rincian rekap bulanan langsung ke orang tua siswa.',
        'Klik tombol "Unduh Rekap Excel (.xlsx)" untuk mengunduh matriks rekapitulasi bulanan kelas Anda.',
      ],
    },
    {
      id: 'laporan' as ActiveTab,
      badge: 'Menu Utama 4',
      title: 'Cetak Laporan Resmi & PDF (Kop Sekolah)',
      subtitle: 'Cetak dokumen laporan presensi harian maupun bulanan siap tanda tangan',
      icon: <FileText className="w-5 h-5 text-indigo-400" />,
      color: 'indigo',
      steps: [
        'Pilih jenis dokumen laporan: "Harian" (per tanggal) atau "Bulanan" (akumulasi satu bulan penuh).',
        'Tentukan tanggal atau periode bulan/tahun yang akan dicetak.',
        'Pratinjau dokumen otomatis menampilkan Kop Resmi SMKS PGRI 1 Kota Sukabumi beserta identitas kelas dan kompetensi keahlian.',
        'Bagian bawah laporan telah dilengkapi kolom tanda tangan Kepala Sekolah dan Wali Kelas beserta NIP masing-masing.',
        'Klik tombol "Cetak / PDF" untuk mencetak langsung ke printer atau menyimpannya sebagai berkas PDF resmi.',
      ],
    },
    {
      id: 'pengaturan' as ActiveTab,
      badge: 'Menu Utama 5',
      title: 'Pengaturan Kelas, Tema PGRI & Backup Data',
      subtitle: 'Sesuaikan nama Wali Kelas, NIP, Semester, Tema Warna, dan Cadangan JSON',
      icon: <Sliders className="w-5 h-5 text-purple-400" />,
      color: 'purple',
      steps: [
        'Periksa dan perbarui Nama Wali Kelas, NIP, Tahun Ajaran, dan Semester aktif pada formulir Identitas Kelas, lalu klik "Simpan Identitas Kelas".',
        'Pilih Tema Tampilan sesuai kenyamanan: Emas & Biru Langit PGRI (Gelap), Hijau Zamrud PGRI, Merah Suluh PGRI, atau Mode Terang (Siang).',
        'Anda juga dapat mengganti Mode Gelap / Terang kapan saja melalui tombol Matahari/Bulan di pojok kanan atas layar.',
        'Gunakan fitur "Unduh JSON" untuk menyimpan salinan cadangan penuh data kelas ke perangkat Anda.',
      ],
    },
  ];

  if (isAdmin) {
    menuGuides.push({
      id: 'akun' as ActiveTab,
      badge: 'Khusus Super Admin',
      title: 'Kelola Akun Wali Kelas (21 Rombel) & Super Admin',
      subtitle: 'Buat akun login untuk seluruh wali kelas X, XI, XII & atur kredensial Super Admin',
      icon: <Shield className="w-5 h-5 text-rose-400" />,
      color: 'rose',
      steps: [
        'Buka menu "Kelola Akun Guru" (hanya tampil pada akun Super Admin / Kurikulum).',
        'Pilih salah satu dari 21 Rombel resmi SMKS PGRI 1 Kota Sukabumi (TKJ, AKL, MPLB, PM) untuk mendaftarkan atau memperbarui Wali Kelas.',
        'Masukkan Nama Lengkap Guru, NIP/Username, Email, Nomor HP, dan Kata Sandi, lalu klik Simpan.',
        'Gunakan pemilih kelas (Dropdown Rombel) di sebelah logo sekolah pada bagian atas layar untuk memantau data kelas mana pun secara real-time.',
        'Pada tab "Pengaturan Super Admin", Anda dapat mengganti nama, NIP, email, dan kata sandi akun Super Admin kapan saja sesuai kebutuhan.',
      ],
    });
  }

  const faqs = [
    {
      q: 'Mengapa saat pertama kali membuka link aplikasi langsung muncul Halaman Login?',
      a: 'Demi keamanan privasi data setiap rombel, sistem menggunakan proteksi sesi aktif. Setiap kali wali kelas membuka aplikasi pada jendela/tab baru, sistem mewajibkan login terlebih dahulu agar data antar kelas tidak tertukar.',
    },
    {
      q: 'Apakah data siswa dari satu kelas bisa tumpang tindih (tercampur) dengan kelas lain?',
      a: 'Tidak bisa. Setiap akun Wali Kelas telah dikunci secara otomatis ke kode rombelnya masing-masing (contoh: x_tkj_1, xi_akl, xii_tkj_2). Seluruh data siswa, riwayat absensi harian, dan konfigurasi disimpan terpisah berdasarkan kode rombel tersebut di Cloud Firestore.',
    },
    {
      q: 'Bagaimana cara agar data siswa hasil impor Excel tidak hilang saat aplikasi dibuka kembali?',
      a: 'Gunakan tombol "Impor Excel" pada menu Data Siswa, pilih opsi "Gantikan Data Lama (Timpa)" atau "Gabungkan Data", lalu klik tombol "Gantikan & Simpan ke Kelas" hingga muncul notifikasi hijau bahwa data telah tersimpan ke Cloud Firestore.',
    },
    {
      q: 'Bagaimana jika saat mengabsen di kelas sinyal internet sedang lemah atau terputus?',
      a: 'Aplikasi ini dirancang dengan arsitektur Dual-Storage (Offline-First + Cloud Sync). Data yang Anda simpan langsung diamankan di memori perangkat (LocalStorage) dan otomatis disinkronkan ke Google Cloud Firestore begitu koneksi internet stabil.',
    },
    {
      q: 'Bagaimana cara menghitung Persentase Kehadiran Riil di menu Rekap & pesan WhatsApp?',
      a: 'Persentase dihitung secara riil dari jumlah kehadiran dibagi total hari efektif yang telah diabsen pada bulan tersebut: (Hadir ÷ (Hadir + Sakit + Izin + Alpa)) × 100%. Jika siswa hadir di seluruh pertemuan yang diabsen, persentasenya mutlak 100%.',
    },
    {
      q: 'Bagaimana cara berganti tahun ajaran atau kenaikan kelas tahun depan?',
      a: 'Wali kelas cukup mengubah kolom "Tahun Ajaran" (misal menjadi 2027/2028) dan "Semester" pada menu Pengaturan, serta dapat mengunggah daftar siswa tahun ajaran baru melalui fitur Impor Excel (mode Gantikan Data Lama).',
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 pb-20 md:pb-8 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
              <BookOpen className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Pusat Panduan Resmi Wali Kelas
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {config.kelas} · {totalStudents} Siswa Terdaftar
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight mt-1.5">
                Tutorial Penggunaan & Dokumentasi Sistem Presensi Walas Digital
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-3xl">
                Panduan lengkap langkah demi langkah untuk Wali Kelas <strong>{config.namaSekolah}</strong> dalam mengelola data siswa, presensi harian, rekapitulasi bulanan, laporan resmi, serta informasi masa pakai & kapasitas database.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-navigation Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveSection('menu')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeSection === 'menu'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Panduan Setiap Menu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('sop')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeSection === 'sop'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. Alur Kerja Wali Kelas (SOP)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('kapasitas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeSection === 'kapasitas'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>3. Masa Pakai & Kapasitas Database</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('faq')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeSection === 'faq'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>4. Tanya Jawab (FAQ)</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: PANDUAN SETIAP MENU */}
      {activeSection === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {menuGuides.map((guide) => (
            <div
              key={guide.id}
              className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between gap-4 hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0">
                      {guide.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {guide.badge}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                        {guide.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-3.5 pb-2.5 border-b border-slate-800/80">
                  {guide.subtitle}
                </p>

                <ol className="space-y-2 text-xs text-slate-300">
                  {guide.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onNavigateTab(guide.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Buka Menu {guide.title.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 2: ALUR KERJA WALI KELAS (SOP) */}
      {activeSection === 'sop' && (
        <div className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tahap 1: Awal Semester */}
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  TAHAP 1 · AWAL SEMESTER
                </span>
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white">Persiapan Data Kelas</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dilakukan cukup <strong>1 kali</strong> pada awal semester atau tahun ajaran baru:
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Login menggunakan NIP atau Email Wali Kelas masing-masing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Buka menu <strong>Pengaturan</strong> untuk memastikan Nama Wali Kelas, NIP, dan Semester sudah sesuai.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Buka menu <strong>Data Siswa</strong> → klik <strong>Template Excel</strong> → isi daftar siswa → klik <strong>Impor Excel</strong> (pilih mode <em>Gantikan Data Lama</em>).</span>
                </li>
              </ul>
              <button
                type="button"
                onClick={() => onNavigateTab('siswa')}
                className="w-full py-2 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 transition cursor-pointer"
              >
                Ke Menu Data Siswa →
              </button>
            </div>

            {/* Tahap 2: Aktivitas Harian */}
            <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  TAHAP 2 · SETIAP HARI KBM
                </span>
                <MessageSquare className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-white">Presensi & Notifikasi WA</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dilakukan setiap pagi/jam perwalian (hanya membutuhkan waktu <strong>±30 detik</strong>):
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Buka menu <strong>Absensi Harian</strong> (tanggal otomatis disetel ke hari ini).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Klik <strong>"Set Semua Hadir"</strong>, lalu ubah status siswa yang Sakit (S), Izin (I), atau Alpa (A).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Klik <strong>"Simpan Presensi"</strong> dan kirim notifikasi WA ke orang tua siswa yang tidak hadir.</span>
                </li>
              </ul>
              <button
                type="button"
                onClick={() => onNavigateTab('absensi')}
                className="w-full py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 transition cursor-pointer"
              >
                Ke Menu Absensi Harian →
              </button>
            </div>

            {/* Tahap 3: Akhir Bulan / Semester */}
            <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  TAHAP 3 · AKHIR BULAN
                </span>
                <Printer className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-white">Evaluasi & Cetak Laporan</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dilakukan setiap akhir bulan atau menjelang pembagian rapor semester:
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Buka menu <strong>Rekap & Analitik</strong> untuk melihat persentase kehadiran riil dan mengirim rekap WA bulanan ke orang tua.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Unduh rekapitulasi dalam format <strong>Excel (.xlsx)</strong> sebagai arsip digital wali kelas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Buka menu <strong>Cetak & WhatsApp</strong> untuk mencetak dokumen laporan resmi ber-Kop Sekolah.</span>
                </li>
              </ul>
              <button
                type="button"
                onClick={() => onNavigateTab('rekap')}
                className="w-full py-2 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 transition cursor-pointer"
              >
                Ke Menu Rekap & Analitik →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: MASA PAKAI & KAPASITAS DATABASE */}
      {activeSection === 'kapasitas' && (
        <div className="space-y-4 sm:space-y-5">
          {/* Top Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <Clock className="w-4 h-4" />
                <span>Masa Pakai Aplikasi</span>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 font-mono">
                10+ Tahun
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Dapat digunakan lintas tahun ajaran tanpa batas kedaluwarsa kode.
              </p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <HardDrive className="w-4 h-4" />
                <span>Pemakaian Data / Tahun</span>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 font-mono">
                ± 18,5 MB
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Total seluruh 21 Rombel (±756 siswa) dalam 1 tahun ajaran penuh.
              </p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                <Database className="w-4 h-4" />
                <span>Kapasitas Cloud Gratis</span>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 font-mono">
                1.024 MB (1 GB)
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Kuota penyimpanan Google Cloud Firestore (hanya terpakai ~1,8% per tahun).
              </p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-indigo-500/30">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                <Lock className="w-4 h-4" />
                <span>Isolasi Data Rombel</span>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 font-mono">
                21 Kelas Terpisah
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Setiap kelas memiliki kunci ruang data mandiri bebas tumpang tindih.
              </p>
            </div>
          </div>

          {/* Detailed Breakdown Table */}
          <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                Rincian Perhitungan Kapasitas Penyimpanan Database dalam 1 Tahun
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Simulasi riil untuk seluruh <strong>21 Rombel SMKS PGRI 1 Kota Sukabumi</strong> (rata-rata 36 siswa/rombel = 756 siswa, 220 hari efektif KBM/tahun):
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-800 font-bold">
                  <tr>
                    <th className="py-2.5 px-3.5">Komponen Koleksi Database</th>
                    <th className="py-2.5 px-3.5">Volume Dokumen (1 Tahun)</th>
                    <th className="py-2.5 px-3.5">Ukuran per Dokumen</th>
                    <th className="py-2.5 px-3.5 text-right">Total Pemakaian / Tahun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  <tr>
                    <td className="py-2.5 px-3.5 font-semibold text-white">1. Data Master Siswa (21 Rombel)</td>
                    <td className="py-2.5 px-3.5 font-mono">756 dokumen siswa</td>
                    <td className="py-2.5 px-3.5 font-mono">± 0,35 KB</td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-emerald-300 font-bold">± 0,27 MB</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3.5 font-semibold text-white">2. Riwayat Presensi Harian (220 Hari Efektif)</td>
                    <td className="py-2.5 px-3.5 font-mono">21 kelas × 220 hari = 4.620 dokumen</td>
                    <td className="py-2.5 px-3.5 font-mono">± 3,80 KB</td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-emerald-300 font-bold">± 17,55 MB</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3.5 font-semibold text-white">3. Akun Wali Kelas, Super Admin & Konfigurasi</td>
                    <td className="py-2.5 px-3.5 font-mono">45 dokumen pengaturan & guru</td>
                    <td className="py-2.5 px-3.5 font-mono">± 0,50 KB</td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-emerald-300 font-bold">± 0,03 MB</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3.5 font-semibold text-white">4. Indeks & Metadata Cloud Firestore</td>
                    <td className="py-2.5 px-3.5 font-mono">Otomatis Sistem Cloud</td>
                    <td className="py-2.5 px-3.5 font-mono">-</td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-emerald-300 font-bold">± 0,65 MB</td>
                  </tr>
                  <tr className="bg-amber-500/10 font-bold text-white">
                    <td className="py-3 px-3.5" colSpan={3}>
                      TOTAL PENGGUNAAN KAPASITAS DATABASE DALAM 1 TAHUN PENUH (SELURUH SEKOLAH)
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-amber-300 text-sm">
                      ± 18,50 MB / Tahun
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-slate-200 leading-relaxed">
              <p className="font-bold text-emerald-300 mb-1">
                Kesimpulan Daya Tahan & Masa Pakai Aplikasi:
              </p>
              <p>
                Dengan pemakaian hanya sekitar <strong>18,5 MB per tahun</strong> untuk seluruh 21 rombel, kuota penyimpanan standar Google Cloud Firestore sebesar <strong>1 GB (1.024 MB)</strong> mampu menampung data presensi SMKS PGRI 1 Kota Sukabumi hingga <strong>lebih dari 50 tahun akumulasi data</strong> tanpa perlu menghapus riwayat tahun-tahun sebelumnya. Selain itu, setiap akhir tahun ajaran wali kelas dapat mengunduh arsip laporan ke format <strong>Excel (.xlsx)</strong> dan <strong>JSON</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: TANYA JAWAB (FAQ) */}
      {activeSection === 'faq' && (
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-3">
          <div className="mb-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              Pertanyaan yang Sering Diajukan Wali Kelas (FAQ)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Klik pada pertanyaan di bawah ini untuk melihat penjelasan dan solusinya.
            </p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-800/50 transition cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-white">{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-3.5 sm:px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
