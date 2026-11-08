import api from './api';

export default {
  getPermisos() {
    return api.get('/permisos');
  },

  getPermiso(id) {
    return api.get(`/permisos/${id}`);
  },

  createPermiso(data) {
    return api.post('/permisos', data);
  },

  updatePermiso(id, data) {
    return api.put(`/permisos/${id}`, data);
  },

  deletePermiso(id) {
    return api.delete(`/permisos/${id}`);
  },

  syncRoles(id, roles) {
    return api.put(`/permisos/${id}/roles`, { roles });
  },

  getReporte() {
    return api.get('/permisos/reporte');
  },

  // Va por axios (no un <a href>) para que el token viaje en la cabecera
  descargarReportePdf() {
    return api.get('/permisos/reporte/pdf', { responseType: 'blob' });
  },
};
