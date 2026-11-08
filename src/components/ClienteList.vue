<template>
  <div>
    <h2 class="mb-4 text-2xl font-bold">Gestión de Clientes</h2>

    <div class="mb-4 flex gap-2">
      <button
        @click="openCreateForm"
        class="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        + Agregar Cliente
      </button>
      <button
        @click="showReporte = true"
        class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Reporte
      </button>
    </div>

    <!-- Modal de reporte -->
    <ReporteClientesModal v-if="showReporte" @cancel="showReporte = false" />

    <ClienteForm
      v-if="showForm"
      :key="editingCliente?.id ?? 'new'"
      :cliente="editingCliente"
      @saved="onSaved"
      @cancel="closeForm"
    />

    <div v-if="clienteStore.error" class="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">
      {{ clienteStore.error }}
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full rounded-lg bg-white shadow">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-bold">Nombre</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Razón Social</th>
            <th class="px-6 py-3 text-left text-sm font-bold">CI / NIT</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Contacto</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Suscripciones</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="clienteStore.loading && clienteStore.clientes.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">Cargando...</td>
          </tr>
          <tr v-else-if="clienteStore.clientes.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
              No hay clientes registrados
            </td>
          </tr>
          <tr
            v-for="cliente in clienteStore.clientes"
            :key="cliente.id"
            class="border-b hover:bg-gray-50"
          >
            <td class="px-6 py-4 font-medium">{{ cliente.nombre }}</td>
            <td class="px-6 py-4">{{ cliente.razon_social || '-' }}</td>
            <td class="px-6 py-4">{{ cliente.numero_documento }}</td>
            <td class="px-6 py-4 text-sm">
              <span class="block">{{ cliente.correo || '-' }}</span>
              <span class="block text-gray-500">{{ cliente.telefono || '-' }}</span>
            </td>
            <td class="px-6 py-4">
              <span class="rounded bg-gray-100 px-2 py-1 text-sm">
                {{ cliente.suscripciones_count ?? 0 }}
              </span>
            </td>
            <td class="px-6 py-4">
              <button @click="editCliente(cliente)" class="mr-3 text-blue-600 hover:text-blue-800">
                Editar
              </button>
              <button @click="confirmDelete(cliente)" class="text-red-600 hover:text-red-800">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-6 flex items-center justify-between">
      <p class="text-sm text-gray-600">Total: {{ clienteStore.total }} clientes</p>
      <div class="space-x-2">
        <button
          @click="previousPage"
          :disabled="clienteStore.currentPage === 1"
          class="rounded bg-gray-300 px-3 py-1 disabled:bg-gray-100"
        >
          Anterior
        </button>
        <span class="px-3 py-1">
          Página {{ clienteStore.currentPage }} de {{ clienteStore.totalPages }}
        </span>
        <button
          @click="nextPage"
          :disabled="clienteStore.currentPage === clienteStore.totalPages"
          class="rounded bg-gray-300 px-3 py-1 disabled:bg-gray-100"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useClienteStore } from '@/stores/clienteStore';
import ClienteForm from './ClienteForm.vue';
import ReporteClientesModal from './ReporteClientesModal.vue';

const clienteStore = useClienteStore();
const showForm = ref(false);
const showReporte = ref(false);
const editingCliente = ref(null);

onMounted(async () => {
  await clienteStore.fetchClientes();
});

const openCreateForm = () => {
  editingCliente.value = null;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingCliente.value = null;
};

const editCliente = (cliente) => {
  editingCliente.value = cliente;
  showForm.value = true;
};

const onSaved = async () => {
  closeForm();
  await clienteStore.fetchClientes(clienteStore.currentPage);
};

const confirmDelete = async (cliente) => {
  if (!confirm(`¿Eliminar el cliente "${cliente.nombre}"?`)) return;

  try {
    await clienteStore.deleteCliente(cliente.id);
    await clienteStore.fetchClientes(clienteStore.currentPage);
  } catch (err) {
    // El backend devuelve 409 si el cliente tiene suscripciones o pagos
    alert(clienteStore.error || 'No se pudo eliminar el cliente');
  }
};

const previousPage = async () => {
  if (clienteStore.currentPage > 1) await clienteStore.fetchClientes(clienteStore.currentPage - 1);
};

const nextPage = async () => {
  if (clienteStore.currentPage < clienteStore.totalPages) {
    await clienteStore.fetchClientes(clienteStore.currentPage + 1);
  }
};
</script>
