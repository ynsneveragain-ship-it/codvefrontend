<template>
  <div>
    <h2 class="mb-4 text-2xl font-bold">Gestión de Planes</h2>

    <div class="mb-4 flex gap-2">
      <button
        @click="openCreateForm"
        class="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        + Agregar Plan
      </button>
      <button
        @click="showReporte = true"
        class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Reporte
      </button>
    </div>

    <!-- Modal de reporte -->
    <ReportePlanesModal v-if="showReporte" @cancel="showReporte = false" />

    <PlanForm
      v-if="showForm"
      :key="editingPlan?.id ?? 'new'"
      :plan="editingPlan"
      @saved="onSaved"
      @cancel="closeForm"
    />

    <div v-if="planStore.error" class="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">
      {{ planStore.error }}
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full rounded-lg bg-white shadow">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-bold">Nombre</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Vigencia</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Precio</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Características</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Suscripciones</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="planStore.loading && planStore.planes.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">Cargando...</td>
          </tr>
          <tr v-else-if="planStore.planes.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">No hay planes registrados</td>
          </tr>
          <tr v-for="plan in planStore.planes" :key="plan.id" class="border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">{{ plan.nombre }}</td>
            <td class="px-6 py-4">{{ plan.vigencia }} {{ plan.vigencia === 1 ? 'mes' : 'meses' }}</td>
            <td class="px-6 py-4">
              <span v-if="plan.precio_oferta" class="block font-medium text-green-700">
                {{ plan.precio_oferta }}
              </span>
              <span :class="plan.precio_oferta ? 'text-sm text-gray-500 line-through' : ''">
                {{ plan.precio }}
              </span>
            </td>
            <td class="px-6 py-4">
              <ul v-if="plan.caracteristicas.length" class="list-inside list-disc text-sm">
                <li v-for="(c, i) in plan.caracteristicas" :key="i">{{ c }}</li>
              </ul>
              <span v-else class="text-gray-500">-</span>
            </td>
            <td class="px-6 py-4">
              <span class="rounded bg-gray-100 px-2 py-1 text-sm">
                {{ plan.suscripciones_count ?? 0 }}
              </span>
            </td>
            <td class="px-6 py-4">
              <button @click="editPlan(plan)" class="mr-3 text-blue-600 hover:text-blue-800">
                Editar
              </button>
              <button @click="confirmDelete(plan)" class="text-red-600 hover:text-red-800">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="mt-4 text-sm text-gray-600">Total: {{ planStore.planes.length }} planes</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePlanStore } from '@/stores/planStore';
import PlanForm from './PlanForm.vue';
import ReportePlanesModal from './ReportePlanesModal.vue';

const planStore = usePlanStore();
const showForm = ref(false);
const showReporte = ref(false);
const editingPlan = ref(null);

onMounted(async () => {
  await planStore.fetchPlanes();
});

const openCreateForm = () => {
  editingPlan.value = null;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingPlan.value = null;
};

const editPlan = (plan) => {
  editingPlan.value = plan;
  showForm.value = true;
};

const onSaved = async () => {
  closeForm();
  await planStore.fetchPlanes();
};

const confirmDelete = async (plan) => {
  if (!confirm(`¿Eliminar el plan "${plan.nombre}"?`)) return;

  try {
    await planStore.deletePlan(plan.id);
    await planStore.fetchPlanes();
  } catch (err) {
    // El backend devuelve 409 si el plan tiene suscripciones
    alert(planStore.error || 'No se pudo eliminar el plan');
  }
};
</script>
