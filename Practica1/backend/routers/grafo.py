from fastapi import APIRouter, HTTPException
from models.schemas import CiudadNueva, ConexionNueva, ActualizarDistancia
from services.prolog_service import ejecutar_consulta, ejecutar_operacion_crud, obtener_todas_las_ciudades, obtener_todas_las_conexiones
from config.database import guardar_base_conocimiento

router = APIRouter(prefix="/grafo", tags=["Grafo CRUD"])

@router.get("/")
def obtener_grafo():
    ciudades = obtener_todas_las_ciudades()
    conexiones = obtener_todas_las_conexiones()
    return {"ciudades": ciudades, "conexiones": conexiones}

@router.post("/ciudad")
def agregar_ciudad(ciudad: CiudadNueva):
    nombre = ciudad.nombre.lower().strip()
    if ejecutar_consulta(f"ciudad('{nombre}')"):
        raise HTTPException(status_code=400, detail="La ciudad ya existe.")
    
    ejecutar_operacion_crud(f"agregar_ciudad('{nombre}')")
    return {"mensaje": "Ciudad agregada."}

@router.delete("/ciudad/{nombre}")
def eliminar_ciudad(nombre: str):
    nombre_limpio = nombre.lower().strip()
    
    # Validar que la ciudad exista antes de intentar eliminar
    if not ejecutar_consulta(f"ciudad('{nombre_limpio}')"):
        raise HTTPException(status_code=404, detail="La ciudad no existe en la base de conocimiento.")
        
    ejecutar_operacion_crud(f"eliminar_ciudad('{nombre_limpio}')")
    return {"mensaje": "Ciudad y sus conexiones eliminadas."}

@router.post("/conexion")
def agregar_conexion(conexion: ConexionNueva):
    o, d = conexion.origen.lower().strip(), conexion.destino.lower().strip()
    
    if conexion.distancia <= 0:
        raise HTTPException(status_code=400, detail="La distancia debe ser mayor a 0.")
        
    if o == d:
        raise HTTPException(status_code=400, detail="No puedes conectar una ciudad consigo misma.")
    
    if not ejecutar_consulta(f"ciudad('{o}')") or not ejecutar_consulta(f"ciudad('{d}')"):
        raise HTTPException(status_code=404, detail="Ambas ciudades deben existir antes de conectarlas.")
        
    if ejecutar_consulta(f"conectado('{o}', '{d}', _)"):
        raise HTTPException(status_code=400, detail="La conexión ya existe.")
    
    ejecutar_operacion_crud(f"assertz(conexion('{o}', '{d}', {conexion.distancia}))")
    return {"mensaje": "Conexión agregada."}

@router.put("/conexion/{origen}/{destino}")
def actualizar_distancia(origen: str, destino: str, payload: ActualizarDistancia):
    o, d = origen.lower().strip(), destino.lower().strip()
    
    if payload.distancia <= 0:
        raise HTTPException(status_code=400, detail="La distancia debe ser mayor a 0.")
        
    if o == d:
        raise HTTPException(status_code=400, detail="El origen y destino no pueden ser la misma ciudad.")
        
    if not ejecutar_consulta(f"ciudad('{o}')") or not ejecutar_consulta(f"ciudad('{d}')"):
        raise HTTPException(status_code=404, detail="Una o ambas ciudades no existen.")
        
    if not ejecutar_consulta(f"conectado('{o}', '{d}', _)"):
        raise HTTPException(status_code=404, detail="No existe una conexión previa entre estas ciudades.")

    ejecutar_operacion_crud(f"actualizar_distancia('{o}', '{d}', {payload.distancia})")
    return {"mensaje": "Distancia actualizada."}

@router.delete("/conexion/{origen}/{destino}")
def eliminar_conexion(origen: str, destino: str):
    o, d = origen.lower().strip(), destino.lower().strip()
    
    if not ejecutar_consulta(f"conectado('{o}', '{d}', _)"):
        raise HTTPException(status_code=404, detail="No existe la conexión que intentas eliminar.")
        
    ejecutar_operacion_crud(f"eliminar_conexion('{o}', '{d}')")
    return {"mensaje": "Conexión eliminada."}

@router.post("/guardar")
def guardar_cambios():
    if guardar_base_conocimiento():
        return {"mensaje": "Modificaciones guardadas en el disco."}
    raise HTTPException(status_code=500, detail="Error al guardar la base de conocimiento.")