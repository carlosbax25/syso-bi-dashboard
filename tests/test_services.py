from datetime import date
from typing import List

from models.orden import Orden, KPI
from repositories.base_repository import BaseRepository
from services.dashboard_service import DashboardService


# --- Stub repository for testing ---

class StubRepository(BaseRepository):
    """Repositorio stub con datos controlados para tests unitarios."""

    def __init__(self, ordenes: List[Orden]):
        self._ordenes = ordenes

    def obtener_ordenes(self) -> List[Orden]:
        return list(self._ordenes)

    def obtener_arls(self) -> List[str]:
        return sorted(set(o.arl for o in self._ordenes))

    def obtener_tipos_servicio(self) -> List[str]:
        return sorted(set(o.tipo_servicio for o in self._ordenes))


# --- Fixtures ---

def _sample_ordenes() -> List[Orden]:
    return [
        Orden(1, date(2024, 1, 15), "Sura ARL", "Ecopetrol", "Laboratorio Clínico", 50, "completada", 1_000_000.0),
        Orden(2, date(2024, 2, 10), "Positiva ARL", "Alpina", "Psicología", 20, "pendiente", 500_000.0),
        Orden(3, date(2024, 3, 5), "Sura ARL", "Nutresa", "Seguridad Industrial", 30, "completada", 750_000.50),
        Orden(4, date(2024, 3, 20), "Colmena Seguros", "EPM", "Laboratorio Clínico", 10, "cancelada", 200_000.0),
        Orden(5, date(2024, 4, 1), "Positiva ARL", "Bancolombia", "Psicología", 15, "completada", 350_000.0),
    ]


def _make_service(ordenes: List[Orden] | None = None) -> DashboardService:
    return DashboardService(StubRepository(ordenes or _sample_ordenes()))


# --- Tests: obtener_ordenes_filtradas ---

class TestObtenerOrdenesFiltradas:
    def test_sin_filtros_retorna_todas(self):
        service = _make_service()
        result = service.obtener_ordenes_filtradas()
        assert len(result) == 5

    def test_filtro_fecha_inicio(self):
        service = _make_service()
        result = service.obtener_ordenes_filtradas(fecha_inicio=date(2024, 3, 1))
        assert len(result) == 3
        assert all(o.fecha >= date(2024, 3, 1) for o in result)

    def test_filtro_fecha_fin(self):
        service = _make_service()
        result = service.obtener_ordenes_filtradas(fecha_fin=date(2024, 2, 28))
        assert len(result) == 2
        assert all(o.fecha <= date(2024, 2, 28) for o in result)

    def test_filtro_rango_fechas(self):
        service = _make_service()
        result = service.obtener_ordenes_filtradas(
            fecha_inicio=date(2024, 2, 1), fecha_fin=date(2024, 3, 31)
        )
        assert len(result) == 3

    def test_filtro_arls(self):
        service = _make_service()
        result = service.obtener_ordenes_filtradas(arls=["Sura ARL"])
        assert len(result) == 2
        assert all(o.arl == "Sura ARL" for o in result)

    def test_filtro_tipos_servicio(self):
        service = _make_service()
        result = service.obtener_ordenes_filtradas(tipos_servicio=["Psicología"])
        assert len(result) == 2
        assert all(o.tipo_servicio == "Psicología" for o in result)

    def test_filtros_combinados(self):
        service = _make_service()
        result = service.obtener_ordenes_filtradas(
            fecha_inicio=date(2024, 1, 1),
            fecha_fin=date(2024, 3, 31),
            arls=["Sura ARL", "Positiva ARL"],
            tipos_servicio=["Laboratorio Clínico", "Psicología"],
        )
        # Sura+Lab: orden 1; Positiva+Psico: orden 2
        assert len(result) == 2

    def test_filtro_sin_resultados(self):
        service = _make_service()
        result = service.obtener_ordenes_filtradas(arls=["ARL Inexistente"])
        assert len(result) == 0


# --- Tests: calcular_kpis ---

class TestCalcularKpis:
    def test_kpis_con_datos(self):
        service = _make_service()
        ordenes = service.obtener_ordenes_filtradas()
        kpis = service.calcular_kpis(ordenes)

        assert kpis.total_ordenes == 5
        assert kpis.ingresos_totales == round(1_000_000.0 + 500_000.0 + 750_000.50 + 200_000.0 + 350_000.0, 2)
        assert kpis.arl_activas == 3
        # 3 completadas de 5 = 60%
        assert kpis.tasa_cumplimiento == 60.0

    def test_kpis_lista_vacia(self):
        service = _make_service([])
        kpis = service.calcular_kpis([])

        assert kpis.total_ordenes == 0
        assert kpis.ingresos_totales == 0.0
        assert kpis.arl_activas == 0
        assert kpis.tasa_cumplimiento == 0.0

    def test_kpis_retorna_instancia_kpi(self):
        service = _make_service()
        kpis = service.calcular_kpis(_sample_ordenes())
        assert isinstance(kpis, KPI)


# --- Tests: agrupaciones ---

class TestAgrupaciones:
    def test_agrupar_por_arl(self):
        service = _make_service()
        result = service.agrupar_ordenes_por_arl(_sample_ordenes())

        assert result == {
            "Colmena Seguros": {"completada": 0, "pendiente": 0, "cancelada": 1},
            "Positiva ARL": {"completada": 1, "pendiente": 1, "cancelada": 0},
            "Sura ARL": {"completada": 2, "pendiente": 0, "cancelada": 0},
        }
        # Verificar que está ordenado
        assert list(result.keys()) == sorted(result.keys())

    def test_agrupar_por_mes(self):
        service = _make_service()
        result = service.agrupar_ordenes_por_mes(_sample_ordenes())

        assert result == {
            "2024-01": 1,
            "2024-02": 1,
            "2024-03": 2,
            "2024-04": 1,
        }
        assert list(result.keys()) == sorted(result.keys())

    def test_agrupar_por_servicio(self):
        service = _make_service()
        result = service.agrupar_ordenes_por_servicio(_sample_ordenes())

        assert result == {
            "Laboratorio Clínico": 2,
            "Psicología": 2,
            "Seguridad Industrial": 1,
        }
        assert list(result.keys()) == sorted(result.keys())

    def test_agrupar_ingresos_por_arl(self):
        service = _make_service()
        result = service.agrupar_ingresos_por_arl(_sample_ordenes())

        assert result == {
            "Colmena Seguros": 200_000.0,
            "Positiva ARL": 850_000.0,
            "Sura ARL": 1_750_000.50,
        }
        assert list(result.keys()) == sorted(result.keys())
        # Verificar redondeo a 2 decimales
        for v in result.values():
            assert v == round(v, 2)

    def test_agrupaciones_lista_vacia(self):
        service = _make_service([])
        assert service.agrupar_ordenes_por_arl([]) == {}
        assert service.agrupar_ordenes_por_mes([]) == {}
        assert service.agrupar_ordenes_por_servicio([]) == {}
        assert service.agrupar_ingresos_por_arl([]) == {}


# --- Tests: delegación al repositorio ---

class TestDelegacion:
    def test_obtener_arls(self):
        service = _make_service()
        arls = service.obtener_arls()
        assert arls == ["Colmena Seguros", "Positiva ARL", "Sura ARL"]

    def test_obtener_tipos_servicio(self):
        service = _make_service()
        tipos = service.obtener_tipos_servicio()
        assert tipos == ["Laboratorio Clínico", "Psicología", "Seguridad Industrial"]
