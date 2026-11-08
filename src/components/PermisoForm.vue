<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Fondo -->
      <div class="absolute inset-0 bg-black/50" @click="emit('cancel')"></div>

      <!-- Dialogo -->
      <div
        class="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="permiso-form-title"
      >
        <form @submit.prevent="handleSubmit" autocomplete="off" class="flex min-h-0 flex-col">
          <!-- Encabezado -->
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 id="permiso-form-title" class="text-lg font-bold">
              {{ editingId ? 'Editar Permiso' : 'Nuevo Permiso' }}
            </h3>
            <button
              type="button"
              @click="emit('cancel')"
              aria-label="Cerrar"
              class="text-2xl leading-none text-gray-400 hover:text-gray-700"
            >
              &times;
            </button>
          </div>

          <!-- Cuerpo -->
          <div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <div>
              <label class="mb-1 block text-sm font-bold text-gray-700">Nombre *</label>
              <input
                v-model="formData.nombre"
                type="text"
                autocomplete="off"
                placeholder="Ej: usuarios.crear"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-bold text-gray-700">Descripción</label>
              <textarea
                v-model="formData.descripcion"
                rows="3"
                autocomplete="off"
                placeholder="Qué habilita este permiso"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              ></textarea>
            </div>

            <div v-if="error" class="rounded-lg bg-red-100 p-4 text-sm text-red-700">
              {{ error }}
            </div>
          </div>

          <!-- Pie -->
          <div class="flex justify-end space-x-2 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              @click="emit('cancel')"
              class="rounded-lg bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
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
import { usePermisoStore } from '@/stores/permisoStore';

const props = defineProps({
  permiso: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['saved', 'cancel']);

const permisoStore = usePermisoStore();

const editingId = ref(props.permiso?.id ?? null);
const loading = ref(false);
const error = ref(null);

const formData = reactive({
  nombre: props.permiso?.nombre ?? '',
  descripcion: props.permiso?.descripcion ?? '',
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
      await permisoStore.updatePermiso(editingId.value, formData);
    } else {
      await permisoStore.createPermiso(formData);
    }
    emit('saved');
  } catch (err) {
    error.value = permisoStore.error || 'Error al guardar permiso';
  } finally {
    loading.value = false;
  }
};
</script>
