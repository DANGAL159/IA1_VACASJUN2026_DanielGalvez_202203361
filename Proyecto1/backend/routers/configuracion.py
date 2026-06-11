from fastapi import APIRouter
from pydantic import BaseModel
from services.config_service import leer_configuracion, guardar_configuracion

router = APIRouter(prefix="/configuracion", tags=["Configuración Sistema"])

class ConfigObj(BaseModel):
    TELEGRAM_BOT_TOKEN: str
    TELEGRAM_CHAT_ID: str
    TELEGRAM_GROUP_ID: str
    BOT_ACTIVO: str
    MENSAJE_EXITO: str
    MENSAJE_FALLO: str

@router.get("/")
def obtener_config():
    return leer_configuracion()

@router.put("/")
def actualizar_config(config: ConfigObj):
    guardar_configuracion(config.dict())
    return {"mensaje": "Configuración del Bot actualizada exitosamente."}