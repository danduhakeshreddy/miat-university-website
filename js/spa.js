// Lightweight same-origin SPA navigation for the MIAT static page set.
(() => {
  const parse = html => new DOMParser().parseFromString(html, "text/html");
  let activeRequest = 0;
  const focusFragment = hash => {
    const target = hash && document.querySelector(hash);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (!target.matches("a[href],button,input,select,textarea,[tabindex]")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  async function navigate(to, { replace = false, popstate = false } = {}) {
    const url = new URL(to, location.href);
    if (url.origin !== location.origin) { location.assign(url.href); return; }
    if (url.pathname === location.pathname && url.search === location.search && url.hash) {
      focusFragment(url.hash);
      return;
    }
    const requestId = ++activeRequest;
    const currentMain = document.querySelector("main");
    currentMain?.setAttribute("aria-busy", "true");
    try {
      const response = await fetch(url.href, { headers: { "X-MIAT-Navigation": "spa" } });
      if (!response.ok) throw new Error(`Navigation failed: ${response.status}`);
      const next = parse(await response.text());
      const nextMain = next.querySelector("main");
      if (!nextMain || !currentMain) throw new Error("The destination does not have an SPA page shell.");
      if (requestId !== activeRequest) return;

      window.MIAT?.cleanupPage?.();
      currentMain.innerHTML = nextMain.innerHTML;
      currentMain.removeAttribute("aria-busy");
      currentMain.setAttribute("tabindex", "-1");
      document.body.dataset.page = next.body.dataset.page || "";
      document.title = next.title || document.title;
      const description = next.querySelector('meta[name="description"]')?.content;
      let descriptionTag = document.querySelector('meta[name="description"]');
      if (description) {
        if (!descriptionTag) { descriptionTag = document.createElement("meta"); descriptionTag.name = "description"; document.head.append(descriptionTag); }
        descriptionTag.content = description;
      }
      if (!popstate) history[replace ? "replaceState" : "pushState"]({}, "", url.pathname + url.search + url.hash);
      document.dispatchEvent(new CustomEvent("miat:navigate", { detail: { url } }));
      if (url.hash) requestAnimationFrame(() => focusFragment(url.hash));
      else {
        window.scrollTo({ top: 0, behavior: "auto" });
        requestAnimationFrame(() => currentMain.focus({ preventScroll: true }));
      }
    } catch (error) {
      if (requestId === activeRequest) currentMain?.removeAttribute("aria-busy");
      console.warn("MIAT SPA navigation fell back to a full page load.", error);
      location.assign(url.href);
    }
  }

  window.MIAT = window.MIAT || {};
  window.MIAT.navigate = to => navigate(to);
  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a[href]");
    if (!link || link.target || link.hasAttribute("download") || link.getAttribute("rel")?.includes("external")) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !url.pathname.endsWith(".html")) return;
    if (url.pathname === location.pathname && url.hash) return;
    event.preventDefault();
    navigate(url.href);
  });
  window.addEventListener("popstate", () => navigate(location.href, { popstate: true }));
})();

