# NoCreepy — Discord Safety Extension 🛡️

<img width="305" height="436" alt="image" src="https://github.com/user-attachments/assets/fd5c9c67-b18a-4335-b314-f3bb34197758" />

**NoCreepy** is a privacy and child-safety Chrome Extension designed specifically for Discord Web (`discord.com`). It acts as a shield against inappropriate content, predatory behavior, and malicious servers by modifying the user interface strictly on the client side.

Built for the **FOSSASIA 2026 Hackathon**, NoCreepy operates 100% locally and supports Pi-hole style remote subscriptions for community-driven safety lists.

---

## ✨ Features

* 🛑 **Server Blocker:** Prevents users from viewing flagged Discord servers. If a user clicks into a blacklisted server, a native-looking Discord modal instantly overlays the screen.
* 💬 **Live Chat Censor:** Dynamically scans React-rendered chat messages and replaces blacklisted words with a `****` tooltip block.
* 🧠 **Advanced Regex Engine:** Supports plain text blocking or advanced Regular Expressions (e.g., `(?i)f+[\W_]*u[\W_]*c[\W_]*k+`).
* 📋 **Pi-hole Style Subscriptions:** Manually sync with remote `.txt` safety lists for easy updates.
* 🕵️ **Snoop Detection:** Monitors network requests to warn you if a webpage is trying to snoop on your Discord channel URLs.
* ⚡ **Global Kill-Switch:** Instantly toggle the extension on or off.

---

## 🚀 Installation & First-Time Setup

NoCreepy is available as an unpacked extension. Follow these steps to install and activate your safety filters:

### 1. Install the Extension

1. **Download:** Download or clone this repository to your local machine and extract the files.
2. **Extensions Page:** Open Google Chrome and navigate to `chrome://extensions/`.
3. **Developer Mode:** Enable **Developer mode** using the toggle in the top right corner.
4. **Load Unpacked:** Click the **Load unpacked** button and select the **`NoCreepy` folder** (the one containing `manifest.json`).

### 2. Manually Add Safety Lists

NoCreepy does not pre-load data for privacy reasons. You must add the safety lists manually:

1. Click the 🛡️ NoCreepy icon in your browser toolbar and select the **Settings (Gear Icon)**.
2. Scroll to the **Remote Subscriptions** section.
3. **Add the Server Blocklist:** Copy the link below, paste it into the URL box, and click **Subscribe**.
> `https://raw.githubusercontent.com/blueskychan-dev/fossasia-hackathon2026/refs/heads/main/Filter_JSON/default_server.txt`


4. **Add the Word Blocklist:** Copy the link below, paste it into the URL box, and click **Subscribe**.
> `https://raw.githubusercontent.com/blueskychan-dev/fossasia-hackathon2026/refs/heads/main/Filter_JSON/default_words.txt`


5. Click **🔄 Resync All** to ensure all filters are downloaded and compiled.

### 3. Initialize & Activate

1. Click the 🛡️ NoCreepy icon in your toolbar again.
2. **Toggle the master switch OFF and then back ON**. This initializes the database for your current session.
3. Go to your Discord tab and press **F5**. You are now protected!

---

## 🔒 Privacy & ToS

* **100% Local:** All data is stored in `chrome.storage.local` (IndexedDB) on your computer. We do not send any info to our servers or 3rd parties.
* **ToS Compliant:** We do not modify Discord's API or replay requests. All actions are performed on the frontend via DOM manipulation.

---

## ⚙️ Settings & Customization

### Manual Blocklists

Add your own custom words or 18-digit Discord Server IDs in the **Full Settings** dashboard to personalize your protection.

### Community Lists

You can find the raw content of the default lists here:

* [Default Server Blocks (Content)](https://raw.githubusercontent.com/blueskychan-dev/fossasia-hackathon2026/refs/heads/main/Filter_JSON/default_server.txt)
* [Default Word Filters (Content)](https://raw.githubusercontent.com/blueskychan-dev/fossasia-hackathon2026/refs/heads/main/Filter_JSON/default_words.txt)

---

## 🚨 Security Reports

Report any security problems or vulnerabilities via our GitHub Issues:
[https://github.com/blueskychan-dev/fossasia-hackathon2026/issues](https://github.com/blueskychan-dev/fossasia-hackathon2026/issues)

*Created for the FOSSASIA 2026 Hackathon.*
