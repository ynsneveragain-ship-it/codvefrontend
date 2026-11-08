import api from './api';

export default {
  // Registra la venta completa: cliente + suscripcion + dominio + pago.
  // No se envia ningun importe: los calcula el servidor (ver config/precios.php
  // en el backend).
  crearCompra(data) {
    return api.post('/compras', data);
  },
};
