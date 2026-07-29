/**
 * Graydys homepage interactions: brand tab switching, scroll reveals, year stamp.
 * Brand hrefs stay "#" until each site URL is ready; update BRANDS[].href then.
 */

/** @typedef {{ tag: string, title: string, body: string, href: string, cta: string }} BrandCopy */

/** @type {Record<string, BrandCopy>} */
const BRANDS = {
  gradys: {
    tag: "Design & production",
    title: "Gradys Creative Studio",
    body: "Brand systems, campaigns, and visual storytelling for businesses that want craft with clarity.",
    href: "#",
    cta: "Site coming soon",
  },
  aurea: {
    tag: "Lifestyle & beauty",
    title: "GR Aurea",
    body: "A refined lifestyle label focused on everyday pieces with a warm, elevated finish.",
    href: "#",
    cta: "Site coming soon",
  },
  pets: {
    tag: "Pets & care",
    title: "Graydys Pet Supplies",
    body: "Thoughtful supplies and essentials for pets—practical quality for everyday care.",
    href: "#",
    cta: "Site coming soon",
  },
  rc: {
    tag: "RC & hobbies",
    title: "RC Mania PH",
    body: "Radio-control gear and community for enthusiasts across the Philippines.",
    href: "#",
    cta: "Site coming soon",
  },
  beads: {
    tag: "Handmade & craft",
    title: "Graydys Beads Shop",
    body: "Beads, findings, and materials for makers building jewelry and craft projects.",
    href: "#",
    cta: "Site coming soon",
  },
};

/**
 * Updates the brand panel copy and accent state for the selected brand id.
 * @param {string} brandId - Key in BRANDS (gradys | aurea | pets | rc | beads)
 * @param {HTMLElement} panel - The tabpanel element
 * @param {HTMLElement | null} activeTab - Tab that triggered the update
 * @returns {void}
 */
function setActiveBrand(brandId, panel, activeTab) {
  const copy = BRANDS[brandId];
  if (!copy) return;

  panel.classList.remove("is-switching");
  // Force reflow so the enter animation restarts on each selection
  void panel.offsetWidth;
  panel.classList.add("is-switching");
  panel.dataset.active = brandId;

  const tag = panel.querySelector('[data-field="tag"]');
  const title = panel.querySelector('[data-field="title"]');
  const body = panel.querySelector('[data-field="body"]');
  const link = panel.querySelector('[data-field="link"]');

  if (tag) tag.textContent = copy.tag;
  if (title) title.textContent = copy.title;
  if (body) body.textContent = copy.body;

  if (link instanceof HTMLAnchorElement) {
    link.textContent = copy.cta;
    link.href = copy.href;
    const isLive = copy.href !== "#" && copy.href.trim() !== "";
    link.setAttribute("aria-disabled", isLive ? "false" : "true");
    if (isLive) {
      link.removeAttribute("aria-disabled");
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      link.removeAttribute("target");
      link.removeAttribute("rel");
    }
  }

  if (activeTab) {
    panel.setAttribute("aria-labelledby", activeTab.id);
  }
}

/**
 * Wires brand tabs to the shared panel with keyboard-friendly tab semantics.
 * @returns {void}
 */
function initBrandTabs() {
  const tabs = Array.from(document.querySelectorAll(".brand-tab"));
  const panel = document.getElementById("panel-brand");
  if (!panel || tabs.length === 0) return;

  /**
   * Activates one tab and updates selection state on siblings.
   * @param {HTMLElement} nextTab - Tab button to activate
   * @returns {void}
   */
  function activate(nextTab) {
    tabs.forEach((tab) => {
      const on = tab === nextTab;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });
    setActiveBrand(nextTab.dataset.brand || "gradys", panel, nextTab);
  }

  tabs.forEach((tab, index) => {
    tab.tabIndex = tab.classList.contains("is-active") ? 0 : -1;

    tab.addEventListener("click", () => activate(tab));

    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }
      event.preventDefault();
      tabs[nextIndex].focus();
      activate(tabs[nextIndex]);
    });
  });
}

/**
 * Observes [data-reveal] elements and adds .is-visible when they enter view.
 * @returns {void}
 */
function initReveals() {
  const nodes = document.querySelectorAll("[data-reveal]");
  if (!nodes.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    nodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );

  nodes.forEach((node) => observer.observe(node));
}

/**
 * Sets the footer copyright year to the current calendar year.
 * @returns {void}
 */
function initYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initBrandTabs();
  initReveals();
});
