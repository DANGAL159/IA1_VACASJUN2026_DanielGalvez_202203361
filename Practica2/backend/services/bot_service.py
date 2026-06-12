import time
import requests
import threading
from config.database import SessionLocal
from models.models import ConfiguracionBot, PreguntaFAQ, HistorialConsulta, Categoria

def iniciar_polling_bot():
    """Ejecuta el bot en un hilo en segundo plano."""
    hilo = threading.Thread(target=bucle_bot, daemon=True)
    hilo.start()

def enviar_mensaje(token, chat_id, texto, reply_markup=None):
    """Funcion auxiliar para enviar mensajes a Telegram"""
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    
    # CAMBIO CLAVE 1: Pasamos de Markdown a HTML para evitar cuelgues por guiones bajos "_"
    payload = {"chat_id": str(chat_id).strip(), "text": texto, "parse_mode": "HTML"}
    
    if reply_markup:
        payload["reply_markup"] = reply_markup
        
    res = requests.post(url, json=payload)
    
    # CAMBIO CLAVE 2: Si Telegram rechaza el mensaje, lo imprimimos en la consola de Docker
    if not res.ok:
        print(f"Error Telegram API al enviar a {chat_id}: {res.text}")

def notificar_grupo(token, group_id, username, pregunta, respuesta):
    """Reenvia una copia al grupo de auditoria"""
    if group_id and str(group_id).strip() != "":
        # Plantilla convertida a HTML
        texto_auditoria = f"🔔 <b>Auditoría SmartBot</b>\n👤 <b>Usuario:</b> @{username}\n💬 <b>Consulta:</b> {pregunta}\n🤖 <b>Respuesta:</b> {respuesta}"
        enviar_mensaje(token, group_id, texto_auditoria)

def bucle_bot():
    ultimo_update_id = 0
    
    while True:
        try:
            db = SessionLocal()
            config = db.query(ConfiguracionBot).first()
            
            if not config or not config.bot_activo or not config.telegram_bot_token:
                db.close()
                time.sleep(5)
                continue
                
            token = config.telegram_bot_token.strip()
            group_id = config.telegram_group_id
            url = f"https://api.telegram.org/bot{token}/getUpdates?offset={ultimo_update_id + 1}&timeout=10"
            respuesta = requests.get(url).json()
            
            if respuesta.get("ok"):
                for update in respuesta["result"]:
                    ultimo_update_id = update["update_id"]
                    
                    if "message" in update and "text" in update["message"]:
                        chat_id = update["message"]["chat"]["id"]
                        texto_usuario = update["message"]["text"]
                        texto_limpio = texto_usuario.strip().lower()
                        username = update["message"]["from"].get("username", "Anonimo")
                        
                        if texto_limpio == "/start":
                            respuesta_bot = "¡Hola! Soy SmartBot 🤖. Estoy aquí para resolver tus dudas frecuentes. Escribe /ayuda para ver las instrucciones."
                            enviar_mensaje(token, chat_id, respuesta_bot)
                            notificar_grupo(token, group_id, username, "/start", "Mensaje de bienvenida")
                        
                        elif texto_limpio == "/ayuda":
                            respuesta_bot = (
                                "📖 <b>Instrucciones de uso:</b>\n\n"
                                "Escribe tu pregunta o palabras clave (ej. 'requisitos' o 'notas').\n\n"
                                "Comandos:\n"
                                "🔹 /start - Iniciar el bot\n"
                                "🔹 /ayuda - Ver instrucciones\n"
                                "🔹 /preguntas - Explorar el menú de preguntas"
                            )
                            enviar_mensaje(token, chat_id, respuesta_bot)
                            notificar_grupo(token, group_id, username, "/ayuda", "Envió instrucciones")
                        
                        elif texto_limpio == "/preguntas":
                            categorias = db.query(Categoria).all()
                            if categorias:
                                keyboard = [[{"text": c.nombre, "callback_data": f"cat_{c.id}"}] for c in categorias]
                                reply_markup = {"inline_keyboard": keyboard}
                                enviar_mensaje(token, chat_id, "📚 <b>Selecciona una categoría de información:</b>", reply_markup)
                            else:
                                enviar_mensaje(token, chat_id, "Actualmente no tengo categorías registradas.")
                            notificar_grupo(token, group_id, username, "/preguntas", "Desplegó menú de categorías")
                        
                        else:
                            faq = db.query(PreguntaFAQ).filter(PreguntaFAQ.pregunta.ilike(f"%{texto_usuario}%")).first()
                            respuesta_bot = faq.respuesta if faq else "Lo siento, no tengo una respuesta registrada para esa consulta. Usa /preguntas para ver los temas disponibles."
                            enviar_mensaje(token, chat_id, respuesta_bot)
                            
                            db.add(HistorialConsulta(usuario_telegram=username, consulta_realizada=texto_usuario, respuesta_proporcionada=respuesta_bot))
                            db.commit()
                            notificar_grupo(token, group_id, username, texto_usuario, respuesta_bot)

                    elif "callback_query" in update:
                        callback = update["callback_query"]
                        chat_id = callback["message"]["chat"]["id"]
                        data = callback["data"]
                        username = callback["from"].get("username", "Anonimo")
                        
                        requests.post(f"https://api.telegram.org/bot{token}/answerCallbackQuery", json={"callback_query_id": callback["id"]})
                        
                        if data.startswith("cat_"):
                            cat_id = int(data.split("_")[1])
                            categoria = db.query(Categoria).filter(Categoria.id == cat_id).first()
                            preguntas = db.query(PreguntaFAQ).filter(PreguntaFAQ.categoria_id == cat_id).all()
                            
                            if preguntas:
                                keyboard = [[{"text": p.pregunta, "callback_data": f"faq_{p.id}"}] for p in preguntas]
                                reply_markup = {"inline_keyboard": keyboard}
                                enviar_mensaje(token, chat_id, f"📝 <b>Preguntas en {categoria.nombre}:</b>", reply_markup)
                            else:
                                enviar_mensaje(token, chat_id, "No hay preguntas en esta categoría.")
                                
                            notificar_grupo(token, group_id, username, f"Clic en categoría: {categoria.nombre}", "Desplegó preguntas de la categoría")
                        
                        elif data.startswith("faq_"):
                            faq_id = int(data.split("_")[1])
                            faq = db.query(PreguntaFAQ).filter(PreguntaFAQ.id == faq_id).first()
                            
                            if faq:
                                respuesta_bot = f"<b>{faq.pregunta}</b>\n\n{faq.respuesta}"
                                enviar_mensaje(token, chat_id, respuesta_bot)
                                
                                db.add(HistorialConsulta(usuario_telegram=username, consulta_realizada=faq.pregunta, respuesta_proporcionada=faq.respuesta))
                                db.commit()
                                notificar_grupo(token, group_id, username, faq.pregunta, faq.respuesta)

            db.close()
            time.sleep(1)
            
        except Exception as e:
            print(f"Error en el bot de Telegram: {e}")
            time.sleep(5)