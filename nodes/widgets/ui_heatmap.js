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
                switch (msg.topic) {
                    case 'setData':
                        if (!Array.isArray(msg.payload) || msg.payload.length == 0) {
                            throw Error('For topic setData the payload should contain an (non-empty) array');
                        }

                        // The input array can contain numeric values, or objects (with a row, column and value properties)
                        if (msg.payload.every(element => typeof element === "number")) {
                        
                            if (msg.payload.length > config.rows * config.columns) {
                                throw Error('The array length should not exceed the number of grid cells');
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
                                throw Error('When setting data, the payload should be an array of numbers or an array of objects (with row,column and value properties)');
                            }
                        }

                        // When a new data array is being set, store a copy of it
                        datastore.save(base, node, msg.payload.slice());
                        break;

                    case 'addData':
                        if (!Array.isArray(msg.payload) || msg.payload.length == 0) {
                            throw Error('For topic setData the payload should contain an (non-empty) array');
                        }

                        // The input array can contain objects (with a row, column and value properties).
                        // The array cannot contain numbers, because we would have no idea where to display these in the heatmap.
                        if (!msg.payload.every(item => typeof item === "object" &&
                                                 item.hasOwnProperty('row') &&
                                                 item.hasOwnProperty('column') &&
                                                 item.hasOwnProperty('value') &&
                                                 typeof item.row === "number" &&
                                                 item.row < config.rows &&
                                                 typeof item.column === "number" &&
                                                 item.column < config.columns &&
                                                 typeof item.value === "number")) {
                            throw Error('When adding data, the payload should be an array of objects (with row,column and value properties)');
                        }

                        // When new data (array) is being added, append a copy of it to the currently stored array
                        let storedData = datastore.get(node.id) || [];
                        storedData.push(msg.payload.slice());
                        datastore.save(base, node, storedData);
                        break;
                    case 'clear':
                        datastore.clear();
                        break;
                }

                send(msg)
            }
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)
    }

    RED.nodes.registerType('ui-heatmap', HeatmapNode);
}
