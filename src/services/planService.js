import api from './api';

export default {
  getPlanes() {
    return api.get('/planes');
  },

  getPlan(id) {
    return api.get(`/planes/${id}`);
  },

  createPlan(data) {
    return api.post('/planes', data);
  },

  updatePlan(id, data) {
    return api.put(`/planes/${id}`, data);
  },

  deletePlan(id) {
    return api.delete(`/planes/${id}`);
  },

  getReporte() {
    return api.get('/planes/reporte');
  },

  // Va por axios (no un <a href>) para que el token viaje en la cabecera
  descargarReportePdf() {
    return api.get('/planes/reporte/pdf', { responseType: 'blob' });
  },
};
