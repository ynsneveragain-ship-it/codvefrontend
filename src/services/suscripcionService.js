import api from './api';

export default {
  getSuscripciones(page = 1) {
    return api.get(`/suscripciones?page=${page}`);
  },

  // Todas de una vez, sin paginar: alimenta el desplegable del formulario de
  // Pagos, que tiene que poder elegir cualquiera
  getTodas() {
    return api.get('/suscripciones?todos=1');
  },

  getSuscripcion(id) {
    return api.get(`/suscripciones/${id}`);
  },

  createSuscripcion(data) {
    return api.post('/suscripciones', data);
  },

  updateSuscripcion(id, data) {
    return api.put(`/suscripciones/${id}`, data);
  },

  deleteSuscripcion(id) {
    return api.delete(`/suscripciones/${id}`);
  },

  getReporte() {
    return api.get('/suscripciones/reporte');
  },

  // Va por axios (no un <a href>) para que el token viaje en la cabecera
  descargarReportePdf() {
    return api.get('/suscripciones/reporte/pdf', { responseType: 'blob' });
  },
};
