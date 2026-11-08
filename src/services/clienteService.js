import api from './api';

export default {
  // Todos de una vez, sin paginar: alimenta el desplegable del formulario de
  // Suscripciones, que tiene que poder elegir cualquier cliente
  getTodos() {
    return api.get('/clientes?todos=1');
  },

  getClientes(page = 1) {
    return api.get(`/clientes?page=${page}`);
  },

  getCliente(id) {
    return api.get(`/clientes/${id}`);
  },

  createCliente(data) {
    return api.post('/clientes', data);
  },

  updateCliente(id, data) {
    return api.put(`/clientes/${id}`, data);
  },

  deleteCliente(id) {
    return api.delete(`/clientes/${id}`);
  },

  getReporte() {
    return api.get('/clientes/reporte');
  },

  // Va por axios (no un <a href>) para que el token viaje en la cabecera
  descargarReportePdf() {
    return api.get('/clientes/reporte/pdf', { responseType: 'blob' });
  },
};
