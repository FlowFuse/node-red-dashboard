const statestore = require('../store/state.js')

const { addConnectionCredentials } = require('../utils/index.js')

module.exports = function (RED) {
    function UiControlNode (config) {
        const node = this
        RED.nodes.createNode(this, config)

        // which ui does this widget belong to
        const ui = RED.nodes.getNode(config.ui)

        // Create a map { pageId: pageObject, ... } for all available page (or tab) nodes
        const allPageNodes = {}
        RED.nodes.eachNode((n) => {
            if (n.type === 'ui-page') {
                allPageNodes[n.id] = n
            }
        })

        // Create a map { groupId: groupObject, ... } for all available group nodes
        const allGroupNodes = {}
        RED.nodes.eachNode((n) => {
            if (n.type === 'ui-group') {
                allGroupNodes[n.id] = n
            }
        })

        // Create a map { widgetId: widgetObject, ... } for all available widget nodes
        const allWidgetNodes = {}
        RED.nodes.eachNode((n) => {
            if (n.type.startsWith('ui-') && !['ui-page', 'ui-group', 'ui-base', 'ui-theme'].includes(n.type)) {
                allWidgetNodes[n.id] = n
            }
        })

        function updateStateStore (type, identifiers, msg, prop, value) {
            const identifiedNodes = []

            identifiers.forEach(identifier => {
                let identifierObj = {}

                switch (typeof identifier) {
                // Use {} around the case statement to avoid linting error "Unexpected lexical declaration in case block" on the split regex
                case 'string': {
                    // Split on colons (:) that are not escaped, i.e. not preceded by a backslash (\\).
                    // Because an entity name might contain (escaped) colons.
                    // And for each part replace the escaped colons again by normal colons.
                    const parts = identifier.split(/(?<!\\):/).map(part => part.replace(/\\:/g, ':'))

                    // Convert the string to an object
                    switch (type) {
                    case 'page':
                        // Pages can be identified by "pageName" or "pageId"
                        switch (parts.length) {
                        case 1:
                            identifierObj.page = parts[0]
                            break
                        default:
                            throw new Error('The "pages" string contains more than 1 part, perhaps due to unescaped colon(s)?')
                        }
                        break

                    case 'group':
                        // Groups can be identified by "groupName", "groupId", "pageName:groupName" or "pageId:groupName"
                        switch (parts.length) {
                        case 1:
                            identifierObj.group = parts[0]
                            break
                        case 2:
                            identifierObj.page = parts[0]
                            identifierObj.group = parts[1]
                            break
                        default:
                            throw new Error('The "groups" string contains more than 2 parts, perhaps due to unescaped colon(s)?')
                        }
                        break

                    case 'widget':
                        // Widgets can be identified by "widgetName", "widgetId", "groupName:widgetName", "groupId:widgetName",
                        // "pageName:groupName:widgetName" or "pageId:groupName:widgetName"
                        switch (parts.length) {
                        case 1:
                            identifierObj.widget = parts[0]
                            break
                        case 2:
                            identifierObj.group = parts[0]
                            identifierObj.widget = parts[1]
                            break
                        case 3:
                            identifierObj.page = parts[0]
                            identifierObj.group = parts[1]
                            identifierObj.widget = parts[2]
                            break
                        default:
                            throw new Error('The "widgets" string contains more than 3 parts, perhaps due to unescaped colon(s)?')
                        }
                        break
                    }
                    break
                }
                case 'object':
                    // The input identifier is already an object
                    identifierObj = identifier
                    break
                default:
                    throw new Error(`The '${type}' identifier must be a string or an object`)
                }

                let pageNode
                if (typeof identifierObj.page === 'string') {
                    // Try to find the page by id
                    pageNode = allPageNodes[identifierObj.page]

                    if (!pageNode) {
                        // Try to find the page by name
                        pageNode = Object.values(allPageNodes).find(page => page.name === identifierObj.page)
                    }

                    if (!pageNode) {
                        // When a page has been specified, it should be available
                        throw new Error(`No page found with id or name '${identifierObj.page}'`)
                    }
                }

                if (type === 'page') {
                    if (pageNode) {
                        identifiedNodes.push(pageNode)
                        return
                    }
                }

                let groupNode
                if (typeof identifierObj.group === 'string') {
                    // Try to find the group by id
                    groupNode = allGroupNodes[identifierObj.group]

                    if (groupNode && pageNode) {
                        if (groupNode.page !== pageNode.id) {
                            throw new Error(`The specified group id '${identifierObj.group}' does not belong to the specified page '${identifierObj.page}'`)
                        } else {
                            node.warn('It is unusual to use format "<page>:<groupId>", because "<groupId>" is sufficient to identify a ui group node.')
                        }
                    }

                    if (!groupNode) {
                        if (pageNode) {
                            // Try to find the group by name on the specified page
                            groupNode = Object.values(allGroupNodes).find(group => group.name === identifierObj.group && group.page === pageNode.id)
                        } else {
                            // Try to find the group by name anywhere
                            groupNode = Object.values(allGroupNodes).find(group => group.name === identifierObj.group)
                        }
                    }

                    // When the target was to identify a group, then the search is over here if a group has been found
                    if (groupNode && type === 'group') {
                        identifiedNodes.push(groupNode)
                        return
                    }
                }

                if (!groupNode) {
                    // When a group identifier has been specified or the target was to find a group, then the group should exist
                    if (identifierObj.group || type === 'group') {
                        if (pageNode) {
                            throw new Error(`No group found with id or name '${identifierObj.group}' on page '${identifierObj.page}'`)
                        } else {
                            throw new Error(`No group found with id or name '${identifierObj.group}'`)
                        }
                    }
                }

                let widgetNode
                if (typeof identifierObj.widget === 'string') {
                    // Try to find the widget by id
                    widgetNode = allWidgetNodes[identifierObj.widget]

                    if (groupNode && widgetNode) {
                        if (widgetNode.group !== groupNode.id) {
                            throw new Error(`The specified widget id '${identifierObj.widget}' does not belong to the specified group '${identifierObj.group}'`)
                        } else {
                            if (pageNode) {
                                node.warn('It is unusual to use format "<page>:<group>:<widgetId>", because "<widgetId>" is sufficient to identify a ui widget node.')
                            } else {
                                node.warn('It is unusual to use format "<group>:<widgetId>", because "<widgetId>" is sufficient to identify a ui widget node.')
                            }
                        }
                    }

                    if (!widgetNode) {
                        if (groupNode) {
                            // Try to find the widget by name in the specified group
                            widgetNode = Object.values(allWidgetNodes).find(widget => widget.name === identifierObj.widget && widget.group === groupNode.id)
                        } else {
                            // Try to find the widget by name
                            widgetNode = Object.values(allWidgetNodes).find(widget => widget.name === identifierObj.widget)
                        }
                    }

                    // When the target was to identify a widget, then the search is over here if a widget has been found
                    if (widgetNode && type === 'widget') {
                        identifiedNodes.push(widgetNode)
                        return
                    }
                }

                if (!widgetNode) {
                    // When a widget identifier has been specified or the target was to find a widget, then the widget should exist
                    if (identifierObj.widget || type === 'widget') {
                        if (groupNode) {
                            throw new Error(`No widget found with id or name '${identifierObj.widget}' on group '${identifierObj.group}'`)
                        } else {
                            throw new Error(`No widget found with id or name '${identifierObj.widget}'`)
                        }
                    }
                }
            })

            const nodeIds = []
            identifiedNodes.forEach(function (identifiedNode) {
                // update the state store for each identified node
                statestore.set(ui, identifiedNode, msg, prop, value)
                nodeIds.push(identifiedNode.id)
            })

            return nodeIds
        }

        function emit (msg) {
            ui.emit('ui-control:' + node.id, msg, node)
        }

        const evts = {
            onInput: function (msg, send, done) {
                const wNode = RED.nodes.getNode(node.id)
                // handle the logic here of what to do when input is received

                if (typeof msg.payload !== 'object') {
                    msg.payload = { page: msg.payload }
                }

                // switch to tab name (or number)
                if ('tab' in msg.payload || 'page' in msg.payload) {
                    let page = msg.payload.page || msg.payload.tab

                    page = (page === undefined) ? '' : page

                    if (page === '-1' || page === '+1' || typeof (page) === 'number' || page === '') {
                    // special case for -1 and +1 to switch to previous/next tab
                    // number to pick specific index
                    // "" to refresh the page
                    // ensure consistency in payload format
                        msg.payload.page = page
                        emit(msg)
                    } else {
                        let pageFound = false
                        // check we have a valid tab/page name
                        RED.nodes.eachNode(function (n) {
                            if (n.type === 'ui-page') {
                                if (n.name === page) {
                                    // ensure consistency in payload format
                                    msg.payload.page = page
                                    // send a message to the ui to switch to this tab
                                    emit(msg)
                                    pageFound = true
                                }
                            }
                        })
                        if (!pageFound) {
                            node.error("No page with the name '" + page + "' found")
                        }
                    }
                }

                // show/hide or enable/disable tabs
                if ('tabs' in msg.payload || 'pages' in msg.payload) {
                    const pages = msg.payload.pages || msg.payload.tabs

                    // const pMap = RED.nodes.forEach
                    if ('show' in pages) {
                        pages.show = updateStateStore('page', pages.show, msg, 'visible', true)
                    }
                    if ('hide' in pages) {
                        pages.hide = updateStateStore('page', pages.hide, msg, 'visible', false)
                    }
                    if ('enable' in pages) {
                        pages.enable = updateStateStore('page', pages.enable, msg, 'disabled', false)
                    }
                    if ('disable' in pages) {
                        pages.disable = updateStateStore('page', pages.disable, msg, 'disabled', false)
                    }

                    // Ensure consistency in payload format, and only send the ids of the pages to be updated
                    msg.payload.pages = pages

                    // Send all the page ids to the front end, in order to action on them there
                    emit(msg)
                }

                // show or hide ui groups
                if ('groups' in msg.payload || 'group' in msg.payload) {
                    const groups = msg.payload.groups || msg.payload.group

                    if ('show' in groups) {
                        groups.show = updateStateStore('group', groups.show, msg, 'visible', true)
                    }
                    if ('hide' in groups) {
                        groups.hide = updateStateStore('group', groups.hide, msg, 'visible', false)
                    }
                    if ('enable' in groups) {
                        groups.enable = updateStateStore('group', groups.enable, msg, 'disabled', false)
                    }
                    if ('disable' in groups) {
                        groups.disable = updateStateStore('group', groups.disable, msg, 'disabled', true)
                    }

                    // ensure consistency in payload format
                    msg.payload.groups = groups

                    // Send all the group ids to the front end, in order to action on them there.
                    // The page information (id or name) is not required in the frontend, because the group ids are unique.
                    emit(msg)

                    // send specific visible/hidden commands via SocketIO here,
                    // so all logic stays server-side
                    wNode.send({ payload: 'input' })
                }

                // show or hide ui widgets
                if ('widgets' in msg.payload || 'widget' in msg.payload) {
                    const widgets = msg.payload.widgets || msg.payload.widget

                    if ('show' in widgets) {
                        widgets.show = updateStateStore('widget', widgets.show, msg, 'visible', true)
                    }
                    if ('hide' in widgets) {
                        widgets.hide = updateStateStore('widget', widgets.hide, msg, 'visible', false)
                    }
                    if ('enable' in widgets) {
                        widgets.enable = updateStateStore('widget', widgets.enable, msg, 'disabled', false)
                    }
                    if ('disable' in widgets) {
                        widgets.disable = updateStateStore('widget', widgets.disable, msg, 'disabled', true)
                    }

                    // ensure consistency in payload format
                    msg.payload.widgets = widgets

                    // Send all the widget ids to the front end, in order to action on them there.
                    // The page/group information (id or name) is not required in the frontend, because the widget ids are unique.
                    emit(msg)

                    // send specific visible/hidden commands via SocketIO here,
                    // so all logic stays server-side
                    wNode.send({ payload: 'input' })
                }

                if ('url' in msg.payload) {
                    emit(msg)
                }
            },
            onSocket: {
                connection: function (conn) {
                    if (config.events === 'all' || config.events === 'connect') {
                        const wNode = RED.nodes.getNode(node.id)
                        if (wNode && typeof wNode.send === 'function') {
                            let msg = {
                                payload: 'connect'
                            }
                            msg = addConnectionCredentials(RED, msg, conn, ui)
                            wNode.send(msg)
                        }
                    }
                },
                disconnect: function (conn) {
                    if (config.events === 'all' || config.events === 'connect') {
                        const wNode = RED.nodes.getNode(node.id)
                        if (wNode && typeof wNode.send === 'function') {
                            let msg = {
                                payload: 'lost'
                            }
                            msg = addConnectionCredentials(RED, msg, conn, ui)
                            wNode.send(msg)
                        }
                    }
                },
                'ui-control': function (conn, id, evt, payload) {
                    if (id === node.id && (config.events === 'all' || config.events === 'change')) {
                        // this message was sent by this particular node
                        if (evt === 'change') {
                            const wNode = RED.nodes.getNode(node.id)
                            if (wNode && payload && wNode.send) {
                                let msg = {
                                    payload: 'change',
                                    tab: payload.page, // index of tab
                                    name: payload.name // page name
                                }
                                msg = addConnectionCredentials(RED, msg, conn, ui)
                                wNode.send(msg)
                            }
                        }
                    }
                }
            }
        }

        // inform the dashboard UI that we are adding this node
        if (ui) {
            ui?.register(null, null, node, config, evts)
        } else {
            node.error('No UI configured')
        }

        node.on('close', function (removed, done) {
            if (removed) {
                // handle node being removed
                ui?.deregister(null, null, node)
            }
            done()
        })
    }
    RED.nodes.registerType('ui-control', UiControlNode)
}
