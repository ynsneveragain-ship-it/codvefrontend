import api from './api';

export default {
  getRoles() {
    return api.get('/roles');
  },

  getRol(id) {
    return api.get(`/roles/${id}`);
  },

  createRol(data) {
    return api.post('/roles', data);
  },

  updateRol(id, data) {
    return api.put(`/roles/${id}`, data);
  },

  deleteRol(id) {
    return api.delete(`/roles/${id}`);
  },

  syncPermisos(id, permisos) {
    return api.put(`/roles/${id}/permisos`, { permisos });
  },

  getReporte() {
    return api.get('/roles/reporte');
  },

  // Va por axios (no un <a href>) para que el token viaje en la cabecera
  descargarReportePdf() {
    return api.get('/roles/reporte/pdf', { responseType: 'blob' });
  },
};
