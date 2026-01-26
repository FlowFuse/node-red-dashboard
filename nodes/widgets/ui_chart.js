const deepMerge = require('lodash.merge')

const datastore = require('../store/data.js')
const statestore = require('../store/state.js')

module.exports = function (RED) {
    function ChartNode (config) {
        const node = this

        // create node in Node-RED
        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)
        const base = group.getBase()

        // add a chartOptions object into the config
        config.chartOptions = config.chartOptions || {}

        // correct typing
        if (typeof config.xmin !== 'undefined') {
            config.xmin = parseFloat(config.xmin)
        }
        if (typeof config.xmax !== 'undefined') {
            config.xmax = parseFloat(config.xmax)
        }

        node.clearHistory = function () {
            const empty = []
            datastore.save(base, node, empty)
            // emit socket to front end to mimic an incoming message
            base.emit('msg-input:' + node.id, { payload: empty }, node)
        }

        function hasProperty (value, property) {
            const props = property.split('.')
            props.forEach((prop) => {
                if (value) {
                    value = value[prop]
                }
            })
            return typeof value !== 'undefined'
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

        /**
         * Given the config of the chart, clear "old" data points
         */
        function clearOldPoints () {
            const removeOlder = parseFloat(config.removeOlder)
            // only prune if removeOlder > 0
            if (removeOlder > 0) {
                const removeOlderUnit = parseFloat(config.removeOlderUnit)
                const ago = (removeOlder * removeOlderUnit) * 1000 // milliseconds ago
                const cutOff = (new Date()).getTime() - ago
                const filterFn = (msg) => {
                    let timestamp = msg._datapoint.x
                    // is x already a millisecond timestamp?
                    if (typeof (msg._datapoint.x) === 'string') {
                        timestamp = (new Date(msg._datapoint.x)).getTime()
                    }
                    return timestamp > cutOff
                }
                datastore.filter(base, node, filterFn)
            }
        }

        /**
         * For categorical xaxis and types other than histogram then only keep the latest data point for
         * each category in each series
         */
        function clearOldCategoricalPoints () {
            const points = datastore.get(node.id)
            const latestSet = {}
            for (const item of points) {
                const { category, x } = item._datapoint
                const key = JSON.stringify([category, x]) // a unique key for each category/series combination
                latestSet[key] = item
            }

            const filtered = Object.values(latestSet)
            datastore.save(base, node, filtered)
        }

        // ensure sane defaults
        if (!['msg', 'str', 'property', 'timestamp'].includes(config.xAxisPropertyType)) {
            config.xAxisPropertyType = 'timestamp' // default to 'timestamp'
        }
        if (!['msg', 'property'].includes(config.yAxisPropertyType)) {
            config.yAxisPropertyType = 'property' // default to 'key' for older chart nodes
        }
        if (config.xAxisPropertyType === 'msg' && !config.xAxisProperty) {
            config.xAxisPropertyType = 'property' // msg needs a property to evaluate, default to 'key'
        }
        if (config.yAxisPropertyType === 'msg' && !config.yAxisProperty) {
            config.yAxisPropertyType = 'property' // msg needs a property to evaluate, default to 'key'
        }
        config.xAxisProperty = config.xAxisProperty || ''
        config.yAxisProperty = config.yAxisProperty || ''

        if (!config.interpolation || typeof config.interpolation === 'undefined') {
            config.interpolation = 'linear'
        }

        // if area chart, force stacking, otherwise no stacking if it's not a bar chart
        if (config.chartType === 'area') {
            config.stackSeries = true
        } else if (config.chartType !== 'bar') {
            config.stackSeries = false
        }

        const evts = {
            // beforeSend will run before messages are sent client-side, as well as before sending on within Node-RED
            // here, we use it to pre-process chart data to format it ready for plotting
            beforeSend: function (msg) {
                const p = msg.payload

                let series = RED.util.evaluateNodeProperty(config.category, config.categoryType, node, msg)
                // if receiving a object payload, the series could be a within the payload
                if (config.categoryType === 'property' && config.category !== '') {
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
                            if (hasProperty(p, s)) {
                                const datapoint = addToChart(p, s)
                                points.push(datapoint)
                            }
                        })
                        msg._datapoint = points
                    } else {
                        msg._datapoint = addToChart(p, series)
                    }
                }

                const updates = msg.ui_update
                if (updates) {
                    if (typeof updates.chartOptions !== 'undefined') {
                        // merge chart options specified here in with any others previously set
                        const currentOptions = statestore.getProperty(node.id, 'chartOptions') ?? {}
                        // Deep merge new options in with old
                        const mergedOptions = deepMerge(currentOptions, updates.chartOptions)
                        statestore.set(group.getBase(), node, msg, 'chartOptions', mergedOptions)
                    }
                }

                function evaluateNodePropertyWithKey (node, msg, payload, property, propertyType) {
                    if (propertyType === 'property' /* AKA key */) {
                        return RED.util.evaluateNodeProperty(property, 'msg', node, payload)
                    }
                    return RED.util.evaluateNodeProperty(property, propertyType, node, msg)
                }

                // function to process a data point being appended to a line/scatter chart
                function addToChart (payload, series) {
                    const datapoint = {}
                    // we group/categorize data by "series"
                    datapoint.category = series

                    // construct our datapoint
                    if (typeof payload === 'number' || typeof payload === 'string') {
                        // do we have an x-property defined - if not, we're assuming time series
                        // since key would attempt to evaluate a property on a number, we don't do evaluation when
                        // x-axis is type is 'key' (only when it's 'msg' or 'str')
                        datapoint.x = config.xAxisPropertyType === 'msg' || config.xAxisPropertyType === 'str'
                            ? evaluateNodePropertyWithKey(node, msg, payload, config.xAxisProperty, config.xAxisPropertyType)
                            : (new Date()).getTime()
                        datapoint.y = payload
                    } else if (typeof payload === 'object') {
                        // let x = evaluateNodePropertyWithKey(node, msg, payload, config.xAxisProperty, config.xAxisPropertyType)
                        let x = null
                        // may have been given an x/y object already
                        // let x = getProperty(payload, config.xAxisProperty)
                        let y = payload.y
                        if (config.xAxisPropertyType === 'timestamp' || config.xAxisProperty === '') {
                            // no property defined, therefore use time
                            x = (new Date()).getTime()
                        } else {
                            // evaluate the x-axis property
                            x = evaluateNodePropertyWithKey(node, msg, payload, config.xAxisProperty, config.xAxisPropertyType)
                        }
                        if (Array.isArray(series)) {
                            // if the series is an array then y should be an array too, even if only of length 1
                            y = series.map((s) => {
                                return getProperty(payload, s)
                            })
                        } else {
                            if (config.categoryType === 'json') {
                                // we are using the "series" as a key to get the y value from the payload
                                y = getProperty(payload, series)
                            } else {
                                y = evaluateNodePropertyWithKey(node, msg, payload, config.yAxisProperty, config.yAxisPropertyType)
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
                // To prevent ui_update messages from deleting old data, skip this section if no msg.payload present
                if (typeof msg.payload !== 'undefined') {
                    if (Array.isArray(msg.payload) && !msg.payload.length) {
                        // clear history
                        datastore.save(base, node, [])
                    } else {
                        // delete old data if a replace is being performed.
                        // This is the case if msg.action is replace
                        // or the node is configured for replace and this is not being overriden by msg.action set to append
                        if (msg.action === 'replace' || (config.action === 'replace' && msg.action !== 'append')) {
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
                            // remove older points using datastore.filter instead of saving the whole array
                            const lineCounts = {}
                            const _msg = datastore.get(node.id) || []

                            // determine which message objects to keep (latest maxPoints per label)
                            const keepIndexes = []
                            let doFiltering = false
                            for (let i = _msg.length - 1; i >= 0; i--) {
                                const m = _msg[i]
                                const label = m.topic
                                lineCounts[label] = lineCounts[label] || 0
                                if (lineCounts[label] < maxPoints) {
                                    keepIndexes[i] = true
                                    lineCounts[label]++
                                } else {
                                    doFiltering = true
                                }
                            }

                            // filter the datastore to only keep the selected messages
                            if (doFiltering) {
                                datastore.filter(base, node, (m, i) => {
                                    return keepIndexes[i]
                                })
                            }
                        }

                        if (config.xAxisType === 'time' && config.removeOlder && config.removeOlderUnit) {
                            // remove any points older than the specified time
                            clearOldPoints()
                        } else if (config.xAxisType === 'category' && config.chartType !== 'histogram') {
                            // for categorical xaxis and types other than histogram then only keep the latest data point for
                            // each category in each series
                            clearOldCategoricalPoints()
                        }
                    }
                }

                send(msg)
            }
        }

        // inform the dashboard UI that we are adding this node
        if (group) {
            group.register(node, config, evts)
        } else {
            node.error('No group configured')
        }
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
