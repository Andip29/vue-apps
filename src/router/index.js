import { createRouter, createWebHistory } from "vue-router";
import Layout from "../layouts/AuthLayout.vue";
import DashboardLayout from "../layouts/DashboardLayout.vue";

import UserRegister from "../components/auth/UserRegister.vue";
import UserLogin from "../components/auth/UserLogin.vue";
import RouterLayout from "../components/master/router/RouterLayout.vue";
import RouterList from "../components/master/router/RouterList.vue";
import RouterDetail from "../components/master/router/RouterDetail.vue";
import RouterEdit from "../components/master/router/RouterEdit.vue";
import RouterCreate from "../components/master/router/RouterCreate.vue";
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
import OltLayout from "../components/master/olts/OltLayout.vue";
import OltList from "../components/master/olts/OltList.vue";
import OltEdit from "../components/master/olts/OltEdit.vue";
import OltCreate from "../components/master/olts/OltCreate.vue";
import OltDetail from "../components/master/olts/OltDetail.vue";
import BandwithDetail from "../components/master/bandwith/BandwithDetail.vue";
import OltCardLayout from "../components/master/olt-card/OltCardLayout.vue";
import OltCardList from "../components/master/olt-card/OltCardList.vue";
import OltCardCreate from "../components/master/olt-card/OltCardCreate.vue";
import OltCardEdit from "../components/master/olt-card/OltCardEdit.vue";
import OltCardDetail from "../components/master/olt-card/OltCardDetail.vue";
import OltPonPortLayout from "../components/master/olt-pon-card/OltPonPortLayout.vue";
import OltPonPortList from "../components/master/olt-pon-card/OltPonPortList.vue";
import OltPonPortDetail from "../components/master/olt-pon-card/OltPonPortDetail.vue";
import OltPonPortEdit from "../components/master/olt-pon-card/OltPonPortEdit.vue";
import OltPonPortCreate from "../components/master/olt-pon-card/OltPonPortCreate.vue";
import PacketProfileDetail from "../components/master/packetprofile/PacketProfileDetail.vue";
import PacketProfileCreate from "../components/master/packetprofile/PacketProfileCreate.vue";
import PacketProfileEdit from "../components/master/packetprofile/PacketProfileEdit.vue";
import GroupProfileList from "../components/master/group-profile/GroupProfileList.vue";
import GroupProfileLayout from "../components/master/group-profile/GroupProfileLayout.vue";
import GroupProfileDetail from "../components/master/group-profile/GroupProfileDetail.vue";
import GroupProfileEdit from "../components/master/group-profile/GroupProfileEdit.vue";
import GroupProfileCreate from "../components/master/group-profile/GroupProfileCreate.vue";

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
          component: RouterLayout,
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
              path: "edit/:uuid",
              component: RouterEdit,
              name: "router-edit",
              props: true,
              meta: { title: "Edit Router", breadcrumb: "Router-Edit" },
            },
            {
              path: "detail/:uuid",
              component: RouterDetail,
              name: "router-detail",
              props: true,
              meta: { title: "Edit Router", breadcrumb: "Router-Edit" },
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
          component: OltLayout,
          name: "olt",
          meta: { title: "OLTs", breadcrumb: "OLT" },
          children: [
            { path: "olt", redirect: { name: "olt-list" } },
            {
              path: "list",
              component: OltList,
              name: "olt-list",
              meta: { title: "List OLT", breadcrumb: "OLT-List" },
            },
            {
              path: "detail/:uuid",
              component: OltDetail,
              name: "olt-detail",
              props: true,
              meta: { title: "Detail OLT", breadcrumb: "OLT-Detail" },
            },
            {
              path: "edit/:uuid",
              component: OltEdit,
              name: "olt-edit",
              props: true,
              meta: { title: "Edit OLT", breadcrumb: "OLT-Edit" },
            },
            {
              path: "create",
              component: OltCreate,
              name: "olt-create",
              meta: { title: "Create OLT", breadcrumb: "OLT-Create" },
            },
            {
              path: "card",
              component: OltCardLayout,
              name: "olt-card",
              meta: { title: "OLT Cards", breadcrumb: "OLT-Card" },
              children: [
                { path: "card", redirect: { name: "olt-card-list" } },
                {
                  path: "list",
                  component: OltCardList,
                  name: "olt-card-list",
                  meta: { title: "List OLT Card", breadcrumb: "OLT-Card-List" },
                },
                {
                  path: "detail/:uuid",
                  component: OltCardDetail,
                  name: "olt-card-detail",
                  props: true,
                  meta: {
                    title: "Detail OLT Card",
                    breadcrumb: "OLT-Card-Detail",
                  },
                },
                {
                  path: "edit/:uuid",
                  component: OltCardEdit,
                  name: "olt-card-edit",
                  props: true,
                  meta: { title: "Edit OLT Card", breadcrumb: "OLT-Card-Edit" },
                },
                {
                  path: "create",
                  component: OltCardCreate,
                  name: "olt-card-create",
                  meta: {
                    title: "Create OLT Card",
                    breadcrumb: "OLT-Card-Create",
                  },
                },
              ],
            },
            {
              path: "pon-port",
              component: OltPonPortLayout,
              name: "olt-pon-port",
              meta: { title: "OLT PON Ports", breadcrumb: "OLT-Pon-Port" },
              children: [
                { path: "pon-port", redirect: { name: "olt-pon-port-list" } },
                {
                  path: "list",
                  component: OltPonPortList,
                  name: "olt-pon-port-list",
                  meta: {
                    title: "List OLT PON Port",
                    breadcrumb: "OLT-Pon-Port-List",
                  },
                },
                {
                  path: "detail/:uuid",
                  component: OltPonPortDetail,
                  name: "olt-pon-port-detail",
                  props: true,
                  meta: {
                    title: "Detail OLT PON Port",
                    breadcrumb: "OLT-Pon-Port-Detail",
                  },
                },
                {
                  path: "edit/:uuid",
                  component: OltPonPortEdit,
                  name: "olt-pon-port-edit",
                  props: true,
                  meta: {
                    title: "Edit OLT PON Port",
                    breadcrumb: "OLT-Pon-Port-Edit",
                  },
                },
                {
                  path: "create",
                  component: OltPonPortCreate,
                  name: "olt-pon-port-create",
                  meta: {
                    title: "Create OLT PON Port",
                    breadcrumb: "OLT-Pon-Port-Create",
                  },
                },
              ],
            },
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
              path: "detail/:uuid",
              component: BandwithDetail,
              name: "bandwith-detail",
              meta: { title: "Detail Bandwith", breadcrumb: "Bandwith-Detail" },
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
              meta: {
                title: "Edit Bandwith",
                breadcrumb: "Bandwith-Edit",
              },
            },
          ],
        },
        {
          path: "packetprofile",
          component: PacketProfileLayout,
          name: "packet-profile",
          meta: { title: "Packet Profiles", breadcrumb: "Packet Profile" },
          children: [
            {
              path: "packet-profile",
              redirect: { name: "packet-profile-list" },
            },
            {
              path: "list",
              component: PacketProfileList,
              name: "packet-profile-list",
              meta: {
                title: "List Packet Profile",
                breadcrumb: "PacketProfile-List",
              },
            },
            {
              path: "detail/:uuid",
              component: PacketProfileDetail,
              name: "packet-profile-detail",
              meta: {
                title: "Detail Packet-Profile",
                breadcrumb: "Packet-Profile-Detail",
              },
            },
            {
              path: "create",
              component: PacketProfileCreate,
              name: "packet-profile-create",
              meta: {
                title: "Create Packet-Profile",
                breadcrumb: "Packet-Profile-Create",
              },
            },
            {
              path: "edit/:uuid",
              name: "packet-profile-edit",
              component: PacketProfileEdit,
              props: true,
              meta: {
                title: "Edit Packet-Profile",
                breadcrumb: "Packet-Profile-Edit",
              },
            },
          ],
        },
        {
          path: "groupprofile",
          component: GroupProfileLayout,
          name: "group-profile",
          meta: { title: "Group Profiles", breadcrumb: "Group Profile" },
          children: [
            {
              path: "group-profile",
              redirect: { name: "group-profile-list" },
            },
            {
              path: "list",
              component: GroupProfileList,
              name: "group-profile-list",
              meta: {
                title: "List group Profile",
                breadcrumb: "groupProfile-List",
              },
            },
            {
              path: "detail/:uuid",
              component: GroupProfileDetail,
              name: "group-profile-detail",
              meta: {
                title: "Detail group-Profile",
                breadcrumb: "group-Profile-Detail",
              },
            },
            {
              path: "create",
              component: GroupProfileCreate,
              name: "group-profile-create",
              meta: {
                title: "Create group-Profile",
                breadcrumb: "group-Profile-Create",
              },
            },
            {
              path: "edit/:uuid",
              name: "group-profile-edit",
              component: GroupProfileEdit,
              props: true,
              meta: {
                title: "Edit group-Profile",
                breadcrumb: "group-Profile-Edit",
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
// Guard auth
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

// Re-init Porto UI after each navigation
router.afterEach(() => {
  setTimeout(() => window.Porto?.initAll?.(document), 0);
});

export default router;
