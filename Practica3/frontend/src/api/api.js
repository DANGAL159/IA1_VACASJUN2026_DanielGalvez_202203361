import axios from 'axios';

// Usamos ruta relativa vacía. Nginx interceptará y enviará al backend
const API_URL = ''; 

const apiClient = axios.create({
  baseURL: API_URL,
});

// Interceptor para inyectar de manera automatica el token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartinvoice_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginAdmin = async (username, password) => {
  const response = await apiClient.post('/auth/login', { username, password });
  if (response.data.access_token) {
    localStorage.setItem('smartinvoice_token', response.data.access_token);
    localStorage.setItem('smartinvoice_role', response.data.rol);
  }
  return response.data;
};

export const registrarUsuario = async (username, password, rol = "usuario") => {
  const response = await apiClient.post('/auth/register', { username, password, rol });
  return response.data;
};

export const extraerFacturas = async (formData) => {
  const response = await apiClient.post('/facturas/extraer', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const confirmarFactura = async (datos) => {
  return (await apiClient.post('/facturas/confirmar', datos)).data;
};

export const obtenerFacturas = async (clienteId = null) => {
  const url = clienteId ? `/facturas/?cliente_id=${clienteId}` : '/facturas/';
  return (await apiClient.get(url)).data;
};

export const obtenerListaClientes = async () => {
  return (await apiClient.get('/facturas/clientes')).data;
};

export const reenviarCorreoReporte = async (id, email) => {
  const formData = new FormData();
  formData.append("email", email);
  return (await apiClient.post(`/facturas/${id}/reenviar-correo`, formData)).data;
};

export const obtenerBitacora = async () => {
  return (await apiClient.get('/facturas/bitacora')).data;
};

// --- CRUD PROVEEDORES ---
export const obtenerProveedores = async () => (await apiClient.get('/facturas/proveedores')).data;
export const crearProveedor = async (datos) => (await apiClient.post('/facturas/proveedores', datos)).data;
export const actualizarProveedor = async (id, datos) => (await apiClient.put(`/facturas/proveedores/${id}`, datos)).data;
export const eliminarProveedor = async (id) => (await apiClient.delete(`/facturas/proveedores/${id}`)).data;

// --- EXPORTAR REPORTES (PDF, EXCEL, CSV) ---
export const exportarFactura = async (id, formato) => {
  const response = await apiClient.get(`/facturas/${id}/exportar?formato=${formato}`, {
    responseType: 'blob' // Vital para que axios no corrompa el archivo descargado
  });
  return response.data;
};

// --- RECHAZAR FACTURA ---
export const rechazarFactura = async (datos) => {
  const response = await apiClient.post('/facturas/rechazar', datos);
  return response.data;
};

// --- CRUD CLIENTES ---
export const actualizarCliente = async (id, datos) => {
  const response = await apiClient.put(`/auth/usuarios/${id}`, datos);
  return response.data;
};

export const eliminarCliente = async (id) => {
  const response = await apiClient.delete(`/auth/usuarios/${id}`);
  return response.data;
};