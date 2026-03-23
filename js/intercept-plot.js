/**
 * InterceptPlot — draws a parabola ax² + bx + c with x-intercepts,
 * y-intercept, and vertex marked.
 *
 * Canvas data attributes:
 *   data-a, data-b, data-c       : standard form coefficients
 *   data-xmin/xmax/ymin/ymax     : viewing window
 */

class InterceptPlot {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    const d = canvas.dataset;
    this.a = parseFloat(d.a);
    this.b = parseFloat(d.b);
    this.c = parseFloat(d.c);

    this.xMin = parseFloat(d.xmin) || -8;
    this.xMax = parseFloat(d.xmax) || 8;
    this.yMin = parseFloat(d.ymin) || -6;
    this.yMax = parseFloat(d.ymax) || 8;

    this._setup();
    this._draw();
  }

  _setup() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.w = rect.width;
    this.hPx = rect.height;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.hPx * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _toX(x) { return (x - this.xMin) / (this.xMax - this.xMin) * this.w; }
  _toY(y) { return (1 - (y - this.yMin) / (this.yMax - this.yMin)) * this.hPx; }

  _fn(x) { return this.a * x * x + this.b * x + this.c; }

  _drawGrid() {
    const ctx = this.ctx;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let x = Math.ceil(this.xMin); x <= this.xMax; x++) {
      ctx.beginPath(); ctx.moveTo(this._toX(x), 0); ctx.lineTo(this._toX(x), this.hPx); ctx.stroke();
    }
    for (let y = Math.ceil(this.yMin); y <= this.yMax; y++) {
      ctx.beginPath(); ctx.moveTo(0, this._toY(y)); ctx.lineTo(this.w, this._toY(y)); ctx.stroke();
    }
  }

  _drawAxes() {
    const ctx = this.ctx;
    const ox = this._toX(0);
    const oy = this._toY(0);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(this.w, oy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, this.hPx); ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = Math.ceil(this.xMin); x <= this.xMax; x++) {
      if (x === 0) continue;
      const px = this._toX(x);
      ctx.beginPath(); ctx.moveTo(px, oy - 3); ctx.lineTo(px, oy + 3); ctx.stroke();
      ctx.fillText(x, px, oy + 5);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = Math.ceil(this.yMin); y <= this.yMax; y++) {
      if (y === 0) continue;
      const py = this._toY(y);
      ctx.beginPath(); ctx.moveTo(ox - 3, py); ctx.lineTo(ox + 3, py); ctx.stroke();
      ctx.fillText(y, ox - 6, py);
    }
  }

  _drawDot(mathX, mathY, color, label, align) {
    const ctx = this.ctx;
    const px = this._toX(mathX);
    const py = this._toY(mathY);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textBaseline = 'bottom';

    if (align === 'left') {
      ctx.textAlign = 'left';
      ctx.fillText(label, px + 9, py - 4);
    } else if (align === 'right') {
      ctx.textAlign = 'right';
      ctx.fillText(label, px - 9, py - 4);
    } else {
      ctx.textAlign = 'center';
      ctx.fillText(label, px, py - 9);
    }
  }

  _fmt(n) {
    if (Number.isInteger(n)) return n.toString();
    // show as fraction if close to a simple fraction
    for (let d = 2; d <= 10; d++) {
      const num = Math.round(n * d);
      if (Math.abs(n - num / d) < 1e-9) return num + '/' + d;
    }
    return n.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  }

  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.hPx);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, this.w, this.hPx);

    this._drawGrid();
    this._drawAxes();

    // --- parabola ---
    const step = (this.xMax - this.xMin) / 600;
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    let drawing = false;
    for (let x = this.xMin; x <= this.xMax; x += step) {
      const y = this._fn(x);
      if (y < this.yMin - 3 || y > this.yMax + 3) { drawing = false; continue; }
      const px = this._toX(x);
      const py = this._toY(y);
      drawing ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      drawing = true;
    }
    ctx.stroke();

    // --- y-intercept ---
    const yInt = this.c;
    this._drawDot(0, yInt, '#2563eb', '(0, ' + this._fmt(yInt) + ')', 'left');

    // --- x-intercepts ---
    const disc = this.b * this.b - 4 * this.a * this.c;
    if (disc >= 0) {
      const sqrtD = Math.sqrt(disc);
      const x1 = (-this.b - sqrtD) / (2 * this.a);
      const x2 = (-this.b + sqrtD) / (2 * this.a);

      if (Math.abs(disc) < 1e-9) {
        // double root
        this._drawDot(x1, 0, '#dc2626', '(' + this._fmt(x1) + ', 0)', 'left');
      } else {
        const left = Math.min(x1, x2);
        const right = Math.max(x1, x2);
        this._drawDot(left, 0, '#dc2626', '(' + this._fmt(left) + ', 0)', 'right');
        this._drawDot(right, 0, '#dc2626', '(' + this._fmt(right) + ', 0)', 'left');
      }
    } else {
      // no real x-intercepts
      ctx.fillStyle = '#dc2626';
      ctx.font = 'italic 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const vx = -this.b / (2 * this.a);
      ctx.fillText('No real x-intercepts', this._toX(vx), this.hPx - 20);
    }
  }
}

/* --- Auto-init on <details> toggle --- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('details.solution').forEach(details => {
    const canvas = details.querySelector('.intercept-canvas');
    if (!canvas) return;
    let plot = null;
    details.addEventListener('toggle', () => {
      if (details.open && !plot) {
        setTimeout(() => { plot = new InterceptPlot(canvas); }, 80);
      }
    });
  });
});
