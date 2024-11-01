import axios from 'axios'

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

/**
 * Generates a full dashboard api url based off the current location and the dashboard id
 * The path parts are appended to the url
 * @example
 * // returns a URL object for 'http://localhost:1880/dashboard/api/v1/my-dashboard/flows'
 * const url = getDashboardApiUrl('', 'my-dashboard', 'flows')
 * @param {String} editorPath - The node-red editor path as provided by httpAdminRoot (e.g. 'editor') (can be empty)
 * @param {String} dashboardId - The dashboard id
 * @param  {...any} path - 1 or more path parts to append to the url
 * @returns {String} The full dashboard api url
 */
function getDashboardApiUrl (editorPath, dashboardId, ...path) {
    const url = new URL(window.location.href)
    const urlBase = url.pathname.split('/').slice(0, -1).join('/') + '/api/v1/' // e.g 'http://localhost:1880/dashboard/api/v1/'
    const pathParts = [urlBase, dashboardId, ...(path || [])].map(p => p.replace(/^\/|\/$/g, ''))
    if (editorPath) {
        pathParts.unshift(editorPath.replace(/\/$/, '').replace(/^\/+/, ''))
    }
    const result = new URL(url)
    result.search = ''
    result.pathname = pathParts.join('/')
    return result
}

export default {
    /**
     * Deploy changes to the Node-RED instance via the dashboards httpAdmin endpoint
     * @param {Object} options - The options to deploy changes via the http admin endpoint
     * @param {string} options.dashboard - The dashboard id
     * @param {string} options.page - The page id
     * @param {string} options.key - The edit key for verification
     * @param {Array<Object>} options.groups - The updated group objects to apply
     * @returns the axios request
     */
    deployChanges: async function deployChangesViaHttpAdminEndpoint ({ dashboard, page, groups, key, editorPath }) {
        const changes = { groups }
        return axios.request({
            method: 'PATCH',
            url: getDashboardApiUrl(editorPath || '', dashboard, 'flows'),
            headers: applyAuth({ 'Content-type': 'application/json' }, editorPath),
            data: { dashboard, page, key, changes }
        })
    }
}
