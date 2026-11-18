// ==UserScript==
// @name         Zeta Menu Button (Plot Edit / Private Copy)
// @namespace    https://github.com/zdbookmarklet/Menu-Button
// @version      1.0.0
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
