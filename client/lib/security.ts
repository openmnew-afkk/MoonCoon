export function enableAppProtection() {
  document.addEventListener("contextmenu", (e) => {
    const t = e.target as HTMLElement;
    if (t.closest("input, textarea, [contenteditable='true']")) return;
    e.preventDefault();
  });

  document.addEventListener("keydown", (e) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      ["c", "x", "a", "u", "s", "p"].includes(e.key.toLowerCase())
    ) {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea")) return;
      e.preventDefault();
    }
    if (e.key === "F12") e.preventDefault();
  });

  document.addEventListener("dragstart", (e) => {
    const t = e.target as HTMLElement;
    if (t.tagName === "IMG" || t.tagName === "VIDEO") e.preventDefault();
  });

  const style = document.createElement("style");
  style.id = "pilswintgam-protection";
  style.textContent = `
    img, video {
      -webkit-user-drag: none;
      user-drag: none;
    }
    body {
      -webkit-touch-callout: none;
    }
    input, textarea, [contenteditable="true"] {
      -webkit-user-select: text !important;
      user-select: text !important;
    }
  `;
  if (!document.getElementById("pilswintgam-protection")) {
    document.head.appendChild(style);
  }

  if (import.meta.env.PROD) {
    const noop = () => {};
    try {
      Object.defineProperty(window, "console", {
        value: { log: noop, debug: noop, info: noop, warn: console.warn, error: console.error },
      });
    } catch {
      /* ignore */
    }
  }
}
