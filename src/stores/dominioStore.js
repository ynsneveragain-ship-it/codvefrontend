import { defineStore } from 'pinia';
import { ref } from 'vue';
import dominioService from '@/services/dominioService';

export const useDominioStore = defineStore('dominio', () => {
  const dominios = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const total = ref(0);

  const fetchDominios = async (page = 1) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await dominioService.getDominios(page);
      dominios.value = response.data.data;
      currentPage.value = response.data.pagination.current_page;
      totalPages.value = response.data.pagination.last_page;
      total.value = response.data.pagination.total;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar dominios';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createDominio = async (data) => {
    loading.value = true;
    error.value = null;
    try {
      return (await dominioService.createDominio(data)).data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear dominio';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateDominio = async (id, data) => {
    loading.value = true;
    error.value = null;
    try {
      return (await dominioService.updateDominio(id, data)).data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar dominio';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteDominio = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await dominioService.deleteDominio(id);
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al eliminar dominio';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Devuelve { disponible, precio, dominio }. 'disponible' puede ser null
  // cuando Porkbun responde algo que no se puede interpretar.
  const verificarDisponibilidad = async (nombre) => {
    return (await dominioService.verificarDisponibilidad(nombre)).data;
  };

  const fetchReporte = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await dominioService.getReporte();
      return response.data.reporte;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al generar el reporte';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const descargarReportePdf = async () => {
    const response = await dominioService.descargarReportePdf();
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-dominios-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return {
    dominios, loading, error, currentPage, totalPages, total,
    fetchDominios, createDominio, updateDominio, deleteDominio,
    verificarDisponibilidad,
    fetchReporte,
    descargarReportePdf,
  };
});
