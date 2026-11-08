<template>
  <nav class="bg-primario text-white shadow-md">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <router-link to="/" class="font-titulo text-xl font-extrabold tracking-tight text-white">
        Clientes <span class="text-acento">&amp;</span> Suscripciones
      </router-link>

      <div v-if="authStore.isAuthenticated" class="flex items-center gap-5">
        <!-- Pestañas: dos letras; el nombre completo aparece al pasar el ratón -->
        <div class="flex items-center gap-1.5">
          <div v-for="tab in tabsVisibles" :key="tab.path" class="group relative">
            <router-link
              :to="tab.path"
              :aria-label="tab.nombre"
              class="font-titulo flex h-10 w-12 items-center justify-center rounded-lg text-sm font-bold transition-colors"
              :class="
                route.path === tab.path
                  ? 'bg-white text-primario shadow-sm'
                  : 'text-white/70 hover:bg-primario-claro hover:text-white'
              "
            >
              {{ tab.nombre.slice(0, 2) }}
            </router-link>

            <span
              role="tooltip"
              class="font-cuerpo pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-primario-oscuro px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
            >
              {{ tab.nombre }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-3 border-l border-white/20 pl-5">
          <!-- El nombre es el acceso al perfil -->
          <router-link
            to="/perfil"
            aria-label="Perfil"
            class="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors"
            :class="
              route.path === '/perfil'
                ? 'bg-white font-bold text-primario'
                : 'text-white/80 hover:bg-primario-claro hover:text-white'
            "
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
            </svg>
            {{ authStore.user?.primer_nombre }}
          </router-link>
          <button
            @click="handleLogout"
            class="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-peligro"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const tabs = [
  { nombre: 'Dashboard', path: '/dashboard' },
  { nombre: 'Usuarios', path: '/users' },
  { nombre: 'Roles', path: '/roles' },
  { nombre: 'Permisos', path: '/permisos' },
  { nombre: 'Clientes', path: '/clientes' },
  { nombre: 'Planes', path: '/planes' },
  { nombre: 'Dominios', path: '/dominios' },
  // "Su" y "Pa": tampoco chocan con las de dos letras que ya habia
  { nombre: 'Suscripciones', path: '/suscripciones' },
  { nombre: 'Pagos', path: '/pagos' },
  // "Re": no choca con Roles (Ro) ni con Permisos (Pe)
  { nombre: 'Reportes', path: '/reportes' },
];

// El rol visita solo ve la pestaña del dashboard
const tabsVisibles = computed(() =>
  authStore.esVisita ? tabs.filter((t) => t.path === '/dashboard') : tabs,
);

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
