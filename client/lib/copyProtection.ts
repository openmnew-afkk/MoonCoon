export function enableCopyProtection() {
  // Disable right-click
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // Disable text selection and drag
  document.addEventListener("selectstart", (e) => e.preventDefault());
  document.addEventListener("dragstart", (e) => e.preventDefault());

  // Disable keyboard shortcuts for copy/cut
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "x" || e.key === "a")) {
      e.preventDefault();
    }
  });

  // Add CSS to prevent selection
  const style = document.createElement("style");
  style.innerHTML = `
    * {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-user-drag: none;
      -webkit-touch-callout: none;
    }
    input, textarea {
      -webkit-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
      user-select: text;
    }
  `;
  document.head.appendChild(style);
}
