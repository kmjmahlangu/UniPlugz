
var gsapLoaded = typeof window.gsap !== "undefined" &&
  typeof window.ScrollTrigger !== "undefined";

if (gsapLoaded) {
  gsap.registerPlugin(window.ScrollTrigger);
}

function canAnimate() {
  return gsapLoaded && typeof prefersReducedMotion === "function" && !prefersReducedMotion();
}

function heroAnimation() {
  var heroTitle = document.getElementById("HeroTitle");
  var heroLede = document.querySelector(".HeroLede");
  if (!canAnimate() || !heroTitle) return;

  var lines = heroTitle.querySelectorAll(".HeroLine > span");
  var letters = [];

  lines.forEach(function (line) {
    if (line.dataset.animated === "true") return;
    var text = line.textContent;
    line.setAttribute("aria-label", text.trim());
    line.innerHTML = Array.from(text).map(function (letter) {
      return letter === " "
        ? '<span class="LetterSpace" aria-hidden="true">&nbsp;</span>'
        : '<span class="Letter" aria-hidden="true">' + letter.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + '</span>';
    }).join("");
    line.dataset.animated = "true";
    letters.push.apply(letters, line.querySelectorAll(".Letter, .LetterSpace"));
  });

  var timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
  timeline.from(letters, { y: 45, opacity: 0, duration: 0.6, stagger: 0.025 });
  if (heroLede) timeline.from(heroLede, { y: 20, opacity: 0, duration: 0.6 }, "-=0.25");
}

function pageIntro() {
  var heading = document.querySelector(".PageHead h1, .PageHead #PageTitle, #TopicHead h1");
  if (!canAnimate() || !heading) return;
  var eyebrow = document.querySelector(".PageHead .Eyebrow, #TopicEyebrow");
  var copy = document.querySelector(".PageHead p:not(.Eyebrow), #TopicBlurb");
  var timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
  if (eyebrow) timeline.from(eyebrow, { y: 12, opacity: 0, duration: 0.4 });
  timeline.from(heading, { y: 30, opacity: 0, duration: 0.6 }, "-=0.15");
  if (copy) timeline.from(copy, { y: 16, opacity: 0, duration: 0.5 }, "-=0.3");
}

function staggerIn(elements) {
  if (!canAnimate() || !elements || !elements.length) return;
  gsap.from(elements, {
    y: isPhone() ? 14 : 28,
    opacity: 0,
    duration: isPhone() ? 0.4 : 0.5,
    stagger: isPhone() ? 0.04 : 0.07,
    ease: "power2.out",
    clearProps: "transform,opacity"
  });
}

function revealOnScroll(elements, trigger) {
  if (!canAnimate() || !elements || !elements.length) return;
  gsap.from(elements, {
    y: isPhone() ? 14 : 28,
    autoAlpha: 0,
    duration: isPhone() ? 0.4 : 0.55,
    stagger: isPhone() ? 0.04 : 0.07,
    ease: "power2.out",
    clearProps: "transform,opacity,visibility",
    scrollTrigger: {
      trigger: trigger || elements[0],
      start: "top 85%",
      once: true,
      invalidateOnRefresh: true
    }
  });
}

function swapContent(container, swap) {
  if (!container || typeof swap !== "function") return;
  if (!canAnimate()) { swap(); return; }
  gsap.to(container, {
    autoAlpha: 0, y: 10, duration: 0.2, ease: "power1.in",
    onComplete: function () {
      swap();
      gsap.set(container, { autoAlpha: 1, y: 0 });
    }
  });
}

function savePop(button) {
  if (!canAnimate() || !button) return;
  gsap.fromTo(button, { scale: 0.85 }, {
    scale: 1, duration: 0.4, ease: "back.out(3)", clearProps: "transform"
  });
}

function routeAnimation() {
  var path = document.getElementById("JourneyPath");
  var dot = document.getElementById("JourneyDot");
  var nodes = document.querySelectorAll(".JourneyNode");
  var steps = document.querySelectorAll(".JourneyStep");
  var journey = document.querySelector(".Journey, .journey");
  if (!path || !dot || !nodes.length || !journey || !canAnimate()) return;

  var length = path.getTotalLength();
  if (!length) return;
  var stops = Array.prototype.map.call(nodes, function (node) {
    var x = parseFloat(node.getAttribute("data-x"));
    var y = parseFloat(node.getAttribute("data-y"));
    if (!Number.isFinite(x) || !Number.isFinite(y)) return 0;
    var closest = 0, closestDistance = Infinity;
    for (var distance = 0; distance <= length; distance += 2) {
      var point = path.getPointAtLength(distance);
      var delta = Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2);
      if (delta < closestDistance) { closestDistance = delta; closest = distance; }
    }
    return closest;
  });

  function lightUp(count) {
    nodes.forEach(function (node, index) { node.classList.toggle("IsActive", index < count); });
    steps.forEach(function (step, index) { step.classList.toggle("IsActive", index < count); });
  }

  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  lightUp(0);
  var timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: journey,
      start: "top 75%",
      end: "bottom 35%",
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: function (self) {
        var distance = self.progress * length;
        lightUp(stops.filter(function (stop) { return distance >= stop - 4; }).length);
      }
    }
  });
  timeline.to(path, { strokeDashoffset: 0 }, 0);
  if (window.MotionPathPlugin) {
    gsap.registerPlugin(window.MotionPathPlugin);
    timeline.to(dot, {
      motionPath: { path: path, align: path, alignOrigin: [0.5, 0.5] }
    }, 0);
  }
}

function initTopicToggles() {
  document.querySelectorAll(".TopicToggle").forEach(function (button) {
    button.addEventListener("click", function () {
      var details = button.nextElementSibling;
      if (!details || !details.classList.contains("TopicDetails")) return;
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      details.hidden = expanded;
    });
  });
}
