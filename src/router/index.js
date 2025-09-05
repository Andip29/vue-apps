import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layouts/AuthLayout.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

import UserRegister from '../components/auth/UserRegister.vue'
import UserLogin from '../components/auth/UserLogin.vue'
import Router from '../components/routers/Router.vue'
import RouterList from '../components/routers/RouterList.vue'
import RouterCreate from '../components/routers/RouterCreate.vue'
import RouterEdit from '../components/routers/RouterEdit.vue'
import RouterDetail from '../components/routers/RouterDetail.vue'
import Odp from '../components/odps/odp.vue'



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
        name: 'dashboard',
        meta: { title: 'Dashboard', breadcrumb: 'Dashboard' },
        children: [
            {
                path: 'router',
                component: Router,
                name: 'router',
                meta: { title: 'Routers', breadcrumb: 'Router' },
                children: [
                    { path: 'router', redirect: { name: 'router-list' } },
                    {
                        path: 'list',
                        component: RouterList,
                        name: 'router-list',
                        meta: { title: 'List Router', breadcrumb: 'Router-List' },              
                    },
                    {
                        path: 'edit',
                        component: RouterEdit,
                        name: 'router-edit',
                        // meta: {title: 'Edit Router', breadcrumb: (route) => `Edit #${route.params.id}`},              
                    },
                    {
                        path: 'detail',
                        component: RouterDetail,     
                        name : 'router-detail'           
                    },
                    {
                        path: 'router/create',
                        component: RouterCreate,
                        name: 'router-create',
                        meta: { title: 'Create Router', breadcrumb: 'Create' }
                    },
                ]
                
            },
            {
                path: 'odp',
                component: Odp,
                name: 'odp',
                meta: { title: 'ODPs', breadcrumb: 'ODP' },
                children : [
                    { path: 'odp', redirect: { name: 'odp-list' } },
                    {
                        path: 'odp',
                        component: OdpList,
                        name: 'odp-list',
                        meta: { title: 'List ODP', breadcrumb: 'ODP-List' },              
                    },
                    
                ]
            }
            
        ]
    }
]
})

router.afterEach(() => {
  setTimeout(() => window.Porto?.initAll?.(document), 0)
})
export default router