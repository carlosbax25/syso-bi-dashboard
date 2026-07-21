from datetime import date
from models.orden import Orden, KPI


class TestOrden:
    def test_orden_creation(self):
        orden = Orden(
            id=1,
            fecha=date(2024, 6, 15),
            arl="Sura ARL",
            empresa="Ecopetrol",
            tipo_servicio="Laboratorio",
            programa="Programa Estilos Vida Saludables",
            tarea="Hemograma",
            cantidad_trabajadores=50,
            estado="Ejecutada",
            valor_facturado=18400,
        )
        assert orden.id == 1
        assert orden.fecha == date(2024, 6, 15)
        assert orden.arl == "Sura ARL"
        assert orden.empresa == "Ecopetrol"
        assert orden.tipo_servicio == "Laboratorio"
        assert orden.programa == "Programa Estilos Vida Saludables"
        assert orden.tarea == "Hemograma"
        assert orden.cantidad_trabajadores == 50
        assert orden.estado == "Ejecutada"
        assert orden.valor_facturado == 18400

    def test_orden_to_dict(self):
        orden = Orden(
            id=1,
            fecha=date(2024, 6, 15),
            arl="Sura ARL",
            empresa="Ecopetrol",
            tipo_servicio="Laboratorio",
            programa="Programa Estilos Vida Saludables",
            tarea="Hemograma",
            cantidad_trabajadores=50,
            estado="Ejecutada",
            valor_facturado=18400,
        )
        d = orden.to_dict()
        assert isinstance(d, dict)
        assert d["id"] == 1
        assert d["fecha"] == "2024-06-15"
        assert d["arl"] == "Sura ARL"
        assert d["programa"] == "Programa Estilos Vida Saludables"
        assert d["tarea"] == "Hemograma"
        assert d["valor_facturado"] == 18400

    def test_orden_to_dict_fecha_iso_format(self):
        orden = Orden(
            id=2,
            fecha=date(2023, 1, 1),
            arl="Colmena Seguros",
            empresa="Alpina",
            tipo_servicio="Pruebas Complementarias",
            programa="SVE Cardiovascular",
            tarea="Perfil Lipidico",
            cantidad_trabajadores=10,
            estado="Recibida",
            valor_facturado=41681,
        )
        d = orden.to_dict()
        assert d["fecha"] == "2023-01-01"


class TestKPI:
    def test_kpi_creation(self):
        kpi = KPI(
            total_ordenes=100,
            ingresos_totales=5000000.0,
            arl_activas=5,
            tasa_cumplimiento=65.0,
        )
        assert kpi.total_ordenes == 100
        assert kpi.ingresos_totales == 5000000.0
        assert kpi.arl_activas == 5
        assert kpi.tasa_cumplimiento == 65.0

    def test_kpi_to_dict(self):
        kpi = KPI(
            total_ordenes=100,
            ingresos_totales=5000000.0,
            arl_activas=5,
            tasa_cumplimiento=65.0,
        )
        d = kpi.to_dict()
        assert isinstance(d, dict)
        assert d["total_ordenes"] == 100
        assert d["ingresos_totales"] == 5000000.0
        assert d["arl_activas"] == 5
        assert d["tasa_cumplimiento"] == 65.0
