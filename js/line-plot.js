/**
 * LinePlot — draws a line with a marked point, and optionally a reference line.
 *
 * Canvas data attributes:
 *   data-m, data-b             : answer line  y = mx + b
 *   data-px, data-py           : the given point
 *   data-ref-m, data-ref-b     : reference line (parallel/perp), optional
 *   data-ref-label             : label for the reference line, optional
 *   data-label                 : label for the answer line, optional
 *   data-xmin/xmax/ymin/ymax   : viewing window
 */

class LinePlot {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    const d = canvas.dataset;
    this.m = parseFloat(d.m);
    this.b = parseFloat(d.b);
    this.px = parseFloat(d.px);
    this.py = parseFloat(d.py);

    this.refM = d.refM !== undefined && d.refM !== '' ? parseFloat(d.refM) : null;
    this.refB = d.refB !== undefined && d.refB !== '' ? parseFloat(d.refB) : null;
    this.refLabel = d.refLabel || '';
    this.label = d.label || '';

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

  _drawLine(m, b, color, width, dash, label) {
    const ctx = this.ctx;
    const y1 = m * this.xMin + b;
    const y2 = m * this.xMax + b;

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(this._toX(this.xMin), this._toY(y1));
    ctx.lineTo(this._toX(this.xMax), this._toY(y2));
    ctx.stroke();
    ctx.setLineDash([]);

    if (label) {
      ctx.fillStyle = color;
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      // place label at right side of plot
      const ly = m * (this.xMax - 0.5) + b;
      const clampedY = Math.max(this.yMin + 0.5, Math.min(this.yMax - 0.5, ly));
      ctx.fillText(label, this.w - 8, this._toY(clampedY) - 4);
    }
  }

  _drawPoint(x, y, color, label) {
    const ctx = this.ctx;
    const px = this._toX(x);
    const py = this._toY(y);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();

    if (label) {
      ctx.fillStyle = color;
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(label, px + 9, py - 4);
    }
  }

  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.hPx);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, this.w, this.hPx);

    this._drawGrid();
    this._drawAxes();

    // reference line (dashed gray)
    if (this.refM !== null && this.refB !== null) {
      this._drawLine(this.refM, this.refB, '#94a3b8', 2, [6, 4], this.refLabel);
    }

    // answer line (solid indigo)
    this._drawLine(this.m, this.b, '#4f46e5', 3, [], this.label);

    // given point
    this._drawPoint(this.px, this.py, '#dc2626', '(' + this.px + ', ' + this.py + ')');
  }
}

/* --- Auto-init on <details> toggle --- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('details.solution').forEach(details => {
    const canvas = details.querySelector('.line-canvas');
    if (!canvas) return;
    let plot = null;
    details.addEventListener('toggle', () => {
      if (details.open && !plot) {
        setTimeout(() => { plot = new LinePlot(canvas); }, 80);
      }
    });
  });
});
