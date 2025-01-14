import { reactive } from "vue"
import defaultConfig from './config.default'
import merge from 'deepmerge'
import YAML from 'yaml'

let serverConfig = null
let serverLocalConfig = null

export default reactive({
    load(config = null, style = null) {
        if (config !== null) {
            serverLocalConfig = config
            serverConfig = merge(defaultConfig, serverConfig)
        } else {
            this.loadFromLocalStorage()
        }
    },

    loadFromLocalStorage() {
        const config = window.localStorage.getItem('config')

        if (config !== null) {
            const localConfig = YAML.parse(config)
            serverConfig = merge(defaultConfig, localConfig)
            serverLocalConfig = localConfig
        }
    }
})