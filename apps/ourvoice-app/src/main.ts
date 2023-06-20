import { apolloClient } from './graphql/client/index'
import { createApp, provide, h } from 'vue'
import { createHead } from '@unhead/vue'
import { createPinia } from 'pinia'
import SuperTokens from 'supertokens-web-js'
import Session from 'supertokens-web-js/recipe/session'
import EmailVerification from 'supertokens-web-js/recipe/emailverification'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { DefaultApolloClient } from '@vue/apollo-composable'
// import VueVirtualScroller from 'vue-virtual-scroller'
// import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import AppNavBar from './components/common/AppNavBar.vue'
import AppFooter from './components/common/AppFooter.vue'
import App from './App.vue'
import router from './router'

SuperTokens.init({
  appInfo: {
    appName: `${import.meta.env.VITE_APP_NAME || 'OurVoice APP'}`,
    apiDomain: `${import.meta.env.VITE_APP_AUTH_API_URL}`,
    apiBasePath: `${import.meta.env.VITE_APP_AUTH_API_BASE || '/auth'}`
  },
  recipeList: [
    Session.init({
      sessionTokenBackendDomain: `${import.meta.env.VITE_APP_BACKEND_DOMAIN}`,
      sessionTokenFrontendDomain: `${import.meta.env.VITE_APP_FRONTEND_DOMAIN}`
    }),
    EmailVerification.init()
  ]
  // enableDebugLogs: true
})

// Set up fontawesome
library.add(fas)

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App)
})

app.use(createPinia())
app.use(createHead())
app.use(router)

app.component('font-awesome-icon', FontAwesomeIcon)
app.component('AppFooter', AppFooter)
app.component('AppNavBar', AppNavBar)
// app.use(VueVirtualScroller)
app.mount('#app')
