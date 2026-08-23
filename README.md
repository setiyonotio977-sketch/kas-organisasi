# Aplikasi Organisasi — GitHub Pages + Firebase

Starter modern yang mempertahankan modul utama referensi: profil, struktur, anggota, berita, agenda, keuangan, galeri/album, kontak, dan admin.

## Setup cepat
1. Buat project Firebase.
2. Aktifkan Authentication > Email/Password.
3. Buat Firestore Database.
4. Buat user admin di Authentication > Users.
5. Buka Project settings > Your apps > Web app, salin `firebaseConfig` ke `js/firebase-config.js`.
6. Deploy file project ini ke repository GitHub Pages.
7. Publish `firestore.rules` dari Firebase Console atau Firebase CLI.

Catatan: `apiKey` Firebase Web bukan password rahasia. Keamanan data ditentukan oleh Authentication dan Firestore Rules.

## GitHub Pages
Upload seluruh isi folder ke repository, aktifkan Settings > Pages > Deploy from branch, lalu pilih branch `main` dan folder `/ (root)`.

## Catatan tahap 1
Form URL gambar sudah disiapkan agar aplikasi bisa langsung dipakai tanpa mengharuskan Storage terlebih dahulu. Upload file Firebase Storage bisa ditambahkan pada tahap berikutnya.
