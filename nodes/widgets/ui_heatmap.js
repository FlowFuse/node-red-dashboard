const datastore = require('../store/data.js')

module.exports = function (RED) {
    function HeatmapNode (config) {
        const node = this

        // create node in Node-RED
        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)
        const base = group.getBase()

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
                return msg
            },
            onInput: function (msg, send, done) {
                debugger;
                if (msg.topic == 'setData' || msg.topic == 'addData') {
                    if (!Array.isArray(msg.payload)) {
                        throw Error('For topic setData or addData the payload should contain an array');
                    }

                    if (msg.payload.length > 0) {
                        if (msg.payload.every(element => typeof element === "number")) {
                            if (msg.payload.length != config.rows * config.columns) {
                                throw Error('When the payload is an array of numbers, there should be row * column numbers');
                            }

                            // Convert the array of integers to an array of objects (containing x, y, value properties)
                            let convertedInputArray = [];
                            for (let row = 0; row < config.rows; row++) {
                                for (let column = 0; column < config.columns; column++) {
                                    let index = row * config.columns + column
                                    convertedInputArray.push({
                                        row: row,
                                        column: column,
                                        value: msg.payload[index]
                                    })
                                }
                            }
                            msg.payload = convertedInputArray;
                        }
                        else {
                            if (!msg.payload.every(item => typeof item === "object" &&
                                                     item.hasOwnProperty('row') &&
                                                     item.hasOwnProperty('column') &&
                                                     item.hasOwnProperty('value') &&
                                                     typeof item.row === "number" &&
                                                     item.row < config.rows &&
                                                     typeof item.column === "number" &&
                                                     item.column < config.columns &&
                                                     typeof item.value === "number")) {
                                throw Error('The payload should be an array of numbers or an array of objects (with row,column,value properties)');
                            }
                        }
                    }
                }

                if (msg.topic == 'setData') {
                    // When a new data array is being set, store a copy of it
                    datastore.save(base, node, msg.payload.slice());
                }
                else if (msg.topic == 'addData') {
                    // When new data (array) is being added, append a copy of it to the currently stored array
                    let storedData = datastore.get(node.id) || [];
                    storedData.push(msg.payload.slice());
                    datastore.save(base, node, storedData);
                }

                send(msg)
            }
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)
    }

    RED.nodes.registerType('ui-heatmap', HeatmapNode);
}
