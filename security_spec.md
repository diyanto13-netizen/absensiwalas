# Security Specification - Sistem Presensi Digital XII TKJ 2

## 1. Data Invariants
1. Peserta Didik (`/siswa/{studentId}`) harus memiliki format ID yang valid, NIS numerik, nama siswa, jenis kelamin ('L' atau 'P'), dan nomor HP orang tua.
2. Presensi Harian (`/absensi/{date}`) harus menggunakan format ID tanggal `YYYY-MM-DD`. Setiap perubahan harus memvalidasi integritas struktur data.
3. Konfigurasi Rombel (`/pengaturan/{configId}`) hanya dapat dikelola oleh staf / wali kelas terautentikasi.
4. Akses baca terbuka bagi guru/wali kelas untuk pelaporan dan absensi, sedangkan hak tulis memerlukan autentikasi atau peran admin yang sah.
5. Admin utama terdaftar melalui email pengguna runtime: `diyanto13@gmail.com`.

## 2. The Dirty Dozen Payloads
1. **Payload 1 (ID Poisoning Siswa):** Percobaan injeksi ID siswa berbahaya `../../../etc/passwd`. (Harus Ditolak)
2. **Payload 2 (Malformed Date ID):** Percobaan membuat dokumen absensi dengan ID `bukan-tanggal`. (Harus Ditolak)
3. **Payload 3 (Oversized Name Siswa):** String nama melebihi 100 karakter atau field sampah 1MB. (Harus Ditolak)
4. **Payload 4 (Invalid Gender Enum):** Pengiriman jenis kelamin di luar 'L' atau 'P' seperti 'X'. (Harus Ditolak)
5. **Payload 5 (Unauthenticated Delete Siswa):** Permintaan hapus siswa dari pengguna anonim tanpa login. (Harus Ditolak)
6. **Payload 6 (Shadow Fields Siswa):** Payload siswa yang disisipi atribut terlarang `isAdmin: true`. (Harus Ditolak)
7. **Payload 7 (Empty Records on Attendance):** Dokumen absensi tanpa atribut `records`. (Harus Ditolak)
8. **Payload 8 (Oversized Phone Number):** String nomor HP dengan panjang melebihi 30 karakter. (Harus Ditolak)
9. **Payload 9 (Invalid Semester Enum):** Semester diisi nilai selain 'Ganjil' atau 'Genap'. (Harus Ditolak)
10. **Payload 10 (Unauthorized Config Modification):** Upaya penulisan konfigurasi sekolah tanpa izin. (Harus Ditolak)
11. **Payload 11 (Empty Student Name):** Pendaftaran siswa dengan string nama kosong `""`. (Harus Ditolak)
12. **Payload 12 (Direct Arbitrary Collection Write):** Penulisan ke koleksi acak `/backdoor/secret`. (Harus Ditolak)

## 3. Test Runner Invariant Checks
Semua payload di atas diuji terhadap `firestore.rules` untuk memastikan penolakan akses (PERMISSION_DENIED) secara konsisten.
