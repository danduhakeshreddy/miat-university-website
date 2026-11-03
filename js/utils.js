// Shared DOM, message, and storage helpers.
window.$ = (selector, root = document) => root.querySelector(selector);
window.$$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
window.showMessage = (element, type, text) => {
  if (!element) return;
  element.textContent = text;
  element.className = `alert alert--${type}`;
  element.hidden = false;
};
window.clearMessage = element => { if (element) { element.textContent = ""; element.hidden = true; } };
window.trimValue = input => input.value.trim();
window.isEmpty = value => !String(value).trim();
window.storeArray = (key, array) => { try { localStorage.setItem(key, JSON.stringify(array)); } catch (_) {} };
window.readArray = key => { try { const value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value : []; } catch (_) { return []; } };
