// Copy button
document.getElementById('copy').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Inject script to get localStorage and sessionStorage
  const [{ result: storage }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      localStorage: Object.fromEntries(Object.entries(localStorage)),
      sessionStorage: Object.fromEntries(Object.entries(sessionStorage))
    })
  });

  const url = new URL(tab.url).origin;
chrome.cookies.getAll({ url }, async (cookies) => {
  const data = {
    origin: url,
    localStorage: storage.localStorage,
    sessionStorage: storage.sessionStorage,
    cookies
  };
  await navigator.clipboard.writeText(JSON.stringify(data));
  console.log('Copied storage, cookies, and origin:', url);
  alert('Copied everything!');
});

});

// Paste button
document.getElementById('paste').addEventListener('click', async () => {
  const clipboardData = await navigator.clipboard.readText();
  const data = JSON.parse(clipboardData);

  chrome.tabs.create({ url: data.origin }, async (tab) => {
    // Wait for the page to load fully before injecting
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === 'complete') {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (data) => {
            console.log('🔄 Restoring storage and cookies from clipboard');

            Object.entries(data.localStorage).forEach(([key, value]) => {
              localStorage.setItem(key, value);
              console.log(`✅ localStorage set: ${key}`);
            });

            Object.entries(data.sessionStorage).forEach(([key, value]) => {
              sessionStorage.setItem(key, value);
              console.log(`✅ sessionStorage set: ${key}`);
            });

            (data.cookies || []).forEach(cookie => {
              if (!cookie.httpOnly) {
                let cookieString = `${cookie.name}=${cookie.value}; path=${cookie.path || '/'};`;
                if (cookie.secure) cookieString += ' Secure;';
                if (cookie.sameSite) cookieString += ` SameSite=${cookie.sameSite};`;
                if (cookie.expirationDate) {
                  const date = new Date(cookie.expirationDate * 1000);
                  cookieString += ` Expires=${date.toUTCString()};`;
                }
                document.cookie = cookieString;
                console.log(`✅ Cookie set: ${cookie.name}`);
              } else {
                console.warn(`❌ Skipped HttpOnly cookie: ${cookie.name}`);
              }
            });

            alert('Restored storage and cookies!');
          },
          args: [data]
        });
        // Remove listener to avoid duplicate calls
        chrome.tabs.onUpdated.removeListener(listener);
      }
    });
  });
});

