import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        name: 'DebugView',
        route: '/dashboard/_debug'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = to.meta.title
    } else {
        document.title = 'FlowFuse Dashboard'
    }
    next()
})

export default router
