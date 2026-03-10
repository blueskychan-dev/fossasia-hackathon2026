# Security Policy 🛡️

The **NoCreepy** team takes user privacy and security very seriously. This document outlines our data practices, extension boundaries, and how to report vulnerabilities.

## 🔒 Data Privacy & Local Storage
**We do not collect, track, or send your data anywhere.**
* **100% Local:** All configuration settings, manual blocklists, and subscription data are stored strictly on your local machine using Chrome's native `chrome.storage.local` API (which utilizes IndexedDB).
* **No Telemetry:** We do not use analytics, we do not monitor your chat, and we do not phone home to any developer servers or 3rd parties.
* **Subscription Safety:** The remote blocklists you subscribe to are parsed strictly as plain text. The extension is designed so that remote files cannot inject executable JavaScript, steal tokens, or interact with your Discord account in any way.

## ✅ Discord Terms of Service (ToS) Compliance
NoCreepy is designed to be completely compliant with Discord's Terms of Service.
* **Strictly Frontend:** This extension operates entirely on the client-side (frontend) by utilizing standard DOM manipulation (`MutationObserver`). 
* **No API Tampering:** We do not modify, block, or replay internal Discord API requests. 
* **No Automation:** We do not automate actions on your behalf (no "self-botting"). 
* The extension simply reads the HTML elements currently rendered on your screen and visually obscures specific text nodes or overlays a standard HTML/CSS modal over the webpage.

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability or a bug that could compromise user safety, please report it immediately.

**To report an issue:**
Please open an issue on our official GitHub repository here:
👉 **[Report a Security Problem / Bug](https://github.com/blueskychan-dev/fossasia-hackathon2026/issues)**

When submitting an issue, please include:
1. A description of the vulnerability or bug.
2. Steps to reproduce the issue.
3. The version of the extension and browser you are using.

Thank you for helping keep the NoCreepy community safe!