from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from config.database import get_db
from models.models import Proveedor, Factura, Bitacora, Usuario
from routers.auth import obtener_usuario_actual
from services.ocr_service import extraer_datos_factura
from services.rpa_service import registrar_factura_rpa
from services.report_service import generar_y_enviar_reporte

from fastapi.responses import StreamingResponse
import io
import csv
from reportlab.pdfgen import canvas
from openpyxl import Workbook

router = APIRouter(prefix="/facturas", tags=["Facturas"])

@router.post("/extraer")
async def extraer_facturas(files: List[UploadFile] = File(...), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    resultados = []
    for file in files:
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.pdf')):
            continue
        try:
            contenido = await file.read()
            datos_extraidos = extraer_datos_factura(contenido, file.filename)
            resultados.append(datos_extraidos)
        except Exception as e:
            resultados.append({"archivo_origen": file.filename, "error": str(e)})
    return {"mensaje": f"Se analizaron {len(resultados)} archivos.", "datos": resultados}

class FacturaConfirmada(BaseModel):
    proveedor: str
    nit: str
    numero_factura: str
    fecha: str
    subtotal: float
    impuestos: float
    total: float
    archivo_origen: str
    email_notificacion: str

@router.post("/confirmar")
async def confirmar_factura(datos: FacturaConfirmada, db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    try:
        factura_existe = db.query(Factura).filter(Factura.numero_factura == datos.numero_factura).first()
        if factura_existe:
            raise HTTPException(status_code=400, detail=f"La factura {datos.numero_factura} ya fue procesada.")

        proveedor = db.query(Proveedor).filter(Proveedor.nit == datos.nit).first()
        if not proveedor:
            proveedor = Proveedor(nombre=datos.proveedor, nit=datos.nit)
            db.add(proveedor)
            db.commit()
            db.refresh(proveedor)
            
        datos_dict = datos.dict()
        
        # Se ejecuta el script de Playwright y se captura la ruta del volumen
        ruta_evidencia = await registrar_factura_rpa(datos_dict)
        
        nueva_factura = Factura(
            numero_factura=datos.numero_factura,
            fecha=datos.fecha,
            proveedor_id=proveedor.id,
            usuario_id=usuario_actual.id,
            nit_extraido=datos.nit,
            subtotal=datos.subtotal,
            impuestos=datos.impuestos,
            total=datos.total,
            estado_procesamiento="Procesado",
            archivo_url=ruta_evidencia  # Correccion: Se asigna la ruta de Playwright, no el PDF
        )
        db.add(nueva_factura)
        db.commit()
        
        generar_y_enviar_reporte(datos_dict, datos.email_notificacion)
        
        db.add(Bitacora(usuario_id=usuario_actual.id, documento=datos.archivo_origen, estado="Exito", resultado=f"RPA completado. Evidencia en: {ruta_evidencia}"))
        db.commit()
        
        return {"mensaje": "Factura automatizada y almacenada de forma correcta."}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        db.add(Bitacora(usuario_id=usuario_actual.id, documento=datos.archivo_origen, estado="Error", resultado=str(e)))
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def obtener_facturas(cliente_id: Optional[int] = None, db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    query = db.query(Factura)
    if usuario_actual.rol != "admin":
        query = query.filter(Factura.usuario_id == usuario_actual.id)
    else:
        if cliente_id:
            query = query.filter(Factura.usuario_id == cliente_id)
            
    facturas = query.all()
    return [{
        "id": f.id, "numero_factura": f.numero_factura, "fecha": f.fecha,
        "proveedor": f.proveedor.nombre if f.proveedor else "Desconocido",
        "total": f.total, "estado_procesamiento": f.estado_procesamiento,
        "archivo": f.archivo_url, "usuario_propietario": f.usuario.username if f.usuario else "Sistema"
    } for f in facturas]

@router.post("/{id}/reenviar-correo")
def reenviar_correo_reporte(id: int, email: str = Form(...), db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    factura = db.query(Factura).filter(Factura.id == id).first()
    if not factura:
        raise HTTPException(status_code=404, detail="Factura no encontrada.")
        
    if usuario_actual.rol != "admin" and factura.usuario_id != usuario_actual.id:
        raise HTTPException(status_code=403, detail="Permisos insuficientes para reenviar este reporte.")
        
    datos_dict = {
        "proveedor": factura.proveedor.nombre if factura.proveedor else "Desconocido",
        "nit": factura.nit_extraido,
        "numero_factura": factura.numero_factura,
        "fecha": factura.fecha,
        "subtotal": factura.subtotal,
        "impuestos": factura.impuestos,
        "total": factura.total
    }
    generar_y_enviar_reporte(datos_dict, email)
    return {"mensaje": f"Reporte reenviado exitosamente a {email}"}

@router.get("/clientes")
def obtener_lista_clientes(db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    if usuario_actual.rol != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado.")
    return db.query(Usuario).filter(Usuario.rol == "usuario").all()

@router.get("/bitacora")
def obtener_bitacora(db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    if usuario_actual.rol != "admin":
        return db.query(Bitacora).filter(Bitacora.usuario_id == usuario_actual.id).order_by(Bitacora.fecha_hora.desc()).all()
    return db.query(Bitacora).order_by(Bitacora.fecha_hora.desc()).all()

# --- CRUD PROVEEDORES (Se añade inyección de seguridad) ---
class ProveedorCreate(BaseModel):
    nombre: str
    nit: str

@router.get("/proveedores")
def obtener_proveedores(db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    return db.query(Proveedor).all()

@router.post("/proveedores")
def crear_proveedor(datos: ProveedorCreate, db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    existe = db.query(Proveedor).filter(Proveedor.nit == datos.nit).first()
    if existe: raise HTTPException(status_code=400, detail="El NIT ya está registrado.")
    nuevo = Proveedor(nombre=datos.nombre, nit=datos.nit)
    db.add(nuevo)
    db.commit()
    return {"mensaje": "Proveedor creado."}

@router.put("/proveedores/{id}")
def actualizar_proveedor(id: int, datos: ProveedorCreate, db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    prov = db.query(Proveedor).filter(Proveedor.id == id).first()
    if not prov: raise HTTPException(status_code=404, detail="Proveedor no encontrado.")
    prov.nombre = datos.nombre
    prov.nit = datos.nit
    db.commit()
    return {"mensaje": "Proveedor actualizado."}

@router.delete("/proveedores/{id}")
def eliminar_proveedor(id: int, db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    prov = db.query(Proveedor).filter(Proveedor.id == id).first()
    if not prov: raise HTTPException(status_code=404, detail="Proveedor no encontrado.")
    if prov.facturas: raise HTTPException(status_code=400, detail="No se puede eliminar con facturas asociadas.")
    db.delete(prov)
    db.commit()
    return {"mensaje": "Proveedor eliminado."}

@router.post("/confirmar")
async def confirmar_factura(datos: FacturaConfirmada, db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    try:
        # Verificar duplicados antes de procesar para evitar doble insercion en base de datos
        factura_existe = db.query(Factura).filter(Factura.numero_factura == datos.numero_factura).first()
        if factura_existe:
            raise HTTPException(status_code=400, detail=f"La factura {datos.numero_factura} ya fue procesada previamente.")

        proveedor = db.query(Proveedor).filter(Proveedor.nit == datos.nit).first()
        if not proveedor:
            proveedor = Proveedor(nombre=datos.proveedor, nit=datos.nit)
            db.add(proveedor)
            db.commit()
            db.refresh(proveedor)
            
        # Ejecutar RPA y obtener la ruta del volumen
        datos_dict = datos.dict()
        ruta_evidencia = await registrar_factura_rpa(datos_dict)
        
        nueva_factura = Factura(
            numero_factura=datos.numero_factura,
            fecha=datos.fecha,
            proveedor_id=proveedor.id,
            usuario_id=usuario_actual.id,
            nit_extraido=datos.nit,
            subtotal=datos.subtotal,
            impuestos=datos.impuestos,
            total=datos.total,
            estado_procesamiento="Procesado",
            archivo_url=ruta_evidencia # Guardamos el path de la captura de Playwright
        )
        db.add(nueva_factura)
        db.commit()
        
        generar_y_enviar_reporte(datos_dict, datos.email_notificacion)
        
        db.add(Bitacora(usuario_id=usuario_actual.id, documento=datos.archivo_origen, estado="Exito", resultado=f"RPA completado de forma correcta. Evidencia guardada en: {ruta_evidencia}"))
        db.commit()
        return {"mensaje": "Factura automatizada y almacenada de forma correcta."}
    except HTTPException as he:
        raise he
    except Exception as e:
        db.add(Bitacora(usuario_id=usuario_actual.id, documento=datos.archivo_origen, estado="Error", resultado=str(e)))
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/{id}/exportar")
def exportar_factura_multiformato(id: int, formato: str, db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    factura = db.query(Factura).filter(Factura.id == id).first()
    if not factura:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
        
    if usuario_actual.rol != "admin" and factura.usuario_id != usuario_actual.id:
        raise HTTPException(status_code=403, detail="Sin permisos para exportar este reporte")

    proveedor_nombre = factura.proveedor.nombre if factura.proveedor else "Desconocido"

    if formato == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["No. Factura", "Fecha", "Proveedor", "NIT", "Subtotal", "Impuestos", "Total"])
        writer.writerow([
            factura.numero_factura, factura.fecha, proveedor_nombre, 
            factura.nit_extraido, factura.subtotal, factura.impuestos, factura.total
        ])
        return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=reporte_{id}.csv"})
        
    elif formato == "pdf":
        output = io.BytesIO()
        c = canvas.Canvas(output)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, 800, f"Reporte Administrativo SmartInvoice")
        
        c.setFont("Helvetica", 12)
        c.drawString(50, 760, f"No. Factura: {factura.numero_factura}")
        c.drawString(50, 740, f"Fecha de Emisión: {factura.fecha}")
        c.drawString(50, 720, f"Proveedor: {proveedor_nombre}")
        c.drawString(50, 700, f"NIT Registrado: {factura.nit_extraido}")
        
        c.line(50, 680, 550, 680)
        
        c.drawString(50, 650, f"Subtotal: Q {factura.subtotal}")
        c.drawString(50, 630, f"Impuestos (IVA): Q {factura.impuestos}")
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, 610, f"Monto Total: Q {factura.total}")
        
        c.save()
        output.seek(0)
        return StreamingResponse(output, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=reporte_{id}.pdf"})
        
    elif formato == "xlsx":
        wb = Workbook()
        ws = wb.active
        ws.append(["No. Factura", "Fecha", "Proveedor", "NIT", "Subtotal", "Impuestos", "Total"])
        ws.append([
            factura.numero_factura, factura.fecha, proveedor_nombre, 
            factura.nit_extraido, factura.subtotal, factura.impuestos, factura.total
        ])
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": f"attachment; filename=reporte_{id}.xlsx"})

    raise HTTPException(status_code=400, detail="Formato no soportado")

@router.post("/rechazar")
async def rechazar_factura(datos: FacturaConfirmada, db: Session = Depends(get_db), usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    try:
        proveedor = db.query(Proveedor).filter(Proveedor.nit == datos.nit).first()
        if not proveedor:
            proveedor = Proveedor(nombre=datos.proveedor, nit=datos.nit)
            db.add(proveedor)
            db.commit()
            db.refresh(proveedor)
            
        factura_rechazada = Factura(
            numero_factura=datos.numero_factura,
            fecha=datos.fecha,
            proveedor_id=proveedor.id,
            usuario_id=usuario_actual.id,
            nit_extraido=datos.nit,
            subtotal=datos.subtotal,
            impuestos=datos.impuestos,
            total=datos.total,
            estado_procesamiento="Rechazado",
            archivo_url="Sin Evidencia RPA"
        )
        db.add(factura_rechazada)
        db.add(Bitacora(usuario_id=usuario_actual.id, documento=datos.archivo_origen, estado="Rechazado", resultado=f"La factura {datos.numero_factura} fue rechazada manualmente."))
        db.commit()
        return {"mensaje": "Factura marcada como Rechazada."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))