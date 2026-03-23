/**
 * ParabolaPlot — draws a parabola a(x-h)² + k with vertex dot,
 * axis of symmetry, and labels.
 *
 * Canvas data attributes:
 *   data-a, data-h, data-k  : vertex form coefficients
 *   data-xmin/xmax/ymin/ymax: viewing window
 *   data-label               : function expression for the legend
 */

class ParabolaPlot {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    const d = canvas.dataset;
    this.a = parseFloat(d.a) || 1;
    this.h = parseFloat(d.h) || 0;
    this.k = parseFloat(d.k) || 0;
    this.label = d.label || 'y = a(x−h)² + k';

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

  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.hPx);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, this.w, this.hPx);

    this._drawGrid();
    this._drawAxes();

    const fn = x => this.a * (x - this.h) ** 2 + this.k;
    const step = (this.xMax - this.xMin) / 600;

    // --- parabola curve ---
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    let drawing = false;
    for (let x = this.xMin; x <= this.xMax; x += step) {
      const y = fn(x);
      if (y < this.yMin - 3 || y > this.yMax + 3) { drawing = false; continue; }
      const px = this._toX(x);
      const py = this._toY(y);
      drawing ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      drawing = true;
    }
    ctx.stroke();

    // --- axis of symmetry ---
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    const sx = this._toX(this.h);
    ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, this.hPx); ctx.stroke();
    ctx.setLineDash([]);

    // --- vertex dot ---
    const vx = this._toX(this.h);
    const vy = this._toY(this.k);
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.arc(vx, vy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(vx, vy, 2.5, 0, Math.PI * 2); ctx.fill();

    // --- vertex label ---
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    const vLabel = `(${this._fmt(this.h)}, ${this._fmt(this.k)})`;
    ctx.fillText('Vertex ' + vLabel, vx + 10, vy - 6);

    // --- axis of symmetry label ---
    ctx.fillStyle = '#a855f7';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('x = ' + this._fmt(this.h), sx + 5, 6);

    // --- legend ---
    ctx.fillStyle = '#4f46e5';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    const lw = ctx.measureText(this.label).width;
    const lx = this.w - 12;
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx - lw - 34, 12); ctx.lineTo(lx - lw - 8, 12); ctx.stroke();
    ctx.fillText(this.label, lx, 5);
  }

  _fmt(n) {
    return Number.isInteger(n) ? n.toString() : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  }
}

/* --- Auto-init on <details> toggle --- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('details.solution').forEach(details => {
    const canvas = details.querySelector('.parabola-canvas');
    if (!canvas) return;
    let plot = null;
    details.addEventListener('toggle', () => {
      if (details.open && !plot) {
        setTimeout(() => { plot = new ParabolaPlot(canvas); }, 80);
      }
    });
  });
});
