// Copy-to-clipboard buttons on code blocks.
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.classList.add("copied");
      setTimeout(() => btn.classList.remove("copied"), 1500);
    } catch {
      // Clipboard unavailable (e.g. file:// in some browsers) — fail quietly.
    }
  });
});

// Keep the footer year current.
document.getElementById("year").textContent = new Date().getFullYear();

// Fill the logo shield's thickness: dense stack of edge layers between the
// front and back faces so the rim reads solid when it spins edge-on.
{
  const brandShield = document.querySelector(".brand-shield");
  if (brandShield) {
    const NS = "http://www.w3.org/2000/svg";
    const SHIELD_PATH =
      "M12 1 L22 5 V12 C22 19 17.5 23.7 12 25.8 C6.5 23.7 2 19 2 12 V5 Z " +
      "M12 3.7 L19.8 6.9 V12.3 C19.8 17.8 16.3 21.4 12 23.1 C7.7 21.4 4.2 17.8 4.2 12.3 V6.9 Z";
    for (let z = -2.5; z <= 2.5; z += 0.5) {
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 24 27");
      svg.setAttribute("class", "brand-face brand-edge");
      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", SHIELD_PATH);
      path.setAttribute("fill-rule", "evenodd");
      path.setAttribute("fill", "#BC8F35");
      svg.appendChild(path);
      svg.style.transform = `translateZ(${z}px)`;
      brandShield.appendChild(svg);
    }
  }
}

// Scroll spy: light up the nav tab of the section currently in view.
{
  const navMap = new Map();
  document.querySelectorAll(".nav-links a[href^='#']").forEach((a) => {
    navMap.set(a.getAttribute("href").slice(1), a);
  });

  let spyTick = false;
  const spy = () => {
    spyTick = false;
    let currentId = null;
    navMap.forEach((_, id) => {
      const section = document.getElementById(id);
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.45 && rect.bottom > window.innerHeight * 0.35) {
        currentId = id;
      }
    });
    navMap.forEach((link, id) => link.classList.toggle("active", id === currentId));
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!spyTick) {
        spyTick = true;
        requestAnimationFrame(spy);
      }
    },
    { passive: true }
  );
  spy();
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  // ---------- Scroll reveal ----------
  // Blocks slide in from whichever side they sit on and rise slightly;
  // headings and centered blocks rise from below. Re-animates on every
  // viewport entry (both scroll directions).
  const sideTargets = document.querySelectorAll(
    ".step, .features-mini li, .install-steps li, .source-build"
  );
  const upTargets = document.querySelectorAll(
    ".section h2, .section-lede, .honesty-mini, .final-cta .cta-row, .final-note, .tl-item"
  );

  const mid = window.innerWidth / 2;
  sideTargets.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const fromLeft = rect.left + rect.width / 2 <= mid;
    el.classList.add("reveal", fromLeft ? "reveal-left" : "reveal-right");
  });
  upTargets.forEach((el) => el.classList.add("reveal", "reveal-up"));

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("visible", entry.isIntersecting);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -36px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  // ---------- Version timeline ----------
  // The timeline reveals via the shared .reveal system above (its cards are in
  // upTargets); the drawing line, popping dots and pulsing latest marker are
  // pure CSS keyed off .visible. `vtree` is kept null-safe for the scroll
  // choreography below — with no tree, the hero shield simply fades as the
  // Versions section arrives.
  const vtree = document.querySelector(".vtree"); // null now; guarded below

  // ---------- 3D shield: build solid thickness ----------
  // Stack silhouette layers along the Z axis between the front and back
  // faces so the shield has a visible gold edge when seen side-on.
  const shield = document.querySelector(".shield3d-inner");
  if (shield) {
    const NS = "http://www.w3.org/2000/svg";
    const SHIELD_PATH =
      "M12 1 L22 5 V12 C22 19 17.5 23.7 12 25.8 C6.5 23.7 2 19 2 12 V5 Z " +
      "M12 3.7 L19.8 6.9 V12.3 C19.8 17.8 16.3 21.4 12 23.1 C7.7 21.4 4.2 17.8 4.2 12.3 V6.9 Z";
    for (let z = -12; z <= 12; z += 2) {
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 24 27");
      svg.setAttribute("class", "shield-edge");
      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", SHIELD_PATH);
      path.setAttribute("fill-rule", "evenodd");
      path.setAttribute("fill", z % 4 === 0 ? "#D9AC4E" : "#BC8F35");
      svg.appendChild(path);
      svg.style.transform = `translateZ(${z}px)`;
      shield.insertBefore(svg, shield.firstChild);
    }
  }

  // ---------- Scroll choreography ----------
  // Phase 1 (pinned hero): the halves split to the sides while the shield
  // emerges from depth at the viewport center.
  // Phase 2 (Install → Features): shield rotation follows scroll.
  // Phase 3: as the Versions section arrives, the shield rides up and away —
  // the version tree gets the stage to itself.
  const heroEl = document.querySelector(".hero");
  const heroCopy = document.querySelector(".hero-copy");
  const heroArt = document.querySelector(".portrait-card");
  const stage = document.querySelector(".shield-stage");
  const shieldWrap = document.querySelector(".shield3d");
  const scrolly = document.querySelector(".scrolly");
  const versions = document.querySelector("#versions");

  let ticking = false;
  const update = () => {
    ticking = false;

    const pinned = heroEl ? heroEl.offsetHeight - window.innerHeight : 0;
    const split =
      pinned > 60
        ? Math.min(1, window.scrollY / pinned)
        : Math.min(1, window.scrollY / (window.innerHeight * 0.85));

    if (window.innerWidth > 960) {
      const travel = split * window.innerWidth * 0.55;
      if (heroCopy) {
        heroCopy.style.transform = `translateX(${(-travel).toFixed(1)}px)`;
        heroCopy.style.opacity = (1 - split * 0.7).toFixed(3);
      }
      if (heroArt) {
        heroArt.style.transform = `rotate(1.5deg) translateX(${travel.toFixed(1)}px)`;
        heroArt.style.opacity = (1 - split * 0.7).toFixed(3);
      }
    }

    // Melt hand-off: as Versions approaches, the shield collapses into the
    // tree's root node — spinning and shrinking toward the `git init` dot,
    // tracked per-frame — and the trunk then grows out of that exact point.
    let out = 0;
    if (versions) {
      const vTop = versions.getBoundingClientRect().top;
      out = Math.min(
        1,
        Math.max(0, (window.innerHeight * 1.35 - vTop) / (window.innerHeight * 0.75))
      );
    }
    const sink = out * out; // gentle start, accelerating dive into the root
    if (stage) {
      let toRoot = 0;
      const treeRoot = document.querySelector(".vt-n1");
      if (treeRoot) {
        const r = treeRoot.getBoundingClientRect();
        toRoot = (r.top + r.height / 2 - window.innerHeight * 0.5) * sink;
      }
      // stay solid while travelling; only wink out at the very end, as the
      // real (pulsing) root node takes over
      const fade = out > 0.85 ? 1 - (out - 0.85) / 0.15 : 1;
      stage.style.opacity = (split * fade).toFixed(3);
      stage.style.transform = `translateY(${toRoot.toFixed(1)}px)`;
    }
    if (shieldWrap) {
      const base = 0.15 + 0.85 * split;
      const scale = base + (0.05 - base) * sink;
      shieldWrap.style.transform = `translateY(-50%) scale(${scale.toFixed(3)})`;
    }

    // Parallax tilt: the tree plane eases from a steeper hologram tilt to
    // near-flat as it moves up through the viewport.
    if (vtree && window.innerWidth > 960) {
      const r = vtree.getBoundingClientRect();
      const p = Math.min(
        1,
        Math.max(0, (window.innerHeight - r.top) / (window.innerHeight + r.height))
      );
      vtree.style.transform = `rotateX(${(16 - 12 * p).toFixed(2)}deg)`;
    }

    // Rotation progress runs from the top of the scrolly stretch to the
    // arrival of Versions (3 full turns), backward when scrolling up.
    if (scrolly && versions && shield) {
      const sRect = scrolly.getBoundingClientRect();
      const vRect = versions.getBoundingClientRect();
      const total = vRect.top - sRect.top - window.innerHeight * 0.5;
      const progress = total > 0 ? Math.min(1, Math.max(0, -sRect.top / total)) : 0;
      shield.style.transform = `rotateX(10deg) rotateY(${(progress * 1080).toFixed(1)}deg)`;
    }
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  update();
}
