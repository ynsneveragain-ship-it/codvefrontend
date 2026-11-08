<template>
  <div>
    <h2 class="font-titulo mb-1 text-2xl font-bold text-primario">Gestión de Usuarios</h2>
    <p class="mb-5 text-sm text-texto-suave">Administra las cuentas que acceden al sistema</p>

    <!-- Acciones -->
    <div class="mb-5 flex gap-2">
      <button
        @click="openCreateForm"
        class="rounded-lg bg-acento px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-acento-oscuro"
      >
        + Agregar Usuario
      </button>
      <button
        @click="showReporte = true"
        class="rounded-lg bg-primario px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primario-claro"
      >
        Reporte
      </button>
    </div>

    <!-- Modal de reporte -->
    <ReporteUsuariosModal v-if="showReporte" @cancel="showReporte = false" />

    <!-- Modal de crear / editar -->
    <UserForm
      v-if="showForm"
      :key="editingUser?.id ?? 'new'"
      :roles="rolStore.roles"
      :user="editingUser"
      @user-saved="onUserSaved"
      @cancel="closeForm"
    />

    <!-- Tabla de usuarios -->
    <div class="overflow-hidden rounded-lg border border-borde bg-superficie shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-primario-tenue">
            <tr>
              <th class="font-titulo px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-primario">Nombre</th>
              <th class="font-titulo px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-primario">Correo</th>
              <th class="font-titulo px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-primario">Teléfono</th>
              <th class="font-titulo px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-primario">Rol</th>
              <th class="font-titulo px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-primario">Estado</th>
              <th class="font-titulo px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-primario">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-borde">
            <tr v-for="user in userStore.users" :key="user.id" class="transition-colors hover:bg-primario-tenue/50">
              <td class="px-6 py-4 font-medium">
                {{ user.primer_nombre }} {{ user.apellido_paterno }}
              </td>
              <td class="px-6 py-4 text-texto-suave">{{ user.correo }}</td>
              <td class="px-6 py-4 text-texto-suave">{{ user.telefono || '-' }}</td>
              <td class="px-6 py-4">{{ user.rol?.nombre || "Sin rol" }}</td>
              <td class="px-6 py-4">
                <span
                  :class="user.activo ? 'bg-acento-tenue text-acento-oscuro' : 'bg-peligro-tenue text-peligro-oscuro'"
                  class="rounded-full px-2.5 py-1 text-xs font-semibold"
                >
                  {{ user.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <button
                  @click="editUser(user)"
                  class="mr-4 font-medium text-primario hover:text-primario-claro hover:underline"
                >
                  Editar
                </button>
                <button
                  @click="deleteUserConfirm(user.id)"
                  class="font-medium text-peligro hover:text-peligro-oscuro hover:underline"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Paginación -->
    <div class="mt-5 flex items-center justify-between">
      <p class="text-sm text-texto-suave">Total: {{ userStore.totalUsers }} usuarios</p>
      <div class="flex items-center gap-2">
        <button
          @click="previousPage"
          :disabled="userStore.currentPage === 1"
          class="rounded-lg border border-borde bg-superficie px-3 py-1.5 text-sm font-medium text-primario transition-colors hover:bg-primario-tenue disabled:cursor-not-allowed disabled:text-texto-tenue disabled:hover:bg-superficie"
        >
          Anterior
        </button>
        <span class="px-2 text-sm text-texto-suave">Página {{ userStore.currentPage }} de {{ userStore.totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="userStore.currentPage === userStore.totalPages"
          class="rounded-lg border border-borde bg-superficie px-3 py-1.5 text-sm font-medium text-primario transition-colors hover:bg-primario-tenue disabled:cursor-not-allowed disabled:text-texto-tenue disabled:hover:bg-superficie"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRolStore } from '@/stores/rolStore';
import UserForm from './UserForm.vue';
import ReporteUsuariosModal from './ReporteUsuariosModal.vue';

const userStore = useUserStore();
const rolStore = useRolStore();
const showForm = ref(false);
const showReporte = ref(false);
const editingUser = ref(null);

onMounted(async () => {
  await userStore.fetchUsers();
  await rolStore.fetchRoles();
});

const openCreateForm = () => {
  editingUser.value = null;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingUser.value = null;
};

const editUser = (user) => {
  editingUser.value = user;
  showForm.value = true;
};

const deleteUserConfirm = async (userId) => {
  if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
    try {
      await userStore.deleteUser(userId);
      await userStore.fetchUsers();
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  }
};

const onUserSaved = async () => {
  closeForm();
  await userStore.fetchUsers(userStore.currentPage);
};

const previousPage = async () => {
  if (userStore.currentPage > 1) {
    await userStore.fetchUsers(userStore.currentPage - 1);
  }
};

const nextPage = async () => {
  if (userStore.currentPage < userStore.totalPages) {
    await userStore.fetchUsers(userStore.currentPage + 1);
  }
};
</script>
