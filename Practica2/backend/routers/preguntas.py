from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from config.database import get_db
from models.models import PreguntaFAQ, Categoria

router = APIRouter(prefix="/preguntas", tags=["Preguntas y Respuestas FAQ"])

class PreguntaBase(BaseModel):
    pregunta: str
    respuesta: str
    categoria_id: int

@router.get("/")
def obtener_preguntas(db: Session = Depends(get_db)):
    preguntas = db.query(PreguntaFAQ).all()
    # Mapear para devolver tambien el nombre de la categoria en el JSON
    resultado = []
    for p in preguntas:
        resultado.append({
            "id": p.id,
            "pregunta": p.pregunta,
            "respuesta": p.respuesta,
            "categoria_id": p.categoria_id,
            "categoria_nombre": p.categoria.nombre if p.categoria else "Sin Categoria"
        })
    return resultado

@router.post("/")
def crear_pregunta(pregunta: PreguntaBase, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id == pregunta.categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="La categoria asignada no existe")
        
    nueva_pregunta = PreguntaFAQ(
        pregunta=pregunta.pregunta,
        respuesta=pregunta.respuesta,
        categoria_id=pregunta.categoria_id
    )
    db.add(nueva_pregunta)
    db.commit()
    return {"mensaje": "Pregunta guardada exitosamente"}

@router.put("/{pregunta_id}")
def actualizar_pregunta(pregunta_id: int, datos: PreguntaBase, db: Session = Depends(get_db)):
    pregunta = db.query(PreguntaFAQ).filter(PreguntaFAQ.id == pregunta_id).first()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
        
    pregunta.pregunta = datos.pregunta
    pregunta.respuesta = datos.respuesta
    pregunta.categoria_id = datos.categoria_id
    db.commit()
    return {"mensaje": "Pregunta actualizada"}

@router.delete("/{pregunta_id}")
def eliminar_pregunta(pregunta_id: int, db: Session = Depends(get_db)):
    pregunta = db.query(PreguntaFAQ).filter(PreguntaFAQ.id == pregunta_id).first()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
        
    db.delete(pregunta)
    db.commit()
    return {"mensaje": "Pregunta eliminada"}