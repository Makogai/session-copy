chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getCookies") {
        console.log('GOTTEN TO HERE');
        
      chrome.cookies.getAll({ url: message.url }, (cookies) => {
        sendResponse(cookies);
      });
      return true; // Required for async sendResponse
    }
  
    if (message.action === "setCookie") {
      chrome.cookies.set({
        url: message.url,
        name: message.cookie.name,
        value: message.cookie.value,
        path: message.cookie.path,
        secure: message.cookie.secure,
        httpOnly: message.cookie.httpOnly,
        sameSite: message.cookie.sameSite,
        expirationDate: message.cookie.expirationDate
      });
    }
  });
  