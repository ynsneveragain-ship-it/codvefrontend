import { defineStore } from 'pinia';
import { ref } from 'vue';
import pagoService from '@/services/pagoService';

export const usePagoStore = defineStore('pago', () => {
  const pagos = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const total = ref(0);

  // --- CRUD ---

  const fetchPagos = async (page = 1) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await pagoService.getPagos(page);
      pagos.value = response.data.data;
      currentPage.value = response.data.pagination.current_page;
      totalPages.value = response.data.pagination.last_page;
      total.value = response.data.pagination.total;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar pagos';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createPago = async (data) => {
    loading.value = true;
    error.value = null;
    try {
      return (await pagoService.createPago(data)).data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al registrar el pago';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePago = async (id, data) => {
    loading.value = true;
    error.value = null;
    try {
      return (await pagoService.updatePago(id, data)).data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar el pago';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePago = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await pagoService.deletePago(id);
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al eliminar el pago';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchReporte = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await pagoService.getReporte();
      return response.data.reporte;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al generar el reporte';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const descargarReportePdf = async () => {
    const response = await pagoService.descargarReportePdf();
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-pagos-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // --- Cobro por QR del BNB ---

  const generarQr = async (pagoId) => {
    loading.value = true;
    error.value = null;
    try {
      return (await pagoService.generarQr(pagoId)).data;
    } catch (err) {
      error.value = err.response?.data?.message || 'No se pudo generar el QR de cobro';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // A proposito NO toca 'loading': la pantalla pregunta esto cada pocos
  // segundos mientras espera el pago, y un loading global pondria todos los
  // botones en "cargando" sin parar.
  const consultarEstado = async (pagoId) => {
    return (await pagoService.consultarEstado(pagoId)).data;
  };

  const anularQr = async (pagoId) => {
    loading.value = true;
    error.value = null;
    try {
      return (await pagoService.anularQr(pagoId)).data;
    } catch (err) {
      error.value = err.response?.data?.message || 'No se pudo anular el QR';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    pagos, loading, error, currentPage, totalPages, total,
    fetchPagos, createPago, updatePago, deletePago,
    fetchReporte, descargarReportePdf,
    generarQr, consultarEstado, anularQr,
  };
});
