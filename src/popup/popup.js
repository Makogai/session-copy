/* popup.js – toast notifications, compressed/encrypted Firebase storage */

/* ── imports ── */
import {
  initializeApp,
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc
} from '../../libs/firebase.bundle.js';

import { genKey, encrypt, decrypt, b64 } from '../utils/crypto.js';

/* ── firebase ── */
const firebaseConfig = {
  apiKey: 'AIzaSyCJirDPsT_RFApDFQSvYi7NmrBoHCxTGas',
  authDomain: 'session-copy.firebaseapp.com',
  projectId: 'session-copy'
};
const db     = getFirestore(initializeApp(firebaseConfig));
const colRef = collection(db, 'sessions');

/* ── helper: toast ── */
const toast = (text,color="#323232") =>
  Toastify({ text, duration:3000, gravity:"top", position:"center",
             backgroundColor:color, stopOnFocus:true }).showToast();

/* ── COPY ── */
document.getElementById('copy').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active:true, currentWindow:true });
    const [{ result: page }] = await chrome.scripting.executeScript({
      target:{ tabId:tab.id },
      func: () => ({
        localStorage  : Object.fromEntries(Object.entries(localStorage)),
        sessionStorage: Object.fromEntries(Object.entries(sessionStorage)),
        origin        : location.origin
      })
    });
    const cookies = await chrome.cookies.getAll({ url: page.origin });

    const json = JSON.stringify({ ...page, cookies });
    const compressed = LZString.compressToUint8Array
          ? LZString.compressToUint8Array(json)
          : new TextEncoder().encode(LZString.compress(json));

    const key = await genKey();
    const { iv, cipher } = await encrypt(key, compressed);

    const docRef = await addDoc(colRef, {
      c:Array.from(cipher), i:Array.from(iv), ts:Date.now()
    });

    const token = `${docRef.id}#${b64.enc(key)}`;
    await navigator.clipboard.writeText(token);

    toast("✅ Session copied!");
  } catch(e) {
    console.error(e);
    toast("❌ Copy failed","crimson");
  }
});

/* ── PASTE ── */
document.getElementById('paste').addEventListener('click', async () => {
  try {
    const token = await navigator.clipboard.readText();
    if(!token.includes("#")) return toast("No token in clipboard","crimson");

    const [id,keyStr] = token.split("#");
    const keyBytes = b64.dec(keyStr);

    const snap = await getDoc(doc(db,"sessions",id));
    if(!snap.exists()) return toast("Token not found","crimson");

    const {c,i} = snap.data();
    const cipher=new Uint8Array(c), iv=new Uint8Array(i);

    const compBuf = await decrypt(keyBytes,{cipher,iv});
    const plain = LZString.decompressFromUint8Array
          ? LZString.decompressFromUint8Array(compBuf)
          : LZString.decompress(new TextDecoder().decode(compBuf));
    const data = JSON.parse(plain);

    const [tab] = await chrome.tabs.query({ active:true, currentWindow:true });
    if((new URL(tab.url)).origin!==data.origin)
      return toast(`Open ${data.origin} first`,"crimson");

    await chrome.scripting.executeScript({
      target:{ tabId:tab.id }, args:[data],
      func:d=>{
        Object.entries(d.localStorage).forEach(([k,v])=>localStorage.setItem(k,v));
        Object.entries(d.sessionStorage).forEach(([k,v])=>sessionStorage.setItem(k,v));
        (d.cookies||[]).forEach(c=>{
          let s=`${c.name}=${c.value}; path=${c.path||'/'};`;
          if(c.secure) s+=' Secure;';
          if(c.sameSite) s+=` SameSite=${c.sameSite};`;
          if(c.expirationDate){
            s+=` Expires=${new Date(c.expirationDate*1000).toUTCString()};`;
          }
          document.cookie=s;
        });
        alert('All data restored! You may need to reload.'); // inside page
      }
    });

    toast("🔄 Restored! Reload the page.");
  } catch(e){
    console.error(e);
    toast("❌ Paste failed","crimson");
  }
});

/* ── Changelog toggle (unchanged logic, just toast on error) ── */
document.getElementById('toggleChangelog').addEventListener('click', async () => {
  const box = document.getElementById('changelog');
  if(box.style.display==='none'||!box.style.display){
    box.style.display='block';
    box.innerHTML='🔄 Loading…';
    try{
      const idx = await (await fetch(chrome.runtime.getURL('changelog/index.json'))).json();
      const latest = idx.versions[0];
      const html=await Promise.all(idx.versions.map(async v=>{
        const d=await (await fetch(chrome.runtime.getURL(`changelog/${v}.json`))).json();
        const isLatest=v===latest;
        return `<div class="${isLatest?'latest':''}">
          <strong>Version:</strong> ${d.version}
          ${isLatest?'<span class="new-badge">NEW</span>':''}<br>
          <strong>Date:</strong> ${d.date}<br>
          <strong>Changes:</strong><ul>${d.changes.map(c=>`<li>${c}</li>`).join('')}</ul>
        </div>`;
      }));
      box.innerHTML=html.join('');
    }catch(e){
      console.error(e); toast("Failed to load changelog","crimson"); box.innerHTML='';
    }
  }else{
    box.style.display='none';
  }
});
