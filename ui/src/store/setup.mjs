// initial state
const state = () => ({
    setup: null
})

const mutations = {
    set (state, setup) {
        console.log('setup', setup)
        state.setup = setup
    }
}

export default {
    namespaced: true,
    state,
    mutations
}
