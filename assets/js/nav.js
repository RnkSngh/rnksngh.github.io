// On narrow screens the page links and the contact icons each collapse
// behind a toggle button; opening one panel closes the other.
// Without JS the nav stays fully expanded.
document.querySelectorAll("nav").forEach(function (nav) {
  var toggles = Array.prototype.slice.call(nav.querySelectorAll(".navToggle"));

  function setOpen(toggle, open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.getElementById(toggle.getAttribute("aria-controls")).classList.toggle("open", open);
  }

  function closeAll() {
    toggles.forEach(function (toggle) {
      setOpen(toggle, false);
    });
  }

  toggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      closeAll();
      setOpen(toggle, open);
    });
  });

  document.addEventListener("click", function (e) {
    if (!nav.contains(e.target)) closeAll();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll();
  });

  nav.classList.add("collapsible");
});
