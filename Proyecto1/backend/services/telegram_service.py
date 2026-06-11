import requests
from services.config_service import leer_configuracion

directorio_usuarios = {}

def sincronizar_mensajes(token):
    if not token: return
    url = f"https://api.telegram.org/bot{token}/getUpdates"
    try:
        respuesta = requests.get(url).json()
        if respuesta.get("ok"):
            for update in respuesta["result"]:
                if "message" in update:
                    chat_id = str(update["message"]["chat"]["id"])
                    if chat_id.startswith("-"): continue
                    username = update["message"]["from"].get("username")
                    if not username: username = update["message"]["from"].get("first_name", "desconocido")
                    directorio_usuarios[username.lower()] = chat_id
    except Exception as e:
        print(f"Error sincronizando Telegram: {e}")

def enviar_mensaje_telegram(mensaje: str, username_destino: str = None):
    config = leer_configuracion()

    # 1. VERIFICAR SI EL BOT ESTÁ ACTIVO
    if config["BOT_ACTIVO"] != "true":
        print("El envío por Telegram está desactivado en la configuración.")
        return False

    token = config["TELEGRAM_BOT_TOKEN"]
    if not token: return False

    chat_id_personal = config["TELEGRAM_CHAT_ID"]

    if username_destino:
        username_limpio = username_destino.replace("@", "").lower().strip()
        sincronizar_mensajes(token)
        if username_limpio in directorio_usuarios:
            chat_id_personal = directorio_usuarios[username_limpio]

    def enviar_post(destino_id):
        if not destino_id: return
        requests.post(f"https://api.telegram.org/bot{token}/sendMessage", json={"chat_id": destino_id, "text": mensaje, "parse_mode": "HTML"})

    try:
        enviar_post(chat_id_personal)
        if config["TELEGRAM_GROUP_ID"]:
            enviar_post(config["TELEGRAM_GROUP_ID"])
        return True
    except:
        return False