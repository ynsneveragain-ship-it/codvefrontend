import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import UsersView from '@/views/UsersView.vue'
import RolesView from '@/views/RolesView.vue'
import PermisosView from '@/views/PermisosView.vue'
import ClientesView from '@/views/ClientesView.vue'
import PlanesView from '@/views/PlanesView.vue'
import DominiosView from '@/views/DominiosView.vue'
import SuscripcionesView from '@/views/SuscripcionesView.vue'
import PagosView from '@/views/PagosView.vue'
import ReportesView from '@/views/ReportesView.vue'
import PerfilView from '@/views/PerfilView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterView,
      meta: { requiresAuth: false },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/users',
      name: 'Users',
      component: UsersView,
      meta: { requiresAuth: true },
    },
    {
      path: '/roles',
      name: 'Roles',
      component: RolesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/permisos',
      name: 'Permisos',
      component: PermisosView,
      meta: { requiresAuth: true },
    },
    {
      path: '/clientes',
      name: 'Clientes',
      component: ClientesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/planes',
      name: 'Planes',
      component: PlanesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/dominios',
      name: 'Dominios',
      component: DominiosView,
      meta: { requiresAuth: true },
    },
    {
      path: '/suscripciones',
      name: 'Suscripciones',
      component: SuscripcionesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/pagos',
      name: 'Pagos',
      component: PagosView,
      meta: { requiresAuth: true },
    },
    {
      path: '/reportes',
      name: 'Reportes',
      component: ReportesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/perfil',
      name: 'Perfil',
      component: PerfilView,
      meta: { requiresAuth: true },
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

// Lo unico que puede ver el rol visita: el dashboard y su propio perfil.
// Para dejarlo solo en el dashboard, basta con quitar '/perfil' de esta lista.
const RUTAS_VISITA = ['/dashboard', '/perfil']

// Route guard para autenticación
router.beforeEach((to) => {
  const authStore = useAuthStore()

  // Inicializar auth en cada navegación
  authStore.initializeAuth()

  const requiresAuth = to.meta.requiresAuth !== false
  const isAuthenticated = authStore.isAuthenticated

  if (requiresAuth && !isAuthenticated) return '/login'
  if (to.path === '/login' && isAuthenticated) return '/dashboard'

  // Un visita que escriba la URL a mano vuelve al dashboard
  if (isAuthenticated && authStore.esVisita && requiresAuth && !RUTAS_VISITA.includes(to.path)) {
    return '/dashboard'
  }

  return true
})

export default router
