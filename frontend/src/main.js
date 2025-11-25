import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initSentry } from './utils/sentry'
import './style.css'

// Initialiser Sentry si configuré
initSentry();

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
