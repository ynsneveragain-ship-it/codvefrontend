import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import vencimientoService from '@/services/vencimientoService';

export const useVencimientoStore = defineStore('vencimiento', () => {
  const dominios = ref([]);
  const suscripciones = ref([]);
  // 'verde' | 'amarillo' | 'rojo'. Lo decide el backend para que no haya dos
  // criterios distintos; mientras no se haya cargado nada, verde.
  const nivel = ref('verde');
  const totales = ref({ dominios: 0, suscripciones: 0, total: 0, urgentes: 0 });
  const parametros = ref({ dias_aviso: 30, dias_urgente: 7 });
  const loading = ref(false);
  const error = ref(null);

  const hayCasos = computed(() => totales.value.total > 0);

  const fetchVencimientos = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await vencimientoService.getVencimientos();
      dominios.value = data.dominios;
      suscripciones.value = data.suscripciones;
      nivel.value = data.nivel;
      totales.value = data.totales;
      parametros.value = data.parametros;
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || 'No se pudieron cargar los vencimientos';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Avisos del botón "Notificar". NO tocan las listas ni el nivel: mandar un
  // correo no cambia cuándo vence nada, así que recargar el panel después
  // sería pedir lo mismo para pintar lo mismo.
  //
  // Tampoco guardan aquí el "enviado" de cada fila: eso es estado de la
  // pantalla (se pierde al cerrar el panel, y debe perderse), y vive en
  // PanelVencimientos. El store solo hace la llamada y devuelve el mensaje.
  const notificarDominio = async (id) => {
    const { data } = await vencimientoService.notificarDominio(id);
    return data;
  };

  const notificarSuscripcion = async (id) => {
    const { data } = await vencimientoService.notificarSuscripcion(id);
    return data;
  };

  return {
    dominios, suscripciones, nivel, totales, parametros, loading, error,
    hayCasos, fetchVencimientos, notificarDominio, notificarSuscripcion,
  };
});
