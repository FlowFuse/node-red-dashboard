module.exports = function (RED) {
    /**
     *
     * @param {*} config
     */
    function UIThemeNode (config) {
        function hasProperty (obj, prop) {
            return !!Object.prototype.hasOwnProperty.call(obj, prop)
        }

        RED.nodes.createNode(this, config)
        const node = this

        const { id, name, type, _users, ...rest } = config

        const sizes = { ...rest.sizes }

        if (!hasProperty(sizes, 'pagePadding')) {
            // set defaults at runtime if not set - for backward compatability
            sizes.pagePadding = '12px'
        }
        if (!hasProperty(sizes, 'groupGap')) {
            // set defaults at runtime if not set - for backward compatability
            sizes.groupGap = '12px'
        }
        if (!hasProperty(sizes, 'groupBorderRadius')) {
            // set defaults at runtime if not set - for backward compatability
            sizes.groupBorderRadius = '4px'
        }
        if (!hasProperty(sizes, 'widgetGap')) {
            // set defaults at runtime if not set - for backward compatability
            sizes.widgetGap = '12px'
        }

        node.colors = { ...rest.colors }
        node.sizes = sizes

        let uiBase = null
        RED.nodes.eachNode(n => {
            if (n.type === 'ui-base' && !uiBase) {
                uiBase = n
            }
        })
        if (uiBase) {
            config.ui = uiBase.id
            uiBase = RED.nodes.getNode(config.ui)
        }
        uiBase?.registerTheme(node)
    }
    RED.nodes.registerType('ui-theme', UIThemeNode)
}
