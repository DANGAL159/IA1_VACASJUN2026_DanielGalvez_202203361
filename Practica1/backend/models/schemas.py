from pydantic import BaseModel

class CiudadNueva(BaseModel):
    nombre: str

class ConexionNueva(BaseModel):
    origen: str
    destino: str
    distancia: int

class ActualizarDistancia(BaseModel):
    distancia: int