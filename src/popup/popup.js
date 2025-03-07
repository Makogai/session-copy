document.getElementById('copy').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const [{ result: storage }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      localStorage: Object.fromEntries(Object.entries(localStorage)),
      sessionStorage: Object.fromEntries(Object.entries(sessionStorage)),
      origin: location.origin
    })
  });

  const cookies = await new Promise(resolve => {
    chrome.cookies.getAll({ url: storage.origin }, resolve);
  });

  const data = {
    origin: storage.origin,
    localStorage: storage.localStorage,
    sessionStorage: storage.sessionStorage,
    cookies
  };

  const base64Data = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  await navigator.clipboard.writeText(base64Data);
  console.log('✅ Copied storage, cookies, and origin (Base64)');
  alert('✅ Copied everything!');
});


document.getElementById('paste').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const base64Text = await navigator.clipboard.readText();
  const decodedData = JSON.parse(decodeURIComponent(escape(atob(base64Text))));

  const currentUrl = new URL(tab.url);
  const currentOrigin = currentUrl.origin;

  if (decodedData.origin !== currentOrigin) {
    alert(`Error: Data is from ${decodedData.origin}, but you're on ${currentOrigin}. Please paste on the correct site.`);
    return;
  }

  // Inject all data into the page (including cookies via document.cookie)
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (data) => {
      console.log('🔄 Restoring localStorage, sessionStorage, and cookies from clipboard');

      Object.entries(data.localStorage).forEach(([key, value]) => {
        localStorage.setItem(key, value);
        console.log(`✅ localStorage set: ${key}`);
      });

      Object.entries(data.sessionStorage).forEach(([key, value]) => {
        sessionStorage.setItem(key, value);
        console.log(`✅ sessionStorage set: ${key}`);
      });

      (data.cookies || []).forEach(cookie => {
        let cookieString = `${cookie.name}=${cookie.value}; path=${cookie.path || '/'};`;
        if (cookie.secure) cookieString += ' Secure;';
        if (cookie.sameSite) cookieString += ` SameSite=${cookie.sameSite};`;
        if (cookie.expirationDate) {
          const date = new Date(cookie.expirationDate * 1000);
          cookieString += ` Expires=${date.toUTCString()};`;
        }
        document.cookie = cookieString;
        console.log(`✅ Cookie set: ${cookie.name}`);
      });

      alert('All data restored! You might need to reload the page.');
    },
    args: [decodedData]
  });
});


document.getElementById('toggleChangelog').addEventListener('click', async () => {
  const changelogDiv = document.getElementById('changelog');
  if (changelogDiv.style.display === 'none') {
    changelogDiv.style.display = 'block';
    changelogDiv.innerHTML = '🔄 Loading changelog...';

    try {
      const indexRes = await fetch(chrome.runtime.getURL('changelog/index.json'));
      const indexData = await indexRes.json();

      const latestVersion = indexData.versions[0]; // assuming first is latest

      const changelogHtml = await Promise.all(indexData.versions.map(async (version) => {
        const res = await fetch(chrome.runtime.getURL(`changelog/${version}.json`));
        const data = await res.json();

        const isLatest = version === latestVersion;

        return `
          <div class="${isLatest ? 'latest' : ''}">
            <strong>Version:</strong> ${data.version}
            ${isLatest ? '<span class="new-badge">NEW</span>' : ''}
            <br>
            <strong>Date:</strong> ${data.date}<br>
            <strong>Changes:</strong>
            <ul>${data.changes.map(change => `<li>${change}</li>`).join('')}</ul>
          </div>
        `;
      }));

      changelogDiv.innerHTML = changelogHtml.join('');
    } catch (error) {
      changelogDiv.innerHTML = '❌ Failed to load changelog.';
      console.error(error);
    }
  } else {
    changelogDiv.style.display = 'none';
  }
});
