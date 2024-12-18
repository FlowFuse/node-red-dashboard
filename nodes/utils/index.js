const fs = require('fs')
const path = require('path')

function asyncEvaluateNodeProperty (RED, value, type, node, msg) {
    return new Promise(function (resolve, reject) {
        RED.util.evaluateNodeProperty(value, type, node, msg, function (e, r) {
            if (e) {
                reject(e)
            } else {
                resolve(r)
            }
        })
    })
}

async function appendTopic (RED, config, wNode, msg) {
    // populate topic if the node specifies one
    if (config.topic || config.topicType) {
        try {
            msg.topic = await asyncEvaluateNodeProperty(RED, config.topic, config.topicType || 'str', wNode, msg) || ''
        } catch (_err) {
            // do nothing
            console.error(_err)
        }
    }

    // ensure we have a topic property in the msg, even if it's an empty string
    if (!('topic' in msg)) {
        msg.topic = ''
    }

    return msg
}

/**
 * Adds socket/client data to a msg payload, if enabled
 *
 */
function addConnectionCredentials (RED, msg, conn, config) {
    if (config.includeClientData) {
        // Add _client to each element
        const addClientData = (item) => {
            if (!item._client) {
                item._client = {}
            }
            RED.plugins.getByType('node-red-dashboard-2').forEach(plugin => {
                if (plugin.hooks?.onAddConnectionCredentials && item) {
                    item = plugin.hooks.onAddConnectionCredentials(conn, item)
                }
            })
            item._client = {
                ...item._client,
                ...{
                    socketId: conn.id,
                    socketIp: conn.handshake?.address
                }
            }
            return item
        }

        // Handle arrays and nested arrays
        const processMsg = (data) => {
            if (Array.isArray(data)) {
                return data.map(item => processMsg(item))
            } else if (typeof data === 'object' && data !== null) {
                return addClientData(data)
            }
            return data
        }

        msg = processMsg(msg)
    }
    return msg
}

function getThirdPartyWidgets (directory) {
    const contribs = {}
    const packagePath = path.join(directory, 'package.json')
    if (!fs.existsSync(packagePath)) {
        return contribs
    }
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    const getWidgets = (packageJson) => {
        if (packageJson?.['node-red-dashboard-2']) {
            // loop over object of widgets & add to contribs object
            Object.entries(packageJson['node-red-dashboard-2'].widgets).forEach(([widgetName, widgetConfig]) => {
                contribs[widgetName] = {
                    package: packageJson.name,
                    name: widgetName,
                    src: widgetConfig.output,
                    path: path.resolve(directory),
                    component: widgetConfig.component
                }
            })
        }
    }
    if (packageJson?.['node-red-dashboard-2']) {
        // this _is_ a dashboard node! get its widgets.
        getWidgets(packageJson)
    } else if (packageJson && packageJson.dependencies) {
        // get widgets from dependencies of this package
        Object.entries(packageJson.dependencies)?.filter(([packageName, _packageVersion]) => {
            return packageName.includes('node-red-dashboard-2-')
        }).forEach(([packageName, _packageVersion]) => {
            const modulePath = path.join(directory, 'node_modules', packageName)
            const packagePath = path.join(modulePath, 'package.json')
            // get third party package.json
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
            if (packageJson?.['node-red-dashboard-2']) {
                getWidgets(packageJson)
            }
        })
    }
    return contribs
}

module.exports = {
    asyncEvaluateNodeProperty,
    appendTopic,
    addConnectionCredentials,
    getThirdPartyWidgets
}
