/* Trame d'impression : visuels provisoires, révélation en points (WebGL avec OGL, repli CSS)
   et compte-fils au survol. */
(function () {
  const MI = (window.MI = window.MI || {});

  /* ---------- Visuels provisoires dessinés en code ---------- */
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const palettes = [
    ["#2a241b", "#8e5e01", "#e5dfcf"], ["#17140f", "#5d4a2c", "#d9d1bc"], ["#3b3226", "#a8720c", "#efebdf"],
    ["#1f2a2a", "#8e5e01", "#d9d1bc"], ["#2b1f1a", "#c2341f", "#e5dfcf"], ["#24221c", "#7d7454", "#efebdf"]
  ];
  MI.placeholder = function (name, ratio) {
    const W = 1200, H = Math.round(W / (ratio || 1.5));
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"); const r = rng(hash(name)); const p = palettes[hash(name) % palettes.length];
    const bg = g.createLinearGradient(0, 0, W * r(), H);
    bg.addColorStop(0, p[0]); bg.addColorStop(1, p[1]);
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 5; i++) {
      const x = r() * W, y = r() * H, rad = (0.25 + r() * 0.5) * Math.max(W, H);
      const rg = g.createRadialGradient(x, y, 0, x, y, rad);
      rg.addColorStop(0, i % 2 ? "rgba(239,235,223,.42)" : "rgba(23,20,15,.55)"); rg.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    }
    const beam = g.createLinearGradient(W * 0.2, 0, W * 0.7, H);
    beam.addColorStop(0, "rgba(255,248,230,0)"); beam.addColorStop(0.5, "rgba(255,248,230,.22)"); beam.addColorStop(1, "rgba(255,248,230,0)");
    g.fillStyle = beam; g.fillRect(0, 0, W, H);
    /* trame */
    const cell = 13, a = Math.PI / 4, ca = Math.cos(a), sa = Math.sin(a);
    const img = g.getImageData(0, 0, W, H).data;
    g.fillStyle = "rgba(23,20,15,.55)";
    const diag = Math.hypot(W, H);
    for (let u = -diag; u < diag; u += cell) {
      for (let v = -diag; v < diag; v += cell) {
        const x = u * ca - v * sa + W / 2, y = u * sa + v * ca + H / 2;
        if (x < -cell || y < -cell || x > W + cell || y > H + cell) continue;
        const ix = Math.min(W - 1, Math.max(0, x | 0)), iy = Math.min(H - 1, Math.max(0, y | 0)), k = (iy * W + ix) * 4;
        const lum = (img[k] * 0.299 + img[k + 1] * 0.587 + img[k + 2] * 0.114) / 255;
        const rad = (1 - lum) * cell * 0.5;
        if (rad < 0.6) continue;
        g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
      }
    }
    g.strokeStyle = "rgba(239,235,223,.35)"; g.lineWidth = 2; g.strokeRect(14, 14, W - 28, H - 28);
    return c.toDataURL("image/jpeg", 0.82);
  };

  /* ---------- Chargement des images Grok ---------- */
  MI.initGrokImages = function (root) {
    const ready = (window.MI_DATA && window.MI_DATA.grokReady) || [];
    (root || document).querySelectorAll("img[data-grok]").forEach(function (img) {
      const name = img.getAttribute("data-grok");
      const fig = img.closest(".media");
      if (ready.indexOf(name) > -1) {
        /* version portrait sur téléphone quand elle existe (choisie au chargement) */
        const mobile = name + "-mobile";
        const useMobile = ready.indexOf(mobile) > -1 && window.matchMedia("(max-width: 720px)").matches;
        const base = "assets/img/grok/" + (useMobile ? mobile : name);
        if (!img.hasAttribute("fetchpriority")) img.loading = "lazy";
        img.decoding = "async";
        if (!img.sizes) img.sizes = img.getAttribute("data-sizes") || "100vw";
        img.srcset = base + "-480.webp 480w, " + base + "-960.webp 960w, " + base + "-1600.webp 1168w";
        img.src = base + "-960.webp";
        if (fig && !fig.querySelector(".ai-tag")) {
          const tag = document.createElement("span");
          tag.className = "ai-tag";
          tag.setAttribute("data-i18n", "ai.tag");
          tag.textContent = "Illustration générée";
          fig.appendChild(tag);
        }
      } else {
        const ratio = parseFloat(img.getAttribute("data-ratio")) || 1.5;
        img.src = MI.placeholder(name, ratio);
        if (fig && !fig.querySelector(".ph-tag")) {
          const tag = document.createElement("span");
          tag.className = "ph-tag";
          tag.setAttribute("data-i18n-ph", name);
          tag.textContent = (document.documentElement.lang === "en" ? "Temporary visual · Grok: " : "Visuel provisoire · Grok : ") + name;
          fig.appendChild(tag);
        }
      }
    });
  };

  /* ---------- Révélation CSS en points (repli et vignettes) ---------- */
  MI.dotsReveal = function (fig, delay) {
    if (!window.gsap || MI.calm) return;
    fig.classList.add("dots");
    fig.style.setProperty("--dot", "34%");
    gsap.to(fig, { "--dot": "76%", duration: 1.3, delay: delay || 0, ease: "power2.inOut", onComplete: function () { fig.classList.remove("dots"); fig.style.removeProperty("--dot"); } });
  };

  /* ---------- WebGL : trame d'impression et compte-fils ---------- */
  const VERT = "attribute vec2 uv;attribute vec2 position;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0.,1.);}";
  const FRAG = [
    "precision highp float;",
    "uniform sampler2D tMap;uniform vec2 uRes;uniform vec2 uImg;uniform float uProg;uniform vec2 uMouse;uniform float uHover;uniform float uLens;uniform float uCell;uniform vec3 uInk;uniform vec3 uPaper;",
    "varying vec2 vUv;",
    "vec2 cover(vec2 uv){float rs=uRes.x/uRes.y;float ri=uImg.x/uImg.y;vec2 s=rs<ri?vec2(rs/ri,1.):vec2(1.,ri/rs);return (uv-.5)*s+.5;}",
    "vec3 tone(vec2 px,float cell){",
    "  vec2 p=vec2(px.x*.7071-px.y*.7071,px.x*.7071+px.y*.7071);",
    "  vec2 c=(floor(p/cell)+.5)*cell;",
    "  vec2 cs=vec2(c.x*.7071+c.y*.7071,-c.x*.7071+c.y*.7071);",
    "  vec3 col=texture2D(tMap,cover(cs/uRes)).rgb;",
    "  float lum=dot(col,vec3(.299,.587,.114));",
    "  float rad=(1.-lum)*cell*.66+.15;",
    "  float d=length(p-c);",
    "  float m=1.-smoothstep(rad-.9,rad+.9,d);",
    "  return mix(uPaper,uInk,m);",
    "}",
    "void main(){",
    "  vec2 px=vUv*uRes;",
    "  vec3 img=texture2D(tMap,cover(vUv)).rgb;",
    "  float dm=distance(px,uMouse*uRes);",
    "  float lens=uHover*(1.-smoothstep(uLens-24.,uLens,dm));",
    "  float k=smoothstep(0.,1.,clamp(uProg,0.,1.));",
    "  k=k*(1.-lens);",
    "  float cell=mix(uCell*2.6,uCell,smoothstep(0.,.8,uProg));",
    "  cell=mix(cell,uCell*.9,lens);",
    "  vec3 ht=tone(px,cell);",
    "  vec3 col=mix(ht,img,k);",
    "  float rim=uHover*(smoothstep(uLens-3.,uLens,dm)-smoothstep(uLens,uLens+3.,dm));",
    "  col=mix(col,uInk,rim*.9);",
    "  gl_FragColor=vec4(col,1.);",
    "}"
  ].join("\n");

  let glCount = 0;
  const GL_MAX = 8;
  let glOk = null;
  function supportsGL() {
    if (glOk !== null) return glOk;
    try { const c = document.createElement("canvas"); const g = c.getContext("webgl", { failIfMajorPerformanceCaveat: false }) || c.getContext("experimental-webgl"); glOk = !!g; if (g && g.getExtension("WEBGL_lose_context")) g.getExtension("WEBGL_lose_context").loseContext(); } catch (e) { glOk = false; }
    return glOk;
  }

  MI.initHalftone = function (fig, opts) {
    opts = opts || {};
    const img = fig.querySelector("img");
    if (!img || MI.calm || !window.OGL || glCount >= GL_MAX || !supportsGL()) { if (opts.fallback !== false) MI.dotsReveal(fig, opts.delay); return null; }
    const start = function () {
      let renderer;
      try {
        const canvas = document.createElement("canvas");
        canvas.className = "gl"; canvas.setAttribute("aria-hidden", "true");
        renderer = new OGL.Renderer({ canvas: canvas, dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: false, antialias: false });
        const gl = renderer.gl;
        if (!gl) throw new Error("no gl");
        const texture = new OGL.Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR });
        texture.image = img;
        const dpr = renderer.dpr;
        const uniforms = {
          tMap: { value: texture }, uRes: { value: [1, 1] }, uImg: { value: [img.naturalWidth || 1, img.naturalHeight || 1] },
          uProg: { value: opts.startProg || 0 }, uMouse: { value: [0.5, 0.5] }, uHover: { value: 0 }, uLens: { value: 90 * dpr },
          uCell: { value: 6.5 * dpr }, uInk: { value: [23 / 255, 20 / 255, 15 / 255] }, uPaper: { value: [239 / 255, 235 / 255, 223 / 255] }
        };
        const program = new OGL.Program(gl, { vertex: VERT, fragment: FRAG, uniforms: uniforms });
        const mesh = new OGL.Mesh(gl, { geometry: new OGL.Triangle(gl), program: program });
        fig.appendChild(canvas);
        glCount++;
        let raf = 0, active = false;
        const render = function () { renderer.render({ scene: mesh }); };
        const loop = function () { render(); raf = active ? requestAnimationFrame(loop) : 0; };
        const wake = function () { if (!raf) { active = true; raf = requestAnimationFrame(loop); } };
        const sleep = function () { active = false; };
        const resize = function () {
          const r = fig.getBoundingClientRect();
          if (!r.width || !r.height) return;
          renderer.setSize(r.width, r.height);
          uniforms.uRes.value = [r.width * renderer.dpr, r.height * renderer.dpr];
          render();
        };
        if (window.ResizeObserver) new ResizeObserver(resize).observe(fig); else window.addEventListener("resize", resize);
        resize();
        fig.classList.add("has-gl");
        const state = { tween: null };
        const api = {
          reveal: function (delay) {
            if (state.tween) state.tween.kill();
            wake();
            state.tween = gsap.to(uniforms.uProg, { value: 1, duration: opts.duration || 1.8, delay: delay || 0, ease: "power2.inOut", onComplete: function () { if (uniforms.uHover.value <= 0.001) sleep(); } });
          },
          set: function (v) { uniforms.uProg.value = v; render(); }
        };
        if (window.matchMedia("(hover: hover)").matches) {
          fig.addEventListener("pointermove", function (e) {
            const r = fig.getBoundingClientRect();
            uniforms.uMouse.value = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
            wake();
          });
          fig.addEventListener("pointerenter", function () { wake(); gsap.to(uniforms.uHover, { value: 1, duration: 0.45, ease: "power2.out" }); });
          fig.addEventListener("pointerleave", function () { gsap.to(uniforms.uHover, { value: 0, duration: 0.45, ease: "power2.out", onComplete: function () { if (uniforms.uProg.value >= 1) sleep(); } }); });
        }
        fig.__mi = api;
        if (opts.auto !== false && window.ScrollTrigger) {
          ScrollTrigger.create({ trigger: fig, start: "top 88%", once: true, onEnter: function () { api.reveal(opts.delay); } });
        }
        return api;
      } catch (e) {
        if (renderer && renderer.gl && renderer.gl.canvas) renderer.gl.canvas.remove();
        fig.classList.remove("has-gl");
        MI.dotsReveal(fig, opts.delay);
        return null;
      }
    };
    if (img.complete && img.naturalWidth) return start();
    img.addEventListener("load", start, { once: true });
    return null;
  };
})();
