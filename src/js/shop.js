// Pictology order page: cart, theme chooser, Shopify-style checkout, purchase order.
(function () {
  var CFG = window.PICTOLOGY_SHOP || {};
  var KEY = "pictology-cart-v1";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return "$" + Number(n).toFixed(2); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  var cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || "[]") || []; } catch (e) { cart = []; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} }

  var products = {};
  $$(".prod").forEach(function (el) {
    var stock = el.dataset.stock ? parseInt(el.dataset.stock, 10) : null;
    products[el.dataset.id] = {
      id: el.dataset.id, name: el.dataset.name,
      price: el.dataset.price ? parseFloat(el.dataset.price) : null,
      pack: parseInt(el.dataset.pack || "1", 10), themes: el.dataset.themes, stock: stock,
      img: $("img", el).src
    };
    $(".add", el).addEventListener("click", function () {
      var p = products[el.dataset.id];
      if (p.themes) openChooser(p); else addLine(p, 1, [], "");
    });
  });

  // ---------- cart ----------
  function lineTotal(l) { return l.price == null ? 0 : l.price * l.qty; }
  function addLine(p, qty, mix, note) {
    var inCart = cart.filter(function (l) { return l.id === p.id; }).reduce(function (a, l) { return a + l.qty; }, 0);
    if (p.stock != null && inCart + qty > p.stock) { toast("Only " + p.stock + " available, and it’s already in your order."); return; }
    var same = cart.filter(function (l) { return l.id === p.id && JSON.stringify(l.mix) === JSON.stringify(mix) && l.note === note; })[0];
    if (same) same.qty += qty;
    else cart.push({ key: p.id + "-" + Date.now(), id: p.id, name: p.name, price: p.price, pack: p.pack, img: p.img, qty: qty, mix: mix, note: note, stock: p.stock });
    save(); render(); toast("Added to your order ✓");
  }
  function mixText(l) {
    if (!l.mix || !l.mix.length) return l.pack > 1 ? "Themes: Carole’s choice" : "";
    var picked = l.mix.filter(function (m) { return m.n > 0; });
    var per = picked.reduce(function (a, m) { return a + m.n; }, 0);
    var s = picked.map(function (m) { return m.n + " × " + m.theme; }).join(", ");
    var left = l.pack - per;
    if (left > 0) s += (s ? ", " : "") + left + " × Carole’s choice";
    return (l.pack > 1 ? "Per pack: " : "Theme: ") + s;
  }
  function render() {
    var n = cart.reduce(function (a, l) { return a + l.qty; }, 0);
    var sub = cart.reduce(function (a, l) { return a + lineTotal(l); }, 0);
    var hasQuote = cart.some(function (l) { return l.price == null; });
    $("#cartCount").textContent = n; $("#fabCount").textContent = n; $("#fabTotal").textContent = money(sub).replace(".00", "") + (hasQuote ? "+" : "");
    $("#cartSubtotal").textContent = money(sub); $("#quoteLine").hidden = !hasQuote;
    $("#toCheckout").disabled = !cart.length;
    $("#cartFab").classList.toggle("show", cart.length > 0);
    var box = $("#cartItems");
    if (!cart.length) { box.innerHTML = '<p class="empty">Nothing here yet. Add a card pack or an egg to get started.</p>'; return; }
    box.innerHTML = cart.map(function (l) {
      return '<div class="ci" data-k="' + l.key + '"><img src="' + esc(l.img) + '" alt=""><div class="ci-b"><b>' + esc(l.name) + '</b>' +
        (mixText(l) ? '<small>' + esc(mixText(l)) + '</small>' : '') + (l.note ? '<small>Note: ' + esc(l.note) + '</small>' : '') +
        '<div class="ci-row"><div class="qtys sm"><button type="button" data-d="-1" aria-label="Fewer">−</button><b>' + l.qty + '</b><button type="button" data-d="1" aria-label="More">+</button></div>' +
        '<span>' + (l.price == null ? "Quote" : money(lineTotal(l))) + '</span></div><button class="rm" type="button">Remove</button></div></div>';
    }).join("");
    $$(".ci", box).forEach(function (row) {
      var l = cart.filter(function (x) { return x.key === row.dataset.k; })[0];
      $$("[data-d]", row).forEach(function (b) { b.onclick = function () {
        var nq = l.qty + parseInt(b.dataset.d, 10);
        if (l.stock != null && nq > l.stock) { toast("Only " + l.stock + " available."); return; }
        l.qty = Math.max(1, nq); save(); render(); }; });
      $(".rm", row).onclick = function () { cart = cart.filter(function (x) { return x !== l; }); save(); render(); };
    });
  }

  // ---------- theme chooser ----------
  var cur = null, chQty = 1, mixCounts = {};
  function openChooser(p) {
    cur = p; chQty = 1; mixCounts = {};
    var themes = p.themes === "egg" ? CFG.eggThemes : CFG.cardThemes;
    $("#chTitle").textContent = p.name;
    $("#chSub").textContent = p.pack > 1
      ? "Mix and match " + p.pack + " per pack. Set how many of each theme you’d like, or leave some for Carole to choose."
      : "Pick the theme you’d like, or leave it to Carole.";
    $("#chThemes").innerHTML = themes.map(function (t, i) {
      return '<div class="th"><span>' + esc(t) + '</span><div class="qtys sm"><button type="button" data-t="' + i + '" data-v="-1" aria-label="Fewer ' + esc(t) + '">−</button><b id="th' + i + '">0</b><button type="button" data-t="' + i + '" data-v="1" aria-label="More ' + esc(t) + '">+</button></div></div>';
    }).join("");
    $$("#chThemes [data-t]").forEach(function (b) {
      b.onclick = function () {
        var i = b.dataset.t, t = themes[i], used = sumMix();
        var v = (mixCounts[t] || 0) + parseInt(b.dataset.v, 10);
        if (v < 0) return;
        if (parseInt(b.dataset.v, 10) > 0 && used >= p.pack) { if (p.pack === 1) { mixCounts = {}; v = 1; } else return; }
        mixCounts[t] = v; updChooser(themes);
      };
    });
    $("#chNote").value = ""; updChooser(themes);
    $("#chooser").hidden = false; document.body.classList.add("lock");
  }
  function sumMix() { return Object.keys(mixCounts).reduce(function (a, k) { return a + mixCounts[k]; }, 0); }
  function updChooser(themes) {
    themes.forEach(function (t, i) { var el = $("#th" + i); if (el) el.textContent = mixCounts[t] || 0; });
    $("#chQty").textContent = chQty;
    var left = cur.pack - sumMix();
    $("#chLeft").textContent = left > 0 ? (left === cur.pack ? (cur.pack > 1 ? "All " + cur.pack + " will be Carole’s choice" : "Carole’s choice") : left + " left for Carole to choose") : "Pack complete ✓";
    $("#chAdd").textContent = "Add to order" + (cur.price != null ? " · " + money(cur.price * chQty) : "");
  }
  $$("#chooser [data-q]").forEach(function (b) { b.onclick = function () { chQty = Math.max(1, chQty + parseInt(b.dataset.q, 10)); updChooser(cur.themes === "egg" ? CFG.eggThemes : CFG.cardThemes); }; });
  $("#chAdd").onclick = function () {
    var mix = Object.keys(mixCounts).filter(function (k) { return mixCounts[k] > 0; }).map(function (k) { return { theme: k, n: mixCounts[k] }; });
    addLine(cur, chQty, mix, $("#chNote").value.trim()); closeChooser();
  };
  function closeChooser() { $("#chooser").hidden = true; document.body.classList.remove("lock"); }
  $$("#chooser [data-close]").forEach(function (b) { b.onclick = closeChooser; });
  $("#chooser").addEventListener("click", function (e) { if (e.target.id === "chooser") closeChooser(); });

  // ---------- checkout ----------
  function openCheckout() {
    $("#coItems").innerHTML = cart.map(function (l) {
      return '<div class="co-it"><div class="co-th"><img src="' + esc(l.img) + '" alt=""><span>' + l.qty + '</span></div><div><b>' + esc(l.name) + '</b>' +
        (mixText(l) ? '<small>' + esc(mixText(l)) + '</small>' : '') + '</div><b>' + (l.price == null ? "Quote" : money(lineTotal(l))) + '</b></div>';
    }).join("");
    var sub = cart.reduce(function (a, l) { return a + lineTotal(l); }, 0);
    var q = cart.some(function (l) { return l.price == null; });
    $("#coSub").textContent = money(sub); $("#coTotal").textContent = money(sub) + (q ? " + quote" : "");
    $("#checkout").hidden = false; document.body.classList.add("lock"); window.scrollTo(0, 0);
  }
  $("#toCheckout").onclick = openCheckout;
  $("#cartFab").onclick = function () { if (window.innerWidth < 980) openCheckout(); else $("#cart").scrollIntoView({ behavior: "smooth" }); };
  $$("[data-close-co]").forEach(function (b) { b.onclick = function () { $("#checkout").hidden = true; document.body.classList.remove("lock"); }; });
  $$('input[name="delivery"]').forEach(function (r) { r.onchange = function () { $("#addr").hidden = r.value.indexOf("pickup") > -1 && r.checked; }; });

  $("#coForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, err = [];
    if (!f.name.value.trim()) err.push("your name");
    if (!/^\S+@\S+\.\S+$/.test(f.email.value.trim())) err.push("a valid email");
    var ship = f.delivery.value === "Ship to me";
    if (ship && (!f.address1.value.trim() || !f.city.value.trim() || !f.state.value.trim() || !f.zip.value.trim())) err.push("your shipping address");
    if (!f.agree.checked) err.push("the handmade note checkbox");
    if (err.length) { $("#coErr").textContent = "Please add " + err.join(", ") + "."; $("#coErr").hidden = false; return; }
    $("#coErr").hidden = true;
    buildPO(f);
  });

  // ---------- purchase order ----------
  function poNumber() {
    var d = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; };
    return "PIC-" + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  }
  function buildPO(f) {
    var no = poNumber(), date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    var sub = cart.reduce(function (a, l) { return a + lineTotal(l); }, 0);
    var q = cart.some(function (l) { return l.price == null; });
    var ship = f.delivery.value === "Ship to me";
    var addr = ship ? [f.address1.value, f.city.value + ", " + f.state.value + " " + f.zip.value].join("\n") : "Local pickup, Brattleboro, VT";
    var rows = cart.map(function (l, i) {
      return '<tr><td>' + (i + 1) + '</td><td><b>' + esc(l.name) + '</b>' + (mixText(l) ? '<br><small>' + esc(mixText(l)) + '</small>' : '') + (l.note ? '<br><small>Note: ' + esc(l.note) + '</small>' : '') +
        '</td><td>' + l.qty + '</td><td>' + (l.price == null ? "Quote" : money(l.price)) + '</td><td>' + (l.price == null ? "Quote" : money(lineTotal(l))) + '</td></tr>';
    }).join("");
    $("#po").innerHTML =
      '<div class="po-head"><div><div class="po-logo">Picto<span>logy</span></div><small>Hand-painted folk art by ' + esc(CFG.artist) + '<br>Brattleboro, Vermont · ' + esc(CFG.email) + '</small></div>' +
      '<div class="po-meta"><h2>Purchase Order</h2><div><span>PO #</span><b>' + no + '</b></div><div><span>Date</span><b>' + date + '</b></div><div><span>Status</span><b>Awaiting Carole’s confirmation</b></div></div></div>' +
      '<div class="po-parties"><div><h4>Ordered by</h4><p>' + esc(f.name.value) + (f.org.value ? '<br>' + esc(f.org.value) : '') + '<br>' + esc(f.email.value) + (f.phone.value ? '<br>' + esc(f.phone.value) : '') + '</p></div>' +
      '<div><h4>' + (ship ? "Ship to" : "Delivery") + '</h4><p>' + esc(addr).replace(/\n/g, "<br>") + '</p></div>' +
      '<div><h4>Details</h4><p>Payment: ' + esc(f.pay.value) + (f.needby.value ? '<br>Needed by: ' + esc(f.needby.value) : '') + '</p></div></div>' +
      '<table class="po-table"><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<div class="po-tot"><div><span>Subtotal</span><b>' + money(sub) + '</b></div>' + (q ? '<div><span>Items priced on request</span><b>Quote</b></div>' : '') +
      '<div><span>Shipping</span><b>To be confirmed</b></div><div class="grand"><span>Estimated total</span><b>' + money(sub) + (q ? " + quote" : "") + '</b></div></div>' +
      (f.notes.value ? '<div class="po-notes"><h4>Notes</h4><p>' + esc(f.notes.value).replace(/\n/g, "<br>") + '</p></div>' : '') +
      '<p class="po-fine">Every piece is hand drawn and hand painted, so each is one of a kind and may vary slightly from the photos. No payment has been taken. Carole will confirm availability, timing, shipping and the final total, then send payment details.</p>';
    // email text
    var lines = cart.map(function (l, i) {
      return (i + 1) + ". " + l.name + " × " + l.qty + " — " + (l.price == null ? "quote" : money(lineTotal(l))) + (mixText(l) ? "\n   " + mixText(l) : "") + (l.note ? "\n   Note: " + l.note : "");
    }).join("\n");
    var body = "Hi Carole!\n\nI’d like to place an order from your website.\n\n" +
      "PURCHASE ORDER " + no + " (" + date + ")\n\n" + lines + "\n\nSubtotal: " + money(sub) + (q ? " + items priced on request" : "") + "\nShipping: to be confirmed\n\n" +
      "Name: " + f.name.value + (f.org.value ? "\nOrganization: " + f.org.value : "") + "\nEmail: " + f.email.value + (f.phone.value ? "\nPhone: " + f.phone.value : "") +
      "\nDelivery: " + f.delivery.value + (ship ? "\n" + addr : "") + "\nPayment preference: " + f.pay.value + (f.needby.value ? "\nNeeded by: " + f.needby.value : "") +
      (f.notes.value ? "\n\nNotes: " + f.notes.value : "") + "\n\nI understand each piece is handmade and one of a kind.\n\nThank you!\n" + f.name.value;
    $("#poEmail").href = "mailto:" + CFG.email + "?subject=" + encodeURIComponent("Pictology order " + no + " from " + f.name.value) + "&body=" + encodeURIComponent(body);
    $("#poCopy").onclick = function () {
      var done = function () { toast("Order copied ✓"); };
      if (navigator.clipboard) navigator.clipboard.writeText(body).then(done, function () { fallbackCopy(body); done(); }); else { fallbackCopy(body); done(); }
    };
    $("#checkout").hidden = true; $("#poScreen").hidden = false; window.scrollTo(0, 0);
  }
  function fallbackCopy(t) { var a = document.createElement("textarea"); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); } catch (e) {} a.remove(); }
  $("#poPrint").onclick = function () { window.print(); };
  $("#poNew").onclick = function () {
    if (sent) { cart = []; save(); render(); sent = false; }
    $("#poScreen").hidden = true; document.body.classList.remove("lock");
  };
  var sent = false; $("#poEmail").addEventListener("click", function () { sent = true; });

  // ---------- toast ----------
  var tEl = document.createElement("div"); tEl.className = "toast"; document.body.appendChild(tEl); var tT;
  function toast(m) { tEl.textContent = m; tEl.classList.add("show"); clearTimeout(tT); tT = setTimeout(function () { tEl.classList.remove("show"); }, 2200); }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeChooser(); });

  render();
})();
