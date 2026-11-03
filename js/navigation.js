// Accessible responsive navigation for the shared MIAT header.
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  if (!toggle || !nav) return;
  const setOpen = open => { nav.classList.toggle("is-open", open); toggle.setAttribute("aria-expanded", String(open)); };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  const closeDropdowns = () => nav.querySelectorAll(".nav-item").forEach(item => { item.classList.remove("is-open"); item.querySelector(".nav-trigger")?.setAttribute("aria-expanded", "false"); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") { setOpen(false); closeDropdowns(); } });
  document.addEventListener("click", event => { if (!event.target.closest(".site-header")) { setOpen(false); closeDropdowns(); } });
  nav.querySelectorAll(".nav-trigger").forEach(button => {
    button.addEventListener("click", () => {
      const item = button.closest(".nav-item");
      const open = !item.classList.contains("is-open");
      nav.querySelectorAll(".nav-item").forEach(entry => {
        entry.classList.remove("is-open");
        entry.querySelector(".nav-trigger")?.setAttribute("aria-expanded", "false");
      });
      item.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
    });
  });
  const markCurrent = () => {
    const current = location.pathname.split("/").pop() || "index.html";
    nav.querySelectorAll("a").forEach(link => {
      if (link.getAttribute("href") === current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };
  markCurrent();
  document.addEventListener("miat:navigate", markCurrent);
  nav.addEventListener("click", event => { if (event.target.closest("a")) { setOpen(false); closeDropdowns(); } });
});
