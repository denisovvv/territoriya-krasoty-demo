/*
 * Вариант «Движение» — «Сквозь букву».
 * Имя салона — дверь: прокрутка проводит сквозь штрих буквы «О» в сцену лица,
 * дальше каждую сцену ведёт сам скролл (GSAP + ScrollTrigger, scrub).
 * Без GSAP или при prefers-reduced-motion — статичная раскладка (.is-static6),
 * всё видно, ничего не закреплено.
 */
(function () {
  'use strict';

  var TK = window.TK;
  if (!TK) return;

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motion = !!(window.gsap && window.ScrollTrigger) && !reduce;
  if (motion) gsap.registerPlugin(ScrollTrigger);
  else root.classList.add('is-static6');

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
  var EXPO = 'expo.out';

  var P = TK.procedures;
  var dual = P.filter(function (p) { return p.d != null && p.e != null; });
  var stats = {
    total: P.length,
    both: dual.length,
    onlyd: P.filter(function (p) { return p.d != null && p.e == null; }).length,
    onlye: P.filter(function (p) { return p.d == null && p.e != null; }).length,
    devices: TK.devices.length,
  };
  $$('[data-count-total]').forEach(function (n) { n.textContent = stats.total; });
  $$('[data-count-both]').forEach(function (n) { n.textContent = stats.both; });
  $$('[data-count-onlyd]').forEach(function (n) { n.textContent = stats.onlyd; });
  $$('[data-count-onlye]').forEach(function (n) { n.textContent = stats.onlye; });
  $$('[data-count-devices]').forEach(function (n) { n.textContent = stats.devices + ' ' + plural(stats.devices, ['аппарат', 'аппарата', 'аппаратов']); });

  /* ======================================================================
     Общее для всех страниц варианта
     ====================================================================== */

  // Занавес между страницами: уходит вверх при загрузке, поднимается снизу при переходе
  var curtain = $('.curtain6');
  var PAGES = /^(index|uslugi|mastera|kontakty)\.html(\?[^#]*)?(#.*)?$/;
  function openCurtain() {
    if (!curtain) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { root.classList.add('curtain-out'); });
    });
  }
  if (root.classList.contains('from6')) openCurtain();
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      root.classList.remove('curtain-in');
      root.classList.add('curtain-out');
    }
  });
  if (!reduce) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
      var href = a.getAttribute('href');
      if (!PAGES.test(href)) return;
      var here = location.pathname.split('/').pop() || 'index.html';
      if (href.split(/[?#]/)[0] === here && href.indexOf('#') !== -1) return;
      e.preventDefault();
      try { sessionStorage.setItem('c6', '1'); } catch (err) { /* без памяти вкладки — просто переход */ }
      // Занавес всегда въезжает снизу
      curtain.style.transition = 'none';
      curtain.style.transform = 'translateY(101%)';
      void curtain.offsetWidth;
      curtain.style.transition = '';
      curtain.style.transform = '';
      root.classList.remove('curtain-out', 'from6');
      root.classList.add('curtain-in');
      setTimeout(function () { location.href = href; }, 560);
    });
  }

  // Шапка берёт цвет сцены под собой: светлая на синем, синяя на белом
  var header = $('[data-h6]');
  var grounds = $$('[data-ground]');
  var progress = $('[data-progress]');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = header ? header.getBoundingClientRect().bottom - 30 : 50;
    var ground = 'navy';
    for (var i = 0; i < grounds.length; i++) {
      var r = grounds[i].getBoundingClientRect();
      if (r.top <= y && r.bottom > y) { ground = grounds[i].getAttribute('data-ground'); break; }
    }
    if (header) {
      header.classList.toggle('is-paper', ground === 'paper');
      header.classList.toggle('is-scrolled', scrollY > 10);
    }
    if (progress) {
      var h = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
    }
  }
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // Подъём слов из-под маски для заголовков [data-rise]
  function splitWords(el) {
    if (el.getAttribute('data-split')) return $$('.rise6 > span', el);
    var html = el.innerHTML.trim().split(/(\s+|<br\s*\/?>)/i).map(function (part) {
      if (!part || /^\s+$/.test(part)) return part ? ' ' : '';
      if (/^<br/i.test(part)) return '<br>';
      return '<span class="rise6"><span>' + part + '</span></span>';
    }).join('');
    el.innerHTML = html;
    el.setAttribute('data-split', '1');
    return $$('.rise6 > span', el);
  }
  if (motion) {
    $$('[data-rise]').forEach(function (el) {
      var words = splitWords(el);
      gsap.set(words, { yPercent: 110 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: function () {
          gsap.to(words, { yPercent: 0, duration: 1.2, ease: EXPO, stagger: 0.07 });
        },
      });
    });
  }

  // Появление карточек каталога и прочих списков по мере прокрутки
  function staggerIn(selector, container) {
    if (!motion || !container) return;
    var seen = new WeakSet();
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting && !seen.has(e.target); }).map(function (e) { return e.target; });
      if (!batch.length) return;
      batch.forEach(function (el) { seen.add(el); io.unobserve(el); });
      gsap.fromTo(batch, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: EXPO, stagger: 0.06, clearProps: 'transform,opacity' });
    }, { rootMargin: '0px 0px -6% 0px' });
    function watch() {
      $$(selector, container).forEach(function (el) {
        if (seen.has(el)) return;
        gsap.set(el, { opacity: 0 });
        io.observe(el);
      });
    }
    watch();
    new MutationObserver(watch).observe(container, { childList: true, subtree: true });
  }
  staggerIn('.card, .device-card, .group-title', $('main'));

  // Магнитная кнопка
  if (motion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('[data-magnet]').forEach(function (btn) {
      var qx = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'power3.out' });
      var qy = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'power3.out' });
      btn.parentNode.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        var near = Math.hypot(dx, dy) < Math.max(r.width, 160);
        qx(near ? dx * 0.35 : 0);
        qy(near ? dy * 0.35 : 0);
      });
      btn.parentNode.addEventListener('pointerleave', function () { qx(0); qy(0); });
    });
  }

  if (document.body.getAttribute('data-page') !== 'home6') {
    if (motion) {
      window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    }
    return;
  }

  /* ======================================================================
     Главная
     ====================================================================== */

  var MARKS = window.TK_MARKS;
  var zoneCount = window.TK_zoneCount;

  // ---------- Контент сцен ----------

  // Зоны: подписи-ссылки
  ['face', 'body'].forEach(function (plate) {
    var list = $('[data-zones6="' + plate + '"]');
    list.innerHTML = TK.zones[plate].map(function (z) {
      var n = zoneCount(z.id);
      return '<li data-zone6="' + z.id + '"><a href="uslugi.html?zone=' + z.id + '">' +
        '<b>' + esc(z.name) + (z.id === 'back' ? ' <small>со спины</small>' : '') + '</b>' +
        '<span>' + n + ' ' + plural(n, PROC) + '</span></a></li>';
    }).join('');
  });

  // Разделы
  function minPrice(list) {
    var m = Infinity;
    list.forEach(function (p) {
      if (p.d != null) m = Math.min(m, p.d);
      if (p.e != null) m = Math.min(m, p.e);
    });
    return m;
  }
  var PLATE = { face: 'лицо', body: 'тело', both: 'лицо и тело' };
  $('[data-run-track]').innerHTML = TK.categories.map(function (c) {
    var list = P.filter(function (p) { return p.cat === c.id; });
    return '<a class="run6__item" href="uslugi.html?cat=' + c.id + '">' +
      '<span class="run6__count">' + list.length + '</span>' +
      '<span class="run6__name">' + esc(c.name) + '</span>' +
      '<span class="run6__meta">от ' + fmt(minPrice(list)) + ' ₽ · ' + PLATE[c.plate] + '</span></a>';
  }).join('');

  // Двойные цены — два слоя одной таблицы
  function wipeRows(level) {
    return dual.map(function (p) {
      var pre = p.from ? 'от ' : '';
      return '<div class="wipe6__row"><span>' + esc(p.name) + '</span><b>' + pre + fmt(p[level]) + ' ₽</b>' +
        (level === 'e' ? '<i class="wipe6__alt">врач ' + pre + fmt(p.d) + ' ₽</i>' : '') + '</div>';
    }).join('');
  }
  $('[data-wipe-e]').innerHTML = '<p class="wipe6__cap">Эстетист</p><div class="wipe6__grid">' + wipeRows('e') + '</div>';
  $('[data-wipe-d]').innerHTML = '<p class="wipe6__cap">Врач-косметолог</p><div class="wipe6__grid">' + wipeRows('d') + '</div>';

  // Аппараты на кольце
  var flags = TK.devices.filter(function (d) { return d.flagship; });
  var ringEl = $('[data-ring-el]');
  ringEl.innerHTML = '<div class="ring6__orbit" aria-hidden="true"></div>' + flags.map(function (d, i) {
    return '<div class="ring6__item" data-ring-i="' + i + '">' +
      '<div class="ring6__ghost"><span>Фото аппарата — от&nbsp;салона</span></div>' +
      '<p class="ring6__iname">' + esc(d.name) + '</p>' +
      '<p class="ring6__imeta">' + esc(d.maker) + ' · ' + esc(d.country) + '</p>' +
      '<p class="ring6__iproc">' + esc(d.procedures) + '</p></div>';
  }).join('');
  $('[data-ring-list]').innerHTML = flags.map(function (d) {
    return '<li>' + esc(d.name) + ', ' + esc(d.maker) + ', ' + esc(d.country) + ': ' + esc(d.procedures) + '</li>';
  }).join('');
  var ringName = $('[data-ring-name]');
  var ringMeta = $('[data-ring-meta]');
  var ringProc = $('[data-ring-proc]');
  var ringShown = -1;
  function showRing(i) {
    if (i === ringShown) return;
    ringShown = i;
    var d = flags[i];
    ringName.textContent = d.name;
    ringMeta.textContent = d.maker + ' · ' + d.country + ' · ' + String(i + 1).padStart(2, '0') + ' / ' + String(flags.length).padStart(2, '0');
    ringProc.textContent = d.procedures;
    if (motion) {
      gsap.fromTo([ringName, ringMeta, ringProc], { y: 24, opacity: 0, filter: 'blur(6px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7, ease: EXPO, stagger: 0.05, overwrite: true });
    }
  }
  showRing(0);

  // Специалисты
  $('[data-team6-grid]').innerHTML = TK.specialists.map(function (s, i) {
    var n = P.filter(function (p) { return s.level === 'd' ? p.d != null : p.e != null; }).length;
    return '<article class="team6__card" data-speed="' + [0.14, -0.1, 0.06][i % 3] + '">' +
      '<span class="team6__mono" aria-hidden="true">' + esc(s.name.charAt(0)) + '</span>' +
      '<div class="team6__photo"><span>Фото — после согласия на&nbsp;публикацию</span></div>' +
      '<h3 class="team6__name">' + esc(s.name) + '</h3>' +
      '<p class="team6__role">' + esc(s.role) + '</p>' +
      '<p class="team6__focus">' + esc(s.focus) + '. ' + n + ' ' + plural(n, PROC) + ' из&nbsp;каталога.</p>' +
      '<a class="team6__link" href="uslugi.html?level=' + s.level + '">Процедуры и&nbsp;цены</a></article>';
  }).join('');

  /* ---------- Сцены на скролле ---------- */

  var mm = motion ? gsap.matchMedia() : null;

  // 1. Дверь: имя маской, пролёт сквозь штрих буквы «О»
  var door = $('[data-door]');
  var svg = $('[data-door-svg]');
  var t1 = $('[data-door-t1]');
  var t2 = $('[data-door-t2]');
  var zoomG = $('[data-door-zoom]');
  var doorRect = $('[data-door-rect]');
  var doorGeo = { x: 0, y: 0, scale: 200 };
  var demoBar = $('.demo-bar');

  function layoutDoor() {
    var stage = $('.door6__stage');
    var W = stage.clientWidth;
    var H = stage.clientHeight;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    doorRect.setAttribute('width', W);
    doorRect.setAttribute('height', H);
    var pad = Math.max(16, W * 0.035);
    [t1, t2].forEach(function (t) {
      t.setAttribute('font-size', 100);
      t.setAttribute('x', 0);
      t.setAttribute('y', 0);
    });
    var L = t1.getComputedTextLength() || 600;
    var fs = Math.min(100 * (W - pad * 2) / L, H * 0.3);
    var cap = fs * 0.7;
    var gap = fs * 0.2;
    // Первый экран виден за вычетом демо-плашки над сценой
    var bar = demoBar ? demoBar.offsetHeight : 0;
    root.style.setProperty('--demo-h', bar + 'px');
    var footH = W < 700 ? 190 : 150;
    var top = Math.max(96, (H - bar - footH - (cap * 2 + gap)) / 2 + 30);
    [t1, t2].forEach(function (t, i) {
      t.setAttribute('font-size', fs.toFixed(2));
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('x', (W / 2).toFixed(1));
      t.setAttribute('y', (top + cap + i * (cap + gap)).toFixed(1));
    });
    // Точка входа — середина левого штриха «О» (пятая буква слова «КРАСОТЫ»)
    var ext;
    try { ext = t2.getExtentOfChar(4); } catch (err) { ext = null; }
    var baseY = top + cap * 2 + gap;
    var midY = baseY - cap / 2;
    var px = ext ? ext.x + ext.width * 0.12 : W / 2;
    var stroke = fs * 0.08;
    try {
      var c = document.createElement('canvas');
      var cw = Math.ceil(ext.width) + 4;
      var ch = Math.ceil(fs * 1.3);
      c.width = cw;
      c.height = ch;
      var ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.font = fs + 'px "Tenor Sans"';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#000';
      ctx.fillText('О', 0, fs);
      var row = Math.round(fs - cap / 2);
      var data = ctx.getImageData(0, row, cw, 1).data;
      var s = -1, e = -1;
      for (var x = 0; x < cw; x++) {
        var on = data[x * 4 + 3] > 128;
        if (on && s < 0) s = x;
        if (!on && s >= 0) { e = x; break; }
      }
      if (s >= 0 && e > s) {
        px = ext.x + (s + e) / 2;
        stroke = e - s;
      }
    } catch (err) { /* остаёмся на приблизительной точке */ }
    doorGeo.x = px;
    doorGeo.y = midY;
    // Хватает, чтобы штрих закрыл экран; больше не надо — огромную маску Chrome перестаёт рисовать
    var reach = 2 * Math.max(px, W - px, midY, H - midY);
    doorGeo.scale = Math.min(64, Math.max(24, (reach * 1.1) / Math.max(stroke, 4)));
  }

  var fontsReady = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load('100px "Tenor Sans"', 'ТЕРРИТОРИЯ КРАСОТЫ'), document.fonts.ready])
    : Promise.resolve();

  fontsReady.then(function () {
    layoutDoor();
    root.classList.add('door-ready');
    if (!motion) {
      addEventListener('resize', layoutDoor);
      return;
    }

    // Появление: строки поднимаются
    var lines = $$('[data-door-line]');
    gsap.from(lines, { y: function () { return parseFloat(t1.getAttribute('font-size')) * 0.6; }, opacity: 0, duration: 1.6, ease: EXPO, stagger: 0.14, delay: 0.15 });
    gsap.from($$('[data-door-foot] > *'), { y: 20, opacity: 0, duration: 1.2, ease: EXPO, stagger: 0.08, delay: 0.7 });

    var doorTl = gsap.timeline({
      scrollTrigger: {
        trigger: door,
        start: 'top top',
        end: '+=220%',
        pin: '.door6__stage',
        scrub: 1,
        invalidateOnRefresh: true,
        onRefreshInit: layoutDoor,
        // В конце пролёта экран уже белый — шапка переключается на синий
        onUpdate: function (self) { door.setAttribute('data-ground', self.progress > 0.76 ? 'paper' : 'navy'); },
        // Сцена лица уже лежит под дверью: после пролёта дверь просто прячется
        onLeave: function () { $('.door6__stage').style.visibility = 'hidden'; },
        onEnterBack: function () { $('.door6__stage').style.visibility = ''; },
      },
    });
    doorTl
      .to('[data-door-foot]', { opacity: 0, y: -30, duration: 0.18, ease: 'none' }, 0)
      .fromTo(zoomG, { scale: 1 }, {
        scale: function () { return doorGeo.scale; },
        svgOrigin: function () { return doorGeo.x + ' ' + doorGeo.y; },
        ease: 'power2.in',
        duration: 1,
        immediateRender: false,
      }, 0.04)
      // Синие края растворяются — остаётся белая сцена лица
      .to(svg, { opacity: 0, ease: 'power1.in', duration: 0.28 }, 0.76)
      .fromTo('[data-behind] img', { opacity: 0, scale: 1.18 }, { opacity: 1, scale: 1, ease: 'power2.out', duration: 0.3 }, 0.8);

    buildBody();
    buildRun();
    buildWipe();
    buildRing();
    buildTeam();
    buildEnd();
    ScrollTrigger.refresh();
  });

  // 2. Лицо и тело
  function buildBody() {
    var sec = $('[data-body6]');
    var stage = $('.body6__stage');
    var fig = $('[data-body6-fig]');
    var lines = $('[data-body6-lines]');
    var word = $('[data-body6-word]');
    var NS = 'http://www.w3.org/2000/svg';
    var plates = { face: $('[data-plate6="face"]'), body: $('[data-plate6="body"]') };
    // Геометрия изображения внутри поля 400×520 — как в атласе (MARKS)
    var geo = { face: { x: 0, y: 58, w: 400, h: 404 }, body: { x: 24, y: 0, w: 352, h: 520 } };

    var items = {};
    ['face', 'body'].forEach(function (plate) {
      items[plate] = $$('[data-zones6="' + plate + '"] li').map(function (li) {
        var id = li.getAttribute('data-zone6');
        var path = document.createElementNS(NS, 'path');
        path.setAttribute('class', 'body6__leader body6__leader--' + plate);
        path.setAttribute('pathLength', '1');
        var dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('class', 'body6__dot body6__dot--' + plate);
        dot.setAttribute('r', '5');
        lines.appendChild(path);
        lines.appendChild(dot);
        var sideKey = MARKS[plate][id][0] < 200 ? 'l' : 'r';
        li.classList.add('is-' + sideKey);
        return { id: id, li: li, path: path, dot: dot, side: sideKey };
      });
    });

    function layoutBody() {
      var sr = stage.getBoundingClientRect();
      var fr = fig.getBoundingClientRect();
      lines.setAttribute('viewBox', '0 0 ' + sr.width + ' ' + sr.height);
      var compact = sr.width < 900;
      stage.classList.toggle('is-compact', compact);
      ['face', 'body'].forEach(function (plate) {
        var pr = plates[plate].getBoundingClientRect();
        var sideY = { l: [], r: [] };
        items[plate].forEach(function (it) {
          var m = MARKS[plate][it.id];
          var x = pr.left - sr.left + (m[0] / 400) * pr.width;
          var y = pr.top - sr.top + (m[1] / 520) * pr.height;
          it.pt = [x, y];
          it.dot.setAttribute('cx', x.toFixed(1));
          it.dot.setAttribute('cy', y.toFixed(1));
          sideY[it.side].push(it);
        });
        if (compact) {
          items[plate].forEach(function (it) {
            it.li.style.left = '';
            it.li.style.top = '';
            it.path.setAttribute('d', '');
          });
          return;
        }
        var colW = Math.min(300, (sr.width - fr.width) / 2 - 90);
        // Слева подписи не заходят под заголовок сцены, справа — под шапку
        var headR = $('.body6__head').getBoundingClientRect();
        var floor = { l: headR.bottom - sr.top + 40, r: 120 };
        ['l', 'r'].forEach(function (side) {
          var list = sideY[side].sort(function (a, b) { return a.pt[1] - b.pt[1]; });
          var ys = list.map(function (it) { return it.pt[1]; });
          if (ys.length) ys[0] = Math.max(ys[0], floor[side]);
          // Подписи не наезжают: шаг — реальная высота предыдущей подписи плюс воздух
          for (var i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + list[i - 1].li.offsetHeight + 16);
          var over = ys.length ? ys[ys.length - 1] - (sr.height - 60) : 0;
          if (over > 0) ys = ys.map(function (y) { return y - over; });
          list.forEach(function (it, i) {
            var y = ys[i];
            var lx = side === 'l' ? fr.left - sr.left - 60 - colW : fr.right - sr.left + 60;
            it.li.style.left = lx.toFixed(1) + 'px';
            it.li.style.top = (y - 22).toFixed(1) + 'px';
            it.li.style.width = colW + 'px';
            var ax = side === 'l' ? lx + colW + 14 : lx - 14;
            var ex = side === 'l' ? fr.left - sr.left - 20 : fr.right - sr.left + 20;
            it.path.setAttribute('d', 'M' + ax.toFixed(1) + ' ' + y.toFixed(1) + ' H' + ex.toFixed(1) + ' L' + it.pt[0].toFixed(1) + ' ' + it.pt[1].toFixed(1));
          });
        });
      });
    }

    var tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: {
        trigger: sec,
        start: 'top top',
        end: '+=420%',
        pin: stage,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onRefresh: layoutBody,
      },
    });
    // На узком экране подписи стоят сеткой — боковой сдвиг им не нужен
    function side(it) {
      return function () { return stage.classList.contains('is-compact') ? 0 : (it.side === 'l' ? -40 : 40); };
    }
    // Лицо уже на месте — его «передал» пролёт сквозь букву
    tl.from('.body6__head > *', { y: 30, opacity: 0, stagger: 0.05, duration: 0.3 }, 0);
    items.face.forEach(function (it, i) {
      var at = 0.15 + i * 0.16;
      tl.fromTo(it.path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3, ease: 'none' }, at)
        .fromTo(it.dot, { scale: 0, transformOrigin: 'center' }, { scale: 1, duration: 0.14 }, at + 0.2)
        .fromTo(it.li, { x: side(it), autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.25 }, at + 0.12);
    });
    var swap = 0.15 + items.face.length * 0.16 + 0.4;
    tl.to(items.face.map(function (it) { return it.li; }), { autoAlpha: 0, x: 0, duration: 0.2, stagger: 0.02 }, swap)
      .to(items.face.map(function (it) { return it.path; }), { strokeDashoffset: -1, duration: 0.25, ease: 'none' }, swap)
      .to(items.face.map(function (it) { return it.dot; }), { scale: 0, duration: 0.15 }, swap + 0.1)
      .to(plates.face, { yPercent: -12, opacity: 0, duration: 0.35, ease: 'power2.in' }, swap + 0.05)
      .to(word, { yPercent: -110, duration: 0.2, ease: 'power2.in' }, swap + 0.1)
      .fromTo(word, { yPercent: 110 }, { yPercent: 0, duration: 0.25, immediateRender: false }, swap + 0.31)
      .fromTo(plates.body, { clipPath: 'inset(100% 0% 0% 0%)', opacity: 1 }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power2.inOut', immediateRender: false }, swap + 0.3);
    var at = swap + 0.85 - 0.18;
    var front = $('.body6__front');
    var back = $('.body6__back');
    items.body.forEach(function (it, i) {
      // После «Спины» фигура дольше стоит спиной, прежде чем повернуться обратно
      at += (i > 0 && items.body[i - 1].id === 'back') ? 0.5 : 0.18;
      if (it.id === 'back') {
        tl.to(front, { scaleX: 0, duration: 0.12, ease: 'power2.in' }, at - 0.1)
          .fromTo(back, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.14, ease: 'power2.out', immediateRender: false }, at + 0.02);
      }
      if (i > 0 && items.body[i - 1].id === 'back') {
        tl.to(back, { scaleX: 0, duration: 0.12, ease: 'power2.in' }, at - 0.1)
          .to(front, { scaleX: 1, duration: 0.14, ease: 'power2.out' }, at + 0.02);
      }
      tl.fromTo(it.path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3, ease: 'none' }, at)
        .fromTo(it.dot, { scale: 0, transformOrigin: 'center' }, { scale: 1, duration: 0.14 }, at + 0.2)
        .fromTo(it.li, { x: side(it), autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.25 }, at + 0.12);
    });
    tl.to({}, { duration: 0.5 });
    // Подпись меняется и при прокрутке назад
    tl.eventCallback('onUpdate', function () {
      var t = tl.time();
      var want = t >= swap + 0.3 ? 'Тело' : 'Лицо';
      if (word.textContent !== want) word.textContent = want;
    });
    layoutBody();
  }

  // 3. Разделы — горизонтальный бег
  function buildRun() {
    var sec = $('[data-run]');
    var track = $('[data-run-track]');
    var bar = $('[data-run-bar]');
    var skew = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3.out' });
    function dist() { return Math.max(0, track.scrollWidth - innerWidth + Math.max(16, innerWidth * 0.04)); }
    gsap.to(track, {
      x: function () { return -dist(); },
      ease: 'none',
      scrollTrigger: {
        trigger: sec,
        start: 'top top',
        end: function () { return '+=' + dist(); },
        pin: '.run6__stage',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          bar.style.transform = 'scaleX(' + self.progress + ')';
          skew(gsap.utils.clamp(-7, 7, self.getVelocity() / -300));
        },
        onLeave: function () { skew(0); },
        onLeaveBack: function () { skew(0); },
      },
    });
  }

  // 4. Шторка цен
  function buildWipe() {
    var sec = $('[data-wipe]');
    var layerD = $('[data-wipe-d]');
    var edge = $('[data-wipe-edge]');
    var table = $('[data-wipe-table]');
    var state = { p: 0 };
    function paint() {
      var h = table.clientHeight;
      layerD.style.clipPath = 'inset(0 0 ' + ((1 - state.p) * 100).toFixed(2) + '% 0)';
      edge.style.transform = 'translateY(' + (state.p * h).toFixed(1) + 'px)';
      edge.classList.toggle('is-end', state.p > 0.97);
      edge.classList.toggle('is-start', state.p < 0.03);
    }
    mm.add({ wide: '(min-width: 900px)', narrow: '(max-width: 899.98px)' }, function (ctx) {
      var wide = ctx.conditions.wide;
      gsap.fromTo(state, { p: 0 }, {
        p: 1,
        ease: 'none',
        onUpdate: paint,
        scrollTrigger: wide
          ? { trigger: sec, start: 'top top', end: '+=160%', pin: '.wipe6__stage', scrub: 0.7, invalidateOnRefresh: true }
          : { trigger: table, start: 'top 70%', end: 'bottom 35%', scrub: 0.7, invalidateOnRefresh: true },
      });
    });
    paint();
  }

  // 5. Кольцо аппаратов
  function buildRing() {
    var sec = $('[data-ring]');
    var ring = $('[data-ring-el]');
    var itemsEl = $$('.ring6__item', ring);
    var n = itemsEl.length;
    var step = 360 / n;
    var R = 0;
    function layoutRing() {
      var w = itemsEl[0].offsetWidth || 280;
      R = Math.round((w / 2) / Math.tan(Math.PI / n) * 1.32);
      itemsEl.forEach(function (el, i) {
        el.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + R + 'px)';
      });
      ring.style.setProperty('--r', R + 'px');
    }
    layoutRing();
    var st = { a: 0 };
    function paintRing() {
      ring.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + (-st.a) + 'deg)';
      itemsEl.forEach(function (el, i) {
        var d = ((i * step - st.a) % 360 + 540) % 360 - 180;
        var k = Math.cos(d * Math.PI / 180);
        el.style.opacity = (0.18 + 0.82 * Math.max(0, k)).toFixed(3);
        el.classList.toggle('is-front', Math.abs(d) < step / 2);
      });
      showRing(((Math.round(st.a / step) % n) + n) % n);
    }
    gsap.to(st, {
      a: step * (n - 1),
      ease: 'none',
      onUpdate: paintRing,
      scrollTrigger: {
        trigger: sec,
        start: 'top top',
        end: '+=' + (n * 55) + '%',
        pin: '.ring6__stage',
        scrub: 0.9,
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.2, max: 0.6 }, ease: 'power2.inOut' },
        invalidateOnRefresh: true,
        onRefreshInit: layoutRing,
      },
    });
    paintRing();
  }

  // 6. Специалисты — монограммы и карточки на разных скоростях
  function buildTeam() {
    $$('.team6__card').forEach(function (card) {
      var sp = parseFloat(card.getAttribute('data-speed')) || 0;
      gsap.fromTo(card, { yPercent: sp * 60 }, {
        yPercent: -sp * 60,
        ease: 'none',
        scrollTrigger: { trigger: '[data-team6]', start: 'top bottom', end: 'bottom top', scrub: true },
      });
      gsap.fromTo($('.team6__mono', card), { yPercent: 30 }, {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }

  // 7. Финал — адрес поднимается по буквам
  function buildEnd() {
    var addr = $('[data-end-addr]');
    var chars = [];
    $$('span', addr).forEach(function (span) {
      // Буквы внутри слова не разрываются переносом
      span.innerHTML = span.textContent.split(' ').map(function (word) {
        return '<span class="w6">' + word.split('').map(function (ch) {
          return '<i class="ch6"><i>' + esc(ch) + '</i></i>';
        }).join('') + '</span>';
      }).join(' ');
      chars = chars.concat($$('.ch6 > i', span));
    });
    gsap.fromTo(chars, { yPercent: 115 }, {
      yPercent: 0,
      ease: 'power3.out',
      stagger: 0.04,
      scrollTrigger: { trigger: '[data-end]', start: 'top 80%', end: 'top 20%', scrub: 0.8 },
    });
  }

  if (motion) window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
