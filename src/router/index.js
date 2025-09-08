import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layouts/AuthLayout.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

import UserRegister from '../components/auth/UserRegister.vue'
import UserLogin from '../components/auth/UserLogin.vue'
import Routerlayout from '../components/routers/RouterLayout.vue'
import RouterList from '../components/routers/RouterList.vue'
import RouterCreate from '../components/routers/RouterCreate.vue'
import RouterEdit from '../components/routers/RouterEdit.vue'
import RouterDetail from '../components/routers/RouterDetail.vue'
import OdpLayout from '../components/odps/OdpLayout.vue'
import OdpList from '../components/odps/OdpList.vue'
import OdpDetail from '../components/odps/OdpDetail.vue'



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
                component: Routerlayout,
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
                        path: 'create',
                        component: RouterCreate,
                        name: 'router-create',
                        meta: { title: 'Create Router', breadcrumb: 'ODP-Create' }
                    },
                ]
                
            },
            {
                path: 'odp',
                component: OdpLayout,
                name: 'odp',
                meta: { title: 'ODPs', breadcrumb: 'ODP' },
                children : [
                    { path: 'odp', redirect: { name: 'odp-list' } },
                    {
                        path: 'list',
                        component: OdpList,
                        name: 'odp-list',
                        meta: { title: 'List ODP', breadcrumb: 'ODP-List' },              
                    },
                    {
                        path: 'edit',
                        component: RouterEdit,
                        name: 'odp-edit',
                        // meta: {title: 'Edit Router', breadcrumb: (route) => `Edit #${route.params.id}`},              
                    },
                    {
                        path: 'detail',
                        component: OdpDetail,
                        name: 'odp-detail',
                        meta: { title: 'Detail ODP', breadcrumb: 'ODP-Detail' },              
                    },
                    {
                        path: 'create',
                        component: RouterCreate,
                        name: 'odp-create',
                        meta: { title: 'ODP Router', breadcrumb: 'ODP-Create' }
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