import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';

import { collection, addDoc, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
const WORKER_URL = "https://kas-organisasi-upload.setiyonotio977.workers.dev";

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], rupiah=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0), esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));let data={finance:[],members:[],structure:[],news:[],agendas:[],albums:[],messages:[]}, currentUser;
const titles={dashboard:'Dashboard',finance:'Keuangan',members:'Anggota',structure:'Struktur',news:'Berita',agenda:'Agenda',gallery:'Galeri',messages:'Pesan',settings:'Pengaturan'};
onAuthStateChanged(auth,u=>{if(!u){location.href='login.html';return}currentUser=u;$('#adminDate').textContent=new Intl.DateTimeFormat('id-ID',{dateStyle:'full'}).format(new Date());loadAll()});
$('#logoutBtn').onclick=()=>signOut(auth);
$('#adminMenu').onclick=()=>$('#sidebar').classList.toggle('open');
$$('.side-nav button').forEach(b=>b.onclick=()=>show(b.dataset.view));$$('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));
function show(name){$$('.side-nav button').forEach(x=>x.classList.toggle('active',x.dataset.view===name));$$('.view').forEach(x=>x.classList.toggle('active',x.dataset.page===name));$('#adminTitle').textContent=titles[name]||name;$('#sidebar').classList.remove('open')}

async function deleteMemberAccount(uid) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Sesi Admin sudah berakhir. Silakan login kembali.");
  }

  const idToken = await user.getIdToken(true);

  const response = await fetch(
    "https://kas-organisasi-upload.setiyonotio977.workers.dev/delete-member",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify({ uid })
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || "Gagal menghapus akun login anggota."
    );
  }

  return data;
}

async function getCol(name,order){const q=order?query(collection(db,name),orderBy(order,'asc')):collection(db,name);const s=await getDocs(q);return s.docs.map(d=>({id:d.id,...d.data()}))}
async function loadAll(){try{[data.finance,data.members,data.structure,data.news,data.agendas,data.albums,data.messages]=await Promise.all([getCol('finance','date'),getCol('members'),getCol('structure','order'),getCol('news','date'),getCol('agendas','date'),getCol('albums'),getCol('messages','createdAt')]);renderAll()}catch(e){console.error(e);alert('Gagal memuat data. Pastikan Firebase config dan Security Rules sudah benar.\n'+e.message)}}
function renderAll(){let income=0,expense=0;data.finance.forEach(x=>{income+=+x.income||0;expense+=+x.expense||0});$('#statBalance').textContent=rupiah(income-expense);$('#statIncome').textContent=rupiah(income);$('#statExpense').textContent=rupiah(expense);$('#statMembers').textContent=data.members.length;$('#finBalance').textContent=rupiah(income-expense);$('#finIncome').textContent=rupiah(income);$('#finExpense').textContent=rupiah(expense);renderFinance();renderMembers();renderStructure();renderNews();renderAgenda();renderAlbums();renderMessages();renderDash();drawChart()}
function renderDash(){$('#dashAgenda').innerHTML=data.agendas.slice(0,4).map(x=>`<div class="list-item"><b>${esc(x.title)}</b><div>${esc(x.date||'')}</div></div>`).join('')||'<div class="list-item">Belum ada agenda.</div>';$('#dashNews').innerHTML=data.news.slice(-4).reverse().map(x=>`<div class="list-item"><b>${esc(x.title)}</b><div>${esc(x.date||'')}</div></div>`).join('')||'<div class="list-item">Belum ada berita.</div>'}
function renderFinance(){let bal=0,rows='';for(const x of data.finance){bal+=(+x.income||0)-(+x.expense||0);rows+=`<tr><td>${esc(x.date)}</td><td>${esc(x.description)}</td><td>${rupiah(x.income)}</td><td>${rupiah(x.expense)}</td><td>${rupiah(bal)}</td><td><div class="actions"><button class="icon-btn" onclick="window.editItem('finance','${x.id}')">Edit</button><button class="icon-btn danger" onclick="window.delItem('finance','${x.id}')">Hapus</button></div></td></tr>`}$('#financeTable').innerHTML=rows||'<tr><td colspan="6">Belum ada transaksi.</td></tr>'}
function renderMembers(){const term=($('#memberSearch')?.value||'').toLowerCase();$('#membersTable').innerHTML=data.members.filter(x=>[x.name,x.position,x.email,x.phone].join(' ').toLowerCase().includes(term)).map(x=>`<tr><td><b>${esc(x.name)}</b></td><td>${esc(x.position)}</td><td>${esc(x.phone||x.email||'')}</td><td>${esc(x.status||'Aktif')}</td><td><div class="actions"><button class="icon-btn" onclick="window.editItem('members','${x.id}')">Edit</button><button class="icon-btn danger" onclick="window.delItem('members','${x.id}')">Hapus</button></div></td></tr>`).join('')||'<tr><td colspan="5">Belum ada anggota.</td></tr>'}
function renderStructure(){$('#structureTable').innerHTML=data.structure.map(x=>`<tr><td>${esc(x.order)}</td><td>${esc(x.position)}</td><td>${esc(x.name)}</td><td><div class="actions"><button class="icon-btn" onclick="window.editItem('structure','${x.id}')">Edit</button><button class="icon-btn danger" onclick="window.delItem('structure','${x.id}')">Hapus</button></div></td></tr>`).join('')||'<tr><td colspan="4">Belum ada struktur.</td></tr>'}
function renderNews(){const term=($('#newsSearch')?.value||'').toLowerCase();$('#newsTable').innerHTML=data.news.filter(x=>(x.title||'').toLowerCase().includes(term)).map(x=>`<tr><td><b>${esc(x.title)}</b></td><td>${esc(x.date)}</td><td>${esc((x.content||'').slice(0,90))}</td><td><div class="actions"><button class="icon-btn" onclick="window.editItem('news','${x.id}')">Edit</button><button class="icon-btn danger" onclick="window.delItem('news','${x.id}')">Hapus</button></div></td></tr>`).join('')||'<tr><td colspan="4">Belum ada berita.</td></tr>'}
function renderAgenda(){const term=($('#agendaSearch')?.value||'').toLowerCase();$('#agendaTable').innerHTML=data.agendas.filter(x=>(x.title||'').toLowerCase().includes(term)).map(x=>`<tr><td>${esc(x.date)}</td><td><b>${esc(x.title)}</b></td><td>${esc((x.content||'').slice(0,100))}</td><td><div class="actions"><button class="icon-btn" onclick="window.editItem('agendas','${x.id}')">Edit</button><button class="icon-btn danger" onclick="window.delItem('agendas','${x.id}')">Hapus</button></div></td></tr>`).join('')||'<tr><td colspan="4">Belum ada agenda.</td></tr>'}
function renderAlbums(){$('#albumTable').innerHTML=data.albums.map(x=>`<tr><td><b>${esc(x.name)}</b></td><td>${esc(x.author||'')}</td><td>${x.cover?`<img src="${esc(x.cover)}" alt="Cover" style="width:72px;height:48px;object-fit:cover;border-radius:10px;border:1px solid var(--line)">`:'<span style="color:var(--muted)">Belum ada foto</span>'}</td><td><div class="actions"><button class="icon-btn" onclick="window.editItem('albums','${x.id}')">Edit</button><button class="icon-btn danger" onclick="window.delItem('albums','${x.id}')">Hapus</button></div></td></tr>`).join('')||'<tr><td colspan="4">Belum ada album.</td></tr>'}
function renderMessages(){$('#messageList').innerHTML=data.messages.slice().reverse().map(x=>`<article class="message"><div class="panel-head"><div><b>${esc(x.name)}</b><div>${esc(x.email)}</div></div><small>${x.createdAt?.toDate?x.createdAt.toDate().toLocaleString('id-ID'):''}</small></div><p>${esc(x.message)}</p><a class="btn ghost small" href="mailto:${esc(x.email)}?subject=${encodeURIComponent('Re: Pesan Organisasi')}">Balas Email</a></article>`).join('')||'<div class="panel">Belum ada pesan.</div>'}
function drawChart(){const c=$('#financeChart');if(!c)return;const ctx=c.getContext('2d'),w=c.clientWidth*devicePixelRatio,h=180*devicePixelRatio;c.width=w;c.height=h;ctx.clearRect(0,0,w,h);const vals=[];let b=0;data.finance.forEach(x=>{b+=(+x.income||0)-(+x.expense||0);vals.push(b)});if(!vals.length){ctx.fillStyle='#8792a6';ctx.font='14px Inter';ctx.fillText('Belum ada transaksi',20,50);return}const max=Math.max(...vals,0),min=Math.min(...vals,0),range=max-min||1;ctx.strokeStyle='#2563eb';ctx.lineWidth=3;ctx.beginPath();vals.forEach((v,i)=>{const x=20+i*(w/dpr(vals.length)),y=155*devicePixelRatio-((v-min)/range)*120*devicePixelRatio;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();function dpr(n){return n?Math.max(1,n):1}}
function fields(type,item={}){const configs={finance:[['date','Tanggal','date'],['description','Keterangan','text'],['income','Pemasukan','number'],['expense','Pengeluaran','number']],members:[['name','Nama','text'],['position','Jabatan','text'],['phone','Telepon','text'],['email','Email','email'],['gender','Jenis Kelamin','text'],['address','Alamat','text'],['status','Status','text']],structure:[['order','Urutan','number'],['position','Jabatan','text'],['name','Nama','text']],news:[['title','Judul','text'],['date','Tanggal','date'],['image','URL Foto','url'],['content','Isi','textarea']],agendas:[['title','Judul','text'],['date','Tanggal','date'],['cover','URL Cover','url'],['content','Isi Agenda','textarea']],albums:[['name','Nama Album','text'],['author','Author','text']]};let html=(configs[type]||[]).map(([k,l,t])=>`<label>${l}${t==='textarea'?`<textarea name="${k}" rows="5">${esc(item[k]||'')}</textarea>`:`<input name="${k}" type="${t}" value="${esc(item[k]??'')}">`}</label>`).join('');if(type==='albums'){html+=`<label>Foto Cover<input name="coverFile" type="file" accept="image/jpeg,image/png,image/webp"></label>${item.cover?`<div style="margin-top:-6px"><small style="display:block;color:var(--muted);margin-bottom:8px">Cover saat ini</small><img src="${esc(item.cover)}" alt="Cover saat ini" style="width:120px;height:80px;object-fit:cover;border-radius:12px;border:1px solid var(--line)"></div>`:''}`}if(type==='members'&&!item.id){html+=`<label>Password Login<input name="memberPassword" type="password" minlength="6" autocomplete="new-password" placeholder="Minimal 6 karakter" required></label>`}if(type==='members'){html+=`<label>Foto<input name="photoFile" type="file" accept="image/jpeg,image/png,image/webp"></label>${item.photo?`<div style="margin-top:-6px"><small style="display:block;color:var(--muted);margin-bottom:8px">Foto saat ini</small><img src="${esc(item.photo)}" alt="Foto saat ini" style="width:120px;height:120px;object-fit:cover;border-radius:12px;border:1px solid var(--line)"></div>`:''}`}return html}
async function uploadAlbumCover(file){
  if(!file)return '';
  const res=await fetch(`${WORKER_URL}/upload`,{
    method:'POST',
    headers:{
      'Content-Type':file.type,
      'X-Filename':file.name
    },
    body:file
  });
  const json=await res.json();
  if(!res.ok)throw new Error(json.error||'Upload gagal');
  return json.url;
}

function openModal(type,item={}){const edit=!!item.id;$('#modalRoot').innerHTML=`<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div><span class="eyebrow">${edit?'EDIT':'TAMBAH'}</span><h3>${titles[type]||type}</h3></div><button onclick="window.closeModal()">×</button></div><form id="dataForm" class="form">${fields(type,item)}<div class="modal-actions"><button type="button" class="btn ghost" onclick="window.closeModal()">Batal</button><button class="btn primary" id="saveDataBtn">Simpan</button></div></form></div></div>`;$('#dataForm').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget;const f=new FormData(form);const obj={};f.forEach((v,k)=>{if(k!=='coverFile'&&k!=='photoFile'&&k!=='memberPassword')obj[k]=k==='income'||k==='expense'||k==='order'?Number(v)||0:v});try{$('#saveDataBtn').disabled=true;$('#saveDataBtn').textContent='Menyimpan...';if(type==='albums'){const file=form.elements.coverFile?.files?.[0];if(file){$('#saveDataBtn').textContent='Upload foto...';obj.cover=await uploadAlbumCover(file)}else if(edit){obj.cover=item.cover||''}}if(type==='members'){const file=form.elements.photoFile?.files?.[0];if(file){$('#saveDataBtn').textContent='Upload foto...';obj.photo=await uploadAlbumCover(file)}else if(edit){obj.photo=item.photo||''}}if(type==='members'&&!edit){const email=String(obj.email||'').trim().toLowerCase();const password=form.elements.memberPassword?.value||'';if(!email)throw new Error('Email anggota wajib diisi.');if(password.length<6)throw new Error('Password login minimal 6 karakter.');$('#saveDataBtn').textContent='Membuat akun login...';const authRes=await fetch(`${WORKER_URL}/create-member`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const authJson=await authRes.json();if(!authRes.ok||!authJson.success)throw new Error(authJson.error||'Gagal membuat akun login anggota.');obj.authUid=authJson.uid;obj.email=email}obj.updatedAt=serverTimestamp();if(edit)await updateDoc(doc(db,type,item.id),obj);else{obj.createdAt=serverTimestamp();await addDoc(collection(db,type),obj)}closeModal();await loadAll()}catch(err){alert(err.message);$('#saveDataBtn').disabled=false;$('#saveDataBtn').textContent='Simpan'}}}
window.closeModal=()=>$('#modalRoot').innerHTML='';

window.editItem=(type,id)=>
  openModal(type,data[type].find(x=>x.id===id)||{});

window.delItem=async(type,id)=>{
  if(!confirm('Hapus data ini?')) return;

  try {
    // ========================================
    // KHUSUS ANGGOTA
    // Hapus Firebase Authentication terlebih dahulu
    // ========================================
    if(type === 'members') {

      const memberSnap =
        await getDoc(doc(db,'members',id));

      if(!memberSnap.exists()) {
        throw new Error('Data anggota tidak ditemukan.');
      }

      const member =
        memberSnap.data();

      const uid =
        String(member.authUid || member.uid || '').trim();

      if(!uid) {
        throw new Error(
          'UID akun anggota tidak ditemukan. Akun login tidak dihapus.'
        );
      }

      if(!confirm(
        'Anggota ini akan dihapus dari data dan akun login Firebase. Lanjutkan?'
      )) {
        return;
      }

      // Ambil token Admin yang sedang login
      const user = auth.currentUser;

      if(!user) {
        throw new Error(
          'Sesi Admin sudah berakhir. Silakan login kembali.'
        );
      }

      const idToken =
        await user.getIdToken(true);

      // Hapus akun Firebase Authentication
      const response =
        await fetch(
          'https://kas-organisasi-upload.setiyonotio977.workers.dev/delete-member',
          {
            method:'POST',
            headers:{
              'Content-Type':'application/json',
              'Authorization':`Bearer ${idToken}`
            },
            body:JSON.stringify({uid})
          }
        );

      const result =
        await response.json();

      if(!response.ok || !result.success) {
        throw new Error(
          result.error ||
          'Gagal menghapus akun login anggota.'
        );
      }

      // Auth berhasil dihapus.
      // Sekarang hapus dokumen Firestore.
      await deleteDoc(
        doc(db,'members',id)
      );

      alert(
        'Anggota dan akun login berhasil dihapus.'
      );

      await loadAll();
      return;
    }

    // ========================================
    // DATA LAIN
    // ========================================
    await deleteDoc(
      doc(db,type,id)
    );

    await loadAll();

  } catch(e) {
    console.error(e);
    alert(
      'Gagal menghapus data:\n' +
      (e.message || e)
    );
  }
};
$$('[data-action]').forEach(b=>b.onclick=()=>{const map={'new-finance':'finance','new-member':'members','new-structure':'structure','new-news':'news','new-agenda':'agendas','new-album':'albums'};openModal(map[b.dataset.action])});['memberSearch','newsSearch','agendaSearch','financeSearch'].forEach(id=>$('#'+id)?.addEventListener('input',renderAll));
$('#saveSettings').onclick=async()=>{const f=new FormData($('#settingsForm')),obj={};f.forEach((v,k)=>obj[k]=v);obj.updatedAt=serverTimestamp();try{await setDoc(doc(db,'settings','site'),obj,{merge:true});alert('Pengaturan tersimpan.')}catch(e){alert(e.message)}};
async function loadSettings(){try{const s=await getDoc(doc(db,'settings','site'));if(s.exists()){const f=$('#settingsForm');Object.entries(s.data()).forEach(([k,v])=>{if(f.elements[k])f.elements[k].value=v||''})}}catch(e){console.warn(e)}}
const oldLoad=loadAll;loadAll=async function(){await oldLoad();await loadSettings()};
