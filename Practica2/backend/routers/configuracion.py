from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from config.database import get_db
from models.models import ConfiguracionBot

router = APIRouter(prefix="/configuracion", tags=["Configuracion Bot"])

class ConfigUpdate(BaseModel):
    telegram_bot_token: str
    telegram_group_id: str
    bot_activo: bool

@router.get("/")
def obtener_config(db: Session = Depends(get_db)):
    config = db.query(ConfiguracionBot).first()
    if not config:
        # Si no existe, devolvemos valores vacíos por defecto
        return {"telegram_bot_token": "", "telegram_group_id": "", "bot_activo": False}
    return config

@router.put("/")
def actualizar_config(datos: ConfigUpdate, db: Session = Depends(get_db)):
    config = db.query(ConfiguracionBot).first()
    if not config:
        config = ConfiguracionBot(**datos.dict())
        db.add(config)
    else:
        config.telegram_bot_token = datos.telegram_bot_token
        config.telegram_group_id = datos.telegram_group_id
        config.bot_activo = datos.bot_activo
    
    db.commit()
    return {"mensaje": "Configuracion actualizada correctamente"}