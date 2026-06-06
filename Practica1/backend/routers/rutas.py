from fastapi import APIRouter, HTTPException
from services.prolog_service import ejecutar_consulta

router = APIRouter(prefix="/rutas", tags=["Rutas"])

@router.get("/optima")
def obtener_ruta_corta(origen: str, destino: str):
    consulta = f"ruta_mas_corta('{origen.lower()}', '{destino.lower()}', Ruta, Distancia)"
    resultados = ejecutar_consulta(consulta)
    if not resultados:
        raise HTTPException(status_code=404, detail="No existe ruta disponible.")
    
    return {
        "ruta": [str(c) for c in resultados[0]["Ruta"]],
        "distancia_total": resultados[0]["Distancia"]
    }

@router.get("/todas")
def obtener_todas_las_rutas(origen: str, destino: str):
    consulta = f"ruta('{origen.lower()}', '{destino.lower()}', Ruta, Distancia)"
    resultados = ejecutar_consulta(consulta)
    if not resultados:
        raise HTTPException(status_code=404, detail="No existen rutas.")
    
    rutas_encontradas = [
        {"ruta": [str(c) for c in res["Ruta"]], "distancia_total": res["Distancia"]} 
        for res in resultados
    ]
    rutas_encontradas.sort(key=lambda x: x["distancia_total"])
    return {"rutas": rutas_encontradas}