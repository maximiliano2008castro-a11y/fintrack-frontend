// Punto unico de contacto con el backend.
// Antes la URL estaba escrita a mano en 6 lugares distintos.
// Para cambiar de servidor, edita REACT_APP_API_URL en el archivo .env del frontend.

export const API_URL =
    process.env.REACT_APP_API_URL || 'https://fintrack-backend-omega.vercel.app';

export const getToken = () => localStorage.getItem('token');

export const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
};

/**
 * fetch con el token de sesion ya puesto en el header.
 * Usalo para todo lo que sea de un usuario ya logueado.
 *
 * Si el servidor responde 401, la sesion murio: se limpia y se manda al login.
 */
export const apiFetch = async (ruta, opciones = {}) => {
    const token = getToken();

    const respuesta = await fetch(`${API_URL}${ruta}`, {
        ...opciones,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(opciones.headers || {}),
        },
    });

    if (respuesta.status === 401) {
        cerrarSesion();
        if (window.location.pathname !== '/') window.location.href = '/';
        throw new Error('Sesion expirada');
    }

    return respuesta;
};
