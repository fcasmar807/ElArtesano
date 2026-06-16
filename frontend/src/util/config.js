export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const GET_PLATOS_ENDPOINT                = `${API_BASE_URL}/api/platos`;
export const GET_USUARIOS_ENDPOINT              = `${API_BASE_URL}/api/users`;
export const GET_HORAS_ENDPOINT                 = `${API_BASE_URL}/api/reservas/horas`;
export const POST_RESERVA_ENDPOINT              = `${API_BASE_URL}/api/reservas`;
export const FILTER_PLATO_INGREDIENTES_ENDPOINT = `${API_BASE_URL}/api/plato-ingrediente/filter`;
export const GET_MESAS_ENDPOINT                 = `${API_BASE_URL}/api/mesas`;
export const LOGIN_ENDPOINT                     = `${API_BASE_URL}/api/login`;
export const ME_ENDPOINT                        = `${API_BASE_URL}/api/me`;
export const UPDATE_ME_ENDPOINT                 = `${API_BASE_URL}/api/me`;
export const CREATE_ME_ENDPOINT                 = `${API_BASE_URL}/api/me`;
export const DELETE_ME_ENDPOINT                 = `${API_BASE_URL}/api/me`;
export const GET_INGREDIENTES_ENDPOINT          = `${API_BASE_URL}/api/ingredientes`;
export const GET_RESERVAS_ENDPOINT              = `${API_BASE_URL}/api/reservas`;
// config.js
export const STORAGE_URL = "http://localhost:8080/gestor-pescaderia/public/storage";
export const POST_PLATO_ENDPOINT = `${API_BASE_URL}/api/platos`;
export const ADMIN_ROL_ID       = 1; // cambia si tu admin tiene otro rol_id
export const REGISTER_ENDPOINT   = `${API_BASE_URL}/api/users`;