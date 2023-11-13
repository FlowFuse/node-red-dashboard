import { createRouter, createWebHistory } from 'vue-router'

const routes = []

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = to.meta.title
    } else {
        document.title = 'Node-RED Dashboard 2.0'
    }
    next()
})

export default router
