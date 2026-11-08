<template>
  <Layout>
    <div class="overflow-hidden rounded-lg bg-white shadow">
      <!-- Cabecera con las iniciales del usuario -->
      <div class="flex items-center gap-5 bg-primario px-6 py-6 text-white">
        <div
          class="font-titulo flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 text-2xl font-bold"
        >
          {{ iniciales }}
        </div>

        <div class="min-w-0">
          <h1 class="font-titulo truncate text-2xl font-bold text-white">{{ nombreCompleto }}</h1>
          <p class="truncate text-sm text-white/80">{{ usuario?.correo || 'Sin correo' }}</p>
        </div>

        <span
          class="ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-bold"
          :class="usuario?.activo ? 'bg-acento text-white' : 'bg-peligro text-white'"
        >
          {{ usuario?.activo ? 'Activo' : 'Inactivo' }}
        </span>
      </div>

      <div class="px-6 py-6">
        <h2 class="font-titulo mb-4 text-lg font-bold">Datos personales</h2>

        <p v-if="authStore.loading && !usuario" class="text-sm text-texto-suave">Cargando...</p>

        <p v-else-if="error" class="rounded-lg bg-peligro-tenue p-4 text-sm text-peligro-oscuro">
          {{ error }}
        </p>

        <div v-else class="grid grid-cols-2 gap-x-8">
          <div>
            <dl>
              <div class="border-b border-borde py-3">
                <dt class="text-xs font-bold uppercase text-texto-tenue">Primer nombre</dt>
                <dd class="mt-0.5 font-medium">{{ usuario?.primer_nombre || '—' }}</dd>
              </div>
              <div class="border-b border-borde py-3">
                <dt class="text-xs font-bold uppercase text-texto-tenue">Segundo nombre</dt>
                <dd class="mt-0.5 font-medium">{{ usuario?.segundo_nombre || '—' }}</dd>
              </div>
              <div class="border-b border-borde py-3">
                <dt class="text-xs font-bold uppercase text-texto-tenue">Apellido paterno</dt>
                <dd class="mt-0.5 font-medium">{{ usuario?.apellido_paterno || '—' }}</dd>
              </div>
              <div class="border-b border-borde py-3">
                <dt class="text-xs font-bold uppercase text-texto-tenue">Apellido materno</dt>
                <dd class="mt-0.5 font-medium">{{ usuario?.apellido_materno || '—' }}</dd>
              </div>
            </dl>
          </div>

          <div>
            <dl>
              <div class="border-b border-borde py-3">
                <dt class="text-xs font-bold uppercase text-texto-tenue">Correo</dt>
                <dd class="mt-0.5 font-medium">{{ usuario?.correo || '—' }}</dd>
              </div>
              <div class="border-b border-borde py-3">
                <dt class="text-xs font-bold uppercase text-texto-tenue">Teléfono</dt>
                <dd class="mt-0.5 font-medium">{{ usuario?.telefono || '—' }}</dd>
              </div>
              <div class="border-b border-borde py-3">
                <dt class="text-xs font-bold uppercase text-texto-tenue">Rol</dt>
                <dd class="mt-0.5 font-medium">{{ usuario?.rol?.nombre || 'Sin rol' }}</dd>
              </div>
              <div class="border-b border-borde py-3">
                <dt class="text-xs font-bold uppercase text-texto-tenue">Último acceso</dt>
                <dd class="mt-0.5 font-medium">{{ formatFechaHora(usuario?.ultimo_login) }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <p class="mt-5 text-xs text-texto-tenue">
          Cuenta creada el {{ formatFecha(usuario?.created_at) }} · última modificación el
          {{ formatFecha(usuario?.updated_at) }}
        </p>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import Layout from '@/components/Layout.vue';

const authStore = useAuthStore();

const error = ref(null);

const usuario = computed(() => authStore.user);

const nombreCompleto = computed(() => {
  const u = usuario.value;
  if (!u) return '';
  return [u.primer_nombre, u.segundo_nombre, u.apellido_paterno, u.apellido_materno]
    .filter(Boolean)
    .join(' ');
});

const iniciales = computed(() => {
  const u = usuario.value;
  if (!u) return '';
  return ((u.primer_nombre?.[0] ?? '') + (u.apellido_paterno?.[0] ?? '')).toUpperCase();
});

onMounted(async () => {
  // Se repregunta a /auth/me: lo de localStorage puede estar desactualizado
  try {
    await authStore.fetchMe();
  } catch {
    // Si falla, se sigue mostrando lo que ya hay en el store
    if (!usuario.value) error.value = authStore.error || 'Error al cargar el perfil';
  }
});

const formatFecha = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatFechaHora = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>
