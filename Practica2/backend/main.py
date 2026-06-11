import time
import bcrypt
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import engine, Base, SessionLocal
from models.models import UsuarioAdmin

# Importar todos los enrutadores, servicios y el script de inicializacion
from routers import auth, categorias, preguntas, configuracion, estadisticas
from services.bot_service import iniciar_polling_bot
from seed_data import inicializar_datos  # <-- IMPORTACION DEL SCRIPT

app = FastAPI(title="SmartBot API", description="API REST para la administracion del bot de FAQ")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def hashear_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

@app.on_event("startup")
def startup_event():
    # 1. Reintento de conexion
    max_retries = 5
    for i in range(max_retries):
        try:
            Base.metadata.create_all(bind=engine)
            break
        except Exception as e:
            print(f"Esperando a que PostgreSQL inicie (intento {i+1}/{max_retries})...")
            time.sleep(3)
    
    # 2. Crear usuario si no existe (Usando bcrypt nativo)
    db = SessionLocal()
    try:
        usuario_existe = db.query(UsuarioAdmin).filter(UsuarioAdmin.username == "IA1-User").first()
        if not usuario_existe:
            password_encriptada = hashear_password("IA1-password@_new")
            nuevo_admin = UsuarioAdmin(username="IA1-User", password_hash=password_encriptada)
            db.add(nuevo_admin)
            db.commit()
            print("Usuario administrador por defecto creado exitosamente.")
    finally:
        db.close()
        
    # 3. EJECUTAR EL SEED DE DATOS AUTOMATICAMENTE
    inicializar_datos()
        
    # 4. Iniciar el bot de Telegram
    iniciar_polling_bot()

# Registrar los endpoints
app.include_router(auth.router)
app.include_router(categorias.router)
app.include_router(preguntas.router)
app.include_router(configuracion.router)
app.include_router(estadisticas.router)