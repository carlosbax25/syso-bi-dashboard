from dataclasses import dataclass, asdict
from datetime import date


@dataclass
class Orden:
    """Modelo de datos para una orden de servicio."""
    id: int
    fecha: date
    arl: str
    empresa: str
    tipo_servicio: str
    cantidad_trabajadores: int
    estado: str  # 'completada', 'pendiente', 'cancelada'
    valor_facturado: float

    def to_dict(self) -> dict:
        """Convierte la orden a diccionario serializable a JSON."""
        d = asdict(self)
        d['fecha'] = self.fecha.isoformat()
        return d


@dataclass
class KPI:
    """Modelo de datos para los indicadores clave."""
    total_ordenes: int
    ingresos_totales: float
    arl_activas: int
    tasa_cumplimiento: float  # porcentaje 0-100

    def to_dict(self) -> dict:
        """Convierte los KPIs a diccionario serializable a JSON."""
        return asdict(self)
