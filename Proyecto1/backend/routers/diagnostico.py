from fastapi import APIRouter, HTTPException
from models.schemas import SolicitudDiagnostico
from services.prolog_service import ejecutar_consulta
from services.telegram_service import enviar_mensaje_telegram
from config.database import guardar_base_conocimiento
from services.config_service import leer_configuracion
from datetime import datetime

router = APIRouter(prefix="/sistema-experto", tags=["Diagnostico"])

def to_str(val):
    if isinstance(val, bytes):
        return val.decode('utf-8')
    return str(val)

@router.post("/diagnosticar")
def realizar_diagnostico(solicitud: SolicitudDiagnostico):
    if not solicitud.sintomas_usuario:
        raise HTTPException(status_code=400, detail="Debe proporcionar al menos un sintoma.")

    sintomas_prolog = "[" + ", ".join(f"'{s}'" for s in solicitud.sintomas_usuario) + "]"
    consulta = f"diagnosticar({sintomas_prolog}, ID, Falla, Recomendacion)"
    resultados = ejecutar_consulta(consulta)
    
    usuario_req = solicitud.telegram_user if solicitud.telegram_user else "Anonimo"
    fecha_actual = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Leer la configuración dinámica
    config = leer_configuracion()

    if not resultados:
        # 1. Enviar mensaje a Telegram (con HTML de la plantilla)
        plantilla = config["MENSAJE_FALLO"]
        mensaje_final = plantilla.replace("{sintomas}", ", ".join(solicitud.sintomas_usuario))
        enviar_mensaje_telegram(mensaje_final, solicitud.telegram_user)
        
        # 2. Guardar en Prolog (con texto plano para evitar errores de sintaxis)
        mensaje_fallo_plano = "No se pudo determinar una falla exacta. Se requiere revision manual."
        ejecutar_consulta(f"assertz(historial('{fecha_actual}', {sintomas_prolog}, 'Desconocida', '{mensaje_fallo_plano}', '{usuario_req}'))")
        guardar_base_conocimiento()
        
        return {"falla_id": None, "falla": "Desconocida", "recomendacion": mensaje_fallo_plano}

    diagnostico = resultados[0]
    falla_nombre = to_str(diagnostico['Falla'])
    recomendacion_texto = to_str(diagnostico['Recomendacion'])
    
    # 1. Enviar mensaje a Telegram (con HTML de la plantilla)
    plantilla = config["MENSAJE_EXITO"]
    mensaje_final = plantilla.replace("{falla}", falla_nombre).replace("{recomendacion}", recomendacion_texto).replace("{sintomas}", ", ".join(solicitud.sintomas_usuario))
    enviar_mensaje_telegram(mensaje_final, solicitud.telegram_user)
    
    # 2. Guardar en Prolog (con texto plano)
    ejecutar_consulta(f"assertz(historial('{fecha_actual}', {sintomas_prolog}, '{falla_nombre}', '{recomendacion_texto}', '{usuario_req}'))")
    guardar_base_conocimiento()
    
    return {
        "falla_id": diagnostico['ID'],
        "falla": falla_nombre,
        "recomendacion": recomendacion_texto
    }

@router.get("/historial")
def obtener_historial():
    registros_raw = ejecutar_consulta("historial(Fecha, Sintomas, Falla, Recomendacion, Usuario)")
    historial = []
    
    for reg in reversed(registros_raw):
        sintomas_lista = [to_str(x) for x in reg['Sintomas']]
        historial.append({
            "fecha": to_str(reg['Fecha']),
            "sintomas": sintomas_lista,
            "falla": to_str(reg['Falla']),
            "recomendacion": to_str(reg['Recomendacion']),
            "usuario": to_str(reg['Usuario'])
        })
    return {"historial": historial}