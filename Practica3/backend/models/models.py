from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from config.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(20), default="usuario", nullable=False) # admin o usuario
    
    facturas = relationship("Factura", back_populates="usuario")
    bitacoras = relationship("Bitacora", back_populates="usuario")

class Proveedor(Base):
    __tablename__ = "proveedores"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    nit = Column(String(20), unique=True, nullable=False)
    
    facturas = relationship("Factura", back_populates="proveedor")

class Factura(Base):
    __tablename__ = "facturas"
    id = Column(Integer, primary_key=True, index=True)
    numero_factura = Column(String(50), nullable=False)
    fecha = Column(String(50), nullable=False)
    proveedor_id = Column(Integer, ForeignKey("proveedores.id"), nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    nit_extraido = Column(String(20), nullable=True)
    subtotal = Column(Float, nullable=False, default=0.0)
    impuestos = Column(Float, nullable=False, default=0.0)
    total = Column(Float, nullable=False, default=0.0)
    estado_procesamiento = Column(String(20), default="Pendiente")
    archivo_url = Column(String(255), nullable=True)
    
    proveedor = relationship("Proveedor", back_populates="facturas")
    usuario = relationship("Usuario", back_populates="facturas")

class Bitacora(Base):
    __tablename__ = "bitacoras"
    id = Column(Integer, primary_key=True, index=True)
    fecha_hora = Column(DateTime(timezone=True), server_default=func.now())
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    documento = Column(String(255), nullable=False)
    estado = Column(String(50), nullable=False)
    resultado = Column(Text, nullable=False)
    
    usuario = relationship("Usuario", back_populates="bitacoras")