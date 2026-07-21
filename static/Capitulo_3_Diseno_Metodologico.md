# Capítulo III. Diseño Metodológico

## Diseño de una Solución de Inteligencia de Negocios para la Gestión de Órdenes de Servicio ARL en la IPS SYSO Empresarial S.A.S.

---

## 3.1 Propósito

El diseño metodológico tiene como propósito definir el proceso mediante el cual se integrará, transformará y visualizará la información de las órdenes de servicio ARL, culminando en un tablero de inteligencia de negocios desarrollado en Python/Flask que permita el monitoreo en tiempo real y el apoyo a la toma de decisiones gerenciales en la IPS SYSO Empresarial & Laboratorio Clínico.

---

## 3.2 Tipo de Investigación y Enfoque

El proyecto se desarrolla bajo un enfoque **cuantitativo y aplicado**:

- **Cuantitativo:** se analizan datos numéricos y categóricos relacionados con las órdenes de servicio: estados del flujo operativo, ARL asociada, fechas de registro, ejecución y facturación, profesional responsable, tipo de servicio, empresa destinataria y valor facturado.
- **Aplicado:** se busca generar resultados prácticos y medibles que optimicen la operación, la facturación y la gestión administrativa de la IPS, a partir de herramientas de analítica de datos implementadas en un entorno de producción real.
- **Descriptivo-predictivo:** el proyecto combina analítica descriptiva (KPIs, gráficos de distribución, análisis de estados) con un componente predictivo de regresión lineal para la proyección de ingresos a seis meses.

Este enfoque permite medir, comparar y analizar grandes volúmenes de datos históricos y actuales (45.000 órdenes, periodo 2020–2026), identificar patrones y riesgos de vencimiento de cartera, y generar información útil para las decisiones estratégicas de la gerencia.

---

## 3.3 Fuentes y Características de los Datos

### 3.3.1 Clasificación de los Datos

Los datos utilizados en el proyecto son de tipo **estructurado**, organizados en registros tabulares con campos tipados (texto, fecha, numérico, categórico). Su fuente principal es la Matriz de Gestión ARL 2026 (MAT-ARL-001, versión 03), un archivo Excel con 45.000 registros que consolida todas las órdenes de servicio gestionadas por la IPS desde el año 2020.¹

> ¹ **Nota al pie (Word):** SYSO Empresarial S.A.S. (2026). *Matriz de Gestión ARL 2026* (MAT-ARL-001, versión 03) [Documento interno]. SYSO Empresarial & Laboratorio Clínico. Este documento es la fuente primaria de datos del proyecto y constituye el insumo central del proceso ETL.

### 3.3.2 Fuentes de Datos

| Fuente | Tipo | Contenido | Formato |
|---|---|---|---|
| Matriz de Gestión ARL 2026 | Primaria interna | Órdenes de servicio: ID, fecha, ARL, empresa, tipo servicio, estado, valor | Excel (.xlsx) |
| Portales de las ARL (Sura, Colmena, Bolívar, Alfa) | Primaria externa | Órdenes emitidas por cada administradora | Web / descarga manual |
| Reportes de facturación | Primaria interna | Fechas de facturación, valores facturados por ARL | Excel (.xlsx) |
| Reportes de cartera | Primaria interna | Órdenes ejecutadas sin facturar, días de antigüedad | Excel (.xlsx) |
| Resolución 3100 de 2019 | Secundaria regulatoria | Marco normativo de habilitación IPS | PDF |

### 3.3.3 Aspectos Éticos del Tratamiento de Datos

**Consentimiento informado:** Los datos de órdenes de servicio son registros administrativos y financieros de la IPS, no datos clínicos de pacientes. Su tratamiento se enmarca en la relación contractual entre la IPS y las ARL, por lo que no requiere consentimiento individual de pacientes. Sin embargo, en cumplimiento de la Ley 1581 de 2012, la IPS debe contar con políticas de tratamiento de datos aprobadas.²

**Anonimización:** En el entorno de demostración pública del tablero (https://syso-bi-dashboard.onrender.com), los datos son sintéticos: los nombres de empresas, responsables y valores son generados algorítmicamente a partir del catálogo real de servicios SYSO, sin exponer información real de ninguna organización o persona natural.

**Protección de datos sensibles:** El tablero en producción implementa autenticación con credenciales, uso de SECRET_KEY aleatoria generada por Render.com, y no persiste datos en disco entre sesiones. El acceso está restringido al personal autorizado de la IPS.

> ² **Nota al pie (Word):** Congreso de la República de Colombia. (2012). *Ley 1581 de 2012, por la cual se dictan disposiciones generales para la protección de datos personales*. Diario Oficial 48587. https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981


---

## 3.4 Variables y Atributos Clave

La siguiente tabla presenta las variables del modelo de datos implementado, clasificadas por tipo, fuente, métrica y relevancia para los objetivos del proyecto:

| Variable | Tipo | Fuente | Métrica principal | Relevancia para el proyecto |
|---|---|---|---|---|
| ID de orden | Cuantitativa discreta | Matriz ARL | Conteo total | Identifica unívocamente cada orden; base del KPI "Total Órdenes" |
| Fecha de registro | Cuantitativa continua (fecha) | Matriz ARL | Distribución mensual | Permite análisis temporal y proyección de tendencias |
| ARL asociada | Categórica nominal | Matriz ARL | Frecuencia por categoría | Segmenta el análisis por administradora; base de todos los KPIs por ARL |
| Empresa destinataria | Categórica nominal | Matriz ARL | Frecuencia por empresa | Identifica los clientes más activos y su concentración |
| Tipo de servicio | Categórica nominal | Catálogo SYSO | Frecuencia por tipo | Clasifica la oferta: Laboratorio, Pruebas Complementarias, Asesoría, Capacitación |
| Programa SVE | Categórica nominal | Catálogo SYSO | Frecuencia por programa | Permite filtros en cascada; análisis por línea de servicio |
| Tarea específica | Categórica nominal | Catálogo SYSO | Frecuencia por tarea | Nivel de detalle más granular del servicio prestado |
| Cantidad de trabajadores | Cuantitativa discreta | Orden de servicio | Suma, promedio | Mide el alcance poblacional de cada orden |
| Estado de la orden | Categórica ordinal | Matriz ARL | Frecuencia por estado | KPI central: tasa de cumplimiento, embudo de gestión |
| Valor facturado | Cuantitativa continua | Tarifario SYSO | Suma, promedio | Base de los KPIs de ingresos y cartera |
| Responsable | Categórica nominal | Registro interno | Frecuencia por profesional | Permite análisis de carga de trabajo por profesional |
| Fecha de ejecución | Cuantitativa continua (fecha) | Registro operativo | Diferencia con fecha registro | KPI: días registro → ejecución; identifica retrasos operativos |
| Fecha de facturación | Cuantitativa continua (fecha) | Registro financiero | Diferencia con fecha ejecución | KPI central Tabla 1: días ejecución → facturación; riesgo de glosas |

**Los 10 estados del flujo operativo** (variable "Estado de la orden") siguen el siguiente orden lógico:

```
Recibida → Aceptada → Programada/Asignada → En Ejecución
    → Ejecutada → Soportes Radicados → Facturada
    
Estados de cierre sin ingreso: Rechazada · Reemplazada · Cancelada
```

---

## 3.5 Fases del Proyecto (Adaptación CRISP-DM)

### 3.5.1 Comprensión del Negocio
- Identificación de los objetivos estratégicos y operativos de la IPS mediante entrevistas con el Analista Administrativo y el Director de Gestión ARL.
- Definición de los KPIs relevantes para la gerencia: total órdenes, ingresos, cumplimiento, cartera sin facturar y tiempo de facturación.
- Resultado: árbol del problema, preguntas de investigación y objetivos específicos (Capítulo 1).

### 3.5.2 Comprensión de los Datos
- Revisión de la Matriz de Gestión ARL 2026 (45.000 registros).
- Identificación de calidad de datos: campos incompletos, registros duplicados, fechas inconsistentes.
- Resultado: modelo unificado de datos con 13 variables documentadas (tabla 3.4 de este capítulo).

### 3.5.3 Preparación de los Datos (ETL)
- Depuración, estandarización y consolidación de los datos.
- Resultado: repositorio en memoria con patrón Repository/DAO, cargable desde Excel .xlsx.

### 3.5.4 Modelado
- Implementación de los 6 KPIs con sus fórmulas de cálculo.
- Regresión lineal OLS para proyección de ingresos a 6 meses.
- Resultado: servicio de negocio (`DashboardService`) con 10 métodos analíticos.

### 3.5.5 Evaluación
- Validación de KPIs con el personal administrativo de la IPS.
- Verificación de la coherencia de resultados con los datos históricos conocidos.
- Resultado: ajuste de umbrales de alerta (30 días para facturación).

### 3.5.6 Despliegue
- Publicación del tablero en Render.com con CI/CD automático desde GitHub.
- URL de producción: https://syso-bi-dashboard.onrender.com
- Resultado: tablero operativo accesible desde cualquier navegador, sin instalación.


---

## 3.6 Proceso ETL — Extracción, Transformación y Carga

### 3.6.1 Diagrama de Flujo ETL

```
┌─────────────────────────────────────────────────────────────┐
│                     FUENTES DE DATOS                        │
│  Matriz ARL (.xlsx)  │  Portales ARL  │  Registros internos │
└──────────┬──────────────────┬─────────────────┬─────────────┘
           │                  │                 │
           ▼                  ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTRACCIÓN (E)                            │
│  • Carga del archivo .xlsx mediante openpyxl               │
│  • Lectura fila a fila desde la fila 2 (encabezado en f.1) │
│  • Validación de existencia y tipo de archivo              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 TRANSFORMACIÓN (T)                          │
│  • Conversión de fechas ISO (YYYY-MM-DD)                   │
│  • Tipado: str → float (valor), str → int (trabajadores)   │
│  • Normalización de campos de texto (strip, uppercase)     │
│  • Validación de estados contra catálogo de 10 estados     │
│  • Generación de campos derivados:                         │
│      dias_ejecucion = fecha_ejecucion - fecha_registro     │
│      dias_facturacion = fecha_facturacion - fecha_ejecucion│
│  • Manejo de valores nulos: defaults por tipo de campo     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      CARGA (L)                              │
│  • Almacenamiento en repositorio en memoria (lista Python) │
│  • Patrón Repository/DAO: interfaz abstracta BaseRepository│
│  • Reemplazo atómico de datos al cargar nuevo archivo      │
│  • Disponibilidad inmediata para consulta por la API REST  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               CAPA DE SERVICIO Y ANÁLISIS                   │
│  DashboardService: filtrado, KPIs, agrupaciones, regresión │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  API REST (Flask)                           │
│  GET /api/datos → JSON con órdenes, KPIs, gráficos         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              TABLERO WEB (HTML/JS/Chart.js)                 │
│  Visualización en tiempo real desde el navegador           │
└─────────────────────────────────────────────────────────────┘
```

### 3.6.2 Descripción del Proceso

**Extracción:** Los datos se obtienen del archivo Excel de la Matriz ARL mediante la librería `openpyxl`. El endpoint `/gestion/upload` recibe el archivo .xlsx, lo procesa en memoria y lo carga al repositorio activo sin necesidad de base de datos externa.

**Transformación:** Cada fila se convierte en un objeto `Orden` (dataclass Python) con validación de tipos. Las fechas se parsean en formato ISO 8601, los valores numéricos se convierten con manejo de nulos, y los campos de texto se normalizan eliminando espacios. Los campos `fecha_ejecucion` y `fecha_facturacion` son opcionales y se procesan condicionalmente según el estado de la orden.³

**Carga:** Las órdenes transformadas se almacenan en una lista Python gestionada por el `FakeDataRepository` (entorno de demostración) o por un repositorio real conectado a la Matriz ARL. El patrón Repository/DAO permite intercambiar la fuente de datos (Excel, MySQL, PostgreSQL) sin modificar la lógica de negocio.

> ³ **Nota al pie (Word):** La arquitectura Repository/DAO implementada sigue el principio de inversión de dependencias (SOLID-D), documentado por Martin, R. C. (2003) en *Agile Software Development, Principles, Patterns, and Practices* (Pearson). Este diseño garantiza que la migración de datos de ejemplo a datos reales de producción no requiera cambios en el servicio de negocio ni en el tablero.


---

## 3.7 Métodos Analíticos

### 3.7.1 Analítica Descriptiva — KPIs e Indicadores

Se aplica analítica descriptiva sobre el conjunto de órdenes filtradas para calcular los 6 KPIs del tablero. Este método responde a las preguntas de investigación 1 y 2 del Capítulo 1: ¿cómo integrar la información dispersa? y ¿qué variables permiten identificar retrasos e inconsistencias?

**Justificación:** La analítica descriptiva es el nivel más adecuado para el diagnóstico operativo de una IPS que está migrando de hojas de cálculo a un sistema BI. Proporciona visibilidad inmediata sin requerir grandes volúmenes de datos etiquetados.

### 3.7.2 Analítica Descriptiva — Agrupaciones y Gráficos

Se generan cuatro tipos de agrupaciones: por ARL (distribución de estados), por mes (evolución temporal), por tipo de servicio (composición del portafolio) e ingresos por ARL (concentración financiera). Estas agrupaciones se visualizan mediante gráficos interactivos construidos con Chart.js (versión 4.4.1) en el frontend.⁴

> ⁴ **Nota al pie (Word):** Chart.js es una librería de visualización JavaScript de código abierto con más de 60.000 estrellas en GitHub. Su elección responde a la necesidad de visualizaciones interactivas sin dependencias de servidor adicionales, compatible con el entorno Flask/Jinja2. Disponible en https://www.chartjs.org

### 3.7.3 Analítica Predictiva — Regresión Lineal Simple (OLS)

Se aplica regresión lineal por mínimos cuadrados ordinarios para proyectar los ingresos mensuales por ARL para los próximos 6 meses. Este método responde a la pregunta de investigación 4: ¿qué diseño de tablero permite visualizar indicadores críticos de manera efectiva?

**Justificación de la elección:** La regresión lineal simple fue seleccionada por tres razones: (1) los datos de ingresos mensuales muestran tendencias aproximadamente lineales con estacionalidad leve; (2) el modelo es interpretable por el equipo administrativo sin conocimientos estadísticos avanzados; y (3) su implementación en Python puro (sin librerías externas) garantiza portabilidad y minimiza dependencias en el entorno de despliegue.⁵

**Fórmula implementada:**
```
b₁ = (n·Σxy − Σx·Σy) / (n·Σx² − (Σx)²)
b₀ = (Σy − b₁·Σx) / n
ŷ[i] = max(0, b₀ + b₁ · i)
```
Donde x representa el índice de mes (0, 1, 2, ..., n-1) e y los ingresos reales de cada mes.

> ⁵ **Nota al pie (Word):** Montgomery, D. C., Peck, E. A., & Vining, G. G. (2012). *Introduction to linear regression analysis* (5.ª ed.). Wiley. La restricción `max(0, ŷ)` garantiza que las proyecciones no generen valores negativos, lo cual carecería de sentido económico en el contexto de ingresos por servicios de salud.

### 3.7.4 Analítica de Tiempos — Ciclo de Gestión

Se calculan tres métricas de tiempo para cada orden con fechas registradas:
- **Días registro → ejecución:** mide la agilidad operativa
- **Días ejecución → facturación:** KPI central de la Tabla 1 del documento; mide la agilidad administrativa
- **Días ciclo total:** mide la eficiencia integral del proceso

Estas métricas se agregan a nivel global y por ARL, generando estadísticas de promedio, mínimo y máximo para identificar las administradoras con mayor rezago en facturación.

---

## 3.8 Técnicas de Validación

### 3.8.1 Validación del Modelo Predictivo (Regresión Lineal)

La validación del modelo de regresión se realiza mediante las siguientes métricas sobre los datos históricos disponibles:⁶

| Métrica | Fórmula | Interpretación |
|---|---|---|
| RMSE (Raíz del Error Cuadrático Medio) | √(Σ(ŷ−y)²/n) | Mide el error promedio en las mismas unidades que los ingresos ($COP) |
| MAE (Error Absoluto Medio) | Σ\|ŷ−y\|/n | Mide el error absoluto promedio; menos sensible a outliers que RMSE |
| R² (Coeficiente de determinación) | 1 − SS_res/SS_tot | Proporción de varianza explicada por el modelo (0 a 1) |

**Procedimiento de validación:** Se reservan los últimos 3 meses del histórico como conjunto de prueba (holdout), se entrena el modelo con los meses anteriores, y se evalúan las métricas sobre los meses reservados. Este proceso se repite para cada ARL de forma independiente.

> ⁶ **Nota al pie (Word):** Hastie, T., Tibshirani, R., & Friedman, J. (2009). *The elements of statistical learning: Data mining, inference, and prediction* (2.ª ed.). Springer. Disponible en acceso abierto: https://hastie.su.domains/ElemStatLearn/. Las métricas RMSE y MAE son las más utilizadas para evaluar modelos de regresión en series de tiempo cortas (< 36 puntos).

### 3.8.2 Validación Funcional del Tablero

La validación funcional del tablero se realiza mediante tres niveles:

1. **Pruebas unitarias automatizadas (pytest):** 23 tests que verifican el cálculo correcto de KPIs, la lógica de filtrado, las agrupaciones y el comportamiento de la regresión lineal con datos conocidos.
2. **Validación con el personal administrativo:** revisión de los indicadores con el Analista de Gestión ARL y el Director Administrativo de la IPS para confirmar que los resultados son coherentes con el conocimiento operativo del proceso.
3. **Pruebas de interfaz:** verificación de que los filtros en cascada, los modales de detalle y la exportación Excel funcionan correctamente en los principales navegadores (Chrome, Firefox, Edge).


---

## 3.9 Tabla de Trazabilidad — Objetivos, Actividades y Evidencias

La siguiente tabla relaciona cada objetivo específico del proyecto con las actividades planificadas, las herramientas utilizadas y las evidencias o productos generados:

| Objetivo específico | Actividades planificadas | Herramientas | Evidencias / Productos |
|---|---|---|---|
| Identificar las fuentes de datos disponibles y las variables clave | Revisión documental de la Matriz ARL; entrevistas con personal administrativo; análisis de calidad de datos | Excel, Word | Tabla de variables (sección 3.4); árbol del problema (Cap. 1) |
| Diseñar un modelo unificado de datos | Definición de la estructura del dataclass `Orden`; normalización de campos; diseño del catálogo de estados | Python (dataclasses) | Modelo `Orden` con 13 campos; diagrama de estructura de datos |
| Diseñar el flujo ETL propuesto | Implementación del pipeline de carga Excel; transformación y validación de campos; patrón Repository/DAO | Python, openpyxl | Diagrama ETL (sección 3.6); endpoint `/gestion/upload` |
| Definir los KPIs para el seguimiento del proceso | Cálculo de 6 indicadores con fórmulas; definición de umbrales de alerta; validación con personal IPS | Python (DashboardService) | Tabla de KPIs (sección 2.5 Cap. 2); Guía de Tarjetas KPI |
| Proponer el diseño funcional del tablero interactivo | Desarrollo del tablero Flask; implementación de filtros en cascada, gráficos y modales; despliegue en Render | Python, Flask, Chart.js, HTML/CSS/JS, Render.com | Tablero en producción: https://syso-bi-dashboard.onrender.com |

---

## 3.10 Diagrama de Flujo del Proceso Operativo ARL

El flujo del proceso de gestión ARL en la IPS SYSO Empresarial comprende las siguientes etapas secuenciales, que corresponden a los 10 estados del modelo de datos:

```
┌─────────────────────────────────────────────────────────────┐
│              PROCESO OPERATIVO — ORDEN ARL                  │
└─────────────────────────────────────────────────────────────┘

1. Ingreso al portal de la ARL
       ↓
2. Descarga de la orden de servicio → [Estado: RECIBIDA]
       ↓
3. Revisión y decisión de aceptación
       ├─→ [Estado: RECHAZADA] → Fin del flujo
       └─→ [Estado: ACEPTADA]
              ↓
4. Registro en la Matriz de Gestión ARL
       ↓
5. Asignación al profesional responsable
       ↓ [Estado: PROGRAMADA / ASIGNADA]
6. Programación de la actividad (Sura, Bolívar, Colmena, Alfa)
       ↓ [Estado: EN EJECUCIÓN]
7. Ejecución del servicio (laboratorio, prueba, asesoría, capacitación)
       ↓ [Estado: EJECUTADA]  ← fecha_ejecucion registrada
8. Validación y carga de soportes
       ↓ [Estado: SOPORTES RADICADOS]
9. Facturación a la ARL correspondiente
       ↓ [Estado: FACTURADA]  ← fecha_facturacion registrada
10. Seguimiento a facturas y cartera

Estados especiales:
   [REEMPLAZADA] → La orden fue sustituida por otra
   [CANCELADA]   → La orden fue anulada sin ejecución
```

**KPI derivado:** El tiempo entre el paso 7 (EJECUTADA) y el paso 9 (FACTURADA) es el indicador "Días Prom. Facturación", cuyo umbral de alerta es 30 días.

---

## 3.11 Herramientas y Tecnologías

### Tabla 2. Stack tecnológico del proyecto

| Categoría | Herramienta / Tecnología | Versión | Uso en el proyecto |
|---|---|---|---|
| **Lenguaje backend** | Python | 3.12 | Lógica de negocio, ETL, API REST, modelos analíticos |
| **Framework web** | Flask | 3.1.0 | Servidor web, rutas, API REST, autenticación |
| **Servidor producción** | Gunicorn | 22.0.0 | WSGI para despliegue en Render.com |
| **Procesamiento Excel** | openpyxl | 3.1.5 | Lectura de archivos .xlsx (ETL) y exportación de reportes |
| **Visualización frontend** | Chart.js | 4.4.1 | 4 gráficos interactivos + 2 gráficos en modales |
| **Plugin gráficos** | chartjs-plugin-datalabels | 2.2.0 | Etiquetas de datos en barras y doughnut |
| **Frontend** | HTML5, CSS3, JavaScript ES6+ | — | Interfaz del tablero, filtros en cascada, modales |
| **Testing** | pytest | 8.3.4 | 23 pruebas unitarias automatizadas |
| **Testing propiedades** | hypothesis | 6.100.0 | Pruebas basadas en propiedades para casos extremos |
| **Control de versiones** | Git + GitHub | — | Repositorio: github.com/carlosbax25/syso-bi-dashboard |
| **Hosting / CI-CD** | Render.com | Free tier | Deploy automático al hacer push a rama main |
| **Edición de datos** | Microsoft Excel | — | Fuente de datos: Matriz ARL 2026 |
| **Documentación** | Microsoft Word | — | Informe del proyecto |

*Nota: A diferencia de lo planificado en la fase de diseño inicial, la implementación final utilizó Chart.js (JavaScript) en lugar de Plotly/Dash, y Python puro para los modelos analíticos en lugar de pandas/matplotlib. Esta decisión redujo las dependencias del proyecto y mejoró el rendimiento del tablero en el entorno de despliegue gratuito de Render.com.*


---

## 3.12 Cronograma General

### Tabla 3. Cronograma por semanas — Semestre I 2026

| Semana | Fase CRISP-DM | Actividades principales | Hito / Entregable |
|---|---|---|---|
| 1–2 | Comprensión del negocio | Entrevistas con personal IPS; revisión de la Matriz ARL; identificación del problema | Árbol del problema; preguntas de investigación (Cap. 1) |
| 3–4 | Comprensión de los datos | Análisis de calidad de datos; identificación de variables; revisión de fuentes | Tabla de variables; diagnóstico de calidad de datos |
| 5–6 | Preparación de datos (ETL) | Diseño del modelo de datos; implementación del pipeline ETL; validación de campos | Modelo `Orden`; endpoint de carga Excel |
| 7–8 | Modelado | Implementación de KPIs; desarrollo de agrupaciones y gráficos; regresión lineal | `DashboardService` con 10 métodos; tablero versión 1 |
| 9 | Evaluación | Validación de KPIs con personal IPS; ajuste de umbrales y etiquetas | Tablero ajustado; métricas de validación (RMSE, MAE) |
| 10 | Despliegue | Publicación en Render.com; pruebas en producción; documentación técnica | URL en producción; tests automatizados (23 pruebas) |
| 11–12 | Documentación | Redacción del informe final (Caps. 1, 2, 3); preparación de la presentación | Informe completo; presentación ejecutiva |
| 13 | — | Revisión con tutor académica; ajustes finales | **Entrega final del proyecto integrador** |
| 14 | — | **Defensa del proyecto** | **Sustentación ante jurado** |

---

## 3.13 Riesgos y Aspectos Éticos

### Tabla 4. Matriz de riesgos del proyecto

| Riesgo identificado | Categoría | Impacto potencial | Probabilidad | Estrategia de mitigación |
|---|---|---|---|---|
| Disponibilidad limitada de datos reales de la Matriz ARL | Técnico | No poder validar los KPIs con datos reales de producción | Media | Generación de datos sintéticos realistas basados en el catálogo real de 76 servicios SYSO; diseño ETL listo para recibir datos reales |
| Baja calidad de datos en la Matriz ARL (duplicados, campos vacíos, fechas inconsistentes) | Técnico | KPIs imprecisos; indicadores de tiempo no calculables | Alta | Proceso ETL con validación campo a campo; manejo de nulos con defaults; reporte de filas con errores al cargar |
| Ausencia de fechas de ejecución y facturación en registros históricos | Técnico | KPIs de tiempo (días facturación) con cobertura parcial | Alta | Los campos son opcionales; el KPI se calcula solo sobre registros con ambas fechas disponibles; se documenta el porcentaje de cobertura |
| Sobreajuste del modelo de regresión lineal | Analítico | Proyecciones de ingresos poco confiables | Baja | Modelo lineal simple (baja varianza); validación holdout con últimos 3 meses; restricción `max(0, ŷ)` para valores sin sentido |
| Sesgo en datos históricos por efecto COVID-19 (2020–2021) | Analítico | Tendencias distorsionadas por baja actividad atípica | Media | Parametrización de meses históricos para la regresión (configurable: 6, 12 o 24 meses); el usuario puede excluir períodos atípicos |
| Exposición de datos sensibles de pacientes o empresas | Ético / Legal | Sanción bajo Ley 1581 de 2012; daño reputacional de la IPS | Baja | Datos sintéticos en producción pública; autenticación obligatoria; SECRET_KEY aleatoria generada por Render; sin persistencia de datos en disco |
| Decisiones automatizadas injustas basadas en indicadores | Ético | Evaluación inequitativa de ARLs o responsables | Baja | Los indicadores son informativos, no decisorios automáticos; el tablero presenta datos, no recomendaciones vinculantes |
| Dependencia de infraestructura gratuita (Render free tier) | Operativo | Caídas del servicio; latencia elevada en carga inicial | Media | Documentación del proceso de migración a plan de pago; arquitectura stateless que facilita el cambio de proveedor |
| Resistencia al cambio del personal administrativo | Organizacional | Baja adopción del tablero; retorno al uso de Excel | Media | Interfaz intuitiva sin curva de aprendizaje; filtros familiares; exportación Excel para transición gradual |

---

## 3.14 Referencias

Chapman, P., Clinton, J., Kerber, R., Khabaza, T., Reinartz, T., Shearer, C., & Wirth, R. (2000). *CRISP-DM 1.0: Step-by-step data mining guide*. SPSS Inc. https://www.the-modeling-agency.com/crisp-dm.pdf

Chaudhuri, S., Dayal, U., & Narasayya, V. (2011). An overview of business intelligence technology. *Communications of the ACM*, *54*(8), 88–98. https://doi.org/10.1145/1978542.1978562

Congreso de la República de Colombia. (2012). *Ley 1581 de 2012, por la cual se dictan disposiciones generales para la protección de datos personales*. Diario Oficial 48587. https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981

Few, S. (2012). *Show me the numbers: Designing tables and graphs to enlighten* (2.ª ed.). Analytics Press.

Hastie, T., Tibshirani, R., & Friedman, J. (2009). *The elements of statistical learning: Data mining, inference, and prediction* (2.ª ed.). Springer. https://hastie.su.domains/ElemStatLearn/

Martin, R. C. (2003). *Agile software development, principles, patterns, and practices*. Pearson.

Ministerio de Salud y Protección Social. (2019). *Resolución 3100 del 25 de noviembre de 2019, por la cual se definen los procedimientos y condiciones de inscripción de los prestadores de servicios de salud*. https://www.minsalud.gov.co/Normatividad_Nuevo/Resolución-3100-de-2019.pdf

Montgomery, D. C., Peck, E. A., & Vining, G. G. (2012). *Introduction to linear regression analysis* (5.ª ed.). Wiley.

SYSO Empresarial S.A.S. (2026). *Matriz de Gestión ARL 2026* (MAT-ARL-001, versión 03) [Documento interno]. SYSO Empresarial & Laboratorio Clínico.

---

*Nota general sobre las notas al pie: Cada nota marcada con superíndice (¹, ², ³...) debe insertarse en Microsoft Word usando: **Referencias → Insertar nota al pie** (Alt + Ctrl + F en Windows). El texto de cada nota está incluido inmediatamente después del párrafo correspondiente.*

---

*Especialización en Analítica de Datos e Información — Fundación Universitaria Tecnológico Comfenalco · Semestre I 2026*
*© 2026 SYSO EMPRESARIAL S.A.S.*
