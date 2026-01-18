const should = require('should') // eslint-disable-line no-unused-vars

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

function verifyFlowLoaded (helper, flow) {
    const loadedNodes = getLoadedNodes(helper)
    loadedNodes.should.have.length(flow.length)
    loadedNodes.forEach(node => {
        const loadedNode = helper.getNode(node.id)
        should(loadedNode).be.an.Object()
        loadedNode.should.have.property('type', node.type)
    })
}

function debugPrintLoadedNodes (testInstance, helper) {
    // get a the full path to the test from .parent.parent.etc
    const pathItems = testInstance.test.titlePath()
    const padding = ' '.repeat(pathItems.length * 2)
    const testPath = testInstance.test.titlePath().join(' > ')
    console.log(`${padding}TEST: ${testPath}`)
    console.log(`${padding}  Loaded nodes:`)
    const loadedNodes = getLoadedNodes(helper)
    loadedNodes.forEach(node => {
        console.log(`${padding}  * ${JSON.stringify(node, null, 0)}`)
    })
}

function getBaseRegisterCallAndParams (base, nodeId) {
    const registerCall = base.register.getCalls().find(call => call.args[2]?.id === nodeId)
    const registerPage = registerCall.args[0]
    const registerGroup = registerCall.args[1]
    const registerNode = registerCall.args[2]
    const registerConfig = registerCall.args[3]
    const registerEvents = registerCall.args[4]
    return { registerCall, registerPage, registerGroup, registerNode, registerConfig, registerEvents }
}
function getGroupRegisterCallAndParams (group, nodeId) {
    const registerCall = group.register.getCalls().find(call => call.args[0]?.id === nodeId)
    const registerNode = registerCall.args[0]
    const registerConfig = registerCall.args[1]
    const registerEvents = registerCall.args[2]
    return { registerCall, registerNode, registerConfig, registerEvents }
}
function getPageRegisterCallAndParams (page, nodeId) {
    const registerCall = page.register.getCalls().find(call => call.args[1]?.id === nodeId)
    const registerGroup = registerCall.args[0]
    const registerNode = registerCall.args[1]
    const registerConfig = registerCall.args[2]
    const registerEvents = registerCall.args[3]
    return { registerCall, registerGroup, registerNode, registerConfig, registerEvents }
}

function registerHelperSpies (sinon, helper) {
    // spy helper._RED.nodes.createNode
    sinon.spy(helper._RED.nodes, 'createNode')

    // stub helper._RED.runtime._.flows.get so we can spy on config nodes and their register functions
    sinon.stub(helper._RED.runtime._.flows, 'get').callsFake(function (id) {
        // call the original function first
        const node = helper._RED.runtime._.flows.get.wrappedMethod.call(this, id)
        // now intercept the config node and spy the register function
        if (node && (node.type === 'ui-base' || node.type === 'ui-group' || node.type === 'ui-page')) {
            if (!node.register.restore) {
                sinon.spy(node, 'register')
            }
        }
        return node
    })

    // stub helper._RED.nodes.getNode so we can spy on config nodes and their register functions
    sinon.stub(helper._RED.nodes, 'getNode').callsFake(function (id) {
        // call the original function first
        const node = helper._RED.nodes.getNode.wrappedMethod.call(this, id)
        // now intercept the config node and spy the register function
        if (node && (node.type === 'ui-base' || node.type === 'ui-group' || node.type === 'ui-page')) {
            if (!node.register.restore) {
                sinon.spy(node, 'register')
            }
        }
        return node
    })
}

function unRegisterHelperSpies (helper) {
    if (helper._RED.nodes.createNode.restore) {
        helper._RED.nodes.createNode.restore()
    }
    if (helper._RED.runtime._.flows.get.restore) {
        helper._RED.runtime._.flows.get.restore()
    }
    if (helper._RED.nodes.getNode.restore) {
        helper._RED.nodes.getNode.restore()
    }
}

module.exports = {
    getLoadedNodes,
    verifyFlowLoaded,
    debugPrintLoadedNodes,
    getBaseRegisterCallAndParams,
    getGroupRegisterCallAndParams,
    getPageRegisterCallAndParams,
    registerHelperSpies,
    unRegisterHelperSpies
}
