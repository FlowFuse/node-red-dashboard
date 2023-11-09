const data = {}

const getters = {
    // given a widget id, return the latest msg received
    msg (id) {
        return data[id]
    }
}

const setters = {
    // remove data associated to a given widget
    clear (id) {
        delete data[id]
    },
    // given a widget id, and msg, store that latest value
    save (id, msg) {
        data[id] = msg
    },
    // given a widget id, and msg, store in an array of history of values
    // useful for charting widgets
    append (id, msg) {
        if (!data[id]) {
            data[id] = []
        }
        data[id].push(msg)
    }
}

module.exports = {
    get: getters.msg,
    save: setters.save,
    append: setters.append,
    clear: setters.clear
}
