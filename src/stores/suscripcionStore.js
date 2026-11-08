import { defineStore } from 'pinia';
import { ref } from 'vue';
import suscripcionService from '@/services/suscripcionService';

export const useSuscripcionStore = defineStore('suscripcion', () => {
  const suscripciones = ref([]);
  // Lista completa para desplegables; se guarda aparte para no pisar la
  // pagina que se esta viendo en la tabla
  const todas = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const total = ref(0);

  const fetchSuscripciones = async (page = 1) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await suscripcionService.getSuscripciones(page);
      suscripciones.value = response.data.data;
      currentPage.value = response.data.pagination.current_page;
      totalPages.value = response.data.pagination.last_page;
      total.value = response.data.pagination.total;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar suscripciones';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTodas = async () => {
    const response = await suscripcionService.getTodas();
    todas.value = response.data.data;
    return todas.value;
  };

  const createSuscripcion = async (data) => {
    loading.value = true;
    error.value = null;
    try {
      return (await suscripcionService.createSuscripcion(data)).data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear suscripción';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateSuscripcion = async (id, data) => {
    loading.value = true;
    error.value = null;
    try {
      return (await suscripcionService.updateSuscripcion(id, data)).data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar suscripción';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteSuscripcion = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await suscripcionService.deleteSuscripcion(id);
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al eliminar suscripción';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchReporte = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await suscripcionService.getReporte();
      return response.data.reporte;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al generar el reporte';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const descargarReportePdf = async () => {
    const response = await suscripcionService.descargarReportePdf();
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-suscripciones-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return {
    suscripciones, todas, loading, error, currentPage, totalPages, total,
    fetchSuscripciones, fetchTodas,
    createSuscripcion, updateSuscripcion, deleteSuscripcion,
    fetchReporte, descargarReportePdf,
  };
});
