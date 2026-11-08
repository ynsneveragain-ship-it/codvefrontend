import { defineStore } from 'pinia';
import { ref } from 'vue';
import clienteService from '@/services/clienteService';

export const useClienteStore = defineStore('cliente', () => {
  const clientes = ref([]);
  // Lista completa para desplegables; aparte para no pisar la pagina que se
  // esta viendo en la tabla
  const todos = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const total = ref(0);

  const fetchClientes = async (page = 1) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await clienteService.getClientes(page);
      clientes.value = response.data.data;
      currentPage.value = response.data.pagination.current_page;
      totalPages.value = response.data.pagination.last_page;
      total.value = response.data.pagination.total;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar clientes';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createCliente = async (data) => {
    loading.value = true;
    error.value = null;
    try {
      return (await clienteService.createCliente(data)).data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear cliente';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCliente = async (id, data) => {
    loading.value = true;
    error.value = null;
    try {
      return (await clienteService.updateCliente(id, data)).data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar cliente';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCliente = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await clienteService.deleteCliente(id);
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al eliminar cliente';
      throw err;
    } finally {
      loading.value = false;
    }
  };


  const fetchReporte = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await clienteService.getReporte();
      return response.data.reporte;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al generar el reporte';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const descargarReportePdf = async () => {
    const response = await clienteService.descargarReportePdf();
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-clientes-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const fetchTodos = async () => {
    const response = await clienteService.getTodos();
    todos.value = response.data.data;
    return todos.value;
  };

  return {
    clientes, todos, loading, error, currentPage, totalPages, total,
    fetchClientes, fetchTodos, createCliente, updateCliente, deleteCliente,
      fetchReporte,
    descargarReportePdf,
};
});
