// NoCreepy — Discord Safety Extension (content.js)
(() => {
  const TAG = "%c[NoCreepy]";
  const STYLE_WARN = "color:#ff5555;font-weight:bold";
  const STYLE_INFO = "color:#8be9fd;font-weight:bold";

  const DISCORD_PATTERN = /discord\.com\/channels\/\d+/i;

  // --- STATE (Synced from Extension Storage) ---
  let config = {
    globalEnable: true,
    badWords: [],
    badServers: [],
    filterMessages: true,
    filterServers: true
  };

  let currentServer = null;
  let isModalOpen = false;
  
  // Memory to prevent double-counting messages that React re-renders
  const countedMessageIds = new Set();


  // ==========================================
  // PART 1: NETWORK & URL SNOOPING DETECTION
  // ==========================================
  function initSnoopDetection() {
    const _fetch = window.fetch;
    window.fetch = function (...args) {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url ?? "";
      if (DISCORD_PATTERN.test(url)) {
        console.warn(TAG, STYLE_WARN, "Discord detected! A fetch() request targeted a Discord channel URL →", url);
      }
      return _fetch.apply(this, args);
    };

    const _xhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      if (typeof url === "string" && DISCORD_PATTERN.test(url)) {
        console.warn(TAG, STYLE_WARN, "Discord detected! An XHR request targeted a Discord channel URL →", url);
      }
      return _xhrOpen.call(this, method, url, ...rest);
    };

    if (navigator.sendBeacon) {
      const _beacon = navigator.sendBeacon.bind(navigator);
      navigator.sendBeacon = function (url, data) {
        if (typeof url === "string" && DISCORD_PATTERN.test(url)) {
          console.warn(TAG, STYLE_WARN, "Discord detected! A sendBeacon() targeted a Discord channel URL →", url);
        }
        return _beacon(url, data);
      };
    }

    try {
      const _referrer = Object.getOwnPropertyDescriptor(Document.prototype, "referrer");
      if (_referrer && _referrer.get) {
        Object.defineProperty(Document.prototype, "referrer", {
          get() {
            const value = _referrer.get.call(this);
            if (DISCORD_PATTERN.test(value)) {
              console.warn(TAG, STYLE_WARN, "Discord detected! Page read document.referrer containing a Discord channel URL →", value);
            }
            return value;
          },
          configurable: true,
        });
      }
    } catch (e) {}

    const _pushState = history.pushState;
    const _replaceState = history.replaceState;

    history.pushState = function (state, title, url) {
      if (typeof url === "string" && DISCORD_PATTERN.test(url)) {
        console.warn(TAG, STYLE_WARN, "Discord detected! pushState() used a Discord channel URL →", url);
      }
      return _pushState.apply(this, arguments);
    };

    history.replaceState = function (state, title, url) {
      if (typeof url === "string" && DISCORD_PATTERN.test(url)) {
        console.warn(TAG, STYLE_WARN, "Discord detected! replaceState() used a Discord channel URL →", url);
      }
      return _replaceState.apply(this, arguments);
    };
  }


  // ==========================================
  // PART 2: MESSAGE CENSORING (With Regex Support & Counter)
  // ==========================================
  function censorAll() {
    // 🛑 FIXED: The globalEnable switch is now active!
    if (!config.globalEnable || !config.filterMessages || config.badWords.length === 0) return;

    let rawRegexes = [];
    let plainWords = [];

    for (let w of config.badWords) {
      w = w.trim();
      
      if (w.startsWith('(?i)')) {
        rawRegexes.push(w.slice(4));
      } 
      else if (w.startsWith('/') && w.lastIndexOf('/') > 0) {
        const lastSlash = w.lastIndexOf('/');
        rawRegexes.push(w.substring(1, lastSlash));
      } 
      else {
        plainWords.push(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      }
    }

    let combinedParts = [];
    
    if (plainWords.length > 0) {
      combinedParts.push(`\\b(${plainWords.join('|')})\\b`);
    }
    
    if (rawRegexes.length > 0) {
      combinedParts.push(rawRegexes.map(r => `(?:${r})`).join('|'));
    }

    if (combinedParts.length === 0) return;

    const targetWord = new RegExp(combinedParts.join('|'), 'gi');
    const messages = document.querySelectorAll('[id^="message-content-"]');
    let newCensorsCount = 0;

    for (const contentNode of messages) {
      if (contentNode.dataset.isCensored === 'true') continue;

      if (targetWord.test(contentNode.innerHTML)) {
        
        const msgId = contentNode.id;
        if (!countedMessageIds.has(msgId)) {
          const matches = contentNode.innerHTML.match(targetWord);
          if (matches) {
            newCensorsCount += matches.length; 
            countedMessageIds.add(msgId);
          }
        }

        contentNode.innerHTML = contentNode.innerHTML.replace(
          targetWord,
          `<span style="background-color: #1e1f22; color: #80848e; padding: 0 4px; border-radius: 3px; cursor: help;" title="This message contains flagged words/patterns.">****</span>`
        );
        contentNode.dataset.isCensored = 'true';
      }
    }

    if (newCensorsCount > 0) {
      chrome.storage.local.get(["censoredCount"], (data) => {
        let currentCount = data.censoredCount || 0;
        chrome.storage.local.set({ censoredCount: currentCount + newCensorsCount });
      });
    }
  }

  // ==========================================
  // PART 3: SERVER BLOCKING (DISCORD NATIVE UI)
  // ==========================================
  function showSafetyModal() {
    if (isModalOpen) return;
    isModalOpen = true;

    const backdrop = document.createElement('div');
    backdrop.id = 'custom-safety-modal';
    backdrop.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.85); z-index: 99999; display: flex; align-items: center; justify-content: center;';

    backdrop.innerHTML = `
      <div data-mana-component="modal" class="container__8a031 size-md__8a031 padding-size-sm__8a031 theme-dark" style="opacity: 1; transform: scale(1);">
        <header class="section__8a031 header__8a031">
          <div data-align="stretch" data-justify="start" data-direction="vertical" data-wrap="false" data-full-width="true" class="stack_dbd263" style="gap: var(--space-8); padding: var(--space-0);">
            <div class="headerLayout__8a031">
              <div class="headerMain__8a031">
                <h1 class="heading-lg/semibold_cf4812 defaultColor__5345c headerTitle__8a031" data-text-variant="heading-lg/semibold" style="color: var(--text-danger);">⚠️ Safety Warning</h1>
              </div>
              <div class="headerTrailing__8a031">
                <button id="safety-close-btn" class="button_a22cb0 md_a22cb0 icon-only_a22cb0"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.3 20.7a1 1 0 0 0 1.4-1.4L13.42 12l7.3-7.3a1 1 0 0 0-1.42-1.4L12 10.58l-7.3-7.3a1 1 0 0 0-1.4 1.42L10.58 12l-7.3 7.3a1 1 0 1 0 1.42 1.4L12 13.42l7.3 7.3Z"/></svg></button>
              </div>
            </div>
            <div class="headerSubtitleWrapper__8a031">
              <div class="text-md/normal_cf4812 headerSubtitle__8a031" data-text-variant="text-md/normal" style="color: var(--text-subtle);">This discord server may not be safe for your children or YOU.</div>
            </div>
          </div>
        </header>
        <div class="bodySpacerTop__8a031"></div>
        <div class="body__8a031 auto_d125d2 scrollerBase_d125d2" dir="ltr" style="overflow: hidden scroll; padding-right: 0px;">
          <main class="bodyInner__8a031">
            <div class="linkCalloutContainer_ad9c52 thin_d125d2 scrollerBase_d125d2" dir="ltr" style="overflow: hidden scroll; padding-right: 8px;">
              <span class="text-md/normal_cf4812" style="color: var(--text-normal);">This server has been flagged for </span>
              <span class="text-md/semibold_cf4812" style="color: var(--text-danger);">NSFW content, sexual talk for underage, and other highly inappropriate themes.</span>
            </div>
            <div style="margin-top: 16px;">
              <span class="text-sm/medium_cf4812" style="color: var(--text-muted);">Do you want to view the content or leave immediately?</span>
            </div>
          </main>
        </div>
        <div class="bodySpacerBottom__8a031"></div>
        <footer class="actionBar__8a031 section__8a031">
          <div class="actionBarTrailing__8a031 actionBarTrailingFullWidth__8a031">
            <div data-align="stretch" data-justify="start" data-direction="horizontal" data-wrap="true" data-full-width="true" class="stack_dbd263" style="gap: var(--space-8); padding: var(--space-0);">
              <button id="safety-proceed-btn" class="button_a22cb0 md_a22cb0 secondary_a22cb0 hasText_a22cb0 fullWidth_a22cb0"><span class="lineClamp1__4bd52 text-md/medium_cf4812">I understand the risks, let me in</span></button>
              <button id="safety-leave-btn" class="button_a22cb0 md_a22cb0 primary_a22cb0 hasText_a22cb0 fullWidth_a22cb0" style="background-color: var(--button-danger-background); color: white;"><span class="lineClamp1__4bd52 text-md/medium_cf4812">Take me to safety</span></button>
            </div>
          </div>
        </footer>
      </div>
    `;

    document.body.appendChild(backdrop);

    const handleLeave = () => {
      document.getElementById('custom-safety-modal')?.remove();
      isModalOpen = false;
      currentServer = null; 
      window.location.href = '/channels/@me'; 
    };

    document.getElementById('safety-leave-btn').addEventListener('click', handleLeave);
    document.getElementById('safety-close-btn').addEventListener('click', handleLeave);
    document.getElementById('safety-proceed-btn').addEventListener('click', () => {
      document.getElementById('custom-safety-modal')?.remove();
      isModalOpen = false;
    });
  }

  function checkCurrentServer() {
    // 🛑 FIXED: The globalEnable switch is now active!
    if (!config.globalEnable || !config.filterServers || config.badServers.length === 0) return;

    const urlParts = window.location.pathname.split('/');
    if (urlParts[1] === 'channels' && urlParts[2] && urlParts[2] !== '@me') {
      const newServerId = urlParts[2];
      if (newServerId !== currentServer) {
        currentServer = newServerId; 
        if (config.badServers.includes(newServerId)) {
          showSafetyModal();
        }
      }
    } else {
      currentServer = null; 
    }
  }


  // ==========================================
  // PART 4: INITIALIZATION & OBSERVERS
  // ==========================================
  function initNoCreepy() {
    console.info(TAG, STYLE_INFO, "NoCreepy loaded — Monitoring Active.");
    
    initSnoopDetection();

    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        checkCurrentServer(); 
      }
    }).observe(document.body, { childList: true, subtree: true });

    const root = document.querySelector('[class*="chatContent_"]') || document.body;
    new MutationObserver(() => {
      censorAll();
    }).observe(root, { childList: true, subtree: true, characterData: true });

    checkCurrentServer();
    censorAll();
    
    if (DISCORD_PATTERN.test(window.location.href)) {
      console.info(TAG, STYLE_INFO, "You are on a Discord channel page →", window.location.href);
    }
  }

  // Load initial data from background storage and boot
  chrome.storage.local.get(["globalEnable", "badWords", "badServers", "filterMessages", "filterServers"], (data) => {
    config = { ...config, ...data };
    initNoCreepy();
  });

  // 🔄 REFRESH PAGE LOGIC ADDED HERE
  chrome.storage.onChanged.addListener((changes) => {
    let requiresReload = false;

    for (let key in changes) {
      config[key] = changes[key].newValue;
      
      // If the global toggle changes, flag for reload
      if (key === 'globalEnable') {
        requiresReload = true;
      }
    }

    if (requiresReload) {
      console.info(TAG, STYLE_INFO, "Global toggle changed! Refreshing page to apply...");
      window.location.reload(); // Instantly refresh Discord
    } else {
      censorAll(); 
      checkCurrentServer(); 
    }
  });

})();