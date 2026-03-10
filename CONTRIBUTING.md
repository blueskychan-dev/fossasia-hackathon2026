# NoCreepy Developer Documentation 🛡️

Welcome to the **NoCreepy** repository! This document explains the core architecture, key functions, and data flow of the extension to help contributors understand how it works and how to add new features.

---

## 🏗️ Architecture Overview

NoCreepy follows a standard Chrome Extension Manifest V3 architecture, separated into three main layers:

1. **The Brain (`background.js` & `chrome.storage.local`)**: Acts as the single source of truth. It stores all configuration states, manual lists, and remote subscription data.
2. **The Engine (`content.js`)**: Injected directly into `discord.com`. It observes DOM mutations, intercepts network requests, modifies chat messages in real-time, and injects native-looking UI modals.
3. **The Frontend (`options.js` & `popup.js`)**: The user interface. It reads from and writes to `chrome.storage.local`. Changes here instantly trigger updates in the Engine.

---

## ⚙️ Core Functions Breakdown

### 1. The Message Censor (`content.js -> censorAll()`)
This is the heaviest function in the extension. It scans Discord's React-generated chat DOM and censors flagged words.

* **How it works:**
  1. Retrieves `config.badWords` (which is a compiled master list of manual words and remote subscription words).
  2. **Regex Parser:** It sorts the array. If a word starts with `(?i)` or is wrapped in `/pattern/`, it treats it as raw Regex. Otherwise, it treats it as plain text and escapes special characters.
  3. **Engine Compilation:** It wraps plain words in word boundaries (`\b`) and combines everything into one massive `RegExp` OR statement (`|`).
  4. **DOM Traversal:** It selects all elements matching `[id^="message-content-"]`.
  5. **Mutation Safety:** To prevent infinite loops when we modify the DOM (which triggers the `MutationObserver` again), we tag processed messages with `dataset.isCensored = 'true'`.
  6. **Telemetry:** It keeps a `Set()` of `countedMessageIds` so if Discord unmounts and remounts a message, we don't double-count the censor statistic.

### 2. The Server Blocker (`content.js -> showSafetyModal()`)
Creates a native-looking Discord modal that blocks interaction with a flagged server.

* **How it works:**
  1. `checkCurrentServer()` listens to URL changes via a `MutationObserver` on `document.body` (since Discord is an SPA and doesn't reload the page).
  2. If the parsed `server_id` matches `config.badServers`, it calls `showSafetyModal()`.
  3. A full-screen `div` overlay is injected with `z-index: 99999`. 
  4. The inner HTML perfectly mimics Discord's `<div data-mana-component="modal">` structure, relying entirely on Discord's native CSS variables (e.g., `var(--background-floating)`) so it adapts to Light/Dark mode automatically.

### 3. Remote List Parser (`options.js -> fetchAndParseList(url)`)
Handles the "Pi-hole style" subscription system.

* **How it works:**
  1. Fetches the raw text file from the provided URL.
  2. Parses metadata using regex (`/^[A-Za-z_]+="([^"]+)"/`) to extract `Name`, `Description`, `Author`, and `blocks_type`.
  3. Ignores lines starting with `#` (comments).
  4. Returns a JSON object representing the subscription card.
  5. `compileMasterLists()` then takes all subscriptions and manual inputs, flattens them into `Set`s to remove duplicates, and saves them to `chrome.storage.local` under `badWords` and `badServers`.

---

## 📝 Blocklist Syntax (For List Maintainers)

If you are hosting a blocklist (e.g., on GitHub Gists or your own server), use the following formats. The extension parser reads the `blocks_type` variable to know whether to censor words or block entire servers.

### 1. Message/Text Blocklist (`blocks_type="text"`)
Use this to censor specific words, phrases, or regex patterns in the live chat.

```text
Name="Global Creepy Filter"
Description="Standard English and Regex patterns"
blocks_type="text"
Author="OpenSource Community"

# Your content here.
# Standard words (auto-wrapped in word boundaries)
groomer
creepy

# Advanced Regex (Prefix with (?i) to trigger raw regex mode)
# This will match f*ck, f u c k, fvck, etc.
(?i)f+[\W_]*[u\*v4]+[\W_]*c+[\W_]*k+

```

### 2. Server Blocklist (`blocks_type="server_id"`)

Use this to completely block users from viewing specific dangerous servers. You must provide the exact 18-to-19 digit Discord Server ID (Guild ID).

*Note for list maintainers: You can find a Server ID by enabling Developer Mode in Discord, right-clicking the server icon, and selecting "Copy Server ID".*

```text
Name="Known NSFW Servers"
Description="A list of flagged server IDs to block"
blocks_type="server_id"
Author="Safety Team"

# Your content here.
# Add one server ID per line
990191444318900245
123456789012345678
987654321098765432

```

### How the Parser handles them:

When a user subscribes to a list, `options.js` reads the `blocks_type`.

* If it is `text`, it pushes the items into the master `badWords` array.
* If it is `server_id`, it pushes the items into the master `badServers` array.

---

## 🛠️ Example Usage: How to Contribute

Want to add a new feature? Here is how to safely interact with the extension's ecosystem.

### Example 1: Adding a new toggle switch in the UI

If you want to add a feature to, say, hide user avatars:

**1. Add default state in `background.js`:**

```javascript
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["hideAvatars"], (result) => {
    if (result.hideAvatars === undefined) chrome.storage.local.set({ hideAvatars: false });
  });
});

```

**2. Add the listener in `content.js`:**

```javascript
// Add to config state
let config = { hideAvatars: false /* ... */ };

// In chrome.storage.onChanged.addListener:
if (changes.hideAvatars) {
    config.hideAvatars = changes.hideAvatars.newValue;
    applyAvatarFilter();
}

function applyAvatarFilter() {
    const avatars = document.querySelectorAll('[class*="avatar_"]');
    avatars.forEach(av => {
        av.style.display = config.hideAvatars ? 'none' : 'block';
    });
}

```

### Example 2: Interacting with Storage (For generic scripts)

You don't need complex `chrome.runtime.sendMessage` pipelines. Just write to storage, and `content.js` will react.

```javascript
// Adding a server ID programmatically 
function pushEmergencyServerBlock(serverId) {
    chrome.storage.local.get(["manualServers"], (data) => {
        let servers = data.manualServers || [];
        if (!servers.includes(serverId)) {
            servers.push(serverId);
            chrome.storage.local.set({ manualServers: servers }, () => {
                console.log("Emergency block applied. content.js will automatically kick the user if they are in this server.");
            });
        }
    });
}

```

## 🐛 Debugging Tips

* **Content Script logs:** Open DevTools inside Discord (`Ctrl+Shift+I`). Look for the `%c[NoCreepy]` cyan tags.
* **Storage logs:** You can inspect what is currently saved in the database by typing this into the Discord console:
`chrome.storage.local.get(null, console.log)`
