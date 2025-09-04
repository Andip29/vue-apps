import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layouts/AuthLayout.vue'

import UserRegister from '../components/auth/UserRegister.vue'
import UserLogin from '../components/auth/UserLogin.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import RouterList from '../components/router/RouterList.vue'
import RouterCreate from '../components/router/RouterCreate.vue'
import RouterEdit from '../components/router/RouterEdit.vue'
import RouterDetail from '../components/router/RouterDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
        path: '/',
        component: Layout,
        children: [
            {
                path: 'login',
                component : UserLogin
            },
            {
                path: 'register',
                component : UserRegister
            },
            { path: '', redirect: '/login' }
        ]
    },
    {
        component: DashboardLayout,
        path: '/dashboard',
        children: [
            {
                path: 'router',
                component: RouterList,
                children: [
                    {
                        path: 'router/edit',
                        component: RouterEdit                
                    },
                    {
                        path: 'router/detail',
                        component: RouterDetail                
                    },
                ]
                
            },
            {
                path: 'router/create',
                component: RouterCreate
            },
            
        ]
    }
]
})


export default router