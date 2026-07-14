(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Theme toggle */
  var root = document.documentElement;
  var toggle = document.getElementById("themeToggle");
  var stored = localStorage.getItem("theme");
  if (stored) root.setAttribute("data-theme", stored);

  toggle.addEventListener("click", function () {
    var current = root.getAttribute("data-theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = current ? current === "dark" : prefersDark;
    var next = isDark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* Marquee: clone the sequence until it's wide enough that the
     -50% loop never runs out of content, even on ultra-wide screens */
  function setupMarquee() {
    var track = document.getElementById("marqueeTrack");
    if (!track) return;
    var original = track.querySelector(".marquee-seq");
    if (!original) return;

    function build() {
      var seqWidth = original.getBoundingClientRect().width;
      if (!seqWidth) {
        track.classList.add("is-ready");
        return;
      }
      var targetHalfWidth = Math.max(window.innerWidth, screen.width || 0) * 2;
      var copies = Math.max(1, Math.ceil(targetHalfWidth / seqWidth));
      for (var i = 1; i < copies; i++) {
        track.appendChild(original.cloneNode(true));
      }
      var halfChildren = Array.prototype.slice.call(track.children);
      halfChildren.forEach(function (node) {
        track.appendChild(node.cloneNode(true));
      });

      var halfWidth = copies * seqWidth;
      var pxPerSecond = 45;
      track.style.animationDuration = (halfWidth / pxPerSecond) + "s";
      track.classList.add("is-ready");
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(build).catch(build);
    } else {
      build();
    }
  }
  setupMarquee();

  /* Dot navigation */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main .section[id]"));
  var dotnav = document.getElementById("dotnav");

  sections.forEach(function (section, i) {
    var link = document.createElement("a");
    link.href = "#" + section.id;
    link.setAttribute("aria-label", section.id);
    if (i === 0) link.classList.add("active");
    dotnav.appendChild(link);
  });

  var dots = Array.prototype.slice.call(dotnav.querySelectorAll("a"));

  var sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        dots.forEach(function (dot) {
          dot.classList.toggle("active", dot.getAttribute("href") === "#" + id);
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  /* Mini brand mark, visible once past the cover */
  var miniBrand = document.getElementById("miniBrand");
  var cover = document.getElementById("cover");
  var coverObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        miniBrand.classList.toggle("is-visible", !entry.isIntersecting);
      });
    },
    { threshold: 0.15 }
  );
  coverObserver.observe(cover);

  /* Reveal on scroll */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  revealEls.forEach(function (el) {
    var delay = el.getAttribute("data-reveal-d");
    if (delay) el.style.setProperty("--rd", delay);
  });

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* Count-up stats */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  var counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute("data-count"), 10);
        counterObserver.unobserve(el);
        if (reducedMotion) {
          el.textContent = "+" + target;
          return;
        }
        var start = performance.now();
        var duration = 1200;
        function tick(now) {
          var progress = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = "+" + Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach(function (el) {
    counterObserver.observe(el);
  });

  if (reducedMotion) return;

  /* Cover parallax + cursor glow */
  var coverInner = document.getElementById("coverInner");
  var coverMark = document.getElementById("coverMark");
  var glowCursor = document.getElementById("glowCursor");
  var rafId = null;
  var pointer = { x: 0.5, y: 0.3 };
  var scrollScale = 1;

  function applyCoverTransform() {
    rafId = null;
    var dx = (pointer.x - 0.5) * 24;
    var dy = (pointer.y - 0.5) * 24;
    coverInner.style.transform =
      "translate(" + dx + "px, " + dy + "px) scale(" + scrollScale + ")";
    glowCursor.style.setProperty("--gx", pointer.x * 100 + "%");
    glowCursor.style.setProperty("--gy", pointer.y * 100 + "%");
  }

  cover.addEventListener("mousemove", function (e) {
    var rect = cover.getBoundingClientRect();
    pointer.x = (e.clientX - rect.left) / rect.width;
    pointer.y = (e.clientY - rect.top) / rect.height;
    glowCursor.classList.add("is-active");
    if (!rafId) rafId = requestAnimationFrame(applyCoverTransform);
  });
  cover.addEventListener("mouseleave", function () {
    glowCursor.classList.remove("is-active");
  });

  /* Scroll fade for the cover content */
  window.addEventListener(
    "scroll",
    function () {
      var progress = Math.min(window.scrollY / window.innerHeight, 1);
      coverMark.style.opacity = String(1 - progress * 1.1);
      scrollScale = 1 - progress * 0.12;
      if (!rafId) rafId = requestAnimationFrame(applyCoverTransform);
    },
    { passive: true }
  );

  /* Tilt cards */
  var hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (hasHover) {
    var tiltCards = Array.prototype.slice.call(document.querySelectorAll(".tilt-card"));
    tiltCards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--tx", (-py * 8).toFixed(2) + "deg");
        card.style.setProperty("--ty", (px * 8).toFixed(2) + "deg");
      });
      card.addEventListener("mouseleave", function () {
        card.style.setProperty("--tx", "0deg");
        card.style.setProperty("--ty", "0deg");
      });
    });

    /* Magnetic CTA button */
    var magnetic = document.querySelector(".magnetic");
    if (magnetic) {
      magnetic.addEventListener("mousemove", function (e) {
        var rect = magnetic.getBoundingClientRect();
        var px = e.clientX - rect.left - rect.width / 2;
        var py = e.clientY - rect.top - rect.height / 2;
        magnetic.style.transform = "translate(" + px * 0.25 + "px, " + py * 0.35 + "px)";
      });
      magnetic.addEventListener("mouseleave", function () {
        magnetic.style.transform = "translate(0, 0)";
      });
    }
  }
})();
