import api from './api';

export default {
  // Dominios y suscripciones a punto de caducar, con el color del aviso ya
  // resuelto por el backend (ver backend/config/avisos.php)
  getVencimientos() {
    return api.get('/vencimientos');
  },

  // Botón "Notificar" de cada fila del panel: el backend le escribe al cliente
  // avisando del vencimiento. Son dos llamadas distintas, no una con un tipo,
  // porque en el servidor son dos correos con su propia plantilla.
  notificarDominio(id) {
    return api.post(`/vencimientos/dominios/${id}/notificar`);
  },

  notificarSuscripcion(id) {
    return api.post(`/vencimientos/suscripciones/${id}/notificar`);
  },
};
