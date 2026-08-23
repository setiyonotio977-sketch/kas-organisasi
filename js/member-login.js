import { auth } from './firebase.js';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';

const form = document.querySelector('#memberLoginForm');
const status = document.querySelector('#memberLoginStatus');

onAuthStateChanged(auth, user => {
  if (user) location.href = 'anggota.html';
});

form.addEventListener('submit', async e => {
  e.preventDefault();

  const email = form.email.value.trim();
  const password = form.password.value;

  status.textContent = 'Memeriksa akun...';

  try {
    await signInWithEmailAndPassword(auth, email, password);
    location.href = 'anggota.html';
  } catch (err) {
    console.error(err);

    const messages = {
      'auth/invalid-credential': 'Email atau password salah.',
      'auth/user-not-found': 'Akun anggota tidak ditemukan.',
      'auth/wrong-password': 'Password salah.',
      'auth/invalid-email': 'Format email tidak valid.',
      'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.'
    };

    status.textContent = messages[err.code] || 'Login gagal. Silakan coba lagi.';
  }
});
