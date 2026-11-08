<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>

      <form @submit.prevent="handleLogin">
        <!-- Correo -->
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Correo</label>
          <input
            v-model="credentials.correo"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="usuario@example.com"
            required
          />
        </div>

        <!-- Contraseña -->
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
          <input
            v-model="credentials.password"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="••••••••"
            required
          />
        </div>

        <!-- Error -->
        <div v-if="error" class="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm">
          {{ error }}
        </div>

        <!-- Botón -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {{ loading ? 'Cargando...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        ¿No tienes cuenta?
        <router-link to="/register" class="text-blue-600 hover:underline">Regístrate aquí</router-link>
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

const credentials = reactive({
  correo: '',
  password: '',
});

const loading = ref(false);
const error = ref(null);

const handleLogin = async () => {
  loading.value = true;
  error.value = null;

  try {
    await authStore.login(credentials);
    router.push('/dashboard');
  } catch (err) {
    error.value = authStore.error || 'Error al iniciar sesión';
  } finally {
    loading.value = false;
  }
};
</script>
