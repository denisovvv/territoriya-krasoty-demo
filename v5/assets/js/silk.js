/*
 * Шёлк — полноэкранный фон на WebGL (без библиотек).
 * Поверхность складок считается во фрагментном шейдере: слои синусоид с доменным
 * искажением, нормаль по градиенту, мягкий диффуз + вытянутый блик ткани.
 * Курсор сгибает складки (с инерцией), прокрутка меняет угол света и оттенок.
 * Рисуем в половинном разрешении — шёлк мягкий, а видеокарте легче.
 * При prefers-reduced-motion — один статичный кадр.
 */
(function () {
  'use strict';

  var canvas = document.querySelector('[data-silk]');
  if (!canvas) return;
  var gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'low-power' });
  if (!gl) {
    document.documentElement.classList.add('no-webgl');
    return;
  }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var vert = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  var frag = [
    'precision highp float;',
    'uniform vec2 uRes;',
    'uniform float uTime;',
    'uniform vec2 uMouse;',      // 0..1, сглаженное положение курсора
    'uniform float uPress;',     // сила влияния курсора 0..1
    'uniform float uScroll;',    // прогресс прокрутки страницы 0..1
    '',
    'float height(vec2 p, float t){',
    '  vec2 q = p;',
    '  q += 0.38 * vec2(sin(p.y * 1.25 + t * 0.21), sin(p.x * 1.05 - t * 0.17));',
    '  q += 0.16 * vec2(sin(q.y * 2.3 - t * 0.13), sin(q.x * 2.1 + t * 0.11));',
    '  float h = 0.62 * sin(q.x * 1.55 + q.y * 0.85 + t * 0.26);',
    '  h += 0.38 * sin(-q.x * 0.72 + q.y * 1.85 - t * 0.19);',
    '  h += 0.16 * sin(q.x * 3.2 + q.y * 2.4 + t * 0.31);',
    '  h += 0.07 * sin(q.x * 6.1 - q.y * 4.3 + t * 0.4);',
    '  return h;',
    '}',
    '',
    'void main(){',
    '  vec2 uv = gl_FragCoord.xy / uRes;',
    '  float asp = uRes.x / uRes.y;',
    '  vec2 p = (uv - 0.5) * vec2(asp, 1.0) * 3.8;',
    '  float t = uTime + uScroll * 6.0;',
    '  // Курсор сгибает ткань: смещение области и мягкий «прогиб»',
    '  vec2 m = (uMouse - 0.5) * vec2(asp, 1.0) * 3.8;',
    '  vec2 dm = p - m;',
    '  float fall = exp(-dot(dm, dm) * 1.6) * uPress;',
    '  p += normalize(dm + 1e-4) * fall * 0.35;',
    '  float e = 0.012;',
    '  float h = height(p, t) - fall * 0.5;',
    '  float hx = height(p + vec2(e, 0.), t) - exp(-dot(dm + vec2(e,0.), dm + vec2(e,0.)) * 1.6) * uPress * 0.5;',
    '  float hy = height(p + vec2(0., e), t) - exp(-dot(dm + vec2(0.,e), dm + vec2(0.,e)) * 1.6) * uPress * 0.5;',
    '  vec3 n = normalize(vec3((h - hx) / e * 0.34, (h - hy) / e * 0.34, 1.0));',
    '  // Свет медленно поворачивается с прокруткой',
    '  float a = 0.9 + uScroll * 1.6;',
    '  vec3 L = normalize(vec3(cos(a) * 0.7, sin(a) * 0.7, 0.75));',
    '  vec3 V = vec3(0., 0., 1.);',
    '  float dif = clamp(dot(n, L), 0., 1.);',
    '  vec3 H = normalize(L + V);',
    '  float spec = pow(clamp(dot(n, H), 0., 1.), 70.0) + 0.25 * pow(clamp(dot(n, H), 0., 1.), 8.0);',
    '  float sheen = pow(1.0 - clamp(n.z, 0., 1.), 2.0);',
    '  vec3 navy = vec3(0.0, 0.106, 0.251);',          // #001B40
    '  vec3 fold = vec3(0.06, 0.23, 0.44);',           // светлая складка
    '  vec3 brass = vec3(0.784, 0.663, 0.494);',       // #C8A97E
    '  vec3 col = mix(navy * 0.55, fold * 1.1, pow(dif, 2.6));',
    '  col += spec * mix(vec3(0.85, 0.9, 1.0), brass, 0.25 + 0.25 * sin(uScroll * 3.1)) * 0.55;',
    '  col += sheen * fold * 0.35;',
    '  // Виньетка и лёгкое затемнение к низу — под текстом спокойнее',
    '  float vig = smoothstep(1.25, 0.35, length((uv - vec2(0.5, 0.55)) * vec2(asp * 0.8, 1.0)));',
    '  col *= mix(0.62, 1.0, vig);',
    '  col = mix(col, navy * 0.8, smoothstep(0.35, 0.0, uv.y) * 0.35);',
    '  // Небольшое зерно против полос',
    '  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);',
    '  col += (g - 0.5) / 255.0 * 2.0;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}',
  ].join('\n');

  function shader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  var prog = gl.createProgram();
  var vs = shader(gl.VERTEX_SHADER, vert);
  var fs = shader(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) {
    document.documentElement.classList.add('no-webgl');
    return;
  }
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var U = {
    res: gl.getUniformLocation(prog, 'uRes'),
    time: gl.getUniformLocation(prog, 'uTime'),
    mouse: gl.getUniformLocation(prog, 'uMouse'),
    press: gl.getUniformLocation(prog, 'uPress'),
    scroll: gl.getUniformLocation(prog, 'uScroll'),
  };

  var scale = 0.5;
  function resize() {
    var w = Math.max(1, Math.round(innerWidth * scale));
    var h = Math.max(1, Math.round(innerHeight * scale));
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(U.res, w, h);
    if (reduce) draw(12);
  }
  addEventListener('resize', resize);

  var mouse = { x: 0.62, y: 0.55, tx: 0.62, ty: 0.55, press: 0, tpress: 0 };
  addEventListener('pointermove', function (e) {
    mouse.tx = e.clientX / innerWidth;
    mouse.ty = 1 - e.clientY / innerHeight;
    mouse.tpress = 1;
  }, { passive: true });
  document.addEventListener('pointerleave', function () { mouse.tpress = 0; });

  var scroll = 0, tScroll = 0;
  function readScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    tScroll = h > 0 ? scrollY / h : 0;
  }
  addEventListener('scroll', readScroll, { passive: true });
  readScroll();

  function draw(t) {
    gl.uniform1f(U.time, t);
    gl.uniform2f(U.mouse, mouse.x, mouse.y);
    gl.uniform1f(U.press, mouse.press);
    gl.uniform1f(U.scroll, scroll);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  resize();
  if (reduce) {
    scroll = tScroll;
    draw(12);
    addEventListener('scroll', function () { scroll = tScroll; draw(12); }, { passive: true });
    return;
  }

  var start = performance.now();
  var running = true;
  function loop(now) {
    if (!running) return;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    mouse.press += (mouse.tpress - mouse.press) * 0.03;
    scroll += (tScroll - scroll) * 0.06;
    draw((now - start) / 1000);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  // В скрытой вкладке не рисуем
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(loop);
  });
  window.__silk = { draw: draw };
})();
