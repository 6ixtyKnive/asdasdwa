(() => {
  const icon32 = "images/favicon-32x32.a51a3e2a.png";
  const icon16 = "images/favicon-16x16.1e9f640f.png";

  function upsertIcon(rel, href, sizes) {
    let el = document.querySelector(`link[rel='${rel}']`);
    if (!el) {
      el = document.createElement("link");
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
    if (sizes) el.sizes = sizes;
    el.type = "image/png";
  }

  upsertIcon("icon", icon32, "32x32");
  upsertIcon("shortcut icon", icon32);

  const icon16Tag = document.createElement("link");
  icon16Tag.rel = "icon";
  icon16Tag.type = "image/png";
  icon16Tag.sizes = "16x16";
  icon16Tag.href = icon16;
  document.head.appendChild(icon16Tag);
})();
