/**
 * ZerosPlot — draws a polynomial and marks its zeros on the x-axis.
 *
 * Canvas data attributes:
 *   data-fn     : JS expression for the function, e.g. "x*x*x - 3*x*x - 13*x + 15"
 *   data-zeros  : comma-separated zero values, e.g. "1,-3,5"
 *   data-xmin/xmax/ymin/ymax : viewing window
 */

class ZerosPlot {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    const d = canvas.dataset;
    this.fn = new Function('x', 'return ' + d.fn);
    this.zeros = d.zeros ? d.zeros.split(',').map(Number) : [];

    this.xMin = parseFloat(d.xmin) || -8;
    this.xMax = parseFloat(d.xmax) || 8;
    this.yMin = parseFloat(d.ymin) || -10;
    this.yMax = parseFloat(d.ymax) || 10;

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

  _drawCurve() {
    const ctx = this.ctx;
    const step = (this.xMax - this.xMin) / 600;

    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    let drawing = false;

    for (let x = this.xMin; x <= this.xMax; x += step) {
      let y;
      try { y = this.fn(x); } catch (e) { drawing = false; continue; }
      if (!isFinite(y) || y < this.yMin - 5 || y > this.yMax + 5) {
        drawing = false; continue;
      }
      const px = this._toX(x);
      const py = this._toY(y);
      drawing ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      drawing = true;
    }
    ctx.stroke();
  }

  _fmt(n) {
    if (Number.isInteger(n)) return n.toString();
    for (let d = 2; d <= 10; d++) {
      const num = Math.round(n * d);
      if (Math.abs(n - num / d) < 1e-9) return num + '/' + d;
    }
    return n.toFixed(2);
  }

  _drawZeros() {
    const ctx = this.ctx;

    for (let i = 0; i < this.zeros.length; i++) {
      const z = this.zeros[i];
      const px = this._toX(z);
      const py = this._toY(0);

      // red dot
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // label — alternate above/below to avoid overlap
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      if (i % 2 === 0) {
        ctx.textBaseline = 'top';
        ctx.fillText(this._fmt(z), px, py + 10);
      } else {
        ctx.textBaseline = 'bottom';
        ctx.fillText(this._fmt(z), px, py - 10);
      }
    }
  }

  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.hPx);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, this.w, this.hPx);

    this._drawGrid();
    this._drawAxes();
    this._drawCurve();
    this._drawZeros();
  }
}

/* --- Auto-init on <details> toggle --- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('details.solution').forEach(details => {
    const canvas = details.querySelector('.zeros-canvas');
    if (!canvas) return;
    let plot = null;
    details.addEventListener('toggle', () => {
      if (details.open && !plot) {
        setTimeout(() => { plot = new ZerosPlot(canvas); }, 80);
      }
    });
  });
});
