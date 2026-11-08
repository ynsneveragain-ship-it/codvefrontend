<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
      <h1 class="text-2xl font-bold mb-6 text-center">Registrarse</h1>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <!-- Primer Nombre -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Primer Nombre *</label>
            <input
              v-model="form.primer_nombre"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <!-- Segundo Nombre -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Segundo Nombre</label>
            <input
              v-model="form.segundo_nombre"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <!-- Apellido Paterno -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Apellido Paterno *</label>
            <input
              v-model="form.apellido_paterno"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <!-- Apellido Materno -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Apellido Materno</label>
            <input
              v-model="form.apellido_materno"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <!-- Correo -->
          <div class="col-span-2">
            <label class="block text-gray-700 text-sm font-bold mb-2">Correo *</label>
            <input
              v-model="form.correo"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <!-- Teléfono -->
          <div class="col-span-2">
            <label class="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
            <input
              v-model="form.telefono"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <!-- Contraseña -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Contraseña *</label>
            <input
              v-model="form.password"
              type="password"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Mínimo 8 caracteres"
              required
            />
          </div>

          <!-- Confirmar Contraseña -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Confirmar Contraseña *</label>
            <input
              v-model="form.password_confirmation"
              type="password"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="p-4 bg-red-100 text-red-700 rounded-lg text-sm">
          {{ error }}
        </div>

        <!-- Botón -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {{ loading ? 'Registrando...' : 'Registrarse' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?
        <router-link to="/login" class="text-blue-600 hover:underline">Inicia sesión aquí</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  primer_nombre: '',
  segundo_nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  correo: '',
  telefono: '',
  password: '',
  password_confirmation: '',
});

const loading = ref(false);
const error = ref(null);


const handleRegister = async () => {
  loading.value = true;
  error.value = null;

  try {
    await authStore.register(form);
    router.push('/dashboard');
  } catch (err) {
    error.value = authStore.error || 'Error al registrarse';
  } finally {
    loading.value = false;
  }
};
</script>
