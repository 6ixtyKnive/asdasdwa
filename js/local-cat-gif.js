(() => {
  let gifPath = "images/scared-cat.gif";
  const gifFallbacks = [
    "images/scaredcat-animated.gif",
    "scaredcat-animated.gif",
    "scared-cat.gif",
  ];
  const markers = [
    "i.getgems.io/OYBMkZvVT8Sd6scBSMFxVAJdlylxGax7slrOIYzyCD8",
    "e20e311b25c45999",
    "24197533d0d99579",
  ];

  function hasMarker(value) {
    if (!value) return false;
    const text = String(value);
    for (let i = 0; i < markers.length; i += 1) {
      if (text.indexOf(markers[i]) !== -1) return true;
    }
    return false;
  }

  function isHeaderNode(node) {
    return !!(
      node &&
      node.closest &&
      node.closest("header,.PanelHeader,[class*='Header'],[class*='TopBar']")
    );
  }

  function applyGifToElement(el) {
    if (!el || isHeaderNode(el)) return;

    const tag = (el.tagName || "").toLowerCase();
    if (tag === "img") {
      if (
        hasMarker(el.currentSrc) ||
        hasMarker(el.src) ||
        hasMarker(el.getAttribute("srcset")) ||
        hasMarker(el.getAttribute("data-src"))
      ) {
        el.removeAttribute("srcset");
        el.src = gifPath;
        el.dataset.scaredCatGif = "1";
      }
      return;
    }

    if (tag === "source") {
      if (hasMarker(el.src) || hasMarker(el.srcset)) {
        el.src = gifPath;
        el.srcset = gifPath;
      }
      return;
    }

    if (tag === "video") {
      if (hasMarker(el.poster) || hasMarker(el.currentSrc) || hasMarker(el.src)) {
        el.poster = gifPath;
        el.src = gifPath;
      }
      return;
    }

    const bg = el.style && el.style.backgroundImage;
    if (hasMarker(bg)) {
      el.style.backgroundImage = "url('" + gifPath + "')";
    }
  }

  function patch(root) {
    const scope = root && root.querySelectorAll ? root : document;
    const nodes = scope.querySelectorAll(
      "img,source,video,[style*='background-image']",
    );
    for (let i = 0; i < nodes.length; i += 1) {
      applyGifToElement(nodes[i]);
    }
  }

  function resolveGif() {
    const queue = [gifPath].concat(gifFallbacks);
    let idx = 0;

    function next() {
      if (idx >= queue.length) {
        patch(document);
        return;
      }
      const candidate = queue[idx++];
      const probe = new Image();
      probe.onload = () => {
        gifPath = candidate;
        patch(document);
      };
      probe.onerror = next;
      probe.src = candidate;
    }

    next();
  }

  patch(document);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", resolveGif, { once: true });
  } else {
    resolveGif();
  }

  const observer = new MutationObserver((records) => {
    for (let i = 0; i < records.length; i += 1) {
      const rec = records[i];
      if (rec.type === "attributes") {
        applyGifToElement(rec.target);
      }
      for (let j = 0; j < rec.addedNodes.length; j += 1) {
        const node = rec.addedNodes[j];
        if (node.nodeType === 1) {
          applyGifToElement(node);
          patch(node);
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src", "srcset", "poster", "style"],
  });
})();
