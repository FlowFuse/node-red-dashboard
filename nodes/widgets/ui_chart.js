module.exports = function (RED) {
    function ChartNode (config) {
        const node = this

        // create node in Node-RED
        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const evts = {
            beforeSend: function (msg) {
                const p = msg.payload
                const label = msg.topic
                if (config.chartType === 'line' || config.chartType === 'scatter') {
                    // possible that we haven't received any x-data in the payload,
                    // so let's make sure we append something
                    const datapoint = addToLine(p, label)
                    msg._datapoint = datapoint
                }

                // function to process a data point being appended to a line/scatter chart
                function addToLine (payload) {
                    const datapoint = {}
                    // construct our datapoint
                    if (typeof payload === 'number') {
                        // just a number, assume we're plotting a time series
                        datapoint.x = (new Date()).getTime()
                        datapoint.y = payload
                    } else if (typeof payload === 'object' && 'y' in payload) {
                        // may have been given an x/y object already
                        datapoint.x = payload.x || (new Date()).getTime()
                        datapoint.y = payload.y
                    }
                    return datapoint
                }
                return msg
            },
            onInput: function (msg, send, done) {
                // use our own custom onInput in order to store history of msg payloads
                if (!node._msg) {
                    node._msg = []
                }
                if (Array.isArray(msg.payload) && !msg.payload.length) {
                    // clear history
                    node._msg = []
                } else {
                    // quick clone of msg, and sore in history
                    node._msg.push({ ...msg })

                    if (config.xAxisType === 'category') {
                        // filters the node._msg array so that we keep just the latest msg with each category
                        const seen = {}
                        node._msg.forEach((msg, index) => {
                            // loop through and record the latest index seen for each topic/label
                            seen[msg.topic] = index
                        })
                        const indices = Object.values(seen)
                        node._msg = node._msg.filter((msg, index) => {
                            // return only the msgs with the latest index for each topic/label
                            return indices.includes(index)
                        })
                    } else if (config.xAxisType === 'time' && config.removeOlder && config.removeOlderUnit) {
                        const removeOlder = parseFloat(config.removeOlder)
                        const removeOlderUnit = parseFloat(config.removeOlderUnit)
                        const ago = (removeOlder * removeOlderUnit) * 1000 // milliseconds ago
                        const cutoff = (new Date()).getTime() - ago
                        node._msg = node._msg.filter((msg) => {
                            return msg._datapoint.x > cutoff
                        })
                    }

                    if (config.removeOlderPoints) {
                        // remove older points
                        const maxPoints = parseInt(config.removeOlderPoints)
                        if (maxPoints > 0) {
                            node._msg = node._msg.slice(-maxPoints)
                        }
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
