import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Autenticacion
export const loginAdmin = async (username, password) => {
  const response = await apiClient.post('/auth/login', { username, password });
  return response.data;
};

// Categorias
export const obtenerCategorias = async () => {
  const response = await apiClient.get('/categorias/');
  return response.data;
};

export const crearCategoria = async (nombre) => {
  const response = await apiClient.post('/categorias/', { nombre });
  return response.data;
};

export const eliminarCategoria = async (id) => {
  const response = await apiClient.delete(`/categorias/${id}`);
  return response.data;
};

// Preguntas y Respuestas (FAQ)
export const obtenerPreguntas = async () => {
  const response = await apiClient.get('/preguntas/');
  return response.data;
};

export const crearPregunta = async (datos) => {
  const response = await apiClient.post('/preguntas/', datos);
  return response.data;
};

export const actualizarPregunta = async (id, datos) => {
  const response = await apiClient.put(`/preguntas/${id}`, datos);
  return response.data;
};

export const eliminarPregunta = async (id) => {
  const response = await apiClient.delete(`/preguntas/${id}`);
  return response.data;
};

// Configuracion Bot
export const obtenerConfiguracionBot = async () => {
  const response = await apiClient.get('/configuracion/');
  return response.data;
};

export const actualizarConfiguracionBot = async (datos) => {
  const response = await apiClient.put('/configuracion/', datos);
  return response.data;
};

// Estadisticas e Historial
export const obtenerHistorialConsultas = async () => {
  const response = await apiClient.get('/estadisticas/historial');
  return response.data;
};

export const obtenerResumenEstadisticas = async () => {
  const response = await apiClient.get('/estadisticas/resumen');
  return response.data;
};

export const actualizarCategoria = async (id, nombre) => {
  const response = await apiClient.put(`/categorias/${id}`, { nombre });
  return response.data;
};