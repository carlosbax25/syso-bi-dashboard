from flask import Blueprint, request, jsonify
from datetime import date

from services.dashboard_service import DashboardService

api_bp = Blueprint('api', __name__, url_prefix='/api')


def init_api(service: DashboardService):
    """Inicializa el blueprint API con la instancia del servicio."""

    @api_bp.route('/datos')
    def obtener_datos():
        """Endpoint principal: retorna órdenes filtradas, KPIs y datos de gráficos."""
        fecha_inicio = _parse_date(request.args.get('fecha_inicio'))
        fecha_fin = _parse_date(request.args.get('fecha_fin'))
        arls = request.args.getlist('arl') or None
        tipos = request.args.getlist('tipo_servicio') or None
        estados = request.args.getlist('estado') or None

        ordenes = service.obtener_ordenes_filtradas(
            fecha_inicio, fecha_fin, arls, tipos, estados
        )
        kpis = service.calcular_kpis(ordenes)

        return jsonify({
            'ordenes': [o.to_dict() for o in ordenes],
            'kpis': kpis.to_dict(),
            'graficos': {
                'ordenes_por_arl': service.agrupar_ordenes_por_arl(ordenes),
                'ordenes_por_mes': service.agrupar_ordenes_por_mes(ordenes),
                'ordenes_por_servicio': service.agrupar_ordenes_por_servicio(ordenes),
                'ingresos_por_arl': service.agrupar_ingresos_por_arl(ordenes),
            },
            'pendientes_por_arl': service.analizar_pendientes_por_arl(ordenes),
            'filtros_disponibles': {
                'arls': service.obtener_arls(),
                'tipos_servicio': service.obtener_tipos_servicio(),
                'estados': ['completada', 'pendiente', 'cancelada'],
            },
        })

    @api_bp.route('/filtros')
    def obtener_filtros():
        """Retorna las opciones disponibles para los filtros."""
        return jsonify({
            'arls': service.obtener_arls(),
            'tipos_servicio': service.obtener_tipos_servicio(),
        })

    return api_bp


def _parse_date(value: str) -> date | None:
    """Parsea una fecha ISO. Retorna None si el valor es vacío o inválido."""
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None
