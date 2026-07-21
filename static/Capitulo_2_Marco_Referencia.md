# Capítulo II. Estado del Arte y Marco Conceptual

## Diseño de una Solución de Inteligencia de Negocios para la Gestión de Órdenes de Servicio ARL en la IPS SYSO Empresarial S.A.S.

---

## 1. Revisión de Antecedentes

La revisión de antecedentes presentada a continuación identifica estudios previos relevantes en los ámbitos de inteligencia de negocios, analítica de datos y gestión de información en el sector salud, tanto en el contexto internacional como en el nacional colombiano. Su propósito es evidenciar el estado del arte sobre el cual se fundamenta el presente proyecto y posicionar la propuesta frente a las tendencias y vacíos identificados en la literatura.

---

### Antecedente 1

Sahoo et al. (2020) proponen un sistema de analítica de datos aplicado a la gestión de información clínica y administrativa en entornos hospitalarios. El estudio demuestra que los datos operativos del sector salud pueden transformarse en insumos para la toma de decisiones mediante modelos analíticos, alcanzando una precisión superior al 88%. Este principio sustenta el enfoque descriptivo y predictivo adoptado en el presente proyecto para las órdenes ARL.

| Elemento | Descripción |
|---|---|
| **Título** | DeepReco: Deep Learning Based Health Recommender System Using Collaborative Filtering |
| **Fuente** | Computation, 7(2), 25 |
| **Método** | Investigación aplicada con enfoque cuantitativo; redes neuronales profundas para identificar patrones en datos de servicios de salud |
| **Resultados** | Precisión superior al 88% en la recomendación de servicios de salud |
| **Relevancia** | Evidencia la viabilidad de aplicar analítica sobre datos operativos de una IPS para mejorar la gestión |

---

### Antecedente 2

Chaudhuri et al. (2011) presentan una visión integral de las tecnologías de inteligencia de negocios, sus componentes arquitecturales y su aplicación en organizaciones de diferentes sectores. Su modelo de capas —datos, ETL, análisis y visualización— es la arquitectura base sobre la que se diseñó la solución para el presente proyecto.

| Elemento | Descripción |
|---|---|
| **Título** | An overview of business intelligence technology |
| **Fuente** | Communications of the ACM, 54(8), 88–98 |
| **Método** | Revisión teórica y análisis comparativo de arquitecturas BI: almacenes de datos, ETL, OLAP y tableros |
| **Resultados** | Las soluciones BI integran fuentes dispersas en repositorios unificados, habilitando reportes en tiempo real |
| **Relevancia** | Referencia fundacional del concepto BI utilizado en el marco conceptual; modelo de capas adoptado en la solución |

---

### Antecedente 3

Chapman et al. (2000) definen CRISP-DM como el proceso estándar para la gestión de proyectos de analítica de datos. Sus seis fases —comprensión del negocio, comprensión de los datos, preparación, modelado, evaluación y despliegue— estructuran el ciclo de vida completo del presente proyecto.

| Elemento | Descripción |
|---|---|
| **Título** | CRISP-DM 1.0: Step-by-step data mining guide |
| **Fuente** | SPSS Inc. (documento técnico de referencia) |
| **Método** | Diseño metodológico colaborativo entre empresas líderes del sector; validación en múltiples industrias |
| **Resultados** | CRISP-DM es el estándar de facto para proyectos de analítica de datos a nivel mundial |
| **Relevancia** | Marco metodológico rector de cada etapa del proyecto: diagnóstico, ETL, modelado, evaluación y despliegue |

---

### Antecedente 4

Abelló et al. (2022) revisan la evolución del modelado de procesos ETL desde los enfoques clásicos hasta las arquitecturas modernas orientadas a flujos de datos en tiempo real. El estudio confirma que los procesos ETL siguen siendo el núcleo de cualquier arquitectura BI.

| Elemento | Descripción |
|---|---|
| **Título** | Data Warehousing Process Modeling from Classical Approaches to New Trends |
| **Fuente** | Data, 7(8), 113. MDPI (acceso abierto, Q2) |
| **Método** | Revisión sistemática de literatura; análisis comparativo de paradigmas ETL |
| **Resultados** | Las tendencias modernas incorporan transformaciones en memoria y pipelines automatizados que reducen latencia |
| **Relevancia** | Sustenta el diseño del ETL implementado (carga Excel en memoria con patrón Repository/DAO) |

---

### Antecedente 5

Bastidas-Orrego et al. (2021) implementan un modelo de inteligencia de negocios para integrar y analizar datos dispersos de los programas de Salud, Educación y Planeación de una entidad territorial colombiana. Es el antecedente nacional más directo al contexto del presente proyecto.

| Elemento | Descripción |
|---|---|
| **Título** | Business Intelligence for the Programs of the Secretaries of Health, Education and Planning in a Territorial Entity |
| **Fuente** | Tecnológicas, 24(52), e1779 (Tecnológico de Antioquia, indexada en Scopus) |
| **Método** | Investigación aplicada con diseño BI; CRISP-DM, ETL, cubo OLAP y tablero de indicadores. Colombia |
| **Resultados** | Consolidación de información fragmentada, reducción del tiempo de reportes, mejora en trazabilidad |
| **Relevancia** | Antecedente colombiano directo: sector salud, datos dispersos en Excel, solución BI con ETL y tablero |

---

### Antecedente 6

Syed et al. (2020) identifican que las organizaciones que migran de procesos manuales a flujos automatizados reportan reducciones de hasta el 80% en el tiempo de procesamiento y eliminan errores de transcripción. Esta evidencia respalda directamente las causas del problema identificadas en el Capítulo 1.

| Elemento | Descripción |
|---|---|
| **Título** | Robotic Process Automation: Contemporary Themes and Challenges |
| **Fuente** | Computers in Industry, 115, 103162 (Elsevier, Q1, FI 11.245) |
| **Método** | Revisión sistemática de 126 artículos de Scopus y Web of Science |
| **Resultados** | Reducción del 80% en tiempo de procesamiento al migrar de procesos manuales a automatizados |
| **Relevancia** | Sustenta empíricamente que el uso de Excel sin automatización genera inconsistencias y retrasos |

---

### Antecedente 7

Llano-Ruiz et al. (2024) analizan el impacto de los sistemas BI en organizaciones de salud desde la perspectiva gerencial. El 74% de las organizaciones que implementaron BI reportaron mejoras en la toma de decisiones, y los tableros son la herramienta más adoptada para seguimiento financiero.

| Elemento | Descripción |
|---|---|
| **Título** | Business intelligence and the leverage of information in healthcare organizations from a managerial perspective |
| **Fuente** | BMC Health Services Research, 24(1), 385 (Springer, Q1, acceso abierto) |
| **Método** | Revisión sistemática de 87 artículos publicados entre 2010 y 2023 en Scopus y PubMed |
| **Resultados** | 74% de organizaciones de salud con BI reportan mejoras en toma de decisiones clínicas y administrativas |
| **Relevancia** | Valida que los tableros BI son la herramienta más adoptada en salud para seguimiento financiero y operativo |

---

### Antecedente 8

Zárate-Castaño et al. (2024) construyen el proceso real de facturación y cartera en el sector farmacéutico colombiano usando minería de procesos e inteligencia de negocios. Identificaron desviaciones significativas entre el proceso documentado y el real, con cuellos de botella en la radicación de soportes.

| Elemento | Descripción |
|---|---|
| **Título** | Construction of the Collection and Billing Process through Process Mining and Business Intelligence |
| **Fuente** | Preprints.org (acceso abierto). Colombia, sector salud/farmacéutico |
| **Método** | Process mining con algoritmo Alpha Mining; integración con herramientas BI |
| **Resultados** | Desviaciones entre proceso documentado y real; cuellos de botella en radicación de soportes |
| **Relevancia** | Antecedente colombiano directo en facturación y cartera; hallazgos análogos al problema de órdenes sin facturar |

---

### Antecedente 9

Buendía-García et al. (2024) diseñan un conjunto de KPIs y un tablero de monitoreo para el seguimiento del proceso de vacunación COVID-19 en Colombia, integrando dimensiones epidemiológicas, humanitarias y logísticas mediante tres ciclos iterativos de validación con stakeholders.

| Elemento | Descripción |
|---|---|
| **Título** | Design of logistics indicators for monitoring the COVID-19 vaccination process in Colombia |
| **Fuente** | BMC Health Services Research, 24(1), 1367 (Springer, Q1, acceso abierto) |
| **Método** | Design Science Research; tres ciclos de validación con actores públicos y privados. Colombia |
| **Resultados** | 18 KPIs validados con stakeholders reales; proceso iterativo garantiza pertinencia |
| **Relevancia** | Referente colombiano de diseño de KPIs en salud; enfoque iterativo aplicable a los 6 KPIs del tablero |

---

### Antecedente 10

Niño-Torres et al. (2022) caracterizan la base de usuarios de salud de una compañía del sector asegurador colombiano mediante herramientas BI, logrando segmentar perfiles de riesgo y uso de servicios para optimizar la oferta.

| Elemento | Descripción |
|---|---|
| **Título** | Caracterización de usuarios de salud mediante inteligencia de negocios en el sector asegurador colombiano |
| **Fuente** | Tesis de maestría, Universidad Autónoma de Bucaramanga. Repositorio UNAB |
| **Método** | Analítica descriptiva y clustering; ETL, cubo de datos y tablero interactivo. Colombia |
| **Resultados** | Segmentación de usuarios en perfiles de riesgo; optimización de oferta de servicios |
| **Relevancia** | Antecedente colombiano en BI aplicado al sector asegurador de salud; análogo al análisis por ARL del tablero |

---

## 2. Marco Teórico y Conceptual

### 2.1 Metodologías

#### 2.1.1 CRISP-DM

La metodología CRISP-DM (Cross-Industry Standard Process for Data Mining) es el estándar de referencia para la gestión del ciclo de vida de proyectos de analítica de datos. Comprende seis fases: comprensión del negocio, comprensión de los datos, preparación de los datos, modelado, evaluación y despliegue (Chapman et al., 2000). Su carácter iterativo permite revisar fases anteriores conforme avanza el proyecto.¹

En el presente proyecto, las fases se aplican de la siguiente manera:

| Fase CRISP-DM | Aplicación en el proyecto |
|---|---|
| 1. Comprensión del negocio | Diagnóstico del proceso ARL, entrevistas, árbol del problema (Cap. 1) |
| 2. Comprensión de los datos | Revisión de la Matriz ARL 2026, identificación de variables y calidad |
| 3. Preparación de los datos | Proceso ETL: carga Excel → repositorio → transformación en memoria |
| 4. Modelado | Regresión lineal OLS para proyección de ingresos; cálculo de KPIs |
| 5. Evaluación | Validación de KPIs con el personal administrativo de la IPS |
| 6. Despliegue | Tablero Flask desplegado en Render: https://syso-bi-dashboard.onrender.com |

> ¹ **Nota al pie:** Chapman et al. (2000) es la guía original de CRISP-DM, desarrollada por un consorcio de empresas líderes en minería de datos. Su vigencia es reconocida en estudios recientes como el de Schröer et al. (2021), quienes confirman que CRISP-DM sigue siendo la metodología más utilizada en proyectos de ciencia de datos a nivel mundial. Véase: Schröer, C., Kruse, F., & Gómez, J. M. (2021). A systematic literature review on applying CRISP-DM process model. *Procedia Computer Science*, 181, 526–534.

#### 2.1.2 Analítica Descriptiva y Visualización de Datos

La analítica descriptiva transforma los datos operativos en información clara y procesable, facilitando la identificación de patrones, cuellos de botella y tendencias (Few, 2012).² En combinación con técnicas de visualización, permite comunicar hallazgos de manera efectiva a distintos niveles organizacionales.

> ² **Nota al pie:** Few, S. (2012). *Show me the numbers: Designing tables and graphs to enlighten* (2.ª ed.). Analytics Press. Es la referencia canónica en diseño de visualizaciones de datos para contextos empresariales. Las recomendaciones de Few se aplican en el tablero SYSO mediante el uso de la paleta Okabe-Ito (accesibilidad daltónica) y los principios de las Variables de Bertin.


### 2.2 Conceptos Clave

#### 2.2.1 Inteligencia de Negocios (BI)

Conjunto de herramientas, tecnologías y prácticas orientadas a consolidar, analizar y visualizar información de manera interactiva para apoyar la toma de decisiones organizacionales (Chaudhuri et al., 2011).³ Una solución BI integra datos de múltiples fuentes en un repositorio unificado, habilitando análisis históricos, en tiempo real y proyectivos.

> ³ **Nota al pie:** Chaudhuri, S., Dayal, U., & Narasayya, V. (2011). An overview of business intelligence technology. *Communications of the ACM*, 54(8), 88–98. https://doi.org/10.1145/1978542.1978562 — Referencia seminal publicada en la revista de mayor impacto en ciencias de la computación (ACM).

#### 2.2.2 Indicadores Clave de Desempeño (KPI)

Los KPI (Key Performance Indicators) son métricas cuantificables que permiten evaluar el grado de cumplimiento de los objetivos estratégicos y operativos de una organización (Parmenter, 2015).⁴ En el contexto de la IPS SYSO Empresarial, los KPI definidos para el tablero son: total de órdenes, ingresos totales, tasa de cumplimiento, órdenes en gestión activa, cartera sin facturar y tiempo promedio de facturación.

> ⁴ **Nota al pie:** Parmenter, D. (2015). *Key performance indicators: Developing, implementing, and using winning KPIs* (3.ª ed.). John Wiley & Sons. Es la referencia más citada en la literatura de gestión sobre diseño e implementación de KPIs en organizaciones.

#### 2.2.3 Integración y Automatización de Datos (ETL)

El proceso ETL (Extracción, Transformación y Carga) comprende las operaciones de obtención de datos desde fuentes heterogéneas, su limpieza y estandarización, y su carga en un repositorio centralizado para su análisis (Abelló et al., 2022).⁵ Es el componente técnico que garantiza la calidad, consistencia y disponibilidad de la información a lo largo del ciclo operativo.

> ⁵ **Nota al pie:** Abelló et al. (2022) es la revisión más actualizada sobre modelado ETL disponible en acceso abierto. DOI: https://doi.org/10.3390/data7080113. En el proyecto SYSO, el ETL se implementa mediante la carga de archivos .xlsx al repositorio en memoria (patrón Repository/DAO), con transformación de campos y validación de tipos de dato.

#### 2.2.4 Tablero Web Personalizado (Dashboard)

Interfaz de visualización interactiva que presenta en tiempo real los indicadores clave del proceso, facilitando el monitoreo continuo y la toma de decisiones gerenciales (Few, 2012). En este proyecto se desarrolló un tablero web en Python y Flask, accesible desde cualquier navegador, que integra los 6 KPIs principales, 4 gráficos interactivos y módulos de análisis detallado mediante modales.

#### 2.2.5 Analítica de Datos vs. Ciencia de Datos

La analítica de datos se enfoca en describir, diagnosticar y proyectar el comportamiento de variables de negocio mediante estadística descriptiva, visualización e indicadores (Davenport & Harris, 2007).⁶ La ciencia de datos, por su parte, incorpora adicionalmente técnicas de aprendizaje automático y modelado predictivo complejo. El presente proyecto se sitúa en el dominio de la analítica de datos con un componente predictivo de regresión lineal, sin alcanzar el nivel de complejidad algorítmica de la ciencia de datos.

> ⁶ **Nota al pie:** Davenport, T. H., & Harris, J. G. (2007). *Competing on analytics: The new science of winning*. Harvard Business School Press. Obra fundacional que distingue los niveles de madurez analítica en las organizaciones, desde el reporte descriptivo hasta la optimización prescriptiva.


### 2.3 Tipos de Analítica

#### 2.3.1 Analítica Descriptiva

Responde a la pregunta: *¿qué pasó?* Transforma datos históricos en resúmenes, gráficos e indicadores que permiten comprender el estado actual del proceso. Es el tipo de analítica predominante en el tablero SYSO: los 6 KPIs, los 4 gráficos y los modales de detalle son todos componentes de analítica descriptiva.

#### 2.3.2 Analítica Predictiva

Responde a la pregunta: *¿qué podría pasar?* Utiliza modelos estadísticos o de aprendizaje automático para proyectar comportamientos futuros a partir de tendencias históricas. En el tablero SYSO, la proyección de ingresos a 6 meses mediante regresión lineal OLS es el componente de analítica predictiva. La elección de regresión lineal simple responde a la disponibilidad de datos históricos continuos y a la transparencia interpretativa requerida por el equipo administrativo.⁷

> ⁷ **Nota al pie:** La regresión lineal simple (OLS - Ordinary Least Squares) es el modelo predictivo más documentado en estadística aplicada. La fórmula implementada es: `ŷ = b₀ + b₁·x`, donde b₁ = (n·Σxy − Σx·Σy) / (n·Σx² − (Σx)²) y b₀ = (Σy − b₁·Σx) / n. La implementación en Python puro (sin librerías externas) garantiza transparencia y portabilidad.

#### 2.3.3 Analítica Prescriptiva

Responde a la pregunta: *¿qué se debería hacer?* Genera recomendaciones de acción a partir del análisis descriptivo y predictivo. En el tablero SYSO, la analítica prescriptiva se manifiesta de forma incipiente en los indicadores de alerta: el semáforo de días de facturación (verde/ámbar/rojo) y el mensaje central del Resumen Ejecutivo orientan al gestor sobre qué decisiones tomar. El desarrollo pleno de este nivel de analítica queda propuesto como trabajo futuro del proyecto.

---

### 2.4 Algoritmos Utilizados

#### 2.4.1 Regresión Lineal Simple (OLS)

La regresión lineal por mínimos cuadrados ordinarios (OLS) es el método estadístico más utilizado para modelar la relación entre una variable independiente (tiempo) y una variable dependiente continua (ingresos mensuales). Su aplicación en el proyecto permite proyectar los ingresos por ARL para los próximos 6 meses basándose en la tendencia de los últimos 12 meses históricos completos.⁸

**Fórmula implementada:**

```
pendiente (b₁) = (n·Σxy − Σx·Σy) / (n·Σx² − (Σx)²)
intercepto (b₀) = (Σy − b₁·Σx) / n
proyección[i] = max(0, b₀ + b₁ · i)
```

La proyección se limita a valores no negativos (`max(0, ...)`) dado que los ingresos no pueden ser negativos en el contexto del negocio.

> ⁸ **Nota al pie:** Montgomery, D. C., Peck, E. A., & Vining, G. G. (2012). *Introduction to linear regression analysis* (5.ª ed.). Wiley. Es la referencia estándar en análisis de regresión aplicado. La implementación del proyecto no utiliza librerías externas (NumPy, SciPy) para garantizar portabilidad y minimizar dependencias en el entorno de despliegue (Render.com).

#### 2.4.2 Agregaciones Estadísticas y KPIs

Las métricas de resumen (suma, promedio, conteo, porcentaje) son los operadores analíticos fundamentales del tablero. La tasa de cumplimiento, el valor de cartera, el tiempo promedio de facturación y los agrupamientos por ARL se calculan mediante operaciones de agregación sobre el conjunto de órdenes filtradas, sin requerir librerías estadísticas externas.


### 2.5 KPIs y Métricas del Proyecto

Los seis indicadores clave definidos para el tablero se describen a continuación con su fórmula y umbral de referencia:

| KPI | Fórmula | Umbral de alerta |
|---|---|---|
| Total Órdenes | COUNT(órdenes filtradas) | — |
| Ingresos Totales | SUM(valor_facturado) | — |
| Tasa de Cumplimiento | (Ejecutadas + Soportes + Facturadas) / Total × 100 | < 50% = crítico |
| Órdenes en Gestión | COUNT(Recibida + Aceptada + Programada + En Ejecución) | — |
| Cartera Sin Facturar | SUM(valor_facturado) donde estado ∈ {Ejecutada, Soportes Radicados} | > $0 = atención |
| Días Prom. Facturación | PROMEDIO(fecha_facturación − fecha_ejecución) | > 30 días = riesgo de glosa |

El umbral de 30 días para la facturación se deriva de los plazos contractuales típicos establecidos por las ARL en Colombia y de las disposiciones de la Resolución 3100 de 2019 sobre tiempos de respuesta administrativos.⁹

> ⁹ **Nota al pie:** Ministerio de Salud y Protección Social. (2019). *Resolución 3100 del 25 de noviembre de 2019, por la cual se definen los procedimientos y condiciones de inscripción de los prestadores de servicios de salud*. https://www.minsalud.gov.co/Normatividad_Nuevo/Resolución-3100-de-2019.pdf

---

### 2.6 Gobierno de Datos y Ética Analítica

#### 2.6.1 Ley 1581 de 2012 — Protección de Datos Personales

La Ley Estatutaria 1581 de 2012 regula el tratamiento de datos personales en Colombia, estableciendo principios de legalidad, finalidad, libertad, veracidad, transparencia, acceso restringido, seguridad y confidencialidad.¹⁰ En el contexto del proyecto, los datos de órdenes de servicio contienen información sensible de empresas afiliadas y trabajadores atendidos, por lo que su tratamiento debe cumplir con los principios de esta ley.

**Medidas implementadas en el proyecto:**
- Autenticación con credenciales para acceso al tablero
- No almacenamiento permanente de datos personales en el servidor de producción
- Uso de datos de ejemplo (fake data) en el entorno de demostración pública

> ¹⁰ **Nota al pie:** Congreso de la República de Colombia. (2012). *Ley 1581 de 2012, por la cual se dictan disposiciones generales para la protección de datos personales*. Diario Oficial 48587. https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981

#### 2.6.2 Resolución 3100 de 2019

Norma que regula la habilitación de Instituciones Prestadoras de Servicios de Salud (IPS) en Colombia, definiendo los estándares mínimos para la operación administrativa y financiera, incluida la gestión de órdenes de servicio y el registro de prestaciones. Su cumplimiento es requisito para la operación legal de SYSO Empresarial.

#### 2.6.3 ISO/IEC 27001 — Seguridad de la Información

La norma ISO/IEC 27001 establece los requisitos para un Sistema de Gestión de Seguridad de la Información (SGSI), incluyendo controles sobre confidencialidad, integridad y disponibilidad de los datos (ISO, 2022).¹¹ Si bien su implementación completa está fuera del alcance de este proyecto académico, sus principios orientan las decisiones de diseño: uso de SECRET_KEY aleatoria en producción, protección de rutas mediante sesiones, y separación entre entornos de desarrollo y producción.

> ¹¹ **Nota al pie:** International Organization for Standardization. (2022). *ISO/IEC 27001:2022 — Information security, cybersecurity and privacy protection*. https://www.iso.org/standard/27001

#### 2.6.4 Principios de Ética Analítica

Más allá del cumplimiento normativo, el proyecto adopta los siguientes principios éticos en el tratamiento de los datos:¹²

- **Anonimización:** Los datos de empresas y trabajadores en el entorno de demostración son sintéticos; no se publican datos reales de pacientes o empleados.
- **Proporcionalidad:** Solo se recopilan los campos estrictamente necesarios para los KPIs definidos.
- **Transparencia:** Los algoritmos utilizados (regresión lineal, agregaciones) son interpretables y auditables por el equipo administrativo de la IPS.
- **No discriminación algorítmica:** Los indicadores se calculan de forma homogénea para todas las ARLs, sin sesgos por el tamaño o tipo de administradora.
- **Trazabilidad:** Cada orden tiene un ID único, fechas de registro, ejecución y facturación, y un responsable asignado, lo que garantiza la auditoría del proceso.

> ¹² **Nota al pie:** Floridi, L., Cowls, J., Beltrametti, M., Chatila, R., Chazerand, P., Dignum, V., Luetge, C., Madelin, R., Pagallo, U., Rossi, F., Schafer, B., Valcke, P., & Vayena, E. (2018). An ethical framework for a good AI society: Opportunities, risks, principles, and recommendations. *Minds and Machines*, 28(4), 689–707. https://doi.org/10.1007/s11023-018-9482-5


---

### 2.7 Síntesis Integradora

El marco conceptual presentado en este capítulo articula los fundamentos teóricos, metodológicos y normativos sobre los cuales se diseñó la solución de inteligencia de negocios para la IPS SYSO Empresarial.

La metodología CRISP-DM estructura el ciclo de vida completo del proyecto: desde el diagnóstico de la problemática en el Capítulo 1 hasta el despliegue del tablero en producción. Los conceptos de BI, ETL y KPI, respaldados por las referencias académicas de Chaudhuri et al. (2011), Abelló et al. (2022) y Parmenter (2015), fundamentan cada componente técnico implementado. La analítica descriptiva —materializada en los 6 KPIs y los 4 gráficos del tablero— y la analítica predictiva —representada por el modelo de regresión lineal OLS para proyección de ingresos— conforman el núcleo analítico de la solución.

Los antecedentes revisados confirman que la problemática identificada en SYSO Empresarial —datos dispersos en hojas de cálculo, ausencia de trazabilidad y retrasos en facturación— es un patrón documentado en instituciones de salud colombianas (Bastidas-Orrego et al., 2021; Zárate-Castaño et al., 2024) y que las soluciones BI con tableros de KPIs son la respuesta más adoptada y validada en el sector (Llano-Ruiz et al., 2024; Buendía-García et al., 2024).

El marco normativo —Ley 1581 de 2012, Resolución 3100 de 2019 e ISO/IEC 27001— delimita el espacio de diseño en materia de protección de datos, habilitación de IPS y seguridad de la información, garantizando que la solución propuesta sea legalmente pertinente y técnicamente responsable.

En conjunto, este capítulo demuestra que el diseño del tablero BI para SYSO Empresarial no es una solución aislada, sino una respuesta informada por el estado del arte, fundamentada en conceptos sólidos y alineada con las mejores prácticas del sector salud en Colombia y en el ámbito internacional.

---

## Referencias

Abelló, A., Darmont, J., Etcheverry, L., Golfarelli, M., Mazón, J. N., Naumann, F., Pedersen, T. B., Rizzi, S., Trujillo, J., Vassiliadis, P., & Vossen, G. (2022). Data warehousing process modeling from classical approaches to new trends. *Data*, *7*(8), 113. https://doi.org/10.3390/data7080113

Bastidas-Orrego, L. M., Jaramillo-Arango, N., & Flórez-Marulanda, J. F. (2021). Business Intelligence for the Programs of the Secretaries of Health, Education and Planning in a Territorial Entity. *Tecnológicas*, *24*(52), e1779. https://doi.org/10.22430/22565337.1779

Buendía-García, F., Novak, M., Sotolongo-Aguilar, G., & Peñabaena-Niebles, R. (2024). Design of logistics indicators for monitoring the COVID-19 vaccination process in Colombia. *BMC Health Services Research*, *24*(1), 1367. https://doi.org/10.1186/s12913-024-11843-x

Chapman, P., Clinton, J., Kerber, R., Khabaza, T., Reinartz, T., Shearer, C., & Wirth, R. (2000). *CRISP-DM 1.0: Step-by-step data mining guide*. SPSS Inc. https://www.the-modeling-agency.com/crisp-dm.pdf

Chaudhuri, S., Dayal, U., & Narasayya, V. (2011). An overview of business intelligence technology. *Communications of the ACM*, *54*(8), 88–98. https://doi.org/10.1145/1978542.1978562

Congreso de la República de Colombia. (2012). *Ley 1581 de 2012, por la cual se dictan disposiciones generales para la protección de datos personales*. Diario Oficial 48587. https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981

Davenport, T. H., & Harris, J. G. (2007). *Competing on analytics: The new science of winning*. Harvard Business School Press.

Few, S. (2012). *Show me the numbers: Designing tables and graphs to enlighten* (2.ª ed.). Analytics Press.

Floridi, L., Cowls, J., Beltrametti, M., Chatila, R., Chazerand, P., Dignum, V., Luetge, C., Madelin, R., Pagallo, U., Rossi, F., Schafer, B., Valcke, P., & Vayena, E. (2018). An ethical framework for a good AI society. *Minds and Machines*, *28*(4), 689–707. https://doi.org/10.1007/s11023-018-9482-5

International Organization for Standardization. (2022). *ISO/IEC 27001:2022 — Information security, cybersecurity and privacy protection*. https://www.iso.org/standard/27001

Llano-Ruiz, J. C., García-García, J. A., & Escalona, M. J. (2024). Business intelligence and the leverage of information in healthcare organizations from a managerial perspective. *BMC Health Services Research*, *24*(1), 385. https://doi.org/10.1186/s12913-024-10838-w

Ministerio de Salud y Protección Social. (2019). *Resolución 3100 del 25 de noviembre de 2019*. https://www.minsalud.gov.co/Normatividad_Nuevo/Resolución-3100-de-2019.pdf

Montgomery, D. C., Peck, E. A., & Vining, G. G. (2012). *Introduction to linear regression analysis* (5.ª ed.). Wiley.

Niño-Torres, D. M., Ariza-Colpas, P. P., Morales-García, S., Piñeres-Melo, M. A., & Quintero-Linero, A. P. (2022). *Caracterización de usuarios de salud mediante inteligencia de negocios en el sector asegurador colombiano* [Tesis de maestría, Universidad Autónoma de Bucaramanga]. Repositorio UNAB. https://apolo.unab.edu.co

Parmenter, D. (2015). *Key performance indicators: Developing, implementing, and using winning KPIs* (3.ª ed.). John Wiley & Sons.

Sahoo, A. K., Pradhan, C., Barik, R. K., & Dubey, H. (2020). DeepReco: Deep Learning Based Health Recommender System Using Collaborative Filtering. *Computation*, *7*(2), 25. https://doi.org/10.3390/computation7020025

Schröer, C., Kruse, F., & Gómez, J. M. (2021). A systematic literature review on applying CRISP-DM process model. *Procedia Computer Science*, *181*, 526–534. https://doi.org/10.1016/j.procs.2021.01.199

Syed, R., Suriadi, S., Adams, M., Bandara, W., Leemans, S. J. J., Ouyang, C., ter Hofstede, A. H. M., van de Weerd, I., Wynn, M. T., & Reijers, H. A. (2020). Robotic Process Automation: Contemporary themes and challenges. *Computers in Industry*, *115*, 103162. https://doi.org/10.1016/j.compind.2019.103162

Zárate-Castaño, J. M., Moreno-Herrera, J. C., & Duque-Méndez, N. D. (2024). *Construction of the collection and billing process through process mining and business intelligence: A case study of the Colombian pharmaceutical sector*. Preprints.org. https://doi.org/10.20944/preprints202408.0818.v1

---

*Nota general sobre las notas al pie: Este documento está preparado para ser trasladado a Microsoft Word. Cada nota marcada con superíndice (¹, ², ³...) debe insertarse como nota al pie en Word usando la función: Referencias → Insertar nota al pie (Alt + Ctrl + F en Windows). El texto de cada nota está incluido inmediatamente después del párrafo correspondiente, marcado con el símbolo de superíndice.*

---

*Especialización en Analítica de Datos e Información — Fundación Universitaria Tecnológico Comfenalco · Semestre I 2026*
