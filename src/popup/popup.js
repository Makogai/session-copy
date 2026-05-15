import { initPreferences } from './preferences.js';
import { initNavigation } from './navigation.js';
import { initInfo, onInfoPanelOpen } from './info.js';
import { copySession, pasteSession, exportFile, importFile } from './session-actions.js';

function initActions() {
  document.getElementById('copy')?.addEventListener('click', () => void copySession());
  document.getElementById('paste')?.addEventListener('click', () => void pasteSession());
  document.getElementById('exportFile')?.addEventListener('click', () => void exportFile());

  const fileInput = document.getElementById('fileInput');
  document.getElementById('importPick')?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', () => {
    const f = fileInput.files?.[0];
    fileInput.value = '';
    if (f) void importFile(f);
  });
}

initPreferences();
initInfo();
initNavigation({ onInfoOpen: onInfoPanelOpen });
initActions();
