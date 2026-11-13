const should = require('should') // eslint-disable-line no-unused-vars

const { uiAction } = require('../../ui/src/util/ui-action.js')

const pages = {
    a: { id: 'a', type: 'ui-page', name: 'A', order: 1 },
    b: { id: 'b', type: 'ui-page', name: 'B', order: 2 },
    c: { id: 'c', type: 'ui-page', name: 'C', order: 3 },
    d: { id: 'd', type: 'ui-page', name: 'D', order: 4 }
}

function fakeVm ({ pageList = pages, groups = {}, current = 'a', historyState = {} } = {}) {
    const calls = { pushed: [], commits: [], backs: 0 }
    const vm = {
        $store: {
            state: { ui: { pages: pageList, groups } },
            commit: (type, payload) => calls.commits.push(payload)
        },
        $router: {
            push: async (route) => { calls.pushed.push(route.name) },
            back: () => { calls.backs++ },
            options: { history: { state: historyState } }
        },
        $route: { meta: { id: current } }
    }
    return { vm, calls }
}

describe('uiAction', function () {
    describe('navigate', function () {
        it('goes to a page by id', async function () {
            const { vm, calls } = fakeVm()
            await uiAction(vm, 'navigate', 'c')
            calls.pushed.should.eql(['Page:C'])
        })

        it('goes to the next and previous pages, wrapping around', async function () {
            for (const [current, target, expected] of [['a', '_next', 'Page:B'], ['d', '_next', 'Page:A'], ['a', '_prev', 'Page:D'], ['c', '_prev', 'Page:B']]) {
                const { vm, calls } = fakeVm({ current })
                await uiAction(vm, 'navigate', target)
                calls.pushed.should.eql([expected])
            }
        })

        it('skips hidden pages, disabled pages and links for next and previous', async function () {
            const pageList = {
                ...pages,
                b: { ...pages.b, visible: false },
                c: { ...pages.c, disabled: true },
                link: { id: 'link', type: 'ui-link', name: 'Link', order: 5 }
            }
            const next = fakeVm({ pageList, current: 'a' })
            await uiAction(next.vm, 'navigate', '_next')
            next.calls.pushed.should.eql(['Page:D'])

            const wrap = fakeVm({ pageList, current: 'd' })
            await uiAction(wrap.vm, 'navigate', '_next')
            wrap.calls.pushed.should.eql(['Page:A'])

            const prev = fakeVm({ pageList, current: 'a' })
            await uiAction(prev.vm, 'navigate', '_prev')
            prev.calls.pushed.should.eql(['Page:D'])
        })

        it('goes to the first or last page from a page that is not in the list', async function () {
            const pageList = { ...pages, b: { ...pages.b, visible: false } }
            const next = fakeVm({ pageList, current: 'b' })
            await uiAction(next.vm, 'navigate', '_next')
            next.calls.pushed.should.eql(['Page:A'])

            const prev = fakeVm({ pageList, current: 'b' })
            await uiAction(prev.vm, 'navigate', '_prev')
            prev.calls.pushed.should.eql(['Page:D'])
        })

        it('goes back when there is an earlier dashboard page', async function () {
            const { vm, calls } = fakeVm({ historyState: { back: '/dashboard/a', current: '/dashboard/b' } })
            await uiAction(vm, 'navigate', '_back')
            calls.backs.should.equal(1)
        })

        it('does not go back out of the dashboard', async function () {
            for (const historyState of [{ back: null, current: '/dashboard/a' }, { back: '/dashboard/a', current: '/dashboard/a' }]) {
                const { vm, calls } = fakeVm({ historyState })
                await uiAction(vm, 'navigate', '_back')
                calls.backs.should.equal(0)
            }
        })
    })

    describe('popup and modal', function () {
        const groups = {
            dlg: { id: 'dlg', groupType: 'dialog', page: 'c' },
            plain: { id: 'plain', groupType: 'default', page: 'c' }
        }

        it('goes to the dialog page, then opens it', async function () {
            const { vm, calls } = fakeVm({ groups })
            await uiAction(vm, 'popup', 'dlg')
            calls.pushed.should.eql(['Page:C'])
            calls.commits.should.have.length(1)
            calls.commits[0].should.containEql({ item: 'group', itemId: 'dlg', property: 'showDialog' })
            calls.commits[0].value.should.match(/^true-\d+$/)
        })

        it('marks a modal so only its close button closes it', async function () {
            const { vm, calls } = fakeVm({ groups, current: 'c' })
            await uiAction(vm, 'modal', 'dlg')
            calls.pushed.should.eql([])
            calls.commits[0].value.should.match(/^true-\d+-modal$/)
        })

        it('ignores a group that is not a dialog', async function () {
            const { vm, calls } = fakeVm({ groups })
            await uiAction(vm, 'popup', 'plain')
            calls.pushed.should.eql([])
            calls.commits.should.eql([])
        })
    })

    it('ignores other payload types', async function () {
        const { vm, calls } = fakeVm()
        await uiAction(vm, 'str', 'c')
        calls.pushed.should.eql([])
    })
})
