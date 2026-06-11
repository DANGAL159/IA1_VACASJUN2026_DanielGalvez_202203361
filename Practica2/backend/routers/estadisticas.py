from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from config.database import get_db
from models.models import HistorialConsulta

router = APIRouter(prefix="/estadisticas", tags=["Historial y Estadisticas"])

@router.get("/historial")
def obtener_historial(db: Session = Depends(get_db)):
    # Devuelve las últimas 50 consultas ordenadas de la más reciente a la más antigua
    return db.query(HistorialConsulta).order_by(HistorialConsulta.fecha_hora.desc()).limit(50).all()

@router.get("/resumen")
def obtener_resumen(db: Session = Depends(get_db)):
    total_consultas = db.query(HistorialConsulta).count()
    usuarios_unicos = db.query(func.count(func.distinct(HistorialConsulta.usuario_telegram))).scalar() or 0
    return {
        "total_consultas": total_consultas,
        "usuarios_unicos": usuarios_unicos
    }