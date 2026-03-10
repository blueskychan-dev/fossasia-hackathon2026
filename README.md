# NoCreepy — Discord Safety Extension 🛡️

<img width="305" height="436" alt="image" src="https://github.com/user-attachments/assets/fd5c9c67-b18a-4335-b314-f3bb34197758" />


**NoCreepy** is a privacy and child-safety Chrome Extension designed specifically for Discord Web (`discord.com`). It acts as a shield against inappropriate content, predatory behavior, and malicious servers by modifying the user interface strictly on the client side.

Built for the **FOSSASIA 2026 Hackathon**, NoCreepy operates 100% locally and supports Pi-hole style remote subscriptions for community-driven safety lists.

---

## ✨ Features

* 🛑 **Server Blocker:** Prevents users from viewing flagged Discord servers. If a user clicks into a blacklisted server, a native-looking Discord modal instantly overlays the screen.
* 💬 **Live Chat Censor:** Dynamically scans React-rendered chat messages and replaces blacklisted words with a `****` tooltip block. 
* 🧠 **Advanced Regex Engine:** Supports plain text blocking or advanced Regular Expressions (e.g., `(?i)f+[\W_]*u[\W_]*c[\W_]*k+`).
* 📋 **Pi-hole Style Subscriptions:** Automatically syncs with remote `.txt` safety lists.
* 🕵️ **Snoop Detection:** Monitors network requests to warn you if a webpage is trying to snoop on your Discord channel URLs.
* ⚡ **Global Kill-Switch:** Instantly toggle the extension on or off.

---

## 🚀 Installation (Developer Mode)

Currently, NoCreepy is available as an unpacked extension. Follow these steps for a successful first-time setup:

1. **Download:** Download or clone this repository to your local machine and extract the files.
2. **Extensions Page:** Open Google Chrome and navigate to `chrome://extensions/`.
3. **Developer Mode:** Enable **Developer mode** using the toggle in the top right corner.
4. **Load Unpacked:** Click the **Load unpacked** button and select the **`NoCreepy` folder** (the one containing `manifest.json`).
5. **⏱️ The 15-Second Sync:** Upon installation, the extension will automatically begin syncing the **Default Safety Lists** from GitHub:
   * `default_server.txt` (Server ID Blocks)
   * `default_words.txt` (Profanity/Regex Filters)
   **Please wait at least 15 seconds** for the background process to finish downloading and compiling these lists.
6. **🔄 The Initialization Toggle:** Click the 🛡️ NoCreepy icon in your browser toolbar. **Toggle the master switch OFF and then back ON**. This ensures the database is fully initialized for your first session.
7. **Refresh Discord:** Go to your Discord tab and press **F5**. You are now protected!

---

## 🔒 Privacy & ToS

* **100% Local:** All data is stored in `chrome.storage.local` (IndexedDB) on your computer. We do not send any info to our servers or 3rd parties.
* **ToS Compliant:** We do not modify Discord's API or replay requests. All actions are performed on the frontend via DOM manipulation.

---

## ⚙️ Settings & Customization

### Manual Blocklists
Add your own custom words or 18-digit Discord Server IDs in the **Full Settings** dashboard.

### Remote Subscriptions
NoCreepy comes pre-loaded with the following default lists:
* [Default Server Blocks](https://raw.githubusercontent.com/blueskychan-dev/fossasia-hackathon2026/refs/heads/main/Filter_JSON/default_server.txt)
* [Default Word Filters](https://raw.githubusercontent.com/blueskychan-dev/fossasia-hackathon2026/refs/heads/main/Filter_JSON/default_words.txt)

You can add your own remote `.txt` URLs in the settings to create your own community safety net.

---

## 🚨 Security Reports
Report any security problems or vulnerabilities via our GitHub Issues:
[https://github.com/blueskychan-dev/fossasia-hackathon2026/issues](https://github.com/blueskychan-dev/fossasia-hackathon2026/issues)

*Created for the FOSSASIA 2026 Hackathon.*
