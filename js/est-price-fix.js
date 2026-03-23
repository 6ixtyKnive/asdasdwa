(() => {
  const TARGET_VALUE = "$214.4";
  const PLACEHOLDER_RE = /\$(?:\.{2,3}|\u2026|\u22EF)/g;
  const EST_PRICE_RE = /Est\.?\s*price/i;

  function hasEstPriceContext(node) {
    let el = node && node.parentElement;
    for (let i = 0; i < 6 && el; i += 1) {
      if (EST_PRICE_RE.test(el.textContent || "")) return true;
      el = el.parentElement;
    }
    return false;
  }

  function patchTextNodes(root) {
    const scope = root && root.nodeType ? root : document.body;
    if (!scope) return;

    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let current = walker.nextNode();
    while (current) {
      nodes.push(current);
      current = walker.nextNode();
    }

    for (let i = 0; i < nodes.length; i += 1) {
      const textNode = nodes[i];
      const value = textNode.nodeValue || "";
      if (!PLACEHOLDER_RE.test(value)) continue;

      const shouldPatch = value.indexOf("≈") !== -1 || hasEstPriceContext(textNode);
      if (!shouldPatch) continue;

      textNode.nodeValue = value.replace(PLACEHOLDER_RE, TARGET_VALUE);
    }
  }

  patchTextNodes(document.body);

  const observer = new MutationObserver((records) => {
    for (let i = 0; i < records.length; i += 1) {
      const record = records[i];
      if (record.type === "characterData") {
        patchTextNodes(record.target && record.target.parentElement);
      }
      for (let j = 0; j < record.addedNodes.length; j += 1) {
        const node = record.addedNodes[j];
        if (node.nodeType === 1 || node.nodeType === 3) {
          patchTextNodes(node);
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})();
