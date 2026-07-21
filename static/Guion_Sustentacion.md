# Guion de Sustentación — Proyecto Integrador

## Especialización en Analítica de Datos e Información
## Fundación Universitaria Tecnológico Comfenalco · 2026

---

## Slide 1 — PORTADA

**Lo que se dice:**

"Buenos días/tardes. Somos Luis Arrieta, Carlos Acosta y Pedro Guzmán, estudiantes de la Especialización en Analítica de Datos e Información del Tecnológico Comfenalco. Hoy presentamos nuestro proyecto integrador: el diseño de una solución de inteligencia de negocios para la gestión de órdenes de servicio ARL en una IPS del sector de seguridad y salud en el trabajo."

**Nota:** Este es un proyecto académico con datos sintéticos y una organización representativa con fines ilustrativos.

---

## Slide 2 — APERTURA (¿Por qué importa este proyecto?)

**Lo que se dice:**

"¿Por qué es importante este proyecto? Porque aborda un problema real del sector salud: la facturación. En una IPS que presta servicios a las Administradoras de Riesgos Laborales, la facturación es la principal fuente de ingresos. Cada día que pasa sin facturar un servicio ya ejecutado es un día de riesgo financiero.

Los números hablan por sí solos: estamos hablando de 45.000 órdenes de servicio gestionadas manualmente en hojas de cálculo, $926 millones de pesos en cartera pendiente por facturar, un promedio de 22.7 días entre ejecutar un servicio y emitir la factura, y cero visibilidad en tiempo real del estado de esas órdenes.

La pregunta que nos hicimos fue: ¿cómo transformamos esos datos dispersos en información que permita tomar decisiones oportunas?"

---

## Slide 3 — CONTEXTO (¿Dónde ocurre el problema?)

**Lo que se dice:**

"El contexto de este proyecto es una IPS ubicada en Cartagena, Colombia, dedicada a la seguridad y salud en el trabajo. Esta organización presta servicios a 4 Administradoras de Riesgos Laborales: Sura, Colmena, Bolívar y Alfa.

Su portafolio incluye 76 servicios diferentes, clasificados en 4 tipos: laboratorio clínico, pruebas complementarias, asesoría y capacitación. Atiende a 14 empresas clientes y ha acumulado 45.000 órdenes de servicio en el periodo 2020 a 2026.

Toda esta información se gestiona mediante la Matriz de Gestión ARL, que es un archivo Excel donde se registran manualmente todas las órdenes desde que se reciben hasta que se facturan."

---

## Slide 4 — PROBLEMA (¿Qué situación se quiere resolver?)

**Lo que se dice:**

"El problema central que identificamos es la gestión ineficiente de las órdenes de servicio. Las causas raíz son cuatro: primero, los registros se llevan manualmente en Excel sin ninguna automatización. Segundo, no hay integración entre los diferentes sistemas de información. Tercero, no existe un modelo de datos estructurado. Y cuarto, los registros presentan baja calidad y estandarización.

¿Cuáles son las consecuencias? El tiempo promedio para facturar un servicio ya ejecutado es de 22.7 días. Hay 18.912 órdenes que ya fueron ejecutadas pero que aún no tienen factura emitida, representando $926 millones en cartera pendiente. Esto genera reprocesos, sobrecarga laboral y, lo más crítico, decisiones que se toman sin respaldo analítico."

---

## Slide 5 — OBJETIVO (¿Qué se propuso lograr?)

**Lo que se dice:**

"Nuestro objetivo general fue diseñar una solución de analítica de datos que permita integrar, transformar y visualizar la información de las órdenes ARL mediante un tablero de inteligencia de negocios desarrollado en Python.

Para lograrlo definimos 5 objetivos específicos: primero, identificar las fuentes de datos y las variables clave del proceso. Segundo, diseñar un modelo unificado de datos. Tercero, diseñar el flujo de extracción, transformación y carga de la información. Cuarto, definir los indicadores clave de desempeño. Y quinto, proponer el diseño funcional del tablero interactivo.

Cada uno de estos objetivos es clickeable y pueden ver el detalle de lo que logramos en cada uno."

**Nota:** Aquí se pueden hacer clic en los 5 objetivos para abrir los modales con el detalle.

---

## Slide 6 — METODOLOGÍA (¿Cómo se desarrolló?)

**Lo que se dice:**

"Seguimos la metodología CRISP-DM, que es el estándar para proyectos de analítica de datos. Consta de 6 fases que ejecutamos de la siguiente manera:

En la fase de Negocio realizamos entrevistas con el personal administrativo para diagnosticar el problema. En la fase de Datos revisamos la Matriz ARL completa e identificamos 13 variables relevantes. En la fase de Preparación construimos un proceso automatizado de carga desde Excel a la aplicación. En la fase de Modelado implementamos 6 indicadores de desempeño y una proyección de ingresos a 6 meses. En la fase de Evaluación validamos los indicadores con el personal de la IPS y ajustamos los umbrales de alerta. Y en la fase de Despliegue publicamos el tablero en internet, accesible desde cualquier navegador."

---

## Slide 7 — SOLUCIÓN (¿Qué se construyó?)

**Lo que se dice:**

"¿Qué construimos? Un tablero de indicadores completo con dos grandes componentes.

El primero es el tablero principal, que incluye 6 indicadores interactivos — al hacer clic en cada uno se abre el detalle. Tiene 4 gráficos dinámicos con filtros, filtros combinados por ARL, tipo de servicio, programa y tarea, y permite exportar los datos filtrados a Excel.

El segundo componente son las funcionalidades de análisis: una proyección de ingresos a 6 meses basada en la tendencia histórica, un resumen ejecutivo narrativo que se genera automáticamente, un análisis de la cartera pendiente y los tiempos de facturación, la posibilidad de cargar datos masivamente desde un archivo Excel, y un diseño accesible para personas con daltonismo.

Todo esto fue desarrollado en Python y está publicado en internet, accesible desde cualquier navegador sin necesidad de instalar nada."

---

## Slide 8 — RESULTADOS (¿Qué se obtuvo?)

**Lo que se dice:**

"Los resultados se resumen en estos 6 indicadores calculados sobre las 45.000 órdenes del periodo 2020 a 2026:

El total de órdenes procesadas es de 45.000. Los ingresos totales suman $2.204 millones de pesos. La tasa de cumplimiento — es decir, el porcentaje de órdenes que avanzan a estados completados — es del 62.2%. Hay 11.633 órdenes actualmente en gestión activa. La cartera sin facturar asciende a $926 millones. Y el tiempo promedio entre ejecutar un servicio y facturarlo es de 22.7 días.

El hallazgo más importante es que el 42% de las órdenes que ya fueron completadas operativamente no han sido facturadas. Esto nos dice que el punto crítico del proceso no está en prestar el servicio — eso se hace bien — sino en facturarlo después."

---

## Slide 9 — VALIDACIÓN (¿Cómo se comprobó?)

**Lo que se dice:**

"La solución se validó en 5 niveles. A nivel técnico, creamos 23 pruebas automatizadas que verifican el correcto funcionamiento de todos los indicadores y filtros. A nivel del modelo predictivo, reservamos los últimos 3 meses de datos como prueba y comparamos las proyecciones contra los valores reales, obteniendo métricas aceptables. A nivel funcional, realizamos sesiones presenciales con el Analista de Gestión ARL y con el Director Administrativo, quienes confirmaron que los indicadores son coherentes con los datos que manejan manualmente. Y a nivel normativo, contrastamos el umbral de 30 días con los plazos contractuales reales de las ARL.

Pueden hacer clic en cada fila para ver el detalle de cómo se comprobó cada nivel."

**Nota:** Aquí se pueden hacer clic en "Ver ▸" de cada fila para abrir los modales explicativos.

---

## Slide 10 — VALOR GENERADO (¿Qué aporta la solución?)

**Lo que se dice:**

"¿Qué valor genera esta solución? Lo resumimos en 4 indicadores de impacto medibles.

Primero, el tiempo de generación de reportes pasó de 3 a 4 horas a segundos — de horas a segundos. Segundo, la detección de órdenes sin facturar, que antes dependía de una revisión manual semanal, ahora es permanente y automática. Tercero, la visibilidad del estado de las órdenes, que antes solo estaba disponible al cierre del mes, ahora es visible en todo momento. Y cuarto, la proyección de ingresos no existía antes — ahora se pueden proyectar 6 meses por cada ARL.

Además, la arquitectura fue diseñada para crecer: está preparada para conectarse a una base de datos permanente, su información puede consumirse desde otros sistemas, y puede replicarse en otras instituciones del sector."

---

## Slide 11 — CONCLUSIONES (¿Qué se aprendió?)

**Lo que se dice:**

"Llegamos a 4 conclusiones principales.

Primera: logramos implementar una solución de inteligencia de negocios funcional con 6 indicadores y proyección predictiva, desplegada en un entorno de producción real accesible desde internet.

Segunda: identificamos que el punto crítico del proceso está en facturar, no en prestar el servicio. Las órdenes se ejecutan, pero se quedan estancadas en la etapa administrativa.

Tercera: la herramienta reduce el tiempo de generación de reportes de varias horas a consulta inmediata, habilitando decisiones oportunas.

Y cuarta: demostramos que es viable transformar la gestión de una IPS mediante analítica de datos usando herramientas de código abierto y sin costo de infraestructura."

---

## Slide 12 — RECOMENDACIONES (¿Qué sigue?)

**Lo que se dice:**

"Para el futuro del proyecto recomendamos acciones en tres horizontes.

A corto plazo: migrar los datos a una base de datos permanente, establecer conexión automática con los portales de las ARL para que las órdenes se carguen sin intervención manual, e implementar alertas por correo electrónico cuando una orden se acerque al umbral de riesgo.

A mediano plazo: incorporar proyecciones que consideren los meses altos y bajos del año, implementar alertas automáticas para órdenes en riesgo de ser rechazadas, y que el propio tablero sugiera acciones específicas.

A largo plazo: replicar esta solución en otras IPS del sector, implementar trazabilidad completa del proceso de principio a fin, y conectar el sistema con la facturación electrónica de la DIAN."

---

## Slide 13 — DEMOSTRACIÓN

**Lo que se dice:**

"Ahora les vamos a mostrar el tablero en funcionamiento. Contiene 6 indicadores interactivos, 4 gráficos y procesa 45.000 órdenes. Voy a abrirlo para que puedan ver cómo funciona en tiempo real."

**Acciones durante la demo:**
1. Hacer clic en "Abrir tablero"
2. Ingresar credenciales (Admin / 123)
3. Mostrar las 6 tarjetas de indicadores — hacer clic en una para mostrar el detalle
4. Mostrar los filtros en cascada — filtrar por una ARL específica
5. Mostrar la proyección de ingresos (+6 meses)
6. Ir al módulo de Resumen Ejecutivo
7. Ir al módulo de Gestión y mostrar la carga de datos
8. Volver al tablero principal

**Tiempo sugerido:** 3-5 minutos de demo en vivo.

---

## Slide 14 — GRACIAS / PREGUNTAS

**Lo que se dice:**

"Eso es todo por nuestra parte. Agradecemos su atención y estamos disponibles para responder preguntas."

**Preguntas frecuentes que podrían hacer:**

1. **¿Por qué Python y no Power BI?** — Porque queríamos control total sobre la lógica de negocio, personalización sin límites de licencia, y despliegue gratuito en internet. Power BI requiere licencia y no permite el nivel de interactividad que logramos.

2. **¿Los datos son reales?** — Los datos son sintéticos pero basados en el catálogo real de servicios de una IPS. Los 76 servicios, las 4 ARLs y los valores del tarifario son reales; las combinaciones y fechas son generadas algorítmicamente.

3. **¿Cómo se garantiza la calidad de los datos?** — El proceso de carga valida campo a campo, reporta errores sin detener el proceso, y aplica valores por defecto cuando hay campos vacíos.

4. **¿Qué pasa si la IPS quiere usar datos reales?** — Solo tiene que cargar su archivo Excel real desde el Panel de Gestión. La arquitectura permite migrar a una base de datos sin modificar los indicadores ni el tablero.

5. **¿Por qué el umbral de 30 días?** — Se validó con los plazos contractuales de las 4 ARLs. Superar ese tiempo expone a la IPS a glosas o pérdida del derecho a cobro.

6. **¿Qué metodología usaron?** — CRISP-DM, el estándar para proyectos de analítica de datos, con sus 6 fases aplicadas secuencialmente.

---

*Tiempo total estimado de sustentación: 20-25 minutos (incluyendo demo)*
*Tiempo sugerido por slide: 1.5-2 minutos*
