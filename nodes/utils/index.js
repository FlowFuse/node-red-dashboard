function asyncEvaluateNodeProperty (RED, value, type, node, msg) {
    return new Promise(function (resolve, reject) {
        RED.util.evaluateNodeProperty(value, type, node, msg, function (e, r) {
            if (e) {
                reject(e)
            } else {
                resolve(r)
            }
        })
    })
}

async function appendTopic (RED, config, wNode, msg) {
    // populate topic if the node specifies one
    if (config.topic || config.topicType) {
        try {
            msg.topic = await asyncEvaluateNodeProperty(RED, config.topic, config.topicType || 'str', wNode, msg) || ''
        } catch (_err) {
            // do nothing
            console.error(_err)
        }
    }

    // ensure we have a topic property in the msg, even if it's an empty string
    if (!('topic' in msg)) {
        msg.topic = ''
    }

    return msg
}

module.exports = {
    asyncEvaluateNodeProperty,
    appendTopic
}
