/*
 * Вариант 5 — «фишки» страниц. Один язык на весь вариант: латунный блик,
 * мягкий свет и плавный счёт — как шёлк на фоне.
 *   · блик проходит по главному заголовку страницы;
 *   · крупные числа досчитываются, когда попадают в кадр;
 *   · белые карточки подсвечиваются под курсором, карточки специалистов наклоняются;
 *   · переключатель «Врач / Эстетист» — бегунок, цены перекатываются;
 *   · поиск в каталоге подсказывает названия процедур «машинкой»;
 *   · на месте фото — монограмма по первой букве имени;
 *   · сравнение цен врача и эстетиста по любой процедуре с двумя ценами;
 *   · копирование адреса, маршрут, шаги будущей онлайн-записи.
 * При prefers-reduced-motion остаётся только полезное: без анимаций.
 */
(function () {
  'use strict';

  var TK = window.TK;
  if (!TK) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function onView(els, fn, threshold) {
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); fn(e.target); }
      });
    }, { threshold: threshold || 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Блик по заголовку ---------- */
  if (!reduce) {
    $$('.s-hero__title, .page-head .s-title').forEach(function (h) {
      h.setAttribute('data-text', h.textContent.replace(/\s+/g, ' ').trim());
      h.classList.add('sheen5');
    });
  }

  /* ---------- Досчёт крупных чисел ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var dur = 1100 + Math.min(target, 80) * 8;
    var t0 = null;
    function step(now) {
      if (t0 === null) t0 = now;
      var k = Math.min(1, (now - t0) / dur);
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!reduce) {
    var nums = $$('.s-hero__facts dt, .levels5__big, .master__count .big').filter(function (el) {
      var n = parseInt(el.textContent.replace(/\s/g, ''), 10);
      if (!n) return false;
      el.setAttribute('data-target', n);
      el.textContent = '0';
      return true;
    });
    onView(nums, countUp, 0.6);
  }

  /* ---------- Свет под курсором на белых карточках ---------- */
  var GLOW = '.card, .device-card, .card5, .master';
  if (fine && !reduce) {
    document.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest(GLOW);
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------- Наклон карточек специалистов ----------
     Карточка догоняет курсор с инерцией (сглаживание каждый кадр),
     а после ухода курсора так же мягко возвращается в покой. */
  if (fine && !reduce) {
    $$('.person5').forEach(function (card) {
      var s = { x: 0, y: 0, h: 0, tx: 0, ty: 0, th: 0 };
      var raf = 0;
      function frame() {
        s.x += (s.tx - s.x) * 0.075;
        s.y += (s.ty - s.y) * 0.075;
        s.h += (s.th - s.h) * 0.06;
        card.style.transform = 'perspective(1200px) rotateX(' + (-s.y * 7).toFixed(3) + 'deg) rotateY(' +
          (s.x * 9).toFixed(3) + 'deg) translateY(' + (-4 * s.h).toFixed(2) + 'px)';
        var rest = !s.th && Math.abs(s.x) < 0.002 && Math.abs(s.y) < 0.002 && s.h < 0.01;
        if (rest) {
          raf = 0;
          card.classList.remove('is-tilt');
          card.style.transform = '';
          return;
        }
        raf = requestAnimationFrame(frame);
      }
      function run() {
        card.classList.add('is-tilt');
        if (!raf) raf = requestAnimationFrame(frame);
      }
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        s.tx = (e.clientX - r.left) / r.width - 0.5;
        s.ty = (e.clientY - r.top) / r.height - 0.5;
        s.th = 1;
        run();
      });
      card.addEventListener('pointerleave', function () {
        s.tx = 0;
        s.ty = 0;
        s.th = 0;
        run();
      });
    });
  }

  /* ---------- Монограммы вместо фото ---------- */
  $$('.master, .person5').forEach(function (m) {
    var name = $('.master__name, h3', m);
    var media = $('.ghost-media', m);
    if (!name || !media || $('.mono5', media)) return;
    media.classList.add('has-mono');
    media.insertAdjacentHTML('afterbegin', '<b class="mono5" aria-hidden="true">' + esc(name.textContent.trim().charAt(0)) + '</b>');
  });

  /* ---------- Переключатель «Обе / Врач / Эстетист» на главной ---------- */
  var sw = $('[data-switch]');
  if (sw) {
    var thumb = document.createElement('span');
    thumb.className = 'switch5__thumb';
    thumb.setAttribute('aria-hidden', 'true');
    sw.insertBefore(thumb, sw.firstChild);
    sw.classList.add('has-thumb');
    var placeThumb = function () {
      var b = $('[aria-pressed="true"]', sw);
      if (!b) return;
      thumb.style.width = b.offsetWidth + 'px';
      thumb.style.transform = 'translateX(' + (b.offsetLeft - 4) + 'px)';
    };
    placeThumb();
    if (document.fonts) document.fonts.ready.then(placeThumb);
    addEventListener('resize', placeThumb);
    sw.addEventListener('click', function (e) {
      var b = e.target.closest('[data-level]');
      if (!b) return;
      placeThumb();
      if (reduce) return;
      var lvl = b.getAttribute('data-level');
      var sel = lvl === 'all' ? '.dual5 .p' : '.dual5 .p--' + lvl;
      $$(sel).forEach(function (p, i) {
        p.classList.remove('price-swap');
        void p.offsetWidth;
        p.style.setProperty('--i', i % 16);
        p.classList.add('price-swap');
      });
    });
  }

  /* ---------- Поиск в каталоге подсказывает процедуры ---------- */
  var search = $('[data-search]');
  if (search && !reduce) {
    var base = search.getAttribute('placeholder');
    var pool = TK.procedures
      .map(function (p) { return p.name; })
      .filter(function (n) { return n.length <= 26; });
    pool.sort(function () { return Math.random() - 0.5; });
    var qi = 0, ci = 0, dir = 1, timer = null;
    var typeTick = function () {
      if (document.activeElement === search || search.value) {
        search.setAttribute('placeholder', base);
        timer = setTimeout(typeTick, 1200);
        return;
      }
      var word = pool[qi % pool.length];
      ci += dir;
      search.setAttribute('placeholder', 'Например: ' + word.slice(0, ci) + (dir > 0 ? '▏' : ''));
      var wait = dir > 0 ? 60 : 28;
      if (dir > 0 && ci >= word.length) { dir = -1; wait = 1600; }
      else if (dir < 0 && ci <= 0) { dir = 1; qi++; wait = 400; }
      timer = setTimeout(typeTick, wait);
    };
    timer = setTimeout(typeTick, 1800);
  }

  /* ---------- Сравнение цен: врач и эстетист ---------- */
  var cmp = $('[data-cmp]');
  if (cmp) {
    var dual = TK.procedures.filter(function (p) { return p.d != null && p.e != null; });
    cmp.innerHTML =
      '<div class="cmp5__head">' +
        '<button type="button" class="cmp5__nav" data-cmp-step="-1" aria-label="Предыдущая процедура">' +
          '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg></button>' +
        '<label class="cmp5__pick"><span class="sr-only">Процедура</span><select data-cmp-select>' +
          dual.map(function (p, i) { return '<option value="' + i + '">' + esc(p.name) + '</option>'; }).join('') +
        '</select></label>' +
        '<button type="button" class="cmp5__nav" data-cmp-step="1" aria-label="Следующая процедура">' +
          '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg></button>' +
      '</div>' +
      '<div class="cmp5__row"><span class="cmp5__who">Врач-косметолог</span><span class="cmp5__bar"><b data-bar="d"></b></span><span class="cmp5__sum" data-sum="d"></span></div>' +
      '<div class="cmp5__row cmp5__row--e"><span class="cmp5__who">Эстетист</span><span class="cmp5__bar"><b data-bar="e"></b></span><span class="cmp5__sum" data-sum="e"></span></div>' +
      '<p class="cmp5__diff" data-diff aria-live="polite"></p>';
    var select = $('[data-cmp-select]', cmp);
    var showCmp = function (i) {
      var p = dual[i];
      var max = Math.max(p.d, p.e);
      var pre = p.from ? 'от ' : '';
      ['d', 'e'].forEach(function (l) {
        $('[data-bar="' + l + '"]', cmp).style.transform = 'scaleX(' + (p[l] / max) + ')';
        $('[data-sum="' + l + '"]', cmp).textContent = pre + fmt(p[l]) + ' ₽';
      });
      var diff = Math.abs(p.d - p.e);
      var text = diff === 0
        ? 'Цена одинаковая у обоих специалистов.'
        : (p.from ? 'Разница в начальной цене — ' : 'Разница — ') + fmt(diff) + ' ₽.';
      if (p.note) text += ' ' + p.note.charAt(0).toUpperCase() + p.note.slice(1) + '.';
      $('[data-diff]', cmp).textContent = text;
    };
    select.addEventListener('change', function () { showCmp(+select.value); });
    $$('[data-cmp-step]', cmp).forEach(function (b) {
      b.addEventListener('click', function () {
        var i = (+select.value + +b.getAttribute('data-cmp-step') + dual.length) % dual.length;
        select.value = i;
        showCmp(i);
      });
    });
    // Стартуем с процедуры, где разница заметнее всего
    var start = 0;
    dual.forEach(function (p, i) {
      if (Math.abs(p.d - p.e) > Math.abs(dual[start].d - dual[start].e)) start = i;
    });
    select.value = start;
    showCmp(start);
  }

  /* ---------- Адрес: копирование ---------- */
  $$('[data-copy]').forEach(function (b) {
    var label = b.textContent;
    b.addEventListener('click', function () {
      var text = b.getAttribute('data-copy');
      var done = function () {
        b.textContent = 'Адрес скопирован';
        b.classList.add('is-done');
        setTimeout(function () { b.textContent = label; b.classList.remove('is-done'); }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (err) { /* нет доступа к буферу */ }
        ta.remove();
      }
    });
  });

  /* ---------- Шаги будущей онлайн-записи ---------- */
  var steps = $$('[data-steps] li');
  if (steps.length && !reduce) {
    var si = 0;
    var tickSteps = function () {
      steps.forEach(function (li, k) {
        li.classList.toggle('is-on', k === si);
        li.classList.toggle('is-past', k < si);
      });
      si = (si + 1) % (steps.length + 1);
    };
    onView([steps[0].parentNode], function () {
      tickSteps();
      setInterval(tickSteps, 1400);
    }, 0.4);
  }
})();
