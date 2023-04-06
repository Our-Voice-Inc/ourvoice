import { createRouter, createWebHistory } from 'vue-router'
import VerifyView from '../views/VerifyView.vue'
import VerifyEmailView from '../views/VerifyEmailView.vue'
import AuthView from '../views/AuthView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import { ManageRedirectStateService } from '../utils/manage-redirect-state.service'

const redirect: ManageRedirectStateService = new ManageRedirectStateService()
const appURL = import.meta.env.VITE_APP_APP_URL
const adminURL = import.meta.env.VITE_APP_ADMIN_URL

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'auth',
      component: AuthView,
      // TODO: might want to use a query parameter for this
      beforeEnter: (to) => {
        if (to.redirectedFrom?.name === 'passwordless') {
          redirect.set(appURL)
        } else {
          redirect.set(adminURL)
        }
      },
      props: (route) => {
        return { mode: route.redirectedFrom?.name || 'emailpassword' }
      }
    },
    {
      path: '/signinWithoutPassword',
      name: 'passwordless',
      redirect: '/'
    },
    {
      path: '/signinWithEmailPassword',
      name: 'emailpassword',
      beforeEnter: () => {
        redirect.set(adminURL)
      },
      redirect: '/'
    },
    {
      path: '/reset-password',
      name: 'resetPassword',
      component: ForgotPasswordView
    },
    {
      path: '/verify',
      name: 'verify',
      component: VerifyView
    },
    {
      path: '/verify-email',
      name: 'verifyemail',
      component: VerifyEmailView
    }
  ]
})

export default router
