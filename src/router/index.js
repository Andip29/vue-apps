import { createRouter, createWebHistory } from "vue-router";
import Layout from "../layouts/AuthLayout.vue";
import DashboardLayout from "../layouts/DashboardLayout.vue";

import UserRegister from "../components/auth/UserRegister.vue";
import UserLogin from "../components/auth/UserLogin.vue";
import Routerlayout from "../components/routers/RouterLayout.vue";
import RouterList from "../components/routers/RouterList.vue";
import RouterCreate from "../components/routers/RouterCreate.vue";
import RouterEdit from "../components/routers/RouterEdit.vue";
import RouterDetail from "../components/routers/RouterDetail.vue";
import OdpLayout from "../components/odps/OdpLayout.vue";
import OdpList from "../components/odps/OdpList.vue";
import OdpDetail from "../components/odps/OdpDetail.vue";
import OdpEdit from "../components/odps/OdpEdit.vue";
import OdpCreate from "../components/odps/OdpCreate.vue";
import OdcLayout from "../components/odcs/OdcLayout.vue";
import OdcList from "../components/odcs/OdcList.vue";
import BandwithLayout from "../components/master/bandwith/BandwithLayout.vue";
import BandwithList from "../components/master/bandwith/BandwithList.vue";
import BandwithCreate from "../components/master/bandwith/BandwithCreate.vue";
import BandwithEdit from "../components/master/bandwith/BandwithEdit.vue";
import PacketProfileLayout from "../components/master/packetprofile/PacketProfileLayout.vue";
import PacketProfileList from "../components/master/packetprofile/PacketProfileList.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: Layout,
      children: [
        {
          path: "login",
          component: UserLogin,
        },
        {
          path: "register",
          component: UserRegister,
        },
        { path: "", redirect: "/login" },
      ],
    },
    {
      path: "/logout",
      name: "logout",
      beforeEnter: async () => {
        const { useAuthStore } = await import("../stores/auth");
        const auth = useAuthStore();
        try {
          await auth.logoutServer();
          return { path: "/login", query: { logout: "ok" } };
        } catch (e) {
          auth.logoutLocal();
          return { path: "/login", query: { logout: "err" } };
        }
      },
    },
    // dashboard router
    {
      component: DashboardLayout,
      path: "/dashboard",
      name: "dashboard",
      meta: { title: "Dashboard", breadcrumb: "Dashboard", requiresAuth: true },
      children: [
        {
          path: "router",
          component: Routerlayout,
          name: "router",
          meta: { title: "Routers", breadcrumb: "Router" },
          children: [
            { path: "router", redirect: { name: "router-list" } },
            {
              path: "list",
              component: RouterList,
              name: "router-list",
              meta: { title: "List Router", breadcrumb: "Router-List" },
            },
            {
              path: "edit",
              component: RouterEdit,
              name: "router-edit",
              // meta: {title: 'Edit Router', breadcrumb: (route) => `Edit #${route.params.id}`},
            },
            {
              path: "detail",
              component: RouterDetail,
              name: "router-detail",
            },
            {
              path: "create",
              component: RouterCreate,
              name: "router-create",
              meta: { title: "Create Router", breadcrumb: "ODP-Create" },
            },
          ],
        },
        {
          path: "odp",
          component: OdpLayout,
          name: "odp",
          meta: { title: "ODPs", breadcrumb: "ODP" },
          children: [
            { path: "odp", redirect: { name: "odp-list" } },
            {
              path: "list",
              component: OdpList,
              name: "odp-list",
              meta: { title: "List ODP", breadcrumb: "ODP-List" },
            },
            {
              path: "edit",
              component: OdpEdit,
              name: "odp-edit",
              // meta: {title: 'Edit Router', breadcrumb: (route) => `Edit #${route.params.id}`},
            },
            {
              path: "detail",
              component: OdpDetail,
              name: "odp-detail",
              meta: { title: "Detail ODP", breadcrumb: "ODP-Detail" },
            },
            {
              path: "create",
              component: OdpCreate,
              name: "odp-create",
              meta: { title: "ODP", breadcrumb: "ODP-Create" },
            },
          ],
        },
        {
          path: "odc",
          component: OdcLayout,
          name: "odc",
          meta: { title: "ODCs", breadcrumb: "ODC" },
          children: [
            { path: "odc", redirect: { name: "odc-list" } },
            {
              path: "list",
              component: OdcList,
              name: "odc-list",
              meta: { title: "List ODC", breadcrumb: "ODC-List" },
            },
            // {
            //   path: "edit",
            //   component: RouterEdit,
            //   name: "odc-edit",
            //   meta: {title: 'Edit Router', breadcrumb: (route) => `Edit #${route.params.id}`},
            // },
            // {
            //   path: "detail",
            //   component: OdcDetail,
            //   name: "odp-detail",
            //   meta: { title: "Detail ODC", breadcrumb: "ODC-Detail" },
            // },
            // {
            //   path: "create",
            //   component: RouterCreate,
            //   name: "odc-create",
            //   meta: { title: "ODC Router", breadcrumb: "ODC-Create" },
            // },
          ],
        },
        {
          path: "olt",
          component: OdpLayout,
          name: "olt",
          meta: { title: "OLTs", breadcrumb: "OLT" },
          children: [
            { path: "olt", redirect: { name: "olt-list" } },
            {
              path: "list",
              component: OdpList,
              name: "olt-list",
              meta: { title: "List OLT", breadcrumb: "OLT-List" },
            },
            // {
            //   path: "edit",
            //   component: RouterEdit,
            //   name: "olt-edit",
            //   // meta: {title: 'Edit Router', breadcrumb: (route) => `Edit #${route.params.id}`},
            // },
            // {
            //   path: "detail",
            //   component: OdpDetail,
            //   name: "olt-detail",
            //   meta: { title: "Detail OLT", breadcrumb: "OLT-Detail" },
            // },
            // {
            //   path: "create",
            //   component: RouterCreate,
            //   name: "olt-create",
            //   meta: { title: "OLT Router", breadcrumb: "OLT-Create" },
            // },
          ],
        },
        {
          path: "bandwith",
          component: BandwithLayout,
          name: "bandwith",
          meta: { title: "Bandwiths", breadcrumb: "Bandwith" },
          children: [
            { path: "bandwith", redirect: { name: "bandwith-list" } },
            {
              path: "list",
              component: BandwithList,
              name: "bandwith-list",
              meta: { title: "List Bandwith", breadcrumb: "Bandwith-List" },
            },
            {
              path: "create",
              component: BandwithCreate,
              name: "bandwith-create",
              meta: { title: "Create Bandwith", breadcrumb: "Bandwith-Create" },
            },
            {
              path: "edit/:uuid",
              name: "bandwith-edit",
              component: BandwithEdit,
              props: true,
            },
          ],
        },
        {
          path: "packetprofile",
          component: PacketProfileLayout,
          name: "packetprofile",
          meta: { title: "Packet Profiles", breadcrumb: "Packet Profile" },
          children: [
            { path: "packetprofile", redirect: { name: "packetprofile-list" } },
            {
              path: "list",
              component: PacketProfileList,
              name: "packetprofile-list",
              meta: {
                title: "List Packet Profile",
                breadcrumb: "PacketProfile-List",
              },
            },
          ],
        },
      ],
    },
    // end dashboard router
    // packet-profile
  ],
});
router.beforeEach((to, from, next) => {
  const isAuth = !!localStorage.getItem("token");
  if (to.matched.some((r) => r.meta?.requiresAuth) && !isAuth) {
    return next("/login");
  }
  if ((to.path === "/login" || to.path === "/register") && isAuth) {
    return next("/dashboard");
  }
  next();
});

router.afterEach(() => {
  setTimeout(() => window.Porto?.initAll?.(document), 0);
});
export default router;
