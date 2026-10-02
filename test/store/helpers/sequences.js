const pt = (x, y, category = 'a') => ({ category, x, y })

function mulberry32 (seed) {
    return function () {
        seed |= 0
        seed = seed + 0x6D2B79F5 | 0
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
        return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
}

const repeat = (n, make) => Array.from({ length: n }, (_, i) => make(i))

function hasExtraProps (message) {
    const allowed = ['_msgid', 'ui_update', 'class', 'visible', 'enabled']
    const keys = Object.keys(message).filter((key) => message[key] !== undefined)
    return keys.length > 0 && keys.some((key) => !allowed.includes(key))
}

const chartPoint = (x, topic) => {
    const msg = { payload: x, _datapoint: pt(x, x, topic || 'a') }
    if (topic !== undefined) {
        msg.topic = topic
    }
    return msg
}

const scenarios = {
    text: [
        { op: 'input', id: 't', msg: { payload: 1, topic: 'first' } },
        { op: 'input', id: 't', msg: { topic: 'second' } },
        { op: 'input', id: 't', msg: { payload: 2, ui_update: { label: 'x' } } },
        { op: 'input', id: 't', msg: { class: 'big' } },
        { op: 'input', id: 't', msg: { payload: { nested: [1, 2] }, extra: true } }
    ],
    switch: [
        { op: 'switchSave', id: 'sw', msg: { payload: true, topic: 'on' } },
        { op: 'switchSave', id: 'sw', msg: { class: 'highlight' } },
        { op: 'switchSave', id: 'sw', msg: { payload: false } }
    ],
    'value-widget-change': [
        { op: 'input', id: 'v', msg: { payload: 10, topic: 'slider' } },
        { op: 'change', id: 'v', value: 20, client: 's1' },
        { op: 'change', id: 'v', value: { payload: 30 } },
        { op: 'input', id: 'v', msg: { payload: 40 } },
        { op: 'change', id: 'v', value: 50, topic: 'configured' }
    ],
    'table-append': [
        ...repeat(4, (i) => ({ op: 'table', id: 'tb', action: 'append', msg: { payload: [{ id: i }, { id: i + 100 }], topic: 'rows' } })),
        { op: 'table', id: 'tb', action: 'append', msg: { payload: { id: 'single' } } },
        { op: 'table', id: 'tb', action: 'append', msg: { payload: [] } }
    ],
    'table-replace': repeat(4, (i) => ({ op: 'table', id: 'tr', action: 'replace', msg: { payload: [{ id: i }] } })),
    'chart-time': repeat(200, (i) => ({ op: 'chart', id: 'ct', msg: chartPoint(i, 'a'), window: 40 })),
    'chart-points': repeat(300, (i) => ({ op: 'chart', id: 'cp', msg: chartPoint(i, ['a', 'b', 'c'][i % 3]), maxPoints: 50 })),
    'chart-both-limits': repeat(200, (i) => ({ op: 'chart', id: 'cb', msg: chartPoint(i, ['a', 'b'][i % 2]), maxPoints: 20, window: 30 })),
    'chart-array-payload': repeat(20, (i) => ({ op: 'chart', id: 'cm', msg: { payload: [i, i * 2], _datapoint: [pt(i, i, 'a'), pt(i, i * 2, 'b')] } })),
    'chart-object-payload': repeat(20, (i) => ({ op: 'chart', id: 'co', msg: { payload: { a: i, b: i * 2 }, _datapoint: [pt(i, i, 'a'), pt(i, i * 2, 'b')] } })),
    'chart-replace-clear': [
        ...repeat(10, (i) => ({ op: 'chart', id: 'cr', msg: chartPoint(i) })),
        { op: 'chart', id: 'cr', msg: { ...chartPoint(50), action: 'replace' } },
        ...repeat(5, (i) => ({ op: 'chart', id: 'cr', msg: chartPoint(60 + i) })),
        { op: 'chart', id: 'cr', msg: { payload: [] } },
        ...repeat(3, (i) => ({ op: 'chart', id: 'cr', msg: chartPoint(70 + i) }))
    ],
    'chart-categorical': repeat(30, (i) => ({ op: 'chart', id: 'cc', categorical: true, msg: { payload: i, _datapoint: pt(['mon', 'tue', 'wed'][i % 3], i, 'sales') } })),
    'client-scoped': [
        { op: 'input', id: 'cs', type: 'ui-scoped', msg: { payload: 'everyone' } },
        { op: 'input', id: 'cs', type: 'ui-scoped', msg: { payload: 'one client', _client: { socketId: 's1' } } },
        { op: 'chart', id: 'csa', type: 'ui-scoped', msg: { ...chartPoint(1), _client: { clientId: 'c1' } } },
        { op: 'chart', id: 'csa', type: 'ui-scoped', msg: chartPoint(2) }
    ],
    'audio-clear': [
        { op: 'input', id: 'au', msg: { payload: 'hello' } },
        { op: 'clear', id: 'au' },
        { op: 'input', id: 'au', msg: { topic: 'after clear' } }
    ],
    'widget-remove': [
        ...repeat(5, (i) => ({ op: 'chart', id: 'wr', msg: chartPoint(i), maxPoints: 3 })),
        { op: 'remove', id: 'wr' },
        ...repeat(5, (i) => ({ op: 'chart', id: 'wr', msg: chartPoint(10 + i), maxPoints: 3 }))
    ]
}

function generate (seed, length) {
    const rand = mulberry32(seed)
    const pick = (list) => list[Math.floor(rand() * list.length)]
    const chartConfig = () => {
        const mode = pick(['none', 'time', 'points', 'both'])
        return {
            window: mode === 'time' || mode === 'both' ? 5 + Math.floor(rand() * 30) : undefined,
            maxPoints: mode === 'points' || mode === 'both' ? 1 + Math.floor(rand() * 5) : undefined
        }
    }
    const charts = { g1: chartConfig(), g3: chartConfig() }
    const steps = []
    for (let i = 0; i < length; i++) {
        const id = pick(['g0', 'g1', 'g2', 'g3'])
        const topic = pick(['a', 'b', undefined])
        const roll = rand()
        if (roll < 0.03) {
            steps.push({ op: pick(['clear', 'remove']), id })
        } else if (id === 'g0') {
            const msg = {}
            if (rand() < 0.8) { msg.payload = Math.floor(rand() * 100) }
            if (topic !== undefined) { msg.topic = topic }
            if (rand() < 0.2) { msg.ui_update = { label: 'l' + i } }
            if (rand() < 0.2) { msg.extra = { n: i } }
            steps.push(roll < 0.5 ? { op: 'input', id, msg } : roll < 0.75 ? { op: 'switchSave', id, msg } : { op: 'change', id, value: Math.floor(rand() * 100), client: rand() < 0.5 ? 's1' : undefined })
        } else if (id === 'g2') {
            steps.push({ op: 'table', id, action: roll < 0.7 ? 'append' : 'replace', msg: { payload: rand() < 0.1 ? [] : [{ id: i }] } })
        } else {
            const msg = roll < 0.92 ? chartPoint(i, topic) : roll < 0.96 ? { payload: [] } : { ...chartPoint(i, topic), action: 'replace' }
            steps.push({ op: 'chart', id, msg, ...charts[id], cutoffAt: i })
        }
    }
    return steps
}

function generateMessy (seed, length) {
    const rand = mulberry32(seed)
    const pick = (list) => list[Math.floor(rand() * list.length)]
    const steps = []
    for (let i = 0; i < length; i++) {
        const id = pick(['m0', 'm1'])
        const roll = rand()
        const x = Math.floor(rand() * 200)
        if (roll < 0.45) {
            steps.push({ op: 'chart', id, msg: chartPoint(x, pick(['a', 'b', undefined])) })
        } else if (roll < 0.6) {
            steps.push({ op: 'filterTime', id, cutoff: Math.floor(rand() * 150) })
        } else if (roll < 0.72) {
            steps.push({ op: 'keep', id, maxPoints: 1 + Math.floor(rand() * 6) })
        } else if (roll < 0.82) {
            steps.push({ op: 'filterIndex', id, skip: Math.floor(rand() * 3) })
        } else if (roll < 0.9) {
            steps.push({ op: 'chart', id, categorical: true, msg: chartPoint(x) })
        } else if (roll < 0.95) {
            steps.push({ op: 'saveArray', id, msgs: rand() < 0.5 ? [] : [chartPoint(x)] })
        } else {
            steps.push({ op: pick(['clear', 'remove']), id })
        }
    }
    return steps
}

function chartInput (target, base, node, step) {
    const { msg } = step
    if (!target.has(step.id)) {
        target.save(base, node, [])
    }
    if (typeof msg.payload === 'undefined') {
        return
    }
    if (Array.isArray(msg.payload) && !msg.payload.length) {
        target.save(base, node, [])
        return
    }
    if (msg.action === 'replace') {
        target.save(base, node, [])
    }
    if (!Array.isArray(msg.payload)) {
        target.append(base, node, { ...msg })
    } else {
        msg.payload.forEach((p, i) => {
            target.append(base, node, { ...msg, payload: JSON.parse(JSON.stringify(p)), _datapoint: msg._datapoint ? msg._datapoint[i] : null })
        })
    }
    if (step.maxPoints) {
        target.keepLatestPerTopic(base, node, step.maxPoints)
    }
    if (step.window) {
        const cutoff = (step.cutoffAt ?? [].concat(msg._datapoint)[0].x) - step.window
        target.filter(base, node, (m) => [].concat(m._datapoint)[0]?.x > cutoff)
    } else if (step.categorical) {
        const latest = {}
        for (const item of target.get(step.id) || []) {
            latest[JSON.stringify([item._datapoint.category, item._datapoint.x])] = item
        }
        target.save(base, node, Object.values(latest))
    }
}

function changeInput (target, base, node, step) {
    const msg = target.get(step.id) || {}
    if (step.client) {
        msg._client = { ...msg._client, socketId: step.client }
    }
    msg.payload = (typeof step.value === 'object' && step.value !== null && 'payload' in step.value) ? step.value.payload : step.value
    if (step.topic !== undefined) {
        msg.topic = step.topic
    }
    if (!('topic' in msg)) {
        msg.topic = ''
    }
    target.save(base, node, msg)
}

function tableInput (target, base, node, step) {
    const existing = target.get(step.id) || []
    const value = step.msg.payload
    let payload = (value !== null && typeof value === 'object' && !Array.isArray(value)) ? [value] : value
    if (step.action === 'append') {
        payload = payload && payload.length > 0 ? [...existing.payload || [], ...payload || []] : payload
    }
    target.save(base, node, { ...step.msg, payload })
}

function runStep (target, step, { base, nodeFor }) {
    const node = nodeFor(step.id, step.type || 'ui-test')
    if (step.op === 'input') {
        if (hasExtraProps(step.msg)) {
            target.save(base, node, step.msg)
        }
    } else if (step.op === 'switchSave') {
        target.save(base, node, step.msg)
    } else if (step.op === 'change') {
        changeInput(target, base, node, step)
    } else if (step.op === 'table') {
        tableInput(target, base, node, step)
    } else if (step.op === 'chart') {
        chartInput(target, base, node, step)
    } else if (step.op === 'saveArray') {
        target.save(base, node, step.msgs)
    } else if (step.op === 'filterTime') {
        target.filter(base, node, (m) => m._datapoint && [].concat(m._datapoint)[0].x > step.cutoff)
    } else if (step.op === 'filterIndex') {
        target.filter(base, node, (m, i) => i >= step.skip)
    } else if (step.op === 'keep') {
        target.keepLatestPerTopic(base, node, step.maxPoints)
    } else if (step.op === 'clear') {
        target.clear(step.id)
    } else if (step.op === 'remove') {
        target.clear(step.id)
    }
}

module.exports = { scenarios, generate, generateMessy, runStep }
