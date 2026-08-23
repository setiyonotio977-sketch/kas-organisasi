import { auth, db } from './firebase.js';

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';

import {
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const form = document.querySelector('#loginForm');
const status = document.querySelector('#loginStatus');

async function checkAdmin(user) {
  const snap = await getDoc(doc(db, 'admins', user.uid));

  return snap.exists() && snap.data().enabled === true;
}

onAuthStateChanged(auth, async user => {
  if (!user) return;

  try {
    if (await checkAdmin(user)) {
      location.href = 'admin.html';
    } else {
      await signOut(auth);
      status.textContent =
        'Akun ini bukan akun Admin. Gunakan Login Anggota.';
    }
  } catch (err) {
    console.error('ADMIN CHECK ERROR:', err);
    await signOut(auth);
    status.textContent =
      `Gagal cek Admin: ${err.code || 'unknown'} — ${err.message || err}`;
  }
});

form.addEventListener('submit', async e => {
  e.preventDefault();

  status.textContent = 'Masuk...';

  const f = new FormData(form);

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      String(f.get('email')).trim(),
      String(f.get('password'))
    );

    const isAdmin = await checkAdmin(credential.user);

    if (!isAdmin) {
      await signOut(auth);
      status.textContent =
        'Akun ini bukan akun Admin. Gunakan Login Anggota.';
      return;
    }

    location.href = 'admin.html';

  } catch (err) {
    console.error(err);

    if (
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/wrong-password'
    ) {
      status.textContent =
        'Email atau password salah.';
    } else {
      status.textContent =
        err.message || 'Login gagal.';
    }
  }
});
