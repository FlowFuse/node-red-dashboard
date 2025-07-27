module.exports = function (RED) {
    function LanguageSelectorNode (config) {
        const node = this

        RED.nodes.createNode(this, config)

        // Handle widget type configuration
        if (config.widgetType === 'ui') {
            // For UI widgets, clear the group
            delete config.group // Remove group entirely for UI widgets
            delete config.page // Ensure page is also not set
        }

        // which group are we rendering this widget
        const group = config.widgetType === 'ui' ? null : RED.nodes.getNode(config.group)
        const ui = config.widgetType === 'ui' ? RED.nodes.getNode(config.ui) : null
        const base = group ? group.getBase() : ui

        // server-side event handlers
        const evts = {
            onAction: function (msg) {
                // The frontend already sends the correctly formatted payload
                const outMsg = {
                    payload: msg.payload,
                    topic: msg.topic || config.topic || 'language'
                }

                // Copy languageObject if present (for auto mode)
                if (msg.languageObject) {
                    outMsg.languageObject = msg.languageObject
                }

                // Send the message
                node.send(outMsg)

                // Extract language code for the language-changed event
                let langCode
                if (typeof msg.payload === 'string') {
                    langCode = msg.payload
                } else if (msg.payload && msg.payload.code) {
                    langCode = msg.payload.code
                }

                // Emit language change event with the language code
                if (langCode) {
                    base.emit('language-changed', langCode)
                }
            },
            onInput: function (msg, send) {
                // Pass through if enabled and send is available
                if (config.passthru && send) {
                    send(msg)
                }
            },
            onLoad: function () {
                // Called when widget requests its data
                const languages = base.languages || []
                const enabledLanguages = languages.filter(lang => lang.enabled && lang.code && lang.name)

                const options = enabledLanguages.map(lang => ({
                    value: lang.code,
                    label: lang.name
                }))

                return {
                    options,
                    currentLanguage: base.currentLanguage || base.defaultLanguage || 'en'
                }
            }
        }

        // inform the dashboard UI that we are adding this node
        if (base) {
            // Get initial languages and store in config
            const languages = base.languages || []
            const enabledLanguages = languages.filter(lang => lang.enabled && lang.code && lang.name)

            const options = enabledLanguages.map(lang => ({
                value: lang.code,
                label: lang.name
            }))

            // Add options to config so they're available immediately
            config.options = options
            config.currentLanguage = base.currentLanguage || base.defaultLanguage || 'en'

            // Ensure widgetType and teleportTarget are passed to frontend
            config.widgetType = config.widgetType || 'group'
            config.teleportTarget = config.teleportTarget || '#app-bar-actions'

            // Register based on widget type
            if (config.widgetType === 'ui' && ui) {
                // Register as a UI widget (like ui-template does)
                ui.register(null, null, node, config, evts)
            } else if (group) {
                // Register with group as normal
                group.register(node, config, evts)
            }

            // Update the options whenever languages change
            node.on('input', function (msg) {
                // Get current languages from base configuration
                const languages = base.languages || []
                const enabledLanguages = languages.filter(lang => lang.enabled && lang.code && lang.name)

                // Generate dropdown options in the defined order
                const options = enabledLanguages.map(lang => ({
                    value: lang.code,
                    label: lang.name
                }))

                // Store in widget props for the frontend
                const update = {
                    options,
                    currentLanguage: base.currentLanguage || base.defaultLanguage || 'en'
                }

                // Send to UI
                node.emit('widget-load', node.id, update)

                // Pass through if enabled
                if (config.passthru) {
                    node.send(msg)
                }
            })

            // Listen for language changes from the store
            base.on('language-changed', function (newLanguage) {
                // Update current selection
                node.emit('widget-change', node.id, { currentLanguage: newLanguage })

                // Only emit if this change is from another widget
                // to avoid duplicate messages
                if (node._lastEmittedLanguage !== newLanguage) {
                    // Emit message with new language
                    const languages = base.languages || []
                    const langObj = languages.find(l => l.code === newLanguage)

                    let payload
                    if (config.outputFormat === 'code') {
                        payload = newLanguage
                    } else if (config.outputFormat === 'object') {
                        payload = langObj || { code: newLanguage, name: newLanguage }
                    } else {
                        // Auto mode - send code as payload
                        payload = newLanguage
                    }

                    const msg = {
                        payload,
                        topic: config.topic || 'language'
                    }
                    
                    // Add language object only for auto mode
                    if (config.outputFormat === 'auto' && langObj) {
                        msg.languageObject = langObj
                    }

                    node.send(msg)
                }
                node._lastEmittedLanguage = newLanguage
            })

            // Initial load - get current languages
            setTimeout(() => {
                const languages = base.languages || []
                const enabledLanguages = languages.filter(lang => lang.enabled && lang.code && lang.name)

                const options = enabledLanguages.map(lang => ({
                    value: lang.code,
                    label: lang.name
                }))

                const update = {
                    options,
                    currentLanguage: base.currentLanguage || base.defaultLanguage || 'en'
                }

                // Use base.emit to send to UI
                base.emit('widget-load:' + node.id, update)
            }, 100)
        }
    }

    RED.nodes.registerType('ui-language-selector', LanguageSelectorNode)
}
