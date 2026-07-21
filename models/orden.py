from dataclasses import dataclass, asdict, field
from datetime import date
from typing import Optional


@dataclass
class Orden:
    """Modelo de datos para una orden de servicio.

    Campos de trazabilidad temporal (alineados con el documento del proyecto):
    - fecha:              Fecha de registro / recepción de la orden.
    - fecha_ejecucion:    Fecha en que se ejecutó/realizó el servicio.
    - fecha_facturacion:  Fecha en que se emitió la factura a la ARL.

    Estos tres campos permiten calcular los KPIs de tiempo del proceso:
    tiempo_ejecucion  = fecha_ejecucion  - fecha
    tiempo_facturacion = fecha_facturacion - fecha_ejecucion
    ciclo_total       = fecha_facturacion - fecha
    """
    id: int
    fecha: date                              # Fecha de registro
    arl: str
    empresa: str
    tipo_servicio: str
    programa: str
    tarea: str
    cantidad_trabajadores: int
    estado: str
    valor_facturado: float
    responsable: str = field(default='')    # Profesional/responsable de la atención
    fecha_ejecucion: Optional[date] = field(default=None)    # Fecha ejecución del servicio
    fecha_facturacion: Optional[date] = field(default=None)  # Fecha de facturación a la ARL

    def to_dict(self) -> dict:
        """Convierte la orden a diccionario serializable a JSON."""
        d = asdict(self)
        d['fecha'] = self.fecha.isoformat()
        d['fecha_ejecucion'] = self.fecha_ejecucion.isoformat() if self.fecha_ejecucion else None
        d['fecha_facturacion'] = self.fecha_facturacion.isoformat() if self.fecha_facturacion else None
        return d

    @property
    def dias_hasta_ejecucion(self) -> Optional[int]:
        """Días entre registro y ejecución."""
        if self.fecha_ejecucion:
            return (self.fecha_ejecucion - self.fecha).days
        return None

    @property
    def dias_ejecucion_a_facturacion(self) -> Optional[int]:
        """Días entre ejecución y facturación (KPI clave del documento)."""
        if self.fecha_ejecucion and self.fecha_facturacion:
            return (self.fecha_facturacion - self.fecha_ejecucion).days
        return None

    @property
    def dias_ciclo_total(self) -> Optional[int]:
        """Días entre registro y facturación (ciclo completo)."""
        if self.fecha_facturacion:
            return (self.fecha_facturacion - self.fecha).days
        return None


@dataclass
class KPI:
    """Modelo de datos para los indicadores clave.

    Incluye métricas de tiempo de proceso alineadas con el Capítulo 1 del proyecto:
    - dias_promedio_facturacion: Tiempo promedio entre ejecución y facturación (Tabla 1).
    - ordenes_sin_facturar:      Órdenes ejecutadas pero aún sin factura (cartera potencial).
    - valor_cartera_pendiente:   Valor monetario de las órdenes sin facturar.
    """
    total_ordenes: int
    ingresos_totales: float
    arl_activas: int
    tasa_cumplimiento: float          # porcentaje 0-100
    ordenes_sin_facturar: int = 0     # ejecutadas pero no facturadas
    valor_cartera_pendiente: float = 0.0
    dias_promedio_facturacion: float = 0.0  # días promedio ejecución → facturación

    def to_dict(self) -> dict:
        """Convierte los KPIs a diccionario serializable a JSON."""
        return asdict(self)
