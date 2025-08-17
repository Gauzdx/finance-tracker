import { createApp } from 'vue'

// Toastification
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './assets/style.css'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import App from './App.vue'

const vuetify = createVuetify({
    components,
    directives
})

const app = createApp(App)

// Configure toast with custom timeout settings
const toastOptions = {
    timeout: 1500, // 1.5 seconds timeout
    hideProgressBar: false, // Keep progress bar functionality
    closeOnClick: true, // Maintain click to dismiss functionality
    pauseOnFocusLoss: true // Pause timeout when window loses focus
}

app.use(Toast, toastOptions)
app.use(vuetify)
app.mount('#app')
