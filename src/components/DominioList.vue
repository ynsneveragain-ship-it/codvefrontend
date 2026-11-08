<template>
  <div>
    <h2 class="mb-4 text-2xl font-bold">Gestión de Dominios</h2>

    <div class="mb-4 flex gap-2">
      <button
        @click="openCreateForm"
        class="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        + Agregar Dominio
      </button>
      <button
        @click="showReporte = true"
        class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Reporte
      </button>
    </div>

    <!-- Modal de reporte -->
    <ReporteDominiosModal v-if="showReporte" @cancel="showReporte = false" />

    <DominioForm
      v-if="showForm"
      :key="editingDominio?.id ?? 'new'"
      :dominio="editingDominio"
      @saved="onSaved"
      @cancel="closeForm"
    />

    <div v-if="dominioStore.error" class="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">
      {{ dominioStore.error }}
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full rounded-lg bg-white shadow">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-bold">Dominio</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Proveedor</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Suscripción</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Precios</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Vigencia</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Estado</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="dominioStore.loading && dominioStore.dominios.length === 0">
            <td colspan="7" class="px-6 py-4 text-center text-gray-500">Cargando...</td>
          </tr>
          <tr v-else-if="dominioStore.dominios.length === 0">
            <td colspan="7" class="px-6 py-4 text-center text-gray-500">
              No hay dominios registrados
            </td>
          </tr>
          <tr
            v-for="dominio in dominioStore.dominios"
            :key="dominio.id"
            class="border-b hover:bg-gray-50"
          >
            <td class="px-6 py-4 font-medium">{{ dominio.nombre }}</td>
            <td class="px-6 py-4">{{ dominio.proveedor }}</td>
            <td class="px-6 py-4 text-sm">
              <span class="block">#{{ dominio.suscripcion_id }}</span>
              <span class="block text-gray-500">
                {{ dominio.suscripcion?.cliente || '-' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm">
              <span class="block">Cliente: {{ dominio.precio }}</span>
              <span class="block text-gray-500">Costo: {{ dominio.precio_real }}</span>
            </td>
            <td class="px-6 py-4 text-sm">
              <span class="block">{{ dominio.fecha_inicio }}</span>
              <span class="block text-gray-500">{{ dominio.fecha_fin }}</span>
            </td>
            <td class="px-6 py-4">
              <span
                :class="
                  estaVigente(dominio)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                "
                class="rounded px-2 py-1 text-xs"
              >
                {{ estaVigente(dominio) ? 'Vigente' : 'Vencido' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <button @click="editDominio(dominio)" class="mr-3 text-blue-600 hover:text-blue-800">
                Editar
              </button>
              <button @click="confirmDelete(dominio)" class="text-red-600 hover:text-red-800">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-6 flex items-center justify-between">
      <p class="text-sm text-gray-600">Total: {{ dominioStore.total }} dominios</p>
      <div class="space-x-2">
        <button
          @click="previousPage"
          :disabled="dominioStore.currentPage === 1"
          class="rounded bg-gray-300 px-3 py-1 disabled:bg-gray-100"
        >
          Anterior
        </button>
        <span class="px-3 py-1">
          Página {{ dominioStore.currentPage }} de {{ dominioStore.totalPages }}
        </span>
        <button
          @click="nextPage"
          :disabled="dominioStore.currentPage === dominioStore.totalPages"
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
import { useDominioStore } from '@/stores/dominioStore';
import DominioForm from './DominioForm.vue';
import ReporteDominiosModal from './ReporteDominiosModal.vue';

const dominioStore = useDominioStore();
const showForm = ref(false);
const showReporte = ref(false);
const editingDominio = ref(null);

// fecha_fin llega como 'YYYY-MM-DD'; se compara con la fecha de hoy en el mismo
// formato para no depender de husos horarios al construir un Date
const hoyIso = new Date().toISOString().slice(0, 10);
const estaVigente = (dominio) => !!dominio.fecha_fin && dominio.fecha_fin >= hoyIso;

onMounted(async () => {
  await dominioStore.fetchDominios();
});

const openCreateForm = () => {
  editingDominio.value = null;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingDominio.value = null;
};

const editDominio = (dominio) => {
  editingDominio.value = dominio;
  showForm.value = true;
};

const onSaved = async () => {
  closeForm();
  await dominioStore.fetchDominios(dominioStore.currentPage);
};

const confirmDelete = async (dominio) => {
  if (!confirm(`¿Eliminar el dominio "${dominio.nombre}"?`)) return;

  try {
    await dominioStore.deleteDominio(dominio.id);
    await dominioStore.fetchDominios(dominioStore.currentPage);
  } catch (err) {
    alert(dominioStore.error || 'No se pudo eliminar el dominio');
  }
};

const previousPage = async () => {
  if (dominioStore.currentPage > 1) await dominioStore.fetchDominios(dominioStore.currentPage - 1);
};

const nextPage = async () => {
  if (dominioStore.currentPage < dominioStore.totalPages) {
    await dominioStore.fetchDominios(dominioStore.currentPage + 1);
  }
};
</script>
