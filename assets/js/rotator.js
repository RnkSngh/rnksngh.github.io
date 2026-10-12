// Each list item holds one .frame per state; all items switch to the next
// frame together. Freezes while hovered or focused;
// using the buttons pauses auto-cycling for a while before resuming.
// Without JS the full list is shown as-is.
document.querySelectorAll(".rotator").forEach(function (rotator) {
  var items = Array.prototype.slice.call(rotator.querySelectorAll(".rotatorItems > li")).map(
    function (item) {
      return Array.prototype.slice.call(item.querySelectorAll(".frame"));
    }
  );
  var frameCount = Math.max.apply(null, items.map(function (frames) {
    return frames.length;
  }));
  if (frameCount < 2) return;

  var BLOCKS = 3; // steps per half of the bar
  var interval = Number(rotator.dataset.interval) || 3000;
  var pause = Number(rotator.dataset.pause) || 10000;
  var controls = rotator.querySelector(".rotatorControls");
  var buttons = Array.prototype.slice.call(controls.querySelectorAll("button[data-frame]"));
  var fills = Array.prototype.slice.call(controls.querySelectorAll(".rotatorProgressFill"));
  var current = 0;
  var hovered = false;
  var focused = false;
  var countdowns = [];

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      show(Number(button.dataset.frame));
      run(pause, [1, 0, 1]);
    });
  });

  function show(n) {
    current = (n + frameCount) % frameCount;
    items.forEach(function (frames) {
      frames.forEach(function (frame, i) {
        var active = i === current;
        frame.classList.toggle("active", active);
        frame.setAttribute("aria-hidden", active ? "false" : "true");
      });
    });
    buttons.forEach(function (button) {
      button.setAttribute("aria-pressed", Number(button.dataset.frame) === current ? "true" : "false");
    });
    fills.forEach(function (fill) {
      fill.hidden = Number(fill.dataset.frame) !== current;
    });
  }

  // The bar's edge sweeps back and forth across the whole bar, switching
  // sets each time it crosses the middle. Only the shown set's half is pink,
  // so within one set its pink shrinks toward the outer edge and grows back.
  // The animation doubles as the timer: pausing it on hover pauses the
  // countdown and resumes with whatever time is left.
  function run(duration, scales, delay) {
    countdowns.forEach(function (countdown) {
      countdown.cancel();
    });
    // Step in chunks rather than gliding, for a lo-fi feel.
    var keyframes = scales.map(function (scale) {
      var hidden = (1 - scale) * 100 + "%";
      return {
        clipPath: current === 0 ? "inset(0 " + hidden + " 0 0)" : "inset(0 0 0 " + hidden + ")",
        easing: "steps(" + BLOCKS + ", end)",
      };
    });
    countdowns = fills
      .filter(function (fill) {
        return Number(fill.dataset.frame) === current;
      })
      .map(function (fill) {
        return fill.animate(keyframes, { duration: duration, delay: delay || 0, easing: "linear", fill: "backwards" });
      });
    countdowns[0].onfinish = function () {
      show(current + 1);
      run(interval, [1, 0, 1]);
    };
    update();
  }

  function update() {
    countdowns.forEach(function (countdown) {
      if (hovered || focused) countdown.pause();
      else countdown.play();
    });
  }

  // Mouse only: a tap fires an emulated enter with no matching leave,
  // which would freeze the rotator on touch screens.
  rotator.addEventListener("pointerenter", function (e) {
    if (e.pointerType !== "mouse") return;
    hovered = true;
    update();
  });
  rotator.addEventListener("pointerleave", function (e) {
    if (e.pointerType !== "mouse") return;
    hovered = false;
    update();
  });
  // Only keyboard focus holds it; a clicked button keeps focus and would
  // otherwise block the resume.
  rotator.addEventListener("focusin", function (e) {
    focused = e.target.matches(":focus-visible");
    update();
  });
  rotator.addEventListener("focusout", function (e) {
    if (rotator.contains(e.relatedTarget)) return;
    focused = false;
    update();
  });

  rotator.classList.add("rotating");
  controls.hidden = false;
  // Start with the edge at the far left, sweeping right.
  show(0);
  // Hold the empty bar for a moment on page load before it starts moving.
  run(interval / 2, [0, 1], 1000);
});
