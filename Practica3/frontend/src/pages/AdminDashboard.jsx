import React, { useState, useEffect } from 'react';
import { 
  obtenerFacturas, obtenerProveedores, obtenerBitacora, obtenerListaClientes, 
  reenviarCorreoReporte, crearProveedor, actualizarProveedor, eliminarProveedor,
  actualizarCliente, eliminarCliente, registrarUsuario 
} from '../api/api';
import Toast from '../components/Toast';
import ExportButton from '../components/ExportButton';
import ResendModal from '../components/ResendModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminDashboard() {
  const [toast, setToast] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('facturas');
  const [facturas, setFacturas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [bitacora, setBitacora] = useState([]);
  const [modalData, setModalData] = useState({ isOpen: false, facturaId: null });

  const [formProv, setFormProv] = useState({ id: null, nombre: '', nit: '' });
  const [formCliente, setFormCliente] = useState({ id: null, username: '', rol: 'usuario', password: '' });

  // Filtros Auditoria (Tabla)
  const [filtroClienteTabla, setFiltroClienteTabla] = useState('todos');
  const [filtroProvTabla, setFiltroProvTabla] = useState('todos');
  const [fechaIniTabla, setFechaIniTabla] = useState('');
  const [fechaFinTabla, setFechaFinTabla] = useState('');

  // Filtros Metricas (Graficas)
  const [filtroClienteMetricas, setFiltroClienteMetricas] = useState('todos');
  const [filtroProvMetricas, setFiltroProvMetricas] = useState('todos');
  const [fechaIniMetricas, setFechaIniMetricas] = useState('');
  const [fechaFinMetricas, setFechaFinMetricas] = useState('');

  // URL vacía para que herede la IP/dominio de la nube de forma dinámica
  const API_BASE_URL = '';

  const cargarDatosAdmin = async () => {
    try {
      const [f, p, b, c] = await Promise.all([obtenerFacturas(), obtenerProveedores(), obtenerBitacora(), obtenerListaClientes()]);
      setFacturas(f); setProveedores(p); setBitacora(b); setClientes(c);
    } catch (e) { setToast({ message: "Error cargando la auditoria central", type: "error" }); }
  };

  useEffect(() => { cargarDatosAdmin(); }, [vistaActiva]);

  const handleReenviar = async (email) => {
    setModalData({ isOpen: false, facturaId: null });
    try {
      await reenviarCorreoReporte(modalData.facturaId, email);
      setToast({ message: "Reporte enviado de forma exitosa a " + email, type: "success" });
    } catch (error) { setToast({ message: "Error al despachar el correo", type: "error" }); }
  };

  const guardarProv = async () => {
    try {
      if (formProv.id) await actualizarProveedor(formProv.id, formProv);
      else await crearProveedor(formProv);
      setToast({ message: "Proveedor guardado exitosamente", type: "success" });
      setFormProv({ id: null, nombre: '', nit: '' });
      cargarDatosAdmin();
    } catch (e) { setToast({ message: e.response?.data?.detail || "Error al guardar proveedor", type: "error" }); }
  };

  const eliminarProv = async (id) => {
    try {
      await eliminarProveedor(id);
      setToast({ message: "Proveedor eliminado exitosamente", type: "success" });
      cargarDatosAdmin();
    } catch (e) { setToast({ message: e.response?.data?.detail || "Error al eliminar proveedor", type: "error" }); }
  };

  const guardarCliente = async () => {
    if (!formCliente.username) return setToast({ message: "El usuario es obligatorio", type: "warning" });
    try {
      if (formCliente.id) {
        await actualizarCliente(formCliente.id, { username: formCliente.username, rol: formCliente.rol });
        setToast({ message: "Cliente actualizado exitosamente", type: "success" });
      } else {
        if (!formCliente.password) return setToast({ message: "La contraseña es obligatoria para nuevos clientes", type: "warning" });
        await registrarUsuario(formCliente.username, formCliente.password, formCliente.rol);
        setToast({ message: "Cliente creado exitosamente", type: "success" });
      }
      setFormCliente({ id: null, username: '', rol: 'usuario', password: '' });
      cargarDatosAdmin();
    } catch (e) { setToast({ message: e.response?.data?.detail || "Error al procesar cliente", type: "error" }); }
  };

  const borrarCliente = async (id) => {
    try {
      await eliminarCliente(id);
      setToast({ message: "Cliente eliminado exitosamente", type: "success" });
      cargarDatosAdmin();
    } catch (e) { setToast({ message: e.response?.data?.detail || "Error al eliminar cliente", type: "error" }); }
  };

  const parsearFechaOCR = (fechaStr) => {
    if (!fechaStr) return null;
    const limpia = fechaStr.replace(/-/g, '/');
    const partes = limpia.split('/');
    if (partes.length === 3) return new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
    return new Date(fechaStr);
  };

  // Filtros aplicados unicamente a la Tabla
  const facturasTabla = facturas.filter(f => {
    const cumpleCliente = filtroClienteTabla === 'todos' || f.usuario_propietario === filtroClienteTabla;
    const cumpleProveedor = filtroProvTabla === 'todos' || f.proveedor === filtroProvTabla;
    const fechaDoc = parsearFechaOCR(f.fecha);
    let cumpleInicio = true; let cumpleFin = true;
    if (fechaIniTabla && fechaDoc) cumpleInicio = fechaDoc >= new Date(fechaIniTabla);
    if (fechaFinTabla && fechaDoc) cumpleFin = fechaDoc <= new Date(fechaFinTabla);
    return cumpleCliente && cumpleProveedor && cumpleInicio && cumpleFin;
  });

  // Filtros aplicados unicamente a las Metricas (Excluyendo rechazadas)
  const facturasMetricas = facturas.filter(f => {
    if (f.estado_procesamiento !== 'Procesado') return false;
    const cumpleCliente = filtroClienteMetricas === 'todos' || f.usuario_propietario === filtroClienteMetricas;
    const cumpleProveedor = filtroProvMetricas === 'todos' || f.proveedor === filtroProvMetricas;
    const fechaDoc = parsearFechaOCR(f.fecha);
    let cumpleInicio = true; let cumpleFin = true;
    if (fechaIniMetricas && fechaDoc) cumpleInicio = fechaDoc >= new Date(fechaIniMetricas);
    if (fechaFinMetricas && fechaDoc) cumpleFin = fechaDoc <= new Date(fechaFinMetricas);
    return cumpleCliente && cumpleProveedor && cumpleInicio && cumpleFin;
  });

  const globalTotal = facturasMetricas.reduce((sum, f) => sum + f.total, 0);

  const dataGrafica = Object.values(facturasMetricas.reduce((acc, curr) => {
    acc[curr.proveedor] = acc[curr.proveedor] || { name: curr.proveedor, total: 0 };
    acc[curr.proveedor].total += curr.total;
    return acc;
  }, {})).sort((a, b) => b.total - a.total).slice(0, 10);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const dataFechaGlobal = Object.values(facturasMetricas.reduce((acc, curr) => {
    acc[curr.fecha] = acc[curr.fecha] || { fecha: curr.fecha, total: 0 };
    acc[curr.fecha].total += curr.total;
    return acc;
  }, {})).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const dataClienteGlobal = Object.values(facturasMetricas.reduce((acc, curr) => {
    acc[curr.usuario_propietario] = acc[curr.usuario_propietario] || { name: curr.usuario_propietario, value: 0 };
    acc[curr.usuario_propietario].value += curr.total;
    return acc;
  }, {}));

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ResendModal isOpen={modalData.isOpen} onClose={() => setModalData({ isOpen: false, facturaId: null })} onSend={handleReenviar} />

      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button className={`tab-btn ${vistaActiva === 'facturas' ? 'active' : ''}`} onClick={() => setVistaActiva('facturas')}>Auditoria</button>
        <button className={`tab-btn ${vistaActiva === 'proveedores' ? 'active' : ''}`} onClick={() => setVistaActiva('proveedores')}>Proveedores</button>
        <button className={`tab-btn ${vistaActiva === 'clientes' ? 'active' : ''}`} onClick={() => setVistaActiva('clientes')}>Clientes</button>
        <button className={`tab-btn ${vistaActiva === 'metricas' ? 'active' : ''}`} onClick={() => setVistaActiva('metricas')}>Metricas</button>
        <button className={`tab-btn ${vistaActiva === 'bitacora' ? 'active' : ''}`} onClick={() => setVistaActiva('bitacora')}>Logs RPA</button>
      </div>

      {vistaActiva === 'facturas' && (
        <div className="crud-card">
          <h3>Repositorio de Facturas Consolidadas</h3>
          <div style={{ display: 'flex', gap: '15px', margin: '15px 0', background: 'var(--bg-muted)', padding: '15px', borderRadius: '8px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label>Cliente:</label>
              <select className="form-input" value={filtroClienteTabla} onChange={e => setFiltroClienteTabla(e.target.value)}>
                <option value="todos">-- Todos --</option>
                {clientes.map(c => <option key={c.id} value={c.username}>{c.username}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label>Proveedor:</label>
              <select className="form-input" value={filtroProvTabla} onChange={e => setFiltroProvTabla(e.target.value)}>
                <option value="todos">-- Todos --</option>
                {proveedores.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
              </select>
            </div>
            <div style={{ width: '160px' }}>
              <label>Desde:</label>
              <input type="date" className="form-input" value={fechaIniTabla} onChange={e => setFechaIniTabla(e.target.value)} />
            </div>
            <div style={{ width: '160px' }}>
              <label>Hasta:</label>
              <input type="date" className="form-input" value={fechaFinTabla} onChange={e => setFechaFinTabla(e.target.value)} />
            </div>
          </div>

          <table className="historial-table">
            <thead>
              <tr>
                <th>ID</th><th>Cliente</th><th>Factura</th><th>Proveedor</th><th>Monto</th><th>Estado</th>
                <th style={{ width: '100px' }}>Evidencia</th>
                <th style={{ width: '100px' }}>Reenviar</th><th>Exportar</th>
              </tr>
            </thead>
            <tbody>
              {facturasTabla.map(f => {
                // Logica segura para detectar si el archivo es verdaderamente evidencia de Playwright
                const esEvidencia = f.archivo && String(f.archivo).startsWith('evidencias/');
                const urlArchivo = esEvidencia ? `${API_BASE_URL}/${f.archivo}` : null;

                return (
                  <tr key={f.id}>
                    <td>{f.id}</td><td><span className="usuario-badge">{f.usuario_propietario}</span></td>
                    <td>{f.numero_factura}</td><td>{f.proveedor}</td><td>Q {f.total.toFixed(2)}</td>
                    <td>
                      <span style={{ color: f.estado_procesamiento === 'Procesado' ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                        {f.estado_procesamiento}
                      </span>
                    </td>
                    <td>
                      {f.estado_procesamiento === 'Procesado' && esEvidencia ? (
                        <a href={urlArchivo} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{display: 'inline-block', textAlign: 'center'}}>Ver Archivo</a>
                      ) : 'N/A'}
                    </td>
                    <td><button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => setModalData({ isOpen: true, facturaId: f.id })}>Correo</button></td>
                    <td><ExportButton facturaId={f.id} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>* Nota: Facturas historicas previas a la integracion RPA mostraran "N/A" en evidencia.</p>
        </div>
      )}

      {vistaActiva === 'proveedores' && (
        <div className="crud-card">
          <h3>Directorio y Gestion de Proveedores</h3>
          <div className="form-row" style={{ alignItems: 'flex-end', marginBottom: '20px' }}>
            <div style={{flex: 1}}>
              <label>Razon Social</label>
              <input className="form-input" value={formProv.nombre} onChange={e=>setFormProv({...formProv, nombre: e.target.value})} placeholder="Nombre comercial" />
            </div>
            <div style={{width: '250px'}}>
              <label>NIT Registrado</label>
              <input className="form-input" value={formProv.nit} onChange={e=>setFormProv({...formProv, nit: e.target.value})} placeholder="Numero NIT" />
            </div>
            <button className="btn btn-primary" onClick={guardarProv}>{formProv.id ? 'Actualizar' : 'Registrar Nuevo'}</button>
            <button className="btn btn-secondary" onClick={() => setFormProv({ id: null, nombre: '', nit: '' })}>Limpiar</button>
          </div>
          <table className="historial-table">
            <thead><tr><th>ID</th><th>Nombre / Razon Social</th><th>NIT</th><th>Acciones</th></tr></thead>
            <tbody>
              {proveedores.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td><td>{p.nombre}</td><td><span className="usuario-badge">{p.nit}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setFormProv(p)}>Editar</button>
                      <button className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => eliminarProv(p.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {vistaActiva === 'clientes' && (
        <div className="crud-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3>Gestion de Usuarios del Sistema (Clientes)</h3>
          
          <div className="form-row" style={{ alignItems: 'flex-end', marginBottom: '20px', background: 'var(--bg-muted)', padding: '15px', borderRadius: '8px' }}>
            <div style={{ flex: 1 }}>
              <label>Nombre de Cuenta (Username)</label>
              <input 
                className="form-input" 
                value={formCliente.username} 
                onChange={e => setFormCliente({...formCliente, username: e.target.value})} 
                placeholder="Ej: cliente_nuevo" 
              />
            </div>
            {!formCliente.id && (
              <div style={{ flex: 1 }}>
                <label>Contraseña</label>
                <input 
                  type="password"
                  className="form-input" 
                  value={formCliente.password} 
                  onChange={e => setFormCliente({...formCliente, password: e.target.value})} 
                  placeholder="Requerida para crear" 
                />
              </div>
            )}
            <div style={{ width: '150px' }}>
              <label>Rol</label>
              <select 
                className="form-input" 
                value={formCliente.rol} 
                onChange={e => setFormCliente({...formCliente, rol: e.target.value})}
              >
                <option value="usuario">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={guardarCliente}>
              {formCliente.id ? 'Actualizar' : 'Crear Usuario'}
            </button>
            <button className="btn btn-secondary" onClick={() => setFormCliente({ id: null, username: '', rol: 'usuario', password: '' })}>Limpiar</button>
          </div>

          <table className="historial-table">
            <thead>
              <tr><th>ID</th><th>Nombre de Cuenta</th><th>Rol Asignado</th><th>Acciones Administrativas</th></tr>
            </thead>
            <tbody>
              {clientes.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td><b>{c.username}</b></td>
                  <td><span className="usuario-badge">{c.rol}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setFormCliente({ id: c.id, username: c.username, rol: c.rol, password: '' })}>Editar</button>
                      <button className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => borrarCliente(c.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {vistaActiva === 'metricas' && (
        <div className="crud-card">
          <h3>Dashboard Analitico Interactivo</h3>

          <div style={{ display: 'flex', gap: '15px', margin: '15px 0', background: 'var(--bg-muted)', padding: '15px', borderRadius: '8px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label>Cliente (Metricas):</label>
              <select className="form-input" value={filtroClienteMetricas} onChange={e => setFiltroClienteMetricas(e.target.value)}>
                <option value="todos">-- Todos --</option>
                {clientes.map(c => <option key={c.id} value={c.username}>{c.username}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label>Proveedor (Metricas):</label>
              <select className="form-input" value={filtroProvMetricas} onChange={e => setFiltroProvMetricas(e.target.value)}>
                <option value="todos">-- Todos --</option>
                {proveedores.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
              </select>
            </div>
            <div style={{ width: '160px' }}>
              <label>Desde:</label>
              <input type="date" className="form-input" value={fechaIniMetricas} onChange={e => setFechaIniMetricas(e.target.value)} />
            </div>
            <div style={{ width: '160px' }}>
              <label>Hasta:</label>
              <input type="date" className="form-input" value={fechaFinMetricas} onChange={e => setFechaFinMetricas(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <div style={{ flex: 1, padding: '20px', background: 'var(--bg-muted)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Documentos Validos</p><h2>{facturasMetricas.length} facturas</h2>
            </div>
            <div style={{ flex: 1, padding: '20px', background: 'var(--bg-muted)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Impacto Financiero Global</p><h2>Q {globalTotal.toFixed(2)}</h2>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 60%', background: 'var(--bg-muted)', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ textAlign: 'center' }}>Top 10 Proveedores por Monto</h4>
              <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataGrafica} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip cursor={{ fill: 'var(--bg)' }} contentStyle={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }} formatter={(value) => `Q ${value.toFixed(2)}`} />
                    <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ flex: '1 1 35%', background: 'var(--bg-muted)', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ textAlign: 'center' }}>Facturacion Total por Cliente</h4>
              <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dataClienteGlobal} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                      {dataClienteGlobal.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
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

      {vistaActiva === 'bitacora' && (
        <div className="crud-card">
          <h3>Trazabilidad de Procesos (Logs)</h3>
          <table className="historial-table" style={{ marginTop: '15px' }}>
            <thead><tr><th>Fecha</th><th>Origen</th><th>Estado</th><th>Detalle En la Base</th></tr></thead>
            <tbody>
              {bitacora.map(b => {
                // Chequeo riguroso de la palabra de exito considerando capitalizacion o tildes
                const esExito = b.estado && (b.estado.toLowerCase().includes('exit') || b.estado.toLowerCase().includes('procesado'));
                return (
                  <tr key={b.id}>
                    <td>{new Date(b.fecha_hora).toLocaleString()}</td><td>{b.documento}</td>
                    <td style={{ color: esExito ? 'var(--success)' : 'var(--danger)' }}><b>{b.estado}</b></td>
                    <td>{b.resultado}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}