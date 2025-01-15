import { reactive } from "vue"
import defaultConfig from './config.default'
import merge from 'deepmerge'
import YAML from 'yaml'

let serverConfig = null
let serverLocalConfig = null

export default reactive({
    load(config = null, style = null) {
        console.log('Config.load')
        if (config !== null) {
            serverLocalConfig = config
            serverConfig = merge(defaultConfig, serverConfig)
        } else {
            this.loadFromLocalStorage()
        }
    },

    loadFromLocalStorage() {
        console.log('Config.loadFromLocalStorage')
        const config = window.localStorage.getItem('config')

        if (config !== null) {
            const localConfig = YAML.parse(config)
            serverConfig = merge(defaultConfig, localConfig)
            serverLocalConfig = localConfig
        }
    },

    get isServerConfigured() {
        console.log('get Config.isServerConfigured')
        return serverConfig !== null
    },

    get root() {
        console.log('get Config.root')
        return serverConfig
    },

    get local() {
        return this.serverLocalConfig
    }
})