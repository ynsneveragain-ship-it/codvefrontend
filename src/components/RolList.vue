<template>
  <div>
    <h2 class="mb-4 text-2xl font-bold">Gestión de Roles</h2>

    <div class="mb-4 flex gap-2">
      <button
        @click="openCreateForm"
        class="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        + Agregar Rol
      </button>
      <button
        @click="showReporte = true"
        class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Reporte
      </button>
    </div>

    <!-- Modal de reporte -->
    <ReporteRolesModal v-if="showReporte" @cancel="showReporte = false" />

    <!-- Modal de crear / editar -->
    <RolForm
      v-if="showForm"
      :key="editingRol?.id ?? 'new'"
      :rol="editingRol"
      @saved="onSaved"
      @cancel="closeForm"
    />

    <!-- Modal de asignación de permisos -->
    <AsignarModal
      v-if="asignarRol"
      :titulo="`Permisos del rol &quot;${asignarRol.nombre}&quot;`"
      subtitulo="Marca los permisos que tendrá este rol"
      :items="permisoStore.permisos"
      :seleccionados="asignarSeleccionados"
      :guardando="guardandoAsignacion"
      :error="asignarError"
      vacio-texto="No hay permisos creados todavía. Créalos en la sección Permisos."
      @guardar="guardarPermisos"
      @cancel="cerrarAsignar"
    />

    <div v-if="rolStore.error" class="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">
      {{ rolStore.error }}
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full rounded-lg bg-white shadow">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-bold">Nombre</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Descripción</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Permisos</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="rolStore.loading && rolStore.roles.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">Cargando...</td>
          </tr>
          <tr v-else-if="rolStore.roles.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">No hay roles registrados</td>
          </tr>
          <tr v-for="rol in rolStore.roles" :key="rol.id" class="border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">{{ rol.nombre }}</td>
            <td class="px-6 py-4">{{ rol.descripcion || '-' }}</td>
            <td class="px-6 py-4">
              <span class="rounded bg-gray-100 px-2 py-1 text-sm">{{ rol.permisos_count ?? 0 }}</span>
            </td>
            <td class="px-6 py-4">
              <button @click="abrirAsignar(rol)" class="mr-3 text-green-700 hover:text-green-900">
                Permisos
              </button>
              <button @click="editRol(rol)" class="mr-3 text-blue-600 hover:text-blue-800">
                Editar
              </button>
              <button @click="confirmDelete(rol)" class="text-red-600 hover:text-red-800">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="mt-4 text-sm text-gray-600">Total: {{ rolStore.roles.length }} roles</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRolStore } from '@/stores/rolStore';
import { usePermisoStore } from '@/stores/permisoStore';
import RolForm from './RolForm.vue';
import ReporteRolesModal from './ReporteRolesModal.vue';
import AsignarModal from './AsignarModal.vue';

const rolStore = useRolStore();
const permisoStore = usePermisoStore();

const showForm = ref(false);
const showReporte = ref(false);
const editingRol = ref(null);

const asignarRol = ref(null);
const asignarSeleccionados = ref([]);
const asignarError = ref(null);
const guardandoAsignacion = ref(false);

onMounted(async () => {
  await rolStore.fetchRoles();
});

const openCreateForm = () => {
  editingRol.value = null;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingRol.value = null;
};

const editRol = (rol) => {
  editingRol.value = rol;
  showForm.value = true;
};

const onSaved = async () => {
  closeForm();
  await rolStore.fetchRoles();
};

const confirmDelete = async (rol) => {
  // Al borrar un rol, los usuarios que lo tenian quedan sin rol (nullOnDelete)
  const msg = `¿Eliminar el rol "${rol.nombre}"? Los usuarios que lo tengan asignado quedarán sin rol.`;
  if (!confirm(msg)) return;

  try {
    await rolStore.deleteRol(rol.id);
    await rolStore.fetchRoles();
  } catch (err) {
    console.error('Error al eliminar rol:', err);
  }
};

const abrirAsignar = async (rol) => {
  asignarError.value = null;
  try {
    await permisoStore.fetchPermisos();
    const detalle = await rolStore.fetchRol(rol.id);
    asignarSeleccionados.value = (detalle.permisos ?? []).map((p) => p.id);
    asignarRol.value = rol;
  } catch (err) {
    console.error('Error al abrir la asignación:', err);
  }
};

const cerrarAsignar = () => {
  asignarRol.value = null;
  asignarSeleccionados.value = [];
  asignarError.value = null;
};

const guardarPermisos = async (ids) => {
  guardandoAsignacion.value = true;
  asignarError.value = null;

  try {
    await rolStore.syncPermisos(asignarRol.value.id, ids);
    cerrarAsignar();
    await rolStore.fetchRoles();
  } catch (err) {
    asignarError.value = rolStore.error || 'Error al guardar los permisos';
  } finally {
    guardandoAsignacion.value = false;
  }
};
</script>
