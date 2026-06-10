from pydantic import BaseModel
from typing import List, Optional

class Sintoma(BaseModel):
    nombre: str

class Falla(BaseModel):
    id: int
    nombre: str

class Recomendacion(BaseModel):
    id_falla: int
    texto: str

class ReglaFalla(BaseModel):
    id_falla: int
    sintomas: List[str]

class SolicitudDiagnostico(BaseModel):
    sintomas_usuario: List[str]
    telegram_user: Optional[str] = None 