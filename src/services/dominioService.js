import api from './api';

export default {
  getDominios(page = 1) {
    return api.get(`/dominios?page=${page}`);
  },

  getDominio(id) {
    return api.get(`/dominios/${id}`);
  },

  createDominio(data) {
    return api.post('/dominios', data);
  },

  updateDominio(id, data) {
    return api.put(`/dominios/${id}`, data);
  },

  deleteDominio(id) {
    return api.delete(`/dominios/${id}`);
  },

  // Disponibilidad en Porkbun. Pasa por nuestro backend a proposito: la clave
  // y el secreto de Porkbun no pueden salir del servidor.
  verificarDisponibilidad(nombre) {
    return api.post('/dominios/verificar', { nombre });
  },

  getReporte() {
    return api.get('/dominios/reporte');
  },

  // Va por axios (no un <a href>) para que el token viaje en la cabecera
  descargarReportePdf() {
    return api.get('/dominios/reporte/pdf', { responseType: 'blob' });
  },
};
