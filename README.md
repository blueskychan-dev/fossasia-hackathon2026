# NoCreepy — Discord Safety Extension 🛡️

**NoCreepy** is a privacy and child-safety Chrome Extension designed specifically for Discord Web (`discord.com`). It acts as a shield against inappropriate content, predatory behavior, and malicious servers by modifying the user interface strictly on the client side.

Built with performance and privacy in mind, NoCreepy operates 100% locally and supports Pi-hole style remote subscriptions for community-driven safety lists.

---

## ✨ Features

* 🛑 **Server Blocker:** Prevents users from viewing flagged Discord servers. If a user clicks into a blacklisted server, a native-looking Discord modal instantly overlays the screen and safely redirects them back to their Direct Messages.
* 💬 **Live Chat Censor:** Dynamically scans React-rendered chat messages and replaces blacklisted words with a `****` tooltip block. 
* 🧠 **Advanced Regex Engine:** Supports plain text blocking or advanced Regular Expressions (e.g., `(?i)f+[\W_]*u[\W_]*c[\W_]*k+`) to catch attempts to bypass filters.
* 📋 **Pi-hole Style Subscriptions:** Users can paste a raw `.txt` URL (like a GitHub Gist) into the settings. The extension will automatically download and compile the community blocklists, allowing for effortless updates.
* 🕵️ **Snoop Detection:** Actively monitors `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, and `document.referrer` to warn you in the console if a webpage is trying to snoop on your active Discord channel URLs.
* ⚡ **Global Kill-Switch:** Instantly toggle the extension on or off from the extension popup.

---

## 🔒 Privacy First

We believe safety shouldn't cost you your privacy.
* **No Telemetry:** We do not collect, track, or send your data anywhere. 
* **100% Local:** All manual inputs, remote lists, and statistics are stored locally on your machine using Chrome's `IndexedDB` (`chrome.storage.local`).
* **ToS Compliant:** The extension does not use "self-botting" or manipulate Discord's API. It relies purely on frontend DOM observation (`MutationObserver`).

Read our full [Security Policy](SECURITY.md) for more details.

---

## 🚀 Installation (Developer Mode)

Currently, NoCreepy is available as an unpacked extension.

1. Download or clone this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top right corner.
4. Click the **Load unpacked** button in the top left.
5. Select the folder containing the NoCreepy files (`manifest.json`, `content.js`, etc.).
6. Open or refresh a tab with `https://discord.com/app` to start the engine!

---

## ⚙️ Usage

### The Dashboard (Popup)
Click the 🛡️ icon in your Chrome toolbar to open the quick dashboard. Here you can:
* Toggle the Master Kill-Switch (instantly refreshes the page to apply/remove filters).
* View live statistics of how many words have been censored.
* See your active filter modes.

### Full Settings (Options Page)
Click the **⚙️ Open Full Settings** button in the popup to access the main dashboard.
* **Manual Blocklists:** Add specific words, Regex patterns, or 18-digit Discord Server IDs manually.
* **Remote Subscriptions:** Paste a link to a raw `.txt` file to subscribe to community-maintained blocklists. Click "Resync All" to fetch the latest updates from all your subscriptions.

---

## 📝 For List Maintainers (Remote Subscriptions)

Want to host a blocklist for others to use? Create a raw text file (e.g., a GitHub Gist) using the following format:

```text
Name="My Awesome Blocklist"
Description="Blocks dangerous servers and bad words"
blocks_type="server_id" # Use "server_id" for servers, or "text" for chat words
Author="YourName"

# Your content starts here (Comments start with #)
990191444318900245

```

For more details on writing advanced Regex filters or setting up Server ID blocks, please read our [Developer Documentation](https://github.com/blueskychan-dev/fossasia-hackathon2026/blob/main/CONTRIBUTING.md).

---

## 🛠️ Built With

* JavaScript (ES6+)
* Chrome Extension API (Manifest V3)
* CSS3 / HTML5 (Native Discord UI Mimicry)

*Created for the FOSSASIA 2026 Hackathon.*
