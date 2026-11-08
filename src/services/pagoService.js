import api from './api';

// Dos cosas distintas que comparten entidad, separadas abajo:
//   1. el CRUD de Pagos (/pagos)
//   2. el cobro por QR del BNB (/pagos/{id}/qr)
// Van en el mismo servicio porque el proyecto tiene uno por entidad, pero en
// el backend son dos controladores: PagoController y PagoQrController.
export default {
  // --- CRUD ---

  getPagos(page = 1) {
    return api.get(`/pagos?page=${page}`);
  },

  getPago(id) {
    return api.get(`/pagos/${id}`);
  },

  createPago(data) {
    return api.post('/pagos', data);
  },

  updatePago(id, data) {
    return api.put(`/pagos/${id}`, data);
  },

  deletePago(id) {
    return api.delete(`/pagos/${id}`);
  },

  getReporte() {
    return api.get('/pagos/reporte');
  },

  // Va por axios (no un <a href>) para que el token viaje en la cabecera
  descargarReportePdf() {
    return api.get('/pagos/reporte/pdf', { responseType: 'blob' });
  },

  // --- Cobro por QR del BNB ---

  // Pide el QR de un pago ya registrado. Es tambien la forma de VOLVER a
  // mostrarlo: el banco devuelve la imagen una sola vez, al generarla, y no
  // la guardamos, asi que "mostrar otra vez" es generar uno nuevo (el
  // anterior se anula solo en el backend).
  generarQr(pagoId) {
    return api.post(`/pagos/${pagoId}/qr`);
  },

  // ¿Ya se pago? Si el banco dice que si, el backend deja el pago cobrado y
  // la suscripcion activa en la misma llamada.
  consultarEstado(pagoId) {
    return api.get(`/pagos/${pagoId}/qr`);
  },

  // Anula el QR sin borrar el pago: queda pendiente y se le puede generar otro
  anularQr(pagoId) {
    return api.post(`/pagos/${pagoId}/qr/cancelar`);
  },
};
