import { createRouter, createWebHistory } from 'vue-router'

const routes = [{
    path: '/ui/test',
    name: 'TestView',
    component: () => import('./Test.vue')
}]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
