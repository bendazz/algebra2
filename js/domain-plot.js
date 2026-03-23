/**
 * DomainPlot — draws a function and visually highlights the domain.
 * Shades the excluded x-regions in light red.
 *
 * Canvas data attributes:
 *   data-fn       : function expression to eval, e.g. "Math.sqrt(3*x+12)"
 *   data-exclude  : comma-separated x-values where function is undefined (for VAs)
 *   data-domain-min : left boundary of domain (or "" for -∞)
 *   data-domain-max : right boundary of domain (or "" for +∞)
 *   data-xmin/xmax/ymin/ymax : viewing window
 */

class DomainPlot {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    const d = canvas.dataset;
    this.fnExpr = d.fn;
    this.fn = new Function('x', 'return ' + d.fn);

    this.exclude = d.exclude ? d.exclude.split(',').map(Number) : [];
    this.domainMin = d.domainMin !== undefined && d.domainMin !== '' ? parseFloat(d.domainMin) : null;
    this.domainMax = d.domainMax !== undefined && d.domainMax !== '' ? parseFloat(d.domainMax) : null;

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

  _drawExcludedRegions() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.07)';

    // shade left of domain min
    if (this.domainMin !== null) {
      const px = this._toX(this.domainMin);
      ctx.fillRect(0, 0, px, this.hPx);

      // boundary line
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, this.hPx); ctx.stroke();
      ctx.setLineDash([]);
    }

    // shade right of domain max
    if (this.domainMax !== null) {
      const px = this._toX(this.domainMax);
      ctx.fillRect(px, 0, this.w - px, this.hPx);

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, this.hPx); ctx.stroke();
      ctx.setLineDash([]);
    }

    // dashed vertical lines at excluded points
    for (const ex of this.exclude) {
      const px = this._toX(ex);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, this.hPx); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('x ≠ ' + ex, px + 4, 6);
    }
  }

  _drawFunction() {
    const ctx = this.ctx;
    const step = (this.xMax - this.xMin) / 800;
    const pad = 0.015;

    // build list of x-values to skip near
    const skipNear = this.exclude.slice();

    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();

    let drawing = false;

    for (let x = this.xMin; x <= this.xMax; x += step) {
      // skip near excluded points
      let nearExcluded = false;
      for (const ex of skipNear) {
        if (Math.abs(x - ex) < pad) { nearExcluded = true; break; }
      }
      if (nearExcluded) { drawing = false; continue; }

      let y;
      try { y = this.fn(x); } catch (e) { drawing = false; continue; }

      if (!isFinite(y) || isNaN(y) || y < this.yMin - 5 || y > this.yMax + 5) {
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

  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.hPx);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, this.w, this.hPx);

    this._drawExcludedRegions();
    this._drawGrid();
    this._drawAxes();
    this._drawFunction();
  }
}

/* --- Auto-init on <details> toggle --- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('details.solution').forEach(details => {
    const canvas = details.querySelector('.domain-canvas');
    if (!canvas) return;
    let plot = null;
    details.addEventListener('toggle', () => {
      if (details.open && !plot) {
        setTimeout(() => { plot = new DomainPlot(canvas); }, 80);
      }
    });
  });
});
