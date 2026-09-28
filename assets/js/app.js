(function () {
  'use strict';

  var TK = window.TK;
  var page = document.body.getAttribute('data-page');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Утилиты ---------- */

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function plural(n, forms) {
    var a = Math.abs(n) % 100;
    var b = a % 10;
    if (a > 10 && a < 20) return forms[2];
    if (b > 1 && b < 5) return forms[1];
    if (b === 1) return forms[0];
    return forms[2];
  }

  function priceHTML(p, level) {
    var v = p[level];
    if (v == null) return null;
    return (p.from ? '<small>от</small>' : '') + fmt(v) + ' ₽';
  }

  function norm(s) {
    return String(s).toLowerCase().replace(/ё/g, 'е');
  }

  var icons = {
    arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>',
    close: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8"/></svg>',
  };

  var P = TK.procedures;
  var catById = {};
  TK.categories.forEach(function (c) {
    catById[c.id] = c;
  });
  var zoneById = {};
  ['face', 'body'].forEach(function (plate) {
    TK.zones[plate].forEach(function (z) {
      zoneById[z.id] = { id: z.id, name: z.name, plate: plate };
    });
  });
  var deviceById = {};
  TK.devices.forEach(function (d) {
    deviceById[d.id] = d;
  });

  var stats = {
    total: P.length,
    onlyD: P.filter(function (p) { return p.d != null && p.e == null; }).length,
    onlyE: P.filter(function (p) { return p.d == null && p.e != null; }).length,
    both: P.filter(function (p) { return p.d != null && p.e != null; }).length,
    atD: P.filter(function (p) { return p.d != null; }).length,
    atE: P.filter(function (p) { return p.e != null; }).length,
    devices: TK.devices.length,
    people: TK.specialists.length,
  };

  function inZone(p, zone) {
    if (!zone) return true;
    if (zone === 'plate:face' || zone === 'plate:body') {
      var plate = zone.split(':')[1];
      return p.zones.some(function (z) { return zoneById[z] && zoneById[z].plate === plate; });
    }
    return p.zones.indexOf(zone) !== -1;
  }

  function zoneCount(zone) {
    return P.filter(function (p) { return inZone(p, zone); }).length;
  }

  function ghost(text) {
    return '<span class="ghost">' + esc(text || 'нужно от салона') + '</span>';
  }

  /* ---------- Общие элементы ---------- */

  function renderFooter() {
    var el = $('[data-footer]');
    if (!el) return;
    el.innerHTML =
      '<div class="wrap">' +
      '<div class="footer-grid">' +
      '<div class="footer-col"><img src="assets/img/logo-white.png" alt="Территория красоты" width="340" height="230" loading="lazy">' +
      '<p style="margin:20px 0 0;max-width:30ch">Медицинский салон косметологии. г.&nbsp;Старый Оскол, м-н&nbsp;Лесной,&nbsp;10</p></div>' +
      '<div class="footer-col"><h2>Разделы</h2><ul>' +
      '<li><a href="index.html">Главная</a></li><li><a href="uslugi.html">Услуги</a></li>' +
      '<li><a href="uslugi.html?tab=devices">Оборудование</a></li><li><a href="mastera.html">Мастера</a></li>' +
      '<li><a href="kontakty.html">Контакты</a></li></ul></div>' +
      '<div class="footer-col"><h2>Связь</h2><ul>' +
      '<li>Телефон: ' + ghost() + '</li><li>ВКонтакте: ' + ghost() + '</li><li>Мессенджеры: ' + ghost() + '</li></ul></div>' +
      '<div class="footer-col"><h2>Документы</h2><ul>' +
      '<li>' + ghost('Реквизиты организации') + '</li>' +
      '<li>' + ghost('Лицензия на мед. деятельность') + '</li>' +
      '<li>' + ghost('Политика обработки ПДн') + '</li>' +
      '<li>' + ghost('Согласие на обработку ПДн') + '</li></ul></div>' +
      '</div>' +
      '<div class="footer-legal">' +
      '<span class="warning">Имеются противопоказания. Необходима консультация специалиста</span>' +
      '<span>Текст предупреждения и юридические документы согласуются с юристом салона. Цены — прайс-листы от 9 января.</span>' +
      '</div></div>';
  }

  function initMenu() {
    var header = $('.site-header');
    var btn = $('.menu-toggle');
    if (!header || !btn) return;
    btn.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });
  }

  function initReveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      els.forEach(function (e) { e.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* Переключатель уровня: одна «рукоять» на всю страницу */
  function initLevelSwitch(root, initial, onChange) {
    if (!root) return;
    var thumb = $('.level-switch__thumb', root);
    var buttons = $$('button', root);

    function place(btn) {
      thumb.style.width = btn.offsetWidth + 'px';
      thumb.style.transform = 'translateX(' + (btn.offsetLeft - 3) + 'px)';
    }

    function set(level, silent) {
      buttons.forEach(function (b) {
        var on = b.getAttribute('data-level') === level;
        b.setAttribute('aria-pressed', String(on));
        if (on) place(b);
      });
      if (!silent) onChange(level);
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('aria-pressed') === 'true') return;
        set(b.getAttribute('data-level'));
      });
    });
    window.addEventListener('resize', function () {
      var cur = $('button[aria-pressed="true"]', root);
      if (cur) place(cur);
    });
    set(initial, true);
    // Шрифты могут изменить ширину кнопок
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        var cur = $('button[aria-pressed="true"]', root);
        if (cur) place(cur);
      });
    }
  }

  function swapAnimate(nodes) {
    if (reduceMotion) return;
    nodes.forEach(function (n, i) {
      n.classList.remove('price-swap');
      void n.offsetWidth;
      n.style.setProperty('--i', Math.min(i, 30));
      n.classList.add('price-swap');
    });
  }

  /* ---------- Главная ---------- */

  var MARKS = {
    face: {
      face: [183, 258],
      scalp: [167, 102],
      eyes: [233, 189],
      nasolabial: [244, 266],
      lips: [262, 294],
      upperlip: [244, 339],
      ears: [78, 208],
    },
    body: {
      body: [200, 168],
      arms: [76, 205],
      underarms: [166, 141],
      back: [201, 150],
      bikini: [166, 239],
      legs: [179, 305],
    },
  };

  // Координаты зон и счётчик — для сцен вариантов, которые рисуют зоны по-своему
  window.TK_MARKS = MARKS;
  window.TK_zoneCount = zoneCount;

  function renderAtlas() {
    var NS = 'http://www.w3.org/2000/svg';
    ['face', 'body'].forEach(function (plate) {
      var g = $('[data-marks="' + plate + '"]');
      var legend = $('[data-legend="' + plate + '"]');
      if (!g || !legend) return;
      var hits = '';
      var items = '';
      TK.zones[plate].forEach(function (z) {
        var pos = MARKS[plate][z.id];
        var n = zoneCount(z.id);
        var href = 'uslugi.html?zone=' + z.id;
        var isBack = z.id === 'back';
        // Невидимая мишень на рисунке: наведение на зону тоже включает прожектор
        hits += '<a class="zone-hit" href="' + href + '" data-zone="' + z.id + '" tabindex="-1" aria-hidden="true">' +
          '<circle cx="' + pos[0] + '" cy="' + pos[1] + '" r="26"/></a>';
        items +=
          '<li><a href="' + href + '" data-zone="' + z.id + '">' +
          '<span class="lg-num" aria-hidden="true"></span>' +
          '<span class="lg-name">' + esc(z.name) + (isBack ? ' <span style="opacity:.6">(со спины)</span>' : '') + '</span>' +
          '<span class="lg-count">' + n + '</span></a></li>';
      });
      // Прожектор: затемнение всего рисунка, кроме мягкого круга над зоной, и расходящиеся кольца
      g.innerHTML =
        '<defs>' +
        '<radialGradient id="spot-g-' + plate + '"><stop offset="0" stop-color="#000"/><stop offset="0.55" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>' +
        '<mask id="spot-m-' + plate + '" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="520">' +
        '<rect width="400" height="520" fill="#fff"/>' +
        '<circle class="spot-hole" cx="0" cy="0" r="78" fill="url(#spot-g-' + plate + ')"/></mask>' +
        '</defs>' +
        '<rect class="spot-dim" width="400" height="520" mask="url(#spot-m-' + plate + ')"/>' +
        '<g class="spot-mark"><circle class="spot-ring" r="15"/><circle class="spot-ring spot-ring--2" r="15"/><circle class="spot-core" r="15"/><circle class="spot-dot" r="3.2"/></g>' +
        hits;
      legend.innerHTML = items;

      var total = zoneCount('plate:' + plate);
      $('[data-plate-total="' + plate + '"]').textContent =
        total + ' ' + plural(total, ['процедура', 'процедуры', 'процедур']) + ' с указанной зоной';
    });

    // Прожектор: наведение/фокус на пункт списка или на зону рисунка; без наведения — автопоказ
    $$('[data-plate]').forEach(function (plateEl) {
      var key = plateEl.getAttribute('data-plate');
      var hole = $('.spot-hole', plateEl);
      var mark = $('.spot-mark', plateEl);
      if (!hole || !mark) return;
      var zones = TK.zones[key].map(function (z) { return z.id; });
      var current = null;
      var cycleI = 0;
      var cycleTimer = null;
      var resumeTimer = null;
      var visible = false;
      var placed = false;
      var hovering = false;
      // Вариант может попросить подсветку только по наведению (data-no-cycle на атласе)
      var noCycle = !!plateEl.closest('[data-no-cycle]');
      var startTimer = null;

      function activate(zone) {
        current = zone;
        plateEl.classList.toggle('is-spot', !!zone);
        // Спина: фигура разворачивается — вид сзади
        plateEl.classList.toggle('is-back-view', zone === 'back');
        $$('[data-zone]', plateEl).forEach(function (el) {
          el.classList.toggle('is-active', el.getAttribute('data-zone') === zone);
        });
        if (!zone) return;
        var pos = MARKS[key][zone];
        var t = 'translate(' + pos[0] + 'px,' + pos[1] + 'px)';
        if (!placed) {
          // Первый показ — сразу на месте, без перелёта из угла
          hole.style.transition = mark.style.transition = 'none';
          hole.style.transform = mark.style.transform = t;
          void mark.getBoundingClientRect();
          hole.style.transition = mark.style.transition = '';
          placed = true;
        }
        hole.style.transform = t;
        mark.style.transform = t;
      }

      function stopCycle() {
        clearInterval(cycleTimer);
        cycleTimer = null;
      }
      function startCycle() {
        if (reduceMotion || cycleTimer || !visible || hovering || noCycle) return;
        activate(zones[cycleI % zones.length]);
        cycleTimer = setInterval(function () {
          cycleI++;
          activate(zones[cycleI % zones.length]);
        }, 2600);
      }
      function userOn(zone) {
        hovering = true;
        stopCycle();
        clearTimeout(resumeTimer);
        clearTimeout(startTimer);
        cycleI = Math.max(0, zones.indexOf(zone));
        activate(zone);
      }
      function userOff() {
        hovering = false;
        activate(null);
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(startCycle, 3500);
      }

      $$('[data-zone]', plateEl).forEach(function (el) {
        var zone = el.getAttribute('data-zone');
        el.addEventListener('mouseenter', function () { userOn(zone); });
        el.addEventListener('focus', function () { userOn(zone); });
        el.addEventListener('mouseleave', userOff);
        el.addEventListener('blur', userOff);
      });

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) {
          visible = en[0].isIntersecting;
          if (visible) {
            clearTimeout(startTimer);
            if (!current) startTimer = setTimeout(startCycle, 1200);
          } else {
            stopCycle();
          }
        }, { threshold: 0.35 }).observe(plateEl);
      }
    });

    // Вкладки на телефоне
    var tabs = $$('[data-plate-tab]');
    function showPlate(which) {
      tabs.forEach(function (t) {
        t.setAttribute('aria-selected', String(t.getAttribute('data-plate-tab') === which));
      });
      $$('[data-plate]').forEach(function (p) {
        if (p.getAttribute('data-plate') === which) p.removeAttribute('hidden-mobile');
        else p.setAttribute('hidden-mobile', '');
      });
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { showPlate(t.getAttribute('data-plate-tab')); });
    });
    showPlate('face');

    // Проявление линий
    var atlas = $('[data-atlas]') || $('.atlas');
    if (!atlas) return;
    function develop() {
      atlas.classList.remove('is-developing');
      atlas.classList.add('is-developed');
    }
    if (reduceMotion) {
      develop();
    } else {
      requestAnimationFrame(function () { requestAnimationFrame(develop); });
    }
  }

  function renderStats() {
    var el = $('[data-stats]');
    if (el) {
      el.innerHTML =
        '<span>м-н Лесной, 10</span>' +
        '<span><b>' + stats.total + '</b> ' + plural(stats.total, ['процедура', 'процедуры', 'процедур']) + '</span>' +
        '<span><b>' + stats.devices + '</b> ' + plural(stats.devices, ['аппарат', 'аппарата', 'аппаратов']) + '</span>' +
        '<span><b>' + stats.people + '</b> ' + plural(stats.people, ['специалист', 'специалиста', 'специалистов']) + '</span>';
    }
    $$('[data-count]').forEach(function (n) {
      n.textContent = stats[n.getAttribute('data-count')];
    });
  }

  function renderCompare() {
    var table = $('[data-compare-table]');
    if (!table) return;
    var rows = P.filter(function (p) { return p.d != null && p.e != null; });
    var body = $('tbody', table);
    body.innerHTML = rows.map(function (p, i) {
      return '<tr' + (i >= 8 ? ' data-extra hidden' : '') + '><th scope="row">' + esc(p.name) + '</th>' +
        '<td class="p" data-l="d">' + priceHTML(p, 'd') + '</td>' +
        '<td class="p" data-l="e">' + priceHTML(p, 'e') + '</td></tr>';
    }).join('');
    if (rows.length > 8) {
      var more = document.createElement('button');
      more.type = 'button';
      more.className = 'chip-clear';
      more.style.marginTop = '16px';
      more.textContent = 'Показать все ' + rows.length;
      more.addEventListener('click', function () {
        $$('[data-extra]', table).forEach(function (r) { r.hidden = false; });
        more.remove();
      });
      table.after(more);
    }
    initLevelSwitch($('[data-level-switch]'), 'all', function (level) {
      var cells = $$('td.p', table);
      cells.forEach(function (c) {
        var l = c.getAttribute('data-l');
        c.style.opacity = level === 'all' || level === l ? '1' : '0.25';
      });
      swapAnimate(cells.filter(function (c) {
        return level === 'all' || c.getAttribute('data-l') === level;
      }));
    });
  }

  function minPrice(list) {
    var m = Infinity;
    list.forEach(function (p) {
      if (p.d != null) m = Math.min(m, p.d);
      if (p.e != null) m = Math.min(m, p.e);
    });
    return m;
  }

  function renderToc() {
    var el = $('[data-toc]');
    if (!el) return;
    var groups = [
      { key: 'face', title: 'Лицо' },
      { key: 'body', title: 'Тело' },
      { key: 'both', title: 'Лицо и тело' },
    ];
    el.innerHTML = groups.map(function (g) {
      var cats = TK.categories.filter(function (c) { return c.plate === g.key; });
      return '<div class="toc__group"><h3 class="display h3">' + g.title + '</h3><ul>' +
        cats.map(function (c) {
          var list = P.filter(function (p) { return p.cat === c.id; });
          return '<li><a href="uslugi.html?cat=' + c.id + '">' +
            '<span class="toc__name">' + esc(c.name) + '</span>' +
            '<span class="toc__count">' + list.length + '</span>' +
            '<span class="toc__from">от ' + fmt(minPrice(list)) + ' ₽</span></a></li>';
        }).join('') + '</ul></div>';
    }).join('');
    var lead = $('[data-toc-lead]');
    if (lead) {
      lead.textContent = stats.total + ' ' + plural(stats.total, ['процедура', 'процедуры', 'процедур']) +
        ' в ' + TK.categories.length + ' разделах. Цены — из прайс-листов от 9 января.';
    }
  }

  function renderFlagships() {
    var el = $('[data-flagships]');
    if (!el) return;
    el.innerHTML = TK.devices.filter(function (d) { return d.flagship; }).map(function (d) {
      return '<article class="device">' +
        '<div class="ghost-media"><span>Фото аппарата — от салона</span></div>' +
        '<div class="device__name"><h3 class="display h3">' + esc(d.name) + '</h3></div>' +
        '<div class="device__meta">' + esc(d.maker) + ' · ' + esc(d.country) + '</div>' +
        '<p>' + esc(d.procedures) + '</p>' +
        '</article>';
    }).join('');
  }

  function renderTeam() {
    var el = $('[data-team]');
    if (!el) return;
    el.innerHTML = TK.specialists.map(function (s) {
      return '<article class="person">' +
        '<div class="ghost-media"><span>Фото — после согласия на публикацию</span></div>' +
        '<h3 class="display h3">' + esc(s.name) + '</h3>' +
        '<div class="person__role">' + esc(s.role) + '</div>' +
        '</article>';
    }).join('');
  }

  /* ---------- Услуги ---------- */

  function initCatalog() {
    var params = new URLSearchParams(location.search);
    var state = {
      tab: params.get('tab') === 'devices' ? 'devices' : 'services',
      level: ['d', 'e'].indexOf(params.get('level')) !== -1 ? params.get('level') : 'all',
      cat: catById[params.get('cat')] ? params.get('cat') : null,
      zone: zoneById[params.get('zone')] ? params.get('zone') : (params.get('plate') === 'face' || params.get('plate') === 'body' ? 'plate:' + params.get('plate') : null),
      q: params.get('q') || '',
    };

    var cardsEl = $('[data-cards]');
    var countEl = $('[data-results]');
    var clearEl = $('[data-clear]');
    var catList = $('[data-cat-filter]');
    var zoneList = $('[data-zone-filter]');
    var search = $('[data-search]');
    var tabButtons = $$('[data-tab]');
    var panels = $$('[data-panel]');

    $('[data-tab-count="services"]').textContent = stats.total;
    $('[data-tab-count="devices"]').textContent = stats.devices;

    function syncURL() {
      var p = new URLSearchParams();
      if (state.tab === 'devices') p.set('tab', 'devices');
      if (state.level !== 'all') p.set('level', state.level);
      if (state.cat) p.set('cat', state.cat);
      if (state.zone) {
        if (state.zone.indexOf('plate:') === 0) p.set('plate', state.zone.split(':')[1]);
        else p.set('zone', state.zone);
      }
      if (state.q) p.set('q', state.q);
      var qs = p.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    }

    function byLevel(p) {
      if (state.level === 'd') return p.d != null;
      if (state.level === 'e') return p.e != null;
      return true;
    }

    function byQuery(p) {
      if (!state.q) return true;
      return norm(p.name).indexOf(norm(state.q.trim())) !== -1;
    }

    function filtered(except) {
      return P.filter(function (p) {
        return byLevel(p) && byQuery(p) &&
          (except === 'cat' || !state.cat || p.cat === state.cat) &&
          (except === 'zone' || inZone(p, state.zone));
      });
    }

    function renderFilters() {
      var base = filtered('cat');
      catList.innerHTML =
        '<li><button type="button" data-cat="" aria-pressed="' + (!state.cat) + '"><span>Все разделы</span><span class="num">' + base.length + '</span></button></li>' +
        TK.categories.map(function (c) {
          var n = base.filter(function (p) { return p.cat === c.id; }).length;
          return '<li><button type="button" data-cat="' + c.id + '" aria-pressed="' + (state.cat === c.id) + '"' + (n ? '' : ' disabled') + '>' +
            '<span>' + esc(c.name) + '</span><span class="num">' + n + '</span></button></li>';
        }).join('');

      var zbase = filtered('zone');
      function zbtn(id, name) {
        var n = zbase.filter(function (p) { return inZone(p, id); }).length;
        return '<li><button type="button" data-zone-btn="' + (id || '') + '" aria-pressed="' + (state.zone === id) + '"' + (n || !id ? '' : ' disabled') + '>' +
          '<span>' + esc(name) + '</span><span class="num">' + n + '</span></button></li>';
      }
      zoneList.innerHTML =
        zbtn(null, 'Любая зона') +
        zbtn('plate:face', 'Лицо — все зоны') +
        TK.zones.face.filter(function (z) { return z.id !== 'face'; }).map(function (z) { return zbtn(z.id, '— ' + z.name); }).join('') +
        zbtn('plate:body', 'Тело — все зоны') +
        TK.zones.body.filter(function (z) { return z.id !== 'body'; }).map(function (z) { return zbtn(z.id, '— ' + z.name); }).join('');
    }

    function renderSummaries() {
      var sc = $('[data-sum-cat]');
      var sz = $('[data-sum-zone]');
      sc.textContent = 'Раздел: ' + (state.cat ? catById[state.cat].name : 'все');
      var zn = 'любая';
      if (state.zone === 'plate:face') zn = 'лицо';
      else if (state.zone === 'plate:body') zn = 'тело';
      else if (state.zone) zn = zoneById[state.zone].name.toLowerCase();
      sz.textContent = 'Зона: ' + zn;
    }

    function cardHTML(p) {
      var cat = catById[p.cat];
      var rows = [['d', 'Врач-косметолог'], ['e', 'Эстетист']].map(function (l) {
        var price = priceHTML(p, l[0]);
        var dim = state.level !== 'all' && state.level !== l[0];
        return '<div class="prices__row' + (price ? '' : ' is-na') + (dim ? ' is-dim' : '') + '">' +
          '<dt>' + l[1] + '</dt><dd>' + (price || 'не выполняет') + '</dd></div>';
      }).join('');
      var dev = p.device && deviceById[p.device]
        ? '<div class="card__device">Аппарат: <a href="uslugi.html?tab=devices#' + p.device + '">' + esc(deviceById[p.device].name) + '</a></div>'
        : '';
      return '<article class="card">' +
        '<h3 class="card__title">' + esc(p.name) + '</h3>' +
        '<div class="card__cat">' + esc(cat.name) + '</div>' +
        '<dl class="prices">' + rows + '</dl>' +
        (p.note ? '<p class="card__note">' + esc(p.note) + '</p>' : '') +
        dev +
        '<div class="card__ghosts">' + ghost('Длительность') + ghost('Описание') + '</div>' +
        '<div class="card__foot"><span>Имеются противопоказания. Необходима консультация специалиста</span>' +
        '<a href="kontakty.html#zapis">Записаться</a></div>' +
        '</article>';
    }

    function renderCards(animate) {
      var list = filtered();
      if (!list.length) {
        cardsEl.innerHTML = '<div class="empty" style="grid-column:1/-1"><p>По&nbsp;выбранным условиям процедур нет.</p>' +
          '<button type="button" class="chip-clear" data-reset>Сбросить фильтры</button></div>';
      } else {
        cardsEl.innerHTML = list.map(cardHTML).join('');
      }
      countEl.innerHTML = 'Показано <b class="num">' + list.length + '</b> из ' + stats.total;
      var active = state.cat || state.zone || state.q || state.level !== 'all';
      clearEl.hidden = !active;
      if (animate) swapAnimate($$('.prices__row dd', cardsEl));
    }

    function renderDevices() {
      var el = $('[data-devices]');
      function card(d) {
        var rows = [
          ['Производитель', d.maker ? esc(d.maker) : ghost()],
          ['Страна', d.country ? esc(d.country) : ghost()],
          ['Процедуры', esc(d.procedures)],
        ];
        if (d.pending) rows.push(['Уточнение', ghost(d.pending)]);
        rows.push(['Рег. удостоверение', ghost()]);
        return '<article class="device-card" id="' + d.id + '">' +
          '<div class="ghost-media"><span>Фото аппарата — от салона</span></div>' +
          '<div class="device__name"><h3>' + esc(d.name) + '</h3>' + (d.flagship ? '<span class="mark-flag">Флагман</span>' : '') + '</div>' +
          '<dl>' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>' +
          '</article>';
      }
      var flag = TK.devices.filter(function (d) { return d.flagship; });
      var rest = TK.devices.filter(function (d) { return !d.flagship; });
      el.innerHTML =
        '<h2 class="group-title display h3">Флагманское оборудование <span class="num" style="font-family:var(--font-body);font-size:14px;color:var(--ink-3)">' + flag.length + '</span></h2>' +
        '<div class="device-cards">' + flag.map(card).join('') + '</div>' +
        '<h2 class="group-title display h3">Остальное оборудование <span class="num" style="font-family:var(--font-body);font-size:14px;color:var(--ink-3)">' + rest.length + '</span></h2>' +
        '<div class="device-cards">' + rest.map(card).join('') + '</div>';
    }

    function setTab(tab, focus) {
      state.tab = tab;
      tabButtons.forEach(function (b) {
        var on = b.getAttribute('data-tab') === tab;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      panels.forEach(function (p) {
        p.hidden = p.getAttribute('data-panel') !== tab;
      });
      $('[data-toolbar]').hidden = tab !== 'services';
      syncURL();
    }

    tabButtons.forEach(function (b, i) {
      b.addEventListener('click', function () { setTab(b.getAttribute('data-tab')); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          var next = tabButtons[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabButtons.length) % tabButtons.length];
          setTab(next.getAttribute('data-tab'), true);
        }
      });
    });

    catList.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b || b.disabled) return;
      state.cat = b.getAttribute('data-cat') || null;
      update();
    });

    zoneList.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b || b.disabled) return;
      state.zone = b.getAttribute('data-zone-btn') || null;
      update();
    });

    search.value = state.q;
    var t;
    search.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        state.q = search.value;
        update();
      }, 120);
    });

    function reset() {
      state.cat = null;
      state.zone = null;
      state.q = '';
      search.value = '';
      update();
    }

    clearEl.addEventListener('click', function () {
      state.level = 'all';
      $$('[data-level-switch] button').forEach(function (b) {
        if (b.getAttribute('data-level') === 'all') b.click();
      });
      reset();
    });

    cardsEl.addEventListener('click', function (e) {
      if (e.target.closest('[data-reset]')) reset();
    });

    function update(animate) {
      renderFilters();
      renderSummaries();
      renderCards(animate);
      syncURL();
    }

    initLevelSwitch($('[data-level-switch]'), state.level, function (level) {
      state.level = level;
      update(true);
    });

    if (window.matchMedia('(max-width: 900px)').matches) {
      $$('.filters details').forEach(function (d) { d.open = false; });
    }

    renderDevices();
    setTab(state.tab);
    update();

    if (location.hash && state.tab === 'devices') {
      var target = document.getElementById(location.hash.slice(1));
      if (target) setTimeout(function () { target.scrollIntoView({ block: 'center' }); }, 60);
    }
  }

  /* ---------- Мастера ---------- */

  function renderMasters() {
    var el = $('[data-masters]');
    if (!el) return;
    el.innerHTML = TK.specialists.map(function (s) {
      var n = s.level === 'd' ? stats.atD : stats.atE;
      var facts = [
        ['Специализация', esc(s.focus)],
        ['Выполняет', esc(s.scope)],
        ['Фамилия', ghost()],
        ['Стаж', ghost()],
        ['Образование', ghost()],
        ['Сертификаты', ghost()],
      ];
      return '<article class="master reveal" id="' + s.id + '">' +
        '<div class="ghost-media"><span>Фото — после письменного согласия на публикацию</span></div>' +
        '<div><h2 class="display h2 master__name">' + esc(s.name) + '</h2>' +
        '<p class="master__role">' + esc(s.role) + '</p>' +
        '<dl class="master__facts">' + facts.map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + f[1] + '</dd></div>'; }).join('') + '</dl></div>' +
        '<div class="master__side">' +
        '<div class="master__count"><span class="big">' + n + '</span><span>' + plural(n, ['процедура', 'процедуры', 'процедур']) + ' из каталога на уровне «' + (s.level === 'd' ? 'врач' : 'эстетист') + '»</span></div>' +
        '<a class="btn btn--navy" href="uslugi.html?level=' + s.level + '">Процедуры и цены</a>' +
        '<a class="btn btn--outline-navy" href="kontakty.html#zapis">Записаться</a>' +
        '</div></article>';
    }).join('');
  }

  /* ---------- Запуск ---------- */

  renderFooter();
  initMenu();

  if (page !== 'home' && $('[data-marks]')) renderAtlas();

  if (page === 'home') {
    renderStats();
    renderAtlas();
    renderCompare();
    renderToc();
    renderFlagships();
    renderTeam();
  } else if (page === 'services') {
    initCatalog();
  } else if (page === 'masters') {
    renderStats();
    renderMasters();
  }

  initReveal();
})();
