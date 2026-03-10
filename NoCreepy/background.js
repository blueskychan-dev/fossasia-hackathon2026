// Initialize the database with default values when installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["badWords", "badServers", "filterMessages", "filterServers"], (result) => {
    if (!result.badWords) chrome.storage.local.set({ badWords: ["sure", "creepy"] });
    if (!result.badServers) chrome.storage.local.set({ badServers: ["990191444318900245"] });
    if (result.filterMessages === undefined) chrome.storage.local.set({ filterMessages: true });
    if (result.filterServers === undefined) chrome.storage.local.set({ filterServers: true });
  });
});