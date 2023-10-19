const datastore = require('../store/index.js')

module.exports = function (RED) {
    function ChartNode (config) {
        const node = this

        // create node in Node-RED
        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        function getProperty (value, property) {
            const props = property.split('.')
            props.forEach((prop) => {
                if (value) {
                    value = value[prop]
                }
            })
            return value
        }

        const evts = {
            beforeSend: function (msg) {
                const p = msg.payload

                const label = RED.util.evaluateNodeProperty(config.category, config.categoryType, node, msg)

                if (config.chartType === 'line' || config.chartType === 'scatter') {
                    // possible that we haven't received any x-data in the payload,
                    // so let's make sure we append something

                    // single point or array of data?
                    if (Array.isArray(p)) {
                        // array of data
                        msg._datapoint = p.map((point) => {
                            return addToLine(point, label)
                        })
                    } else {
                        // single point
                        msg._datapoint = addToLine(p, label)
                    }
                } else if (config.chartType === 'bar') {
                    // single point or array of data?
                    if (Array.isArray(p)) {
                        // array of data
                        msg._datapoint = p.map((point) => {
                            return addToBar(point, label)
                        })
                    } else {
                        // single point
                        msg._datapoint = addToBar(p, label)
                    }
                }

                // function to process a data point being appended to a line/scatter chart
                function addToLine (payload, category) {
                    const datapoint = {}
                    datapoint.category = category
                    // construct our datapoint
                    if (typeof payload === 'number') {
                        // just a number, assume we're plotting a time series
                        datapoint.x = (new Date()).getTime()
                        datapoint.y = payload
                    } else if (typeof payload === 'object') {
                        // may have been given an x/y object already
                        let x = getProperty(payload, config.xAxisProperty)
                        if (x === undefined || x === null) {
                            x = (new Date()).getTime()
                        }
                        datapoint.x = x
                        datapoint.y = payload.y
                    }
                    return datapoint
                }

                // the only server-side computed var we need is the category for a Bar Chart
                function addToBar (payload, category) {
                    const datapoint = {}
                    datapoint.category = category
                    if (typeof payload === 'number') {
                        datapoint.y = payload
                    }
                    return datapoint
                }

                return msg
            },
            onInput: function (msg, send, done) {
                // use our own custom onInput in order to store history of msg payloads
                if (!datastore.get(node.id)) {
                    datastore.save(node.id, [])
                }
                if (Array.isArray(msg.payload) && !msg.payload.length) {
                    // clear history
                    datastore.save(node.id, [])
                } else {
                    if (!Array.isArray(msg.payload)) {
                        // quick clone of msg, and store in history
                        datastore.append(node.id, {
                            ...msg
                        })
                    } else {
                        // we have an array in msg.payload, let's split them
                        msg.payload.forEach((p, i) => {
                            const payload = JSON.parse(JSON.stringify(p))
                            const d = msg._datapoint ? msg._datapoint[i] : null
                            const m = {
                                ...msg,
                                payload,
                                _datapoint: d
                            }
                            datastore.append(node.id, m)
                        })
                    }

                    const maxPoints = parseInt(config.removeOlderPoints)

                    if (config.xAxisType === 'category') {
                        // TODO: CARRY ON FROM HERE
                        const _msg = datastore.get(node.id)

                        // filters the ._msg array so that we keep just the latest msg with each category/series
                        const seen = {}
                        _msg.forEach((msg, index) => {
                            // loop through and record the latest index seen for each topic/label
                            seen[msg.topic] = index
                        })
                        const indices = Object.values(seen)
                        datastore(node.id, _msg.filter((msg, index) => {
                            // return only the msgs with the latest index for each topic/label
                            return indices.includes(index)
                        }))
                    } else if (maxPoints && config.removeOlderPoints) {
                        // account for multiple lines?
                        // client-side does this for _each_ line
                        // remove older points
                        const lineCounts = {}
                        const _msg = datastore.get(node.id)
                        // trawl through in reverse order, and only keep the latest points (up to maxPoints) for each label
                        for (let i = _msg.length - 1; i >= 0; i--) {
                            const msg = _msg[i]
                            const label = msg.topic
                            lineCounts[label] = lineCounts[label] || 0
                            if (lineCounts[label] >= maxPoints) {
                                _msg.splice(i, 1)
                            } else {
                                lineCounts[label]++
                            }
                        }
                        datastore.save(node.id, _msg)
                    }

                    if (config.xAxisType === 'time' && config.removeOlder && config.removeOlderUnit) {
                        // remove any points older than the specified time
                        const removeOlder = parseFloat(config.removeOlder)
                        const removeOlderUnit = parseFloat(config.removeOlderUnit)
                        const ago = (removeOlder * removeOlderUnit) * 1000 // milliseconds ago
                        const cutoff = (new Date()).getTime() - ago
                        const _msg = datastore.get(node.id).filter((msg) => {
                            let timestamp = msg._datapoint.x
                            // is x already a millisecond timestamp?
                            if (typeof (msg._datapoint.x) === 'string') {
                                timestamp = (new Date(msg._datapoint.x)).getTime()
                            }
                            return timestamp > cutoff
                        })
                        datastore.save(node.id, _msg)
                    }

                    // check sizing limits
                }

                send(msg)
            }
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)
    }

    RED.nodes.registerType('ui-chart', ChartNode)
}
