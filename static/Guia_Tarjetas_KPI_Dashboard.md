# Guía de Tarjetas KPI — Dashboard BI SYSO Empresarial

**IPS SYSO Empresarial & Laboratorio Clínico**  
**Especialización en Analítica de Datos — Tecnológico Comfenalco**  
**Versión:** 1.0 · Julio 2026

---

## ¿Qué son las tarjetas KPI?

Las tarjetas KPI (Key Performance Indicators) son los indicadores clave de desempeño que aparecen en la parte superior del Dashboard BI. Están organizadas en una cuadrícula de **2 filas × 3 columnas**, y cada una mide un aspecto crítico del proceso de gestión de órdenes de servicio ARL.

Todas las tarjetas **responden a los filtros** aplicados en la barra superior (fecha, ARL, tipo de servicio, estado, programa, tarea). Al hacer clic sobre cada una, se abre un **modal con el detalle completo**.

---

## Tarjetas — Fila 1: Visión General del Proceso

### 1. Total Órdenes
| Atributo | Detalle |
|---|---|
| **Color** | Azul corporativo |
| **Ícono** | Documento |
| **Qué mide** | Cantidad total de órdenes de servicio en el período/filtro seleccionado |
| **Cómo se calcula** | Conteo simple de todos los registros que pasan los filtros activos |
| **Al hacer clic** | Abre una tabla paginada con el detalle completo de todas las órdenes: ID, fecha, ARL, empresa, tipo de servicio, trabajadores, estado y valor facturado. Incluye ordenamiento por columna y paginación de 15 registros por página |
| **Indicador de tendencia** | Muestra la variación porcentual respecto al mismo período del mes anterior (ej: ↑ 8%) |
| **Relevancia para el proyecto** | Indicador base de la Tabla 1 del documento: "Total de órdenes registradas" (45.000 órdenes, periodo 2020–2026) |

---

### 2. Ingresos Totales
| Atributo | Detalle |
|---|---|
| **Color** | Azul claro / cian |
| **Ícono** | Símbolo de moneda |
| **Qué mide** | Suma del valor facturado de todas las órdenes en el período seleccionado |
| **Cómo se calcula** | `SUM(valor_facturado)` sobre las órdenes filtradas |
| **Al hacer clic** | Abre un modal con el desglose de ingresos por ARL: valor total, porcentaje de participación y ranking de mayor a menor aporte |
| **Indicador de tendencia** | Variación porcentual de ingresos respecto al mismo período del mes anterior |
| **Relevancia para el proyecto** | Refleja el KPI financiero principal de la IPS. La facturación es la fuente de ingresos operativos (sección 1.2.3 del documento) |

---

### 3. Cumplimiento
| Atributo | Detalle |
|---|---|
| **Color** | Verde / índigo |
| **Ícono** | Círculo con check |
| **Qué mide** | Porcentaje de órdenes que han alcanzado un estado de avance operativo significativo |
| **Cómo se calcula** | `(órdenes en estado Ejecutada + Soportes Radicados + Facturada) / total × 100` |
| **Al hacer clic** | Abre el embudo de gestión: muestra cuántas órdenes hay en cada etapa del flujo (Recibida → Aceptada → Programada → En Ejecución → Ejecutada → Soportes Radicados → Facturada) con análisis del cuello de botella principal |
| **Semáforo de color** | Verde ≥ 70% · Ámbar 50–70% · Rojo < 50% |
| **Relevancia para el proyecto** | Indicador de eficiencia operativa. Mide qué proporción del total de órdenes recibidas avanza efectivamente en el flujo de gestión |

---

## Tarjetas — Fila 2: Alertas y Tiempos Críticos

### 4. En Gestión
| Atributo | Detalle |
|---|---|
| **Color** | Ámbar / naranja |
| **Ícono** | Reloj |
| **Qué mide** | Cantidad de órdenes actualmente en proceso activo, que aún no han sido completadas |
| **Cómo se calcula** | Conteo de órdenes en estados: `Recibida`, `Aceptada`, `Programada / Asignada`, `En Ejecución` |
| **Sublabel** | Muestra el valor monetario total de esas órdenes (potencial de ingresos en curso) |
| **Al hacer clic** | Abre el análisis de pendientes por ARL: cantidad, valor total, días promedio de antigüedad y días máximo por cada administradora, con listado detallado de las órdenes más antiguas |
| **Relevancia para el proyecto** | Corresponde al indicador "Órdenes en estado Recibida (sin avanzar)" de la Tabla 1. Permite identificar cuellos de botella y órdenes estancadas |

---

### 5. Cartera Sin Facturar
| Atributo | Detalle |
|---|---|
| **Color** | Rojo |
| **Ícono** | Maletín / cartera |
| **Qué mide** | Valor monetario total de las órdenes que ya fueron ejecutadas pero que aún no tienen factura emitida |
| **Cómo se calcula** | `SUM(valor_facturado)` de órdenes en estado `Ejecutada` o `Soportes Radicados` |
| **Al hacer clic** | Abre el análisis de cartera por ARL: cantidad de órdenes sin facturar, valor total, días promedio desde la ejecución y días máximo de espera. Incluye alerta sobre riesgo de glosas |
| **Semáforo interno** | Días promedio: Verde < 15 días · Ámbar 15–30 días · Rojo > 30 días |
| **Relevancia para el proyecto** | Indicador clave de la Tabla 1: "Órdenes sin facturar". Directamente vinculado a la sostenibilidad financiera de la IPS (sección 1.2.2 del documento: "Incremento de la cartera vencida") |

---

### 6. Días Prom. Facturación
| Atributo | Detalle |
|---|---|
| **Color** | Azul cielo |
| **Ícono** | Reloj circular |
| **Qué mide** | Tiempo promedio en días que transcurre entre la fecha de ejecución del servicio y la fecha en que se emite la factura a la ARL |
| **Cómo se calcula** | `PROMEDIO(fecha_facturacion - fecha_ejecucion)` sobre todas las órdenes con ambas fechas registradas |
| **Indicador de alerta** | Si supera 30 días muestra "⚠ Supera 30 días" en rojo. Si está dentro del rango muestra "✓ Dentro del rango" en verde |
| **Al hacer clic** | Abre el análisis de tiempos del ciclo completo: Registro → Ejecución → Facturación, con estadísticas (promedio, mínimo, máximo) a nivel global y desglosado por ARL |
| **Relevancia para el proyecto** | Es el KPI de tiempo central de la Tabla 1 del documento: "Tiempo promedio entre ejecución y facturación". Mide la agilidad administrativa del proceso de facturación. Valores altos indican riesgo de glosas y pérdida de cartera |

---

## Resumen del flujo de estados

Las tarjetas se construyen sobre el siguiente flujo de 10 estados del ciclo de vida de una orden:

```
Recibida → Aceptada → Programada / Asignada → En Ejecución
    → Ejecutada → Soportes Radicados → Facturada
    
Estados de cierre sin ingresos: Rechazada · Reemplazada · Cancelada
```

| Grupo | Estados | Tarjeta relacionada |
|---|---|---|
| En gestión activa | Recibida, Aceptada, Programada / Asignada, En Ejecución | **Tarjeta 4** |
| Ejecutadas sin facturar (cartera) | Ejecutada, Soportes Radicados | **Tarjeta 5** |
| Completadas (cumplimiento) | Ejecutada, Soportes Radicados, Facturada | **Tarjeta 3** |
| Con fecha de facturación | Facturada | **Tarjeta 6** |

---

## Interactividad y filtros

Todas las tarjetas actualizan sus valores **en tiempo real** al aplicar filtros. Los filtros disponibles son:

- **Fecha Inicio / Fecha Fin** — período de análisis
- **ARL** — administradora de riesgos laborales (selección múltiple)
- **Tipo de Servicio** — Laboratorio, Pruebas Complementarias, Asesoría, Capacitación
- **Estado** — cualquiera de los 10 estados del flujo
- **Programa** — programa de vigilancia epidemiológica (SVE)
- **Tarea** — procedimiento específico dentro del programa

Los filtros son **en cascada**: seleccionar una ARL actualiza automáticamente los programas y tareas disponibles para esa ARL.

---

*Documento generado automáticamente · IPS SYSO Empresarial S.A.S. · 2026*
