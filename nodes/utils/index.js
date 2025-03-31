/**
 * @typedef {Object} NodeTypedInput - A typed input object definition for setting up dashboard typed inputs
 * @property {string} nodeProperty - The property to look for in the nodes config .
 * @property {string} nodePropertyType - The property type to look for in the nodes config. This will typically be the nodeProperty + 'Type' and contain the type of the property e.g. 'str', 'num', 'json', etc.
 */

/**
 * @typedef {Object} NodeTypedInputs - An object containing key/value pairs of name:{nodeProperty, nodePropertyType}
 * @type {Object.<string, NodeTypedInput>}
 */

/**
 * @typedef {Object} NodeDynamicProperties - An object containing key/value pairs of property name and a boolean/function to evaluate the property
 * @type {Object.<string, boolean|function>}
 */

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
 * Apply the dynamic properties and typed inputs to the message object
 * @param {Object} RED - The Node-RED RED object
 * @param {*} wNode - The Node-RED node
 * @param {Object} msg - The message object to evaluate
 * @returns the updated message object
 * @async
 * @returns {Promise<Object>} - The updated message object
 * @example
 * msg = await applyUpdates(RED, wNode, msg)
 * // msg is now updated with the dynamic properties and typed inputs
 */
async function applyUpdates (RED, wNode, msg) {
    msg = await applyDynamicProperties(RED, wNode, msg)
    msg = await applyTypedInputs(RED, wNode, msg)
    return msg
}

/**
 * Update the store with the dynamic properties that are set in the msg.ui_update object
 * @param {Object} RED - The Node-RED RED object
 * @param {*} wNode - The Node-RED node
 * @param {Object} msg - The message object to evaluate
 * @returns the message object
 */
async function applyDynamicProperties (RED, wNode, msg) {
    const { base, options, statestore } = wNode.getWidgetRegistration ? wNode.getWidgetRegistration() : {}
    if (!options.dynamicProperties || typeof options.dynamicProperties !== 'object') {
        return msg
    }
    const updates = msg.ui_update || {}
    const keys = Object.keys(updates)
    if (keys.length > 0) {
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            const prop = options.dynamicProperties[key]
            if (prop === true) {
                const value = updates[key]
                if (value === null) {
                    statestore.deleteProperty(wNode.id, key)
                } else {
                    statestore.set(base, wNode, msg, key, value)
                }
            }
        }
    }
    return msg
}

/**
 * Update the store with the evaluated typed input value.
 * NOTE: This will only update the store if the value has changed and the property is NOT already "overridden"
 *       in the ui_update object. For that reason, `applyDynamicProperties` should be called first.
 * @param {Object} RED - The Node-RED RED object
 * @param {*} wNode - The Node-RED node
 * @param {Object} msg - The message object to evaluate
 * @returns the updated message object
 */
async function applyTypedInputs (RED, wNode, msg) {
    const { base, config, options, statestore } = wNode.getWidgetRegistration ? wNode.getWidgetRegistration() : {}
    if (!options.typedInputs || typeof options.typedInputs !== 'object') {
        return msg
    }
    const definitions = Object.keys(options.typedInputs).map(name => {
        const { nodeProperty, nodePropertyType } = options.typedInputs[name]
        return { name, nodeProperty, nodePropertyType }
    })
    if (definitions.length > 0) {
        const updates = msg.ui_update || {}
        let applyUpdates = false
        const hasKey = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
        for (let i = 0; i < definitions.length; i++) {
            let value
            let { name, nodeProperty, nodePropertyType } = definitions[i]
            if (hasKey(updates, name) && updates[name] !== null) {
                continue // skip if already overridden in ui_updates
            }
            nodeProperty = nodeProperty || name
            nodePropertyType = typeof nodePropertyType !== 'string' ? `${nodeProperty}Type` : nodePropertyType
            try {
                value = await asyncEvaluateNodeProperty(RED, config[nodeProperty], (nodePropertyType && config[nodePropertyType]) || 'str', wNode, msg)
            } catch (error) {
                continue // do nothing
            }
            const storeValue = statestore.getProperty(wNode.id, name)
            if (typeof value !== 'undefined' && value !== storeValue) {
                statestore.set(base, wNode, msg, name, value)
                updates[name] = value
                applyUpdates = true
            }
        }
        if (applyUpdates) {
            msg.ui_update = updates
        }
    }
    return msg
}

/**
 * Evaluates the property/propertyType and returns an object with the evaluated values
 * This leaves the original payload untouched
 * This permits an TypedInput widget to be used to set the payload
 * typedInputs is key/value pair of the name:{nodeProperty, nodePropertyType}
 * @param {*} RED - The RED object
 * @param {Object} config - The node configuration
 * @param {Object} wNode - The node object
 * @param {Object} msg - The message object
 * @param {NodeTypedInputs} typedInputs - The typedInputs object
 */
async function evaluateTypedInputs (RED, config, wNode, msg, typedInputs) {
    const result = {
        count: 0,
        updates: {}
    }
    if (!typedInputs || typeof typedInputs !== 'object') {
        return result
    }
    const definitions = Object.keys(typedInputs).map(name => {
        const { nodeProperty, nodePropertyType } = typedInputs[name]
        return { name, nodeProperty, nodePropertyType }
    })
    for (let i = 0; i < definitions.length; i++) {
        let { name, nodeProperty, nodePropertyType } = definitions[i]
        nodeProperty = nodeProperty || name
        nodePropertyType = typeof nodePropertyType !== 'string' ? `${nodeProperty}Type` : nodePropertyType
        if (name && config?.[nodeProperty]) {
            try {
                result.updates[name] = await asyncEvaluateNodeProperty(RED, config[nodeProperty], (nodePropertyType && config[nodePropertyType]) || 'str', wNode, msg) ?? ''
                result.count++
            } catch (_err) {
                // property not found or error evaluating - do nothing!
            }
        }
    }
    return result
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

/**
 * Check if an object has a property
 * @param {Object} obj - Object to check for property
 * @param {String} prop - Property to check for
 * @returns {boolean}
 */
function hasProperty (obj, prop) {
    if (!obj || typeof obj !== 'object') {
        return false
    }
    return Object.prototype.hasOwnProperty.call(obj, prop)
}

module.exports = {
    asyncEvaluateNodeProperty,
    appendTopic,
    addConnectionCredentials,
    evaluateTypedInputs,
    applyDynamicProperties,
    applyTypedInputs,
    applyUpdates,
    getThirdPartyWidgets,
    hasProperty
}
