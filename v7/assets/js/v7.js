/*
 * Вариант «Воздух» — белый лист, одна тёмно-синяя краска, латунь в 1px.
 * Скрипт только наполняет главную данными и один раз, медленно, проявляет блоки.
 * Атлас зон рисует общий app.js (подсветка зоны при наведении на пункт списка).
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
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function plural(n, f) {
    var a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return f[2];
    if (b > 1 && b < 5) return f[1];
    return b === 1 ? f[0] : f[2];
  }
  var PROC = ['процедура', 'процедуры', 'процедур'];

  // Подвал общий — на белом ему нужен синий логотип
  var footLogo = $('.site-footer img');
  if (footLogo) footLogo.src = '../assets/img/logo-navy.svg';

  // Шапка отделяется тонкой линией, когда страница прокручена
  var header = $('.h7');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', scrollY > 8); }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Медленное проявление блоков — один раз
  var els = $$('[data-in7]');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    els.forEach(function (e) {
      // Всё, что уже в первом экране, проявляется сразу — без ожидания прокрутки
      if (e.getBoundingClientRect().top < innerHeight) {
        requestAnimationFrame(function () { e.classList.add('is-in'); });
        return;
      }
      io.observe(e);
    });
  }

  if (document.body.getAttribute('data-page') !== 'home7') return;

  var P = TK.procedures;
  var dual = P.filter(function (p) { return p.d != null && p.e != null; });
  var counts = {
    both: dual.length,
    onlyD: P.filter(function (p) { return p.d != null && p.e == null; }).length,
    onlyE: P.filter(function (p) { return p.d == null && p.e != null; }).length,
  };
  $$('[data-count7]').forEach(function (n) {
    var k = n.getAttribute('data-count7');
    n.textContent = k === 'both' ? counts.both : counts[k] + ' ' + plural(counts[k], PROC);
  });

  $('[data-facts7]').textContent = [
    P.length + ' ' + plural(P.length, PROC),
    TK.categories.length + ' разделов',
    TK.devices.length + ' аппаратов',
    TK.specialists.length + ' специалиста',
  ].join(' · ');

  // Две цены — две колонки
  $('[data-dual7]').innerHTML = dual.map(function (p) {
    var pre = p.from ? 'от ' : '';
    return '<tr><th scope="row">' + esc(p.name) + '</th>' +
      '<td>' + pre + fmt(p.d) + ' ₽</td><td>' + pre + fmt(p.e) + ' ₽</td></tr>';
  }).join('');

  // Указатель разделов
  function minPrice(list) {
    var m = Infinity;
    list.forEach(function (p) {
      if (p.d != null) m = Math.min(m, p.d);
      if (p.e != null) m = Math.min(m, p.e);
    });
    return m;
  }
  $('[data-index7]').innerHTML = TK.categories.map(function (c) {
    var list = P.filter(function (p) { return p.cat === c.id; });
    return '<li><a href="uslugi.html?cat=' + c.id + '">' +
      '<span class="index7__name">' + esc(c.name) + '</span>' +
      '<span class="index7__count">' + list.length + ' ' + plural(list.length, PROC) + '</span>' +
      '<span class="index7__from">от ' + fmt(minPrice(list)) + ' ₽</span>' +
      '<svg class="index7__arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>' +
      '</a></li>';
  }).join('');

  // Флагманские аппараты
  $('[data-dev7]').innerHTML = TK.devices.filter(function (d) { return d.flagship; }).map(function (d) {
    return '<li><a href="uslugi.html?tab=devices#' + d.id + '">' +
      '<span class="dev7__name">' + esc(d.name) + '</span>' +
      '<span class="dev7__meta">' + esc(d.maker) + ' · ' + esc(d.country) + '</span>' +
      '<span class="dev7__proc">' + esc(d.procedures) + '</span></a>' +
      (d.pending ? '<span class="ghost">' + esc(d.pending) + '</span>' : '') + '</li>';
  }).join('');

  // Специалисты
  $('[data-team7]').innerHTML = TK.specialists.map(function (s) {
    var n = P.filter(function (p) { return s.level === 'd' ? p.d != null : p.e != null; }).length;
    return '<article class="team7__person">' +
      '<div class="ghost-media team7__photo"><span>Фото — после согласия на&nbsp;публикацию</span></div>' +
      '<h3 class="team7__name">' + esc(s.name) + '</h3>' +
      '<p class="team7__role">' + esc(s.role) + '</p>' +
      '<p class="team7__focus">' + esc(s.focus) + '. ' + n + ' ' + plural(n, PROC) + ' из&nbsp;каталога.</p>' +
      '<a class="link7 link7--quiet" href="uslugi.html?level=' + s.level + '">Процедуры и&nbsp;цены</a></article>';
  }).join('');
})();
