// Falling pysanka eggs, like gentle snowflakes.
// Turned on/off from Site settings → "Falling eggs". Respects "reduce motion".
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var KEY = "pictology-eggs-off";
  var off = false;
  try { off = localStorage.getItem(KEY) === "1"; } catch (e) {}

  var EGG = "M32 3C18 3 9 22 9 38c0 13.5 10.3 23 23 23s23-9.5 23-23C55 22 46 3 32 3z";
  function svg(inner) {
    return "data:image/svg+xml;utf8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><clipPath id="c"><path d="' + EGG + '"/></clipPath></defs>' +
      '<g clip-path="url(#c)">' + inner + '</g><path d="' + EGG + '" fill="none" stroke="#1f1a17" stroke-width="2"/></svg>');
  }
  var zig = '<path d="M0 42L4 34L8 42L12 34L16 42L20 34L24 42L28 34L32 42L36 34L40 42L44 34L48 42L52 34L56 42L60 34L64 42Z" fill="#fff6e0"/>';
  var star = '<path d="M32 8l1.6 4.4L38 11l-3 3.6L38 18l-4.4-1.2L32 21l-1.6-4.2L26 18l3-3.4L26 11l4.4 1.4z" fill="#f2b630"/>';
  var designs = [
    // cranberry + saffron band + gold star (the site icon)
    svg('<rect width="64" height="64" fill="#c0392b"/><rect width="64" height="20" fill="#1f1a17"/><rect y="30" width="64" height="12" fill="#f2b630"/>' + zig + star),
    // cobalt with white stripes and dots
    svg('<rect width="64" height="64" fill="#24479a"/><rect y="22" width="64" height="4" fill="#fff6e0"/><rect y="40" width="64" height="4" fill="#fff6e0"/><circle cx="20" cy="33" r="3" fill="#f2b630"/><circle cx="32" cy="33" r="3" fill="#fff6e0"/><circle cx="44" cy="33" r="3" fill="#f2b630"/><circle cx="32" cy="12" r="4" fill="#fff6e0"/>'),
    // saffron with red sunburst
    svg('<rect width="64" height="64" fill="#f2b630"/><circle cx="32" cy="36" r="9" fill="#c0392b"/><g stroke="#c0392b" stroke-width="3">' +
      [0, 45, 90, 135].map(function (a) { return '<line x1="32" y1="36" x2="' + (32 + 18 * Math.cos(a * Math.PI / 180)) + '" y2="' + (36 + 18 * Math.sin(a * Math.PI / 180)) + '" transform="rotate(0)"/><line x1="32" y1="36" x2="' + (32 - 18 * Math.cos(a * Math.PI / 180)) + '" y2="' + (36 - 18 * Math.sin(a * Math.PI / 180)) + '"/>'; }).join("") +
      '</g><circle cx="32" cy="36" r="4" fill="#fff6e0"/>'),
    // black with red & white diamonds
    svg('<rect width="64" height="64" fill="#1f1a17"/><path d="M32 18L44 34L32 50L20 34Z" fill="#c0392b"/><path d="M32 26L38 34L32 42L26 34Z" fill="#fff6e0"/><rect y="12" width="64" height="3" fill="#f2b630"/><rect y="54" width="64" height="3" fill="#f2b630"/>'),
    // spruce green with cream wave
    svg('<rect width="64" height="64" fill="#1d5c4a"/><path d="M0 34 Q8 26 16 34 T32 34 T48 34 T64 34 V44 Q56 36 48 44 T32 44 T16 44 T0 44Z" fill="#fff6e0"/><circle cx="32" cy="16" r="5" fill="#f2b630"/><circle cx="32" cy="54" r="3" fill="#c0392b"/>')
  ];

  var layer = document.createElement("div");
  layer.className = "egg-snow";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  var btn = document.createElement("button");
  btn.className = "egg-toggle";
  btn.type = "button";
  document.body.appendChild(btn);

  var css = document.createElement("style");
  css.textContent =
    ".egg-snow{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:40;overflow:hidden}" +
    ".egg-snow .egg{position:absolute;top:-70px;will-change:transform}" +
    ".egg-snow img{display:block;width:100%;height:auto;filter:drop-shadow(0 3px 4px rgba(0,0,0,.18))}" +
    ".egg-toggle{position:fixed;right:14px;bottom:76px;z-index:98;border:0;border-radius:999px;background:rgba(255,255,255,.92);box-shadow:0 4px 14px rgba(0,0,0,.15);font:600 12px/1 -apple-system,system-ui,sans-serif;padding:9px 12px;cursor:pointer;color:#2b2622;-webkit-appearance:none}";
  document.head.appendChild(css);

  var MAX = window.innerWidth < 700 ? 9 : 16;
  var timer = null;

  function spawn() {
    if (document.hidden || layer.childElementCount >= MAX) return;
    var wrap = document.createElement("div");
    wrap.className = "egg";
    var img = document.createElement("img");
    img.src = designs[Math.floor(Math.random() * designs.length)];
    img.alt = "";
    var size = 18 + Math.random() * 16;                       // 18–34px
    var dur = (9 + Math.random() * 9) * 1000;                 // 9–18s to fall
    var drift = Math.random() * 120 - 60;
    var tilt0 = Math.random() * 30 - 15, tilt1 = tilt0 + (Math.random() * 40 - 20);
    var fall = (window.innerHeight || document.documentElement.clientHeight) + 140;
    wrap.style.width = size + "px";
    wrap.style.left = (Math.random() * 100).toFixed(1) + "%";
    wrap.style.opacity = (0.8 + Math.random() * 0.2).toFixed(2);
    wrap.appendChild(img);
    layer.appendChild(wrap);
    var done = function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); };
    if (wrap.animate) {
      var a = wrap.animate([
        { transform: "translate(0px,0px) rotate(" + tilt0 + "deg)" },
        { transform: "translate(" + drift + "px," + fall + "px) rotate(" + tilt1 + "deg)" }
      ], { duration: dur, easing: "linear", fill: "forwards" });
      a.onfinish = done;
      img.animate([{ transform: "translateX(-14px)" }, { transform: "translateX(14px)" }],
        { duration: 2500 + Math.random() * 2500, direction: "alternate", iterations: Infinity, easing: "ease-in-out" });
    } else {
      wrap.style.transition = "transform " + dur + "ms linear";
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        wrap.style.transform = "translate(" + drift + "px," + fall + "px) rotate(" + tilt1 + "deg)";
      }); });
      setTimeout(done, dur + 100);
    }
  }

  function start() {
    off = false; btn.textContent = "🥚 Pause eggs";
    if (!timer) { for (var i = 0; i < 4; i++) setTimeout(spawn, i * 500); timer = setInterval(spawn, 900); }
  }
  function stop() {
    off = true; btn.textContent = "🥚 Let it snow eggs";
    clearInterval(timer); timer = null; layer.innerHTML = "";
  }
  btn.addEventListener("click", function () {
    if (off) start(); else stop();
    try { localStorage.setItem(KEY, off ? "1" : "0"); } catch (e) {}
  });
  if (off) stop(); else start();
})();
