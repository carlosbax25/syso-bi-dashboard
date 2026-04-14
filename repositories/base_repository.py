from abc import ABC, abstractmethod
from typing import List
from models.orden import Orden


class BaseRepository(ABC):
    """Interfaz abstracta para la capa de datos.
    Permite intercambiar la fuente de datos sin modificar la lógica de negocio."""

    @abstractmethod
    def obtener_ordenes(self) -> List[Orden]:
        """Retorna todas las órdenes de servicio."""
        pass

    @abstractmethod
    def obtener_arls(self) -> List[str]:
        """Retorna la lista de ARLs distintas."""
        pass

    @abstractmethod
    def obtener_tipos_servicio(self) -> List[str]:
        """Retorna la lista de tipos de servicio distintos."""
        pass
