/**
 * TransformPlot — lightweight Canvas-based function plotter
 * that animates a parent function into its transformed version.
 *
 * Usage (via data attributes on a <canvas>):
 *   data-parent   : "quadratic" | "sqrt" | "abs" | "cubic"
 *   data-h        : horizontal shift (positive = right)
 *   data-k        : vertical shift   (positive = up)
 *   data-a        : vertical multiplier (−1 for reflection over x-axis)
 *   data-xmin/xmax/ymin/ymax : viewing window
 */

class TransformPlot {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Read config from data attributes
    const d = canvas.dataset;
    this.parentType = d.parent;
    this.h = parseFloat(d.h) || 0;
    this.k = parseFloat(d.k) || 0;
    this.a = d.a !== undefined ? parseFloat(d.a) : 1;

    this.xMin = parseFloat(d.xmin) || -8;
    this.xMax = parseFloat(d.xmax) || 8;
    this.yMin = parseFloat(d.ymin) || -6;
    this.yMax = parseFloat(d.ymax) || 8;

    this.parentFn = this._getParentFn();
    this.parentLabel = this._getParentLabel();
    this.needsDomain = this.parentType === 'sqrt';
    this.gLabel = d.label || 'g(x)';

    this._setupCanvas();
    this._drawFrame(0);
  }

  /* --- parent function lookup --- */
  _getParentFn() {
    switch (this.parentType) {
      case 'quadratic': return x => x * x;
      case 'sqrt':      return x => Math.sqrt(x);
      case 'abs':       return x => Math.abs(x);
      case 'cubic':     return x => x * x * x;
      default:          return x => x;
    }
  }

  _getParentLabel() {
    switch (this.parentType) {
      case 'quadratic': return 'f(x) = x²';
      case 'sqrt':      return 'f(x) = √x';
      case 'abs':       return 'f(x) = |x|';
      case 'cubic':     return 'f(x) = x³';
      default:          return 'f(x) = x';
    }
  }

  /* --- canvas helpers --- */
  _setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.w = rect.width;
    this.hPx = rect.height;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.hPx * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _toX(x) {
    return (x - this.xMin) / (this.xMax - this.xMin) * this.w;
  }

  _toY(y) {
    return (1 - (y - this.yMin) / (this.yMax - this.yMin)) * this.hPx;
  }

  /* --- drawing primitives --- */
  _drawGrid() {
    const ctx = this.ctx;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    for (let x = Math.ceil(this.xMin); x <= this.xMax; x++) {
      ctx.beginPath();
      ctx.moveTo(this._toX(x), 0);
      ctx.lineTo(this._toX(x), this.hPx);
      ctx.stroke();
    }
    for (let y = Math.ceil(this.yMin); y <= this.yMax; y++) {
      ctx.beginPath();
      ctx.moveTo(0, this._toY(y));
      ctx.lineTo(this.w, this._toY(y));
      ctx.stroke();
    }
  }

  _drawAxes() {
    const ctx = this.ctx;
    const ox = this._toX(0);
    const oy = this._toY(0);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;

    // x-axis
    ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(this.w, oy); ctx.stroke();
    // y-axis
    ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, this.hPx); ctx.stroke();

    // ticks & labels
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

  _drawCurve(fn, domainOk, color, width, dash) {
    const ctx = this.ctx;
    const step = (this.xMax - this.xMin) / 600;

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();

    let drawing = false;
    for (let x = this.xMin; x <= this.xMax; x += step) {
      if (!domainOk(x)) { drawing = false; continue; }
      const y = fn(x);
      if (!isFinite(y) || y < this.yMin - 3 || y > this.yMax + 3) {
        drawing = false; continue;
      }
      const px = this._toX(x);
      const py = this._toY(y);
      drawing ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      drawing = true;
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /* --- legend --- */
  _drawLegend(label) {
    const ctx = this.ctx;
    const x = this.w - 12;
    const y = 16;

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 12px system-ui, sans-serif';

    // parent legend
    const pw = ctx.measureText(this.parentLabel).width;
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(x - pw - 34, y); ctx.lineTo(x - pw - 8, y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#93c5fd';
    ctx.fillText(this.parentLabel, x, y);

    // transformed legend
    const y2 = y + 20;
    const tw = ctx.measureText(label).width;
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x - tw - 34, y2); ctx.lineTo(x - tw - 8, y2); ctx.stroke();
    ctx.fillStyle = '#4f46e5';
    ctx.fillText(label, x, y2);
  }

  /* --- main draw for a given animation progress t ∈ [0, 1] --- */
  _drawFrame(t) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.hPx);

    // background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, this.w, this.hPx);

    this._drawGrid();
    this._drawAxes();

    // parent (dashed blue)
    this._drawCurve(
      x => this.parentFn(x),
      x => !this.needsDomain || x >= 0,
      '#93c5fd', 2.5, [6, 4]
    );

    // interpolated parameters
    const ht = this.h * t;
    const kt = this.k * t;
    const at = 1 + (this.a - 1) * t;

    // transformed (solid indigo)
    this._drawCurve(
      x => at * this.parentFn(x - ht) + kt,
      x => !this.needsDomain || (x - ht) >= 0,
      '#4f46e5', 3, []
    );

    this._drawLegend(t >= 1 ? this.gLabel : 'transforming…');
  }

  /* --- public: run the animation --- */
  animate() {
    const duration = 1800;
    this._drawFrame(0);

    const run = () => {
      const start = performance.now();
      const step = (now) => {
        let raw = Math.min(1, (now - start) / duration);
        // ease-in-out
        const t = raw < 0.5
          ? 2 * raw * raw
          : 1 - Math.pow(-2 * raw + 2, 2) / 2;
        this._drawFrame(t);
        if (raw < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    // brief pause showing the parent before animating
    setTimeout(run, 500);
  }
}

/* --- Auto-init: wire up <details> toggles and replay buttons --- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('details.solution').forEach(details => {
    const canvas = details.querySelector('.transform-canvas');
    if (!canvas) return;

    let plot = null;

    details.addEventListener('toggle', () => {
      if (!details.open) return;
      // small delay so the browser lays out the canvas
      setTimeout(() => {
        if (!plot) {
          plot = new TransformPlot(canvas);
        }
        plot.animate();
      }, 80);
    });

    const btn = details.querySelector('.replay-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (plot) plot.animate();
      });
    }
  });
});
