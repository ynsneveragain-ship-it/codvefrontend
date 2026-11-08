<template>
  <!--
    Solo el botón. El panel NO cuelga de aquí: es un apartado del dashboard
    (PanelVencimientos), colocado en el flujo de la página, así que quien lo
    abre y lo cierra es DashboardView. Si el panel viviera dentro de este
    componente tendría que flotar por encima, que es justo lo que no se quiere.
  -->
  <button
    type="button"
    @click="emit('toggle')"
    :aria-expanded="abierto"
    aria-controls="panel-vencimientos"
    :aria-label="etiqueta"
    :title="etiqueta"
    class="relative flex h-11 w-11 items-center justify-center rounded-lg border-2 transition-colors"
    :class="colores.boton"
  >
    <!-- Campana -->
    <svg
      class="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>

    <!-- Cuántos casos hay. Sin casos no se pinta nada: el color ya lo dice -->
    <span
      v-if="store.totales.total > 0"
      class="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
      :class="colores.contador"
    >
      {{ store.totales.total }}
    </span>
  </button>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useVencimientoStore } from '@/stores/vencimientoStore';

defineProps({
  // Solo para el aria-expanded: el estado lo lleva el dashboard
  abierto: { type: Boolean, default: false },
});

const emit = defineEmits(['toggle']);

const store = useVencimientoStore();

// Verde / amarillo / rojo con los colores de marca: acento, alerta y peligro
const COLORES = {
  verde: {
    boton: 'border-acento bg-acento-tenue text-acento-oscuro hover:bg-acento/20',
    contador: 'bg-acento-oscuro',
  },
  amarillo: {
    boton: 'border-alerta bg-alerta-tenue text-alerta hover:bg-alerta/20',
    contador: 'bg-alerta',
  },
  rojo: {
    boton: 'border-peligro bg-peligro-tenue text-peligro-oscuro hover:bg-peligro/20',
    contador: 'bg-peligro',
  },
};

const colores = computed(() => COLORES[store.nivel] ?? COLORES.verde);

const etiqueta = computed(() => {
  if (!store.hayCasos) return 'Sin casos a vencer';

  const partes = [];
  if (store.totales.dominios) partes.push(`${store.totales.dominios} dominio(s)`);
  if (store.totales.suscripciones) partes.push(`${store.totales.suscripciones} suscripción(es)`);

  return `Por vencer: ${partes.join(' y ')}`;
});

onMounted(async () => {
  try {
    // Al entrar al dashboard, para que el color ya diga algo sin abrir nada
    await store.fetchVencimientos();
  } catch {
    // Si falla, la campana se queda verde; el panel explica el error al abrirlo
  }
});
</script>
