import axios from 'axios'

export default {
    deployChanges: function (dashboardId, changes) {
        console.log('deploy changes')
        return axios.request({
            method: 'PATCH',
            url: '/editor/dashboard/' + dashboardId,
            headers: {
                'Content-type': 'application/json',
                'Node-RED-API-Version': 'v2',
                'Node-RED-Deployment-Type': 'full'
            },
            data: changes
        })
    }
}
