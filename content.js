// NoCreepy — Discord URL detection
// Intercepts attempts by pages to read/match discord.com/channels URLs

(() => {
  const TAG = "%c[NoCreepy]";
  const STYLE_WARN = "color:#ff5555;font-weight:bold";
  const STYLE_INFO = "color:#8be9fd;font-weight:bold";

  const DISCORD_PATTERN = /discord\.com\/channels\/\d+/i;

  // --- 1. Monitor outgoing fetch() requests ---
  const _fetch = window.fetch;
  window.fetch = function (...args) {
    const url = typeof args[0] === "string" ? args[0] : args[0]?.url ?? "";
    if (DISCORD_PATTERN.test(url)) {
      console.warn(TAG, STYLE_WARN, "Discord detected! A fetch() request targeted a Discord channel URL →", url);
    }
    return _fetch.apply(this, args);
  };

  // --- 2. Monitor XMLHttpRequest ---
  const _xhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    if (typeof url === "string" && DISCORD_PATTERN.test(url)) {
      console.warn(TAG, STYLE_WARN, "Discord detected! An XHR request targeted a Discord channel URL →", url);
    }
    return _xhrOpen.call(this, method, url, ...rest);
  };

  // --- 3. Monitor navigator.sendBeacon ---
  if (navigator.sendBeacon) {
    const _beacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function (url, data) {
      if (typeof url === "string" && DISCORD_PATTERN.test(url)) {
        console.warn(TAG, STYLE_WARN, "Discord detected! A sendBeacon() targeted a Discord channel URL →", url);
      }
      return _beacon(url, data);
    };
  }

  // --- 4. Monitor document.referrer access when it contains Discord ---
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
  } catch (e) {
    // silently ignore if we can't override
  }

  // --- 5. Monitor history state for Discord URLs ---
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

  // --- 6. If the current page IS Discord, announce it ---
  if (DISCORD_PATTERN.test(window.location.href)) {
    console.info(TAG, STYLE_INFO, "You are on a Discord channel page →", window.location.href);
  }

  // --- Boot message ---
  console.info(TAG, STYLE_INFO, "NoCreepy v0.1.0 loaded — monitoring for Discord URL snooping.");
})();
