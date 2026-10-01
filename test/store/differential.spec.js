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

const runs = [
    ...Object.entries(scenarios).map(([name, steps]) => ({ name, steps })),
    ...Array.from({ length: 200 }, (_, i) => ({ name: `seed ${i + 1}`, steps: generate(i + 1, 120) })),
    ...Array.from({ length: 100 }, (_, i) => ({ name: `messy seed ${i + 1}`, steps: generateMessy(i + 1, 150) }))
]

let runIndex = 0

function prepare (steps) {
    const prefix = `diff-${runIndex++}:`
    const prefixed = steps.map((s) => ({ ...s, id: prefix + s.id }))
    return { steps: prefixed, ids: [...new Set(prefixed.map((s) => s.id))] }
}

function compareAfterEachStep (steps, ids) {
    const global = fakeGlobal()
    const warnings = []
    datastore.initStore(global, {})
    const nodeFor = (id, type) => ({ id, type, context: () => ({ global }), warn: (m) => warnings.push(m) })
    const legacy = createLegacy(RED)
    let comparedWithData = 0
    for (const step of steps) {
        runStep(datastore, step, { base, nodeFor })
        runStep(legacy, step, { base, nodeFor })
        should(datastore.get(step.id)).eql(legacy.get(step.id), `${step.id} after ${step.op}`)
        datastore.has(step.id).should.equal(legacy.has(step.id), `${step.id} after ${step.op}`)
        if (legacy.has(step.id)) {
            comparedWithData++
        }
    }
    for (const id of ids) {
        should(datastore.get(id)).eql(legacy.get(id), id)
    }
    return { comparedWithData, warnings }
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
                const { comparedWithData, warnings } = compareAfterEachStep(steps, ids)

                comparedWithData.should.be.above(0)
                warnings.should.eql([])
            })
        }
    })
})
