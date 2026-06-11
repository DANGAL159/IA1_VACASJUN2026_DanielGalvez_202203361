from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from config.database import get_db
from models.models import Categoria, PreguntaFAQ

router = APIRouter(prefix="/categorias", tags=["Categorias"])

class CategoriaBase(BaseModel):
    nombre: str

@router.get("/")
def obtener_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).all()

@router.post("/")
def crear_categoria(categoria: CategoriaBase, db: Session = Depends(get_db)):
    existe = db.query(Categoria).filter(Categoria.nombre == categoria.nombre).first()
    if existe:
        raise HTTPException(status_code=400, detail="La categoria ya existe")
    
    nueva_categoria = Categoria(nombre=categoria.nombre)
    db.add(nueva_categoria)
    db.commit()
    db.refresh(nueva_categoria)
    return nueva_categoria

@router.delete("/{categoria_id}")
def eliminar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
        
    preguntas_asociadas = db.query(PreguntaFAQ).filter(PreguntaFAQ.categoria_id == categoria_id).count()
    if preguntas_asociadas > 0:
        raise HTTPException(status_code=400, detail="No se puede eliminar una categoria con preguntas asociadas")
        
    db.delete(categoria)
    db.commit()
    return {"mensaje": "Categoria eliminada"}

@router.put("/{categoria_id}")
def actualizar_categoria(categoria_id: int, datos: CategoriaBase, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
    
    existe = db.query(Categoria).filter(Categoria.nombre == datos.nombre, Categoria.id != categoria_id).first()
    if existe:
        raise HTTPException(status_code=400, detail="Ya existe otra categoria con este nombre")
        
    categoria.nombre = datos.nombre
    db.commit()
    return {"mensaje": "Categoria actualizada"}