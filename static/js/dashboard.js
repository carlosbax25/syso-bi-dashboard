/* ==========================================================================
   SYSO Empresarial & Laboratorio Clínico — Dashboard BI
   Frontend Logic
   ========================================================================== */

'use strict';

const API_URL = '/api/datos';
const ROWS_PER_PAGE = 15;

const CHART_PALETTE = [
  '#1F67AE', '#40C0ED', '#A2C462',
  '#6dd0f2', '#2a75be', '#DFEFF8', '#174f8a',
];
const ACCENT_COLOR = '#40C0ED';
const ACCENT_COLOR_LIGHT = 'rgba(64, 192, 237, 0.15)';

// Disable datalabels globally — only enable per-chart
Chart.defaults.plugins.datalabels = { display: false };

// ---------- State ----------
let state = {
  ordenes: [],
  kpis: null,
  graficos: null,
  pendientes: [],
  proyeccion: {},
  currentPage: 1,
  sortColumn: 'fecha',
  sortAsc: false,
  charts: {},
};

// ---------- DOM ----------
const dom = {
  fechaInicio:    () => document.getElementById('fecha_inicio'),
  fechaFin:       () => document.getElementById('fecha_fin'),
  btnApply:       () => document.getElementById('btn-apply-filters'),
  btnClear:       () => document.getElementById('btn-clear-filters'),
  kpiTotal:       () => document.getElementById('kpi-total-ordenes'),
  kpiIngresos:    () => document.getElementById('kpi-ingresos'),
  kpiArls:        () => document.getElementById('kpi-arls'),
  kpiCumplimiento:() => document.getElementById('kpi-cumplimiento'),
  kpiPendientes:  () => document.getElementById('kpi-pendientes'),
  kpiValorPend:   () => document.getElementById('kpi-valor-pendiente'),
  tableBody:      () => document.getElementById('table-body'),
  tableInfo:      () => document.getElementById('table-info'),
  pagination:     () => document.getElementById('pagination'),
  loading:        () => document.getElementById('loading'),
  errorMessage:   () => document.getElementById('error-message'),
  errorText:      () => document.getElementById('error-text'),
};

// ==========================================================================
// Custom Multi-Select Dropdown Component
// ==========================================================================

class MultiSelect {
  constructor(container) {
    this.container = container;
    this.filterKey = container.dataset.filter;
    this.selected = new Set();
    this.options = [];

    this.trigger = container.querySelector('.multi-select-trigger');
    this.dropdown = container.querySelector('.multi-select-dropdown');
    this.itemsContainer = container.querySelector('.dropdown-items');
    this.searchInput = container.querySelector('.dropdown-search input');
    this.placeholder = container.querySelector('.placeholder');

    this._bindEvents();
  }

  _bindEvents() {
    this.trigger.addEventListener('click', (e) => {
      if (e.target.closest('.chip-remove')) return;
      this.toggle();
    });

    this.searchInput.addEventListener('input', () => this._filterItems());

    this.container.querySelector('.btn-select-all').addEventListener('click', () => {
      this.options.forEach(o => this.selected.add(o));
      this._renderItems();
      this._renderChips();
    });

    this.container.querySelector('.btn-deselect-all').addEventListener('click', () => {
      this.selected.clear();
      this._renderItems();
      this._renderChips();
    });

    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) this.close();
    });

    this.trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.toggle(); }
      if (e.key === 'Escape') this.close();
    });
  }

  setOptions(options) {
    this.options = options;
    const validOptions = new Set(options);
    this.selected = new Set([...this.selected].filter(s => validOptions.has(s)));
    this._renderItems();
    this._renderChips();
  }

  getSelected() {
    return [...this.selected];
  }

  clearSelection() {
    this.selected.clear();
    this._renderItems();
    this._renderChips();
  }

  toggle() {
    const isOpen = this.dropdown.classList.contains('open');
    document.querySelectorAll('.multi-select-dropdown.open').forEach(d => {
      d.classList.remove('open');
      d.closest('.multi-select').querySelector('.multi-select-trigger').classList.remove('open');
    });
    if (!isOpen) {
      this.dropdown.classList.add('open');
      this.trigger.classList.add('open');
      this.searchInput.value = '';
      this._filterItems();
      setTimeout(() => this.searchInput.focus(), 50);
    }
  }

  close() {
    this.dropdown.classList.remove('open');
    this.trigger.classList.remove('open');
  }

  _filterItems() {
    const query = this.searchInput.value.toLowerCase().trim();
    const items = this.itemsContainer.querySelectorAll('.dropdown-item');
    items.forEach(item => {
      const text = item.dataset.value.toLowerCase();
      item.style.display = text.includes(query) ? '' : 'none';
    });
  }

  _renderItems() {
    this.itemsContainer.innerHTML = '';
    if (this.options.length === 0) {
      this.itemsContainer.innerHTML = '<div class="dropdown-empty">Sin opciones disponibles</div>';
      return;
    }
    this.options.forEach(opt => {
      const item = document.createElement('div');
      item.className = 'dropdown-item' + (this.selected.has(opt) ? ' selected' : '');
      item.dataset.value = opt;
      item.innerHTML = `<span class="check-icon">${this.selected.has(opt) ? '✓' : ''}</span><span>${escapeHtml(opt)}</span>`;
      item.addEventListener('click', () => {
        if (this.selected.has(opt)) {
          this.selected.delete(opt);
        } else {
          this.selected.add(opt);
        }
        this._renderItems();
        this._renderChips();
        this.searchInput.focus();
      });
      this.itemsContainer.appendChild(item);
    });
    this._filterItems();
  }

  _renderChips() {
    this.trigger.querySelectorAll('.chip').forEach(c => c.remove());
    const ph = this.placeholder;

    if (this.selected.size === 0) {
      ph.style.display = '';
      return;
    }
    ph.style.display = 'none';

    [...this.selected].forEach(val => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.innerHTML = `${escapeHtml(val)}<button type="button" class="chip-remove" title="Quitar">×</button>`;
      chip.querySelector('.chip-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        this.selected.delete(val);
        this._renderItems();
        this._renderChips();
      });
      this.trigger.insertBefore(chip, this.trigger.querySelector('.arrow'));
    });
  }
}

// Multi-select instances
let msArl, msServicio, msEstado;

// ==========================================================================
// Formatting Helpers
// ==========================================================================

function formatNumber(value) {
  if (value == null) return '0';
  return Number(value).toLocaleString('es-CO');
}

function formatCurrency(value) {
  if (value == null) return '$0';
  return '$' + Number(value).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function badgeClass(estado) {
  const map = { completada: 'badge-completada', pendiente: 'badge-pendiente', cancelada: 'badge-cancelada' };
  return map[(estado || '').toLowerCase()] || '';
}

// ==========================================================================
// UI Helpers
// ==========================================================================

function showLoading() { dom.loading().classList.add('active'); }
function hideLoading() { dom.loading().classList.remove('active'); }

function showError(message) {
  dom.errorText().textContent = message || 'Ha ocurrido un error al cargar los datos.';
  dom.errorMessage().classList.remove('hidden');
}

function hideError() { dom.errorMessage().classList.add('hidden'); }

// ==========================================================================
// API
// ==========================================================================

function buildQueryString() {
  const params = new URLSearchParams();
  const fi = dom.fechaInicio().value;
  const ff = dom.fechaFin().value;
  if (fi) params.append('fecha_inicio', fi);
  if (ff) params.append('fecha_fin', ff);

  msArl.getSelected().forEach(v => params.append('arl', v));
  msServicio.getSelected().forEach(v => params.append('tipo_servicio', v));
  msEstado.getSelected().forEach(v => params.append('estado', v));

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function fetchData() {
  showLoading();
  hideError();
  try {
    const response = await fetch(`${API_URL}${buildQueryString()}`);
    if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
    const data = await response.json();

    state.ordenes = data.ordenes || [];
    state.kpis = data.kpis || { total_ordenes: 0, ingresos_totales: 0, arl_activas: 0, tasa_cumplimiento: 0 };
    state.graficos = data.graficos || {};
    state.pendientes = data.pendientes_por_arl || [];
    state.proyeccion = data.proyeccion_ingresos || {};
    state.currentPage = 1;

    populateFilters(data.filtros_disponibles || {});
    renderAll();
  } catch (err) {
    showError(err.message || 'Error al conectar con el servidor.');
  } finally {
    hideLoading();
  }
}

// ==========================================================================
// Filters
// ==========================================================================

function populateFilters(filtros) {
  msArl.setOptions(filtros.arls || []);
  msServicio.setOptions(filtros.tipos_servicio || []);
  msEstado.setOptions(filtros.estados || ['completada', 'pendiente', 'cancelada']);
}

function clearFilters() {
  dom.fechaInicio().value = '';
  dom.fechaFin().value = '';
  msArl.clearSelection();
  msServicio.clearSelection();
  msEstado.clearSelection();
  fetchData();
}

// ==========================================================================
// Render
// ==========================================================================

function renderAll() {
  renderKPIs();
  renderCharts();
  renderPendientes(state.pendientes);
  renderTable();
}

function renderKPIs() {
  const k = state.kpis;
  if (!k) return;
  dom.kpiTotal().textContent = formatNumber(k.total_ordenes);
  dom.kpiIngresos().textContent = formatCurrency(k.ingresos_totales);
  dom.kpiArls().textContent = formatNumber(k.arl_activas);
  const cumpl = Number(k.tasa_cumplimiento);
  dom.kpiCumplimiento().textContent = cumpl % 1 === 0 ? cumpl.toFixed(0) : cumpl.toFixed(1);

  // Pendientes KPIs from pendientes_por_arl data
  const pend = state.pendientes || [];
  const totalPend = pend.reduce((s, a) => s + a.cantidad, 0);
  const valorPend = pend.reduce((s, a) => s + a.valor_total, 0);
  dom.kpiPendientes().textContent = formatNumber(totalPend);
  dom.kpiValorPend().textContent = formatCurrency(valorPend);
}

// ==========================================================================
// Charts
// ==========================================================================

function destroyChart(key) {
  if (state.charts[key]) { state.charts[key].destroy(); state.charts[key] = null; }
}

function renderCharts() {
  const g = state.graficos;
  if (!g) return;
  renderBarChartOrdenesArl(g.ordenes_por_arl || {});
  renderLineChartOrdenesMes(g.ordenes_por_mes || {});
  renderPieChartServicios(g.ordenes_por_servicio || {});
  renderHorizontalBarIngresos(g.ingresos_por_arl || {});
}

function renderBarChartOrdenesArl(data) {
  destroyChart('ordenesArl');
  const ctx = document.getElementById('chart-ordenes-arl').getContext('2d');
  const labels = Object.keys(data);

  const completadas = labels.map(arl => (data[arl] && data[arl].completada) || 0);
  const pendientes = labels.map(arl => (data[arl] && data[arl].pendiente) || 0);
  const canceladas = labels.map(arl => (data[arl] && data[arl].cancelada) || 0);

  state.charts.ordenesArl = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Completadas', data: completadas, backgroundColor: '#10b981', borderRadius: 2, maxBarThickness: 50 },
        { label: 'Pendientes', data: pendientes, backgroundColor: '#f59e0b', borderRadius: 2, maxBarThickness: 50 },
        { label: 'Canceladas', data: canceladas, backgroundColor: '#ef4444', borderRadius: 2, maxBarThickness: 50 },
      ],
    },
    plugins: [ChartDataLabels],
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top', labels: { boxWidth: 12, padding: 14, font: { size: 11, weight: '600' }, usePointStyle: true, pointStyle: 'rectRounded' } },
        tooltip: { mode: 'index', intersect: false, callbacks: {
          footer: (items) => {
            const total = items.reduce((s, i) => s + i.parsed.y, 0);
            return `Total: ${formatNumber(total)}`;
          }
        } },
        datalabels: {
          display: function(context) {
            const meta = context.chart.getDatasetMeta(context.datasetIndex);
            const bar = meta.data[context.dataIndex];
            if (!bar) return false;
            const barHeight = Math.abs(bar.base - bar.y);
            return context.dataset.data[context.dataIndex] > 0 && barHeight > 18;
          },
          color: 'rgba(255,255,255,0.85)',
          font: { size: 9, weight: '600' },
          anchor: 'center',
          align: 'center',
          formatter: function(value) { return value; },
        },
      },
      scales: {
        y: {
          beginAtZero: true, stacked: true,
          title: { display: true, text: 'Cantidad de Órdenes', font: { size: 11, weight: '600' }, color: '#6b7280', padding: { bottom: 6 } },
          ticks: { precision: 0, font: { size: 10 } },
          grid: { color: 'rgba(0,0,0,0.06)', drawBorder: false },
        },
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { maxRotation: 45, font: { size: 10 } },
        },
      },
    },
  });
}

function renderLineChartOrdenesMes(data) {
  destroyChart('ordenesMes');
  const ctx = document.getElementById('chart-ordenes-mes').getContext('2d');

  const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const rawLabels = Object.keys(data);
  const labels = rawLabels.map(k => {
    const [y, m] = k.split('-');
    return `${MESES[parseInt(m, 10) - 1]} ${y}`;
  });

  state.charts.ordenesMes = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{ label: 'Órdenes', data: Object.values(data),
        borderColor: ACCENT_COLOR, backgroundColor: ACCENT_COLOR_LIGHT,
        fill: true, tension: 0.4, pointBackgroundColor: ACCENT_COLOR, pointRadius: 3, pointHoverRadius: 5 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `Órdenes: ${formatNumber(c.parsed.y)}` } } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false }, ticks: { font: { size: 10 } } } },
    },
  });
}

function renderPieChartServicios(data) {
  destroyChart('servicios');
  const ctx = document.getElementById('chart-servicios').getContext('2d');
  const labels = Object.keys(data);
  const values = Object.values(data);

  // Paleta diversa y distinguible — 9 colores para 9 servicios
  const SERVICE_COLORS = [
    '#1F67AE', '#40C0ED', '#A2C462', '#6dd0f2',
    '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'
  ];

  state.charts.servicios = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values,
        backgroundColor: labels.map((_, i) => SERVICE_COLORS[i % SERVICE_COLORS.length]),
        borderWidth: 2, borderColor: '#ffffff' }],
    },
    plugins: [ChartDataLabels],
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 10, padding: 8, font: { size: 10 } } },
        tooltip: { callbacks: { label: (c) => {
          const total = c.dataset.data.reduce((a, b) => a + b, 0);
          const pct = total > 0 ? ((c.parsed / total) * 100).toFixed(1) : 0;
          return `${c.label}: ${formatNumber(c.parsed)} (${pct}%)`;
        } } },
        datalabels: {
          display: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? (context.dataset.data[context.dataIndex] / total * 100) : 0;
            return pct >= 4;
          },
          color: '#ffffff',
          font: { size: 9, weight: '700' },
          formatter: function(value, context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? (value / total * 100).toFixed(0) : 0;
            return `${value}\n${pct}%`;
          },
          textAlign: 'center',
        },
      },
    },
  });
}

function renderHorizontalBarIngresos(data) {
  destroyChart('ingresosArl');
  const ctx = document.getElementById('chart-ingresos-arl').getContext('2d');
  const labels = Object.keys(data);
  const values = Object.values(data);

  const BAR_COLORS = [
    '#1F67AE', '#40C0ED', '#A2C462', '#6dd0f2',
    '#f59e0b', '#10b981', '#8b5cf6'
  ];

  state.charts.ingresosArl = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Ingresos', data: values,
        backgroundColor: labels.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
        borderRadius: 4, maxBarThickness: 35 }],
    },
    plugins: [ChartDataLabels],
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => `Ingresos: ${formatCurrency(c.parsed.x)}` } },
        datalabels: {
          display: function(context) { return context.dataset.data[context.dataIndex] > 0; },
          color: 'rgba(255,255,255,0.8)',
          font: { size: 9, weight: '600' },
          anchor: 'center',
          align: 'center',
          formatter: function(value, context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? (value / total * 100).toFixed(0) : 0;
            return `${formatCurrency(value)}  (${pct}%)`;
          },
        },
      },
      scales: {
        x: { beginAtZero: true, ticks: { callback: (v) => formatCurrency(v), font: { size: 9 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
        y: { grid: { display: false }, ticks: { font: { size: 10 } } },
      },
    },
  });
}

// ==========================================================================
// Projection Chart
// ==========================================================================

function renderProyeccionIngresos(data) {
  destroyChart('proyeccion');
  const ctx = document.getElementById('chart-proyeccion');
  if (!ctx || !data.meses_historicos) return;

  const MESES_NOMBRE = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const formatMes = (k) => {
    const [y, m] = k.split('-');
    return `${MESES_NOMBRE[parseInt(m, 10) - 1]} ${y}`;
  };

  const mesesHist = data.meses_historicos || [];
  const mesesProy = data.meses_proyeccion || [];
  const allLabels = [...mesesHist, ...mesesProy].map(formatMes);
  const series = data.series || {};

  const ARL_COLORS = ['#1F67AE', '#40C0ED', '#A2C462', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];
  const datasets = [];
  let colorIdx = 0;

  for (const [arl, arlData] of Object.entries(series)) {
    const color = ARL_COLORS[colorIdx % ARL_COLORS.length];
    colorIdx++;

    // Historical line (solid)
    const histData = [...arlData.historico, ...Array(mesesProy.length).fill(null)];
    datasets.push({
      label: arl,
      data: histData,
      borderColor: color,
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.3,
      spanGaps: false,
    });

    // Projection line (dashed) — connects from last historical point
    const projData = Array(mesesHist.length - 1).fill(null);
    projData.push(arlData.historico[arlData.historico.length - 1]); // bridge point
    projData.push(...arlData.proyeccion);
    datasets.push({
      label: arl + ' (proyección)',
      data: projData,
      borderColor: color,
      backgroundColor: color + '15',
      borderWidth: 2,
      borderDash: [6, 3],
      pointRadius: function(context) {
        // Hide the bridge point (same index as last historical), show only future points
        return context.dataIndex < mesesHist.length ? 0 : 3;
      },
      pointBackgroundColor: color,
      pointHoverRadius: function(context) {
        return context.dataIndex < mesesHist.length ? 0 : 5;
      },
      tension: 0.3,
      fill: true,
      spanGaps: false,
    });
  }

  state.charts.proyeccion = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: { labels: allLabels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            boxWidth: 12,
            padding: 10,
            font: { size: 10 },
            filter: (item) => !item.text.includes('(proyección)'),
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          filter: function(tooltipItem) {
            // Hide projection bridge point (last historical index) to avoid duplicates
            if (tooltipItem.dataset.label && tooltipItem.dataset.label.includes('(proyección)')) {
              const mesesHistLen = (state.proyeccion.meses_historicos || []).length;
              return tooltipItem.dataIndex >= mesesHistLen;
            }
            return true;
          },
          callbacks: {
            label: (c) => `${c.dataset.label}: ${formatCurrency(c.parsed.y)}`,
          },
        },
        datalabels: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Ingresos ($)', font: { size: 10, weight: '600' }, color: '#5a6b7d' },
          ticks: { callback: (v) => formatCurrency(v), font: { size: 9 } },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 9 }, maxRotation: 45 },
        },
      },
      // Vertical line to separate historical from projection
      annotation: undefined,
    },
  });
}

// ==========================================================================
// Table
// ==========================================================================

function getSortedOrdenes() {
  const data = [...state.ordenes];
  if (!state.sortColumn) return data;
  const col = state.sortColumn;
  const asc = state.sortAsc;
  data.sort((a, b) => {
    let valA = a[col], valB = b[col];
    if (col === 'id' || col === 'cantidad_trabajadores' || col === 'valor_facturado') {
      return asc ? (Number(valA)||0) - (Number(valB)||0) : (Number(valB)||0) - (Number(valA)||0);
    }
    valA = String(valA || '').toLowerCase();
    valB = String(valB || '').toLowerCase();
    if (valA < valB) return asc ? -1 : 1;
    if (valA > valB) return asc ? 1 : -1;
    return 0;
  });
  return data;
}

function renderTable() {
  const sorted = getSortedOrdenes();
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));
  if (state.currentPage > totalPages) state.currentPage = totalPages;
  if (state.currentPage < 1) state.currentPage = 1;
  const start = (state.currentPage - 1) * ROWS_PER_PAGE;
  const pageData = sorted.slice(start, start + ROWS_PER_PAGE);
  renderTableBody(pageData);
  renderTableInfo(total, start, pageData.length);
  renderPagination(totalPages);
  updateSortIcons();
}

function renderTableBody(rows) {
  const tbody = dom.tableBody();
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📭</div><p>Sin datos para los filtros seleccionados</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(o => `
    <tr>
      <td>${o.id}</td><td>${o.fecha}</td><td>${escapeHtml(o.arl)}</td><td>${escapeHtml(o.empresa)}</td>
      <td>${escapeHtml(o.tipo_servicio)}</td><td class="col-trabajadores">${o.cantidad_trabajadores}</td>
      <td><span class="badge ${badgeClass(o.estado)}">${capitalize(o.estado)}</span></td>
      <td class="col-valor">${formatCurrency(o.valor_facturado)}</td>
    </tr>`).join('');
}

function renderTableInfo(total, start, pageCount) {
  dom.tableInfo().textContent = total === 0 ? '0 registros' : `Mostrando ${start + 1}–${start + pageCount} de ${formatNumber(total)} registros`;
}

function renderPagination(totalPages) {
  const container = dom.pagination();
  container.innerHTML = '';
  if (totalPages <= 1) return;

  const prevBtn = createPageButton('« Anterior', state.currentPage > 1, () => { state.currentPage--; renderTable(); });
  container.appendChild(prevBtn);

  getPaginationRange(state.currentPage, totalPages).forEach(p => {
    if (p === '...') {
      const el = document.createElement('span'); el.className = 'page-info'; el.textContent = '…';
      container.appendChild(el);
    } else {
      const btn = document.createElement('button');
      btn.className = 'page-number' + (p === state.currentPage ? ' active' : '');
      btn.textContent = p;
      btn.addEventListener('click', () => { state.currentPage = p; renderTable(); });
      container.appendChild(btn);
    }
  });

  const nextBtn = createPageButton('Siguiente »', state.currentPage < totalPages, () => { state.currentPage++; renderTable(); });
  container.appendChild(nextBtn);
}

function createPageButton(text, enabled, onClick) {
  const btn = document.createElement('button');
  btn.textContent = text; btn.disabled = !enabled;
  if (enabled) btn.addEventListener('click', onClick);
  return btn;
}

function getPaginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

function handleSort(column) {
  if (state.sortColumn === column) { state.sortAsc = !state.sortAsc; }
  else { state.sortColumn = column; state.sortAsc = true; }
  state.currentPage = 1;
  renderTable();
}

function updateSortIcons() {
  document.querySelectorAll('#modal-ordenes thead th[data-column]').forEach(th => {
    const icon = th.querySelector('.sort-icon');
    const col = th.dataset.column;
    if (col === state.sortColumn) { th.classList.add('sorted'); icon.textContent = state.sortAsc ? '▲' : '▼'; }
    else { th.classList.remove('sorted'); icon.textContent = '▲▼'; }
  });
}

// ==========================================================================
// Utility
// ==========================================================================

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ==========================================================================
// Drill-Down Modal (click on chart elements)
// ==========================================================================

function openDrilldown(title, ordenes) {
  document.getElementById('drilldown-title').textContent = title;

  const total = ordenes.length;
  const ingresos = ordenes.reduce((s, o) => s + o.valor_facturado, 0);
  const comp = ordenes.filter(o => o.estado === 'completada').length;
  const tasa = total > 0 ? (comp / total * 100) : 0;
  const tasaStr = tasa % 1 === 0 ? tasa.toFixed(0) : tasa.toFixed(1);

  document.getElementById('drilldown-info').textContent = `${formatNumber(total)} registros`;
  document.getElementById('drilldown-summary').innerHTML = `
    <div class="modal-summary-card"><span class="ms-value">${formatNumber(total)}</span><span class="ms-label">Órdenes</span></div>
    <div class="modal-summary-card"><span class="ms-value">${formatCurrency(ingresos)}</span><span class="ms-label">Ingresos</span></div>
    <div class="modal-summary-card"><span class="ms-value">${tasaStr}%</span><span class="ms-label">Cumplimiento</span></div>
  `;

  const tbody = document.getElementById('drilldown-table-body');
  if (ordenes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><p>Sin datos</p></div></td></tr>';
  } else {
    tbody.innerHTML = ordenes.map(o => `<tr>
      <td>${o.id}</td><td>${o.fecha}</td><td>${escapeHtml(o.arl)}</td><td>${escapeHtml(o.empresa)}</td>
      <td>${escapeHtml(o.tipo_servicio)}</td><td class="col-trabajadores">${o.cantidad_trabajadores}</td>
      <td><span class="badge ${badgeClass(o.estado)}">${capitalize(o.estado)}</span></td>
      <td class="col-valor">${formatCurrency(o.valor_facturado)}</td>
    </tr>`).join('');
  }

  document.getElementById('modal-drilldown').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDrilldown() {
  document.getElementById('modal-drilldown').classList.add('hidden');
  document.body.style.overflow = '';
}

// Chart click handlers
function setupChartDrilldown() {
  // Órdenes por ARL — click on a bar segment
  const chartArl = document.getElementById('chart-ordenes-arl');
  chartArl.onclick = function(evt) {
    const chart = state.charts.ordenesArl;
    if (!chart) return;
    const points = chart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, false);
    if (points.length === 0) return;
    const idx = points[0].index;
    const dsIdx = points[0].datasetIndex;
    const arl = chart.data.labels[idx];
    const estadoMap = ['completada', 'pendiente', 'cancelada'];
    const estado = estadoMap[dsIdx];
    const filtered = state.ordenes.filter(o => o.arl === arl && o.estado === estado);
    openDrilldown(`${arl} — ${capitalize(estado)}`, filtered);
  };

  // Evolución mensual — click on a point
  const chartMes = document.getElementById('chart-ordenes-mes');
  chartMes.onclick = function(evt) {
    const chart = state.charts.ordenesMes;
    if (!chart) return;
    const points = chart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, false);
    if (points.length === 0) return;
    const idx = points[0].index;
    const rawKeys = Object.keys(state.graficos.ordenes_por_mes || {});
    const mesKey = rawKeys[idx];
    if (!mesKey) return;
    const filtered = state.ordenes.filter(o => o.fecha.substring(0, 7) === mesKey);
    const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const [y, m] = mesKey.split('-');
    const label = `${MESES[parseInt(m, 10) - 1]} ${y}`;
    openDrilldown(`Órdenes de ${label}`, filtered);
  };

  // Distribución por servicio — click on a slice
  const chartServ = document.getElementById('chart-servicios');
  chartServ.onclick = function(evt) {
    const chart = state.charts.servicios;
    if (!chart) return;
    const points = chart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, false);
    if (points.length === 0) return;
    const idx = points[0].index;
    const servicio = chart.data.labels[idx];
    const filtered = state.ordenes.filter(o => o.tipo_servicio === servicio);
    openDrilldown(`Servicio: ${servicio}`, filtered);
  };

  // Ingresos por ARL — click on a bar
  const chartIng = document.getElementById('chart-ingresos-arl');
  chartIng.onclick = function(evt) {
    const chart = state.charts.ingresosArl;
    if (!chart) return;
    const points = chart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, false);
    if (points.length === 0) return;
    const idx = points[0].index;
    const arl = chart.data.labels[idx];
    const filtered = state.ordenes.filter(o => o.arl === arl);
    openDrilldown(`Ingresos: ${arl}`, filtered);
  };
}

// ==========================================================================
// Pending Orders Analysis
// ==========================================================================

function renderPendientes(pendientes) {
  const container = document.getElementById('pendientes-container');
  const info = document.getElementById('pendientes-info');

  if (!pendientes || pendientes.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">✅</div><p>No hay órdenes pendientes</p></div>';
    info.textContent = '';
    return;
  }

  const totalPend = pendientes.reduce((s, a) => s + a.cantidad, 0);
  const totalValor = pendientes.reduce((s, a) => s + a.valor_total, 0);
  const maxDias = Math.max(...pendientes.map(a => a.dias_max));

  info.textContent = `${formatNumber(totalPend)} órdenes pendientes`;

  let html = `<div class="pendientes-summary-bar">
    <div class="summary-item"><span class="summary-value">${formatNumber(totalPend)}</span><span class="summary-label">Órdenes Pendientes</span></div>
    <div class="summary-item"><span class="summary-value">${formatCurrency(totalValor)}</span><span class="summary-label">Valor en Riesgo</span></div>
    <div class="summary-item"><span class="summary-value">${maxDias} días</span><span class="summary-label">Mayor Antigüedad</span></div>
    <div class="summary-item"><span class="summary-value">${pendientes.length}</span><span class="summary-label">ARLs con Pendientes</span></div>
  </div>`;

  pendientes.forEach((arl, idx) => {
    const diasClass = arl.dias_max > 90 ? 'danger' : arl.dias_max > 30 ? 'warning' : '';
    html += `<div class="pendientes-arl-card">
      <div class="pendientes-arl-header" onclick="togglePendienteDetail(${idx})">
        <span class="arl-name">${escapeHtml(arl.arl)}</span>
        <div class="pendientes-arl-stats">
          <div class="stat"><span class="stat-value">${arl.cantidad}</span><span class="stat-label">Órdenes</span></div>
          <div class="stat"><span class="stat-value money">${formatCurrency(arl.valor_total)}</span><span class="stat-label">Valor</span></div>
          <div class="stat"><span class="stat-value ${diasClass}">${arl.dias_promedio} días</span><span class="stat-label">Promedio</span></div>
          <div class="stat"><span class="stat-value ${diasClass}">${arl.dias_max} días</span><span class="stat-label">Máximo</span></div>
        </div>
        <span class="toggle-arrow" id="arrow-${idx}">▼</span>
      </div>
      <div class="pendientes-detail" id="detail-${idx}">
        <table><thead><tr>
          <th>ID</th><th>Fecha</th><th>Empresa</th><th>Servicio</th><th>Trabajadores</th><th>Valor</th><th>Días Pendiente</th>
        </tr></thead><tbody>`;

    arl.ordenes.forEach(o => {
      const dc = o.dias_pendiente > 90 ? 'critico' : o.dias_pendiente > 30 ? 'alerta' : 'normal';
      html += `<tr>
        <td>${o.id}</td><td>${o.fecha}</td><td>${escapeHtml(o.empresa)}</td><td>${escapeHtml(o.tipo_servicio)}</td>
        <td class="col-trabajadores">${o.trabajadores}</td><td class="col-valor">${formatCurrency(o.valor)}</td>
        <td><span class="dias-badge ${dc}">${o.dias_pendiente} días</span></td>
      </tr>`;
    });

    html += '</tbody></table></div></div>';
  });

  container.innerHTML = html;
}

function togglePendienteDetail(idx) {
  const detail = document.getElementById(`detail-${idx}`);
  const arrow = document.getElementById(`arrow-${idx}`);
  detail.classList.toggle('open');
  arrow.classList.toggle('open');
}

function openPendientesModal() {
  document.getElementById('modal-pendientes').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closePendientesModal() {
  document.getElementById('modal-pendientes').classList.add('hidden');
  document.body.style.overflow = '';
}

function openOrdenesModal() {
  document.getElementById('modal-ordenes').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeOrdenesModal() {
  document.getElementById('modal-ordenes').classList.add('hidden');
  document.body.style.overflow = '';
}

// ==========================================================================
// Ingresos Modal
// ==========================================================================

function openIngresosModal() {
  renderIngresosModal();
  document.getElementById('modal-ingresos').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function renderIngresosModal() {
  const ordenes = state.ordenes;
  const container = document.getElementById('ingresos-container');

  // By ARL
  const byArl = {};
  const byServicio = {};
  ordenes.forEach(o => {
    byArl[o.arl] = (byArl[o.arl] || 0) + o.valor_facturado;
    byServicio[o.tipo_servicio] = (byServicio[o.tipo_servicio] || 0) + o.valor_facturado;
  });

  const totalIngresos = ordenes.reduce((s, o) => s + o.valor_facturado, 0);
  const arlSorted = Object.entries(byArl).sort((a, b) => b[1] - a[1]);
  const servSorted = Object.entries(byServicio).sort((a, b) => b[1] - a[1]);

  let html = `<div class="modal-summary-cards">
    <div class="modal-summary-card"><span class="ms-value">${formatCurrency(totalIngresos)}</span><span class="ms-label">Ingresos Totales</span></div>
    <div class="modal-summary-card"><span class="ms-value">${arlSorted.length}</span><span class="ms-label">ARLs</span></div>
    <div class="modal-summary-card"><span class="ms-value">${servSorted.length}</span><span class="ms-label">Servicios</span></div>
    <div class="modal-summary-card"><span class="ms-value">${formatCurrency(totalIngresos / (ordenes.length || 1))}</span><span class="ms-label">Promedio/Orden</span></div>
  </div>`;

  html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:0 20px 20px;align-items:start;">
    <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
    <table><thead><tr><th>ARL</th><th style="text-align:right">Ingresos</th><th style="text-align:right">%</th></tr></thead><tbody>`;
  arlSorted.forEach(([arl, val]) => {
    const pct = totalIngresos > 0 ? (val / totalIngresos * 100) : 0;
    html += `<tr><td>${escapeHtml(arl)}</td><td style="text-align:right;font-variant-numeric:tabular-nums">${formatCurrency(val)}</td><td style="text-align:right">${pct.toFixed(1)}%</td></tr>`;
  });
  html += `</tbody></table></div>
    <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
    <table><thead><tr><th>Tipo de Servicio</th><th style="text-align:right">Ingresos</th><th style="text-align:right">%</th></tr></thead><tbody>`;
  servSorted.forEach(([serv, val]) => {
    const pct = totalIngresos > 0 ? (val / totalIngresos * 100) : 0;
    html += `<tr><td>${escapeHtml(serv)}</td><td style="text-align:right;font-variant-numeric:tabular-nums">${formatCurrency(val)}</td><td style="text-align:right">${pct.toFixed(1)}%</td></tr>`;
  });
  html += '</tbody></table></div></div>';
  container.innerHTML = html;
}

// ==========================================================================
// ARLs Modal
// ==========================================================================

function openArlsModal() {
  renderArlsModal();
  document.getElementById('modal-arls').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function renderArlsModal() {
  const ordenes = state.ordenes;
  const container = document.getElementById('arls-container');

  const byArl = {};
  ordenes.forEach(o => {
    if (!byArl[o.arl]) byArl[o.arl] = { total: 0, completadas: 0, pendientes: 0, canceladas: 0, ingresos: 0 };
    byArl[o.arl].total++;
    byArl[o.arl].ingresos += o.valor_facturado;
    if (o.estado === 'completada') byArl[o.arl].completadas++;
    else if (o.estado === 'pendiente') byArl[o.arl].pendientes++;
    else byArl[o.arl].canceladas++;
  });

  const sorted = Object.entries(byArl).sort((a, b) => b[1].total - a[1].total);

  const totalOrdenes = ordenes.length;
  const totalIngresos = ordenes.reduce((s, o) => s + o.valor_facturado, 0);
  const totalComp = ordenes.filter(o => o.estado === 'completada').length;
  const tasaGlobal = totalOrdenes > 0 ? (totalComp / totalOrdenes * 100) : 0;
  const tasaGlobalStr = tasaGlobal % 1 === 0 ? tasaGlobal.toFixed(0) : tasaGlobal.toFixed(1);

  let html = `<div class="modal-summary-cards">
    <div class="modal-summary-card"><span class="ms-value">${sorted.length}</span><span class="ms-label">ARLs Activas</span></div>
    <div class="modal-summary-card"><span class="ms-value">${formatNumber(totalOrdenes)}</span><span class="ms-label">Total Órdenes</span></div>
    <div class="modal-summary-card"><span class="ms-value">${formatCurrency(totalIngresos)}</span><span class="ms-label">Ingresos Totales</span></div>
    <div class="modal-summary-card"><span class="ms-value">${tasaGlobalStr}%</span><span class="ms-label">Cumplimiento Global</span></div>
  </div>`;

  html += `<div style="padding:0 20px 20px;"><div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
  <table><thead><tr><th>ARL</th><th style="text-align:center">Total</th><th style="text-align:center">Completadas</th><th style="text-align:center">Pendientes</th><th style="text-align:center">Canceladas</th><th style="text-align:right">Ingresos</th><th style="text-align:center">Cumplimiento</th></tr></thead><tbody>`;
  sorted.forEach(([arl, d]) => {
    const tasa = d.total > 0 ? (d.completadas / d.total * 100) : 0;
    const tasaStr = tasa % 1 === 0 ? tasa.toFixed(0) : tasa.toFixed(1);
    html += `<tr><td style="font-weight:600">${escapeHtml(arl)}</td>
      <td style="text-align:center">${d.total}</td>
      <td style="text-align:center"><span class="badge badge-completada">${d.completadas}</span></td>
      <td style="text-align:center"><span class="badge badge-pendiente">${d.pendientes}</span></td>
      <td style="text-align:center"><span class="badge badge-cancelada">${d.canceladas}</span></td>
      <td style="text-align:right;font-variant-numeric:tabular-nums">${formatCurrency(d.ingresos)}</td>
      <td style="text-align:center;font-weight:700">${tasaStr}%</td></tr>`;
  });
  html += '</tbody></table></div></div>';
  container.innerHTML = html;
}

// ==========================================================================
// Cumplimiento Modal
// ==========================================================================

function openCumplimientoModal() {
  renderCumplimientoModal();
  document.getElementById('modal-cumplimiento').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function renderCumplimientoModal() {
  const ordenes = state.ordenes;
  const container = document.getElementById('cumplimiento-container');
  const total = ordenes.length;
  const comp = ordenes.filter(o => o.estado === 'completada').length;
  const pend = ordenes.filter(o => o.estado === 'pendiente').length;
  const canc = ordenes.filter(o => o.estado === 'cancelada').length;
  const tasa = total > 0 ? (comp / total * 100) : 0;
  const tasaStr = tasa % 1 === 0 ? tasa.toFixed(0) : tasa.toFixed(1);

  let html = `<div class="modal-summary-cards">
    <div class="modal-summary-card"><span class="ms-value">${tasaStr}%</span><span class="ms-label">Tasa de Cumplimiento</span></div>
    <div class="modal-summary-card" style="border-left:3px solid #10b981"><span class="ms-value" style="color:#10b981">${comp}</span><span class="ms-label">Completadas</span></div>
    <div class="modal-summary-card" style="border-left:3px solid #f59e0b"><span class="ms-value" style="color:#f59e0b">${pend}</span><span class="ms-label">Pendientes</span></div>
    <div class="modal-summary-card" style="border-left:3px solid #ef4444"><span class="ms-value" style="color:#ef4444">${canc}</span><span class="ms-label">Canceladas</span></div>
  </div>`;

  // By ARL
  const byArl = {};
  ordenes.forEach(o => {
    if (!byArl[o.arl]) byArl[o.arl] = { total: 0, completadas: 0, pendientes: 0, canceladas: 0 };
    byArl[o.arl].total++;
    if (o.estado === 'completada') byArl[o.arl].completadas++;
    else if (o.estado === 'pendiente') byArl[o.arl].pendientes++;
    else byArl[o.arl].canceladas++;
  });

  const sorted = Object.entries(byArl).sort((a, b) => {
    const ta = a[1].total > 0 ? a[1].completadas / a[1].total : 0;
    const tb = b[1].total > 0 ? b[1].completadas / b[1].total : 0;
    return ta - tb;
  });

  html += `<div style="padding:0 20px 20px;"><div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
  <table><thead><tr><th>ARL</th><th style="text-align:center">Total</th><th style="text-align:center">Completadas</th><th style="text-align:center">Pendientes</th><th style="text-align:center">Canceladas</th><th style="text-align:center">Cumplimiento</th><th style="width:30%">Progreso</th></tr></thead><tbody>`;
  sorted.forEach(([arl, d]) => {
    const t = d.total > 0 ? (d.completadas / d.total * 100) : 0;
    const tStr = t % 1 === 0 ? t.toFixed(0) : t.toFixed(1);
    const barColor = t >= 80 ? '#10b981' : t >= 50 ? '#f59e0b' : '#ef4444';
    html += `<tr><td style="font-weight:600">${escapeHtml(arl)}</td>
      <td style="text-align:center">${d.total}</td>
      <td style="text-align:center">${d.completadas}</td>
      <td style="text-align:center">${d.pendientes}</td>
      <td style="text-align:center">${d.canceladas}</td>
      <td style="text-align:center;font-weight:700">${tStr}%</td>
      <td><div style="background:#e5e7eb;border-radius:4px;height:8px;overflow:hidden"><div style="width:${t}%;height:100%;background:${barColor};border-radius:4px;transition:width 0.3s ease"></div></div></td></tr>`;
  });
  html += '</tbody></table></div></div>';
  container.innerHTML = html;
}

// ==========================================================================
// Init
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  msArl = new MultiSelect(document.getElementById('ms-arl'));
  msServicio = new MultiSelect(document.getElementById('ms-servicio'));
  msEstado = new MultiSelect(document.getElementById('ms-estado'));

  dom.btnApply().addEventListener('click', () => fetchData());
  dom.btnClear().addEventListener('click', () => clearFilters());

  // Pendientes modal
  document.getElementById('kpi-card-pendientes').addEventListener('click', () => openPendientesModal());
  document.getElementById('modal-close-pendientes').addEventListener('click', () => closePendientesModal());
  document.getElementById('modal-pendientes').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closePendientesModal();
  });

  // Ordenes detail modal
  document.getElementById('kpi-card-ordenes').addEventListener('click', () => openOrdenesModal());
  document.getElementById('modal-close-ordenes').addEventListener('click', () => closeOrdenesModal());
  document.getElementById('modal-ordenes').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeOrdenesModal();
  });

  // Ingresos modal
  document.getElementById('kpi-card-ingresos').addEventListener('click', () => openIngresosModal());
  document.getElementById('modal-close-ingresos').addEventListener('click', () => { document.getElementById('modal-ingresos').classList.add('hidden'); document.body.style.overflow = ''; });
  document.getElementById('modal-ingresos').addEventListener('click', (e) => { if (e.target === e.currentTarget) { e.currentTarget.classList.add('hidden'); document.body.style.overflow = ''; } });

  // ARLs modal
  document.getElementById('kpi-card-arls').addEventListener('click', () => openArlsModal());
  document.getElementById('modal-close-arls').addEventListener('click', () => { document.getElementById('modal-arls').classList.add('hidden'); document.body.style.overflow = ''; });
  document.getElementById('modal-arls').addEventListener('click', (e) => { if (e.target === e.currentTarget) { e.currentTarget.classList.add('hidden'); document.body.style.overflow = ''; } });

  // Cumplimiento modal
  document.getElementById('kpi-card-cumplimiento').addEventListener('click', () => openCumplimientoModal());
  document.getElementById('modal-close-cumplimiento').addEventListener('click', () => { document.getElementById('modal-cumplimiento').classList.add('hidden'); document.body.style.overflow = ''; });
  document.getElementById('modal-cumplimiento').addEventListener('click', (e) => { if (e.target === e.currentTarget) { e.currentTarget.classList.add('hidden'); document.body.style.overflow = ''; } });

  // Valor pendiente → same modal as pendientes
  document.getElementById('kpi-card-valor-pendiente').addEventListener('click', () => openPendientesModal());

  // Projection modal
  document.getElementById('btn-proyeccion').addEventListener('click', (e) => {
    e.stopPropagation();
    renderProyeccionIngresos(state.proyeccion || {});
    document.getElementById('modal-proyeccion').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  });
  document.getElementById('modal-close-proyeccion').addEventListener('click', () => {
    document.getElementById('modal-proyeccion').classList.add('hidden');
    document.body.style.overflow = '';
  });
  document.getElementById('modal-proyeccion').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) { e.currentTarget.classList.add('hidden'); document.body.style.overflow = ''; }
  });

  // Drill-down modal
  document.getElementById('modal-close-drilldown').addEventListener('click', () => closeDrilldown());
  document.getElementById('modal-drilldown').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeDrilldown(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePendientesModal(); closeOrdenesModal(); closeDrilldown();
      document.getElementById('modal-ingresos').classList.add('hidden');
      document.getElementById('modal-arls').classList.add('hidden');
      document.getElementById('modal-cumplimiento').classList.add('hidden');
      document.getElementById('modal-proyeccion').classList.add('hidden');
      document.body.style.overflow = '';
    }
  });

  // Setup chart drill-down after first data load
  const origRenderAll = renderAll;
  let drilldownSetup = false;
  renderAll = function() {
    origRenderAll();
    if (!drilldownSetup) { setupChartDrilldown(); drilldownSetup = true; }
  };

  document.querySelectorAll('#modal-ordenes thead th[data-column]').forEach(th => {
    th.addEventListener('click', () => handleSort(th.dataset.column));
  });

  fetchData();
});
