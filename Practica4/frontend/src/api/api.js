import axios from 'axios';

const apiClient = axios.create({
  baseURL: '', // Nginx interceptará las rutas que inicien con /api
});

export const obtenerLaberinto = async (id) => {
  const response = await apiClient.get(`/api/mazes/${id}`);
  return response.data;
};

export const generarLaberinto = async (rows, cols) => {
  const response = await apiClient.post('/api/mazes/generate', { rows, cols });
  return response.data;
};

export const resolverLaberinto = async (grid, start, targets, algorithm) => {
  const response = await apiClient.post('/api/mazes/solve', {
    grid,
    start,
    targets,
    algorithm
  });
  return response.data;
};

export const guardarLaberintoPersonalizado = async (mazeId, grid, start, targets) => {
  const response = await apiClient.post('/api/mazes/custom', {
    maze_id: mazeId,
    grid,
    start,
    targets
  });
  return response.data;
};