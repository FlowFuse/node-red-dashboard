const { util } = require('@node-red/util')
const should = require('should') // eslint-disable-line no-unused-vars

const datastore = require('../../nodes/store/data.js')

const createLegacy = require('./helpers/legacy-datastore.js')
const { scenarios, generate, generateMessy, runStep } = require('./helpers/sequences.js')

const RED = { util, plugins: { getByType: () => [] } }
const base = { acceptsClientConfig: ['ui-scoped'] }

function fakeGlobal () {
    const m = {}
    return { get: (k) => m[k], set: (k, v) => { m[k] = v } }
}

function cacheOffGlobal () {
    return { get () { throw new Error('File Store cache disabled - only asynchronous access supported') }, set () {} }
}

const runs = [
    ...Object.entries(scenarios).map(([name, steps]) => ({ name, steps })),
    ...Array.from({ length: 200 }, (_, i) => ({ name: `seed ${i + 1}`, steps: generate(i + 1, 180) })),
    ...Array.from({ length: 100 }, (_, i) => ({ name: `messy seed ${i + 1}`, steps: generateMessy(i + 1, 150) }))
]

let runIndex = 0

function prepare (steps) {
    const prefix = `diff-${runIndex++}:`
    const prefixed = steps.map((s) => ({ ...s, id: prefix + s.id }))
    return { steps: prefixed, ids: [...new Set(prefixed.map((s) => s.id))] }
}

function scribble (value, seen = new Set()) {
    if (!value || typeof value !== 'object' || seen.has(value)) {
        return
    }
    seen.add(value)
    for (const key of Object.keys(value)) {
        if (value[key] && typeof value[key] === 'object') {
            scribble(value[key], seen)
        } else {
            value[key] = 'scribbled'
        }
    }
    if (Array.isArray(value)) {
        value.push('scribbled')
    }
}

function storeHolds (global, id) {
    const store = global.get('dashboardStore')
    return store['$' + id]?.msg
}

function seriesInStep (global, id) {
    const store = global.get('dashboardStore')
    const msgs = store['$' + id]?.msg
    if (!Array.isArray(msgs)) {
        return
    }
    const points = msgs.flatMap((m) => (m._datapoint === undefined || m._datapoint === null) ? [] : [].concat(m._datapoint))
    should(store[id]).eql(points, `value of ${id} matches its messages' points`)
}

function compareAfterEachStep (steps, ids, global = fakeGlobal()) {
    const warnings = []
    const baseNode = { warn: (m) => warnings.push(m) }
    const shared = datastore.initStore(global, { node: baseNode })
    const nodeFor = (id, type) => ({ id, type, context: () => ({ global }), warn: (m) => warnings.push(m) })
    const legacy = createLegacy(RED)
    let comparedWithData = 0
    for (const [i, step] of steps.entries()) {
        if (i === Math.floor(steps.length / 2)) {
            datastore.initStore(global, { node: baseNode })
        }
        const given = structuredClone(step)
        runStep(datastore, given, { base, nodeFor })
        runStep(legacy, structuredClone(step), { base, nodeFor })
        should(datastore.get(step.id)).eql(legacy.get(step.id), `${step.id} after ${step.op}`)
        scribble(given)
        should(datastore.get(step.id)).eql(legacy.get(step.id), `${step.id} after scribbling what ${step.op} was given`)
        scribble(datastore.get(step.id))
        should(datastore.get(step.id)).eql(legacy.get(step.id), `${step.id} after scribbling what get returned`)
        datastore.has(step.id).should.equal(legacy.has(step.id), `${step.id} after ${step.op}`)
        if (shared) {
            should(storeHolds(global, step.id)).eql(legacy.get(step.id), `store for ${step.id} after ${step.op}`)
            seriesInStep(global, step.id)
        }
        if (legacy.has(step.id)) {
            comparedWithData++
        }
    }
    for (const id of ids) {
        should(datastore.get(id)).eql(legacy.get(id), id)
        if (shared) {
            should(storeHolds(global, id)).eql(legacy.get(id), `store for ${id}`)
            seriesInStep(global, id)
        }
    }
    return { comparedWithData, warnings, shared }
}

function compareAtEnd (steps, ids) {
    const global = fakeGlobal()
    const warnings = []
    datastore.initStore(global, { node: { warn: (m) => warnings.push(m) } })
    const nodeFor = (id, type) => ({ id, type, context: () => ({ global }), warn: (m) => warnings.push(m) })
    const legacy = createLegacy(RED)
    for (const step of steps) {
        runStep(datastore, structuredClone(step), { base, nodeFor })
        runStep(legacy, structuredClone(step), { base, nodeFor })
    }
    const withData = ids.filter((id) => legacy.has(id))
    for (const id of ids) {
        should(storeHolds(global, id)).eql(legacy.get(id), `store for ${id}`)
        seriesInStep(global, id)
    }
    return { withData, warnings }
}

describe('store: differential against the legacy datastore', function () {
    beforeEach(function () {
        datastore.setConfig(RED)
    })

    afterEach(function () {
        datastore.initStore(fakeGlobal(), {})
    })

    describe('data.js matches the legacy reference', function () {
        for (const run of runs) {
            it(run.name, function () {
                const { steps, ids } = prepare(run.steps)
                const { comparedWithData, warnings, shared } = compareAfterEachStep(steps, ids)

                should(shared).not.be.null()
                comparedWithData.should.be.above(0)
                warnings.should.eql([])
            })
        }
    })

    describe('data.js matches the legacy reference when global context cannot hold the store', function () {
        for (const run of runs) {
            it(run.name, function () {
                const { steps, ids } = prepare(run.steps)
                const { comparedWithData, warnings, shared } = compareAfterEachStep(steps, ids, cacheOffGlobal())

                should(shared).be.null()
                comparedWithData.should.be.above(0)
                warnings.should.eql([])
            })
        }
    })

    describe('the store matches the legacy reference when only read at the end', function () {
        let runsWithData = 0

        for (const run of runs) {
            it(run.name, function () {
                const { steps, ids } = prepare(run.steps)
                const { withData, warnings } = compareAtEnd(steps, ids)

                if (withData.length) {
                    runsWithData++
                }
                warnings.should.eql([])
            })
        }

        it('compared stored data at the end of most runs', function () {
            runsWithData.should.be.above(runs.length * 0.9)
        })
    })
})
