(function () {
  'use strict';

  /* ══════════════════════════════════════
     Utilities
     ══════════════════════════════════════ */

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { [a, b] = [b, a % b]; }
    return a || 1;
  }

  function randInt(lo, hi) {
    return lo + Math.floor(Math.random() * (hi - lo + 1));
  }

  function randNZ(lo, hi) {
    var v; do { v = randInt(lo, hi); } while (!v); return v;
  }

  function pick(a) {
    return a[Math.floor(Math.random() * a.length)];
  }

  function simplify(n, d) {
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(Math.abs(n), d);
    return [n / g, d / g];
  }

  function texFrac(n, d) {
    if (d === 1) return String(n);
    var sign = n < 0 ? '-' : '';
    return sign + '\\dfrac{' + Math.abs(n) + '}{' + d + '}';
  }

  /* Format ax + b  (no "y = " prefix) */
  function texLinear(a, b) {
    var s = '';
    if (a === 1) s = 'x';
    else if (a === -1) s = '-x';
    else s = a + 'x';
    if (b > 0) s += ' + ' + b;
    else if (b < 0) s += ' - ' + Math.abs(b);
    return s;
  }

  /* Format y = mx + b */
  function texLineInt(m, b) {
    return 'y = ' + texLinear(m, b);
  }

  /* Format ax^2 + bx + c */
  function texQuadratic(a, b, c) {
    var s = '';
    if (a === 1) s = 'x^2';
    else if (a === -1) s = '-x^2';
    else s = a + 'x^2';

    if (b === 1) s += ' + x';
    else if (b === -1) s += ' - x';
    else if (b > 0) s += ' + ' + b + 'x';
    else if (b < 0) s += ' - ' + Math.abs(b) + 'x';

    if (c > 0) s += ' + ' + c;
    else if (c < 0) s += ' - ' + Math.abs(c);
    return s;
  }

  /* Format polynomial from high-degree coefficients [a_n … a_0] */
  function texPoly(coeffs) {
    var deg = coeffs.length - 1, s = '', first = true;
    for (var i = 0; i <= deg; i++) {
      var c = coeffs[i], power = deg - i;
      if (c === 0) continue;
      var varPart = power >= 2 ? 'x^' + power : (power === 1 ? 'x' : '');
      if (first) {
        if (varPart) {
          if (c === 1) s += varPart;
          else if (c === -1) s += '-' + varPart;
          else s += c + varPart;
        } else {
          s += c;
        }
        first = false;
      } else {
        if (c > 0) {
          s += ' + ';
          s += (c === 1 && varPart) ? varPart : c + varPart;
        } else {
          s += ' - ';
          s += (c === -1 && varPart) ? varPart : Math.abs(c) + varPart;
        }
      }
    }
    return s || '0';
  }

  /* Format a(x - h)^2 + k */
  function texVertexForm(a, h, k) {
    var s = '';
    if (a === -1) s = '-';
    else if (a !== 1) s = a;

    if (h === 0) s += 'x^2';
    else if (h > 0) s += '(x - ' + h + ')^2';
    else s += '(x + ' + Math.abs(h) + ')^2';

    if (k > 0) s += ' + ' + k;
    else if (k < 0) s += ' - ' + Math.abs(k);
    return s;
  }

  /* Format a transformed function for various parent types */
  function texTransformed(parent, a, h, k) {
    var inner;
    if (h === 0) inner = 'x';
    else if (h > 0) inner = 'x - ' + h;
    else inner = 'x + ' + Math.abs(h);

    var coeff = '';
    if (a === -1) coeff = '-';
    else if (a !== 1) coeff = a;

    var s = '';
    switch (parent) {
      case 'quadratic':
        s = (h === 0) ? coeff + 'x^2' : coeff + '(' + inner + ')^2';
        break;
      case 'sqrt':
        s = coeff + '\\sqrt{' + inner + '}';
        break;
      case 'abs':
        s = coeff + '\\left|' + inner + '\\right|';
        break;
      case 'cubic':
        s = (h === 0) ? coeff + 'x^3' : coeff + '(' + inner + ')^3';
        break;
    }
    if (k > 0) s += ' + ' + k;
    else if (k < 0) s += ' - ' + Math.abs(k);
    return s;
  }

  /* Parent function display names */
  var parentTex = {
    quadratic: 'x^2',
    sqrt: '\\sqrt{x}',
    abs: '|x|',
    cubic: 'x^3'
  };

  /* ══════════════════════════════════════
     Generators
     ══════════════════════════════════════ */

  var generators = {};

  /* ── 1. Solving Quadratics ────────────────────── */
  generators.quadratics = {
    name: 'Solving Quadratics',
    generate: function () {
      var r1 = randNZ(-9, 9);
      var r2 = randNZ(-9, 9);
      var a = pick([1, 1, 1, 1, 2, 3]);
      var B = -a * (r1 + r2);
      var C = a * r1 * r2;
      var problem = 'Solve: \\( ' + texQuadratic(a, B, C) + ' = 0 \\)';
      var answer;
      if (r1 === r2) {
        answer = '\\( x = ' + r1 + ' \\)';
      } else {
        var lo = Math.min(r1, r2), hi = Math.max(r1, r2);
        answer = '\\( x = ' + lo + ' \\) or \\( x = ' + hi + ' \\)';
      }
      return { problem: problem, answer: answer };
    }
  };

  /* ── 2. Exponential Equations ─────────────────── */
  generators.exponentials = {
    name: 'Exponential Equations',
    generate: function () {
      var base = pick([2, 2, 3, 3, 5]);
      var maxExp = base === 5 ? 4 : 6;
      var n = randInt(2, maxExp);               // target exponent
      var value = Math.pow(base, n);             // RHS as integer
      var a = pick([1, 1, 2, 2, 3, 4]);
      var x0 = randInt(-3, 5);                   // desired answer
      var b = n - a * x0;

      /* format exponent expression ax+b */
      var expStr = texLinear(a, b);
      var problem = 'Solve: \\( ' + base + '^{' + expStr + '} = ' + value + ' \\)';

      /* answer: x = x0 (or fraction) */
      var answer = '\\( x = ' + x0 + ' \\)';
      return { problem: problem, answer: answer };
    }
  };

  /* ── 3. Absolute Value Equations ──────────────── */
  generators.absValue = {
    name: 'Absolute Value Equations',
    generate: function () {
      var a = pick([1, 1, 2, 3, 4, 5]);
      var b = randInt(-10, 10);
      var c = randInt(1, 15);                    // RHS, always positive

      var inside = texLinear(a, b);
      var problem = 'Solve: \\( \\left|' + inside + '\\right| = ' + c + ' \\)';

      /* two solutions: ax + b = c  →  x = (c-b)/a
                         ax + b = -c →  x = (-c-b)/a */
      var s = simplify(c - b, a);
      var sol1 = texFrac(s[0], s[1]);
      s = simplify(-c - b, a);
      var sol2 = texFrac(s[0], s[1]);

      /* order numerically */
      var n1 = (c - b) / a, n2 = (-c - b) / a;
      if (n1 > n2) { var tmp = sol1; sol1 = sol2; sol2 = tmp; }

      var answer = '\\( x = ' + sol1 + ' \\) or \\( x = ' + sol2 + ' \\)';
      return { problem: problem, answer: answer };
    }
  };

  /* ── 4. Logarithmic Equations ─────────────────── */
  generators.logEquations = {
    name: 'Logarithmic Equations',
    generate: function () {
      var base = pick([2, 3, 5, 10]);
      var L = base === 5 ? pick([1, 2]) : pick([1, 2, 3]);  // log result
      var B = pick([1, 2, 3, 4]);                             // coeff of log
      var A = randInt(-3, 8);                                  // additive const
      var E = A + B * L;                                       // RHS
      var d = randInt(-5, 5);                                  // shift inside log
      var x0 = Math.pow(base, L) - d;                         // solution

      var baseStr = base === 10 ? '\\log' : '\\log_{' + base + '}';
      var innerStr;
      if (d === 0) innerStr = 'x';
      else if (d > 0) innerStr = 'x + ' + d;
      else innerStr = 'x - ' + Math.abs(d);

      var lhs = '';
      if (A !== 0) {
        lhs = A + ' + ';
        if (A < 0) lhs = A + ' + ';
      }
      if (B === 1) lhs += baseStr + '(' + innerStr + ')';
      else lhs += B + baseStr + '(' + innerStr + ')';

      var problem = 'Solve: \\( ' + lhs + ' = ' + E + ' \\)';
      var answer = '\\( x = ' + x0 + ' \\)';
      return { problem: problem, answer: answer };
    }
  };

  /* ── 5. Composite Functions ───────────────────── */
  generators.composites = {
    name: 'Composite Functions',
    generate: function () {
      var subtype = pick(['sum', 'diff', 'compose', 'compose-val', 'inverse']);

      /* helper: two functions f (linear) and g (quadratic) */
      var fa = randNZ(-4, 4), fb = randInt(-6, 6);
      var gc = pick([1, 1, -1, 2]), gd = randInt(-4, 4), ge = 0;

      var fStr = texLinear(fa, fb);
      var gStr = texQuadratic(gc, gd, ge);

      if (subtype === 'sum') {
        /* (f+g)(x) = gc*x^2 + (fa+gd)*x + (fb+ge) */
        var ans = texQuadratic(gc, fa + gd, fb + ge);
        return {
          problem: 'Given \\( f(x) = ' + fStr + ' \\) and \\( g(x) = ' + gStr + ' \\), find \\( (f + g)(x) \\).',
          answer: '\\( (f+g)(x) = ' + ans + ' \\)'
        };
      }

      if (subtype === 'diff') {
        var ans = texQuadratic(-gc, fa - gd, fb - ge);
        return {
          problem: 'Given \\( f(x) = ' + fStr + ' \\) and \\( g(x) = ' + gStr + ' \\), find \\( (f - g)(x) \\).',
          answer: '\\( (f-g)(x) = ' + ans + ' \\)'
        };
      }

      if (subtype === 'compose') {
        /* f(g(x)) = fa*(gc*x^2 + gd*x + ge) + fb = fa*gc*x^2 + fa*gd*x + (fa*ge+fb) */
        var ans = texQuadratic(fa * gc, fa * gd, fa * ge + fb);
        return {
          problem: 'Given \\( f(x) = ' + fStr + ' \\) and \\( g(x) = ' + gStr + ' \\), find \\( (f \\circ g)(x) \\).',
          answer: '\\( (f \\circ g)(x) = ' + ans + ' \\)'
        };
      }

      if (subtype === 'compose-val') {
        var val = randInt(-3, 4);
        var gVal = gc * val * val + gd * val + ge;
        var fgVal = fa * gVal + fb;
        return {
          problem: 'Given \\( f(x) = ' + fStr + ' \\) and \\( g(x) = ' + gStr + ' \\), find \\( (f \\circ g)(' + val + ') \\).',
          answer: '\\( (f \\circ g)(' + val + ') = ' + fgVal + ' \\)'
        };
      }

      /* inverse of linear f(x) = fa*x + fb */
      /* f^-1(x) = (x - fb) / fa */
      var numStr;
      if (fb === 0) numStr = 'x';
      else if (fb > 0) numStr = 'x - ' + fb;
      else numStr = 'x + ' + Math.abs(fb);

      var ans;
      if (fa === 1) {
        ans = numStr;
      } else if (fa === -1) {
        ans = '-(' + numStr + ')';
      } else {
        ans = '\\dfrac{' + numStr + '}{' + fa + '}';
      }
      return {
        problem: 'Find the inverse of \\( f(x) = ' + texLinear(fa, fb) + ' \\).',
        answer: '\\( f^{-1}(x) = ' + ans + ' \\)'
      };
    }
  };

  /* ── 6. Transformations ───────────────────────── */
  generators.transforms = {
    name: 'Transformations',
    generate: function () {
      var parent = pick(['quadratic', 'quadratic', 'sqrt', 'abs', 'cubic']);
      var h = randNZ(-6, 6);
      var k = randNZ(-6, 6);
      var a = pick([-3, -2, -1, 1, 1, 2, 3]);
      /* ensure at least 2 non-trivial transformations */
      if (a === 1 && h === 0) h = randNZ(1, 5);

      var funcStr = texTransformed(parent, a, h, k);
      var problem = 'Identify the parent function and describe the transformations: \\( g(x) = ' + funcStr + ' \\)';

      /* build answer */
      var desc = [];
      if (a < 0) desc.push('reflect over the x-axis');
      var absA = Math.abs(a);
      if (absA !== 1) desc.push('vertical stretch by ' + absA);
      if (h > 0) desc.push('right ' + h);
      else if (h < 0) desc.push('left ' + Math.abs(h));
      if (k > 0) desc.push('up ' + k);
      else if (k < 0) desc.push('down ' + Math.abs(k));

      var answer = 'Parent: \\( f(x) = ' + parentTex[parent] + ' \\). &ensp;' + desc.join(', ');
      return { problem: problem, answer: answer };
    }
  };

  /* ── 7. Vertex Form ───────────────────────────── */
  generators.vertexForm = {
    name: 'Vertex Form',
    generate: function () {
      var a = pick([-3, -2, -1, 1, 1, 2, 3]);
      var h = randNZ(-6, 6);
      var k = randInt(-8, 8);

      /* standard form coefficients */
      var bStd = -2 * a * h;
      var cStd = a * h * h + k;

      var problem = 'Rewrite in vertex form: \\( y = ' + texQuadratic(a, bStd, cStd) + ' \\)';
      var vf = texVertexForm(a, h, k);
      var direction = a > 0 ? 'up' : 'down';
      var answer = '\\( y = ' + vf + ' \\) &ensp; Vertex: \\( (' + h + ',\\, ' + k + ') \\), opens ' + direction;
      return { problem: problem, answer: answer };
    }
  };

  /* ── 8. Intercepts of Quadratics ──────────────── */
  generators.intercepts = {
    name: 'Intercepts of Quadratics',
    generate: function () {
      var r1 = randInt(-8, 8), r2 = randInt(-8, 8);
      var a = pick([1, 1, 1, -1, 2]);
      var B = -a * (r1 + r2);
      var C = a * r1 * r2;
      var problem = 'Find the x- and y-intercepts of \\( f(x) = ' + texQuadratic(a, B, C) + ' \\).';
      var xInts;
      if (r1 === r2) {
        xInts = '(' + r1 + ',\\, 0)';
      } else {
        var lo = Math.min(r1, r2), hi = Math.max(r1, r2);
        xInts = '(' + lo + ',\\, 0) \\text{ and } (' + hi + ',\\, 0)';
      }
      var answer = 'x-int: \\( ' + xInts + ' \\) &nbsp;&bull;&nbsp; y-int: \\( (0,\\, ' + C + ') \\)';
      return { problem: problem, answer: answer };
    }
  };

  /* ── 9. Finding Zeros ─────────────────────────── */
  generators.findingZeros = {
    name: 'Finding Zeros',
    generate: function () {
      var nRoots = pick([3, 3, 4]);
      var roots = [];
      var lo = nRoots === 4 ? -4 : -5, hi = nRoots === 4 ? 4 : 5;
      for (var i = 0; i < nRoots; i++) roots.push(randInt(lo, hi));

      /* expand from roots */
      var poly = [1, -roots[0]];  // (x - r0)
      for (var i = 1; i < roots.length; i++) {
        var r = roots[i], next = new Array(poly.length + 1);
        for (var j = 0; j < next.length; j++) next[j] = 0;
        for (var j = 0; j < poly.length; j++) {
          next[j] += poly[j];
          next[j + 1] += -r * poly[j];
        }
        poly = next;
      }

      var problem = 'Find all zeros of \\( f(x) = ' + texPoly(poly) + ' \\).';

      /* deduplicate and sort roots for answer */
      var unique = roots.slice().sort(function (a, b) { return a - b; });
      unique = unique.filter(function (v, i, arr) { return i === 0 || v !== arr[i - 1]; });
      var answer = '\\( ' + unique.map(function (r) { return 'x = ' + r; }).join(',\\; ') + ' \\)';
      return { problem: problem, answer: answer };
    }
  };

  /* ── 10. Asymptotes ───────────────────────────── */
  generators.asymptotes = {
    name: 'Asymptotes',
    generate: function () {
      var subtype = pick(['const-over-linear', 'linear-over-linear', 'linear-over-quadratic']);

      if (subtype === 'const-over-linear') {
        /* f(x) = c / (x - r)  →  VA: x = r, HA: y = 0 */
        var c = randNZ(-6, 6);
        var r = randNZ(-7, 7);
        var denStr;
        if (r > 0) denStr = 'x - ' + r;
        else denStr = 'x + ' + Math.abs(r);
        var problem = 'Find all asymptotes of \\( f(x) = \\dfrac{' + c + '}{' + denStr + '} \\).';
        var answer = 'VA: \\( x = ' + r + ' \\) &nbsp;&bull;&nbsp; HA: \\( y = 0 \\)';
        return { problem: problem, answer: answer };
      }

      if (subtype === 'linear-over-linear') {
        /* f(x) = (ax + b) / (x - r)  →  VA: x = r, HA: y = a */
        var a = randNZ(-4, 4);
        var b = randInt(-6, 6);
        var r = randNZ(-6, 6);
        var numStr = texLinear(a, b);
        var denStr = r > 0 ? 'x - ' + r : 'x + ' + Math.abs(r);
        var problem = 'Find all asymptotes of \\( f(x) = \\dfrac{' + numStr + '}{' + denStr + '} \\).';
        var answer = 'VA: \\( x = ' + r + ' \\) &nbsp;&bull;&nbsp; HA: \\( y = ' + a + ' \\)';
        return { problem: problem, answer: answer };
      }

      /* linear over quadratic — two VAs, HA y = 0 */
      var a = randNZ(-3, 3), b = randInt(-5, 5);
      var r1 = randNZ(-6, 6), r2 = randNZ(-6, 6);
      while (r2 === r1) r2 = randNZ(-6, 6);
      /* denominator = (x - r1)(x - r2) = x^2 - (r1+r2)x + r1*r2 */
      var dA = 1, dB = -(r1 + r2), dC = r1 * r2;
      var numStr = texLinear(a, b);
      var denStr = texQuadratic(dA, dB, dC);
      var problem = 'Find all asymptotes of \\( f(x) = \\dfrac{' + numStr + '}{' + denStr + '} \\).';
      var lo = Math.min(r1, r2), hi = Math.max(r1, r2);
      var answer = 'VA: \\( x = ' + lo + ' \\) and \\( x = ' + hi + ' \\) &nbsp;&bull;&nbsp; HA: \\( y = 0 \\)';
      return { problem: problem, answer: answer };
    }
  };

  /* ── 11. Condensing Logarithms ────────────────── */
  generators.condensing = {
    name: 'Condensing Logarithms',
    generate: function () {
      var pool = ['a', 'b', 'c', 'm', 'n', 'x', 'y', 'z'];
      var vars = pool.slice().sort(function () { return Math.random() - 0.5; });
      var nTerms = pick([2, 2, 3]);

      function lt(c, v) { return (c === 1 ? '' : c) + '\\log(' + v + ')'; }
      function pv(c, v) { return c === 1 ? v : v + '^{' + c + '}'; }

      if (nTerms === 2) {
        var v1 = vars[0], v2 = vars[1];
        var c1 = randInt(1, 4), c2 = randInt(1, 4);
        var op = pick(['+', '-']);
        var prob = lt(c1, v1) + (op === '+' ? ' + ' : ' - ') + lt(c2, v2);
        var ans = op === '+'
          ? '\\log(' + pv(c1, v1) + pv(c2, v2) + ')'
          : '\\log\\!\\left(\\dfrac{' + pv(c1, v1) + '}{' + pv(c2, v2) + '}\\right)';
        return {
          problem: 'Condense into a single logarithm: \\( ' + prob + ' \\)',
          answer: '\\( ' + ans + ' \\)'
        };
      }
      var v1 = vars[0], v2 = vars[1], v3 = vars[2];
      var c1 = randInt(1, 3), c2 = randInt(1, 3), c3 = randInt(1, 3);
      var prob = lt(c1, v1) + ' + ' + lt(c2, v2) + ' - ' + lt(c3, v3);
      var ans = '\\log\\!\\left(\\dfrac{' + pv(c1, v1) + pv(c2, v2) + '}{' + pv(c3, v3) + '}\\right)';
      return {
        problem: 'Condense into a single logarithm: \\( ' + prob + ' \\)',
        answer: '\\( ' + ans + ' \\)'
      };
    }
  };

  /* ── 12. Expanding Logarithms ─────────────────── */
  generators.expanding = {
    name: 'Expanding Logarithms',
    generate: function () {
      var pool = ['a', 'b', 'c', 'm', 'n', 'x', 'y', 'z'];
      var vars = pool.slice().sort(function () { return Math.random() - 0.5; });
      var nTerms = pick([2, 2, 3]);

      function lt(c, v) { return (c === 1 ? '' : c) + '\\log(' + v + ')'; }
      function pv(c, v) { return c === 1 ? v : v + '^{' + c + '}'; }

      if (nTerms === 2) {
        var v1 = vars[0], v2 = vars[1];
        var c1 = randInt(1, 4), c2 = randInt(1, 4);
        var type = pick(['product', 'quotient']);
        var prob, ans;
        if (type === 'product') {
          prob = '\\log(' + pv(c1, v1) + pv(c2, v2) + ')';
          ans = lt(c1, v1) + ' + ' + lt(c2, v2);
        } else {
          prob = '\\log\\!\\left(\\dfrac{' + pv(c1, v1) + '}{' + pv(c2, v2) + '}\\right)';
          ans = lt(c1, v1) + ' - ' + lt(c2, v2);
        }
        return {
          problem: 'Expand the logarithm: \\( ' + prob + ' \\)',
          answer: '\\( ' + ans + ' \\)'
        };
      }
      var v1 = vars[0], v2 = vars[1], v3 = vars[2];
      var c1 = randInt(1, 3), c2 = randInt(1, 3), c3 = randInt(1, 3);
      var prob = '\\log\\!\\left(\\dfrac{' + pv(c1, v1) + pv(c2, v2) + '}{' + pv(c3, v3) + '}\\right)';
      var ans = lt(c1, v1) + ' + ' + lt(c2, v2) + ' - ' + lt(c3, v3);
      return {
        problem: 'Expand the logarithm: \\( ' + prob + ' \\)',
        answer: '\\( ' + ans + ' \\)'
      };
    }
  };

  /* ── 13. Equation of a Line ───────────────────── */
  generators.lines = {
    name: 'Equation of a Line',
    generate: function () {
      var subtype = pick(['point-slope', 'point-slope', 'parallel', 'perpendicular']);

      if (subtype === 'point-slope') {
        var m = randNZ(-5, 5);
        var x1 = randInt(-8, 8), y1 = randInt(-8, 8);
        var b = y1 - m * x1;
        return {
          problem: 'Find the equation of the line through \\( (' + x1 + ',\\, ' + y1 + ') \\) with slope \\( m = ' + m + ' \\).',
          answer: '\\( ' + texLineInt(m, b) + ' \\)'
        };
      }
      if (subtype === 'parallel') {
        var m = randNZ(-4, 4);
        var origB = randInt(-6, 6);
        var x1 = randInt(-6, 6), y1 = randInt(-6, 6);
        var newB = y1 - m * x1;
        return {
          problem: 'Find the equation of the line through \\( (' + x1 + ',\\, ' + y1 + ') \\) parallel to \\( ' + texLineInt(m, origB) + ' \\).',
          answer: '\\( ' + texLineInt(m, newB) + ' \\)'
        };
      }
      /* perpendicular */
      var mOrig = pick([-3, -2, -1, 1, 2, 3]);
      var origB = randInt(-5, 5);
      var x1 = mOrig * randInt(-3, 3);
      var y1 = randInt(-6, 6);
      var newB = y1 + x1 / mOrig;

      var pair = simplify(-1, mOrig), pn = pair[0], pd = pair[1];
      var slopeX;
      if (pd === 1) slopeX = (pn === 1 ? 'x' : (pn === -1 ? '-x' : pn + 'x'));
      else slopeX = (pn < 0 ? '-' : '') + '\\dfrac{' + Math.abs(pn) + '}{' + pd + '}x';
      var ans = 'y = ' + slopeX;
      if (newB > 0) ans += ' + ' + newB;
      else if (newB < 0) ans += ' - ' + Math.abs(newB);
      return {
        problem: 'Find the equation of the line through \\( (' + x1 + ',\\, ' + y1 + ') \\) perpendicular to \\( ' + texLineInt(mOrig, origB) + ' \\).',
        answer: '\\( ' + ans + ' \\)'
      };
    }
  };

  /* ── 14. Domains of Functions ─────────────────── */
  generators.domains = {
    name: 'Domains of Functions',
    generate: function () {
      var subtype = pick(['sqrt', 'sqrt', 'rational-linear', 'rational-quadratic', 'cube-root']);

      if (subtype === 'sqrt') {
        /* sqrt(ax + b), a ≠ 0 */
        var a = randNZ(-5, 5);
        var b = randInt(-10, 10);
        var inside = texLinear(a, b);
        var problem = 'Find the domain of \\( f(x) = \\sqrt{' + inside + '} \\).';
        /* solve ax + b >= 0:  x >= -b/a  (if a>0)  or  x <= -b/a (if a<0) */
        var s = simplify(-b, a);
        var boundary = texFrac(s[0], s[1]);
        var answer;
        if (a > 0) {
          answer = '\\( \\left[' + boundary + ',\\, \\infty\\right) \\)';
        } else {
          answer = '\\( \\left(-\\infty,\\, ' + boundary + '\\right] \\)';
        }
        return { problem: problem, answer: answer };
      }

      if (subtype === 'rational-linear') {
        /* k / (ax + b) */
        var k = randNZ(-6, 6);
        var a = pick([1, 1, 2, 3]);
        var b = randInt(-8, 8);
        var inside = texLinear(a, b);
        var problem = 'Find the domain of \\( f(x) = \\dfrac{' + k + '}{' + inside + '} \\).';
        var s = simplify(-b, a);
        var excl = texFrac(s[0], s[1]);
        var answer = 'All real numbers, \\( x \\neq ' + excl + ' \\)';
        return { problem: problem, answer: answer };
      }

      if (subtype === 'rational-quadratic') {
        /* k / ((x-r1)(x-r2))  presented in expanded form */
        var k = randNZ(-5, 5);
        var r1 = randInt(-7, 7), r2 = randInt(-7, 7);
        while (r2 === r1) r2 = randInt(-7, 7);
        var dB = -(r1 + r2), dC = r1 * r2;
        var denStr = texQuadratic(1, dB, dC);
        var problem = 'Find the domain of \\( f(x) = \\dfrac{' + k + '}{' + denStr + '} \\).';
        var lo = Math.min(r1, r2), hi = Math.max(r1, r2);
        var answer = 'All real numbers, \\( x \\neq ' + lo + ' \\) and \\( x \\neq ' + hi + ' \\)';
        return { problem: problem, answer: answer };
      }

      /* cube root — always all reals */
      var a = randNZ(-4, 4);
      var b = randInt(-8, 8);
      var inside = texLinear(a, b);
      var problem = 'Find the domain of \\( f(x) = \\sqrt[3]{' + inside + '} \\).';
      var answer = '\\( (-\\infty,\\, \\infty) \\) &mdash; all real numbers';
      return { problem: problem, answer: answer };
    }
  };

  /* ── 15. Writing Functions from Zeros ─────────── */
  generators.fromZeros = {
    name: 'Writing Functions from Zeros',
    generate: function () {
      var nZeros = pick([2, 3, 3]);
      if (nZeros === 2) {
        var r1 = randInt(-8, 8), r2 = randInt(-8, 8);
        var sorted = [r1, r2].sort(function (a, b) { return a - b; });
        var b = -(r1 + r2), c = r1 * r2;
        return {
          problem: 'Write a polynomial function with zeros \\( x = ' + sorted[0] + ' \\) and \\( x = ' + sorted[1] + ' \\).',
          answer: '\\( f(x) = ' + texQuadratic(1, b, c) + ' \\)'
        };
      }
      var r1 = randInt(-5, 5), r2 = randInt(-5, 5), r3 = randInt(-5, 5);
      var sorted = [r1, r2, r3].sort(function (a, b) { return a - b; });
      var cb = -(r1 + r2 + r3);
      var cc = r1 * r2 + r1 * r3 + r2 * r3;
      var cd = -(r1 * r2 * r3);
      return {
        problem: 'Write a polynomial function with zeros \\( x = ' + sorted[0] + ' \\), \\( x = ' + sorted[1] + ' \\), and \\( x = ' + sorted[2] + ' \\).',
        answer: '\\( f(x) = ' + texPoly([1, cb, cc, cd]) + ' \\)'
      };
    }
  };

  /* ══════════════════════════════════════
     DOM wiring
     ══════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', function () {
    var select  = document.getElementById('topic-select');
    var area    = document.getElementById('problem-area');
    var newBtn  = document.getElementById('new-problem');
    var countEl = document.getElementById('counter');
    var count   = 0;

    var keys = Object.keys(generators);

    keys.forEach(function (key) {
      var opt = document.createElement('option');
      opt.value = key;
      opt.textContent = generators[key].name;
      select.appendChild(opt);
    });

    function generate() {
      var key = select.value;
      var gen;
      if (key === 'mix') {
        gen = generators[pick(keys)];
      } else {
        gen = generators[key];
      }
      var result = gen.generate();
      count++;
      countEl.textContent = count;

      area.innerHTML =
        '<div class="problem">' +
          '<div class="problem-statement">' +
            '<span class="problem-number">' + count + '.</span> ' +
            result.problem +
          '</div>' +
          '<details class="solution">' +
            '<summary>Reveal Answer</summary>' +
            '<div class="solution-body">' +
              '<p class="answer">' + result.answer + '</p>' +
            '</div>' +
          '</details>' +
        '</div>';

      if (window.renderMathInElement) {
        renderMathInElement(area, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\(', right: '\\)', display: false }
          ]
        });
      }
    }

    newBtn.addEventListener('click', generate);
    select.addEventListener('change', function () { count = 0; generate(); });
    generate();
  });

})();
