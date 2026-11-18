// ==UserScript==
// @name         Zeta Menu Button (Plot Edit / Private Copy)
// @namespace    https://github.com/zdbookmarklet/Menu-Button
// @version      1.1.0
// @description  GitHub loader for the plot editor and private-copy floating menu
// @match        https://zeta-ai.io/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/zdbookmarklet/Menu-Button/main/menu-button-loader.user.js
// @downloadURL  https://raw.githubusercontent.com/zdbookmarklet/Menu-Button/main/menu-button-loader.user.js
// ==/UserScript==

(() => {
  'use strict';
  // Run in the page world: the core needs to observe Zeta's XMLHttpRequest headers.
  if (window.top !== window) return;
  const KEY = '__zetaMenuButtonLoaderV1';
  if (window[KEY]) return;
  window[KEY] = true;
  // Capture authentication before the asynchronously loaded UI core starts.
  // Memory only: never log or persist credentials.
  const bridge = window.__zetaMenuButtonAuthBridgeV1 = { auth: null, headers: {} };
  const keepHeader = (name, value) => {
    const key = String(name).toLowerCase();
    if (key === 'authorization' && typeof value === 'string' && value.length > 10) bridge.auth = value;
    if (['accept','x-client-native-version','x-client-type','x-client-version','x-device-type','x-user-language'].includes(key)) bridge.headers[key] = String(value);
  };
  const inspectHeaders = (headers) => {
    try { new Headers(headers).forEach((value, key) => keepHeader(key, value)); } catch {}
  };
  const nativeFetch = window.fetch;
  if (typeof nativeFetch === 'function') window.fetch = function(input, init) {
    try {
      const url = typeof input === 'string' ? input : input?.url;
      if (new URL(url, location.href).hostname === 'api.zeta-ai.io') {
        inspectHeaders(input instanceof Request ? input.headers : undefined);
        if (init?.headers) inspectHeaders(init.headers);
      }
    } catch {}
    return nativeFetch.apply(this, arguments);
  };
  const nativeOpen = XMLHttpRequest.prototype.open;
  const nativeSetHeader = XMLHttpRequest.prototype.setRequestHeader;
  const xhrUrls = new WeakMap();
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    try { xhrUrls.set(this, new URL(String(url), location.href).hostname === 'api.zeta-ai.io'); } catch {}
    return nativeOpen.call(this, method, url, ...args);
  };
  XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
    if (xhrUrls.get(this)) keepHeader(name, value);
    return nativeSetHeader.call(this, name, value);
  };
  const url = 'https://raw.githubusercontent.com/zdbookmarklet/Menu-Button/main/menu-button-core.js?ts=' + Date.now();
  const execute = (code) => {
    if (!code.includes('zeta-private-tool-v1') || !code.includes('private-snapshots')) {
      throw new Error('GitHub returned unexpected Menu Button source');
    }
    // The original bookmarklet expects document.body to exist.
    const run = () => {
      try {
        (new Function(code + '\n//# sourceURL=zeta-menu-button-core.js'))();
      } catch (error) {
        console.error('[Zeta Menu Button] execution failed', error);
      }
    };
    if (document.body) run();
    else document.addEventListener('DOMContentLoaded', run, { once: true });
  };
  fetch(url, { cache: 'no-store', credentials: 'omit' })
    .then((response) => {
      if (!response.ok) throw new Error('GitHub HTTP ' + response.status);
      return response.text();
    })
    .then(execute)
    .catch((error) => {
      console.error('[Zeta Menu Button] loading failed', error);
      window[KEY] = false;
    });
})();
