import cv2
import numpy as np
import pytesseract
import re
import io
from pdf2image import convert_from_bytes

def procesar_archivo(contenido_bytes: bytes, filename: str) -> str:
    """Convierte el archivo a imagen (si es PDF) y extrae el texto bruto."""
    texto_total = ""
    
    if filename.lower().endswith('.pdf'):
        # Convertir PDF a lista de imágenes (una por página)
        imagenes = convert_from_bytes(contenido_bytes)
        for img in imagenes:
            # Convertir imagen PIL a OpenCV BGR
            open_cv_image = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            texto_total += procesar_imagen_cv2(open_cv_image) + "\n"
    else:
        # Es una imagen normal (JPG/PNG)
        np_arr = np.frombuffer(contenido_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        texto_total = procesar_imagen_cv2(img)
        
    return texto_total

def procesar_imagen_cv2(img) -> str:
    """Aplica preprocesamiento de OpenCV y extrae texto con Tesseract."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    return pytesseract.image_to_string(thresh, lang='spa')

def extraer_datos_factura(contenido_bytes: bytes, filename: str) -> dict:
    """Orquesta la extracción e intenta mapear los datos mediante RegEx."""
    texto_extraido = procesar_archivo(contenido_bytes, filename)

    # Procesamiento de Texto mediante Expresiones Regulares (RegEx)
    nit_match = re.search(r'NIT[\s:\-\.]*([0-9A-Z\-]+)', texto_extraido, re.IGNORECASE)
    factura_match = re.search(r'(?:FACTURA|FAC|NO\.|NRO\.?|NUM\.?)[\s:\-\.]*([\w\-]+)', texto_extraido, re.IGNORECASE)
    fecha_match = re.search(r'FECHA[\s:]*([\d]{2}/[\d]{2}/[\d]{4}|[\d]{2}-[\d]{2}-[\d]{4})', texto_extraido, re.IGNORECASE)
    
    # Extraer el Subtotal de forma normal
    subtotal_match = re.search(r'SUBTOTAL[\s:Q]*([\d,]+\.\d{2})', texto_extraido, re.IGNORECASE)
    
    # Extraer el Total asegurando que la linea NO contenga la palabra "SUB" para evitar falsos positivos
    total_match = re.search(r'^(?!.*SUB).*TOTAL[\s:Q]*([\d,]+\.\d{2})', texto_extraido, re.IGNORECASE | re.MULTILINE)
    
    # Búsqueda explícita de impuestos según los términos del negocio
    impuestos_match = re.search(r'(?:IMPUESTOS|IMPUESTO|IVA(?: 12%)?)[\s:Q]*([\d,]+\.\d{2})', texto_extraido, re.IGNORECASE)

    proveedor_match = re.search(r"Proveedor:\s*['\"]?([^'\n\r\"]+)", texto_extraido, re.IGNORECASE)
    if proveedor_match:
        proveedor_nombre = proveedor_match.group(1).strip()
    else:
        lineas = [l.strip() for l in texto_extraido.split('\n') if len(l.strip()) > 3]
        proveedor_nombre = lineas[0] if lineas else "Proveedor Desconocido"

    nit = nit_match.group(1) if nit_match else ""
    factura_no = factura_match.group(1) if factura_match else ""
    fecha = fecha_match.group(1) if fecha_match else ""

    try:
        total = float(total_match.group(1).replace(',', '')) if total_match else 0.0
        subtotal = float(subtotal_match.group(1).replace(',', '')) if subtotal_match else 0.0
        # Extracción directa sin cálculos automáticos
        impuestos = float(impuestos_match.group(1).replace(',', '')) if impuestos_match else 0.0
    except Exception:
        total, subtotal, impuestos = 0.0, 0.0, 0.0

    return {
        "proveedor": proveedor_nombre,
        "nit": nit,
        "numero_factura": factura_no,
        "fecha": fecha,
        "subtotal": subtotal,
        "impuestos": impuestos,
        "total": total,
        "archivo_origen": filename
    }
