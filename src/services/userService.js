import api from './api';

export default {
  getUsers(page = 1) {
    return api.get(`/users?page=${page}`);
  },

  getUser(id) {
    return api.get(`/users/${id}`);
  },

  createUser(userData) {
    return api.post('/users', userData);
  },

  updateUser(id, userData) {
    return api.put(`/users/${id}`, userData);
  },

  deleteUser(id) {
    return api.delete(`/users/${id}`);
  },




  getReporte() {
    return api.get('/users/reporte');
  },

  // Va por axios (no un <a href>) para que el token viaje en la cabecera
  descargarReportePdf() {
    return api.get('/users/reporte/pdf', { responseType: 'blob' });
  },
};
