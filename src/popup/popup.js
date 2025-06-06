/* popup.js – auto-open correct origin + live toasts                   */
/* ------------------------------------------------------------------- *
 * deps expected in popup.html BEFORE this file:                       *
 *   <script src="../../libs/lz-string.min.js"></script>               *
 *   <script src="../../libs/toastify.min.js"></script>                *
 * and firebase.bundle.js + utils/crypto.js in the same paths          */

import {
  initializeApp,
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc
} from '../../libs/firebase.bundle.js';
import { genKey, encrypt, decrypt, b64 } from '../utils/crypto.js';

/* ───────── Firebase ───────── */
const firebaseConfig = {
  apiKey    : 'AIzaSyCJirDPsT_RFApDFQSvYi7NmrBoHCxTGas',
  authDomain: 'session-copy.firebaseapp.com',
  projectId : 'session-copy'
};
const db     = getFirestore(initializeApp(firebaseConfig));
const colRef = collection(db, 'sessions');

/* ───────── Toast helper ───────── */
const toast = (text, color="#323232", ms=3000, persist=false) =>
  Toastify({
    text,
    gravity:"top",
    position:"center",
    duration: persist ? -1 : ms,
    close: persist,
    style:{ background:color, fontSize:"15px", padding:"14px 24px", borderRadius:"10px" }
  });

  const popConfetti = () => confetti({
  origin: { y: 0.8 },
  particleCount: 80,
  spread: 70,
  scalar: 0.8
});

/* ───────── Util: wait for tab to finish loading ───────── */
const waitTabComplete = tabId =>
  new Promise(resolve => {
    const listener = (id, info) => {
      if (id === tabId && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });

/* ───────── Util: restore LS/SS/cookies into a given tab ───────── */
const injectDataIntoTab = async (tabId, data) => {
  await chrome.scripting.executeScript({
    target:{ tabId },
    args:[data],
    func:d=>{
      Object.entries(d.localStorage  ).forEach(([k,v])=>localStorage.setItem(k,v));
      Object.entries(d.sessionStorage).forEach(([k,v])=>sessionStorage.setItem(k,v));
      (d.cookies||[]).forEach(c=>{
        let s=`${c.name}=${c.value}; path=${c.path||'/'};`;
        if(c.secure)   s+=' Secure;';
        if(c.sameSite) s+=` SameSite=${c.sameSite};`;
        if(c.expirationDate){
          s+=` Expires=${new Date(c.expirationDate*1000).toUTCString()};`;
        }
        document.cookie=s;
      });
    }
  });
};

/* ───────── COPY ───────── */
document.getElementById('copy').addEventListener('click', async () => {
  const working = toast("⏳ Copying session…", "#505068", -1, true); working.showToast();
  try{
    const [tab] = await chrome.tabs.query({ active:true, currentWindow:true });
    const [{ result: page }] = await chrome.scripting.executeScript({
      target:{ tabId:tab.id },
      func  : () => ({
        localStorage  : Object.fromEntries(Object.entries(localStorage)),
        sessionStorage: Object.fromEntries(Object.entries(sessionStorage)),
        origin        : location.origin
      })
    });
    const cookies = await chrome.cookies.getAll({ url: page.origin });

    const compressed = LZString.compressToUint8Array(
      JSON.stringify({ ...page, cookies })
    );
    const key            = await genKey();
    const { iv, cipher } = await encrypt(key, compressed);

    const docRef = await addDoc(colRef,{ c:Array.from(cipher), i:Array.from(iv), ts:Date.now() });
    await navigator.clipboard.writeText(`${docRef.id}#${b64.enc(key)}`);

    working.hideToast();
    popConfetti(); 
    toast("✅ Session copied!").showToast();
  }catch(err){ console.error(err); working.hideToast(); toast("❌ Copy failed","crimson").showToast(); }
});

/* --- PASTE (now hands work to background) --- */
document.getElementById('paste').addEventListener('click', async () => {
  const spinner = toast("⏳ Applying session…","#505068",-1,true); spinner.showToast();

  try {
    /* read & decode token exactly like before */
    const token = await navigator.clipboard.readText();
    if (!token.includes("#")) throw new Error("no-token");
    const [id, keyStr] = token.split("#");
    const keyBytes     = b64.dec(keyStr);

    const snap = await getDoc(doc(db,'sessions',id));
    if (!snap.exists()) throw new Error("not-found");

    const { c,i } = snap.data();
    const plain = LZString.decompressFromUint8Array(
      await decrypt(keyBytes,{ cipher:new Uint8Array(c), iv:new Uint8Array(i) })
    );
    const data = JSON.parse(plain);

    /* hand over to background */
    const bgResp = await chrome.runtime.sendMessage({ action:"openAndRestore", data });
    spinner.hideToast();
popConfetti();  
    if (bgResp && bgResp.ok){
      toast("🔄 Restored! If the page still looks logged-out, reload.","#3b8c3b").showToast();
    } else {
      throw new Error(bgResp?.error || "bg-failed");
    }

  } catch(err) {
    console.error(err); spinner.hideToast();
    const msg = {
      "no-token" :"Clipboard doesn’t contain a session token",
      "not-found":"Token not found / expired",
      "bg-failed":"Could not apply session"
    }[err.message] || err.message;
    toast(`❌ ${msg}`,"crimson").showToast();
  }
});


/* ───────── Changelog toggle (unchanged) ───────── */
document.getElementById('toggleChangelog').addEventListener('click', async () => {
  const box = document.getElementById('changelog');
  if(box.style.display==='none'||!box.style.display){
    box.style.display='block'; box.innerHTML='🔄 Loading…';
    try{
      const idx = await (await fetch(chrome.runtime.getURL('changelog/index.json'))).json();
      const latest = idx.versions[0];
      const html = await Promise.all(idx.versions.map(async v=>{
        const d = await (await fetch(chrome.runtime.getURL(`changelog/${v}.json`))).json();
        return `<div class="${v===latest?'latest':''}">
          <strong>Version:</strong> ${d.version}
          ${v===latest?'<span class="new-badge">NEW</span>':''}<br>
          ${d.title?`<strong>Title:</strong> ${d.title} <br>`:''}
          <strong>Date:</strong> ${d.date}<br>
          <strong>Changes:</strong>
          <ul>${d.changes.map(c=>`<li>${c}</li>`).join('')}</ul>
        </div>`;
      }));
      box.innerHTML = html.join('');
    }catch(e){
      console.error(e); toast("Failed to load changelog","crimson").showToast(); box.innerHTML='';
    }
  }else box.style.display='none';
});




const jokes = [
  "There are 10 kinds of people—those who understand binary and those who don’t.",
  "I changed my password to ‘incorrect’. Now I keep getting reminded it’s incorrect.",
  "A SQL query walks into a bar, walks up to two tables and asks, “Can I JOIN you?”",
  "Debugging: being the detective in a crime movie where you are also the murderer.",
  "To understand recursion you must first understand recursion.",
  "Why do programmers prefer dark mode? Because light attracts bugs."
];

document.getElementById('jokeBtn').addEventListener('click', () => {
  const joke = jokes[Math.floor(Math.random()*jokes.length)];
  toast(joke, "#444a74", 4500).showToast();
});