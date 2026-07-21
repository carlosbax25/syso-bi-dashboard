# Dashboard BI — IPS SYSO Empresarial & Laboratorio Clínico
## Especificaciones Técnicas y Funcionales

---

### 1. Descripción General

Solución de analítica de datos que integra, transforma y visualiza la información de las órdenes de servicio provenientes de las ARL (Administradoras de Riesgos Laborales), mediante un tablero de inteligencia de negocios desarrollado en Python que apoya la toma de decisiones en la IPS SYSO Empresarial & Laboratorio Clínico.

**URL de producción:** https://syso-bi-dashboard.onrender.com

---

### 2. Stack Tecnológico

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Backend | Python + Flask | 3.14 / 3.1.0 |
| Frontend | HTML5, CSS3, JavaScript (vanilla) | ES6+ |
| Gráficos | Chart.js | 4.4.1 |
| Data Labels | chartjs-plugin-datalabels | 2.2.0 |
| Servidor producción | Gunicorn | 22.0.0 |
| Hosting | Render.com | Free tier |
| Control de versiones | Git + GitHub | — |
| Procesamiento Excel | openpyxl | 3.1.5 |
| Testing | pytest + hypothesis | 8.3.4 / 6.100.0 |

---

### 3. Arquitectura

**Patrón:** MVC (Modelo-Vista-Controlador) + Repository/DAO

```
├── app.py                    → Punto de entrada, factory pattern
├── config.py                 → Configuración
├── models/orden.py           → Modelo de datos (dataclass)
├── repositories/
│   ├── base_repository.py    → Interfaz abstracta (ABC)
│   └── fake_data_repository.py → Generador de datos con catálogo real
├── services/
│   └── dashboard_service.py  → Lógica de negocio, KPIs, proyecciones
├── controllers/
│   ├── dashboard_controller.py → Rutas del dashboard
│   ├── api_controller.py     → API REST JSON
│   ├── auth_controller.py    → Autenticación
│   ├── gestion_controller.py → Panel de gestión
│   └── resumen_controller.py → Resumen ejecutivo
├── templates/                → Vistas HTML (Jinja2)
├── static/                   → CSS, JS, logos, Excel
└── tests/                    → Tests unitarios y de propiedades
```

---

### 4. Módulos y Funcionalidades

#### 4.1 Dashboard BI (Vista principal)
- 6 tarjetas KPI interactivas (cada una abre modal con detalle)
- Indicadores de tendencia mensual (↑↓ con tooltip comparativo)
- 4 gráficos interactivos con drill-down al hacer clic
- Filtros en cascada: ARL → Tipo de Servicio → Programa → Tarea + Estado + Fechas
- Barra de filtros colapsable
- Exportar a Excel (.xlsx) con datos filtrados
- Indicador de última actualización de datos

#### 4.2 Gráficos

| Gráfico | Tipo | Función |
|---------|------|---------|
| Órdenes por ARL | Barras apiladas | Distribución por estado (En Gestión / Completadas / Cerradas) |
| Evolución Mensual | Línea con área | Tendencia temporal con pills de filtro por año |
| Distribución por Servicio | Doughnut | Proporción de tipos de servicio |
| Ingresos por ARL | Barras horizontales | Facturación con % de participación |
| Proyección +6 meses | Línea multi-serie | Predicción por ARL (modal) |
| Embudo de flujo | Barras horizontales | Estados del proceso con análisis (modal) |

#### 4.3 Modales Interactivos
- **Total Órdenes** → tabla paginada con sorting
- **Ingresos** → desglose por ARL y por servicio
- **ARLs Activas** → tabla con estados y cumplimiento
- **Cumplimiento** → barras de progreso + embudo + análisis automático
- **Pendientes** → análisis de gestión con días de antigüedad
- **Drill-down** → filtro dinámico por estado con tarjetas clickeables

#### 4.4 Resumen Ejecutivo (Storytelling)
- Framework SCR: Situación → Complicación → Pregunta → Resolución
- Datos clave por ARL con semáforo visual
- Mensaje central generado dinámicamente

#### 4.5 Panel de Gestión
- Carga masiva de datos desde Excel (.xlsx)
- Formulario de registro individual de órdenes
- Tabla de órdenes con paginación
- Descarga de formato con listas desplegables

#### 4.6 Autenticación
- Login con credenciales
- Protección de rutas
- Sesiones Flask

---

### 5. Modelo Predictivo

**Algoritmo:** Regresión Lineal Simple (OLS - Ordinary Least Squares)

**Implementación:** Python puro (sin dependencias externas de ML)

**Proceso:**
1. Agrupa ingresos mensuales por ARL (últimos 12 meses completos)
2. Calcula pendiente e intercepto por mínimos cuadrados
3. Proyecta 6 meses futuros extrapolando la tendencia
4. Excluye el mes en curso (datos parciales) para evitar sesgo

**Fórmula:**
```
pendiente = (n·Σxy - Σx·Σy) / (n·Σx² - (Σx)²)
intercepto = (Σy - pendiente·Σx) / n
proyección[i] = max(0, intercepto + pendiente · i)
```

**Períodos configurables:** 6, 12 o 24 meses históricos como base

---

### 6. Visualización de Datos — Principios Aplicados

#### Variables de Bertin (Sémiologie Graphique, 1967)
- **Posición:** ejes X/Y para codificar cantidad y tiempo
- **Tamaño:** longitud de barras proporcional a valores
- **Color (tono):** paleta Okabe-Ito para accesibilidad daltónica
- **Valor (luminosidad):** gradientes para jerarquía
- **Orientación:** flechas ↑↓ para tendencias
- **Textura:** patrones en barras apiladas (rayas, puntos)

#### Accesibilidad (WCAG 2.1)
- Paleta Okabe-Ito (colorblind-safe)
- Patrones en gráficos (no depende solo del color)
- Skip link para navegación por teclado
- role="dialog" y aria-modal en modales
- Focus visible y focus trap
- Contraste mínimo 4.5:1 en textos

---

### 7. Datos

**Volumen actual:** 45,000 órdenes (datos de ejemplo)

**Período:** Enero 2020 — Mayo 2026

**Catálogo de servicios:** Basado en Excel real de SYSO con 76 servicios de 4 ARLs

**Estacionalidad simulada:**
- Enero/Febrero: alta demanda (renovación contratos)
- Julio/Diciembre: baja demanda (vacaciones)
- Crecimiento anual progresivo (60% en 2020 → 115% en 2026)

**Campos del modelo:**
ID, Fecha, ARL, Empresa, Tipo de Servicio, Programa, Tarea, Cantidad Trabajadores, Estado, Valor Facturado

**10 estados del flujo:**
Recibida → Aceptada → Rechazada → Programada/Asignada → En Ejecución → Ejecutada → Soportes Radicados → Facturada → Reemplazada → Cancelada

---

### 8. Despliegue

- **Repositorio:** github.com/carlosbax25/syso-bi-dashboard
- **CI/CD:** Auto-deploy en Render al hacer push a main
- **Comando build:** pip install -r requirements.txt
- **Comando start:** gunicorn "app:create_app()"
- **Runtime:** Python 3.12

---

### 9. Testing

- 23 tests unitarios (pytest)
- Tests de propiedades con hypothesis
- Cobertura: modelos, servicios, filtrado, agrupaciones, KPIs

---

### 10. Preparado para Producción

- Arquitectura Repository/DAO permite cambiar de datos fake a MySQL sin modificar lógica de negocio
- Modelo normalizado (3FN) documentado para MySQL
- Endpoint de carga Excel para migración de datos reales
- Formato Excel con validación (listas desplegables) para recolección de datos

---

*Desarrollado para la Especialización en Analítica de Datos — Fundación Universitaria Tecnológico Comfenalco*

*© 2026 SYSO EMPRESARIAL S.A.S.*
