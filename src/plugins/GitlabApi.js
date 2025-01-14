import Config from "../components/configuration/Config"
import axios  from 'axios'

export default {
    install: (app, options) => {
        app.config.globalProperties.$api = async (path, params = {}, behavior = {}, method = 'GET') => {
            const response = await axios(path, {
                baseURL: Config.root.gitlabApi,
                method: method,
                params,
                headers: { 'Private-Token': Config.root.privateToken }
            })
            const result = response.data
            return result
        }
    }
}