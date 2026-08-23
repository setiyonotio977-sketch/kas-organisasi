import { auth } from './firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
const form=document.querySelector('#loginForm'), status=document.querySelector('#loginStatus');
onAuthStateChanged(auth,u=>{if(u) location.href='admin.html'});
form.addEventListener('submit',async e=>{e.preventDefault();status.textContent='Masuk...';const f=new FormData(form);try{await signInWithEmailAndPassword(auth,f.get('email'),f.get('password'));location.href='admin.html'}catch(err){status.textContent=err.code?.includes('invalid-credential')?'Email atau password salah.':err.message}});
