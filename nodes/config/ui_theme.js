module.exports = function (RED) {
    /**
     *
     * @param {*} config
     */
    function UIThemeNode (config) {
        RED.nodes.createNode(this, config)
        const node = this

        const { id, name, type, _users, ...rest } = config
        node.colors = { ...rest.colors }
    }
    RED.nodes.registerType('ui-theme', UIThemeNode)
}
