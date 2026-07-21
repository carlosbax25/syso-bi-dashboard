from typing import List, Dict, Optional, Any
from datetime import date

from models.orden import Orden, KPI
from repositories.base_repository import BaseRepository


class DashboardService:
    """Lógica de negocio: filtrado, cálculo de KPIs y agregaciones para gráficos."""

    def __init__(self, repository: BaseRepository):
        self._repo = repository

    def obtener_ordenes_filtradas(
        self,
        fecha_inicio: Optional[date] = None,
        fecha_fin: Optional[date] = None,
        arls: Optional[List[str]] = None,
        tipos_servicio: Optional[List[str]] = None,
        estados: Optional[List[str]] = None,
        programas: Optional[List[str]] = None,
        tareas: Optional[List[str]] = None,
    ) -> List[Orden]:
        """Filtra órdenes según los criterios proporcionados."""
        ordenes = self._repo.obtener_ordenes()

        if fecha_inicio is not None:
            ordenes = [o for o in ordenes if o.fecha >= fecha_inicio]
        if fecha_fin is not None:
            ordenes = [o for o in ordenes if o.fecha <= fecha_fin]
        if arls is not None:
            arls_set = set(arls)
            ordenes = [o for o in ordenes if o.arl in arls_set]
        if tipos_servicio is not None:
            tipos_set = set(tipos_servicio)
            ordenes = [o for o in ordenes if o.tipo_servicio in tipos_set]
        if estados is not None:
            estados_set = set(estados)
            ordenes = [o for o in ordenes if o.estado in estados_set]
        if programas is not None:
            prog_set = set(programas)
            ordenes = [o for o in ordenes if o.programa in prog_set]
        if tareas is not None:
            tar_set = set(tareas)
            ordenes = [o for o in ordenes if o.tarea in tar_set]

        return ordenes

    def calcular_kpis(self, ordenes: List[Orden]) -> KPI:
        """Calcula los KPIs a partir de una lista de órdenes.

        Incluye los indicadores de tiempo y cartera del Capítulo 1 (Tabla 1):
        - dias_promedio_facturacion: tiempo promedio ejecución → facturación.
        - ordenes_sin_facturar / valor_cartera_pendiente: cartera vencida potencial.
        """
        total = len(ordenes)
        ingresos = sum(o.valor_facturado for o in ordenes)
        arls_activas = len(set(o.arl for o in ordenes))
        estados_completados = {'Ejecutada', 'Soportes Radicados', 'Facturada'}
        completadas = sum(1 for o in ordenes if o.estado in estados_completados)
        tasa = (completadas / total * 100) if total > 0 else 0.0

        # KPI: órdenes ejecutadas pero no facturadas (cartera potencial)
        estados_ejecutados_no_fact = {'Ejecutada', 'Soportes Radicados'}
        sin_facturar = [o for o in ordenes if o.estado in estados_ejecutados_no_fact]
        valor_cartera = sum(o.valor_facturado for o in sin_facturar)

        # KPI: tiempo promedio entre ejecución y facturación
        tiempos = [
            o.dias_ejecucion_a_facturacion
            for o in ordenes
            if o.dias_ejecucion_a_facturacion is not None
        ]
        dias_prom = round(sum(tiempos) / len(tiempos), 1) if tiempos else 0.0

        return KPI(
            total_ordenes=total,
            ingresos_totales=round(ingresos, 2),
            arl_activas=arls_activas,
            tasa_cumplimiento=round(tasa, 2),
            ordenes_sin_facturar=len(sin_facturar),
            valor_cartera_pendiente=round(valor_cartera, 2),
            dias_promedio_facturacion=dias_prom,
        )

    def agrupar_ordenes_por_arl(self, ordenes: List[Orden]) -> Dict[str, Dict[str, int]]:
        """Agrupa cantidad de órdenes por ARL en 3 categorías del flujo."""
        completados = {'Ejecutada', 'Soportes Radicados', 'Facturada'}
        en_gestion = {'Recibida', 'Aceptada', 'Programada / Asignada', 'En Ejecución'}
        resultado: Dict[str, Dict[str, int]] = {}
        for o in ordenes:
            if o.arl not in resultado:
                resultado[o.arl] = {'en_gestion': 0, 'completada': 0, 'cerrada': 0}
            if o.estado in completados:
                resultado[o.arl]['completada'] += 1
            elif o.estado in en_gestion:
                resultado[o.arl]['en_gestion'] += 1
            else:
                resultado[o.arl]['cerrada'] += 1
        return dict(sorted(resultado.items()))

    def agrupar_ordenes_por_mes(self, ordenes: List[Orden]) -> Dict[str, int]:
        """Agrupa cantidad de órdenes por mes (YYYY-MM). Retorna dict ordenado por clave."""
        resultado: Dict[str, int] = {}
        for o in ordenes:
            clave = o.fecha.strftime("%Y-%m")
            resultado[clave] = resultado.get(clave, 0) + 1
        return dict(sorted(resultado.items()))

    def agrupar_ordenes_por_servicio(self, ordenes: List[Orden]) -> Dict[str, int]:
        """Agrupa cantidad de órdenes por tipo de servicio. Retorna dict ordenado por cantidad desc."""
        resultado: Dict[str, int] = {}
        for o in ordenes:
            resultado[o.tipo_servicio] = resultado.get(o.tipo_servicio, 0) + 1
        return dict(sorted(resultado.items(), key=lambda x: x[1], reverse=True))

    def agrupar_ingresos_por_arl(self, ordenes: List[Orden]) -> Dict[str, float]:
        """Agrupa ingresos facturados por ARL. Valores redondeados a 2 decimales."""
        resultado: Dict[str, float] = {}
        for o in ordenes:
            resultado[o.arl] = resultado.get(o.arl, 0.0) + o.valor_facturado
        return {k: round(v, 2) for k, v in sorted(resultado.items(), key=lambda x: x[1], reverse=True)}

    def analizar_pendientes_por_arl(self, ordenes: List[Orden]) -> List[Dict[str, Any]]:
        """Analiza órdenes pendientes agrupadas por ARL con días de antigüedad."""
        hoy = date.today()
        pendientes = [o for o in ordenes if o.estado in
                      {'Recibida', 'Aceptada', 'Programada / Asignada', 'En Ejecución'}]

        agrupado: Dict[str, Dict[str, Any]] = {}
        for o in pendientes:
            if o.arl not in agrupado:
                agrupado[o.arl] = {
                    'arl': o.arl,
                    'cantidad': 0,
                    'valor_total': 0.0,
                    'dias_max': 0,
                    'dias_min': 999999,
                    'dias_suma': 0,
                    'ordenes': [],
                }
            g = agrupado[o.arl]
            dias = (hoy - o.fecha).days
            g['cantidad'] += 1
            g['valor_total'] += o.valor_facturado
            g['dias_max'] = max(g['dias_max'], dias)
            g['dias_min'] = min(g['dias_min'], dias)
            g['dias_suma'] += dias
            g['ordenes'].append({
                'id': o.id,
                'fecha': o.fecha.isoformat(),
                'empresa': o.empresa,
                'tipo_servicio': o.tipo_servicio,
                'trabajadores': o.cantidad_trabajadores,
                'valor': round(o.valor_facturado, 2),
                'dias_pendiente': dias,
            })

        resultado = []
        for arl_data in sorted(agrupado.values(), key=lambda x: x['valor_total'], reverse=True):
            arl_data['valor_total'] = round(arl_data['valor_total'], 2)
            arl_data['dias_promedio'] = round(arl_data['dias_suma'] / arl_data['cantidad'])
            if arl_data['dias_min'] == 999999:
                arl_data['dias_min'] = 0
            del arl_data['dias_suma']
            arl_data['ordenes'].sort(key=lambda x: x['dias_pendiente'], reverse=True)
            resultado.append(arl_data)

        return resultado

    def analizar_tiempos_proceso(self, ordenes: List[Orden]) -> Dict[str, Any]:
        """Analiza los tiempos del ciclo de gestión: registro → ejecución → facturación.

        Calcula el KPI 'Tiempo promedio entre ejecución y facturación' de la Tabla 1
        del documento del proyecto, desglosado por ARL.
        """
        resultado: Dict[str, Any] = {
            'global': {
                'dias_registro_ejecucion': [],
                'dias_ejecucion_facturacion': [],
                'dias_ciclo_total': [],
            },
            'por_arl': {},
        }

        for o in ordenes:
            arl = o.arl
            if arl not in resultado['por_arl']:
                resultado['por_arl'][arl] = {
                    'dias_registro_ejecucion': [],
                    'dias_ejecucion_facturacion': [],
                    'dias_ciclo_total': [],
                }

            for campo, prop in [
                ('dias_registro_ejecucion', o.dias_hasta_ejecucion),
                ('dias_ejecucion_facturacion', o.dias_ejecucion_a_facturacion),
                ('dias_ciclo_total', o.dias_ciclo_total),
            ]:
                if prop is not None:
                    resultado['global'][campo].append(prop)
                    resultado['por_arl'][arl][campo].append(prop)

        def _stats(vals: List[int]) -> Dict[str, Any]:
            if not vals:
                return {'promedio': None, 'min': None, 'max': None, 'cantidad': 0}
            return {
                'promedio': round(sum(vals) / len(vals), 1),
                'min': min(vals),
                'max': max(vals),
                'cantidad': len(vals),
            }

        # Convertir listas a estadísticas
        for nivel in [resultado['global']]:
            for campo in list(nivel):
                nivel[campo] = _stats(nivel[campo])

        for arl_data in resultado['por_arl'].values():
            for campo in list(arl_data):
                arl_data[campo] = _stats(arl_data[campo])

        return resultado

    def analizar_cartera(self, ordenes: List[Orden]) -> List[Dict[str, Any]]:
        """Analiza la cartera: órdenes ejecutadas sin facturar, agrupadas por ARL.

        Corresponde al indicador 'Órdenes sin facturar' y 'Cartera vencida' del
        Capítulo 1 del documento del proyecto.
        """
        estados_cartera = {'Ejecutada', 'Soportes Radicados'}
        hoy = date.today()

        agrupado: Dict[str, Dict[str, Any]] = {}
        for o in ordenes:
            if o.estado not in estados_cartera:
                continue
            arl = o.arl
            if arl not in agrupado:
                agrupado[arl] = {
                    'arl': arl,
                    'cantidad': 0,
                    'valor_total': 0.0,
                    'dias_max': 0,
                    'dias_suma': 0,
                }
            ref = o.fecha_ejecucion or o.fecha
            dias = (hoy - ref).days
            agrupado[arl]['cantidad'] += 1
            agrupado[arl]['valor_total'] += o.valor_facturado
            agrupado[arl]['dias_max'] = max(agrupado[arl]['dias_max'], dias)
            agrupado[arl]['dias_suma'] += dias

        resultado = []
        for d in sorted(agrupado.values(), key=lambda x: x['valor_total'], reverse=True):
            d['valor_total'] = round(d['valor_total'], 2)
            d['dias_promedio'] = round(d['dias_suma'] / d['cantidad']) if d['cantidad'] else 0
            del d['dias_suma']
            resultado.append(d)

        return resultado

    def obtener_arls(self) -> List[str]:
        """Retorna la lista de ARLs distintas, delegando al repositorio."""
        return self._repo.obtener_arls()

    def proyectar_ingresos_por_arl(self, ordenes: List[Orden], meses_futuro: int = 6, meses_hist_limit: int = 12) -> Dict[str, Any]:
        """Proyecta ingresos mensuales por ARL usando regresión lineal simple.

        Args:
            meses_futuro: meses a proyectar
            meses_hist_limit: meses históricos a usar para la regresión y visualización
        """
        hoy = date.today()
        mes_actual = hoy.strftime('%Y-%m')

        # Agrupar ingresos mensuales por ARL
        datos_arl: Dict[str, Dict[str, float]] = {}
        for o in ordenes:
            mes = o.fecha.strftime('%Y-%m')
            if o.arl not in datos_arl:
                datos_arl[o.arl] = {}
            datos_arl[o.arl][mes] = datos_arl[o.arl].get(mes, 0.0) + o.valor_facturado

        # Obtener todos los meses completos ordenados
        todos_meses = sorted(set(
            mes for arl_data in datos_arl.values() for mes in arl_data
        ))
        meses_completos = [m for m in todos_meses if m < mes_actual]

        if len(meses_completos) < 2:
            return {'meses_historicos': [], 'meses_proyeccion': [], 'series': {}}

        # Limit historical months
        meses_usados = meses_completos[-meses_hist_limit:]

        # Generar meses futuros
        y, m = int(mes_actual[:4]), int(mes_actual[5:])
        meses_futuros = []
        for _ in range(meses_futuro):
            meses_futuros.append(f'{y:04d}-{m:02d}')
            m += 1
            if m > 12:
                m = 1
                y += 1

        # Regresión lineal por ARL
        series = {}
        for arl, meses_data in sorted(datos_arl.items()):
            valores = [meses_data.get(mes, 0.0) for mes in meses_usados]

            n = len(valores)
            x = list(range(n))
            sum_x = sum(x)
            sum_y = sum(valores)
            sum_xy = sum(xi * yi for xi, yi in zip(x, valores))
            sum_x2 = sum(xi * xi for xi in x)

            denom = n * sum_x2 - sum_x * sum_x
            if denom == 0:
                pendiente = 0.0
                intercepto = sum_y / n if n > 0 else 0.0
            else:
                pendiente = (n * sum_xy - sum_x * sum_y) / denom
                intercepto = (sum_y - pendiente * sum_x) / n

            # Proyectar
            proyeccion = []
            for i in range(n, n + meses_futuro):
                val = max(0, intercepto + pendiente * i)
                proyeccion.append(round(val, 2))

            series[arl] = {
                'historico': [round(v, 2) for v in valores],
                'proyeccion': proyeccion,
                'pendiente': round(pendiente, 2),
            }

        return {
            'meses_historicos': meses_usados,
            'meses_proyeccion': meses_futuros,
            'series': series,
        }

    def obtener_tipos_servicio(self) -> List[str]:
        """Retorna la lista de tipos de servicio distintos, delegando al repositorio."""
        return self._repo.obtener_tipos_servicio()

    def obtener_programas(self) -> List[str]:
        """Retorna la lista de programas distintos."""
        return self._repo.obtener_programas()

    def obtener_tareas(self) -> List[str]:
        """Retorna la lista de tareas distintas."""
        return self._repo.obtener_tareas()
