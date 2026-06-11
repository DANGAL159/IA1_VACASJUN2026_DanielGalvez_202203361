from fastapi import APIRouter, HTTPException
from models.schemas import Sintoma, Falla, Recomendacion, ReglaFalla
from services.prolog_service import ejecutar_consulta
from config.database import guardar_base_conocimiento

router = APIRouter(prefix="/conocimiento", tags=["CRUD Base de Conocimiento"])

@router.get("/")
def obtener_todo_el_conocimiento():
    sintomas = [{"nombre": str(s['S'])} for s in ejecutar_consulta("sintoma(S)")]
    fallas = [{"id": f['ID'], "nombre": str(f['Nombre'])} for f in ejecutar_consulta("falla(ID, Nombre)")]
    recomendaciones = [{"id": r['ID'], "texto": str(r['Texto'])} for r in ejecutar_consulta("recomendacion(ID, Texto)")]
    
    reglas_raw = ejecutar_consulta("regla_falla(ID, Sintomas)")
    reglas = []
    for rg in reglas_raw:
        lista_str = [str(x) for x in rg['Sintomas']]
        reglas.append({"id_falla": rg['ID'], "sintomas": lista_str})
        
    return {"sintomas": sintomas, "fallas": fallas, "recomendaciones": recomendaciones, "reglas": reglas}

@router.post("/guardar")
def guardar_cambios():
    if guardar_base_conocimiento():
        return {"mensaje": "Base de conocimiento guardada en disco."}
    raise HTTPException(status_code=500, detail="Error al guardar.")

# ==========================================
# CRUD SÍNTOMAS
# ==========================================
@router.post("/sintoma")
def agregar_sintoma(sintoma: Sintoma):
    ejecutar_consulta(f"agregar_sintoma('{sintoma.nombre}')")
    return {"mensaje": "Síntoma agregado."}

@router.put("/sintoma/{nombre_viejo}")
def actualizar_sintoma(nombre_viejo: str, sintoma: Sintoma):
    viejo_limpio = nombre_viejo.strip()
    nuevo_limpio = sintoma.nombre.strip()
    
    ejecutar_consulta(f"retractall(sintoma('{viejo_limpio}'))")
    ejecutar_consulta(f"assertz(sintoma('{nuevo_limpio}'))")
    
    reglas = ejecutar_consulta("regla_falla(ID, Sintomas)")
    for rg in reglas:
        lista_sintomas = [str(x) for x in rg['Sintomas']]
        if viejo_limpio in lista_sintomas:
            lista_sintomas = [nuevo_limpio if s == viejo_limpio else s for s in lista_sintomas]
            lista_prolog = "[" + ", ".join(f"'{x}'" for x in lista_sintomas) + "]"
            ejecutar_consulta(f"retractall(regla_falla({rg['ID']}, _))")
            ejecutar_consulta(f"assertz(regla_falla({rg['ID']}, {lista_prolog}))")
            
    return {"mensaje": "Síntoma actualizado en toda la base."}

@router.delete("/sintoma/{nombre}")
def eliminar_sintoma(nombre: str):
    ejecutar_consulta(f"eliminar_sintoma('{nombre.strip()}')")
    return {"mensaje": "Síntoma eliminado."}

# ==========================================
# CRUD FALLAS
# ==========================================
@router.post("/falla")
def agregar_falla(falla: Falla):
    ejecutar_consulta(f"agregar_falla({falla.id}, '{falla.nombre.strip()}')")
    return {"mensaje": "Falla agregada."}

@router.put("/falla/{id_falla}")
def actualizar_falla(id_falla: int, falla: Falla):
    ejecutar_consulta(f"retractall(falla({id_falla}, _))")
    ejecutar_consulta(f"assertz(falla({id_falla}, '{falla.nombre.strip()}'))")
    return {"mensaje": "Nombre de la falla actualizado."}

@router.delete("/falla/{id_falla}")
def eliminar_falla(id_falla: int):
    ejecutar_consulta(f"eliminar_falla({id_falla})")
    return {"mensaje": "Falla eliminada."}

# ==========================================
# CRUD RECOMENDACIONES
# ==========================================
@router.post("/recomendacion")
def agregar_recomendacion(rec: Recomendacion):
    ejecutar_consulta(f"agregar_recomendacion({rec.id_falla}, '{rec.texto.strip()}')")
    return {"mensaje": "Recomendación guardada."}

@router.delete("/recomendacion/{id_falla}")
def eliminar_recomendacion(id_falla: int):
    ejecutar_consulta(f"eliminar_recomendacion({id_falla})")
    return {"mensaje": "Recomendación eliminada."}

# ==========================================
# CRUD REGLAS
# ==========================================
@router.post("/regla")
def agregar_regla(regla: ReglaFalla):
    lista_prolog = "[" + ", ".join(f"'{s}'" for s in regla.sintomas) + "]"
    ejecutar_consulta(f"agregar_regla_falla({regla.id_falla}, {lista_prolog})")
    return {"mensaje": "Regla vinculada correctamente."}

@router.delete("/regla/{id_falla}")
def eliminar_regla(id_falla: int):
    ejecutar_consulta(f"eliminar_regla_falla({id_falla})")
    return {"mensaje": "Regla eliminada."}