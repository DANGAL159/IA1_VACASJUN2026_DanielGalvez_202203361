import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const diagnosticarFalla = async (sintomasSeleccionados, telegramUser) => {
  const response = await apiClient.post('/sistema-experto/diagnosticar', {
    sintomas_usuario: sintomasSeleccionados,
    telegram_user: telegramUser
  });
  return response.data;
};

export const obtenerHistorial = async () => {
  const response = await apiClient.get('/sistema-experto/historial');
  return response.data.historial;
};

export const obtenerConocimiento = async () => {
  const response = await apiClient.get('/conocimiento/');
  return response.data;
};

export const guardarConocimientoBD = async () => {
  const response = await apiClient.post('/conocimiento/guardar');
  return response.data;
};

export const agregarSintoma = async (nombreSintoma) => {
  const response = await apiClient.post('/conocimiento/sintoma', { nombre: nombreSintoma });
  return response.data;
};

export const eliminarSintoma = async (nombreSintoma) => {
  const response = await apiClient.delete(`/conocimiento/sintoma/${encodeURIComponent(nombreSintoma)}`);
  return response.data;
};

export const actualizarSintoma = async (nombreViejo, nombreNuevo) => {
  const response = await apiClient.put(`/conocimiento/sintoma/${encodeURIComponent(nombreViejo)}`, { nombre: nombreNuevo });
  return response.data;
};

export const agregarFalla = async (idFalla, nombreFalla) => {
  const response = await apiClient.post('/conocimiento/falla', { id: idFalla, nombre: nombreFalla });
  return response.data;
};

export const eliminarFalla = async (idFalla) => {
  const response = await apiClient.delete(`/conocimiento/falla/${idFalla}`);
  return response.data;
};

export const actualizarFalla = async (idFalla, nombreNuevo) => {
  const response = await apiClient.put(`/conocimiento/falla/${idFalla}`, { id: idFalla, nombre: nombreNuevo });
  return response.data;
};

export const agregarRecomendacion = async (idFalla, textoRecomendacion) => {
  const response = await apiClient.post('/conocimiento/recomendacion', { id_falla: idFalla, texto: textoRecomendacion });
  return response.data;
};

export const eliminarRecomendacion = async (idFalla) => {
  const response = await apiClient.delete(`/conocimiento/recomendacion/${idFalla}`);
  return response.data;
};

export const agregarRegla = async (idFalla, listaSintomas) => {
  const response = await apiClient.post('/conocimiento/regla', { id_falla: idFalla, sintomas: listaSintomas });
  return response.data;
};

export const eliminarRegla = async (idFalla) => {
  const response = await apiClient.delete(`/conocimiento/regla/${idFalla}`);
  return response.data;
};

export const obtenerConfiguracion = async () => {
  const response = await apiClient.get('/configuracion/');
  return response.data;
};

export const actualizarConfiguracion = async (configData) => {
  const response = await apiClient.put('/configuracion/', configData);
  return response.data;
};