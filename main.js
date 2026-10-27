/* ==========================================================================
   Lagrange Systems — interactions
   Vanilla JS, no dependencies.
   ========================================================================== */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Nav: mobile menu, active link ---------- */
  const nav = $("#nav");
  const toggle = $("#navToggle");
  const menu = $("#mobileMenu");

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  const navLinks = $$(".nav__links a");
  const linkObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  navLinks.forEach((a) => {
    const target = $(a.getAttribute("href"));
    if (target) linkObserver.observe(target);
  });

  /* ---------- Split text into word spans ---------- */
  const splitWords = (el, make) => {
    const walk = (node, inEm) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(" "); return; }
            frag.append(make(part, inEm));
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child, inEm || child.tagName === "EM");
        }
      });
    };
    walk(el, false);
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
  };

  // Hero headline: staggered rise
  $$("[data-split]").forEach((el) => {
    let i = 0;
    splitWords(el, (text) => {
      const w = document.createElement("span");
      w.className = "word";
      const inner = document.createElement("span");
      inner.style.setProperty("--i", i++);
      inner.textContent = text;
      w.append(inner);
      return w;
    });
  });

  // Manifesto: words light up with scroll
  const litWords = [];
  $$("[data-light]").forEach((el) => {
    splitWords(el, (text, accent) => {
      const s = document.createElement("span");
      s.className = accent ? "lw lw--acc" : "lw";
      s.textContent = text;
      litWords.push(s);
      return s;
    });
  });
  if (reduceMotion) litWords.forEach((w) => w.classList.add("on"));

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  $$(".reveal").forEach((el) => revealObserver.observe(el));
  // Cards with inner animations (bars, sparkline, blocks) key off .in on the card itself
  $$(".card, .work__card").forEach((el) => revealObserver.observe(el));

  /* ---------- Marquee: duplicate track for a seamless loop ---------- */
  const track = $(".marquee__track");
  if (track) track.innerHTML += track.innerHTML;

  /* ---------- Card spotlight follows the cursor ---------- */
  if (finePointer) {
    $$(".spot").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.18;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.28;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
    });
  }

  /* ---------- Work carousel ---------- */
  const workTrack = $("#workTrack");
  if (workTrack) {
    const [prev, next] = $$(".carousel__btn");
    const step = () => {
      const card = $(".work__card", workTrack);
      return card ? card.getBoundingClientRect().width + 20 : 400;
    };
    const updateButtons = () => {
      const max = workTrack.scrollWidth - workTrack.clientWidth - 2;
      prev.disabled = workTrack.scrollLeft <= 2;
      next.disabled = workTrack.scrollLeft >= max;
    };
    prev.addEventListener("click", () => workTrack.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" }));
    next.addEventListener("click", () => workTrack.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" }));
    workTrack.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    updateButtons();
  }

  /* ---------- Agent console typing loop ---------- */
  const out = $("#consoleOut");
  if (out) {
    const script = [
      ["c-dim", "$ "], ["", "ops-pulse --region east\n"],
      ["c-acc", "→ sales     "], ["", "$48.2k"], ["c-ok", "  ▲ 6% vs plan\n"],
      ["c-acc", "→ labor     "], ["", "29.8%"], ["c-ok", "   ✓ on target\n"],
      ["c-acc", "→ inventory "], ["", "3 low"], ["c-warn", "   ! reorder sent\n"],
      ["c-acc", "→ service   "], ["", "3m 42s"], ["c-ok", "  ✓ on track\n"],
      ["c-acc", "→ alerts    "], ["", "Bay Rd"], ["c-warn", "  → GM notified\n"],
      ["c-dim", "\n  42 locations · synced 30s ago\n"],
    ];

    const render = (chunks, partial) => {
      out.innerHTML = "";
      chunks.forEach(([cls, text]) => {
        const s = document.createElement("span");
        if (cls) s.className = cls;
        s.textContent = text;
        out.append(s);
      });
      if (partial !== false) {
        const caret = document.createElement("span");
        caret.className = "caret";
        out.append(caret);
      }
    };

    if (reduceMotion) {
      render(script, false);
    } else {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const play = async () => {
        while (true) {
          const done = [];
          for (const [cls, text] of script) {
            const isCommand = cls === "";
            for (let i = 1; i <= text.length; i++) {
              render([...done, [cls, text.slice(0, i)]]);
              await sleep(isCommand ? 26 : 8);
            }
            done.push([cls, text]);
            if (text.endsWith("\n")) await sleep(260);
          }
          await sleep(3600);
        }
      };
      new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) { play(); obs.disconnect(); }
      }, { threshold: 0.3 }).observe(out);
    }
  }

  /* ---------- Approach: highlight L-points as steps scroll ---------- */
  const steps = $$(".step");
  const points = $$(".lpt");
  const setStep = (n) => {
    [...steps, ...points].forEach((el) => {
      const k = +el.dataset.step;
      el.classList.toggle("is-active", k === n);
      el.classList.toggle("is-done", k < n);
    });
  };
  const stepObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && setStep(+e.target.dataset.step)),
    { rootMargin: "-48% 0px -48% 0px" }
  );
  steps.forEach((s) => stepObserver.observe(s));
  setStep(1);

  /* ---------- Contact form ----------
     Front-end only. To receive submissions, set FORM_ENDPOINT to a form
     service URL (e.g. Formspree, Basin, Getform) — works on GitHub Pages. */
  const FORM_ENDPOINT = "";
  const form = $("#contactForm");
  const note = $("#formNote");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      note.className = "form__note";
      let valid = true;
      $$("[required]", form).forEach((input) => {
        const ok = input.type === "email" ? /^\S+@\S+\.\S+$/.test(input.value.trim()) : input.value.trim().length > 0;
        input.closest(".field").classList.toggle("is-invalid", !ok);
        if (!ok) valid = false;
      });
      if (!valid) {
        note.textContent = "Please fill in the highlighted fields.";
        note.classList.add("is-error");
        return;
      }

      const btn = $("button[type=submit]", form);
      btn.disabled = true;
      try {
        if (FORM_ENDPOINT) {
          const res = await fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
          if (!res.ok) throw new Error(res.statusText);
        }
        form.reset();
        note.textContent = "Thanks — your message is in orbit. We'll be in touch shortly.";
        note.classList.add("is-success");
      } catch {
        note.textContent = "Something went wrong. Please email us directly.";
        note.classList.add("is-error");
      } finally {
        btn.disabled = false;
      }
    });
    form.addEventListener("input", (e) => e.target.closest(".field")?.classList.remove("is-invalid"));
  }

  /* ==========================================================================
     Orbit renderer — a two-body system in its rotating frame, with the five
     Lagrange points and a field of test particles on Keplerian orbits.
     World space has the primary body at the origin; each frame takes a
     camera { cx, cy, scale, fx, fy } that maps world → screen.
     ========================================================================== */
  const OMEGA = 0.07;              // rad/s
  const MU = 0.09;                 // visual mass ratio
  const HILL = Math.cbrt(MU / 3);  // L1/L2 offset factor

  const createOrbit = (canvas, opts) => {
    const ctx = canvas.getContext("2d");
    const ink = opts.ink || "11,13,18";
    const acc = opts.acc || "234,88,12";
    const s = { w: 0, h: 0, R: 1, theta: -0.35, particles: [] };

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      s.w = rect.width; s.h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(s.w * dpr);
      canvas.height = Math.round(s.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.R = opts.radius(s.w, s.h);

      const R = s.R;
      const count = Math.round(Math.min(opts.max || 520, (s.w * s.h) / (opts.density || 2600)));
      s.particles = Array.from({ length: count }, () => {
        if (Math.random() < (opts.trojans || 0.18)) {
          // librate around L4 or L5
          return {
            trojan: true,
            side: Math.random() < 0.5 ? 1 : -1,
            r: R * (1 + (Math.random() - 0.5) * 0.12),
            off: (Math.random() - 0.5) * 0.55,
            amp: 0.08 + Math.random() * 0.25,
            ph: Math.random() * Math.PI * 2,
            size: 0.7 + Math.random() * 1.1,
            a: 0.25 + Math.random() * 0.45,
          };
        }
        const r = R * (0.32 + Math.pow(Math.random(), 0.8) * 2.4);
        return {
          trojan: false,
          r,
          phi: Math.random() * Math.PI * 2,
          w: OMEGA * Math.pow(r / R, -1.5),
          size: 0.6 + Math.random() * 1.1,
          a: 0.12 + Math.random() * 0.38,
        };
      });
    };

    const geometry = () => {
      const t = s.theta, R = s.R, c = Math.cos(t), si = Math.sin(t);
      const polar = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
      return {
        planet: [R * c, R * si],
        points: [
          ["L1", R * (1 - HILL) * c, R * (1 - HILL) * si],
          ["L2", R * (1 + HILL) * c, R * (1 + HILL) * si],
          ["L3", ...polar(R * (1 + (5 * MU) / 12), t + Math.PI)],
          ["L4", ...polar(R, t - Math.PI / 3)],
          ["L5", ...polar(R, t + Math.PI / 3)],
        ],
      };
    };

    const draw = (now, dt, cam) => {
      const { w, h, R } = s;
      const k = cam.scale ?? 1, fx = cam.fx ?? 0, fy = cam.fy ?? 0;
      const X = (x) => cam.cx + (x - fx) * k;
      const Y = (y) => cam.cy + (y - fy) * k;
      const reveal = cam.reveal ?? 1;
      const glow = cam.glow ?? 0;
      s.theta += OMEGA * dt;

      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = cam.alpha ?? 1;

      // orbit rings
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 6]);
      for (const [m, a] of [[1, 0.16], [1.75, 0.07], [0.5, 0.07]]) {
        ctx.strokeStyle = `rgba(${ink},${a})`;
        ctx.beginPath(); ctx.arc(X(0), Y(0), R * m * k, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.setLineDash([]);

      // particles
      const ps = Math.sqrt(k);
      for (const p of s.particles) {
        let x, y;
        if (p.trojan) {
          const lib = Math.sin((now / 1000) * 0.6 + p.ph) * p.amp;
          const ang = s.theta + p.side * (Math.PI / 3 + p.off * 0.5 + lib);
          x = p.r * Math.cos(ang); y = p.r * Math.sin(ang);
        } else {
          p.phi += p.w * dt;
          x = p.r * Math.cos(p.phi); y = p.r * Math.sin(p.phi);
        }
        let sx = X(x), sy = Y(y);
        if (cam.warp) [sx, sy] = cam.warp(sx, sy);
        if (sx < -4 || sy < -4 || sx > w + 4 || sy > h + 4) continue;
        ctx.fillStyle = p.trojan ? `rgba(${acc},${Math.min(1, p.a * (1 + glow))})` : `rgba(${ink},${p.a})`;
        ctx.fillRect(sx, sy, p.size * ps, p.size * ps);
      }

      const g = geometry();
      const [px, py] = g.planet;

      // equilateral triangles to L4/L5, and the L3–L2 axis
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${acc},${0.18 * reveal})`;
      for (const i of [3, 4]) {
        ctx.beginPath();
        ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(g.points[i][1]), Y(g.points[i][2])); ctx.lineTo(X(px), Y(py));
        ctx.stroke();
      }
      ctx.strokeStyle = `rgba(${ink},${0.1 * reveal})`;
      ctx.beginPath(); ctx.moveTo(X(g.points[2][1]), Y(g.points[2][2])); ctx.lineTo(X(g.points[1][1]), Y(g.points[1][2])); ctx.stroke();

      // primary body
      const hr = 70 * k;
      const halo = ctx.createRadialGradient(X(0), Y(0), 0, X(0), Y(0), hr);
      halo.addColorStop(0, `rgba(${ink},${opts.haloAlpha || 0.1})`);
      halo.addColorStop(1, `rgba(${ink},0)`);
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(X(0), Y(0), hr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgb(${ink})`;
      ctx.beginPath(); ctx.arc(X(0), Y(0), Math.max(12, R * 0.09) * k, 0, Math.PI * 2); ctx.fill();

      // secondary body
      const sr = 28 * k;
      const sh = ctx.createRadialGradient(X(px), Y(py), 0, X(px), Y(py), sr);
      sh.addColorStop(0, `rgba(${acc},.3)`);
      sh.addColorStop(1, `rgba(${acc},0)`);
      ctx.fillStyle = sh;
      ctx.beginPath(); ctx.arc(X(px), Y(py), sr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgb(${acc})`;
      ctx.beginPath(); ctx.arc(X(px), Y(py), Math.max(5, R * 0.035) * k, 0, Math.PI * 2); ctx.fill();

      // Lagrange markers (revealed one by one when reveal < 1)
      const pulse = (Math.sin(now / 700) + 1) / 2;
      ctx.font = `500 ${opts.labelSize || 11}px "Geist Mono", ui-monospace, monospace`;
      ctx.textAlign = "center";
      g.points.forEach(([label, wx, wy], i) => {
        const a = clamp(reveal * 5 - i);
        if (a <= 0) return;
        const x = X(wx), y = Y(wy);
        const hot = cam.highlight === i;
        const ph = (Math.sin(now / 900 + i * 1.3) + 1) / 2;
        ctx.strokeStyle = `rgba(${acc},${(0.12 + ph * 0.25 + (hot ? 0.4 : 0)) * a})`;
        ctx.beginPath(); ctx.arc(x, y, (hot ? 16 : 9) + ph * 5, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = hot ? `rgba(${acc},${a})` : `rgba(${ink},${0.55 * a})`;
        ctx.beginPath();
        ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y);
        ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4);
        ctx.stroke();
        ctx.fillStyle = hot ? `rgba(${acc},${a})` : `rgba(${ink},${(0.45 + pulse * 0.1) * a})`;
        ctx.fillText(label, x, y - (hot ? 26 : 18));
      });

      ctx.globalAlpha = 1;
    };

    return { layout, draw, geometry, state: s };
  };

  /* ---------- Hero orbit ---------- */
  const heroCanvas = $("#orbit");
  const heroOrbit = heroCanvas && createOrbit(heroCanvas, {
    radius: (w, h) => (w > 860 ? Math.min(w * (w > 1180 ? 0.2 : 0.16), h * 0.3) : Math.min(w * 0.27, 100)),
  });
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
  const warp = (x, y) => {
    const dx = x - mouse.x, dy = y - mouse.y;
    const d2 = dx * dx + dy * dy;
    const rad = 130;
    if (d2 > rad * rad) return [x, y];
    const d = Math.sqrt(d2) || 1;
    const f = (1 - d / rad) ** 2 * 26;
    return [x + (dx / d) * f, y + (dy / d) * f];
  };
  const heroCam = () => {
    const { w, h } = heroOrbit.state;
    const desktop = w > 860;
    return {
      cx: desktop ? w * (w > 1180 ? 0.7 : 0.76) : w * 0.5,
      cy: desktop ? h * 0.5 : 190, // mobile: sits in the space above the copy
      warp,
    };
  };
  if (heroCanvas) {
    const hero = heroCanvas.parentElement;
    hero.addEventListener("pointermove", (e) => {
      const r = heroCanvas.getBoundingClientRect();
      mouse.tx = e.clientX - r.left;
      mouse.ty = e.clientY - r.top;
    });
    hero.addEventListener("pointerleave", () => { mouse.tx = mouse.ty = -9999; });
  }

  /* ---------- Closer look: pinned, scroll-scrubbed scene ---------- */
  const cinema = $("#cinema");
  const stage = $("#cinemaStage");
  const cinemaCanvas = $("#cinemaCanvas");
  const cinemaEyebrow = $(".cinema__eyebrow");
  const captions = $$(".cap").map((el) => ({ el, from: +el.dataset.from, to: +el.dataset.to }));
  const cineOrbit = cinemaCanvas && createOrbit(cinemaCanvas, {
    ink: "245,245,247",
    acc: "251,146,60",
    radius: (w, h) => Math.min(w, h) * 0.28,
    max: 760,
    density: 1700,
    trojans: 0.3,
    labelSize: 13,
    haloAlpha: 0.18,
  });

  // progress through a tall section whose child is sticky: 0 when pinned, 1 when released
  const pinProgress = (el) => {
    const r = el.getBoundingClientRect();
    return clamp(-r.top / (r.height - window.innerHeight));
  };

  const cinemaCam = (p) => {
    const { w, h } = cineOrbit.state;
    const s1 = lerp(0.6, 1, ease(clamp((p - 0.06) / 0.26)));
    const z = ease(clamp((p - 0.58) / 0.24));
    const L4 = cineOrbit.geometry().points[3];
    return {
      cx: w / 2,
      cy: w > 860 ? h * 0.44 : h * 0.62, // phones: below the top-anchored captions
      scale: s1 * lerp(1, 3.2, z),
      fx: L4[1] * z,
      fy: L4[2] * z,
      reveal: clamp((p - 0.3) / 0.24),
      glow: z * 1.5,
      highlight: z > 0.05 ? 3 : -1,
    };
  };

  const updateCinemaChrome = (p) => {
    const e = ease(clamp(p / 0.12));
    const inset = 1 - e;
    stage.style.clipPath = `inset(${inset * 10}% ${inset * 6}% round ${inset * 36}px)`;
    cinemaEyebrow.style.opacity = 1 - clamp((p - 0.5) / 0.08);
    captions.forEach(({ el, from, to }) => {
      const a = clamp((p - from) / 0.04) * clamp((to - p) / 0.04);
      el.style.opacity = a;
      el.style.transform = `translateY(${(1 - clamp((p - from) / 0.06)) * 28}px)`;
    });
    // dark nav while the scene is full-bleed under it
    const r = cinema.getBoundingClientRect();
    nav.classList.toggle("is-dark", e > 0.85 && r.bottom > 68 && r.top <= 0);
  };

  /* ---------- Scroll-linked effects ---------- */
  const manifesto = $("#manifesto");
  const heroCopy = $(".hero__copy");

  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    nav.classList.toggle("is-scrolled", y > 8);

    // hero copy drifts up and fades as you leave
    if (heroCopy && !reduceMotion && y < vh * 1.2) {
      heroCopy.style.transform = `translateY(${y * 0.18}px)`;
      heroCopy.style.opacity = 1 - clamp(y / (vh * 0.75));
    }

    // manifesto words: start lighting when the section reaches mid-screen
    if (manifesto && !reduceMotion) {
      const r = manifesto.getBoundingClientRect();
      const p = clamp((vh * 0.5 - r.top) / (r.height - vh * 0.5));
      const lit = Math.floor(p * litWords.length * 1.12);
      litWords.forEach((w, i) => w.classList.toggle("on", i < lit));
    }

    if (cinema) updateCinemaChrome(pinProgress(cinema));
  };

  /* ---------- Frame loop (canvases draw only while on screen) ---------- */
  let heroVisible = true, cinemaVisible = false, last = performance.now(), born = last;
  let scrollQueued = false;
  window.addEventListener("scroll", () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { scrollQueued = false; onScroll(); });
  }, { passive: true });

  const frame = (now) => {
    const dt = reduceMotion ? 0 : Math.min(0.05, (now - last) / 1000);
    last = now;
    if (heroOrbit && heroVisible) {
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      heroOrbit.draw(now, dt, { ...heroCam(), alpha: reduceMotion ? 1 : Math.min(1, (now - born) / 1400) });
    }
    if (cineOrbit && cinemaVisible) cineOrbit.draw(now, dt, cinemaCam(pinProgress(cinema)));
    requestAnimationFrame(frame);
  };

  const visibility = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.target === heroCanvas) heroVisible = e.isIntersecting;
      if (e.target === cinema) cinemaVisible = e.isIntersecting;
    });
  });
  if (heroCanvas) visibility.observe(heroCanvas);
  if (cinema) visibility.observe(cinema);

  const layoutAll = () => {
    heroOrbit?.layout();
    cineOrbit?.layout();
    onScroll();
  };
  let resizeRaf;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(layoutAll);
  });

  layoutAll();
  requestAnimationFrame(frame);
})();
