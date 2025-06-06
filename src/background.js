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

/* Inject localStorage, sessionStorage and cookies into a page */
const injectIntoTab = (tabId, data) =>
  chrome.scripting.executeScript({
    target: { tabId },
    args:   [data],
    func:   d => {
      /* LS / SS */
      Object.entries(d.localStorage  ).forEach(([k, v]) => localStorage.setItem(k, v));
      Object.entries(d.sessionStorage).forEach(([k, v]) => sessionStorage.setItem(k, v));

      /* Cookies */
      (d.cookies || []).forEach(c => {
        let str = `${c.name}=${c.value}; path=${c.path || '/'};`;
        if (c.secure)        str += ' Secure;';
        if (c.sameSite)      str += ` SameSite=${c.sameSite};`;
        if (c.expirationDate)
          str += ` Expires=${new Date(c.expirationDate * 1000).toUTCString()};`;
        document.cookie = str;
      });
    }
  });

/* Message listener */
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action !== 'openAndRestore') return;     

  (async () => {
    try {
      const { data } = msg;             
      const origin   = data.origin;    

      /* 1️⃣  ALWAYS create a fresh tab */
      const tab = await chrome.tabs.create({ url: origin, active: true });

      /* 2️⃣  wait for load and inject data */
      await waitTabComplete(tab.id);
      /* tiny helper to run confetti inside the tab */
/* --------------------------------------------
   helper: run confetti inside the target tab  */
const runConfettiInTab = async tabId => {
  /* 1️⃣  inject the library file (only once per tab) */
  await chrome.scripting.executeScript({
    target: { tabId },
    files : ['libs/confetti.js']          // path relative to extension root
  });

  /* 2️⃣  fire a burst */
  /* 2️⃣  fire a BIGGER burst */
await chrome.scripting.executeScript({
  target: { tabId },
  func: () => {
    confetti({
      origin: { y: 0.8 },
      particleCount: 560,   // ← more pieces
      spread: 275,
      scalar: 1.4,          // ← each piece ~40 % larger
      ticks: 250            // (optional) hang on screen a bit longer
    });
  }
});

};

      await injectIntoTab(tab.id, data);

      await runConfettiInTab(tab.id);

      sendResponse({ ok: true });
    } catch (e) {
      console.error(e);
      sendResponse({ ok: false, error: e.message });
    }
  })();

  return true;
});
