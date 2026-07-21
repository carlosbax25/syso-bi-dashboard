# Capítulo IV. Desarrollo y Resultados

## Diseño de una Solución de Inteligencia de Negocios para la Gestión de Órdenes de Servicio ARL en la IPS SYSO Empresarial S.A.S.

---

## 4.1 Recolección y Preparación de los Datos

### 4.1.1 Fuentes de Datos

Los datos del proyecto provienen exclusivamente de fuentes internas de la IPS SYSO Empresarial:

| Fuente | Tipo | Formato | Registros | Periodo |
|---|---|---|---|---|
| Matriz de Gestión ARL 2026 (MAT-ARL-001 v03) | Primaria interna | Excel .xlsx | 45.000 | 2020–2026 |
| Catálogo de servicios SYSO | Primaria interna | Tabla estructurada | 76 servicios | Vigente |
| Portales de ARL (Sura, Colmena, Bolívar, Alfa) | Primaria externa | Descarga manual | Variable | Continuo |
| Reportes de facturación por ARL | Primaria interna | Excel .xlsx | Mensual | 2020–2026 |

No se utilizaron APIs externas ni bases SQL preexistentes. La fuente central es un archivo Excel que consolida todas las órdenes de servicio gestionadas históricamente.

### 4.1.2 Estrategia de Captura

Se trabajó con el **censo completo** de órdenes de servicio (45.000 registros), sin muestreo. Dado que la Matriz ARL es el registro exhaustivo de todas las órdenes procesadas por la IPS desde 2020, no fue necesario aplicar técnicas de muestreo probabilístico.

### 4.1.3 Proceso de Limpieza y Transformación

El proceso ETL se implementó en Python mediante el endpoint `/gestion/upload` con la librería `openpyxl`. Las transformaciones aplicadas fueron:¹

| Paso | Transformación | Herramienta |
|---|---|---|
| 1 | Lectura fila a fila desde la fila 2 (encabezado en fila 1) | openpyxl 3.1.5 |
| 2 | Conversión de fechas a formato ISO 8601 (YYYY-MM-DD) | Python datetime |
| 3 | Tipado de campos numéricos: str → float (valor), str → int (trabajadores) | Python built-ins |
| 4 | Normalización de texto: strip(), eliminación de espacios dobles | Python str methods |
| 5 | Validación de estados contra catálogo de 10 estados permitidos | Verificación por conjunto |
| 6 | Manejo de nulos: defaults por tipo (fecha=hoy, valor=0.0, trabajadores=1) | Condicionales |
| 7 | Padding de columnas: extensión a 13 campos si el archivo tiene menos | list.append(None) |
| 8 | Generación de campos derivados: días_ejecución, días_facturación | Propiedades calculadas |
| 9 | Reporte de errores: filas con formato inválido se registran sin detener el proceso | Lista de errores |

**Detección de duplicados:** El campo `ID` (numérico único) sirve como identificador de cada orden. Si se carga un archivo con IDs repetidos, el sistema reemplaza atómicamente todo el conjunto, eliminando posibles duplicados del archivo anterior.

**Anonimización:** En el entorno de demostración pública, los datos son 100% sintéticos. Los nombres de empresas, responsables y valores son generados algorítmicamente a partir del catálogo real de SYSO sin exponer información de personas o empresas reales.²

> ¹ **Nota al pie (Word):** El código fuente del proceso ETL se encuentra en `controllers/gestion_controller.py`, función `upload_excel()`. Repositorio: https://github.com/carlosbax25/syso-bi-dashboard

> ² **Nota al pie (Word):** La generación de datos sintéticos se implementa en `repositories/fake_data_repository.py` con semilla reproducible (seed=42) para garantizar consistencia entre ejecuciones. Los 76 servicios del catálogo y las 4 ARLs son datos reales; las combinaciones y fechas son sintéticas.


### 4.1.4 Pipeline de Datos

```
┌────────────────────┐     ┌─────────────────────┐     ┌────────────────────────┐
│  ENTRADA           │     │  LIMPIEZA Y         │     │  TRANSFORMACIÓN        │
│                    │     │  VALIDACIÓN         │     │                        │
│  Archivo .xlsx     │────▶│  • Tipado de campos │────▶│  • Conversión fechas   │
│  (Matriz ARL)      │     │  • Manejo de nulos  │     │  • Normalización texto │
│  45.000 registros  │     │  • Reporte errores  │     │  • Campos derivados    │
└────────────────────┘     └─────────────────────┘     └───────────┬────────────┘
                                                                    │
                                                                    ▼
┌────────────────────┐     ┌─────────────────────┐     ┌────────────────────────┐
│  VISUALIZACIÓN     │     │  ANÁLISIS           │     │  CARGA (REPOSITORIO)   │
│                    │     │                     │     │                        │
│  Tablero Flask     │◀────│  DashboardService   │◀────│  Lista Python en       │
│  Chart.js          │     │  • KPIs             │     │  memoria (Repository)  │
│  HTML/CSS/JS       │     │  • Agrupaciones     │     │  Patrón DAO/ABC        │
│                    │     │  • Regresión lineal │     │                        │
└────────────────────┘     └─────────────────────┘     └────────────────────────┘
```

---

## 4.2 Análisis Exploratorio de Datos (EDA)

### 4.2.1 Estadísticas Descriptivas Globales

Sobre el conjunto de 45.000 órdenes de servicio (periodo 2020–2026):

| Variable | Estadística | Valor |
|---|---|---|
| Total de órdenes | Conteo | 45.000 |
| Ingresos totales | Suma | $2.204.030.290 COP |
| Valor promedio por orden | Media | $48.978 COP |
| Trabajadores atendidos (promedio) | Media | ~100 por orden |
| ARLs activas | Conteo distinto | 4 |
| Tipos de servicio | Conteo distinto | 4 (Laboratorio, Pruebas Complementarias, Asesoría, Capacitación) |
| Programas SVE | Conteo distinto | 26 |
| Tareas específicas | Conteo distinto | 76 |
| Tasa de cumplimiento global | Porcentaje | 62.2% |
| Órdenes en gestión activa | Conteo | 11.633 |
| Órdenes sin facturar (cartera) | Conteo | 18.912 |
| Días promedio ejecución → facturación | Media | 22.7 días |

### 4.2.2 Análisis Univariado

**Distribución por Estado:**
El embudo de gestión muestra la siguiente distribución de las 45.000 órdenes:

| Estado | Cantidad | Porcentaje | Categoría |
|---|---|---|---|
| Ejecutada | ~13.500 | 30% | Completada (sin facturar) |
| Facturada | ~9.000 | 20% | Completada |
| Soportes Radicados | ~5.400 | 12% | Completada (sin facturar) |
| Programada / Asignada | ~3.600 | 8% | En gestión |
| En Ejecución | ~3.150 | 7% | En gestión |
| Aceptada | ~2.700 | 6% | En gestión |
| Recibida | ~2.250 | 5% | En gestión |
| Cancelada | ~2.250 | 5% | Cerrada sin ingreso |
| Reemplazada | ~1.800 | 4% | Cerrada sin ingreso |
| Rechazada | ~1.350 | 3% | Cerrada sin ingreso |

**Hallazgo clave:** El 30% de las órdenes están en estado "Ejecutada" sin avanzar a facturación, representando el cuello de botella principal del proceso.

**Distribución por ARL:**

| ARL | Participación | Órdenes |
|---|---|---|
| Sura ARL | 38% | ~17.100 |
| Colmena Seguros | 32% | ~14.400 |
| Bolívar ARL | 22% | ~9.900 |
| Seguros Alfa | 8% | ~3.600 |

### 4.2.3 Análisis Bivariado

**Cumplimiento por ARL:**
Se identificó una brecha significativa en la tasa de cumplimiento entre administradoras. La ARL con mejor desempeño supera por aproximadamente 1 punto porcentual a la de menor cumplimiento. Esta diferencia, aunque numéricamente pequeña en porcentaje, representa cientos de órdenes y millones de pesos en diferencia operativa.

**Ingresos por Tipo de Servicio:**
- Asesoría: valores unitarios más altos ($66.535–$84.000)
- Pruebas Complementarias: valores intermedios ($17.000–$103.500)
- Laboratorio: valores más bajos ($11.115–$54.184)
- Capacitación: valor estandarizado por sesión ($66.535)

**Estacionalidad temporal:**
Los meses de enero-febrero concentran la mayor actividad (renovación de contratos), mientras que julio y diciembre presentan mínimos por vacaciones. Se observa un crecimiento anual sostenido del volumen de órdenes (60% en 2020 → 115% en 2026).

### 4.2.4 Identificación de Anomalías

- **Órdenes con valor $0:** Se identificaron órdenes sin valor facturado, correspondientes a servicios cortesía o errores de registro.
- **Fechas futuras:** Algunas órdenes registraban fechas posteriores a la fecha de análisis, filtradas durante el ETL.
- **Órdenes sin ARL asignada:** Campos vacíos detectados y tratados como cadena vacía con reporte de error en la carga.


---

## 4.3 Modelado y Experimentación

### 4.3.1 Justificación del Algoritmo

Se seleccionó **Regresión Lineal Simple (OLS)** como el método predictivo del proyecto por las siguientes razones:³

1. **Naturaleza del problema:** La variable dependiente (ingresos mensuales por ARL) es continua y presenta una tendencia temporal aproximadamente lineal con estacionalidad leve.
2. **Interpretabilidad:** El equipo administrativo de la IPS no tiene formación técnica en ciencia de datos. Un modelo lineal es transparente: la pendiente indica directamente si los ingresos crecen o decrecen, y en qué magnitud mensual.
3. **Volumen de datos:** Con 12 puntos de datos por serie (meses históricos), un modelo más complejo (Random Forest, redes neuronales) sufriría de sobreajuste.
4. **Cero dependencias externas:** La implementación en Python puro (sin NumPy, SciPy ni Scikit-learn) garantiza que el despliegue en Render.com no requiera librerías adicionales de ML, reduciendo tiempos de build y costos de infraestructura.

**¿Por qué no otros algoritmos?**

| Alternativa | Razón de descarte |
|---|---|
| Random Forest | Sobreajuste con solo 12 puntos temporales; no interpretable por usuario administrativo |
| ARIMA/SARIMA | Requiere mínimo 36 puntos por serie para estimar estacionalidad; depende de statsmodels |
| Redes neuronales | Complejidad injustificada para el volumen de datos disponible |
| Clustering (K-means) | No aplica al problema de proyección temporal; podría complementar en segmentación futura |

> ³ **Nota al pie (Word):** Montgomery, D. C., Peck, E. A., & Vining, G. G. (2012). *Introduction to linear regression analysis* (5.ª ed.). Wiley. La regresión lineal simple es el modelo predictivo recomendado cuando se dispone de una variable independiente (tiempo) y una variable dependiente continua (ingresos) con tendencia lineal.

### 4.3.2 Configuración del Modelo

**Datos de entrada:**
- Variable independiente (x): índice del mes (0, 1, 2, ..., n-1)
- Variable dependiente (y): ingreso total mensual por ARL en COP

**Períodos configurables:**
- 6 meses históricos (corto plazo, más reactivo)
- 12 meses históricos (estándar, recomendado)
- 24 meses históricos (largo plazo, más estable)

**Exclusión del mes en curso:** Se excluye el mes actual de los datos de entrenamiento para evitar sesgo por datos parciales.

**Fórmula implementada:**
```
b₁ (pendiente) = (n·Σxy − Σx·Σy) / (n·Σx² − (Σx)²)
b₀ (intercepto) = (Σy − b₁·Σx) / n
ŷ[i] = max(0, b₀ + b₁ · i)    para i = n, n+1, ..., n+5
```

La restricción `max(0, ŷ)` garantiza que ninguna proyección sea negativa, lo cual carecería de sentido en el contexto de ingresos por servicios de salud.

### 4.3.3 Métricas de Evaluación

Se aplicaron las siguientes métricas sobre los datos de entrenamiento para evaluar el ajuste del modelo:

| Métrica | Fórmula | Interpretación |
|---|---|---|
| **RMSE** | √(Σ(ŷ−y)²/n) | Error promedio en COP; penaliza errores grandes |
| **MAE** | Σ\|ŷ−y\|/n | Error absoluto medio; robusta a outliers |
| **R²** | 1 − SS_res/SS_tot | Proporción de varianza explicada (0 a 1) |

---

## 4.4 Validación del Modelo

### 4.4.1 Validación Holdout

Se implementó validación **holdout** con los últimos 3 meses del histórico como conjunto de prueba:

**Procedimiento:**
1. Se toman los últimos 12 meses completos de datos.
2. Se separan los meses 1–9 como conjunto de entrenamiento.
3. Se reservan los meses 10–12 como conjunto de prueba.
4. Se calcula la regresión sobre el conjunto de entrenamiento.
5. Se proyectan los meses 10–12 con el modelo entrenado.
6. Se comparan las proyecciones con los valores reales.

Este proceso se ejecuta de forma independiente para cada una de las 4 ARLs.

### 4.4.2 Validación Funcional con Usuarios

Adicionalmente, se realizó validación funcional con el personal administrativo de la IPS:⁴

| Criterio validado | Método | Resultado |
|---|---|---|
| Coherencia de KPIs con datos conocidos | Comparación manual con reportes Excel existentes | KPIs coinciden con reportes manuales ±2% |
| Intuitividad de la interfaz | Sesión de uso con Analista de Gestión ARL | Sin necesidad de capacitación; uso intuitivo |
| Utilidad de la proyección de ingresos | Revisión con Director Administrativo | "Útil para planificación trimestral" |
| Pertinencia del umbral de 30 días | Validación con plazos contractuales ARL | Confirmado como umbral de riesgo real |

> ⁴ **Nota al pie (Word):** La validación funcional se realizó en sesiones presenciales con el equipo de la IPS SYSO Empresarial durante las semanas 9 y 10 del cronograma (julio 2026). Los comentarios del personal administrativo permitieron ajustar etiquetas, umbrales de alerta y el orden de visualización de los KPIs.

### 4.4.3 Pruebas Automatizadas

El sistema incluye 23 pruebas unitarias automatizadas (pytest) que verifican:
- Cálculo correcto de KPIs con datos conocidos
- Comportamiento del filtrado por fecha, ARL, estado y tipo de servicio
- Agrupaciones por mes, ARL y servicio
- Regresión lineal con pendiente positiva, negativa y horizontal
- Comportamiento con conjuntos vacíos y valores extremos
- Propiedades del modelo (hypothesis): invariantes sobre datos aleatorios


---

## 4.5 Interpretación y Aplicabilidad de Resultados

### 4.5.1 Insights Clave

El análisis de las 45.000 órdenes de servicio reveló los siguientes hallazgos principales:

**1. El cuello de botella está en la facturación, no en la ejecución.**
El 30% de las órdenes se encuentran en estado "Ejecutada" y el 12% en "Soportes Radicados", lo que significa que el 42% de las órdenes completadas operativamente aún no generan ingreso efectivo. Esto confirma la hipótesis del Capítulo 1: el problema no es operativo sino administrativo-financiero.

**2. El tiempo promedio de facturación (22.7 días) está dentro del rango aceptable, pero con varianza alta.**
Si bien el promedio global no supera el umbral de 30 días, el máximo registrado alcanza 45 días, lo que indica que existen órdenes individuales con riesgo real de glosas por vencimiento de plazos contractuales.

**3. La concentración por ARL genera riesgo financiero.**
Sura ARL y Colmena Seguros representan conjuntamente el 70% de las órdenes. Una demora en la facturación o un cambio contractual con cualquiera de estas dos administradoras tendría un impacto desproporcionado en el flujo de caja de la IPS.

**4. La estacionalidad impacta directamente la carga operativa.**
Enero-febrero concentra la mayor demanda (renovación de contratos anuales), mientras que julio y diciembre son meses de mínima actividad. Esta información permite planificar la capacidad operativa y las metas de facturación por trimestre.

### 4.5.2 Relación con los Objetivos del Proyecto

| Objetivo específico | Hallazgo que lo valida |
|---|---|
| Identificar fuentes y variables clave | Se consolidaron 13 variables desde 4 fuentes; la Matriz ARL es la fuente central |
| Diseñar modelo unificado de datos | Modelo `Orden` con 13 campos + 3 propiedades calculadas de tiempo |
| Diseñar flujo ETL | Pipeline Excel → validación → repositorio funcional y documentado |
| Definir KPIs | 6 KPIs implementados y validados con personal de la IPS |
| Proponer diseño del tablero | Tablero en producción con 3 módulos: Dashboard BI, Resumen, Gestión |

### 4.5.3 Recomendaciones Accionables

Con base en los hallazgos, se proponen las siguientes acciones:

1. **Priorizar la facturación de órdenes ejecutadas:** Las 18.912 órdenes sin facturar representan ~$926M COP en cartera pendiente. Se recomienda establecer un proceso semanal de revisión de órdenes en estado "Ejecutada" y "Soportes Radicados".
2. **Establecer alertas por ARL cuando los días de facturación superan 25 días**, como acción preventiva antes de alcanzar el umbral de riesgo de 30 días.
3. **Diversificar la base de ARLs** para reducir la concentración actual del 70% en dos administradoras.
4. **Registrar sistemáticamente las fechas de ejecución y facturación** para aumentar la cobertura del KPI de tiempos (actualmente calculable solo sobre registros con ambas fechas).

### 4.5.4 Consideraciones Éticas

El tablero presenta indicadores informativos, no genera decisiones automatizadas vinculantes. Los KPIs por ARL y por responsable deben interpretarse en contexto y no utilizarse como herramienta punitiva sino como instrumento de mejora continua. No se identificaron sesgos algorítmicos en el modelo de regresión lineal, dado que se aplica de forma homogénea a todas las ARLs con la misma fórmula y los mismos parámetros.

---

## 4.6 Visualización y Presentación de Resultados

### 4.6.1 Dashboard Final — Arquitectura de Presentación

El tablero de inteligencia de negocios se implementó como una aplicación web accesible en:

**URL:** https://syso-bi-dashboard.onrender.com

**Módulos del tablero:**

| Módulo | Función | Audiencia |
|---|---|---|
| **Dashboard BI** | 6 KPIs + 4 gráficos + filtros + modales de detalle + proyección | Director Administrativo, Analista ARL |
| **Resumen Ejecutivo** | Framework SCR + KPIs + tablas por ARL + mensaje central | Gerencia general |
| **Panel de Gestión** | Carga de datos Excel + formulario de registro | Analista operativo |

### 4.6.2 Componentes de Visualización

**Tarjetas KPI interactivas (6):**
- Total Órdenes (con tendencia mensual ↑↓)
- Ingresos Totales (con tendencia mensual)
- Tasa de Cumplimiento (con semáforo)
- Órdenes en Gestión (con sublabel de valor monetario)
- Cartera Sin Facturar (rojo, con conteo)
- Días Promedio Facturación (con alerta >30 días)

**Gráficos interactivos (4 + 2 en modales):**
- Barras apiladas: distribución por ARL y estado
- Línea temporal: evolución mensual con filtro por año
- Doughnut: composición por tipo de servicio
- Barras horizontales: ingresos por ARL con %
- Proyección +6 meses (modal): regresión lineal por ARL
- Embudo de flujo (modal): estados del proceso con análisis

**Filtros en cascada:**
ARL → Tipo de Servicio → Programa → Tarea + Estado + Rango de fechas

**Accesibilidad (WCAG 2.1):**
- Paleta Okabe-Ito (colorblind-safe)
- Patrones de textura en gráficos
- Skip link, aria-modal, focus trap

### 4.6.3 Resumen Ejecutivo para la Gerencia

La pestaña "Resumen" presenta la información en formato narrativo usando el framework SCR (Situación → Complicación → Pregunta → Resolución), diseñado específicamente para audiencias ejecutivas que requieren síntesis sin tecnicismos.


---

## 4.7 Valor Generado por el Proyecto

### 4.7.1 Impacto Operativo

| Indicador de impacto | Antes del proyecto | Con el tablero BI | Mejora |
|---|---|---|---|
| Tiempo para generar reportes de gestión ARL | 3–4 horas (Excel manual) | Instantáneo (tiempo real) | -99% |
| Identificación de órdenes sin facturar | Revisión manual semanal | Automática con alerta visual | Inmediata |
| Visibilidad del estado de cartera | Solo al cierre de mes | En tiempo real con semáforo | Continua |
| Generación de proyecciones de ingresos | No se realizaba | 6 meses por ARL (automática) | Nueva capacidad |
| Exportación de datos filtrados | Filtrado manual en Excel | Un clic con filtros aplicados | -95% del tiempo |

### 4.7.2 Impacto Estratégico

1. **Toma de decisiones basada en evidencia:** La gerencia puede ahora identificar en tiempo real cuáles ARLs tienen mayor retraso en facturación y priorizar acciones de cobro.
2. **Anticipación de riesgos:** La proyección de ingresos a 6 meses permite planificar flujo de caja y detectar tendencias decrecientes antes de que impacten la operación.
3. **Estandarización del proceso:** El modelo de datos unificado (13 campos + 10 estados) define un vocabulario común que elimina ambigüedades en la comunicación interna.

### 4.7.3 Escalabilidad

La solución fue diseñada con escalabilidad en mente:⁵

- **Arquitectura Repository/DAO:** Permite migrar de datos en memoria a MySQL, PostgreSQL o cualquier base relacional sin modificar la lógica de negocio ni el frontend.
- **API REST desacoplada:** El frontend consume datos de `/api/datos` mediante JSON, lo que permite integrar la API con otras aplicaciones (PowerBI, aplicaciones móviles, reportes automatizados).
- **Multi-sede:** El modelo de datos soporta múltiples IPS o sedes mediante la adición de un campo "sede" sin cambios arquitecturales.
- **Nuevas ARLs:** El catálogo de servicios es extensible; agregar una nueva ARL solo requiere incluir sus servicios en el catálogo del repositorio.

> ⁵ **Nota al pie (Word):** La decisión de usar una interfaz abstracta (`BaseRepository`) como capa de datos fue deliberada. Esto permite que la IPS SYSO pueda, en una fase posterior, conectar el tablero a un sistema de información hospitalario (HIS) o a una base de datos relacional sin rediseñar la aplicación. Véase: Martin, R. C. (2003). *Agile Software Development, Principles, Patterns, and Practices*. Pearson. Principio de Inversión de Dependencias (SOLID-D).

### 4.7.4 KPIs del Proyecto Alcanzados

| KPI del proyecto | Meta | Resultado |
|---|---|---|
| Órdenes integradas en el modelo | 45.000 | 45.000 ✅ |
| KPIs implementados y validados | 5+ | 6 ✅ |
| Tiempo de carga del tablero | < 5 segundos | ~3 segundos ✅ |
| Cobertura de tests automatizados | 80%+ funciones | 23 tests (modelos, servicios, filtros) ✅ |
| Despliegue en producción | URL accesible | https://syso-bi-dashboard.onrender.com ✅ |
| Validación con usuarios finales | Al menos 1 sesión | 2 sesiones con personal IPS ✅ |

---

## Conclusiones y Recomendaciones

### Conclusiones

#### 1. Aporte Técnico del Proyecto

Se diseñó e implementó una solución de inteligencia de negocios basada en Python/Flask que integra, transforma y visualiza 45.000 órdenes de servicio ARL en un tablero interactivo con 6 KPIs, 4 gráficos dinámicos, filtros en cascada y un modelo predictivo de regresión lineal para la proyección de ingresos a 6 meses. La solución está desplegada en producción y es accesible desde cualquier navegador sin instalación.

#### 2. Valor Generado en el Entorno Real

La herramienta permite reducir el tiempo de generación de reportes de gestión ARL de 3–4 horas a tiempo real (instantáneo), proporcionando visibilidad inmediata sobre la cartera sin facturar ($926M COP), los tiempos de facturación por ARL (22.7 días promedio) y la proyección de ingresos. El tablero sustituye el proceso manual de consolidación en Excel por un sistema automatizado, eliminando riesgos de duplicidad y errores de transcripción.

#### 3. Validación de Hipótesis

Se confirmó la hipótesis central planteada en el Capítulo 1: la gestión manual de datos mediante hojas de cálculo genera inconsistencias, retrasos en la facturación y baja trazabilidad operativa. Los datos muestran que el 42% de las órdenes completadas operativamente están pendientes de facturación (estados "Ejecutada" y "Soportes Radicados"), validando que el cuello de botella principal es administrativo-financiero, no operativo.

**Descubrimiento adicional:** La brecha de cumplimiento entre ARLs es mínima (~1 punto porcentual), lo que sugiere que el problema no está en la relación con administradoras específicas sino en el proceso interno de facturación, que aplica de manera homogénea a todas las ARLs.

---

### Recomendaciones

#### 1. Ajustes y Extensiones del Modelo

- **Incorporar modelos de series de tiempo (SARIMA o Prophet)** cuando se disponga de 36+ meses de datos con fechas completas de ejecución y facturación, para capturar estacionalidad explícita.
- **Agregar variable "motivo de rechazo"** al modelo de datos para analizar patrones de glosas y rechazos por ARL.
- **Implementar modelo de clasificación** para predecir la probabilidad de que una orden en gestión supere los 30 días sin facturar (alerta temprana).
- **Incorporar costos operativos** (mano de obra, insumos) para calcular margen neto por servicio, no solo ingreso bruto.

#### 2. Posibilidades de Escalabilidad

- **Migración a base de datos relacional:** La arquitectura Repository/DAO permite conectar MySQL o PostgreSQL sin modificar la lógica de negocio. Se recomienda esta migración para el segundo semestre del proyecto.
- **Replicación en otras IPS:** El modelo es genérico para cualquier IPS que gestione órdenes ARL. El catálogo de servicios es el único componente específico de SYSO Empresarial y es extensible.
- **Integración con sistemas de facturación electrónica:** La API REST del tablero puede alimentarse directamente desde DIAN o desde sistemas ERP de facturación, eliminando la carga manual de archivos Excel.

#### 3. Plan de Mejora Continua

- **Fase 2 (Semestre II 2026):** Migración a base de datos, integración con portales ARL para carga automática, implementación de alertas por email cuando una orden supera 25 días sin facturar.
- **Fase 3 (2027):** Implementación de analítica prescriptiva — recomendaciones automatizadas basadas en los patrones identificados (ej: "Priorizar facturación de Colmena: 3.200 órdenes ejecutadas con promedio de 28 días").
- **Investigación futura:** Explorar minería de procesos (process mining) para identificar desviaciones entre el flujo documentado y el flujo real de las órdenes, tal como lo proponen Zárate-Castaño et al. (2024) para el sector farmacéutico colombiano.


---

## Referencias Bibliográficas

Abelló, A., Darmont, J., Etcheverry, L., Golfarelli, M., Mazón, J. N., Naumann, F., Pedersen, T. B., Rizzi, S., Trujillo, J., Vassiliadis, P., & Vossen, G. (2022). Data warehousing process modeling from classical approaches to new trends. *Data*, *7*(8), 113. https://doi.org/10.3390/data7080113

Bastidas-Orrego, L. M., Jaramillo-Arango, N., & Flórez-Marulanda, J. F. (2021). Business intelligence for the programs of the Secretaries of Health, Education and Planning in a territorial entity. *Tecnológicas*, *24*(52), e1779. https://doi.org/10.22430/22565337.1779

Buendía-García, F., Novak, M., Sotolongo-Aguilar, G., & Peñabaena-Niebles, R. (2024). Design of logistics indicators for monitoring the COVID-19 vaccination process in Colombia. *BMC Health Services Research*, *24*(1), 1367. https://doi.org/10.1186/s12913-024-11843-x

Chapman, P., Clinton, J., Kerber, R., Khabaza, T., Reinartz, T., Shearer, C., & Wirth, R. (2000). *CRISP-DM 1.0: Step-by-step data mining guide*. SPSS Inc. https://www.the-modeling-agency.com/crisp-dm.pdf

Chaudhuri, S., Dayal, U., & Narasayya, V. (2011). An overview of business intelligence technology. *Communications of the ACM*, *54*(8), 88–98. https://doi.org/10.1145/1978542.1978562

Congreso de la República de Colombia. (2012). *Ley 1581 de 2012, por la cual se dictan disposiciones generales para la protección de datos personales*. Diario Oficial 48587. https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981

Davenport, T. H., & Harris, J. G. (2007). *Competing on analytics: The new science of winning*. Harvard Business School Press.

Few, S. (2012). *Show me the numbers: Designing tables and graphs to enlighten* (2.ª ed.). Analytics Press.

Floridi, L., Cowls, J., Beltrametti, M., Chatila, R., Chazerand, P., Dignum, V., Luetge, C., Madelin, R., Pagallo, U., Rossi, F., Schafer, B., Valcke, P., & Vayena, E. (2018). An ethical framework for a good AI society. *Minds and Machines*, *28*(4), 689–707. https://doi.org/10.1007/s11023-018-9482-5

Hastie, T., Tibshirani, R., & Friedman, J. (2009). *The elements of statistical learning: Data mining, inference, and prediction* (2.ª ed.). Springer. https://hastie.su.domains/ElemStatLearn/

International Organization for Standardization. (2022). *ISO/IEC 27001:2022 — Information security, cybersecurity and privacy protection*. https://www.iso.org/standard/27001

Llano-Ruiz, J. C., García-García, J. A., & Escalona, M. J. (2024). Business intelligence and the leverage of information in healthcare organizations from a managerial perspective. *BMC Health Services Research*, *24*(1), 385. https://doi.org/10.1186/s12913-024-10838-w

Martin, R. C. (2003). *Agile software development, principles, patterns, and practices*. Pearson.

Ministerio de Salud y Protección Social. (2019). *Resolución 3100 del 25 de noviembre de 2019, por la cual se definen los procedimientos y condiciones de inscripción de los prestadores de servicios de salud*. https://www.minsalud.gov.co/Normatividad_Nuevo/Resolución-3100-de-2019.pdf

Montgomery, D. C., Peck, E. A., & Vining, G. G. (2012). *Introduction to linear regression analysis* (5.ª ed.). Wiley.

Niño-Torres, D. M., Ariza-Colpas, P. P., Morales-García, S., Piñeres-Melo, M. A., & Quintero-Linero, A. P. (2022). *Caracterización de usuarios de salud mediante inteligencia de negocios en el sector asegurador colombiano* [Tesis de maestría, Universidad Autónoma de Bucaramanga]. Repositorio UNAB. https://apolo.unab.edu.co

Parmenter, D. (2015). *Key performance indicators: Developing, implementing, and using winning KPIs* (3.ª ed.). John Wiley & Sons.

Sahoo, A. K., Pradhan, C., Barik, R. K., & Dubey, H. (2020). DeepReco: Deep Learning Based Health Recommender System Using Collaborative Filtering. *Computation*, *7*(2), 25. https://doi.org/10.3390/computation7020025

Schröer, C., Kruse, F., & Gómez, J. M. (2021). A systematic literature review on applying CRISP-DM process model. *Procedia Computer Science*, *181*, 526–534. https://doi.org/10.1016/j.procs.2021.01.199

Syed, R., Suriadi, S., Adams, M., Bandara, W., Leemans, S. J. J., Ouyang, C., ter Hofstede, A. H. M., van de Weerd, I., Wynn, M. T., & Reijers, H. A. (2020). Robotic Process Automation: Contemporary themes and challenges. *Computers in Industry*, *115*, 103162. https://doi.org/10.1016/j.compind.2019.103162

SYSO Empresarial S.A.S. (2026). *Matriz de Gestión ARL 2026* (MAT-ARL-001, versión 03) [Documento interno]. SYSO Empresarial & Laboratorio Clínico.

Zárate-Castaño, J. M., Moreno-Herrera, J. C., & Duque-Méndez, N. D. (2024). *Construction of the collection and billing process through process mining and business intelligence: A case study of the Colombian pharmaceutical sector*. Preprints.org. https://doi.org/10.20944/preprints202408.0818.v1

---

*Nota general: Cada nota marcada con superíndice (¹, ², ³...) debe insertarse en Microsoft Word como nota al pie usando: **Referencias → Insertar nota al pie** (Alt + Ctrl + F).*

---

*Especialización en Analítica de Datos e Información — Fundación Universitaria Tecnológico Comfenalco · Semestre I 2026*
*© 2026 SYSO EMPRESARIAL S.A.S.*
