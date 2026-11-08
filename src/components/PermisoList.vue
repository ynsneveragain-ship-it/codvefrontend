<template>
  <div>
    <h2 class="mb-4 text-2xl font-bold">Gestión de Permisos</h2>

    <div class="mb-4 flex gap-2">
      <button
        @click="openCreateForm"
        class="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        + Agregar Permiso
      </button>
      <button
        @click="showReporte = true"
        class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Reporte
      </button>
    </div>

    <!-- Modal de reporte -->
    <ReportePermisosModal v-if="showReporte" @cancel="showReporte = false" />

    <!-- Modal de crear / editar -->
    <PermisoForm
      v-if="showForm"
      :key="editingPermiso?.id ?? 'new'"
      :permiso="editingPermiso"
      @saved="onSaved"
      @cancel="closeForm"
    />

    <!-- Modal de asignación de roles -->
    <AsignarModal
      v-if="asignarPermiso"
      :titulo="`Roles con el permiso &quot;${asignarPermiso.nombre}&quot;`"
      subtitulo="Marca los roles que tendrán este permiso"
      :items="rolStore.roles"
      :seleccionados="asignarSeleccionados"
      :guardando="guardandoAsignacion"
      :error="asignarError"
      vacio-texto="No hay roles creados todavía. Créalos en la sección Roles."
      @guardar="guardarRoles"
      @cancel="cerrarAsignar"
    />

    <div v-if="permisoStore.error" class="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">
      {{ permisoStore.error }}
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full rounded-lg bg-white shadow">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-bold">Nombre</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Descripción</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Roles</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="permisoStore.loading && permisoStore.permisos.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">Cargando...</td>
          </tr>
          <tr v-else-if="permisoStore.permisos.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">
              No hay permisos registrados
            </td>
          </tr>
          <tr
            v-for="permiso in permisoStore.permisos"
            :key="permiso.id"
            class="border-b hover:bg-gray-50"
          >
            <td class="px-6 py-4 font-medium">{{ permiso.nombre }}</td>
            <td class="px-6 py-4">{{ permiso.descripcion || '-' }}</td>
            <td class="px-6 py-4">
              <span class="rounded bg-gray-100 px-2 py-1 text-sm">{{ permiso.roles_count ?? 0 }}</span>
            </td>
            <td class="px-6 py-4">
              <button @click="abrirAsignar(permiso)" class="mr-3 text-green-700 hover:text-green-900">
                Roles
              </button>
              <button @click="editPermiso(permiso)" class="mr-3 text-blue-600 hover:text-blue-800">
                Editar
              </button>
              <button @click="confirmDelete(permiso)" class="text-red-600 hover:text-red-800">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="mt-4 text-sm text-gray-600">Total: {{ permisoStore.permisos.length }} permisos</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePermisoStore } from '@/stores/permisoStore';
import { useRolStore } from '@/stores/rolStore';
import PermisoForm from './PermisoForm.vue';
import ReportePermisosModal from './ReportePermisosModal.vue';
import AsignarModal from './AsignarModal.vue';

const permisoStore = usePermisoStore();
const rolStore = useRolStore();

const showForm = ref(false);
const showReporte = ref(false);
const editingPermiso = ref(null);

const asignarPermiso = ref(null);
const asignarSeleccionados = ref([]);
const asignarError = ref(null);
const guardandoAsignacion = ref(false);

onMounted(async () => {
  await permisoStore.fetchPermisos();
});

const openCreateForm = () => {
  editingPermiso.value = null;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingPermiso.value = null;
};

const editPermiso = (permiso) => {
  editingPermiso.value = permiso;
  showForm.value = true;
};

const onSaved = async () => {
  closeForm();
  await permisoStore.fetchPermisos();
};

const confirmDelete = async (permiso) => {
  if (!confirm(`¿Eliminar el permiso "${permiso.nombre}"?`)) return;

  try {
    await permisoStore.deletePermiso(permiso.id);
    await permisoStore.fetchPermisos();
  } catch (err) {
    console.error('Error al eliminar permiso:', err);
  }
};

const abrirAsignar = async (permiso) => {
  asignarError.value = null;
  try {
    await rolStore.fetchRoles();
    const detalle = await permisoStore.fetchPermiso(permiso.id);
    asignarSeleccionados.value = (detalle.roles ?? []).map((r) => r.id);
    asignarPermiso.value = permiso;
  } catch (err) {
    console.error('Error al abrir la asignación:', err);
  }
};

const cerrarAsignar = () => {
  asignarPermiso.value = null;
  asignarSeleccionados.value = [];
  asignarError.value = null;
};

const guardarRoles = async (ids) => {
  guardandoAsignacion.value = true;
  asignarError.value = null;

  try {
    await permisoStore.syncRoles(asignarPermiso.value.id, ids);
    cerrarAsignar();
    await permisoStore.fetchPermisos();
  } catch (err) {
    asignarError.value = permisoStore.error || 'Error al guardar los roles';
  } finally {
    guardandoAsignacion.value = false;
  }
};
</script>
