/* ==========================================================================
   IPS ARL S.A.S. Empresarial & Laboratorio Clínico — Dashboard BI
   Frontend Logic
   ========================================================================== */

'use strict';

const API_URL = '/api/datos';
const ROWS_PER_PAGE = 15;

// Okabe-Ito colorblind-safe palette
const CHART_PALETTE = [
  '#0072B2', '#E69F00', '#009E73',
  '#56B4E9', '#F0E442', '#D55E00', '#CC79A7',
];
const ACCENT_COLOR = '#0072B2';
const ACCENT_COLOR_LIGHT = 'rgba(0, 114, 178, 0.15)';

// Disable datalabels globally — only enable per-chart
Chart.defaults.plugins.datalabels = { display: false };

// ==========================================================================
// Bertin + Accessibility: Canvas patterns for colorblind-safe charts
// ==========================================================================

function createPattern(color, type) {
  const canvas = document.createElement('canvas');
  canvas.width = 10;
  canvas.height = 10;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 10, 10);

  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1.5;

  if (type === 'diagonal') {
    ctx.beginPath();
    ctx.moveTo(0, 10); ctx.lineTo(10, 0);
    ctx.stroke();
  } else if (type === 'dots') {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(5, 5, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'cross') {
    ctx.beginPath();
    ctx.moveTo(0, 5); ctx.lineTo(10, 5);
    ctx.moveTo(5, 0); ctx.lineTo(5, 10);
    ctx.stroke();
  }
  return ctx.createPattern(canvas, 'repeat');
}

// ---------- State ----------
let state = {
  ordenes: [],
  kpis: null,
  graficos: null,
  pendientes: [],
  cartera: [],
  tiempos: {},
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
  kpiCumplimiento:() => document.getElementById('kpi-cumplimiento'),
  kpiPendientes:  () => document.getElementById('kpi-pendientes'),
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
let msArl, msServicio, msEstado, msPrograma, msTarea;

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
  const e = (estado || '').toLowerCase();
  const map = {
    'ejecutada': 'badge-ejecutada',
    'facturada': 'badge-facturada',
    'soportes radicados': 'badge-soportes-radicados',
    'recibida': 'badge-recibida',
    'aceptada': 'badge-aceptada',
    'programada / asignada': 'badge-programada',
    'en ejecución': 'badge-en-ejecucion',
    'rechazada': 'badge-rechazada',
    'reemplazada': 'badge-reemplazada',
    'cancelada': 'badge-cancelada',
  };
  return map[e] || 'badge-pendiente';
}

// ==========================================================================
// UI Helpers
// ==========================================================================

function showLoading() { dom.loading().classList.add('active'); }
function hideLoading() { dom.loading().classList.remove('active'); }

function updateLastUpdated() {
  const el = document.getElementById('last-updated');
  if (!el) return;
  const ordenes = state.ordenes || [];
  if (ordenes.length === 0) { el.textContent = ''; return; }
  // Find the most recent order date
  const fechas = ordenes.map(o => o.fecha).filter(f => f).sort();
  const ultima = fechas[fechas.length - 1];
  if (!ultima) return;
  const [y, m, d] = ultima.split('-');
  const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  el.textContent = `Datos hasta: ${parseInt(d)} ${MESES[parseInt(m) - 1]} ${y}`;
}

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
  msPrograma.getSelected().forEach(v => params.append('programa', v));
  msTarea.getSelected().forEach(v => params.append('tarea', v));

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

let lastQueryString = null;

async function fetchData() {
  const qs = buildQueryString();
  // Cache: skip fetch if filters haven't changed
  if (qs === lastQueryString && state.ordenes.length > 0) {
    return;
  }

  showLoading();
  hideError();
  try {
    const response = await fetch(`${API_URL}${qs}`);
    if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
    const data = await response.json();

    state.ordenes = data.ordenes || [];
    state.kpis = data.kpis || { total_ordenes: 0, ingresos_totales: 0, arl_activas: 0, tasa_cumplimiento: 0 };
    state.graficos = data.graficos || {};
    state.pendientes = data.pendientes_por_arl || [];
    state.cartera = data.cartera_por_arl || [];
    state.tiempos = data.tiempos_proceso || {};
    state.proyeccion = data.proyeccion_ingresos || {};
    state.currentPage = 1;
    lastQueryString = qs;

    populateFilters(data.filtros_disponibles || {});
    renderAll();
    updateLastUpdated();
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
  msEstado.setOptions(filtros.estados || []);
  msPrograma.setOptions(filtros.programas || []);
  msTarea.setOptions(filtros.tareas || []);
}

function clearFilters() {
  dom.fechaInicio().value = '';
  dom.fechaFin().value = '';
  msArl.clearSelection();
  msServicio.clearSelection();
  msEstado.clearSelection();
  msPrograma.clearSelection();
  msTarea.clearSelection();
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
  const cumpl = Number(k.tasa_cumplimiento);
  dom.kpiCumplimiento().textContent = cumpl % 1 === 0 ? cumpl.toFixed(0) : cumpl.toFixed(1);

  // Pendientes KPIs — tarjeta fusionada (cantidad + valor debajo)
  const pend = state.pendientes || [];
  const totalPend = pend.reduce((s, a) => s + a.cantidad, 0);
  const valorPend = pend.reduce((s, a) => s + a.valor_total, 0);
  dom.kpiPendientes().textContent = formatNumber(totalPend);
  // Sub-label con el valor monetario
  const subEl = document.getElementById('kpi-valor-pendiente-sub');
  if (subEl) subEl.textContent = formatCurrency(valorPend);

  // KPI: Cartera sin facturar (ejecutadas no facturadas)
  const elCartera = document.getElementById('kpi-cartera');
  if (elCartera) {
    elCartera.textContent = formatCurrency(k.valor_cartera_pendiente || 0);
    const card = document.getElementById('kpi-card-cartera');
    if (card) {
      const n = k.ordenes_sin_facturar || 0;
      let trend = card.querySelector('.kpi-trend');
      if (!trend) {
        trend = document.createElement('span');
        trend.className = 'kpi-trend';
        card.querySelector('.kpi-content').appendChild(trend);
      }
      trend.innerHTML = `<span class="trend-down">${formatNumber(n)} órd. sin facturar</span>`;
    }
  }

  // KPI: Días promedio ejecución → facturación
  const elDias = document.getElementById('kpi-dias-facturacion');
  if (elDias) {
    const dias = k.dias_promedio_facturacion || 0;
    elDias.textContent = dias > 0 ? dias.toFixed(1) : '—';
    const card = document.getElementById('kpi-card-dias-fact');
    if (card) {
      let trend = card.querySelector('.kpi-trend');
      if (!trend) {
        trend = document.createElement('span');
        trend.className = 'kpi-trend';
        card.querySelector('.kpi-content').appendChild(trend);
      }
      const cls = dias > 30 ? 'trend-down' : 'trend-up';
      const label = dias > 30 ? '⚠ Supera 30 días' : '✓ Dentro del rango';
      trend.innerHTML = `<span class="${cls}">${label}</span>`;
    }
  }

  // Bertin: Orientation — trend indicators comparing current vs previous period
  renderTrendIndicators();
}

function renderTrendIndicators() {
  const ordenes = state.ordenes || [];
  if (ordenes.length === 0) return;

  const hoy = new Date();
  const diaActual = hoy.getDate();
  const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  const prev = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const mesAnterior = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;

  const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const mesAnteriorLabel = `${MESES[prev.getMonth()]} ${prev.getFullYear()}`;

  // Current month: orders from day 1 to today
  const actual = ordenes.filter(o => o.fecha && o.fecha.startsWith(mesActual));

  // Previous month: only orders from day 1 to same day number
  const anterior = ordenes.filter(o => {
    if (!o.fecha || !o.fecha.startsWith(mesAnterior)) return false;
    const dia = parseInt(o.fecha.substring(8, 10), 10);
    return dia <= diaActual;
  });

  // If no data in previous month, don't show trend
  if (anterior.length === 0) {
    clearTrend('kpi-card-ordenes');
    clearTrend('kpi-card-ingresos');
    return;
  }

  const ingActual = actual.reduce((s, o) => s + o.valor_facturado, 0);
  const ingAnterior = anterior.reduce((s, o) => s + o.valor_facturado, 0);

  const tooltip = `Comparado con los primeros ${diaActual} días de ${mesAnteriorLabel}`;
  const diffOrdenes = actual.length - anterior.length;
  const diffIngresos = ingActual - ingAnterior;
  const tooltipOrdenes = `${tooltip}: ${diffOrdenes >= 0 ? '+' : ''}${formatNumber(diffOrdenes)} órdenes`;
  const tooltipIngresos = `${tooltip}: ${diffIngresos >= 0 ? '+' : '-'}${formatCurrency(Math.abs(diffIngresos))}`;
  setTrend('kpi-card-ordenes', actual.length, anterior.length, tooltipOrdenes);
  setTrend('kpi-card-ingresos', ingActual, ingAnterior, tooltipIngresos);
}

function clearTrend(cardId) {
  const card = document.getElementById(cardId);
  if (!card) return;
  const indicator = card.querySelector('.kpi-trend');
  if (indicator) indicator.textContent = '';
}

function setTrend(cardId, current, previous, tooltip) {
  const card = document.getElementById(cardId);
  if (!card) return;
  let indicator = card.querySelector('.kpi-trend');
  if (!indicator) {
    indicator = document.createElement('span');
    indicator.className = 'kpi-trend';
    card.querySelector('.kpi-content').appendChild(indicator);
  }
  if (previous === 0) { indicator.textContent = ''; return; }
  const pct = ((current - previous) / previous * 100);
  const pctStr = Math.abs(pct) >= 1 ? Math.round(pct) : pct.toFixed(1);
  const titleAttr = tooltip ? ` title="${tooltip}"` : '';
  if (pct > 0) {
    indicator.innerHTML = `<span class="trend-up"${titleAttr}>↑ ${pctStr}%</span>`;
  } else if (pct < 0) {
    indicator.innerHTML = `<span class="trend-down"${titleAttr}>↓ ${Math.abs(pctStr)}%</span>`;
  } else {
    indicator.innerHTML = `<span class="trend-neutral"${titleAttr}>= 0%</span>`;
  }
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

  const enGestion = labels.map(arl => (data[arl] && data[arl].en_gestion) || 0);
  const completadas = labels.map(arl => (data[arl] && data[arl].completada) || 0);
  const cerradas = labels.map(arl => (data[arl] && data[arl].cerrada) || 0);

  // Okabe-Ito colorblind-safe + Bertin texture patterns
  const ctxCanvas = document.getElementById('chart-ordenes-arl').getContext('2d');
  const datasets = [
    { label: 'En Gestión', data: enGestion, backgroundColor: createPattern('#E69F00', 'diagonal'), borderColor: '#E69F00', borderWidth: 1, borderRadius: 2, maxBarThickness: 50 },
    { label: 'Completadas', data: completadas, backgroundColor: '#009E73', borderRadius: 2, maxBarThickness: 50 },
    { label: 'Cerradas', data: cerradas, backgroundColor: createPattern('#D55E00', 'dots'), borderColor: '#D55E00', borderWidth: 1, borderRadius: 2, maxBarThickness: 50 },
  ];

  state.charts.ordenesArl = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    plugins: [ChartDataLabels],
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top', labels: { boxWidth: 12, padding: 14, font: { size: 10, weight: '600' }, usePointStyle: true, pointStyle: 'rectRounded' } },
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

// Year filter state for evolution chart
let evolucionYearFilter = null;

function renderLineChartOrdenesMes(data) {
  // Generate year pills
  const allKeys = Object.keys(data);
  const years = [...new Set(allKeys.map(k => k.split('-')[0]))].sort();
  const pillsContainer = document.getElementById('year-pills');
  if (pillsContainer) {
    let pillsHtml = `<button class="year-pill ${!evolucionYearFilter ? 'active' : ''}" data-year="">Todos</button>`;
    years.forEach(y => {
      pillsHtml += `<button class="year-pill ${evolucionYearFilter === y ? 'active' : ''}" data-year="${y}">${y}</button>`;
    });
    // Last 12 months option
    pillsHtml += `<button class="year-pill ${evolucionYearFilter === '12m' ? 'active' : ''}" data-year="12m">Últ. 12 meses</button>`;
    pillsContainer.innerHTML = pillsHtml;

    pillsContainer.querySelectorAll('.year-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        evolucionYearFilter = btn.dataset.year || null;
        renderLineChartOrdenesMes(state.graficos.ordenes_por_mes || {});
      });
    });
  }

  // Filter data by selected year
  let filteredKeys = allKeys;
  if (evolucionYearFilter === '12m') {
    filteredKeys = allKeys.slice(-12);
  } else if (evolucionYearFilter) {
    filteredKeys = allKeys.filter(k => k.startsWith(evolucionYearFilter));
  }

  const filteredData = {};
  filteredKeys.forEach(k => { filteredData[k] = data[k]; });

  destroyChart('ordenesMes');
  const ctx = document.getElementById('chart-ordenes-mes').getContext('2d');

  const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const rawLabels = Object.keys(filteredData);
  const values = Object.values(filteredData);

  const labels = rawLabels.map((k, i) => {
    const [y, m] = k.split('-');
    const mesIdx = parseInt(m, 10) - 1;
    if (rawLabels.length <= 12) return `${MESES[mesIdx]} ${y}`;
    if (i === 0 || mesIdx === 0 || mesIdx === 6) return `${MESES[mesIdx]} ${y}`;
    return MESES[mesIdx];
  });

  state.charts.ordenesMes = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{ label: 'Órdenes', data: values,
        borderColor: ACCENT_COLOR, backgroundColor: ACCENT_COLOR_LIGHT,
        fill: true, tension: 0.3, pointBackgroundColor: ACCENT_COLOR,
        pointRadius: rawLabels.length > 24 ? 1 : 3,
        pointHoverRadius: 5,
        borderWidth: rawLabels.length > 24 ? 1.5 : 2,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => {
          const key = rawLabels[c.dataIndex];
          const [y, m] = key.split('-');
          return `${MESES[parseInt(m,10)-1]} ${y}: ${formatNumber(c.parsed.y)} órdenes`;
        } } },
      },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0, font: { size: 9 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 8 },
            maxRotation: 45,
            autoSkip: true,
            maxTicksLimit: rawLabels.length > 24 ? 14 : 24,
          },
        },
      },
    },
  });
}

function renderPieChartServicios(data) {
  destroyChart('servicios');
  const ctx = document.getElementById('chart-servicios').getContext('2d');
  const labels = Object.keys(data);
  const values = Object.values(data);

  // Bertin: Value (luminosity) + Okabe-Ito colorblind-safe
  const SERVICE_COLORS = ['#0072B2', '#56B4E9', '#009E73', '#E69F00', '#CC79A7', '#D55E00', '#F0E442'];

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

  // Sort by value descending and reverse for horizontal bar (bottom-up rendering)
  const sorted = Object.entries(data).sort((a, b) => a[1] - b[1]);
  const labels = sorted.map(e => e[0]);
  const values = sorted.map(e => e[1]);

  const BAR_COLORS = [
    '#0072B2', '#E69F00', '#009E73', '#56B4E9',
    '#D55E00', '#CC79A7', '#F0E442'
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

function openProyeccionModal(mesesHist) {
  fetchProyeccion(mesesHist || 12);
  document.getElementById('modal-proyeccion').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

async function fetchProyeccion(mesesHist) {
  try {
    const qs = buildQueryString();
    const sep = qs ? '&' : '?';
    const url = `${API_URL}${qs}${sep}meses_hist=${mesesHist}`;
    // Use cached ordenes to recalculate projection locally
    // Actually, just re-render with limited historical data from state.proyeccion
    const proy = state.proyeccion || {};
    if (proy.meses_historicos && proy.series) {
      // Limit historical months shown
      const limitedProy = {
        meses_historicos: proy.meses_historicos.slice(-mesesHist),
        meses_proyeccion: proy.meses_proyeccion,
        series: {},
      };
      const offset = proy.meses_historicos.length - limitedProy.meses_historicos.length;
      for (const [arl, data] of Object.entries(proy.series)) {
        limitedProy.series[arl] = {
          historico: data.historico.slice(offset),
          proyeccion: data.proyeccion,
          pendiente: data.pendiente,
        };
      }
      renderProyeccionIngresos(limitedProy);
    }
  } catch (e) {}
}

// Drilldown state for sub-filtering
let drilldownOrdenes = [];
let drilldownEstadoFilter = null;
let drilldownPage = 1;
const DRILLDOWN_PER_PAGE = 15;

function openDrilldown(title, ordenes) {
  document.getElementById('drilldown-title').textContent = title;
  drilldownOrdenes = ordenes;
  drilldownEstadoFilter = null;
  drilldownPage = 1;
  renderDrilldownContent();
  document.getElementById('modal-drilldown').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function renderDrilldownContent() {
  const ordenes = drilldownEstadoFilter
    ? drilldownOrdenes.filter(o => o.estado === drilldownEstadoFilter)
    : drilldownOrdenes;

  const total = drilldownOrdenes.length;
  const filteredTotal = ordenes.length;
  const ingresos = ordenes.reduce((s, o) => s + o.valor_facturado, 0);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTotal / DRILLDOWN_PER_PAGE));
  if (drilldownPage > totalPages) drilldownPage = totalPages;
  if (drilldownPage < 1) drilldownPage = 1;
  const start = (drilldownPage - 1) * DRILLDOWN_PER_PAGE;
  const pageData = ordenes.slice(start, start + DRILLDOWN_PER_PAGE);

  // Count by real estado (always from full set)
  const estadoCount = {};
  drilldownOrdenes.forEach(o => { estadoCount[o.estado] = (estadoCount[o.estado] || 0) + 1; });
  const estadosSorted = Object.entries(estadoCount).sort((a, b) => b[1] - a[1]);

  document.getElementById('drilldown-info').textContent = filteredTotal === total
    ? `${formatNumber(filteredTotal)} registros`
    : `${formatNumber(filteredTotal)} de ${formatNumber(total)} registros`;

  let summaryHtml = `
    <div class="modal-summary-card drilldown-filter-card ${!drilldownEstadoFilter ? 'active' : ''}" data-estado="">
      <span class="ms-value">${formatNumber(total)}</span><span class="ms-label">Todos</span>
    </div>
    <div class="modal-summary-card" style="pointer-events:none"><span class="ms-value">${formatCurrency(ingresos)}</span><span class="ms-label">Ingresos</span></div>`;

  estadosSorted.forEach(([estado, count]) => {
    const isActive = drilldownEstadoFilter === estado ? ' active' : '';
    summaryHtml += `<div class="modal-summary-card drilldown-filter-card${isActive}" data-estado="${escapeHtml(estado)}">
      <span class="ms-value">${formatNumber(count)}</span>
      <span class="ms-label"><span class="badge ${badgeClass(estado)}" style="font-size:0.6rem;padding:1px 6px">${estado}</span></span>
    </div>`;
  });

  document.getElementById('drilldown-summary').innerHTML = summaryHtml;

  document.querySelectorAll('.drilldown-filter-card').forEach(card => {
    card.addEventListener('click', () => {
      drilldownEstadoFilter = card.dataset.estado || null;
      drilldownPage = 1;
      renderDrilldownContent();
    });
  });

  const tbody = document.getElementById('drilldown-table-body');
  if (pageData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><p>Sin datos</p></div></td></tr>';
  } else {
    tbody.innerHTML = pageData.map(o => `<tr>
      <td>${o.id}</td><td>${o.fecha}</td><td>${escapeHtml(o.arl)}</td><td>${escapeHtml(o.empresa)}</td>
      <td>${escapeHtml(o.tipo_servicio)}</td><td class="col-trabajadores">${o.cantidad_trabajadores}</td>
      <td><span class="badge ${badgeClass(o.estado)}">${capitalize(o.estado)}</span></td>
      <td class="col-valor">${formatCurrency(o.valor_facturado)}</td>
    </tr>`).join('');
  }

  // Pagination controls
  const pagContainer = document.getElementById('drilldown-pagination');
  pagContainer.innerHTML = '';
  if (totalPages > 1) {
    const prev = createPageButton('« Anterior', drilldownPage > 1, () => { drilldownPage--; renderDrilldownContent(); });
    pagContainer.appendChild(prev);
    getPaginationRange(drilldownPage, totalPages).forEach(p => {
      if (p === '...') {
        const el = document.createElement('span'); el.className = 'page-info'; el.textContent = '…';
        pagContainer.appendChild(el);
      } else {
        const btn = document.createElement('button');
        btn.className = 'page-number' + (p === drilldownPage ? ' active' : '');
        btn.textContent = p;
        btn.addEventListener('click', () => { drilldownPage = p; renderDrilldownContent(); });
        pagContainer.appendChild(btn);
      }
    });
    const next = createPageButton('Siguiente »', drilldownPage < totalPages, () => { drilldownPage++; renderDrilldownContent(); });
    pagContainer.appendChild(next);
  }
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
    const categoriaMap = ['en_gestion', 'completada', 'cerrada'];
    const categoriaLabels = {'en_gestion': 'En Gestión', 'completada': 'Completadas', 'cerrada': 'Cerradas'};
    const categoria = categoriaMap[dsIdx];
    const completados = new Set(['Ejecutada', 'Soportes Radicados', 'Facturada']);
    const enGestion = new Set(['Recibida', 'Aceptada', 'Programada / Asignada', 'En Ejecución']);
    let filtered;
    if (categoria === 'completada') filtered = state.ordenes.filter(o => o.arl === arl && completados.has(o.estado));
    else if (categoria === 'en_gestion') filtered = state.ordenes.filter(o => o.arl === arl && enGestion.has(o.estado));
    else filtered = state.ordenes.filter(o => o.arl === arl && !completados.has(o.estado) && !enGestion.has(o.estado));
    openDrilldown(`${arl} — ${categoriaLabels[categoria]}`, filtered);
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
  trapFocus('modal-pendientes');
}

function closePendientesModal() {
  document.getElementById('modal-pendientes').classList.add('hidden');
  document.body.style.overflow = '';
}

function openOrdenesModal() {
  document.getElementById('modal-ordenes').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  trapFocus('modal-ordenes');
}

function closeOrdenesModal() {
  document.getElementById('modal-ordenes').classList.add('hidden');
  document.body.style.overflow = '';
}

// Accessibility: trap focus inside open modal
function trapFocus(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) setTimeout(() => closeBtn.focus(), 100);
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

  const COMPLETADOS = new Set(['Ejecutada', 'Soportes Radicados', 'Facturada']);
  const EN_GESTION = new Set(['Recibida', 'Aceptada', 'Programada / Asignada', 'En Ejecución']);
  const TODOS_ESTADOS = ['Recibida','Aceptada','Rechazada','Programada / Asignada','En Ejecución','Ejecutada','Soportes Radicados','Facturada','Reemplazada','Cancelada'];

  const byArl = {};
  ordenes.forEach(o => {
    if (!byArl[o.arl]) {
      byArl[o.arl] = { total: 0, completadas: 0, enGestion: 0, cerradas: 0, ingresos: 0, estados: {} };
      TODOS_ESTADOS.forEach(e => byArl[o.arl].estados[e] = 0);
    }
    byArl[o.arl].total++;
    byArl[o.arl].ingresos += o.valor_facturado;
    if (o.estado in byArl[o.arl].estados) byArl[o.arl].estados[o.estado]++;
    if (COMPLETADOS.has(o.estado)) byArl[o.arl].completadas++;
    else if (EN_GESTION.has(o.estado)) byArl[o.arl].enGestion++;
    else byArl[o.arl].cerradas++;
  });

  const sorted = Object.entries(byArl).sort((a, b) => b[1].total - a[1].total);

  const totalOrdenes = ordenes.length;
  const totalIngresos = ordenes.reduce((s, o) => s + o.valor_facturado, 0);
  const totalComp = ordenes.filter(o => COMPLETADOS.has(o.estado)).length;
  const tasaGlobal = totalOrdenes > 0 ? (totalComp / totalOrdenes * 100) : 0;
  const tasaGlobalStr = tasaGlobal % 1 === 0 ? tasaGlobal.toFixed(0) : tasaGlobal.toFixed(1);

  let html = `<div class="modal-summary-cards">
    <div class="modal-summary-card"><span class="ms-value">${sorted.length}</span><span class="ms-label">ARLs Activas</span></div>
    <div class="modal-summary-card"><span class="ms-value">${formatNumber(totalOrdenes)}</span><span class="ms-label">Total Órdenes</span></div>
    <div class="modal-summary-card"><span class="ms-value">${formatCurrency(totalIngresos)}</span><span class="ms-label">Ingresos Totales</span></div>
    <div class="modal-summary-card"><span class="ms-value">${tasaGlobalStr}%</span><span class="ms-label">Cumplimiento Global</span></div>
  </div>`;

  // Resumen por categoría
  html += `<div style="padding:0 20px 12px;"><div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
  <table><thead><tr><th>ARL</th><th style="text-align:center">Total</th><th style="text-align:center">Completadas</th><th style="text-align:center">En Gestión</th><th style="text-align:center">Cerradas</th><th style="text-align:right">Ingresos</th><th style="text-align:center">Cumplimiento</th></tr></thead><tbody>`;
  sorted.forEach(([arl, d]) => {
    const tasa = d.total > 0 ? (d.completadas / d.total * 100) : 0;
    const tasaStr = tasa % 1 === 0 ? tasa.toFixed(0) : tasa.toFixed(1);
    html += `<tr><td style="font-weight:600">${escapeHtml(arl)}</td>
      <td style="text-align:center">${d.total}</td>
      <td style="text-align:center"><span style="color:#10b981;font-weight:700">${d.completadas}</span></td>
      <td style="text-align:center"><span style="color:#f59e0b;font-weight:700">${d.enGestion}</span></td>
      <td style="text-align:center"><span style="color:#ef4444;font-weight:700">${d.cerradas}</span></td>
      <td style="text-align:right;font-variant-numeric:tabular-nums">${formatCurrency(d.ingresos)}</td>
      <td style="text-align:center;font-weight:700">${tasaStr}%</td></tr>`;
  });
  html += '</tbody></table></div></div>';

  // Desglose por estado real
  const estadosCortos = ['Recib.','Acept.','Rech.','Prog.','En Ejec.','Ejecut.','Sop. Rad.','Factur.','Reemp.','Cancel.'];
  html += `<div style="padding:0 20px 20px;"><div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;overflow-x:auto;">
  <table style="font-size:0.75rem"><thead><tr><th>ARL</th>`;
  TODOS_ESTADOS.forEach((e, i) => {
    html += `<th style="text-align:center;padding:8px 6px" title="${e}">${estadosCortos[i]}</th>`;
  });
  html += `</tr></thead><tbody>`;
  sorted.forEach(([arl, d]) => {
    html += `<tr><td style="font-weight:600">${escapeHtml(arl)}</td>`;
    TODOS_ESTADOS.forEach(e => {
      const v = d.estados[e] || 0;
      html += `<td style="text-align:center">${v > 0 ? v : '<span style="color:#d1d5db">-</span>'}</td>`;
    });
    html += '</tr>';
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

  const COMPLETADOS = new Set(['Ejecutada', 'Soportes Radicados', 'Facturada']);
  const EN_GESTION = new Set(['Recibida', 'Aceptada', 'Programada / Asignada', 'En Ejecución']);

  const comp = ordenes.filter(o => COMPLETADOS.has(o.estado)).length;
  const enGestion = ordenes.filter(o => EN_GESTION.has(o.estado)).length;
  const cerradas = total - comp - enGestion;
  const tasa = total > 0 ? (comp / total * 100) : 0;
  const tasaStr = tasa % 1 === 0 ? tasa.toFixed(0) : tasa.toFixed(1);

  let html = `<div class="modal-summary-cards">
    <div class="modal-summary-card"><span class="ms-value">${tasaStr}%</span><span class="ms-label">Tasa de Cumplimiento</span></div>
    <div class="modal-summary-card" style="border-left:3px solid #10b981"><span class="ms-value" style="color:#10b981">${formatNumber(comp)}</span><span class="ms-label">Completadas</span></div>
    <div class="modal-summary-card" style="border-left:3px solid #f59e0b"><span class="ms-value" style="color:#f59e0b">${formatNumber(enGestion)}</span><span class="ms-label">En Gestión</span></div>
    <div class="modal-summary-card" style="border-left:3px solid #ef4444"><span class="ms-value" style="color:#ef4444">${formatNumber(cerradas)}</span><span class="ms-label">Cerradas</span></div>
  </div>`;

  // By ARL
  const byArl = {};
  ordenes.forEach(o => {
    if (!byArl[o.arl]) byArl[o.arl] = { total: 0, completadas: 0, enGestion: 0, cerradas: 0 };
    byArl[o.arl].total++;
    if (COMPLETADOS.has(o.estado)) byArl[o.arl].completadas++;
    else if (EN_GESTION.has(o.estado)) byArl[o.arl].enGestion++;
    else byArl[o.arl].cerradas++;
  });

  const sorted = Object.entries(byArl).sort((a, b) => {
    const ta = a[1].total > 0 ? a[1].completadas / a[1].total : 0;
    const tb = b[1].total > 0 ? b[1].completadas / b[1].total : 0;
    return ta - tb;
  });

  html += `<div style="padding:0 20px 20px;"><div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
  <table><thead><tr><th>ARL</th><th style="text-align:center">Total</th><th style="text-align:center">Completadas</th><th style="text-align:center">En Gestión</th><th style="text-align:center">Cerradas</th><th style="text-align:center">Cumplimiento</th><th style="width:30%">Progreso</th></tr></thead><tbody>`;
  sorted.forEach(([arl, d]) => {
    const t = d.total > 0 ? (d.completadas / d.total * 100) : 0;
    const tStr = t % 1 === 0 ? t.toFixed(0) : t.toFixed(1);
    const barColor = t >= 80 ? '#10b981' : t >= 50 ? '#f59e0b' : '#ef4444';
    html += `<tr><td style="font-weight:600">${escapeHtml(arl)}</td>
      <td style="text-align:center">${d.total}</td>
      <td style="text-align:center"><span style="color:#10b981;font-weight:700">${d.completadas}</span></td>
      <td style="text-align:center"><span style="color:#f59e0b;font-weight:700">${d.enGestion}</span></td>
      <td style="text-align:center"><span style="color:#ef4444;font-weight:700">${d.cerradas}</span></td>
      <td style="text-align:center;font-weight:700">${tStr}%</td>
      <td><div style="background:#e5e7eb;border-radius:4px;height:8px;overflow:hidden"><div style="width:${t}%;height:100%;background:${barColor};border-radius:4px;transition:width 0.3s ease"></div></div></td></tr>`;
  });
  html += '</tbody></table></div></div>';
  container.innerHTML = html;

  // Render funnel chart
  renderFunnelChart();
}

function renderFunnelChart() {
  const ordenes = state.ordenes || [];
  const FLUJO = [
    'Recibida', 'Aceptada', 'Programada / Asignada', 'En Ejecución',
    'Ejecutada', 'Soportes Radicados', 'Facturada'
  ];
  const FLUJO_LABELS = [
    '1. Recibida', '2. Aceptada', '3. Programada', '4. En Ejecución',
    '5. Ejecutada', '6. Sop. Radicados', '7. Facturada'
  ];

  const counts = FLUJO.map(estado => ordenes.filter(o => o.estado === estado).length);
  const total = ordenes.length;

  if (state.charts.funnel) { state.charts.funnel.destroy(); state.charts.funnel = null; }

  const ctx = document.getElementById('chart-funnel');
  if (!ctx) return;

  // Semáforo: etapas tempranas=amarillo, ejecución=naranja, completadas=verde
  const FUNNEL_COLORS = ['#E69F00', '#E69F00', '#E69F00', '#D55E00', '#009E73', '#009E73', '#0072B2'];

  state.charts.funnel = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: FLUJO_LABELS,
      datasets: [{
        data: counts,
        backgroundColor: FUNNEL_COLORS,
        borderRadius: 4,
        barThickness: 22,
      }],
    },
    plugins: [ChartDataLabels],
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => {
          const pct = total > 0 ? (counts[c.dataIndex] / total * 100).toFixed(1) : 0;
          return `${formatNumber(counts[c.dataIndex])} órdenes (${pct}% del total)`;
        } } },
        datalabels: {
          display: function(context) { return context.dataset.data[context.dataIndex] > 0; },
          color: function(context) {
            const meta = context.chart.getDatasetMeta(0);
            const bar = meta.data[context.dataIndex];
            const barWidth = bar ? Math.abs(bar.x - bar.base) : 0;
            return barWidth > 60 ? 'rgba(255,255,255,0.9)' : '#374151';
          },
          font: { size: 10, weight: '700' },
          anchor: function(context) {
            const meta = context.chart.getDatasetMeta(0);
            const bar = meta.data[context.dataIndex];
            const barWidth = bar ? Math.abs(bar.x - bar.base) : 0;
            return barWidth > 60 ? 'center' : 'end';
          },
          align: function(context) {
            const meta = context.chart.getDatasetMeta(0);
            const bar = meta.data[context.dataIndex];
            const barWidth = bar ? Math.abs(bar.x - bar.base) : 0;
            return barWidth > 60 ? 'center' : 'end';
          },
          formatter: function(value) {
            const pct = total > 0 ? (value / total * 100).toFixed(0) : 0;
            return `${formatNumber(value)} (${pct}%)`;
          },
        },
      },
      scales: {
        x: { display: false },
        y: { grid: { display: false }, ticks: { font: { size: 10, weight: '600' }, color: '#374151' } },
      },
    },
  });

  // Simple analysis
  const analysisEl = document.getElementById('funnel-analysis');
  if (!analysisEl) return;

  const enEspera = counts[0] + counts[1] + counts[2] + counts[3];
  const completadas = counts[4] + counts[5] + counts[6];
  const pctComp = total > 0 ? (completadas / total * 100).toFixed(0) : 0;

  // Find where orders accumulate most in early stages
  const etapas = [
    {nombre: 'Recibida', val: counts[0], accion: 'pendientes de revisión y aceptación'},
    {nombre: 'Aceptada', val: counts[1], accion: 'aceptadas pero sin fecha de ejecución'},
    {nombre: 'Programada', val: counts[2], accion: 'con fecha asignada, esperando ejecución'},
    {nombre: 'En Ejecución', val: counts[3], accion: 'en proceso de ejecución actualmente'},
  ];
  const mayor = etapas.reduce((m, e) => e.val > m.val ? e : m, etapas[0]);

  let html = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px;">
    <div style="padding:8px 12px;background:#fff;border-radius:6px;border-left:3px solid #009E73;">
      <div style="font-size:1rem;font-weight:800;color:#009E73;">${pctComp}%</div>
      <div style="font-size:0.68rem;color:#5a6b7d;">Órdenes que completaron todo el flujo</div>
    </div>
    <div style="padding:8px 12px;background:#fff;border-radius:6px;border-left:3px solid #E69F00;">
      <div style="font-size:1rem;font-weight:800;color:#E69F00;">${formatNumber(enEspera)}</div>
      <div style="font-size:0.68rem;color:#5a6b7d;">Órdenes en proceso (sin completar)</div>
    </div>
  </div>`;

  if (mayor.val > 0) {
    html += `<p style="margin:0;"><strong>💡 Hallazgo:</strong> La mayor concentración de órdenes en gestión está en "<strong>${mayor.nombre}</strong>" con ${formatNumber(mayor.val)} órdenes ${mayor.accion}.</p>`;
  }

  if (counts[4] > counts[5] + 100) {
    html += `<p style="margin:6px 0 0;"><strong>📋 Acción sugerida:</strong> Hay ${formatNumber(counts[4] - counts[5])} órdenes ejecutadas sin radicar soportes. Esto frena la facturación.</p>`;
  }

  analysisEl.innerHTML = html;
}

// ==========================================================================
// Init
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  msArl = new MultiSelect(document.getElementById('ms-arl'));
  msServicio = new MultiSelect(document.getElementById('ms-servicio'));
  msEstado = new MultiSelect(document.getElementById('ms-estado'));
  msPrograma = new MultiSelect(document.getElementById('ms-programa'));
  msTarea = new MultiSelect(document.getElementById('ms-tarea'));

  dom.btnApply().addEventListener('click', () => fetchData());
  dom.btnClear().addEventListener('click', () => clearFilters());

  // Filter bar collapse toggle
  const filterToggle = document.getElementById('filter-toggle');
  const filterContent = document.getElementById('filter-bar-content');
  document.querySelector('.filter-bar-header').addEventListener('click', () => {
    filterContent.classList.toggle('collapsed');
    filterToggle.classList.toggle('collapsed');
  });

  // Export button
  document.getElementById('btn-export').addEventListener('click', () => {
    const params = new URLSearchParams();
    const fi = dom.fechaInicio().value;
    const ff = dom.fechaFin().value;
    if (fi) params.append('fecha_inicio', fi);
    if (ff) params.append('fecha_fin', ff);
    msArl.getSelected().forEach(v => params.append('arl', v));
    msServicio.getSelected().forEach(v => params.append('tipo_servicio', v));
    msEstado.getSelected().forEach(v => params.append('estado', v));
    msPrograma.getSelected().forEach(v => params.append('programa', v));
    msTarea.getSelected().forEach(v => params.append('tarea', v));
    const qs = params.toString();
    window.location.href = `/api/exportar${qs ? '?' + qs : ''}`;
  });

  // Cascade: ARL → Tipo Servicio → Programa → Tarea
  function updateDependentFilters() {
    const params = new URLSearchParams();
    msArl.getSelected().forEach(v => params.append('arl', v));
    msServicio.getSelected().forEach(v => params.append('tipo_servicio', v));
    msPrograma.getSelected().forEach(v => params.append('programa', v));
    const qs = params.toString();
    fetch(`/api/filtros${qs ? '?' + qs : ''}`).then(r => r.json()).then(data => {
      msServicio.setOptions(data.tipos_servicio || []);
      msPrograma.setOptions(data.programas || []);
      msTarea.setOptions(data.tareas || []);
    }).catch(() => {});
  }

  // Override close on ARL, Servicio, Programa to trigger cascade
  const origArlClose = msArl.close.bind(msArl);
  msArl.close = function() { const hadOpen = msArl.dropdown.classList.contains('open'); origArlClose(); if (hadOpen) updateDependentFilters(); };
  const origServClose = msServicio.close.bind(msServicio);
  msServicio.close = function() { const hadOpen = msServicio.dropdown.classList.contains('open'); origServClose(); if (hadOpen) updateDependentFilters(); };
  const origProgClose = msPrograma.close.bind(msPrograma);
  msPrograma.close = function() { const hadOpen = msPrograma.dropdown.classList.contains('open'); origProgClose(); if (hadOpen) updateDependentFilters(); };

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

  // ARLs modal — accesible desde el menú de resumen, sin tarjeta en el grid
  document.getElementById('modal-close-arls').addEventListener('click', () => { document.getElementById('modal-arls').classList.add('hidden'); document.body.style.overflow = ''; });
  document.getElementById('modal-arls').addEventListener('click', (e) => { if (e.target === e.currentTarget) { e.currentTarget.classList.add('hidden'); document.body.style.overflow = ''; } });

  // Cumplimiento modal
  document.getElementById('kpi-card-cumplimiento').addEventListener('click', () => openCumplimientoModal());
  document.getElementById('modal-close-cumplimiento').addEventListener('click', () => { document.getElementById('modal-cumplimiento').classList.add('hidden'); document.body.style.overflow = ''; });
  document.getElementById('modal-cumplimiento').addEventListener('click', (e) => { if (e.target === e.currentTarget) { e.currentTarget.classList.add('hidden'); document.body.style.overflow = ''; } });

  // Valor pendiente → fusionado en kpi-card-pendientes, ya registrado arriba

  // Cartera modal
  const cardCartera = document.getElementById('kpi-card-cartera');
  if (cardCartera) {
    cardCartera.addEventListener('click', () => openCarteraModal());
    document.getElementById('modal-close-cartera').addEventListener('click', () => {
      document.getElementById('modal-cartera').classList.add('hidden');
      document.body.style.overflow = '';
    });
    document.getElementById('modal-cartera').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) { e.currentTarget.classList.add('hidden'); document.body.style.overflow = ''; }
    });
  }

  // Tiempos proceso modal
  const cardDias = document.getElementById('kpi-card-dias-fact');
  if (cardDias) {
    cardDias.addEventListener('click', () => openTiemposModal());
    document.getElementById('modal-close-tiempos').addEventListener('click', () => {
      document.getElementById('modal-tiempos').classList.add('hidden');
      document.body.style.overflow = '';
    });
    document.getElementById('modal-tiempos').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) { e.currentTarget.classList.add('hidden'); document.body.style.overflow = ''; }
    });
  }

  // Projection modal
  document.getElementById('btn-proyeccion').addEventListener('click', (e) => {
    e.stopPropagation();
    openProyeccionModal(12);
  });
  document.getElementById('modal-close-proyeccion').addEventListener('click', () => {
    document.getElementById('modal-proyeccion').classList.add('hidden');
    document.body.style.overflow = '';
  });
  document.getElementById('modal-proyeccion').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) { e.currentTarget.classList.add('hidden'); document.body.style.overflow = ''; }
  });

  // Projection pills
  document.getElementById('proyeccion-pills').addEventListener('click', (e) => {
    const btn = e.target.closest('.year-pill');
    if (!btn) return;
    document.querySelectorAll('#proyeccion-pills .year-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const meses = parseInt(btn.dataset.meses) || 12;
    fetchProyeccion(meses);
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
      document.getElementById('modal-cartera')?.classList.add('hidden');
      document.getElementById('modal-tiempos')?.classList.add('hidden');
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

// ==========================================================================
// Cartera Modal — órdenes ejecutadas sin facturar por ARL
// ==========================================================================

function openCarteraModal() {
  const modal = document.getElementById('modal-cartera');
  const container = document.getElementById('cartera-container');
  if (!modal || !container) return;

  const cartera = state.cartera || [];
  const totalOrd = cartera.reduce((s, a) => s + a.cantidad, 0);
  const totalVal = cartera.reduce((s, a) => s + a.valor_total, 0);

  if (cartera.length === 0) {
    container.innerHTML = '<div style="padding:24px;text-align:center;color:#5a6b7d;font-size:0.85rem;">No hay órdenes ejecutadas sin facturar en el período seleccionado.</div>';
  } else {
    let html = `
      <div style="padding:16px 20px 8px;display:flex;gap:24px;flex-wrap:wrap;border-bottom:1px solid #e5e7eb;margin-bottom:8px;">
        <div style="text-align:center;">
          <div style="font-size:1.4rem;font-weight:800;color:#dc2626;">${formatNumber(totalOrd)}</div>
          <div style="font-size:0.7rem;color:#6b7280;font-weight:500;">Órdenes sin facturar</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:1.4rem;font-weight:800;color:#dc2626;">${formatCurrency(totalVal)}</div>
          <div style="font-size:0.7rem;color:#6b7280;font-weight:500;">Valor total cartera</div>
        </div>
      </div>
      <div style="padding:12px 20px;">
        <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:8px 10px;text-align:left;font-weight:700;color:#374151;border-bottom:2px solid #e5e7eb;">ARL</th>
              <th style="padding:8px 10px;text-align:right;font-weight:700;color:#374151;border-bottom:2px solid #e5e7eb;">Órdenes</th>
              <th style="padding:8px 10px;text-align:right;font-weight:700;color:#374151;border-bottom:2px solid #e5e7eb;">Valor</th>
              <th style="padding:8px 10px;text-align:right;font-weight:700;color:#374151;border-bottom:2px solid #e5e7eb;">Días Prom.</th>
              <th style="padding:8px 10px;text-align:right;font-weight:700;color:#374151;border-bottom:2px solid #e5e7eb;">Días Máx.</th>
            </tr>
          </thead>
          <tbody>`;

    cartera.forEach((row, i) => {
      const diasCls = row.dias_promedio > 30
        ? 'color:#dc2626;font-weight:700;'
        : row.dias_promedio > 15
          ? 'color:#d97706;font-weight:600;'
          : 'color:#059669;';
      html += `<tr style="border-bottom:1px solid #f3f4f6;${i % 2 === 1 ? 'background:#fafafa;' : ''}">
        <td style="padding:8px 10px;font-weight:600;">${escapeHtml(row.arl)}</td>
        <td style="padding:8px 10px;text-align:right;">${formatNumber(row.cantidad)}</td>
        <td style="padding:8px 10px;text-align:right;font-weight:600;">${formatCurrency(row.valor_total)}</td>
        <td style="padding:8px 10px;text-align:right;${diasCls}">${row.dias_promedio} días</td>
        <td style="padding:8px 10px;text-align:right;color:#6b7280;">${row.dias_max} días</td>
      </tr>`;
    });

    html += `</tbody></table>
      <div style="margin-top:12px;padding:10px 12px;background:#fff5f5;border-radius:6px;border:1px solid #fecaca;font-size:0.75rem;color:#991b1b;">
        <strong>⚠ Nota:</strong> Estas órdenes están en estado "Ejecutada" o "Soportes Radicados" y aún no han sido facturadas.
        Representan ingresos a recuperar. Valores en días calculados desde la fecha de ejecución o registro.
      </div>
    </div>`;

    container.innerHTML = html;
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// ==========================================================================
// Tiempos Proceso Modal — KPI: días ejecución → facturación
// ==========================================================================

function openTiemposModal() {
  const modal = document.getElementById('modal-tiempos');
  const container = document.getElementById('tiempos-container');
  if (!modal || !container) return;

  const tiempos = state.tiempos || {};
  const global = tiempos.global || {};
  const porArl = tiempos.por_arl || {};

  const ef = global.dias_ejecucion_facturacion || {};
  const re = global.dias_registro_ejecucion || {};
  const ct = global.dias_ciclo_total || {};

  function stat(s, label) {
    if (!s || s.cantidad === 0) return `<span style="color:#9ca3af;">Sin datos</span>`;
    const color = s.promedio > 30 ? '#dc2626' : s.promedio > 15 ? '#d97706' : '#059669';
    return `<span style="font-weight:700;color:${color};">${s.promedio} días</span>
            <span style="font-size:0.7rem;color:#6b7280;"> (${s.cantidad} registros)</span>`;
  }

  let html = `
    <div style="padding:16px 20px 0;">
      <p style="font-size:0.8rem;color:#5a6b7d;margin-bottom:16px;">
        Indicadores de tiempo del ciclo de gestión de órdenes. El KPI clave es
        <strong>Ejecución → Facturación</strong>, que mide la agilidad de la facturación posterior al servicio.
      </p>

      <!-- Resumen global -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
        <div style="padding:14px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;text-align:center;">
          <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;color:#0284c7;margin-bottom:6px;">Registro → Ejecución</div>
          <div>${stat(re, 'reg-ejec')}</div>
        </div>
        <div style="padding:14px;background:#fef9ec;border-radius:8px;border:1px solid #fde68a;text-align:center;">
          <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;color:#d97706;margin-bottom:6px;">Ejecución → Facturación ⭐</div>
          <div>${stat(ef, 'ejec-fact')}</div>
        </div>
        <div style="padding:14px;background:#f8fafc;border-radius:8px;border:1px solid #e5e7eb;text-align:center;">
          <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;color:#374151;margin-bottom:6px;">Ciclo Total</div>
          <div>${stat(ct, 'ciclo')}</div>
        </div>
      </div>

      <!-- Desglose por ARL -->
      <h4 style="font-size:0.78rem;font-weight:700;color:#1e2a3a;margin-bottom:10px;">Desglose por ARL — Ejecución → Facturación</h4>
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-bottom:16px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:8px 10px;text-align:left;font-weight:700;border-bottom:2px solid #e5e7eb;">ARL</th>
            <th style="padding:8px 10px;text-align:right;font-weight:700;border-bottom:2px solid #e5e7eb;">Prom. Ejec→Fact</th>
            <th style="padding:8px 10px;text-align:right;font-weight:700;border-bottom:2px solid #e5e7eb;">Mín.</th>
            <th style="padding:8px 10px;text-align:right;font-weight:700;border-bottom:2px solid #e5e7eb;">Máx.</th>
            <th style="padding:8px 10px;text-align:right;font-weight:700;border-bottom:2px solid #e5e7eb;">Registros</th>
          </tr>
        </thead>
        <tbody>`;

  const arlEntries = Object.entries(porArl).sort((a, b) => {
    const pa = a[1].dias_ejecucion_facturacion?.promedio || 0;
    const pb = b[1].dias_ejecucion_facturacion?.promedio || 0;
    return pb - pa;
  });

  arlEntries.forEach(([arl, d], i) => {
    const ef2 = d.dias_ejecucion_facturacion || {};
    if (!ef2.cantidad) return;
    const color = ef2.promedio > 30 ? '#dc2626' : ef2.promedio > 15 ? '#d97706' : '#059669';
    html += `<tr style="border-bottom:1px solid #f3f4f6;${i % 2 === 1 ? 'background:#fafafa;' : ''}">
      <td style="padding:8px 10px;font-weight:600;">${escapeHtml(arl)}</td>
      <td style="padding:8px 10px;text-align:right;font-weight:700;color:${color};">${ef2.promedio ?? '—'} días</td>
      <td style="padding:8px 10px;text-align:right;color:#6b7280;">${ef2.min ?? '—'} días</td>
      <td style="padding:8px 10px;text-align:right;color:#6b7280;">${ef2.max ?? '—'} días</td>
      <td style="padding:8px 10px;text-align:right;">${formatNumber(ef2.cantidad)}</td>
    </tr>`;
  });

  html += `</tbody></table>
      <div style="padding:10px 12px;background:#f0fdf4;border-radius:6px;border:1px solid #bbf7d0;font-size:0.75rem;color:#166534;">
        <strong>✓ Referencia:</strong> Un tiempo de facturación menor a 15 días es considerado óptimo.
        Entre 15 y 30 días es aceptable. Más de 30 días indica riesgo de glosas o pérdida de cartera.
      </div>
    </div>`;

  container.innerHTML = html;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
