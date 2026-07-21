import random
from datetime import date, timedelta
from typing import List, Optional

from models.orden import Orden
from repositories.base_repository import BaseRepository


class FakeDataRepository(BaseRepository):
    """Genera datos de ejemplo basados en el catálogo real de servicios IPS ARL S.A.S.."""

    # Catálogo real - columna E = tipo_servicio real de cada tarea
    CATALOGO = [
        # COLMENA
        {"arl": "Colmena Seguros", "tipo": "Laboratorio", "programa": "SVE Radiaciones Ionizantes", "tarea": "Tamizaje Cuadro hemático (Hemograma)", "valor": 16674},
        {"arl": "Colmena Seguros", "tipo": "Pruebas Complementarias", "programa": "SVE Conservación Visual", "tarea": "Optometría simple", "valor": 19452},
        {"arl": "Colmena Seguros", "tipo": "Pruebas Complementarias", "programa": "SVE Conservación Visual", "tarea": "Visiometrias", "valor": 16674},
        {"arl": "Colmena Seguros", "tipo": "Laboratorio", "programa": "SVE Cardiovascular", "tarea": "Creatinina en sangre", "valor": 16674},
        {"arl": "Colmena Seguros", "tipo": "Laboratorio", "programa": "SVE Cardiovascular", "tarea": "Perfil Lipidico", "valor": 41681},
        {"arl": "Colmena Seguros", "tipo": "Laboratorio", "programa": "SVE Cardiovascular", "tarea": "Glicemia", "valor": 18062},
        {"arl": "Colmena Seguros", "tipo": "Pruebas Complementarias", "programa": "SVE Conservación Auditiva", "tarea": "Audiometria tamiz", "valor": 20840},
        {"arl": "Colmena Seguros", "tipo": "Pruebas Complementarias", "programa": "SVE Conservación Auditiva", "tarea": "Audiometria Clinica", "valor": 23000},
        {"arl": "Colmena Seguros", "tipo": "Pruebas Complementarias", "programa": "SVE Conservación Respiratoria", "tarea": "Espirometria", "valor": 22230},
        {"arl": "Colmena Seguros", "tipo": "Laboratorio", "programa": "SVE Riesgo Quimico", "tarea": "Transaminasas piruvica GPT", "valor": 16674},
        {"arl": "Colmena Seguros", "tipo": "Laboratorio", "programa": "SVE Riesgo Quimico", "tarea": "Transaminasas oxacetica GOT", "valor": 16674},
        {"arl": "Colmena Seguros", "tipo": "Laboratorio", "programa": "SVE Riesgo Quimico", "tarea": "Uroanalisis parcial de orina", "valor": 11115},
        {"arl": "Colmena Seguros", "tipo": "Laboratorio", "programa": "SVE Riesgo Quimico", "tarea": "Colinesterasa serica", "valor": 54184},
        {"arl": "Colmena Seguros", "tipo": "Asesoría", "programa": "Programa Estilo de Vida Saludable", "tarea": "Asesoria en medicina preventiva y del trabajo", "valor": 73636},
        {"arl": "Colmena Seguros", "tipo": "Asesoría", "programa": "SVE Desorden Musculoesquelético", "tarea": "Asesoria en encuestas de morbilidad para DME", "valor": 73636},
        {"arl": "Colmena Seguros", "tipo": "Capacitación", "programa": "Programa Conservación de Voz", "tarea": "Capacitación peligros para la voz", "valor": 73636},
        {"arl": "Colmena Seguros", "tipo": "Asesoría", "programa": "SVE Conservación Auditiva", "tarea": "Asesoría protocolo SVE Conservación Auditiva", "valor": 73636},
        # SURA
        {"arl": "Sura ARL", "tipo": "Pruebas Complementarias", "programa": "142-PVE Prevención Hipoacusia", "tarea": "AUDIOMETRIA TAMIZ O DE SEGUIMIENTO", "valor": 22200},
        {"arl": "Sura ARL", "tipo": "Pruebas Complementarias", "programa": "143-PVE Prevención Efectos Asbesto/Sílice/Carbón", "tarea": "ESPIROMETRIA CURVA FV", "valor": 28700},
        {"arl": "Sura ARL", "tipo": "Pruebas Complementarias", "programa": "143-PVE Prevención Efectos Asbesto/Sílice/Carbón", "tarea": "ESPIROMETRIA CURVA FV CON TURBINA DESECHABLE", "valor": 36800},
        {"arl": "Sura ARL", "tipo": "Pruebas Complementarias", "programa": "143-PVE Prevención Efectos Asbesto/Sílice/Carbón", "tarea": "RAYOS X TORAX CON TECNICA OIT", "valor": 103500},
        {"arl": "Sura ARL", "tipo": "Pruebas Complementarias", "programa": "143-PVE Prevención Efectos Asbesto/Sílice/Carbón", "tarea": "LECTURA RX TORAX", "valor": 80500},
        {"arl": "Sura ARL", "tipo": "Pruebas Complementarias", "programa": "172-PVE Prevención Efectos Radiaciones Ionizantes", "tarea": "EVALUACION OCULAR MEDIOS TRANSPARENTE", "valor": 94700},
        {"arl": "Sura ARL", "tipo": "Pruebas Complementarias", "programa": "158-PVE Prevención Efectos Riesgos Ergonómicos", "tarea": "EVALUACION OSTEOMUSCULAR POR FISIOTERAPEUTA", "valor": 36900},
        {"arl": "Sura ARL", "tipo": "Laboratorio", "programa": "173-PVE Prevención Efectos Riesgo Químico", "tarea": "FROTIS SANGRE PERIFERICA", "valor": 17000},
        {"arl": "Sura ARL", "tipo": "Laboratorio", "programa": "173-PVE Prevención Efectos Riesgo Químico", "tarea": "BILIRRUBINA DIRECTA", "valor": 17000},
        {"arl": "Sura ARL", "tipo": "Laboratorio", "programa": "173-PVE Prevención Efectos Riesgo Químico", "tarea": "FOSFATASA ALCALINA", "valor": 15700},
        {"arl": "Sura ARL", "tipo": "Laboratorio", "programa": "186-Programa Estilos Vida Saludables", "tarea": "CREATININA EN SANGRE", "valor": 15700},
        {"arl": "Sura ARL", "tipo": "Laboratorio", "programa": "186-Programa Estilos Vida Saludables", "tarea": "CITOQUIMICO DE ORINA", "valor": 11800},
        {"arl": "Sura ARL", "tipo": "Laboratorio", "programa": "186-Programa Estilos Vida Saludables", "tarea": "HEMOGRAMA O CUADRO HEMATICO", "valor": 18400},
        {"arl": "Sura ARL", "tipo": "Laboratorio", "programa": "186-Programa Estilos Vida Saludables", "tarea": "ALANINO AMINO TRANSFERASA (ALT)", "valor": 16400},
        {"arl": "Sura ARL", "tipo": "Laboratorio", "programa": "186-Programa Estilos Vida Saludables", "tarea": "ASPARTATO AMINO TRANSFERASA (AST)", "valor": 16400},
        {"arl": "Sura ARL", "tipo": "Laboratorio", "programa": "186-Programa Estilos Vida Saludables", "tarea": "NITROGENO UREICO", "valor": 14700},
        {"arl": "Sura ARL", "tipo": "Laboratorio", "programa": "186-Programa Estilos Vida Saludables", "tarea": "PERFIL LIPIDICO", "valor": 48200},
        {"arl": "Sura ARL", "tipo": "Laboratorio", "programa": "186-Programa Estilos Vida Saludables", "tarea": "GLICEMIA PRE-PRANDIAL", "valor": 13000},
        {"arl": "Sura ARL", "tipo": "Pruebas Complementarias", "programa": "186-Programa Estilos Vida Saludables", "tarea": "ELECTROCARDIOGRAMA", "valor": 37900},
        # BOLIVAR
        {"arl": "Bolívar ARL", "tipo": "Asesoría", "programa": "Programa Prevención Contra Caída", "tarea": "ASESORIA", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "PVE Ergonomía y Vida Cotidiana", "tarea": "SALA DE RELAX", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "PVE Ergonomía y Vida Cotidiana", "tarea": "CAPACITACION EN PAUSAS ACTIVAS", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "PVE Ergonomía y Vida Cotidiana", "tarea": "CAPACITACION EN PREVENCION LESIONES MUSCULOESQUELETICAS", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "PVE Ergonomía y Vida Cotidiana", "tarea": "CAPACITACION EN HIGIENE POSTURAL", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "PVE Ergonomía y Vida Cotidiana", "tarea": "JORNADA DE RUMBATERAPIA", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "PVE Ergonomía y Vida Cotidiana", "tarea": "CAPACITACION EN MANIPULACION MANUAL DE CARGAS", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Pruebas Complementarias", "programa": "SVE Conservación Auditiva-Vibraciones", "tarea": "AUDIOMETRIA", "valor": 18240},
        {"arl": "Bolívar ARL", "tipo": "Pruebas Complementarias", "programa": "Condiciones Salud y Perfil Sociodemográfico", "tarea": "ESPIROMETRIA", "valor": 24000},
        {"arl": "Bolívar ARL", "tipo": "Pruebas Complementarias", "programa": "SVE Conservación Visual", "tarea": "OPTOMETRIA SIMPLE", "valor": 17000},
        {"arl": "Bolívar ARL", "tipo": "Asesoría", "programa": "Fomentos Estilo y Trabajo Saludable", "tarea": "PERFIL LIPIDICO", "valor": 36000},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "Plan Estratégico Seguridad Vial", "tarea": "CAPACITACION INSPECCION PREOPERACIONAL VEHICULOS", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "Plan Estratégico Seguridad Vial", "tarea": "MANEJO DE EMERGENCIAS VIALES", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "Programa Orden y Limpieza", "tarea": "CAPACITACION EN ORDEN Y ASEO", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "SVE Conservación Auditiva", "tarea": "CAPACITACION EN CONSERVACION AUDITIVA", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "SVE Conservación Auditiva", "tarea": "CAPACITACION USO Y MANTENIMIENTO EPP AUDITIVO", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "Inteligencia Emocional", "tarea": "CAPACITACION TRABAJO EN EQUIPO", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "Inteligencia Emocional", "tarea": "CAPACITACION EN HIGIENE DEL SUEÑO", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "Inteligencia Emocional", "tarea": "CAPACITACION INTELIGENCIA EMOCIONAL Y MANEJO ESTRES", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "Inteligencia Emocional", "tarea": "CAPACITACION ASERTIVA Y RESOLUCION DE CONFLICTOS", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "Inteligencia Emocional", "tarea": "CAPACITACION MANEJO RELACIONES INTERPERSONALES", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "Inteligencia Emocional", "tarea": "CAPACITACION MANEJO DEL ESTRÉS LABORAL", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "Inteligencia Emocional", "tarea": "CAPACITACION PREVENCION CONSUMO ALCOHOL Y SPA", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Capacitación", "programa": "Inteligencia Emocional", "tarea": "CAPACITACION PREVENCION RIESGO PSICOSOCIAL", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Asesoría", "programa": "SVE Cardiovascular", "tarea": "ASESORIA", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Asesoría", "programa": "SVE Conservación Auditiva", "tarea": "ASESORIA", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Asesoría", "programa": "SVE Conservación Respiratoria", "tarea": "ASESORIA", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Asesoría", "programa": "SVE Riesgo Quimico", "tarea": "ASESORIA", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Asesoría", "programa": "Programa Estilo de Vida Saludable", "tarea": "ASESORIA", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Asesoría", "programa": "SVE Desorden Musculoesquelético", "tarea": "ASESORIA", "valor": 66535},
        {"arl": "Bolívar ARL", "tipo": "Asesoría", "programa": "Programa Conservación de Voz", "tarea": "ASESORIA", "valor": 66535},
        # ALFA
        {"arl": "Seguros Alfa", "tipo": "Asesoría", "programa": "SVE Cardiovascular", "tarea": "ASESORIA", "valor": 84000},
        {"arl": "Seguros Alfa", "tipo": "Asesoría", "programa": "SVE Conservación Auditiva", "tarea": "ASESORIA", "valor": 84000},
        {"arl": "Seguros Alfa", "tipo": "Asesoría", "programa": "SVE Conservación Respiratoria", "tarea": "ASESORIA", "valor": 84000},
        {"arl": "Seguros Alfa", "tipo": "Asesoría", "programa": "SVE Riesgo Quimico", "tarea": "ASESORIA", "valor": 84000},
        {"arl": "Seguros Alfa", "tipo": "Asesoría", "programa": "Programa Estilo de Vida Saludable", "tarea": "ASESORIA", "valor": 84000},
        {"arl": "Seguros Alfa", "tipo": "Asesoría", "programa": "SVE Desorden Musculoesquelético", "tarea": "ASESORIA", "valor": 84000},
        {"arl": "Seguros Alfa", "tipo": "Asesoría", "programa": "Programa Conservación de Voz", "tarea": "ASESORIA", "valor": 84000},
    ]

    EMPRESAS = [
        "Constructora Bolívar", "Ecopetrol", "Grupo Argos",
        "Cementos Argos", "Bancolombia", "EPM",
        "Nutresa", "ISA", "Avianca", "Alpina",
        "Corona", "Postobón", "Familia", "Colcerámica",
    ]

    RESPONSABLES = [
        "Dra. Paola Martínez", "Dr. Andrés Herrera", "Lic. Sandra Ruiz",
        "Dr. Carlos Pérez", "Lic. Marcela Torres", "Dr. Felipe Gómez",
        "Lic. Johanna Castro", "Dr. Luis Díaz",
    ]

    ESTADOS = [
        "Recibida", "Aceptada", "Rechazada", "Programada / Asignada",
        "En Ejecución", "Ejecutada", "Soportes Radicados",
        "Facturada", "Reemplazada", "Cancelada",
    ]
    _PESOS_ESTADO = [0.05, 0.06, 0.03, 0.08, 0.07, 0.30, 0.12, 0.20, 0.04, 0.05]

    _ARL_NAMES = ["Sura ARL", "Colmena Seguros", "Bolívar ARL", "Seguros Alfa"]
    _PESOS_ARL = [0.38, 0.32, 0.22, 0.08]

    def __init__(self, seed: int = 42, num_registros: int = 500):
        self._seed = seed
        self._num_registros = num_registros
        self._ordenes: List[Orden] = []
        self._catalogo_por_arl = {}
        self._preparar_catalogo()
        self._generar_datos()

    def _preparar_catalogo(self):
        for item in self.CATALOGO:
            arl = item['arl']
            if arl not in self._catalogo_por_arl:
                self._catalogo_por_arl[arl] = []
            self._catalogo_por_arl[arl].append(item)

    def _generar_datos(self) -> None:
        rng = random.Random(self._seed)
        hoy = date.today()
        fecha_inicio = date(2020, 1, 1)
        total_dias = (hoy - fecha_inicio).days

        # Seasonality: some months have more orders (Jan=high, Dec=low, Jul-Aug=low)
        ESTACIONALIDAD = {
            1: 1.25,  # Enero: inicio de año, muchas empresas renuevan contratos
            2: 1.15,  # Febrero: arranque fuerte
            3: 1.10,  # Marzo: ritmo normal-alto
            4: 1.05,  # Abril
            5: 1.00,  # Mayo
            6: 0.90,  # Junio: pre-vacaciones
            7: 0.75,  # Julio: vacaciones, baja actividad
            8: 0.80,  # Agosto: recuperación lenta
            9: 1.05,  # Septiembre: reactivación
            10: 1.15, # Octubre: fuerte
            11: 1.10, # Noviembre: cierre de año
            12: 0.70, # Diciembre: vacaciones, mínimo
        }

        # Growth trend: more orders per year (business growth)
        CRECIMIENTO_ANUAL = {2020: 0.6, 2021: 0.7, 2022: 0.85, 2023: 0.95, 2024: 1.0, 2025: 1.1, 2026: 1.15}

        # Generate dates with seasonality and growth
        fechas = []
        for _ in range(self._num_registros):
            # Pick a random date
            dias_offset = rng.randint(0, total_dias)
            fecha = fecha_inicio + timedelta(days=dias_offset)
            mes = fecha.month
            anio = fecha.year

            # Accept/reject based on seasonality and growth
            prob = ESTACIONALIDAD.get(mes, 1.0) * CRECIMIENTO_ANUAL.get(anio, 1.0)
            if rng.random() < prob / 1.5:  # Normalize
                fechas.append(fecha)
            else:
                # Retry with bias toward recent dates
                dias_offset2 = int(total_dias * (rng.random() ** 0.7))  # Skew toward recent
                fecha2 = fecha_inicio + timedelta(days=total_dias - dias_offset2)
                fechas.append(fecha2)

        # Add some random variation (noise)
        for i in range(self._num_registros - len(fechas)):
            dias_offset = rng.randint(0, total_dias)
            fechas.append(fecha_inicio + timedelta(days=dias_offset))

        fechas.sort()

        for i in range(self._num_registros):
            fecha = fechas[i] if i < len(fechas) else fecha_inicio + timedelta(days=rng.randint(0, total_dias))
            arl = rng.choices(self._ARL_NAMES, weights=self._PESOS_ARL)[0]
            catalogo_arl = self._catalogo_por_arl.get(arl, self.CATALOGO)

            # Trend: more recent orders favor higher-value services
            progreso = (fecha - fecha_inicio).days / max(total_dias, 1)
            if len(catalogo_arl) > 1:
                valores = [s['valor'] for s in catalogo_arl]
                val_min, val_max = min(valores), max(valores)
                if val_max > val_min:
                    pesos_serv = []
                    for s in catalogo_arl:
                        norm = (s['valor'] - val_min) / (val_max - val_min)
                        peso = 1 + norm * progreso * 2
                        pesos_serv.append(peso)
                    servicio = rng.choices(catalogo_arl, weights=pesos_serv)[0]
                else:
                    servicio = rng.choice(catalogo_arl)
            else:
                servicio = catalogo_arl[0]

            estado = rng.choices(self.ESTADOS, weights=self._PESOS_ESTADO)[0]

            # ── Fechas de trazabilidad temporal ──────────────────────────────
            # fecha_ejecucion: solo si el estado indica que el servicio se realizó
            ESTADOS_EJECUTADOS = {
                'Ejecutada', 'Soportes Radicados', 'Facturada',
                'En Ejecución', 'Programada / Asignada',
            }
            fecha_ejecucion: Optional[date] = None
            fecha_facturacion: Optional[date] = None

            if estado in ESTADOS_EJECUTADOS:
                # Entre 1 y 30 días después del registro
                dias_exec = rng.randint(1, 30)
                fe = fecha + timedelta(days=dias_exec)
                if fe <= hoy:
                    fecha_ejecucion = fe

            if estado == 'Facturada' and fecha_ejecucion:
                # Entre 1 y 45 días después de la ejecución (refleja retrasos reales)
                dias_fact = rng.randint(1, 45)
                ff = fecha_ejecucion + timedelta(days=dias_fact)
                if ff <= hoy:
                    fecha_facturacion = ff

            orden = Orden(
                id=i + 1,
                fecha=fecha,
                arl=arl,
                empresa=rng.choice(self.EMPRESAS),
                tipo_servicio=servicio['tipo'],
                programa=servicio['programa'],
                tarea=servicio['tarea'],
                cantidad_trabajadores=rng.randint(1, 200),
                estado=estado,
                valor_facturado=servicio['valor'],
                responsable=rng.choice(self.RESPONSABLES),
                fecha_ejecucion=fecha_ejecucion,
                fecha_facturacion=fecha_facturacion,
            )
            self._ordenes.append(orden)

    def obtener_ordenes(self) -> List[Orden]:
        return list(self._ordenes)

    def obtener_arls(self) -> List[str]:
        return sorted(set(o.arl for o in self._ordenes))

    def obtener_tipos_servicio(self) -> List[str]:
        return sorted(set(o.tipo_servicio for o in self._ordenes))

    def obtener_programas(self) -> List[str]:
        return sorted(set(o.programa for o in self._ordenes))

    def obtener_tareas(self) -> List[str]:
        return sorted(set(o.tarea for o in self._ordenes))
