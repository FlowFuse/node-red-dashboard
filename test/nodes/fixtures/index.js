const fixtures = {
    'config-ui-base': require('./ui-base.json'),
    'config-ui-page': require('./ui-page.json'),
    'config-ui-group': require('./ui-group.json'),
    'config-ui-theme': require('./ui-theme.json')
}

const testData1 = {
    getImports (extraConfigNodes, extraWidgetNodes) {
        if (!extraConfigNodes || Array.isArray(extraConfigNodes) === false) {
            extraConfigNodes = [extraConfigNodes]
        }
        if (!extraWidgetNodes || Array.isArray(extraWidgetNodes) === false) {
            extraWidgetNodes = [extraWidgetNodes]
        }
        const _configNodes = ['ui_base', 'ui_page', 'ui_group', 'ui_theme', ...extraConfigNodes]
        const _widgetNodes = [...extraWidgetNodes]
        return getImports(_configNodes, _widgetNodes)
    },
    flows: [
        fixtures['config-ui-page'],
        fixtures['config-ui-base'],
        fixtures['config-ui-group'],
        fixtures['config-ui-theme']
    ]
}

function getImports (configNodes, widgetNodes) {
    // first dedupe the lists and remove any non strings or empty strings
    configNodes = [...new Set(configNodes)].filter(item => typeof item === 'string' && item.length > 0)
    widgetNodes = [...new Set(widgetNodes)].filter(item => typeof item === 'string' && item.length > 0)

    // now load the imports
    const importItems = []
    configNodes.forEach(item => {
        importItems.push(require(`../../../nodes/config/${item}.js`))
    })
    widgetNodes.forEach(item => {
        importItems.push(require(`../../../nodes/widgets/${item}.js`))
    })
    return importItems
}

/**
 * Get a list of all nodes that have been loaded
 * This is useful for ensuring the helper loaded all nodes as expected
 * @example
 * const loadedNodes = getLoadedNodes(helper)
 * loadedNodes.should.have.length(flow.length)
 * @example
 * const loadedNodes = getLoadedNodes(helper)
 * loadedNodes.forEach(node => {
 *    console.log(node.type, node.id)
 * })
 * @param {import('node-red-node-test-helper')} helper The loaded node-red test helper
 * @returns {Array} An array of loaded nodes
 */
function getLoadedNodes (helper) {
    const loadedNodes = []
    helper._RED.nodes.eachNode(n => {
        loadedNodes.push(n)
    })
    return loadedNodes
}

module.exports = {
    getLoadedNodes,
    getImports,
    fixtures,
    testData1
}
