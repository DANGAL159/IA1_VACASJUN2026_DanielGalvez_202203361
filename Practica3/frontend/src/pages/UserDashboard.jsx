import React, { useState, useEffect } from 'react';
import { extraerFacturas, confirmarFactura, obtenerFacturas, reenviarCorreoReporte, rechazarFactura } from '../api/api';
import Toast from '../components/Toast';
import ExportButton from '../components/ExportButton';
import ResendModal from '../components/ResendModal';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function UserDashboard() {
  const [toast, setToast] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('procesar');
  const [archivos, setArchivos] = useState(null);
  const [facturasPendientes, setFacturasPendientes] = useState([]);
  const [emailDestino, setEmailDestino] = useState('reportes@empresa.com');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [misFacturas, setMisFacturas] = useState([]);
  const [modalData, setModalData] = useState({ isOpen: false, facturaId: null });
  const [isConfirmingGlobal, setIsConfirmingGlobal] = useState(false);

  // Filtros independientes para "Mis Documentos" (Tabla)
  const [filtroProvTabla, setFiltroProvTabla] = useState('todos');
  const [fechaIniTabla, setFechaIniTabla] = useState('');
  const [fechaFinTabla, setFechaFinTabla] = useState('');

  // Filtros independientes para "Mis Metricas"
  const [filtroProvMetricas, setFiltroProvMetricas] = useState('todos');
  const [fechaIniMetricas, setFechaIniMetricas] = useState('');
  const [fechaFinMetricas, setFechaFinMetricas] = useState('');

  useEffect(() => {
    if (vistaActiva === 'historial' || vistaActiva === 'metricas') cargarMisFacturas();
  }, [vistaActiva]);

  const cargarMisFacturas = async () => {
    try {
      setMisFacturas(await obtenerFacturas());
    } catch (e) { setToast({ message: "Error al cargar historial local", type: "error" }); }
  };

  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length > 0) setArchivos(e.dataTransfer.files); };

  const handleExtraerFacturas = async (e) => {
    e.preventDefault();
    if (!archivos) return;
    setIsProcessing(true);
    const formData = new FormData();
    for (let i = 0; i < archivos.length; i++) formData.append("files", archivos[i]);

    try {
      const res = await extraerFacturas(formData);
      setFacturasPendientes(res.datos);
      setToast({ message: res.mensaje, type: "success" });
    } catch (error) { setToast({ message: "Error en el procesamiento OCR", type: "error" }); } 
    finally { setIsProcessing(false); }
  };

  const handleConfirmar = async (index) => {
    if (isConfirmingGlobal) return;
    setIsConfirmingGlobal(true);
    const factura = { ...facturasPendientes[index], email_notificacion: emailDestino };
    try {
      await confirmarFactura(factura);
      setToast({ message: `Factura ${factura.numero_factura} procesada con RPA`, type: "success" });
      setFacturasPendientes(prev => prev.filter((_, idx) => idx !== index));
      if (facturasPendientes.length <= 1) setArchivos(null);
    } catch (error) {
      setToast({ message: error.response?.data?.detail || "Error al confirmar registro", type: "error" });
    } finally { setIsConfirmingGlobal(false); }
  };

  const handleRechazar = async (index) => {
    if (isConfirmingGlobal) return;
    setIsConfirmingGlobal(true);
    const factura = { ...facturasPendientes[index], email_notificacion: emailDestino };
    try {
      await rechazarFactura(factura);
      setToast({ message: `Factura ${factura.numero_factura} rechazada y archivada`, type: "success" });
      setFacturasPendientes(prev => prev.filter((_, idx) => idx !== index));
      if (facturasPendientes.length <= 1) setArchivos(null);
    } catch (error) {
      setToast({ message: "Error al rechazar registro", type: "error" });
    } finally { setIsConfirmingGlobal(false); }
  };

  const handleAprobarTodo = async () => {
    if (isConfirmingGlobal || facturasPendientes.length === 0) return;
    setIsConfirmingGlobal(true);
    setToast({ message: "Iniciando procesamiento secuencial RPA...", type: "info" });

    const loteOriginal = [...facturasPendientes];
    let completadas = 0;
    
    for (let i = 0; i < loteOriginal.length; i++) {
      try {
        const factura = { ...loteOriginal[i], email_notificacion: emailDestino };
        await confirmarFactura(factura);
        completadas++;
      } catch (error) {
        console.error("Fallo en procesamiento por lote");
      }
    }

    setFacturasPendientes([]);
    setArchivos(null);
    setIsConfirmingGlobal(false);
    setToast({ message: `Se procesaron ${completadas} de ${loteOriginal.length} facturas de forma correcta`, type: "success" });
    cargarMisFacturas();
  };

  const actualizarCampo = (index, campo, valor) => {
    setFacturasPendientes(prev => {
      const actualizadas = [...prev];
      if (actualizadas[index]) {
        actualizadas[index][campo] = valor;
      }
      return actualizadas;
    });
  };

  const handleReenviar = async (email) => {
    setModalData({ isOpen: false, facturaId: null });
    try {
      await reenviarCorreoReporte(modalData.facturaId, email);
      setToast({ message: "Reporte reenviado de forma correcta", type: "success" });
    } catch (error) { setToast({ message: "Error al reenviar el correo", type: "error" }); }
  };

  const parsearFechaOCR = (fechaStr) => {
    if (!fechaStr) return null;
    const limpia = fechaStr.replace(/-/g, '/');
    const partes = limpia.split('/');
    if (partes.length === 3) return new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
    return new Date(fechaStr);
  };

  const proveedoresUnicos = [...new Set(misFacturas.map(f => f.proveedor))];

  // Aplicacion de filtros EXCLUSIVA para la Tabla Historial
  const facturasTabla = misFacturas.filter(f => {
    const cumpleProveedor = filtroProvTabla === 'todos' || f.proveedor === filtroProvTabla;
    const fechaDoc = parsearFechaOCR(f.fecha);
    let cumpleInicio = true; let cumpleFin = true;
    if (fechaIniTabla && fechaDoc) cumpleInicio = fechaDoc >= new Date(fechaIniTabla);
    if (fechaFinTabla && fechaDoc) cumpleFin = fechaDoc <= new Date(fechaFinTabla);
    return cumpleProveedor && cumpleInicio && cumpleFin;
  });

  // Aplicacion de filtros EXCLUSIVA para las Metricas (Excluyendo rechazadas)
  const facturasMetricas = misFacturas.filter(f => {
    if (f.estado_procesamiento !== 'Procesado') return false;
    const cumpleProveedor = filtroProvMetricas === 'todos' || f.proveedor === filtroProvMetricas;
    const fechaDoc = parsearFechaOCR(f.fecha);
    let cumpleInicio = true; let cumpleFin = true;
    if (fechaIniMetricas && fechaDoc) cumpleInicio = fechaDoc >= new Date(fechaIniMetricas);
    if (fechaFinMetricas && fechaDoc) cumpleFin = fechaDoc <= new Date(fechaFinMetricas);
    return cumpleProveedor && cumpleInicio && cumpleFin;
  });

  const totalFacturado = facturasMetricas.reduce((sum, f) => sum + f.total, 0);
  const dataPorFecha = Object.values(facturasMetricas.reduce((acc, curr) => {
    acc[curr.fecha] = acc[curr.fecha] || { fecha: curr.fecha, total: 0 };
    acc[curr.fecha].total += curr.total;
    return acc;
  }, {}));

  const dataProveedorLocal = Object.values(facturasMetricas.reduce((acc, curr) => {
    acc[curr.proveedor] = acc[curr.proveedor] || { name: curr.proveedor, value: 0 };
    acc[curr.proveedor].value += curr.total;
    return acc;
  }, {}));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ResendModal isOpen={modalData.isOpen} onClose={() => setModalData({ isOpen: false, facturaId: null })} onSend={handleReenviar} />

      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button className={`tab-btn ${vistaActiva === 'procesar' ? 'active' : ''}`} onClick={() => setVistaActiva('procesar')} disabled={isConfirmingGlobal}>Carga Masiva</button>
        <button className={`tab-btn ${vistaActiva === 'historial' ? 'active' : ''}`} onClick={() => setVistaActiva('historial')} disabled={isConfirmingGlobal}>Mis Documentos</button>
        <button className={`tab-btn ${vistaActiva === 'metricas' ? 'active' : ''}`} onClick={() => setVistaActiva('metricas')} disabled={isConfirmingGlobal}>Mis Metricas</button>
      </div>

      {vistaActiva === 'procesar' && (
        <>
          {facturasPendientes.length === 0 ? (
            <div className="crud-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Arrastrar Lote de Facturas</h3>
              <form onSubmit={handleExtraerFacturas} className="form-group">
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('fileInput').click()}
                  style={{ border: isDragging ? '2px dashed var(--primary)' : '2px dashed var(--text-muted)', padding: '50px 20px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-muted)' }}>
                  <p><b>{archivos ? `${archivos.length} documento(s) seleccionado(s)` : 'Suelte los archivos PDF o Imagenes aqui'}</b></p>
                </div>
                <input id="fileInput" type="file" accept=".png, .jpg, .pdf" multiple onChange={e => setArchivos(e.target.files)} style={{ display: 'none' }} />
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }} disabled={isProcessing || !archivos}>
                  {isProcessing ? 'Ejecutando lectura OCR...' : 'Procesar Lote'}
                </button>
              </form>
            </div>
          ) : (
            <div className="crud-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Validacion Intermedia de Datos</h3>
                <button className="btn btn-primary" onClick={handleAprobarTodo} disabled={isConfirmingGlobal}>
                  {isConfirmingGlobal ? 'Procesando todo...' : 'Aprobar Todo el Lote'}
                </button>
              </div>
              <div style={{ marginBottom: '15px', maxWidth: '300px' }}>
                <label>Enviar copia de reportes a:</label>
                <input type="email" className="form-input" value={emailDestino} onChange={e => setEmailDestino(e.target.value)} disabled={isConfirmingGlobal} />
              </div>
              <div className="table-container">
                <table className="historial-table">
                  <thead><tr><th>Archivo</th><th>Proveedor</th><th>NIT</th><th>No. Factura</th><th>Total (Q)</th><th>Operacion</th></tr></thead>
                  <tbody>
                    {facturasPendientes.map((f, i) => (
                      <tr key={f.archivo_origen + i}>
                        <td>{f.archivo_origen}</td>
                        <td><input className="form-input" value={f.proveedor} onChange={e => actualizarCampo(i, 'proveedor', e.target.value)} disabled={isConfirmingGlobal} /></td>
                        <td><input className="form-input" value={f.nit} onChange={e => actualizarCampo(i, 'nit', e.target.value)} style={{ width: '120px' }} disabled={isConfirmingGlobal} /></td>
                        <td><input className="form-input" value={f.numero_factura} onChange={e => actualizarCampo(i, 'numero_factura', e.target.value)} style={{ width: '120px' }} disabled={isConfirmingGlobal} /></td>
                        <td><input className="form-input" type="number" value={f.total} onChange={e => actualizarCampo(i, 'total', e.target.value)} style={{ width: '90px' }} disabled={isConfirmingGlobal} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => handleConfirmar(i)} disabled={isConfirmingGlobal}>Aprobar</button>
                            <button className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleRechazar(i)} disabled={isConfirmingGlobal}>Rechazar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {vistaActiva === 'historial' && (
        <div className="crud-card">
          <h3>Historial de Facturas Personales</h3>
          <div style={{ display: 'flex', gap: '15px', margin: '15px 0', background: 'var(--bg-muted)', padding: '15px', borderRadius: '8px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label>Proveedor:</label>
              <select className="form-input" value={filtroProvTabla} onChange={e => setFiltroProvTabla(e.target.value)}>
                <option value="todos">-- Todos --</option>
                {proveedoresUnicos.map((p, idx) => <option key={idx} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ width: '180px' }}>
              <label>Fecha Inicio:</label>
              <input type="date" className="form-input" value={fechaIniTabla} onChange={e => setFechaIniTabla(e.target.value)} />
            </div>
            <div style={{ width: '180px' }}>
              <label>Fecha Fin:</label>
              <input type="date" className="form-input" value={fechaFinTabla} onChange={e => setFechaFinTabla(e.target.value)} />
            </div>
          </div>

          <table className="historial-table">
            <thead>
              <tr>
                <th>Factura</th><th>Proveedor</th><th>Fecha</th><th>Monto Total</th><th>Estado</th>
                <th style={{ width: '160px', minWidth: '160px' }}>Reenvio Reporte</th>
                <th>Exportar</th>
              </tr>
            </thead>
            <tbody>
              {facturasTabla.map(f => (
                <tr key={f.id}>
                  <td>{f.numero_factura}</td><td>{f.proveedor}</td><td>{f.fecha}</td>
                  <td>Q {f.total.toFixed(2)}</td>
                  <td>
                    <span style={{ color: f.estado_procesamiento === 'Procesado' ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                      {f.estado_procesamiento}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => setModalData({ isOpen: true, facturaId: f.id })}>
                      Reenviar Correo
                    </button>
                  </td>
                  <td><ExportButton facturaId={f.id} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {vistaActiva === 'metricas' && (
        <div className="crud-card">
          <h3>Estadisticas de Consumo Local</h3>
          <div style={{ display: 'flex', gap: '15px', margin: '15px 0', background: 'var(--bg-muted)', padding: '15px', borderRadius: '8px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label>Proveedor (Solo Metricas):</label>
              <select className="form-input" value={filtroProvMetricas} onChange={e => setFiltroProvMetricas(e.target.value)}>
                <option value="todos">-- Todos --</option>
                {proveedoresUnicos.map((p, idx) => <option key={idx} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ width: '180px' }}>
              <label>Fecha Inicio:</label>
              <input type="date" className="form-input" value={fechaIniMetricas} onChange={e => setFechaIniMetricas(e.target.value)} />
            </div>
            <div style={{ width: '180px' }}>
              <label>Fecha Fin:</label>
              <input type="date" className="form-input" value={fechaFinMetricas} onChange={e => setFechaFinMetricas(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '20px', marginBottom: '30px' }}>
            <div style={{ flex: 1, padding: '20px', background: 'var(--bg-muted)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Volumen de Facturas (Procesadas)</p><h2>{facturasMetricas.length} documentos</h2>
            </div>
            <div style={{ flex: 1, padding: '20px', background: 'var(--bg-muted)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Acumulado Financiero Filtrado</p><h2>Q {totalFacturado.toFixed(2)}</h2>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px', background: 'var(--bg-muted)', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ textAlign: 'center' }}>Evolucion de Facturacion Temporal</h4>
              <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataPorFecha}>
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} />
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.5} />
                    <XAxis dataKey="fecha" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '300px', background: 'var(--bg-muted)', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ textAlign: 'center' }}>Concentracion de Gastos por Proveedor</h4>
              <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dataProveedorLocal} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                      {dataProveedorLocal.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }} formatter={(value) => `Q ${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}