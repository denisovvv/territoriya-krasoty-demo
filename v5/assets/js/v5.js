/*
 * Вариант 5 — «Шёлк»: контент главной поверх WebGL-шёлка (silk.js).
 */
(function () {
  'use strict';

  var TK = window.TK;
  if (!TK) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function plural(n, f) {
    var a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return f[2];
    if (b > 1 && b < 5) return f[1];
    return b === 1 ? f[0] : f[2];
  }
  var PROC = ['процедура', 'процедуры', 'процедур'];

  // Шапка становится плотной при прокрутке
  var header = $('.site-header--clear');
  function onScroll() { header.classList.toggle('is-solid', scrollY > 40); }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Дальше — только главная; внутренние страницы рендерит общий app.js
  if (!$('[data-facts]')) return;

  var P = TK.procedures;
  var dual = P.filter(function (p) { return p.d != null && p.e != null; });
  var stats = {
    total: P.length,
    both: dual.length,
    onlyD: P.filter(function (p) { return p.d != null && p.e == null; }).length,
    onlyE: P.filter(function (p) { return p.d == null && p.e != null; }).length,
    atD: P.filter(function (p) { return p.d != null; }).length,
    atE: P.filter(function (p) { return p.e != null; }).length,
  };
  $$('[data-count]').forEach(function (n) { n.textContent = stats[n.getAttribute('data-count')]; });

  $('[data-facts]').innerHTML = [
    [stats.total, plural(stats.total, PROC)],
    [TK.categories.length, 'разделов'],
    [TK.devices.length, 'аппаратов'],
    [TK.specialists.length, 'специалиста'],
  ].map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + f[1] + '</dd></div>'; }).join('');

  function minPrice(list) {
    var m = Infinity;
    list.forEach(function (p) {
      if (p.d != null) m = Math.min(m, p.d);
      if (p.e != null) m = Math.min(m, p.e);
    });
    return m;
  }

  // Строка разделов под атласом
  $('[data-cats]').innerHTML = TK.categories.map(function (c) {
    var list = P.filter(function (p) { return p.cat === c.id; });
    return '<a class="cat5" href="uslugi.html?cat=' + c.id + '">' + esc(c.name) + '<span>' + list.length + '</span></a>';
  }).join('');

  // Двойные цены с переключателем
  var dualEl = $('[data-dual]');
  dualEl.innerHTML = dual.map(function (p) {
    var pre = p.from ? 'от ' : '';
    return '<li><span>' + esc(p.name) + '</span><span class="p p--d" title="Врач">' + pre + fmt(p.d) + ' ₽</span>' +
      '<span class="p p--e" title="Эстетист">' + pre + fmt(p.e) + ' ₽</span></li>';
  }).join('');
  var sw = $('[data-switch]');
  sw.addEventListener('click', function (e) {
    var b = e.target.closest('[data-level]');
    if (!b) return;
    $$('button', sw).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    dualEl.setAttribute('data-show', b.getAttribute('data-level'));
  });

  // Аппараты: закреплённая витрина, как в варианте 3 — активен аппарат в центре экрана
  var flags = TK.devices.filter(function (d) { return d.flagship; });
  $('[data-show-list]').innerHTML = flags.map(function (d, i) {
    return '<li class="show5__item" data-show="' + i + '"><h3>' + esc(d.name) + '</h3><p>' + esc(d.procedures) + '</p>' +
      (d.pending ? '<span class="ghost">' + esc(d.pending) + '</span>' : '') + '</li>';
  }).join('');
  var showName = $('[data-show-name]');
  var showMeta = $('[data-show-meta]');
  var showIdx = $('[data-show-idx]');
  var showBar = $('[data-show-bar]');
  $('[data-show-total]').textContent = '/ ' + String(flags.length).padStart(2, '0');
  var shown = -1;
  function setShow(i) {
    if (i === shown) return;
    shown = i;
    showName.textContent = flags[i].name;
    showMeta.textContent = flags[i].maker + ' · ' + flags[i].country;
    showIdx.textContent = String(i + 1).padStart(2, '0');
    showBar.style.transform = 'scaleX(' + (i + 1) / flags.length + ')';
    $$('.show5__item').forEach(function (el, k) { el.classList.toggle('is-on', k === i); });
    if (!reduce) {
      [showName, showMeta, showIdx].forEach(function (el) {
        el.classList.remove('is-swap');
        void el.offsetWidth;
        el.classList.add('is-swap');
      });
    }
  }
  setShow(0);
  if ('IntersectionObserver' in window) {
    var showIO = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) setShow(+e.target.getAttribute('data-show'));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    $$('.show5__item').forEach(function (el) { showIO.observe(el); });
  }

  // Специалисты
  $('[data-team]').innerHTML = TK.specialists.map(function (s) {
    var n = s.level === 'd' ? stats.atD : stats.atE;
    return '<article class="card5 person5" data-in><div class="ghost-media"><span>Фото — после согласия на публикацию</span></div>' +
      '<h3>' + esc(s.name) + '</h3><p class="person5__role">' + esc(s.role) + '</p>' +
      '<p>' + esc(s.focus) + '. ' + n + ' ' + plural(n, PROC) + ' из каталога.</p>' +
      '<a href="uslugi.html?level=' + s.level + '">Процедуры и цены ›</a></article>';
  }).join('');

  // Появление
  var els = $$('[data-in]');
  if (!('IntersectionObserver' in window) || reduce) {
    els.forEach(function (e) { e.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (e, i) {
    // Лёгкая лесенка для соседних карточек
    e.style.transitionDelay = (e.closest('.cards3, .devices5') ? (i % 3) * 80 : 0) + 'ms';
    io.observe(e);
  });
})();
