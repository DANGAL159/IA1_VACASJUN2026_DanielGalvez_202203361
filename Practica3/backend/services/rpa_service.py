from playwright.async_api import async_playwright
import os
import time

async def registrar_factura_rpa(datos_factura: dict) -> str:
    """Simula el registro en un sistema web ERP y guarda la captura con un timestamp unico."""
    
    # Asegurar la existencia del directorio mapeado en el volumen de Docker
    carpeta_evidencias = "/app/evidencias"
    os.makedirs(carpeta_evidencias, exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        html_content = """
        <!DOCTYPE html>
        <html><head><title>SmartInvoice ERP</title>
        <style>body{font-family: Arial; padding: 20px;} input{display:block; margin:10px 0; padding:5px; width:300px;}</style>
        </head><body>
            <h2>Registro Administrativo (Simulado)</h2>
            <form id="erp-form">
                <label>Proveedor:</label><input type="text" id="prov">
                <label>NIT:</label><input type="text" id="nit">
                <label>No. Factura:</label><input type="text" id="fact">
                <label>Total Registrado:</label><input type="text" id="total">
                <div id="status" style="color:green; display:none;">Guardado en Sistema</div>
            </form>
        </body></html>
        """
        await page.set_content(html_content)
        
        # Llenado de los campos extraidos por el OCR
        await page.fill("#prov", datos_factura.get("proveedor", "Desconocido"))
        await page.fill("#nit", datos_factura.get("nit", ""))
        await page.fill("#fact", datos_factura.get("numero_factura", ""))
        await page.fill("#total", f"Q{datos_factura.get('total', 0.0)}")
        
        # Simular exito visual en la interfaz del ERP
        await page.evaluate("document.getElementById('status').style.display = 'block'")
        
        # Nomenclatura tecnica blindada contra duplicados: timestamp-evidencia_rpa_NUMERO.png
        timestamp = int(time.time())
        numero_factura_limpio = datos_factura.get("numero_factura", "SIN_NUMERO").replace(" ", "_")
        nombre_archivo = f"{timestamp}-evidencia_rpa_{numero_factura_limpio}.png"
        ruta_completa = os.path.join(carpeta_evidencias, nombre_archivo)
        
        # Tomar evidencia automatizada
        await page.screenshot(path=ruta_completa)
        await browser.close()
        
        # Retorna la ruta relativa correcta que FastAPI publicara de forma estatica
        return f"evidencias/{nombre_archivo}"