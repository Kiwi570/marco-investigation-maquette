/* Marco Investigation · maquette « La Une » : animations et fonctionnalités */
(function () {
  const MI = (window.MI = window.MI || {});
  const D = window.MI_DATA || {};
  const html = document.documentElement;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const store = {
    get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } }
  };
  const session = {
    get(k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } }
  };
  html.classList.add("js");
  const page = document.body.getAttribute("data-page");
  const isFramed = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();

  /* ---------- Préférences : mode calme et langue ---------- */
  const calmPref = store.get("mi-calm");
  MI.calm = calmPref ? calmPref === "1" : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (MI.calm) html.classList.add("calm");
  const hasGsap = !!window.gsap;
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    if (window.Flip) gsap.registerPlugin(Flip);
  }

  function syncCalmButtons() { $$("[data-calm]").forEach(b => b.setAttribute("aria-pressed", MI.calm ? "true" : "false")); }
  syncCalmButtons();
  $$("[data-calm]").forEach(btn => btn.addEventListener("click", () => {
    MI.calm = !MI.calm;
    store.set("mi-calm", MI.calm ? "1" : "0");
    if (MI.calm) { calmDown(); } else { window.location.reload(); }
  }));
  function calmDown() {
    html.classList.add("calm");
    syncCalmButtons();
    if (MI.lenis) { MI.lenis.destroy(); MI.lenis = null; html.classList.remove("lenis", "lenis-smooth"); }
    if (hasGsap) {
      ScrollTrigger.getAll().forEach(st => { if (st.animation) st.animation.progress(1); st.kill(true); });
      gsap.globalTimeline.getChildren(true, true, true).forEach(t => t.progress(1));
      $$(".fresh").forEach(el => { el.classList.remove("fresh"); el.style.opacity = ""; el.style.transform = ""; });
    }
    $$(".media.has-gl").forEach(f => f.classList.remove("has-gl"));
    $$(".media .gl").forEach(c => c.remove());
    if (MI.waves) MI.waves.calm();
  }

  MI.lang = store.get("mi-lang") || "fr";
  if (MI.i18n) MI.i18n.init();
  $$("[data-lang]").forEach(b => b.addEventListener("click", () => setLang(b.getAttribute("data-lang"))));
  function setLang(l) {
    MI.lang = l; store.set("mi-lang", l);
    if (MI.i18n) MI.i18n.apply(l);
    $$("[data-lang]").forEach(b => b.setAttribute("aria-pressed", b.getAttribute("data-lang") === l ? "true" : "false"));
    fillDate();
    document.dispatchEvent(new CustomEvent("mi:lang"));
    if (hasGsap) ScrollTrigger.refresh();
  }
  MI.t = function (key, fallback) { return (MI.i18n && MI.i18n.t(key, fallback)) || fallback || key; };

  /* ---------- Date du numéro ---------- */
  function fillDate() {
    const d = new Date();
    const s = d.toLocaleDateString(MI.lang === "en" ? "en-GB" : "fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    $$("[data-date]").forEach(el => { el.textContent = s; });
  }

  /* ---------- Défilement fluide ---------- */
  if (hasGsap && !MI.calm && window.Lenis) {
    MI.lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    MI.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => { if (MI.lenis) MI.lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToTarget(target) {
    const header = $(".site-header");
    const off = header ? header.offsetHeight + 8 : 0;
    if (MI.lenis) MI.lenis.scrollTo(target, { offset: -off, duration: 1.2 });
    else { const y = target.getBoundingClientRect().top + window.scrollY - off; window.scrollTo({ top: y, behavior: MI.calm ? "auto" : "smooth" }); }
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href^='#']");
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    closeDrawer();
    const subject = a.getAttribute("data-subject");
    if (subject) { const r = $("input[name='subject'][value='" + subject + "']"); if (r) r.checked = true; }
    scrollToTarget(target);
    history.replaceState(null, "", "#" + id);
  });

  /* ---------- Sommaire (menu) ---------- */
  const drawer = $("#drawer");
  const menuBtn = $("[data-menu]");
  function openDrawer() {
    if (!drawer) return;
    drawer.hidden = false; menuBtn.setAttribute("aria-expanded", "true");
    if (MI.lenis) MI.lenis.stop();
    const first = $("a, button", drawer); if (first) first.focus();
    if (hasGsap && !MI.calm) gsap.from($$("li", drawer), { y: 24, opacity: 0, stagger: 0.04, duration: 0.5, ease: "power3.out" });
  }
  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.hidden = true; menuBtn.setAttribute("aria-expanded", "false");
    if (MI.lenis) MI.lenis.start();
    menuBtn.focus({ preventScroll: true });
  }
  if (menuBtn) menuBtn.addEventListener("click", openDrawer);
  $$("[data-menu-close]").forEach(b => b.addEventListener("click", closeDrawer));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });

  /* ---------- Liens vers les documents (locaux sur le site, d'origine dans l'aperçu) ---------- */
  $$("[data-doc]").forEach(a => {
    const d = D.docs && D.docs[a.getAttribute("data-doc")];
    if (d) a.href = D.useLocalDocs && !isFramed ? d.local : d.remote;
  });

  /* ---------- Copier ---------- */
  $$("[data-copy]").forEach(btn => btn.addEventListener("click", () => {
    const text = btn.getAttribute("data-copy");
    const done = () => { const old = btn.textContent; btn.textContent = MI.t("copied", "Copié"); setTimeout(() => { btn.textContent = old; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(() => selectNear(btn));
    else selectNear(btn);
  }));
  function selectNear(btn) {
    const val = btn.parentElement.querySelector(".val");
    if (!val) return;
    const r = document.createRange(); r.selectNodeContents(val);
    const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }

  /* ---------- Curseur et boutons magnétiques ---------- */
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const cursor = $(".cursor");
  if (cursor && fine && hasGsap && !MI.calm) {
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.25, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.25, ease: "power3" });
    window.addEventListener("pointermove", e => { xTo(e.clientX); yTo(e.clientY); cursor.classList.add("is-on"); }, { passive: true });
    const label = $("span", cursor);
    document.addEventListener("pointerover", e => {
      const t = e.target.closest("[data-cursor]");
      if (t) { label.textContent = MI.t("cursor." + t.getAttribute("data-cursor"), t.getAttribute("data-cursor")); cursor.classList.add("is-label"); }
    });
    document.addEventListener("pointerout", e => {
      const t = e.target.closest("[data-cursor]");
      if (t && !t.contains(e.relatedTarget)) cursor.classList.remove("is-label");
    });
    document.addEventListener("pointerleave", () => cursor.classList.add("is-hidden"));
    document.addEventListener("pointerenter", () => cursor.classList.remove("is-hidden"));
  } else if (cursor) { cursor.remove(); }

  function magnetic(el) {
    if (!fine || !hasGsap || MI.calm) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.28);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
  }
  $$("[data-magnetic], .play, .extract__btn").forEach(magnetic);

  /* ---------- Images ---------- */
  if (MI.initGrokImages) MI.initGrokImages();
  const glFigures = [];
  $$(".media[data-gl]").forEach(fig => {
    const manual = fig.hasAttribute("data-gl-manual");
    glFigures.push({ fig, api: MI.initHalftone ? MI.initHalftone(fig, { auto: !manual, fallback: !manual }) : null });
  });
  if (hasGsap && !MI.calm) {
    $$(".media[data-dots]").forEach(fig => {
      ScrollTrigger.create({ trigger: fig, start: "top 92%", once: true, onEnter: () => MI.dotsReveal(fig) });
    });
  }

  /* ---------- Encre fraîche : le texte sèche en entrant ---------- */
  function freshInk(root) {
    if (!hasGsap || MI.calm) return;
    const els = $$("[data-fresh]", root).filter(el => !el.classList.contains("fresh-done"));
    els.forEach(el => el.classList.add("fresh"));
    ScrollTrigger.batch(els, {
      start: "top 90%", once: true,
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", onComplete() { batch.forEach(el => { el.classList.remove("fresh"); el.classList.add("fresh-done"); el.style.opacity = ""; el.style.transform = ""; }); } })
    });
  }
  MI.freshInk = freshInk;

  /* ---------- Surligneur ---------- */
  function highlighter(root) {
    if (!hasGsap || MI.calm) return;
    $$(".hl", root).forEach(el => {
      if (el.__hl) return; el.__hl = true;
      el.style.setProperty("--hl", "0%");
      ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: () => gsap.to(el, { "--hl": "100%", duration: 0.9, ease: "power2.inOut" }) });
    });
  }
  document.addEventListener("mi:lang", () => highlighter(document));

  /* ---------- Tampons ---------- */
  function stampIn(el, delay) {
    if (!hasGsap || MI.calm) return;
    gsap.fromTo(el, { scale: 2.4, opacity: 0, rotate: -18 }, { scale: 1, opacity: 0.92, rotate: -6, duration: 0.42, delay: delay || 0, ease: "back.out(2.2)" });
  }
  MI.stampIn = stampIn;

  /* ---------- Compteurs ---------- */
  function counters(root) {
    $$("[data-count]", root).forEach(el => {
      const end = parseFloat(el.getAttribute("data-count"));
      const dec = (el.getAttribute("data-count").split(".")[1] || "").length;
      const suffix = el.getAttribute("data-suffix") || "";
      const fmt = v => v.toLocaleString(MI.lang === "en" ? "en-GB" : "fr-FR", { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace(/\u202f/g, "\u00a0") + suffix;
      el.textContent = fmt(end);
      if (!hasGsap || MI.calm) return;
      const o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: "power2.out", onUpdate: () => { el.textContent = fmt(o.v); } }) });
    });
  }

  /* ---------- Lecteur vidéo ---------- */
  const player = $("[data-player]");
  function openVideo(id, title) {
    if (!player) return;
    const v = (D.videos || []).find(x => x.id === id) || { id, t: title || "" };
    $("[data-player-title]", player).textContent = v.t;
    const yt = "https://www.youtube.com/watch?v=" + id;
    $("[data-player-yt]", player).href = yt;
    const frame = $("[data-player-frame]", player);
    frame.innerHTML = "";
    if (isFramed || v.noEmbed) {
      const img = new Image(); img.alt = ""; img.src = v.img ? "assets/img/youtube/" + v.img + "-960.webp" : "";
      const msg = document.createElement("div"); msg.className = "player__poster-msg";
      msg.innerHTML = "<p>" + (v.noEmbed ? MI.t("player.noembed", "La chaîne ne permet pas de lire cette vidéo hors de YouTube.") : MI.t("player.preview", "Dans cet aperçu, la vidéo s’ouvre sur YouTube. Sur le site en ligne, elle se lit ici.")) + "</p>";
      const a = document.createElement("a"); a.className = "btn btn--paper btn--sm"; a.href = yt; a.target = "_blank"; a.rel = "noopener"; a.textContent = MI.t("player.yt", "Ouvrir sur YouTube");
      msg.appendChild(a); frame.appendChild(img); frame.appendChild(msg);
    } else {
      const f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0&modestbranding=1";
      f.title = v.t; f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true;
      frame.appendChild(f);
    }
    if (MI.audio) MI.audio.stop();
    if (MI.lenis) MI.lenis.stop();
    if (typeof player.showModal === "function") player.showModal(); else player.setAttribute("open", "");
  }
  function closeVideo() {
    if (!player) return;
    $("[data-player-frame]", player).innerHTML = "";
    if (player.open && typeof player.close === "function") player.close(); else player.removeAttribute("open");
    if (MI.lenis) MI.lenis.start();
  }
  MI.openVideo = openVideo;
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-video]");
    if (b) { e.preventDefault(); openVideo(b.getAttribute("data-video")); }
  });
  if (player) {
    $("[data-player-close]", player).addEventListener("click", closeVideo);
    player.addEventListener("close", () => { $("[data-player-frame]", player).innerHTML = ""; if (MI.lenis) MI.lenis.start(); });
    player.addEventListener("click", e => { if (e.target === player) closeVideo(); });
  }

  /* ---------- Ondes à l'encre ---------- */
  MI.waves = (function () {
    const list = [];
    let raf = 0, last = 0;
    function add(canvas, opts) {
      const ctx = canvas.getContext("2d");
      const w = { canvas, ctx, opts: opts || {}, amp: 0.18, target: 0.18, seed: Math.random() * 100, visible: true };
      const size = () => { const r = canvas.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.max(1, r.width * dpr); canvas.height = Math.max(1, r.height * dpr); draw(w, last); };
      if (window.ResizeObserver) new ResizeObserver(size).observe(canvas); else window.addEventListener("resize", size);
      if (window.IntersectionObserver) new IntersectionObserver(en => { w.visible = en[0].isIntersecting; if (w.visible) start(); }).observe(canvas);
      list.push(w); size(); start();
      return w;
    }
    function draw(w, t) {
      const { ctx, canvas } = w; const W = canvas.width, H = canvas.height; if (!W) return;
      ctx.clearRect(0, 0, W, H);
      const color = w.opts.color || getComputedStyle(canvas).color || "#17140F";
      ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.4, H / 60); ctx.lineJoin = "round"; ctx.lineCap = "round";
      ctx.beginPath();
      const n = Math.max(60, Math.floor(W / 4));
      for (let i = 0; i <= n; i++) {
        const x = (i / n) * W, u = i / n;
        const env = Math.sin(Math.PI * u) ** 0.8;
        const s = Math.sin(u * 38 + t * 0.006 + w.seed) * 0.5 + Math.sin(u * 91 - t * 0.011 + w.seed * 2) * 0.32 + Math.sin(u * 177 + t * 0.019) * 0.18;
        const y = H / 2 + s * env * w.amp * H * 0.9;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 0.25; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke(); ctx.globalAlpha = 1;
    }
    function frame(t) {
      last = t; let any = false;
      list.forEach(w => { w.amp += (w.target - w.amp) * 0.08; if (w.visible) { draw(w, t); any = true; } });
      raf = any && !MI.calm ? requestAnimationFrame(frame) : 0;
    }
    function start() { if (!raf && !MI.calm) raf = requestAnimationFrame(frame); }
    return {
      add,
      level(key, v) { list.forEach(w => { if (w.opts.key === key || key === "*") w.target = v; }); start(); },
      calm() { list.forEach(w => { w.amp = w.target = 0.18; draw(w, 0); }); }
    };
  })();
  $$("canvas[data-wave]").forEach(c => MI.waves.add(c, { key: c.getAttribute("data-wave") }));

  /* ---------- Extraits audio (son seulement au clic) ---------- */
  MI.audio = (function () {
    const el = new Audio(); el.preload = "none";
    let cur = null, btn = null, stopTimer = 0;
    const LEN = 30;
    function setState(b, text, err) {
      const wrap = b && (b.closest("[data-extract-wrap]") || b.parentElement);
      const st = wrap && $("[data-extract-state]", wrap);
      if (st) { st.textContent = text; st.style.color = err ? "var(--red)" : ""; }
    }
    function ring(b, p) { const c = b && $(".ring circle", b); if (c) c.style.strokeDashoffset = String(201 - 201 * Math.max(0, Math.min(1, p))); }
    function icon(b, playing) { const s = b && $(".i-play", b); if (s) s.innerHTML = playing ? '<path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/>' : '<path d="M7 4l13 8-13 8z" fill="currentColor"/>'; }
    function stop(silent) {
      el.pause(); clearTimeout(stopTimer);
      if (btn) { ring(btn, 0); icon(btn, false); btn.setAttribute("aria-pressed", "false"); const row = btn.closest(".ep"); if (row) row.classList.remove("is-playing"); if (!silent) setState(btn, MI.t("audio.again", "Extrait terminé. Cliquez pour le réécouter.")); }
      if (cur) MI.waves.level(String(cur.n), 0.18); MI.waves.level("hero", 0.18);
      cur = null; btn = null;
    }
    function play(ep, b) {
      if (cur && cur.n === ep.n) { stop(); return; }
      stop(true);
      cur = ep; btn = b; b.setAttribute("aria-pressed", "true"); icon(b, true);
      const row = b.closest(".ep"); if (row) row.classList.add("is-playing");
      setState(b, MI.t("audio.loading", "Chargement de l’extrait…"));
      const start = ep.start || 0;
      const go = () => {
        try { el.currentTime = start; } catch (e) { /* position non disponible */ }
        el.play().then(() => {
          setState(b, MI.t("audio.playing", "Lecture de l’extrait (30 s)"));
          MI.waves.level(String(ep.n), 0.85); MI.waves.level("hero", 0.85);
          stopTimer = setTimeout(() => stop(), LEN * 1000 + 400);
        }).catch(fail);
      };
      el.onerror = fail;
      el.ontimeupdate = () => { if (cur === ep) ring(b, (el.currentTime - start) / LEN); };
      el.onended = () => stop();
      if (el.src !== ep.audio) { el.src = ep.audio; el.addEventListener("loadedmetadata", go, { once: true }); el.load(); } else go();
    }
    function fail() {
      const b = btn, ep = cur; stop(true);
      if (b) setState(b, MI.t("audio.error", "Extrait indisponible ici : écoutez l’épisode sur Spotify."), true);
      if (b && ep && !b.parentElement.querySelector(".fallback-link")) {
        const a = document.createElement("a"); a.className = "link label fallback-link"; a.href = ep.url; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Spotify ↗";
        const st = (b.closest("[data-extract-wrap]") || b.parentElement).querySelector("[data-extract-state]");
        if (st) st.after(a);
      }
    }
    return { play, stop };
  })();
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-extract]");
    if (!b) return;
    const ep = (D.podcast || []).find(x => String(x.n) === b.getAttribute("data-extract"));
    if (ep) MI.audio.play(ep, b);
  });

  /* ---------- Formulaires en étapes (simulés) ---------- */
  $$("form[data-steps]").forEach(form => {
    const steps = $$("[data-step]", form);
    const bars = $$(".steps span", form);
    const prev = $("[data-prev]", form), next = $("[data-next]", form), submit = $("[data-submit]", form);
    const err = $("[data-form-error]", form);
    let i = 0;
    function show(n) {
      i = n;
      steps.forEach((s, k) => { s.hidden = k !== i; });
      bars.forEach((b, k) => b.classList.toggle("on", k <= i));
      prev.hidden = i === 0; next.hidden = i === steps.length - 1; submit.hidden = i !== steps.length - 1;
      err.textContent = "";
      if (hasGsap && !MI.calm) gsap.from(steps[i], { x: 30, opacity: 0, duration: 0.45, ease: "power3.out" });
    }
    function valid() {
      const fields = $$("input, textarea, select", steps[i]);
      for (const f of fields) {
        if (!f.checkValidity()) {
          err.textContent = f.type === "email" && f.value ? MI.t("err.email", "Vérifiez l’adresse e-mail : elle doit contenir @ et un domaine.") : f.type === "radio" ? MI.t("err.choice", "Choisissez une option pour continuer.") : MI.t("err.field", "Remplissez ce champ pour continuer.");
          f.focus(); return false;
        }
      }
      return true;
    }
    next.addEventListener("click", () => { if (valid()) show(i + 1); });
    prev.addEventListener("click", () => show(i - 1));
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!valid()) return;
      steps.forEach(s => { s.hidden = true; });
      $(".form-nav", form).hidden = true; $(".steps", form).hidden = true;
      err.textContent = "";
      const done = $("[data-done]", form); done.hidden = false;
      stampIn($(".stamp", done));
    });
  });
  $$("form[data-newsletter]").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const input = $("input", form); const err = form.parentElement.querySelector("[data-form-error]");
      if (!input.checkValidity() || !input.value) { err.textContent = MI.t("err.email", "Vérifiez l’adresse e-mail : elle doit contenir @ et un domaine."); input.focus(); return; }
      err.textContent = "";
      const s = document.createElement("span"); s.className = "stamp"; s.innerHTML = MI.t("nl.stamp", "Inscrit·e");
      form.replaceWith(s); stampIn(s);
      const note = document.createElement("p"); note.className = "form-note"; note.textContent = MI.t("formnote", "Maquette : ce formulaire ne transmet aucune donnée."); s.after(note);
    });
  });

  /* ---------- Transition de page : la feuille qu'on tourne ---------- */
  const sheet = $(".page-sheet");
  const arrivedByTurn = session.get("mi-turn") === "1";
  session.set("mi-turn", "0");
  if (sheet && hasGsap && !MI.calm) {
    document.addEventListener("click", e => {
      const a = e.target.closest("a[href]");
      if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
      e.preventDefault();
      session.set("mi-turn", "1");
      gsap.fromTo(sheet, { xPercent: 105 }, { xPercent: 0, duration: 0.55, ease: "power3.inOut", onComplete: () => { window.location.href = href; } });
    });
    if (arrivedByTurn) {
      gsap.set(sheet, { xPercent: 0 });
      gsap.to(sheet, { xPercent: -105, duration: 0.7, ease: "power3.inOut", delay: 0.05 });
    }
  }
  window.addEventListener("pageshow", e => { if (e.persisted && sheet && hasGsap) gsap.set(sheet, { xPercent: 105 }); });

  /* ---------- Pied de page : titre qui s'imprime ---------- */
  function revealTitles(root) {
    if (!hasGsap || MI.calm) return;
    $$(".sec-head h2, .folio + * h2, [data-split]", root).forEach(h => {
      if (h.__split) return; h.__split = true;
      gsap.from(h, { clipPath: "inset(0 0 100% 0)", y: 26, duration: 1, ease: "power4.out", scrollTrigger: { trigger: h, start: "top 88%", once: true }, clearProps: "clipPath,transform" });
    });
  }

  /* ================= PAGE D'ACCUEIL ================= */
  function homeIntro() {
    const mast = $(".masthead");
    const title = $(".une__title");
    const feature = $(".feature__media");
    const featApi = glFigures.find(g => g.fig === feature);
    const rules = $(".une__grid");
    if (!hasGsap || MI.calm) { if (featApi && featApi.api) featApi.api.set(1); return; }
    let split = null;
    if (window.SplitText) split = new SplitText(mast, { type: "chars", charsClass: "char" });
    const firstVisit = session.get("mi-intro") !== "1" && !arrivedByTurn;
    session.set("mi-intro", "1");
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    if (firstVisit) {
      const intro = document.createElement("div");
      intro.className = "intro"; intro.setAttribute("aria-hidden", "true");
      intro.innerHTML = '<span class="intro__crop intro__crop--tl"></span><span class="intro__crop intro__crop--tr"></span><span class="intro__crop intro__crop--bl"></span><span class="intro__crop intro__crop--br"></span><div><svg class="intro__mark" viewBox="0 0 74 74"><circle cx="37" cy="37" r="20" fill="none" stroke="#17140F" stroke-width="1.5"/><path d="M37 4v66M4 37h66" stroke="#17140F" stroke-width="1.5"/><circle cx="37" cy="37" r="8" fill="#17140F"/></svg><p class="intro__count"><span>' + MI.t("intro", "Calage de la presse") + '</span> <span class="num" data-n>0</span>%</p></div>';
      document.body.appendChild(intro);
      const n = $("[data-n]", intro); const o = { v: 0 };
      tl.from($$(".intro__crop", intro), { scale: 0, duration: 0.5, stagger: 0.05, ease: "power3.out" })
        .to($(".intro__mark", intro), { rotate: 180, duration: 1.1, ease: "power2.inOut" }, 0)
        .to(o, { v: 100, duration: 1.0, ease: "power2.inOut", onUpdate: () => { n.textContent = Math.round(o.v); } }, 0)
        .to(intro, { clipPath: "inset(0 0 100% 0)", duration: 0.75, ease: "power4.inOut", onComplete: () => intro.remove() }, 1.05);
    }
    const at = firstVisit ? 1.35 : 0.15;
    if (split) tl.from(split.chars, { yPercent: 70, rotateX: -100, opacity: 0, duration: 1.1, stagger: { each: 0.03, from: "start" } }, at);
    tl.from(".une__ears > *, .une__tagline > *", { y: 12, opacity: 0, duration: 0.6, stagger: 0.05, ease: "power3.out" }, at + 0.25);
    if (rules) { rules.style.setProperty("--rule-s", "0"); tl.to(rules, { "--rule-s": 1, duration: 1, ease: "power3.inOut" }, at + 0.2); }
    tl.from(title, { clipPath: "inset(0 0 100% 0)", y: 40, duration: 1, ease: "power4.out", clearProps: "clipPath,transform" }, at + 0.35);
    tl.from(".summary li, .une__side > *", { y: 18, opacity: 0, duration: 0.6, stagger: 0.04, ease: "power3.out" }, at + 0.45);
    tl.from(".feature__meta, .feature__title, .une__lead, .une__main .btn-row", { y: 16, opacity: 0, duration: 0.6, stagger: 0.06, ease: "power3.out" }, at + 0.55);
    tl.add(() => { if (featApi && featApi.api) featApi.api.reveal(); else if (feature) MI.dotsReveal(feature); }, at + 0.3);
  }

  function editoProof() {
    const proof = $("[data-proof]");
    if (!proof) return;
    const note = $(".proof__note", proof), caret = $(".proof__caret", proof);
    const stamp = $("#edito [data-stamp]");
    if (!hasGsap || MI.calm) return;
    let svg = $(".proof__svg", proof);
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "proof__svg"); svg.setAttribute("aria-hidden", "true");
      proof.appendChild(svg);
    }
    const drawLink = () => {
      const pr = proof.getBoundingClientRect(), cr = caret.getBoundingClientRect(), nr = note.getBoundingClientRect();
      const x1 = cr.left - pr.left + cr.width / 2, y1 = cr.bottom - pr.top - 4, x2 = nr.left - pr.left + 4, y2 = nr.top - pr.top + 4;
      svg.innerHTML = '<path d="M' + x1 + "," + y1 + " C" + (x1 + 40) + "," + (y1 + 6) + " " + (x2 - 60) + "," + (y2 - 26) + " " + x2 + "," + y2 + '" fill="none" stroke="#C2341F" stroke-width="2.2" stroke-linecap="round"/>';
      return $("path", svg);
    };
    let path = drawLink();
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(note, { clipPath: "inset(0 100% 0 0)" });
    gsap.set(caret, { scale: 0, transformOrigin: "50% 100%" });
    if (stamp) gsap.set(stamp, { opacity: 0 });
    const desktop = window.matchMedia("(min-width: 980px)").matches;
    const tl = gsap.timeline({
      scrollTrigger: desktop
        ? { trigger: "#edito .edito__grid", start: "top 18%", end: "+=110%", pin: true, scrub: 0.6, anticipatePin: 1 }
        : { trigger: proof, start: "top 70%", once: true }
    });
    tl.to(caret, { scale: 1, duration: 0.3, ease: "back.out(3)" })
      .to(path, { strokeDashoffset: 0, duration: 0.6, ease: "none" })
      .to(note, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "none" })
      .to("#edito .hl", { "--hl": "100%", duration: 0.8, stagger: 0.3 }, ">-0.1")
      .add(() => { if (stamp && tl.scrollTrigger && tl.scrollTrigger.direction > 0) stampIn(stamp); }, ">")
      .to({}, { duration: 0.6 });
    if (!desktop && stamp) tl.add(() => stampIn(stamp), ">-0.4");
    $$("#edito .hl").forEach(el => { el.__hl = true; el.style.setProperty("--hl", "0%"); });
    window.addEventListener("resize", () => { path = drawLink(); });
  }

  function europeMap() {
    const host = $("[data-europe-map]"); const M = window.MI_EUROPE;
    if (!host || !M) return;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 " + M.w + " " + M.h); svg.setAttribute("aria-hidden", "true");
    const g = document.createElementNS(ns, "g");
    M.countries.forEach(c => { const p = document.createElementNS(ns, "path"); p.setAttribute("d", c.d); p.setAttribute("class", "country"); g.appendChild(p); });
    svg.appendChild(g);
    const cities = document.createElementNS(ns, "g");
    const names = { Amsterdam: ["Amsterdam", "Amsterdam"], Prague: ["Prague", "Prague"], Vienne: ["Vienne", "Vienna"], Lyon: ["Lyon", "Lyon"] };
    Object.keys(M.cities).forEach(k => {
      const [x, y] = M.cities[k];
      const cg = document.createElementNS(ns, "g"); cg.setAttribute("class", "city"); cg.setAttribute("transform", "translate(" + x + "," + y + ")");
      cg.innerHTML = '<circle class="ring" r="14"/><circle class="dot" r="6"/><text x="' + (k === "Lyon" ? -18 : 20) + '" y="' + (k === "Vienne" ? 24 : 5) + '" text-anchor="' + (k === "Lyon" ? "end" : "start") + '" data-city="' + k + '">' + names[k][MI.lang === "en" ? 1 : 0] + "</text>";
      cities.appendChild(cg);
    });
    svg.appendChild(cities); host.appendChild(svg);
    document.addEventListener("mi:lang", () => $$("text[data-city]", svg).forEach(t => { t.textContent = names[t.getAttribute("data-city")][MI.lang === "en" ? 1 : 0]; }));
    if (!hasGsap || MI.calm) return;
    const paths = $$("path", g);
    paths.forEach(p => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
    const cg = $$(".city", cities);
    gsap.set(cg, { opacity: 0, scale: 0, transformOrigin: "center", transformBox: "fill-box" });
    const tl = gsap.timeline({ scrollTrigger: { trigger: host, start: "top 78%", once: true } });
    tl.to(paths, { strokeDashoffset: 0, duration: 2.4, ease: "power2.inOut", stagger: { each: 0.025, from: "random" } })
      .to(cg, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.12, ease: "back.out(2.5)" }, "-=0.9");
    cg.forEach((c, i) => { const ring = $(".ring", c); gsap.to(ring, { scale: 1.9, opacity: 0, transformOrigin: "center", transformBox: "fill-box", duration: 1.8, repeat: -1, delay: 2.6 + i * 0.3, ease: "power1.out" }); });
  }

  function catalogue() {
    const host = $("[data-cards]"); if (!host) return;
    const items = [];
    (D.videos || []).forEach(v => items.push({ kind: "video", th: v.th, title: v.t, d: v.d, img: "youtube/" + v.img, id: v.id, page: v.page }));
    (D.podcast || []).forEach(p => items.push({ kind: "podcast", th: p.th, title: p.t, d: p.d, img: p.img, square: true, href: "podcast.html#ep-" + p.n }));
    (D.magazines || []).forEach(m => items.push({ kind: "magazine", th: m.th, title: m.t, img: m.img, portrait: true, href: "#kiosque" }));
    items.push({ kind: "formation", th: "mode", title: MI.t("cat.formation", "La fast-fashion : diaporama, quiz et fiche récap’"), img: "documents/formation-fast-fashion-diaporama-couverture", href: "#ecoles" });
    const cols = () => { const n = getComputedStyle(host).gridTemplateColumns.split(" ").filter(Boolean).length || 1; return n; };
    let LIMIT = 8;
    let showAll = false, fTh = "all", fFmt = "all";
    const label = (k, map) => (map[k] ? map[k][MI.lang] || map[k].fr : k);
    function cardHTML(it, i) {
      const imgTag = it.img
        ? '<img src="assets/img/' + it.img + '-480.webp" srcset="assets/img/' + it.img + '-480.webp 480w, assets/img/' + it.img + '-960.webp 960w" sizes="(min-width: 1000px) 30vw, (min-width: 640px) 45vw, 100vw" alt="" loading="lazy" width="480" height="270">'
        : '<div class="cover-temp" style="padding:6%"><div class="cover-temp__mast">Marco Investigation</div><div class="cover-temp__title" style="font-size:1.6rem">La fast-fashion</div><span class="todo">' + MI.t("mag2.temp", "Couverture provisoire") + "</span></div>";
      const fmt = label(it.kind, D.formats), th = label(it.th, D.themes);
      const linkOpen = it.kind === "video"
        ? '<button type="button" class="card__link" data-video="' + it.id + '" data-cursor="voir">'
        : '<a class="card__link" href="' + it.href + '" data-cursor="' + (it.kind === "podcast" ? "ecouter" : "lire") + '">';
      const linkClose = it.kind === "video" ? "</button>" : "</a>";
      const bg = it.square ? "background:#F6A8DA" : it.portrait ? "background:var(--paper-3)" : "";
      return '<article class="card" data-th="' + it.th + '" data-fmt="' + it.kind + '" data-i="' + i + '">' +
        '<figure class="media card__media' + (it.square || it.portrait ? " is-square" : "") + '" style="' + bg + '">' + imgTag +
        '<span class="card__badge">' + fmt + "</span>" + (it.d ? '<span class="card__dur">' + it.d + "</span>" : "") + "</figure>" +
        '<div class="card__meta label">' + th + "</div>" +
        "<h3>" + linkOpen + it.title + linkClose + "</h3>" +
        (it.page ? '<a class="link label" href="' + it.page + '" style="position:relative;z-index:5;justify-self:start">' + MI.t("cat.read", "Lire l’enquête complète") + "</a>" : "") +
        "</article>";
    }
    function render() {
      const c = cols(); LIMIT = c >= 4 ? 8 : c === 3 ? 9 : c === 2 ? 8 : 6;
      host.innerHTML = items.map(cardHTML).join("");
      apply(false);
      tilt();
    }
    function matches(it) { return (fTh === "all" || it.th === fTh) && (fFmt === "all" || it.kind === fFmt); }
    function apply(animate) {
      const cards = $$(".card", host);
      const state = animate && hasGsap && window.Flip && !MI.calm ? Flip.getState(cards) : null;
      let shown = 0, total = 0;
      cards.forEach(c => {
        const it = items[+c.getAttribute("data-i")];
        const ok = matches(it);
        if (ok) total++;
        const vis = ok && (showAll || shown < LIMIT);
        if (vis) shown++;
        c.hidden = !vis;
      });
      const more = $("[data-more]");
      if (more) more.parentElement.hidden = showAll || total <= LIMIT;
      const cnt = $("[data-cat-count]");
      if (cnt) cnt.textContent = (MI.lang === "en" ? total + " item" + (total > 1 ? "s" : "") : total + " contenu" + (total > 1 ? "s" : "")) + (total > shown ? (MI.lang === "en" ? " · " + shown + " shown" : " · " + shown + " affichés") : "");
      if (state) Flip.from(state, { duration: 0.6, ease: "power3.inOut", stagger: 0.015, absolute: true, onEnter: els => gsap.fromTo(els, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.03 }) });
      if (hasGsap) ScrollTrigger.refresh();
    }
    function chips() {
      const thHost = $("[data-filter-group='th']"), fmHost = $("[data-filter-group='fmt']");
      const count = (key, val) => items.filter(it => it[key] === val).length;
      const mk = (group, val, text, n) => '<button type="button" class="fchip" data-f="' + group + '" data-v="' + val + '" aria-pressed="' + ((group === "th" ? fTh : fFmt) === val) + '">' + text + (n != null ? '<span class="n">' + n + "</span>" : "") + "</button>";
      thHost.innerHTML = '<span class="label">' + MI.t("f.theme", "Thème") + "</span>" + mk("th", "all", MI.t("f.all", "Tout"), items.length) + Object.keys(D.themes).map(k => mk("th", k, label(k, D.themes), count("th", k))).join("");
      fmHost.innerHTML = '<span class="label">' + MI.t("f.format", "Format") + "</span>" + mk("fmt", "all", MI.t("f.all", "Tout"), null) + Object.keys(D.formats).map(k => mk("fmt", k, label(k, D.formats), count("kind", k))).join("");
    }
    document.addEventListener("click", e => {
      const b = e.target.closest(".fchip"); if (!b) return;
      if (b.getAttribute("data-f") === "th") fTh = b.getAttribute("data-v"); else fFmt = b.getAttribute("data-v");
      $$(".fchip[data-f='" + b.getAttribute("data-f") + "']").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      apply(true);
    });
    const more = $("[data-more]");
    if (more) more.addEventListener("click", () => { showAll = true; apply(true); });
    function tilt() {
      if (!fine || !hasGsap || MI.calm) return;
      $$(".card", host).forEach(card => {
        const m = $(".card__media", card);
        card.addEventListener("pointermove", e => {
          const r = m.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(m, { rotateY: x * 9, rotateX: -y * 7, duration: 0.5, ease: "power2.out", transformPerspective: 900 });
        });
        card.addEventListener("pointerleave", () => gsap.to(m, { rotateY: 0, rotateX: 0, duration: 0.7, ease: "elastic.out(1,0.5)" }));
      });
    }
    chips(); render();
    document.addEventListener("mi:lang", () => { items[items.length - 1].title = MI.t("cat.formation", "La fast-fashion : diaporama, quiz et fiche récap’"); chips(); render(); });
    if (hasGsap && !MI.calm) {
      ScrollTrigger.create({ trigger: host, start: "top 85%", once: true, onEnter: () => gsap.from($$(".card:not([hidden])", host), { y: 40, opacity: 0.3, duration: 0.8, stagger: 0.06, ease: "power3.out", clearProps: "opacity,transform" }) });
    }
  }

  function kiosque() {
    if (!hasGsap || MI.calm) return;
    $$("[data-book] .book__scroll").forEach((b, i) => {
      const small = window.matchMedia("(max-width: 520px)").matches;
      gsap.fromTo(b, { rotateY: -24, y: small ? 24 : 70 }, { rotateY: 14, y: small ? -10 : -30, ease: "none", scrollTrigger: { trigger: b, start: "top bottom", end: "bottom top", scrub: 0.8 } });
    });
    const narrow = window.matchMedia("(max-width: 520px)").matches;
    gsap.from(".copy", { y: 90, rotate: (i) => (narrow ? 0 : i % 2 ? 9 : -9), opacity: 0.4, duration: 1, stagger: 0.15, ease: "power3.out", scrollTrigger: { trigger: ".copies", start: "top 85%", once: true }, clearProps: "opacity" });
  }

  function pressFan() {
    const clips = $$("[data-clips] .clip"); if (!clips.length) return;
    const stamps = clips.map(c => $(".stamp", c));
    if (!hasGsap || MI.calm) return;
    stamps.forEach(s => gsap.set(s, { opacity: 0 }));
    const desktop = window.matchMedia("(min-width: 900px)").matches;
    if (desktop) {
      const stage = $("[data-clips]");
      const sr = stage.getBoundingClientRect();
      const tl = gsap.timeline({ scrollTrigger: { trigger: stage, start: "top 85%", end: "top 25%", scrub: 0.7 } });
      clips.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const dx = sr.left + sr.width / 2 - (r.left + r.width / 2);
        tl.from(c, { x: dx, y: 40 + i * 6, rotate: [-7, 5, -3, 8][i % 4], duration: 1, ease: "power2.out" }, 0);
      });
      ScrollTrigger.create({ trigger: stage, start: "top 30%", once: true, onEnter: () => stamps.forEach((s, i) => stampIn(s, i * 0.18)) });
    } else {
      clips.forEach((c, i) => ScrollTrigger.create({ trigger: c, start: "top 75%", once: true, onEnter: () => stampIn(stamps[i]) }));
    }
  }

  function timeline() {
    const t = $("[data-timeline]"); if (!t || !hasGsap || MI.calm) return;
    const line = $(".timeline__line", t);
    const vertical = window.matchMedia("(max-width: 980px)").matches;
    gsap.fromTo(line, vertical ? { scaleY: 0 } : { scaleX: 0 }, Object.assign(vertical ? { scaleY: 1 } : { scaleX: 1 }, { ease: "none", scrollTrigger: { trigger: t, start: "top 80%", end: "bottom 60%", scrub: 0.6 } }));
  }

  function stampsOnEnter(root) {
    if (!hasGsap || MI.calm) return;
    $$("[data-stamp]", root).forEach(s => {
      if (s.closest("[data-clips]") || s.closest("#edito")) return;
      gsap.set(s, { opacity: 0 });
      ScrollTrigger.create({ trigger: s, start: "top 85%", once: true, onEnter: () => stampIn(s) });
    });
  }

  /* ================= PAGE ENQUÊTE ================= */
  function journey() {
    const sec = $("[data-journey]"); if (!sec || !hasGsap || MI.calm) return;
    if (!window.matchMedia("(min-width: 761px)").matches) return;
    const track = $(".journey__track", sec), bar = $(".journey__progress span", sec);
    const dist = () => Math.max(0, track.scrollWidth - sec.querySelector(".wrap").clientWidth + 40);
    gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: sec, start: "top 12%", end: () => "+=" + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: self => { if (bar) bar.style.transform = "scaleX(" + self.progress + ")"; } }
    });
  }
  function fixes() {
    $$(".fix").forEach(f => {
      const strike = $(".strike", f), hand = $(".hand", f);
      if (!hasGsap || MI.calm) return;
      gsap.set(strike, { scaleX: 0 }); gsap.set(hand, { clipPath: "inset(0 100% 0 0)" });
      gsap.timeline({ scrollTrigger: { trigger: f, start: "top 75%", once: true } })
        .to(strike, { scaleX: 1, duration: 0.45, ease: "power2.in" })
        .to(hand, { clipPath: "inset(0 0% 0 0)", duration: 0.8, ease: "power1.inOut" }, "+=0.05");
    });
  }
  function bars() {
    $$(".bar__fill").forEach(b => {
      if (!hasGsap || MI.calm) return;
      gsap.from(b, { scaleX: 0, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: b, start: "top 88%", once: true } });
    });
  }
  function quiz() {
    const q = $("[data-quiz]"); if (!q) return;
    let score = 0, answered = 0;
    const total = $$(".quiz__q", q).length;
    const out = $("[data-quiz-score]");
    $$(".quiz__q", q).forEach(block => {
      const fb = $(".quiz__fb", block);
      $$(".quiz__opts button", block).forEach(b => b.addEventListener("click", () => {
        const ok = b.hasAttribute("data-ok");
        $$(".quiz__opts button", block).forEach(x => { x.disabled = true; if (x.hasAttribute("data-ok")) x.classList.add("ok"); });
        if (!ok) b.classList.add("ko");
        if (ok) score++;
        answered++;
        fb.hidden = false;
        if (hasGsap && !MI.calm) gsap.from(fb, { y: 10, opacity: 0, duration: 0.4 });
        if (answered === total && out) {
          $(".big", out).textContent = score + " / " + total;
          out.hidden = false;
          const s = $(".stamp", out); if (s) stampIn(s);
        }
      }));
    });
  }
  function heroLines() {
    if (!hasGsap || MI.calm) return;
    const h = $(".article-hero h1"); if (!h) return;
    gsap.from(h, { clipPath: "inset(0 0 100% 0)", y: 50, duration: 1.1, ease: "power4.out", delay: arrivedByTurn ? 0.45 : 0.15, clearProps: "clipPath,transform" });
    gsap.from(".article-hero .kicker, .article-hero .lead, .article-hero .toc, .article-hero .btn-row, .article-hero__player, .pod-hero__cover", { y: 22, opacity: 0, duration: 0.8, stagger: 0.08, ease: "power3.out", delay: arrivedByTurn ? 0.6 : 0.3 });
    const bg = $(".article-hero__bg .media");
    if (bg) gsap.to(bg, { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".article-hero", start: "top top", end: "bottom top", scrub: true } });
  }

  /* ================= PAGE PODCAST ================= */
  function episodes() {
    const host = $("[data-episodes]"); if (!host) return;
    function render() {
      host.innerHTML = (D.podcast || []).map(ep => {
        const date = new Date(ep.date + "T12:00:00").toLocaleDateString(MI.lang === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "long", year: "numeric" });
        const dateTxt = MI.lang === "fr" ? date.replace(/^1 /, "1er ") : date;
        const dur = ep.d.split(":"); const mins = dur.length === 3 ? (+dur[0] * 60 + +dur[1]) : +dur[0];
        const durTxt = mins >= 1 ? mins + " min" : ep.d;
        return '<li class="ep" id="ep-' + ep.n + '">' +
          '<span class="ep__n">' + String(ep.n).padStart(2, "0") + "</span>" +
          '<figure class="media" data-dots style="' + (ep.img.indexOf("couverture") > -1 || ep.n === 6 ? "background:#F6A8DA" : "") + '"><img src="assets/img/' + ep.img + '-480.webp" alt="" loading="lazy" width="480" height="480"></figure>' +
          '<div class="ep__body"><div class="ep__meta label"><span>' + dateTxt + "</span><span>" + durTxt + "</span><span>" + (D.themes[ep.th] ? D.themes[ep.th][MI.lang] : "") + "</span></div>" +
          "<h3>" + ep.t + "</h3><p>" + (ep[MI.lang] || ep.fr) + "</p>" +
          '<div class="ep__actions" data-extract-wrap>' +
          '<button type="button" class="extract__btn" data-extract="' + ep.n + '" data-cursor="ecouter" aria-pressed="false" aria-label="' + MI.t("audio.aria", "Écouter un extrait de 30 secondes") + " : " + ep.t.replace(/"/g, "") + '"><svg class="ring" viewBox="0 0 68 68" aria-hidden="true"><circle cx="34" cy="34" r="32"/></svg><svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg></button>' +
          '<canvas class="ep__wave" data-wave="' + ep.n + '" aria-hidden="true"></canvas>' +
          '<span class="extract__state" data-extract-state>' + (ep.n === 6 ? MI.t("ep.trailer", "Bande-annonce : 30 premières secondes") : MI.t("ep.extract", "Extrait de 30 s")) + "</span>" +
          '<a class="btn btn--ghost btn--sm" href="' + ep.url + '" target="_blank" rel="noopener">Spotify ↗</a>' +
          "</div></div></li>";
      }).join("");
      $$("canvas[data-wave]", host).forEach(c => MI.waves.add(c, { key: c.getAttribute("data-wave") }));
      $$(".extract__btn", host).forEach(magnetic);
      if (hasGsap && !MI.calm) {
        $$(".ep", host).forEach(row => {
          const fig = $(".media", row);
          ScrollTrigger.create({ trigger: row, start: "top 88%", once: true, onEnter: () => { gsap.from(row, { y: 30, opacity: 0.35, duration: 0.8, ease: "power3.out", clearProps: "opacity,transform" }); MI.dotsReveal(fig); } });
        });
      }
    }
    render();
    document.addEventListener("mi:lang", () => { if (MI.audio) MI.audio.stop(true); render(); ScrollTrigger.refresh(); });
    if (location.hash && /^#ep-\d$/.test(location.hash)) {
      const t = $(location.hash); if (t) setTimeout(() => scrollToTarget(t), 600);
    }
  }

  /* ---------- Lancement ---------- */
  function boot() {
    fillDate();
    if (MI.lang !== "fr") setLang(MI.lang);
    if (page === "home") { homeIntro(); editoProof(); europeMap(); catalogue(); kiosque(); pressFan(); timeline(); }
    if (page === "enquete") { heroLines(); journey(); fixes(); bars(); quiz(); }
    if (page === "podcast") { heroLines(); episodes(); }
    if (page === "legal") { heroLines(); }
    counters(document);
    freshInk(document);
    highlighter(document);
    stampsOnEnter(document);
    revealTitles(document);
    if (hasGsap) {
      window.addEventListener("load", () => ScrollTrigger.refresh());
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
