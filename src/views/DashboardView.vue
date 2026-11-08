<template>
  <Layout>
    <div class="bg-white p-6 rounded-lg shadow">
      <div class="flex items-start justify-between mb-4">
        <h1 class="text-3xl font-bold">Bienvenido, {{ authStore.user?.primer_nombre }}</h1>

        <div class="flex items-center gap-3">
          <!-- Verde / amarillo / rojo segun lo que este por caducar. Abre el
               apartado de abajo, no un emergente. -->
          <CampanaVencimientos
            :abierto="mostrarVencimientos"
            @toggle="mostrarVencimientos = !mostrarVencimientos"
          />

          <!-- El rol visita no registra ventas. El backend lo rechaza igualmente
               con un 403, esto solo evita enseñarle un botón que no funciona. -->
          <button
            v-if="!authStore.esVisita"
            @click="mostrarComprar = true"
            class="rounded-lg bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
          >
            Comprar
          </button>
        </div>
      </div>

      <!-- Resultado de la última venta registrada -->
      <div
        v-if="ventaRealizada"
        class="mb-4 flex items-start justify-between gap-4 rounded-lg border border-green-300 bg-green-50 p-4"
      >
        <div class="text-sm text-green-900">
          <p class="font-bold">Venta registrada</p>
          <p class="mt-1">
            Suscripción #{{ ventaRealizada.suscripcion.id }} ·
            {{ ventaRealizada.cliente.nombre }}
            <span class="text-green-700">
              ({{ ventaRealizada.cliente_nuevo ? 'cliente nuevo' : 'ficha existente' }})
            </span>
            · {{ ventaRealizada.suscripcion.tipo_servicio }}
            <span v-if="ventaRealizada.dominio"> · {{ ventaRealizada.dominio.nombre }}</span>
          </p>
          <p class="mt-1">
            Suscripción <strong>{{ ventaRealizada.suscripcion.estado }}</strong> · pago
            <strong>{{ ventaRealizada.pago.estado }}</strong> de
            {{ ventaRealizada.pago.monto }} ({{ ventaRealizada.pago.metodo_pago }})
          </p>
          <p v-if="ventaRealizada.dominio" class="mt-1 text-xs text-green-700">
            El registro del dominio en Porkbun sigue siendo un trámite manual.
          </p>
        </div>
        <button
          @click="cerrarAvisoVenta"
          aria-label="Cerrar aviso"
          class="text-xl leading-none text-green-700 hover:text-green-900"
        >
          &times;
        </button>
      </div>

      <!-- Apartado de vencimientos: ocupa su sitio y empuja las tarjetas -->
      <PanelVencimientos
        v-if="mostrarVencimientos"
        @cerrar="mostrarVencimientos = false"
      />

      <div class="grid grid-cols-3 gap-6 mt-6">
        <div class="bg-blue-50 p-6 rounded-lg">
          <h3 class="text-gray-600 text-sm font-bold">Total de Usuarios</h3>
          <p class="text-3xl font-bold text-blue-600">{{ userStore.totalUsers }}</p>
        </div>

        <div class="bg-green-50 p-6 rounded-lg">
          <h3 class="text-gray-600 text-sm font-bold">Tu Rol</h3>
          <p class="text-3xl font-bold text-green-600">{{ authStore.user?.rol?.nombre || "Sin rol" }}</p>
        </div>

        <div class="bg-purple-50 p-6 rounded-lg">
          <h3 class="text-gray-600 text-sm font-bold">Último Login</h3>
          <p class="text-lg font-bold text-purple-600">{{ formatDate(authStore.user?.ultimo_login) }}</p>
        </div>
      </div>

    </div>

    <ComprarModal
      v-if="mostrarComprar"
      @cancel="mostrarComprar = false"
      @finalizado="onVentaFinalizada"
    />
  </Layout>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import Layout from '@/components/Layout.vue';
import ComprarModal from '@/components/ComprarModal.vue';
import CampanaVencimientos from '@/components/CampanaVencimientos.vue';
import PanelVencimientos from '@/components/PanelVencimientos.vue';
import { onMounted, onUnmounted, ref } from 'vue';

const authStore = useAuthStore();
const userStore = useUserStore();

// Tiempo que permanece en pantalla el aviso de venta registrada
const SEGUNDOS_AVISO_VENTA = 15;

const mostrarComprar = ref(false);
// Lo lleva el dashboard y no la campana: el panel es un apartado de esta
// página, y la campana solo lo abre y lo cierra
const mostrarVencimientos = ref(false);
const ventaRealizada = ref(null);

let temporizadorAviso = null;

const cerrarAvisoVenta = () => {
  // Siempre se cancela el temporizador: si no, quedaria vivo tras cerrar a
  // mano y podria borrar el aviso de una venta posterior
  clearTimeout(temporizadorAviso);
  temporizadorAviso = null;
  ventaRealizada.value = null;
};

// El modal devuelve { message, venta } tal cual lo manda el backend
const onVentaFinalizada = (respuesta) => {
  mostrarComprar.value = false;
  ventaRealizada.value = respuesta?.venta ?? null;

  clearTimeout(temporizadorAviso);

  if (ventaRealizada.value) {
    temporizadorAviso = setTimeout(cerrarAvisoVenta, SEGUNDOS_AVISO_VENTA * 1000);
  }
};

// Sin esto el temporizador seguiria corriendo tras salir del dashboard
onUnmounted(() => clearTimeout(temporizadorAviso));

onMounted(async () => {
  await userStore.fetchUsers();
});

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
</script>
