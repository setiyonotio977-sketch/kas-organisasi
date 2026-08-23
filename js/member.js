import { auth, db } from './firebase.js';

import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';

import {
  collection,
  getDocs,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const $ = s => document.querySelector(s);

const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#39;'
}[m]));

async function loadMember(user) {
  $('#memberEmail').textContent = user.email || '';

  const q = query(
    collection(db, 'members'),
    where('email', '==', user.email)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    $('#profileCard').innerHTML = `
      <div class="list-item">
        <b>Akun belum terhubung dengan data anggota.</b>
        <div>Silakan hubungi administrator Paguyuban Pemuda RW11.</div>
      </div>`;
    return;
  }

  const member = snap.docs[0].data();

  $('#profileCard').innerHTML = `
    <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">

      ${member.photo ? `
        <img
          src="${esc(member.photo)}"
          alt="Foto ${esc(member.name)}"
          style="width:130px;height:130px;object-fit:cover;border-radius:18px;border:1px solid var(--line)"
        >
      ` : ''}

      <div style="flex:1;min-width:240px">
        <span class="eyebrow">DATA ANGGOTA</span>
        <h2>${esc(member.name || 'Anggota')}</h2>

        <div class="list">
          <div class="list-item">
            <small>Jabatan</small>
            <b>${esc(member.position || '-')}</b>
          </div>

          <div class="list-item">
            <small>Email</small>
            <b>${esc(member.email || user.email || '-')}</b>
          </div>

          <div class="list-item">
            <small>Telepon</small>
            <b>${esc(member.phone || '-')}</b>
          </div>

          <div class="list-item">
            <small>Jenis Kelamin</small>
            <b>${esc(member.gender || '-')}</b>
          </div>

          <div class="list-item">
            <small>Alamat</small>
            <b>${esc(member.address || '-')}</b>
          </div>

          <div class="list-item">
            <small>Status</small>
            <b>${esc(member.status || '-')}</b>
          </div>
        </div>
      </div>

    </div>
  `;
}

onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = 'login-anggota.html';
    return;
  }

  try {
    await loadMember(user);
  } catch (err) {
    console.error(err);
    $('#profileCard').innerHTML =
      '<p>Gagal memuat data anggota.</p>';
  }
});

$('#memberLogout').onclick = async () => {
  await signOut(auth);
  location.href = 'login-anggota.html';
};

document.querySelectorAll('.side-nav button').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.side-nav button')
      .forEach(x => x.classList.remove('active'));

    document.querySelectorAll('.view')
      .forEach(x => x.classList.remove('active'));

    btn.classList.add('active');

    document.querySelector(
      `.view[data-page="${btn.dataset.view}"]`
    )?.classList.add('active');
  };
});
