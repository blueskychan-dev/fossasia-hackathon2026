document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements ---
  const statsCount = document.getElementById('statsCount');
  const toggleMessages = document.getElementById('toggleMessages');
  const toggleServers = document.getElementById('toggleServers');
  
  const wordInput = document.getElementById('wordInput');
  const addWordBtn = document.getElementById('addWordBtn');
  const wordList = document.getElementById('wordList');

  const serverInput = document.getElementById('serverInput');
  const addServerBtn = document.getElementById('addServerBtn');
  const serverList = document.getElementById('serverList');

  const remoteUrlInput = document.getElementById('remoteUrlInput');
  const addRemoteBtn = document.getElementById('addRemoteBtn');
  const resyncAllBtn = document.getElementById('resyncAllBtn');
  const remoteListsContainer = document.getElementById('remoteListsContainer');

  // --- 1. Load Data from Storage ---
  function loadSettings() {
    chrome.storage.local.get([
      "filterMessages", "filterServers", "censoredCount", 
      "manualWords", "manualServers", "remoteLists"
    ], (data) => {
      // Set Toggles & Stats
      toggleMessages.checked = data.filterMessages !== false; // Defaults to true
      toggleServers.checked = data.filterServers !== false;   // Defaults to true
      statsCount.innerText = (data.censoredCount || 0).toLocaleString();

      // Ensure we have arrays
      let mWords = data.manualWords || [];
      let mServers = data.manualServers || [];
      let rLists = data.remoteLists || [];

      // Render UI
      renderManualList(wordList, mWords, 'manualWords');
      renderManualList(serverList, mServers, 'manualServers');
      renderRemoteLists(rLists);
      
      // Compile everything for content.js
      compileMasterLists(mWords, mServers, rLists);
    });
  }

  // --- 2. Compile Master List for content.js ---
  function compileMasterLists(mWords, mServers, rLists) {
    let finalWords = new Set(mWords);
    let finalServers = new Set(mServers);

    rLists.forEach(list => {
      if (list.type === 'text') {
        list.items.forEach(i => finalWords.add(i));
      } else if (list.type === 'server_id') {
        list.items.forEach(i => finalServers.add(i));
      }
    });

    // Save the compiled lists so content.js uses them automatically
    chrome.storage.local.set({
      badWords: Array.from(finalWords),
      badServers: Array.from(finalServers)
    });
  }

  // --- 3. Remote List Fetcher & Parser ---
  async function fetchAndParseList(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network response was not OK");
    const text = await res.text();
    const lines = text.split('\n');

    let metadata = { url, name: 'Unknown List', description: 'No description provided.', type: 'text', author: 'Unknown', items: [] };
    let readingContent = false;

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.startsWith('# Your content here.')) {
        readingContent = true;
        continue;
      }

      if (!readingContent) {
        // Match format: Key="Value"
        const match = line.match(/^[A-Za-z_]+="([^"]+)"/);
        if (match) {
          if (line.startsWith('Name=')) metadata.name = match[1];
          if (line.startsWith('Description=')) metadata.description = match[1];
          if (line.startsWith('blocks_type=')) metadata.type = match[1];
          if (line.startsWith('Author=')) metadata.author = match[1];
        }
      } else {
        // Ignore comments inside the content block
        if (line.startsWith('#')) continue;
        const item = line.split('#')[0].trim();
        if (item) metadata.items.push(item);
      }
    }
    return metadata;
  }

  // --- 4. Remote List UI Logic ---
  async function addRemoteList() {
    const url = remoteUrlInput.value.trim();
    if (!url) return;
    
    addRemoteBtn.disabled = true;
    addRemoteBtn.innerText = "Loading...";

    try {
      const newListData = await fetchAndParseList(url);
      
      chrome.storage.local.get(["remoteLists"], (data) => {
        let rLists = data.remoteLists || [];
        // Remove existing list with same URL to overwrite/update
        rLists = rLists.filter(list => list.url !== url);
        rLists.push(newListData);
        
        chrome.storage.local.set({ remoteLists: rLists }, () => {
          remoteUrlInput.value = '';
          loadSettings();
        });
      });
    } catch (e) {
      alert("Failed to load list. Make sure the URL is a raw text file (e.g. raw.githubusercontent.com)");
      console.error(e);
    } finally {
      addRemoteBtn.disabled = false;
      addRemoteBtn.innerText = "Subscribe";
    }
  }

  async function resyncAll() {
    resyncAllBtn.innerText = "Syncing...";
    resyncAllBtn.disabled = true;

    chrome.storage.local.get(["remoteLists"], async (data) => {
      let rLists = data.remoteLists || [];
      let updatedLists = [];
      
      for (const list of rLists) {
        try {
          const freshData = await fetchAndParseList(list.url);
          updatedLists.push(freshData);
        } catch (e) {
          console.error("Failed to sync", list.url);
          updatedLists.push(list); // Keep old data if fetch fails
        }
      }
      
      chrome.storage.local.set({ remoteLists: updatedLists }, () => {
        resyncAllBtn.innerText = "🔄 Resync All";
        resyncAllBtn.disabled = false;
        loadSettings();
      });
    });
  }

  function removeRemoteList(url) {
    chrome.storage.local.get(["remoteLists"], (data) => {
      let rLists = data.remoteLists || [];
      rLists = rLists.filter(list => list.url !== url);
      chrome.storage.local.set({ remoteLists: rLists }, loadSettings);
    });
  }

  function renderRemoteLists(lists) {
    remoteListsContainer.innerHTML = '';
    lists.forEach(list => {
      const el = document.createElement('div');
      el.className = 'remote-item';
      
      // Clean labels
      const typeLabel = list.type === 'server_id' ? 'Server IDs' : 'Words/Regex';
      
      el.innerHTML = `
        <div class="remote-item-top">
          <div class="remote-item-title">${list.name}</div>
          <div class="remote-badge">${typeLabel}</div>
        </div>
        <div class="remote-desc">${list.description}</div>
        <div class="remote-footer">
          <div>By <strong>${list.author}</strong> • ${list.items.length} items</div>
          <button class="btn-danger remove-remote-btn" data-url="${list.url}">Remove</button>
        </div>
      `;
      remoteListsContainer.appendChild(el);
    });

    document.querySelectorAll('.remove-remote-btn').forEach(btn => {
      btn.addEventListener('click', (e) => removeRemoteList(e.target.dataset.url));
    });
  }

  // --- 5. Manual UI Logic ---
  function renderManualList(container, items, storageKey) {
    container.innerHTML = '';
    items.forEach(item => {
      const li = document.createElement('li');
      li.innerText = item;
      
      const removeBtn = document.createElement('button');
      removeBtn.innerText = 'X';
      removeBtn.className = 'btn-danger';
      removeBtn.onclick = () => removeManualItem(storageKey, item);
      
      li.appendChild(removeBtn);
      container.appendChild(li);
    });
  }

  function addManualItem(storageKey, inputElement) {
    const value = inputElement.value.trim(); // Do not lowercase, to preserve case-sensitive regex
    if (!value) return;

    chrome.storage.local.get([storageKey], (data) => {
      let items = data[storageKey] || [];
      if (!items.includes(value)) {
        items.push(value);
        chrome.storage.local.set({ [storageKey]: items }, () => {
          inputElement.value = '';
          loadSettings();
        });
      }
    });
  }

  function removeManualItem(storageKey, itemToRemove) {
    chrome.storage.local.get([storageKey], (data) => {
      let items = data[storageKey] || [];
      items = items.filter(item => item !== itemToRemove);
      chrome.storage.local.set({ [storageKey]: items }, loadSettings);
    });
  }

  // --- Event Listeners ---
  
  // Toggles
  toggleMessages.addEventListener('change', (e) => {
    chrome.storage.local.set({ filterMessages: e.target.checked });
  });
  
  toggleServers.addEventListener('change', (e) => {
    chrome.storage.local.set({ filterServers: e.target.checked });
  });

  // Manual Inputs
  addWordBtn.addEventListener('click', () => addManualItem('manualWords', wordInput));
  wordInput.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') addManualItem('manualWords', wordInput); 
  });

  addServerBtn.addEventListener('click', () => addManualItem('manualServers', serverInput));
  serverInput.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') addManualItem('manualServers', serverInput); 
  });

  // Remote Subscriptions
  addRemoteBtn.addEventListener('click', addRemoteList);
  remoteUrlInput.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') addRemoteList(); 
  });
  
  resyncAllBtn.addEventListener('click', resyncAll);

  // Live stat updates (Counters update instantly if you have options open on another monitor)
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.censoredCount) {
      statsCount.innerText = changes.censoredCount.newValue.toLocaleString();
    }
  });

  // Boot up!
  loadSettings();
});