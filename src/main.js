import { createApp } from 'vue'
import App from './App.vue'
import Config from './components/configuration/Config'
import GitlabApi from './plugins/GitlabApi'

(async () => {
    try {
        const { data } = await axios.get('./config.json')
        Config.load(data)
    } catch {
        Config.load()
    } finally {
        const app = createApp(App)
        app.use(GitlabApi, {})
        app.mount('#app')
    }
})()
