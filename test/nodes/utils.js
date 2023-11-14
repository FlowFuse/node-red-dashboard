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

module.exports = {
    getLoadedNodes,
    verifyFlowLoaded,
    debugPrintLoadedNodes
}
