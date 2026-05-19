export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const GET_PLATOS_ENDPOINT = `${API_BASE_URL}/gestor-pescaderia/public/api/platos`;
export const GET_USUARIOS_ENDPOINT = `${API_BASE_URL}/gestor-pescaderia/public/api/users`;
export const GET_HORAS_ENDPOINT = `${API_BASE_URL}/gestor-pescaderia/public/api/horas-disponibles`;
export const POST_RESERVA_ENDPOINT = `${API_BASE_URL}/gestor-pescaderia/public/api/reservas`;
export const FILTER_PLATO_INGREDIENTES_ENDPOINT = `${API_BASE_URL}/gestor-pescaderia/public/api/plato-ingrediente/filter`;