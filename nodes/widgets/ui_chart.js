const datastore = require('../store/data.js')

module.exports = function (RED) {
    function ChartNode (config) {
        const node = this

        // create node in Node-RED
        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)
        const base = group.getBase()

        node.clearHistory = function () {
            const empty = []
            datastore.save(base, node, empty)
            // emit socket to front end to mimic an incoming message
            base.emit('msg-input:' + node.id, { payload: empty }, node)
        }

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
            // beforeSend will run before messages are sent client-side, as well as before sending on within Node-RED
            // here, we use it to pre-process chart data to format it ready for plotting
            beforeSend: function (msg) {
                const p = msg.payload

                let series = RED.util.evaluateNodeProperty(config.category, config.categoryType, node, msg)
                // if receiving a object payload, the series could be a within the payload
                if (config.categoryType === 'property') {
                    series = getProperty(p, config.category)
                }

                // single point or array of data?
                if (Array.isArray(p)) {
                    // array of data
                    msg._datapoint = p.map((point) => {
                        // series available on a msg by msg basis - ensure we check for each msg
                        if (config.categoryType === 'property') {
                            series = getProperty(point, config.category)
                        }
                        return addToChart(point, series)
                    })
                } else {
                    // single point
                    if (config.categoryType === 'json') {
                        // we can produce multiple datapoints from a single object/value here
                        const points = []
                        series.forEach((s) => {
                            if (s in p) {
                                const datapoint = addToChart(p, s)
                                points.push(datapoint)
                            }
                        })
                        msg._datapoint = points
                    } else {
                        msg._datapoint = addToChart(p, series)
                    }
                }

                // function to process a data point being appended to a line/scatter chart
                function addToChart (payload, series) {
                    const datapoint = {}
                    // we group/categorize data by "series"
                    datapoint.category = series

                    // get our x value, if set
                    if (config.xAxisPropertyType === 'msg' && config.xAxisProperty === '') {
                        // handle a missing declaration of x-axis property, and backup to time series
                        config.xAxisPropertyType = 'property'
                    }
                    const x = RED.util.evaluateNodeProperty(config.xAxisProperty, config.xAxisPropertyType, node, msg)

                    // construct our datapoint
                    if (typeof payload === 'number') {
                        // do we have an x-property defined - if not, we're assuming time series
                        datapoint.x = config.xAxisProperty !== '' ? x : (new Date()).getTime()
                        datapoint.y = payload
                    } else if (typeof payload === 'object') {
                        // may have been given an x/y object already
                        let x = getProperty(payload, config.xAxisProperty)
                        let y = payload.y
                        if (x === undefined || x === null) {
                            x = (new Date()).getTime()
                        }
                        if (Array.isArray(series)) {
                            if (series.length > 1) {
                                y = series.map((s) => {
                                    return getProperty(payload, s)
                                })
                            } else {
                                y = getProperty(payload, series[0])
                            }
                        }
                        datapoint.x = x
                        datapoint.y = y
                    }
                    return datapoint
                }

                return msg
            },
            onInput: function (msg, send, done) {
                // use our own custom onInput in order to store history of msg payloads
                if (!datastore.get(node.id)) {
                    datastore.save(base, node, [])
                }
                if (Array.isArray(msg.payload) && !msg.payload.length) {
                    // clear history
                    datastore.save(base, node, [])
                } else {
                    if (config.action === 'replace') {
                        // clear our data store as we are replacing data
                        datastore.save(base, node, [])
                    }
                    if (!Array.isArray(msg.payload)) {
                        // quick clone of msg, and store in history
                        datastore.append(base, node, {
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
                            datastore.append(base, node, m)
                        })
                    }

                    const maxPoints = parseInt(config.removeOlderPoints)

                    if (maxPoints && config.removeOlderPoints) {
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
                        datastore.save(base, node, _msg)
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
                        datastore.save(base, node, _msg)
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

    // Add HTTP Admin endpoint to permit reset of chart history
    RED.httpAdmin.post('/dashboard/chart/:id/clear', RED.auth.needsPermission('ui-chart.write'), function (req, res) {
        const node = RED.nodes.getNode(req.params.id)
        if (node) {
            if (node.type === 'ui-chart') {
                node.clearHistory()
                res.sendStatus(200)
            } else {
                res.sendStatus(400, 'Requested node is not of type "ui-chart"')
            }
        } else {
            res.sendStatus(404)
        }
    })
}
