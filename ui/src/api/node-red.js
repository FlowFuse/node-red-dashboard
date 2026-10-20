import axios from 'axios'

import { getDashboardApiUrl } from './dashboard-url.mjs'

function applyAuth (headers, editorPath) {
    let itemName = 'auth-tokens'
    if (editorPath) {
        itemName += `-${editorPath.replace(/\//g, '-')}`
    }
    let authTokens = localStorage.getItem(itemName)
    if (!authTokens) {
        authTokens = localStorage.getItem('auth-tokens')
    }
    if (authTokens) {
        authTokens = JSON.parse(authTokens)
        const token = authTokens.access_token
        const tokenType = authTokens.token_type ? authTokens.token_type : 'Bearer'
        headers.Authorization = `${tokenType} ${token}`
    }
    return headers
}

export default {
    /**
     * Deploy changes to the Node-RED instance via the dashboards httpAdmin endpoint
     * @param {Object} options - The options to deploy changes via the http admin endpoint
     * @param {string} options.dashboard - The dashboard id
     * @param {string} options.dashboardPath - The dashboard base path
     * @param {string} options.page - The page id
     * @param {string} options.key - The edit key for verification
     * @param {Array<Object>} options.groups - The updated group objects to apply
     * @param {Array<Object>} options.widgets - The updated widget objects to apply
     * @returns the axios request
     */
    deployChanges: async function deployChangesViaHttpAdminEndpoint ({ dashboard, dashboardPath, page, groups, widgets, key, editorPath }) {
        const changes = { groups, widgets }
        return axios.request({
            method: 'PATCH',
            url: getDashboardApiUrl(window.location.href, editorPath || '', dashboardPath, dashboard, 'flows'),
            headers: applyAuth({ 'Content-type': 'application/json' }, editorPath),
            data: { dashboard, page, key, changes }
        })
    }
}
