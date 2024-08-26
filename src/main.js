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
app.use(Toast)
app.use(vuetify)
app.mount('#app')
