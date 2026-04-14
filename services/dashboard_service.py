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

        return ordenes

    def calcular_kpis(self, ordenes: List[Orden]) -> KPI:
        """Calcula los KPIs a partir de una lista de órdenes."""
        total = len(ordenes)
        ingresos = sum(o.valor_facturado for o in ordenes)
        arls_activas = len(set(o.arl for o in ordenes))
        completadas = sum(1 for o in ordenes if o.estado == "completada")
        tasa = (completadas / total * 100) if total > 0 else 0.0

        return KPI(
            total_ordenes=total,
            ingresos_totales=round(ingresos, 2),
            arl_activas=arls_activas,
            tasa_cumplimiento=round(tasa, 2),
        )

    def agrupar_ordenes_por_arl(self, ordenes: List[Orden]) -> Dict[str, Dict[str, int]]:
        """Agrupa cantidad de órdenes por ARL y estado. Retorna dict ordenado por clave."""
        resultado: Dict[str, Dict[str, int]] = {}
        for o in ordenes:
            if o.arl not in resultado:
                resultado[o.arl] = {'completada': 0, 'pendiente': 0, 'cancelada': 0}
            resultado[o.arl][o.estado] = resultado[o.arl].get(o.estado, 0) + 1
        return dict(sorted(resultado.items()))

    def agrupar_ordenes_por_mes(self, ordenes: List[Orden]) -> Dict[str, int]:
        """Agrupa cantidad de órdenes por mes (YYYY-MM). Retorna dict ordenado por clave."""
        resultado: Dict[str, int] = {}
        for o in ordenes:
            clave = o.fecha.strftime("%Y-%m")
            resultado[clave] = resultado.get(clave, 0) + 1
        return dict(sorted(resultado.items()))

    def agrupar_ordenes_por_servicio(self, ordenes: List[Orden]) -> Dict[str, int]:
        """Agrupa cantidad de órdenes por tipo de servicio. Retorna dict ordenado por clave."""
        resultado: Dict[str, int] = {}
        for o in ordenes:
            resultado[o.tipo_servicio] = resultado.get(o.tipo_servicio, 0) + 1
        return dict(sorted(resultado.items()))

    def agrupar_ingresos_por_arl(self, ordenes: List[Orden]) -> Dict[str, float]:
        """Agrupa ingresos facturados por ARL. Valores redondeados a 2 decimales."""
        resultado: Dict[str, float] = {}
        for o in ordenes:
            resultado[o.arl] = resultado.get(o.arl, 0.0) + o.valor_facturado
        return {k: round(v, 2) for k, v in sorted(resultado.items())}

    def analizar_pendientes_por_arl(self, ordenes: List[Orden]) -> List[Dict[str, Any]]:
        """Analiza órdenes pendientes agrupadas por ARL con días de antigüedad."""
        hoy = date.today()
        pendientes = [o for o in ordenes if o.estado == 'pendiente']

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

    def obtener_arls(self) -> List[str]:
        """Retorna la lista de ARLs distintas, delegando al repositorio."""
        return self._repo.obtener_arls()

    def obtener_tipos_servicio(self) -> List[str]:
        """Retorna la lista de tipos de servicio distintos, delegando al repositorio."""
        return self._repo.obtener_tipos_servicio()
