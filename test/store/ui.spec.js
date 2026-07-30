const should = require('should') // eslint-disable-line no-unused-vars

// Unit tests for the getters of the Vuex `ui` store (ui/src/store/ui.mjs).
describe('store: ui getters', function () {
    let ui
    before(async function () {
        // ui/src/store/ui.mjs is an ES module with no imports of its own, so it can be dynamically imported straight
        // into this (CommonJS) mocha spec.
        ui = (await import('../../ui/src/store/ui.mjs')).default
    })

    // `widgetsByGroup` orders the widgets rendered inside a group. See FlowFuse/node-red-dashboard#710: widgets housed
    // in a subflow could only be positioned before or after the whole block of regular widgets, never interleaved
    // between them.
    describe('widgetsByGroup', function () {

      // Each test lists the widgets present (in arbitrary input order) and asserts the ids we expect back in render
        // order. Widgets use the same shape as the `state.widgets` entries built by the ui-base node:
        // { id, type, props, layout }.
        function orderOf (widgets, group = 'g1') {
            const state = { widgets: Object.fromEntries(widgets.map((w) => [w.id, w])) }
            return ui.getters.widgetsByGroup(state)(group).map((w) => w.id)
        }

        it('interleaves a subflow between regular widgets (#710)', function () {
            const widgets = [
                { id: 'a', type: 'ui-text', props: { group: 'g1' }, layout: { order: 1 } },
                { id: 'b', type: 'ui-text', props: { group: 'g1' }, layout: { order: 3 } },
                { id: 's', type: 'ui-template', props: { group: 'g1', templateScope: 'local', subflow: { id: 'sf1', order: 2 } }, layout: { order: 1 } }
            ]
            orderOf(widgets).should.eql(['a', 's', 'b'])
        })

        it('places a subflow at the top of the group', function () {
            const widgets = [
                { id: 'a', type: 'ui-text', props: { group: 'g1' }, layout: { order: 2 } },
                { id: 'b', type: 'ui-text', props: { group: 'g1' }, layout: { order: 3 } },
                { id: 's', type: 'ui-template', props: { group: 'g1', templateScope: 'local', subflow: { id: 'sf1', order: 1 } }, layout: { order: 1 } }
            ]
            orderOf(widgets).should.eql(['s', 'a', 'b'])
        })

        it('places a subflow at the bottom of the group', function () {
            const widgets = [
                { id: 'a', type: 'ui-text', props: { group: 'g1' }, layout: { order: 1 } },
                { id: 'b', type: 'ui-text', props: { group: 'g1' }, layout: { order: 2 } },
                { id: 's', type: 'ui-template', props: { group: 'g1', templateScope: 'local', subflow: { id: 'sf1', order: 99 } }, layout: { order: 1 } }
            ]
            orderOf(widgets).should.eql(['a', 'b', 's'])
        })

        it('sorts a regular-only group purely by layout.order', function () {
            const widgets = [
                { id: 'a', type: 'ui-text', props: { group: 'g1' }, layout: { order: 3 } },
                { id: 'b', type: 'ui-text', props: { group: 'g1' }, layout: { order: 1 } },
                { id: 'c', type: 'ui-text', props: { group: 'g1' }, layout: { order: 2 } }
            ]
            orderOf(widgets).should.eql(['b', 'c', 'a'])
        })

        it('keeps widgets of one subflow instance (mixed types) contiguous and internally ordered by layout.order', function () {
            // Subflow "sf1" contributes two widgets of different types (a ui-text and a ui-template), with s2 before s1
            // by layout.order, and sits as a block at subflow.order 2 - i.e. between regular widgets a and b.
            const widgets = [
                { id: 'a', type: 'ui-text', props: { group: 'g1' }, layout: { order: 1 } },
                { id: 'b', type: 'ui-text', props: { group: 'g1' }, layout: { order: 3 } },
                { id: 's1', type: 'ui-template', props: { group: 'g1', templateScope: 'local', subflow: { id: 'sf1', order: 2 } }, layout: { order: 2 } },
                { id: 's2', type: 'ui-text', props: { group: 'g1', subflow: { id: 'sf1', order: 2 } }, layout: { order: 1 } }
            ]
            orderOf(widgets).should.eql(['a', 's2', 's1', 'b'])
        })

        it('interleaves multiple subflows and regular widgets in the shared order space', function () {
            const widgets = [
                { id: 'a', type: 'ui-text', props: { group: 'g1' }, layout: { order: 1 } },
                { id: 'b', type: 'ui-text', props: { group: 'g1' }, layout: { order: 3 } },
                { id: 'sfA', type: 'ui-template', props: { group: 'g1', templateScope: 'local', subflow: { id: 'sfA', order: 2 } }, layout: { order: 1 } },
                { id: 'sfB', type: 'ui-template', props: { group: 'g1', templateScope: 'local', subflow: { id: 'sfB', order: 4 } }, layout: { order: 1 } }
            ]
            orderOf(widgets).should.eql(['a', 'sfA', 'b', 'sfB'])
        })

        it('excludes non-local scoped ui-templates', function () {
            const widgets = [
                { id: 'a', type: 'ui-text', props: { group: 'g1' }, layout: { order: 1 } },
                { id: 'global', type: 'ui-template', props: { group: 'g1', templateScope: 'global' }, layout: { order: 2 } },
                { id: 'site', type: 'ui-template', props: { group: 'g1', templateScope: 'site:foo' }, layout: { order: 3 } }
            ]
            orderOf(widgets).should.eql(['a'])
        })

        it('only returns widgets belonging to the requested group', function () {
            const widgets = [
                { id: 'a', type: 'ui-text', props: { group: 'g1' }, layout: { order: 1 } },
                { id: 'b', type: 'ui-text', props: { group: 'g2' }, layout: { order: 1 } }
            ]
            orderOf(widgets, 'g1').should.eql(['a'])
        })

        it('sinks widgets with an unset/zero order to the end', function () {
            const widgets = [
                { id: 'a', type: 'ui-text', props: { group: 'g1' }, layout: { order: 0 } },
                { id: 'b', type: 'ui-text', props: { group: 'g1' }, layout: { order: 2 } },
                { id: 'c', type: 'ui-text', props: { group: 'g1' }, layout: { order: 1 } }
            ]
            orderOf(widgets).should.eql(['c', 'b', 'a'])
        })

        it('sinks a subflow with an unset/zero order to the end', function () {
            const widgets = [
                { id: 'a', type: 'ui-text', props: { group: 'g1' }, layout: { order: 1 } },
                { id: 'b', type: 'ui-text', props: { group: 'g1' }, layout: { order: 2 } },
                { id: 's', type: 'ui-template', props: { group: 'g1', templateScope: 'local', subflow: { id: 'sf1', order: 0 } }, layout: { order: 1 } }
            ]
            orderOf(widgets).should.eql(['a', 'b', 's'])
        })
    })
})
