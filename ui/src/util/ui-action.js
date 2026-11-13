async function uiAction (vm, type, target) {
    if (!target || !['navigate', 'popup', 'modal'].includes(type)) {
        return
    }
    const { $store, $router, $route } = vm
    const pages = Object.values($store.state.ui.pages || {})
        .filter(p => p.type === 'ui-page' && !('visible' in p && !p.visible) && !p.disabled)
        .sort((a, b) => a.order - b.order)
    const goTo = async (page) => {
        if (page && page.id !== $route.meta.id) {
            await $router.push({ name: `Page:${page.name}` })
        }
    }
    try {
        if (type === 'navigate') {
            if (target === '_back') {
                // the dashboard's first load leaves no earlier entry, or a duplicate of the current page
                const history = $router.options.history.state
                if (history?.back && history.back !== history.current) {
                    $router.back()
                }
                return
            }
            const index = pages.findIndex(p => p.id === $route.meta.id)
            if (target === '_next') {
                await goTo(pages[(index + 1) % pages.length])
            } else if (target === '_prev') {
                await goTo(pages[index <= 0 ? pages.length - 1 : index - 1])
            } else {
                await goTo($store.state.ui.pages?.[target])
            }
            return
        }
        const group = $store.state.ui.groups?.[target]
        if (!group || group.groupType !== 'dialog') {
            return
        }
        // a dialog group only renders on its own page, so go there first
        await goTo($store.state.ui.pages?.[group.page])
        $store.commit('ui/setProperty', {
            item: 'group',
            itemId: target,
            property: 'showDialog',
            value: `true-${Date.now()}${type === 'modal' ? '-modal' : ''}`
        })
    } catch (err) {
        console.error(err)
    }
}

export { uiAction }

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { uiAction }
    module.exports.default = module.exports
}
