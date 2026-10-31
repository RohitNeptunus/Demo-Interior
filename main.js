(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('header.site');

  // Sticky header shadow + back to top
  var top = document.querySelector('.totop');
  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle('scrolled', y > 40);
    if (top) top.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  // Mobile menu
  var burger = document.querySelector('.burger'), nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      nav.style.top = Math.max(0, header.getBoundingClientRect().bottom) + 'px';
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }
  document.querySelectorAll('li.has > .dd').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.parentElement.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // Hero slider
  var slides = document.querySelectorAll('.slide'), dots = document.querySelectorAll('.dots button'), label = document.querySelector('.slide-label');
  if (slides.length) {
    var i = 0, timer;
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('on', k === i); s.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      if (label) label.textContent = slides[i].getAttribute('data-label');
    }
    function play() { if (!reduce) { clearInterval(timer); timer = setInterval(function () { show(i + 1); }, 6000); } }
    dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); play(); }); });
    var prev = document.querySelector('.arrows .p'), next = document.querySelector('.arrows .n');
    if (prev) prev.addEventListener('click', function () { show(i - 1); play(); });
    if (next) next.addEventListener('click', function () { show(i + 1); play(); });
    var hero = document.querySelector('.hero');
    hero.addEventListener('mouseenter', function () { clearInterval(timer); });
    hero.addEventListener('mouseleave', play);
    show(0); play();
  }

  // Count-up numbers
  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count')), suf = el.getAttribute('data-suffix') || '', t0 = null;
    if (reduce) { el.textContent = end + suf; return; }
    function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1400); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }

  // Scroll reveal (only for elements below the first screen; anything scrolled past is shown too)
  var rvs = [];
  if (!reduce) {
    document.querySelectorAll('[data-rv]').forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('rv'); rvs.push(el); }
      else el.querySelectorAll('[data-count]').forEach(countUp);
    });
    var ticking = false;
    function check() {
      ticking = false;
      var lim = window.innerHeight * 0.92;
      rvs = rvs.filter(function (el) {
        if (el.getBoundingClientRect().top < lim) {
          el.classList.add('in');
          el.querySelectorAll('[data-count]').forEach(countUp);
          return false;
        }
        return true;
      });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(check); } }, { passive: true });
    window.addEventListener('resize', check); check();
  }

  // Before / after slider
  document.querySelectorAll('.ba').forEach(function (ba) {
    var r = ba.querySelector('input');
    function set(v) { ba.style.setProperty('--p', v + '%'); }
    r.addEventListener('input', function () { set(r.value); });
    set(r.value);
  });

  // Testimonials
  var ts = document.querySelectorAll('.tslide'), td = document.querySelectorAll('.tdots button');
  if (ts.length) {
    var j = 0, tt;
    function tshow(n) { j = (n + ts.length) % ts.length; ts.forEach(function (s, k) { s.classList.toggle('on', k === j); }); td.forEach(function (d, k) { d.setAttribute('aria-current', k === j ? 'true' : 'false'); }); }
    td.forEach(function (d, k) { d.addEventListener('click', function () { tshow(k); clearInterval(tt); }); });
    tshow(0); if (!reduce) tt = setInterval(function () { tshow(j + 1); }, 7000);
  }

  // Project filters
  var fb = document.querySelectorAll('.filters button');
  fb.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f');
      fb.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      document.querySelectorAll('.proj').forEach(function (p) { p.hidden = !(f === 'all' || p.getAttribute('data-cat') === f); });
    });
  });

  // Lightbox
  var lb = document.getElementById('lb');
  if (lb) {
    var lbImg = lb.querySelector('img'), lbT = lb.querySelector('b'), lbS = lb.querySelector('.s'), last;
    document.querySelectorAll('.proj').forEach(function (p) {
      p.addEventListener('click', function () {
        last = p; lbImg.src = p.querySelector('img').src; lbImg.alt = p.querySelector('img').alt;
        lbT.textContent = p.getAttribute('data-title'); lbS.textContent = p.getAttribute('data-meta');
        lb.classList.add('open'); lb.querySelector('.x').focus(); document.body.style.overflow = 'hidden';
      });
    });
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; if (last) last.focus(); }
    lb.querySelector('.x').addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
  }

  // Enquiry form -> WhatsApp
  var form = document.getElementById('enquiry');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      function need(id, msg, test) {
        var el = document.getElementById(id), er = document.getElementById(id + '-err');
        var v = el.value.trim(), bad = test ? !test(v) : !v;
        er.textContent = bad ? msg : ''; el.setAttribute('aria-invalid', bad ? 'true' : 'false'); if (bad) ok = false; return v;
      }
      var name = need('f-name', 'Please enter your name.');
      var phone = need('f-phone', 'Enter a valid 10-digit mobile number.', function (v) { return /^(\+?91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '')); });
      var type = need('f-type', 'Please choose a project type.');
      var c = document.getElementById('f-consent'), ce = document.getElementById('f-consent-err');
      if (!c.checked) { ce.textContent = 'Please tick to let us contact you.'; ok = false; } else ce.textContent = '';
      if (!ok) { var f = form.querySelector('[aria-invalid="true"]'); if (f) f.focus(); return; }
      var g = function (id) { return document.getElementById(id).value.trim(); };
      var lines = ['Hello GM Interior, I would like a site visit.', 'Name: ' + name, 'Phone: ' + phone, 'Project: ' + type + (g('f-size') ? ' (' + g('f-size') + ')' : '')];
      if (g('f-area')) lines.push('Location: ' + g('f-area'));
      if (g('f-budget')) lines.push('Budget: ' + g('f-budget'));
      if (g('f-when')) lines.push('Start: ' + g('f-when'));
      if (g('f-msg')) lines.push('Note: ' + g('f-msg'));
      document.getElementById('wa-send').href = 'https://wa.me/919819030355?text=' + encodeURIComponent(lines.join('\n'));
      var d = document.getElementById('done'); d.classList.add('show'); d.focus();
    });
  }
  var y = document.getElementById('yr'); if (y) y.textContent = new Date().getFullYear();
})();
