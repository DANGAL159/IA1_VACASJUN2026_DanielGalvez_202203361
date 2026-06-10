from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from config.database import Base # <- Corregido aquí
import datetime

class UsuarioAdmin(Base):
    __tablename__ = "usuarios_admin"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    preguntas = relationship("PreguntaFAQ", back_populates="categoria")

class PreguntaFAQ(Base):
    __tablename__ = "preguntas_faq"
    id = Column(Integer, primary_key=True, index=True)
    pregunta = Column(Text, nullable=False)
    respuesta = Column(Text, nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    categoria = relationship("Categoria", back_populates="preguntas")

class HistorialConsulta(Base):
    __tablename__ = "historial_consultas"
    id = Column(Integer, primary_key=True, index=True)
    fecha_hora = Column(DateTime, default=datetime.datetime.utcnow)
    usuario_telegram = Column(String(100))
    consulta_realizada = Column(Text, nullable=False)
    respuesta_proporcionada = Column(Text, nullable=False)

class ConfiguracionBot(Base):
    __tablename__ = "configuracion_bot"
    id = Column(Integer, primary_key=True, index=True)
    telegram_bot_token = Column(String(255), nullable=False)
    telegram_group_id = Column(String(100))
    bot_activo = Column(Boolean, default=True)