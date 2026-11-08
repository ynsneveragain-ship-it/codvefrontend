<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Fondo -->
      <div class="absolute inset-0 bg-primario-oscuro/60 backdrop-blur-[2px]" @click="emit('cancel')"></div>

      <!-- Dialogo -->
      <div
        class="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
      >
        <form @submit.prevent="handleSubmit" autocomplete="off" class="flex min-h-0 flex-col">
          <!-- Encabezado -->
          <div class="flex items-center justify-between border-b border-borde px-6 py-4">
            <h3 id="user-form-title" class="font-titulo text-lg font-bold text-primario">
              {{ editingId ? 'Editar Usuario' : 'Nuevo Usuario' }}
            </h3>
            <button
              type="button"
              @click="emit('cancel')"
              aria-label="Cerrar"
              class="text-2xl leading-none text-texto-tenue transition-colors hover:text-primario"
            >
              &times;
            </button>
          </div>

          <!-- Cuerpo -->
          <div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-texto">Primer Nombre *</label>
                <input
                  v-model="formData.primer_nombre"
                  type="text"
                  class="w-full rounded-lg border border-borde px-3 py-2.5 transition-colors focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/15"
                  required
                />
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-semibold text-texto">Segundo Nombre</label>
                <input
                  v-model="formData.segundo_nombre"
                  type="text"
                  class="w-full rounded-lg border border-borde px-3 py-2.5 transition-colors focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/15"
                />
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-semibold text-texto">Apellido Paterno *</label>
                <input
                  v-model="formData.apellido_paterno"
                  type="text"
                  class="w-full rounded-lg border border-borde px-3 py-2.5 transition-colors focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/15"
                  required
                />
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-semibold text-texto">Apellido Materno</label>
                <input
                  v-model="formData.apellido_materno"
                  type="text"
                  class="w-full rounded-lg border border-borde px-3 py-2.5 transition-colors focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/15"
                />
              </div>

              <div class="col-span-2">
                <label class="mb-1.5 block text-sm font-semibold text-texto">Correo *</label>
                <input
                  v-model="formData.correo"
                  type="email"
                  autocomplete="off"
                  class="w-full rounded-lg border border-borde px-3 py-2.5 transition-colors focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/15"
                  required
                />
              </div>

              <div class="col-span-2">
                <label class="mb-1.5 block text-sm font-semibold text-texto">Teléfono</label>
                <input
                  v-model="formData.telefono"
                  type="text"
                  autocomplete="off"
                  class="w-full rounded-lg border border-borde px-3 py-2.5 transition-colors focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/15"
                />
              </div>

              <div class="col-span-2">
                <label class="mb-1.5 block text-sm font-semibold text-texto">Rol</label>
                <select
                  v-model="formData.rol_id"
                  class="w-full rounded-lg border border-borde px-3 py-2.5 transition-colors focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/15"
                >
                  <option :value="null">Sin rol</option>
                  <option v-for="role in roles" :key="role.id" :value="role.id">
                    {{ role.nombre }}
                  </option>
                </select>
              </div>

              <div v-if="!editingId" class="col-span-2">
                <label class="mb-1.5 block text-sm font-semibold text-texto">Contraseña *</label>
                <input
                  v-model="formData.password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  autocomplete="new-password"
                  class="w-full rounded-lg border border-borde px-3 py-2.5 transition-colors focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/15"
                  required
                />
              </div>

              <div v-if="!editingId" class="col-span-2">
                <label class="mb-1.5 block text-sm font-semibold text-texto">Confirmar Contraseña *</label>
                <input
                  v-model="formData.password_confirmation"
                  type="password"
                  autocomplete="new-password"
                  class="w-full rounded-lg border border-borde px-3 py-2.5 transition-colors focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/15"
                  required
                />
              </div>

              <div class="col-span-2">
                <label class="flex items-center">
                  <input v-model="formData.activo" type="checkbox" class="rounded" />
                  <span class="ml-2 text-sm font-bold text-gray-700">Usuario Activo</span>
                </label>
              </div>
            </div>

            <div v-if="error" class="mt-4 rounded-lg border border-peligro/20 bg-peligro-tenue p-4 text-sm text-peligro-oscuro">
              {{ error }}
            </div>
          </div>

          <!-- Pie -->
          <div class="flex justify-end gap-2 border-t border-borde bg-primario-tenue/40 px-6 py-4">
            <button
              type="button"
              @click="emit('cancel')"
              class="rounded-lg border border-borde bg-superficie px-4 py-2.5 text-sm font-semibold text-texto-suave transition-colors hover:bg-primario-tenue"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="rounded-lg bg-primario px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primario-claro disabled:bg-texto-tenue"
            >
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '@/stores/userStore';

const props = defineProps({
  roles: {
    type: Array,
    required: true,
  },
  user: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['user-saved', 'cancel']);

const userStore = useUserStore();

const editingId = ref(props.user?.id ?? null);
const loading = ref(false);
const error = ref(null);

const formData = reactive({
  primer_nombre: props.user?.primer_nombre ?? '',
  segundo_nombre: props.user?.segundo_nombre ?? '',
  apellido_paterno: props.user?.apellido_paterno ?? '',
  apellido_materno: props.user?.apellido_materno ?? '',
  correo: props.user?.correo ?? '',
  password: '',
  password_confirmation: '',
  telefono: props.user?.telefono ?? '',
  rol_id: props.user?.rol_id ?? null,
  activo: props.user?.activo ?? true,
});

const onKeydown = (e) => {
  if (e.key === 'Escape') emit('cancel');
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  // Evita que la pagina de atras se desplace mientras el modal esta abierto
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    if (editingId.value) {
      await userStore.updateUser(editingId.value, formData);
    } else {
      await userStore.createUser(formData);
    }
    emit('user-saved');
  } catch (err) {
    error.value = userStore.error || 'Error al guardar usuario';
  } finally {
    loading.value = false;
  }
};
</script>
