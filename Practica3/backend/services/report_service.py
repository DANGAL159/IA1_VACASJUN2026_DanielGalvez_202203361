import csv
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import os

def generar_y_enviar_reporte(datos_factura: dict, email_destino: str):
    """Genera CSV y lo envia por correo usando configuracion SMTP dinamica."""
    
    # Generacion del CSV administrativo
    archivo_csv = f"reporte_factura_{datos_factura['numero_factura']}.csv"
    with open(archivo_csv, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["Proveedor", "NIT", "Factura", "Fecha", "Subtotal", "Impuestos", "Total"])
        writer.writerow([
            datos_factura['proveedor'], datos_factura['nit'], datos_factura['numero_factura'],
            datos_factura['fecha'], datos_factura['subtotal'], datos_factura['impuestos'], datos_factura['total']
        ])
    
    # Envio de Correo
    host = os.getenv("SMTP_HOST", "smtp-relay.brevo.com")
    port = int(os.getenv("SMTP_PORT", "587"))
    login_user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")
    correo_remitente = os.getenv("SENDER_EMAIL", login_user)
    
    if not correo_remitente or not password:
        print("Alerta: Correo SMTP no configurado en .env. Se genero el CSV pero se omitio el envio.")
        return archivo_csv
        
    try:
        msg = MIMEMultipart()
        msg['From'] = correo_remitente
        msg['To'] = email_destino
        msg['Subject'] = f"SmartInvoice - Reporte Procesado: {datos_factura['numero_factura']}"
        
        cuerpo = "Buen dia,\n\nAdjunto encontrara el reporte CSV procesado automaticamente por SmartInvoice RPA.\n\nSaludos."
        msg.attach(MIMEText(cuerpo, 'plain'))
        
        with open(archivo_csv, "rb") as attachment:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment.read())
        encoders.encode_base64(part)
        part.add_header('Content-Disposition', f"attachment; filename= {archivo_csv}")
        msg.attach(part)
        
        # Conexion SMTP usando variables de entorno
        server = smtplib.SMTP(host, port)
        server.starttls()
        server.login(login_user, password)
        server.send_message(msg)
        server.quit()
        print("Correo enviado exitosamente.")
    except Exception as e:
        print(f"Error al enviar correo: {e}")
        
    return archivo_csv