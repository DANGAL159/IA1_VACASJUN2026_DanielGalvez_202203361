import os

ENV_FILE = ".env"

DEFAULT_CONFIG = {
    "TELEGRAM_BOT_TOKEN": "",
    "TELEGRAM_CHAT_ID": "",
    "TELEGRAM_GROUP_ID": "",
    "BOT_ACTIVO": "true",
    "MENSAJE_EXITO": "<b>Nuevo Diagnóstico: Doctor Byte</b>\n<b>Falla Detectada:</b> {falla}\n<b>Recomendación:</b> {recomendacion}\n<b>Síntomas:</b> {sintomas}",
    "MENSAJE_FALLO": "<b>Diagnóstico Fallido</b>\nNo se pudo determinar una falla exacta.\n<b>Síntomas:</b> {sintomas}"
}

def leer_configuracion():
    config = DEFAULT_CONFIG.copy()
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                if "=" in line:
                    k, v = line.strip().split("=", 1)
                    if k in config:
                        # Reemplazamos los saltos de línea literales por saltos reales
                        config[k] = v.replace("\\n", "\n")
    return config

def guardar_configuracion(nueva_config):
    config = leer_configuracion()
    config.update(nueva_config)
    with open(ENV_FILE, "w", encoding="utf-8") as f:
        for k, v in config.items():
            # Escapamos los saltos de línea para que se guarden en una sola línea en el .env
            v_safe = str(v).replace("\n", "\\n")
            f.write(f"{k}={v_safe}\n")