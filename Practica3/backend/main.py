import time
import bcrypt
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import engine, Base, SessionLocal
from models.models import Usuario, Proveedor, Factura, Bitacora
from routers import facturas, auth
from fastapi.staticfiles import StaticFiles
import os

# Asegurar la ruta absoluta de almacenamiento dentro del contenedor Docker
carpeta_evidencias = "/app/evidencias"
os.makedirs(carpeta_evidencias, exist_ok=True)

app = FastAPI(title="SmartInvoice API", description="API para procesamiento OCR y RPA de facturas")

app.mount("/evidencias", StaticFiles(directory=carpeta_evidencias), name="evidencias")

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
    max_retries = 5
    for i in range(max_retries):
        try:
            Base.metadata.create_all(bind=engine)
            print("Tablas de SmartInvoice creadas exitosamente.")
            break
        except Exception as e:
            print(f"Esperando a que PostgreSQL inicie (intento {i+1}/{max_retries})...")
            time.sleep(3)
            
    # Crear usuario administrador si no existe
    db = SessionLocal()
    try:
        # Dentro de startup_event() en main.py, actualizar la creación del usuario:
        usuario_existe = db.query(Usuario).filter(Usuario.username == "IA1-User").first()
        if not usuario_existe:
            password_encriptada = hashear_password("IA1-password@_new")
            nuevo_admin = Usuario(username="IA1-User", password_hash=password_encriptada, rol="admin")
            db.add(nuevo_admin)
            db.commit()
            print("Usuario administrador configurado de manera correcta.")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"mensaje": "API de SmartInvoice operativa y esperando facturas"}

# REGISTRAR ROUTERS
app.include_router(auth.router)
app.include_router(facturas.router)