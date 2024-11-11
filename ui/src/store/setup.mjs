// initial state
const state = () => ({
    setup: null,
    error: null
})

const mutations = {
    set (state, setup) {
        console.log('setup', setup)
        state.setup = setup
    },
    setError (state, error) {
        state.error = error
    }
}

export default {
    namespaced: true,
    state,
    mutations
}
