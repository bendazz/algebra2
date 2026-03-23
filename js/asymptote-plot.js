/**
 * AsymptotePlot — draws a rational function with its asymptotes.
 *
 * Canvas data attributes:
 *   data-num   : numerator coefficients, high→low degree, e.g. "2,-1,3"
 *   data-den   : denominator coefficients
 *   data-va    : vertical asymptote x-values, e.g. "2,-2" (or "" for none)
 *   data-ha    : horizontal asymptote y-value (or "" for DNE)
 *   data-sa-m, data-sa-b : slant asymptote y = mx + b (or "" for DNE)
 *   data-xmin/xmax/ymin/ymax : viewing window
 */

class AsymptotePlot {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    const d = canvas.dataset;
    this.numCoeffs = d.num.split(',').map(Number);
    this.denCoeffs = d.den.split(',').map(Number);

    this.vas = d.va ? d.va.split(',').map(Number) : [];
    this.ha = d.ha !== undefined && d.ha !== '' ? parseFloat(d.ha) : null;
    this.saM = d.saM !== undefined && d.saM !== '' ? parseFloat(d.saM) : null;
    this.saB = d.saB !== undefined && d.saB !== '' ? parseFloat(d.saB) : null;

    this.xMin = parseFloat(d.xmin) || -10;
    this.xMax = parseFloat(d.xmax) || 10;
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

  _evalPoly(coeffs, x) {
    let r = 0;
    for (const c of coeffs) r = r * x + c;
    return r;
  }

  _fn(x) {
    const den = this._evalPoly(this.denCoeffs, x);
    if (Math.abs(den) < 1e-12) return NaN;
    return this._evalPoly(this.numCoeffs, x) / den;
  }

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

  _drawAsymptotes() {
    const ctx = this.ctx;

    // vertical asymptotes (red dashed)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([7, 5]);
    for (const va of this.vas) {
      const px = this._toX(va);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, this.hPx); ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('x = ' + va, px + 4, 6);
    }

    // horizontal asymptote (green dashed)
    if (this.ha !== null) {
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([7, 5]);
      const py = this._toY(this.ha);
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(this.w, py); ctx.stroke();

      ctx.fillStyle = '#16a34a';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('y = ' + this.ha, this.w - 6, py - 4);
    }

    // slant asymptote (orange dashed)
    if (this.saM !== null && this.saB !== null) {
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([7, 5]);
      const y1 = this.saM * this.xMin + this.saB;
      const y2 = this.saM * this.xMax + this.saB;
      ctx.beginPath();
      ctx.moveTo(this._toX(this.xMin), this._toY(y1));
      ctx.lineTo(this._toX(this.xMax), this._toY(y2));
      ctx.stroke();

      ctx.fillStyle = '#ea580c';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      const label = 'y = ' + this.saM + 'x' +
        (this.saB >= 0 ? ' + ' + this.saB : ' − ' + Math.abs(this.saB));
      ctx.fillText(label, this.w - 6, this._toY(y2) - 4);
    }

    ctx.setLineDash([]);
  }

  _drawFunction() {
    const ctx = this.ctx;
    const pad = 0.02;
    const step = (this.xMax - this.xMin) / 800;

    // Build segments between vertical asymptotes
    const boundaries = [this.xMin, ...this.vas.slice().sort((a, b) => a - b), this.xMax];

    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);

    for (let i = 0; i < boundaries.length - 1; i++) {
      const start = (i === 0) ? boundaries[i] : boundaries[i] + pad;
      const end = (i === boundaries.length - 2) ? boundaries[i + 1] : boundaries[i + 1] - pad;

      ctx.beginPath();
      let drawing = false;

      for (let x = start; x <= end; x += step) {
        const y = this._fn(x);
        if (!isFinite(y) || y < this.yMin - 5 || y > this.yMax + 5) {
          drawing = false;
          continue;
        }
        const px = this._toX(x);
        const py = this._toY(y);
        drawing ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        drawing = true;
      }
      ctx.stroke();
    }
  }

  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.hPx);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, this.w, this.hPx);

    this._drawGrid();
    this._drawAxes();
    this._drawAsymptotes();
    this._drawFunction();
  }
}

/* --- Auto-init on <details> toggle --- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('details.solution').forEach(details => {
    const canvas = details.querySelector('.asymptote-canvas');
    if (!canvas) return;
    let plot = null;
    details.addEventListener('toggle', () => {
      if (details.open && !plot) {
        setTimeout(() => { plot = new AsymptotePlot(canvas); }, 80);
      }
    });
  });
});
