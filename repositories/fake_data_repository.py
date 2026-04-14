import random
from datetime import date, timedelta
from typing import List

from models.orden import Orden
from repositories.base_repository import BaseRepository


class FakeDataRepository(BaseRepository):
    """Genera y almacena datos de ejemplo con semilla fija.

    Implementa BaseRepository con datos generados internamente,
    permitiendo desarrollar y demostrar el Dashboard sin depender
    de fuentes de datos reales.
    """

    ARLS = [
        "Sura ARL", "Colmena Seguros",
        "Bolívar ARL", "Seguros Alfa",
    ]

    SERVICIOS = [
        "Medicina Preventiva y del Trabajo", "Seguridad Industrial",
        "Higiene Industrial", "Laboratorio Clínico",
        "Pruebas Complementarias", "SPA Empresarial",
        "Prueba Psicosensométrica", "Vigilancia Epidemiológica",
        "Psicología",
    ]

    _PESOS_SERVICIO = [0.22, 0.12, 0.08, 0.20, 0.10, 0.04, 0.07, 0.09, 0.08]

    EMPRESAS = [
        "Constructora Bolívar", "Ecopetrol", "Grupo Argos",
        "Cementos Argos", "Bancolombia", "EPM",
        "Nutresa", "ISA", "Avianca", "Alpina",
        "Corona", "Postobón", "Familia", "Colcerámica",
    ]

    ESTADOS = ["completada", "pendiente", "cancelada"]
    _PESOS_ESTADO = [0.65, 0.25, 0.10]

    def __init__(self, seed: int = 42, num_registros: int = 500):
        self._seed = seed
        self._num_registros = num_registros
        self._ordenes: List[Orden] = []
        self._generar_datos()

    def _generar_datos(self) -> None:
        """Genera datos de ejemplo con distribuciones realistas."""
        rng = random.Random(self._seed)
        hoy = date.today()
        fecha_inicio = hoy - timedelta(days=365 * 3)  # 3 años de datos

        for i in range(1, self._num_registros + 1):
            dias_offset = rng.randint(0, 365 * 3)
            fecha = fecha_inicio + timedelta(days=dias_offset)

            estado = rng.choices(
                self.ESTADOS, weights=self._PESOS_ESTADO
            )[0]

            valor = round(rng.uniform(150_000, 5_000_000), 2)

            orden = Orden(
                id=i,
                fecha=fecha,
                arl=rng.choice(self.ARLS),
                empresa=rng.choice(self.EMPRESAS),
                tipo_servicio=rng.choices(self.SERVICIOS, weights=self._PESOS_SERVICIO)[0],
                cantidad_trabajadores=rng.randint(1, 200),
                estado=estado,
                valor_facturado=valor,
            )
            self._ordenes.append(orden)

    def obtener_ordenes(self) -> List[Orden]:
        """Retorna todas las órdenes de servicio."""
        return list(self._ordenes)

    def obtener_arls(self) -> List[str]:
        """Retorna la lista de ARLs distintas, ordenada alfabéticamente."""
        return sorted(set(o.arl for o in self._ordenes))

    def obtener_tipos_servicio(self) -> List[str]:
        """Retorna la lista de tipos de servicio distintos, ordenada alfabéticamente."""
        return sorted(set(o.tipo_servicio for o in self._ordenes))
