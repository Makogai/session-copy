# 📝 Storage Sync Chrome Extension

A lightweight Chrome Extension to **copy and paste** `localStorage`, `sessionStorage`, and **cookies** from one website and easily restore them on the same website, even on another device.

Perfect for replicating sessions between browsers or machines.

---

## 🚀 Features:
- ✅ Copy all `localStorage`, `sessionStorage`, and cookies from the active website.
- ✅ Paste them back into the original site automatically.
- ✅ Auto-opens the correct site when pasting.
- ✅ Shows logs directly in the website's console.
- ✅ Supports clipboard syncing.

---

## 🛠️ Installation (Development Mode)

1. **Download the extension code**.
2. Open Chrome and go to:chrome://extensions/
3. Enable **Developer mode** (toggle in the top right corner).
4. Click on **Load unpacked**.
5. Select the extension's root folder (the one containing `manifest.json`).
6. Done! 🎉

The extension icon should now appear in your toolbar.

---

## 🧠 How to use:

### ✅ To copy:
1. Go to the website you want to copy data from (example: `https://chatgpt.com`).
2. Click on the extension icon.
3. Press **"Copy Storage & Cookies"**.
4. The data is now saved to your clipboard.

### ✅ To paste:
1. On any site or page, click the extension icon.
2. Press **"Paste Storage & Cookies"**.
3. The extension will automatically open the original site and restore all data.
4. Logs will be visible in the **Console (F12)** of the page.

---

## ⚠️ Notes:
- `HttpOnly` cookies **cannot be restored** due to browser security.
- For best results, make sure you are logged in or have access to the target domain when pasting.
- After pasting, some websites may need a **manual reload** to reflect the restored session.


---

## 📌 Future improvements:
- Export/import data via a file.
- Automatic page reload after pasting.
- Visual log inside the popup.

---

## 🤝 Credits
Built by **Makogai** with ❤️  

