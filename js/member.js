import { auth, db } from './firebase.js';

import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';

import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const $ = s => document.querySelector(s);

const rupiah = n =>
  new Intl.NumberFormat('id-ID',{
    style:'currency',
    currency:'IDR',
    maximumFractionDigits:0
  }).format(Number(n)||0);

const esc = s =>
  String(s ?? '').replace(/[&<>"']/g,m=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[m]));

$('#logoutBtn').onclick = async () => {
  await signOut(auth);
  location.href = 'login-anggota.html';
};

onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = 'login-anggota.html';
    return;
  }

  $('#memberEmail').textContent = user.email || '';

  try {
    const [
      membersSnap,
      financeSnap,
      structureSnap,
      newsSnap,
      agendaSnap,
      albumsSnap
    ] = await Promise.all([
      getDocs(query(collection(db,'members'),limit(100))),
      getDocs(query(collection(db,'finance'),orderBy('date','asc'))),
      getDocs(query(collection(db,'structure'),orderBy('order','asc'))),
      getDocs(query(collection(db,'news'),orderBy('date','desc'),limit(6))),
      getDocs(query(collection(db,'agendas'),orderBy('date','asc'),limit(6))),
      getDocs(query(collection(db,'albums'),orderBy('createdAt','desc'),limit(12)))
    ]);

    const members = membersSnap.docs.map(d => ({
      id:d.id,
      ...d.data()
    }));

    const me = members.find(
      x => String(x.email || '').toLowerCase() ===
           String(user.email || '').toLowerCase()
    );

    if (me) {
      $('#myName').textContent = me.name || '-';
      $('#myEmail').textContent = me.email || '-';
      $('#myPosition').textContent = me.position || '-';
      $('#myPhone').textContent = me.phone || '-';
      $('#myGender').textContent = me.gender || '-';
      $('#myAddress').textContent = me.address || '-';
      $('#myStatus').textContent = me.status || '-';

      if (me.photo) {
        $('#myPhoto').src = me.photo;
      }
    } else {
      $('#myName').textContent = user.email || 'Anggota';
    }

    $('#memberCount').textContent = members.length;

    $('#membersList').innerHTML =
      members.map(x => `
        <tr>
          <td><b>${esc(x.name)}</b></td>
          <td>${esc(x.position || '-')}</td>
          <td>${esc(x.status || '-')}</td>
        </tr>
      `).join('') ||
      '<tr><td colspan="3">Belum ada data anggota.</td></tr>';

    const finance = financeSnap.docs.map(d => d.data());

    let income = 0;
    let expense = 0;

    finance.forEach(x => {
      income += Number(x.income) || 0;
      expense += Number(x.expense) || 0;
    });

    $('#income').textContent = rupiah(income);
    $('#expense').textContent = rupiah(expense);
    $('#balance').textContent = rupiah(income - expense);

    $('#financeList').innerHTML =
      finance.map(x => `
        <tr>
          <td>${esc(x.date || '-')}</td>
          <td>${esc(x.description || '-')}</td>
          <td>${Number(x.income) ? rupiah(x.income) : '-'}</td>
          <td>${Number(x.expense) ? rupiah(x.expense) : '-'}</td>
        </tr>
      `).join('') ||
      '<tr><td colspan="4">Belum ada transaksi.</td></tr>';

    $('#structureList').innerHTML =
      structureSnap.docs.map(d => {
        const x = d.data();
        return `
          <div class="member-row">
            <b>${esc(x.position || '-')}</b>
            <small>${esc(x.name || '-')}</small>
          </div>
        `;
      }).join('') ||
      '<div class="member-row">Struktur belum diisi.</div>';

    $('#agendaList').innerHTML =
      agendaSnap.docs.map(d => {
        const x = d.data();
        return `
          <div class="member-row">
            <b>${esc(x.title || '-')}</b>
            <small>${esc(x.date || '-')}</small>
          </div>
        `;
      }).join('') ||
      '<div class="member-row">Belum ada agenda.</div>';

    $('#newsList').innerHTML =
      newsSnap.docs.map(d => {
        const x = d.data();
        return `
          <article class="member-card">
            ${x.image ? `<img class="member-news-cover" src="${esc(x.image)}">` : ''}
            <h3>${esc(x.title || '-')}</h3>
            <small>${esc(x.date || '')}</small>
            <p>${esc(x.content || '')}</p>
          </article>
        `;
      }).join('') ||
      '<div class="member-row">Belum ada berita.</div>';

    $('#albumList').innerHTML =
      albumsSnap.docs.map(d => {
        const x = d.data();
        return `
          <article class="member-card">
            ${x.cover ? `<img class="member-news-cover" src="${esc(x.cover)}">` : ''}
            <h3>${esc(x.name || '-')}</h3>
            <p>${esc(x.author || '')}</p>
          </article>
        `;
      }).join('') ||
      '<div class="member-row">Belum ada album.</div>';

  } catch (err) {
    console.error(err);
    alert('Gagal memuat data anggota: ' + err.message);
  }
});
