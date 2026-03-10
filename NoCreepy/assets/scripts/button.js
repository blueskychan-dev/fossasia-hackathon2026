document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggleButton");
  const github = document.getElementById("githubButton");
  const settings = document.getElementById("settingsButton");

  // Get elements by ID to update text
  const wordCountText = document.getElementById('wordCountText');
  const statsText = document.getElementById('statsText');
  const modeText = document.getElementById('modeText');

  // --- 1. Load Initial State & Statistics ---
  chrome.storage.local.get([
    "globalEnable", 
    "badWords", 
    "censoredCount", 
    "filterMessages", 
    "filterServers"
  ], (data) => {
    
    const isEnabled = data.globalEnable !== false; 
    updateToggleImage(isEnabled);

    // Update Stats
    const wordCount = data.badWords ? data.badWords.length : 0;
    wordCountText.innerText = `${wordCount.toLocaleString()} words are filtered`;

    const totalCensored = data.censoredCount || 0;
    statsText.innerText = `${totalCensored.toLocaleString()} filtered since install`;

    // Update Filter Mode text
    let modes = [];
    if (data.filterServers) modes.push("Server");
    if (data.filterMessages) modes.push("Direct message");
    modeText.innerText = modes.length > 0 ? modes.join(" and ") : "None enabled";
  });

  function updateToggleImage(isEnabled) {
    toggle.src = isEnabled 
      ? "assets/icons/toggled.svg" 
      : "assets/icons/toggle_off.svg";
  }

  // --- 2. Master Toggle Logic ---
  toggle.addEventListener("click", () => {
    chrome.storage.local.get(['globalEnable'], (data) => {
      const currentState = data.globalEnable !== false;
      const newState = !currentState; 

      chrome.storage.local.set({ globalEnable: newState }, () => {
        updateToggleImage(newState); 
      });
    });
  });

  // --- 3. Footer Buttons ---
  github.addEventListener("click", () => {
    window.open("https://github.com/blueskychan-dev/fossasia-hackathon2026/", "_blank", "noopener,noreferrer");
  });

  settings.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
});