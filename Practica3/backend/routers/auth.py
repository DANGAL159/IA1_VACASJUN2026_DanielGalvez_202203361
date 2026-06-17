from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session
from config.database import get_db
from models.models import Usuario
from jose import JWTError, jwt
from datetime import datetime, timedelta
import bcrypt
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback_inseguro_por_defecto")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 120))

router = APIRouter(prefix="/auth", tags=["Autenticación"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# --- MODELOS DE PETICIÓN (PYDANTIC) ---

class AuthRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    rol: str = "usuario"

class UsuarioUpdate(BaseModel):
    username: str
    rol: str

# --- FUNCIONES AUXILIARES ---

def hashear_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verificar_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def crear_token_acceso(data: dict):
    copy_data = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    copy_data.update({"exp": expire})
    return jwt.encode(copy_data, SECRET_KEY, algorithm=ALGORITHM)

def obtener_usuario_actual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales de acceso.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    usuario = db.query(Usuario).filter(Usuario.username == username).first()
    if usuario is None:
        raise credentials_exception
    return usuario

# --- ENDPOINTS DE AUTENTICACIÓN ---

@router.post("/register")
def registrar_usuario(datos: RegisterRequest, db: Session = Depends(get_db)):
    existe = db.query(Usuario).filter(Usuario.username == datos.username).first()
    if existe:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está registrado.")
    
    nuevo_usuario = Usuario(
        username=datos.username,
        password_hash=hashear_password(datos.password),
        rol=datos.rol if datos.rol in ["admin", "usuario"] else "usuario"
    )
    db.add(nuevo_usuario)
    db.commit()
    return {"mensaje": "Usuario registrado exitosamente."}

@router.post("/login")
def login(credenciales: AuthRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == credenciales.username).first()
    if not usuario or not verificar_password(credenciales.password, usuario.password_hash):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos.")
    
    token = crear_token_acceso(data={"sub": usuario.username, "rol": usuario.rol})
    return {
        "access_token": token,
        "token_type": "bearer",
        "rol": usuario.rol,
        "username": usuario.username
    }

# --- ENDPOINTS DE GESTIÓN DE USUARIOS (ADMIN) ---

@router.put("/usuarios/{id}")
def actualizar_usuario(id: int, datos: UsuarioUpdate, db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    if usuario_actual.rol != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado.")
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    
    usuario.username = datos.username
    usuario.rol = datos.rol
    db.commit()
    return {"mensaje": "Usuario actualizado correctamente."}

@router.delete("/usuarios/{id}")
def eliminar_usuario(id: int, db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    if usuario_actual.rol != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado.")
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    
    if usuario.facturas or usuario.bitacoras:
        raise HTTPException(status_code=400, detail="No se puede eliminar un cliente que tiene facturas o registros en bitácora.")
    
    db.delete(usuario)
    db.commit()
    return {"mensaje": "Usuario eliminado exitosamente."}