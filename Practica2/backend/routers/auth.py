import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from config.database import get_db
from models.models import UsuarioAdmin

router = APIRouter(prefix="/auth", tags=["Autenticacion"])

class LoginRequest(BaseModel):
    username: str
    password: str

def verificar_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

@router.post("/login")
def login(credenciales: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(UsuarioAdmin).filter(UsuarioAdmin.username == credenciales.username).first()
    
    # Verificamos usando la nueva función
    if not usuario or not verificar_password(credenciales.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {"mensaje": "Login exitoso", "username": usuario.username, "token": "fake-jwt-token-ia1"}