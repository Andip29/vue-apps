<script setup>
import Breadcrumbs from "../components/ui/Breadcrumbs.vue";
import { useRoute } from "vue-router";
const route = useRoute();

// Parent "Router" dianggap aktif & terbuka kalau path sekarang diawali "/dashboard/router"
const isRouterSectionOpen = () => route.path.startsWith("/dashboard/router");
const isOdpSectionOpen = () => route.path.startsWith("/dashboard/odp");
const isOdcSectionOpen = () => route.path.startsWith("/dashboard/odc");
const isBandwithSectionOpen = () => route.path.startsWith("/dashboard/bandwith");
const isPacketProfileSectionOpen = () => route.path.startsWith("/dashboard/packetprofile");

// Helper untuk item daun (leaf) per route name
const isActiveByName = (name) => route.name === name;
</script>

<template>
  <section class="body">
    <header class="header">
      <div class="logo-container">
        <a href="#" class="logo">
          <img src="/img/logo.png" width="75" height="35" alt="Porto Admin" />
        </a>

        <div
          class="d-md-none toggle-sidebar-left"
          data-toggle-class="sidebar-left-opened"
          data-target="html"
          data-fire-event="sidebar-left-opened"
        >
          <i class="fas fa-bars" aria-label="Toggle sidebar"></i>
        </div>
      </div>

      <!-- start: search & user box -->
      <div class="header-right">
        <form action="pages-search-results.html" class="search nav-form">
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              name="q"
              id="q"
              placeholder="Search..."
            />
            <button class="btn btn-default" type="submit">
              <i class="bx bx-search"></i>
            </button>
          </div>
        </form>

        <span class="separator"></span>

        <ul class="notifications">
          <li>
            <a
              href="#"
              class="dropdown-toggle notification-icon"
              data-bs-toggle="dropdown"
            >
              <i class="bx bx-list-ol"></i>
              <span class="badge">3</span>
            </a>

            <div class="dropdown-menu notification-menu large">
              <div class="notification-title">
                <span class="float-end badge badge-default">3</span>
                Tasks
              </div>

              <div class="content">
                <ul>
                  <li>
                    <p class="clearfix mb-1">
                      <span class="message float-start"
                        >Generating Sales Report</span
                      >
                      <span class="message float-end text-dark">60%</span>
                    </p>
                    <div class="progress progress-xs light">
                      <div
                        class="progress-bar"
                        role="progressbar"
                        aria-valuenow="60"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        style="width: 60%"
                      ></div>
                    </div>
                  </li>

                  <li>
                    <p class="clearfix mb-1">
                      <span class="message float-start"
                        >Importing Contacts</span
                      >
                      <span class="message float-end text-dark">98%</span>
                    </p>
                    <div class="progress progress-xs light">
                      <div
                        class="progress-bar"
                        role="progressbar"
                        aria-valuenow="98"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        style="width: 98%"
                      ></div>
                    </div>
                  </li>

                  <li>
                    <p class="clearfix mb-1">
                      <span class="message float-start"
                        >Uploading something big</span
                      >
                      <span class="message float-end text-dark">33%</span>
                    </p>
                    <div class="progress progress-xs light mb-1">
                      <div
                        class="progress-bar"
                        role="progressbar"
                        aria-valuenow="33"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        style="width: 33%"
                      ></div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </li>
          <li>
            <a
              href="#"
              class="dropdown-toggle notification-icon"
              data-bs-toggle="dropdown"
            >
              <i class="bx bx-envelope"></i>
              <span class="badge">4</span>
            </a>

            <div class="dropdown-menu notification-menu">
              <div class="notification-title">
                <span class="float-end badge badge-default">230</span>
                Messages
              </div>

              <div class="content">
                <ul>
                  <li>
                    <a href="#" class="clearfix">
                      <figure class="image">
                        <img
                          src="/img/!sample-user.jpg"
                          alt="Joseph Doe Junior"
                          class="rounded-circle"
                        />
                      </figure>
                      <span class="title">Joseph Doe</span>
                      <span class="message">Lorem ipsum dolor sit.</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" class="clearfix">
                      <figure class="image">
                        <img
                          src="/img/!sample-user.jpg"
                          alt="Joseph Junior"
                          class="rounded-circle"
                        />
                      </figure>
                      <span class="title">Joseph Junior</span>
                      <span class="message truncate"
                        >Truncated message. Lorem ipsum dolor sit amet,
                        consectetur adipiscing elit. Donec sit amet lacinia
                        orci. Proin vestibulum eget risus non luctus. Nunc
                        cursus lacinia lacinia. Nulla molestie malesuada est ac
                        tincidunt. Quisque eget convallis diam, nec venenatis
                        risus. Vestibulum blandit faucibus est et malesuada. Sed
                        interdum cursus dui nec venenatis. Pellentesque non nisi
                        lobortis, rutrum eros ut, convallis nisi. Sed tellus
                        turpis, dignissim sit amet tristique quis, pretium id
                        est. Sed aliquam diam diam, sit amet faucibus tellus
                        ultricies eu. Aliquam lacinia nibh a metus bibendum, eu
                        commodo eros commodo. Sed commodo molestie elit, a
                        molestie lacus porttitor id. Donec facilisis varius
                        sapien, ac fringilla velit porttitor et. Nam tincidunt
                        gravida dui, sed pharetra odio pharetra nec. Duis
                        consectetur venenatis pharetra. Vestibulum egestas nisi
                        quis elementum elementum.</span
                      >
                    </a>
                  </li>
                  <li>
                    <a href="#" class="clearfix">
                      <figure class="image">
                        <img
                          src="/img/!sample-user.jpg"
                          alt="Joe Junior"
                          class="rounded-circle"
                        />
                      </figure>
                      <span class="title">Joe Junior</span>
                      <span class="message">Lorem ipsum dolor sit.</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" class="clearfix">
                      <figure class="image">
                        <img
                          src="/img/!sample-user.jpg"
                          alt="Joseph Junior"
                          class="rounded-circle"
                        />
                      </figure>
                      <span class="title">Joseph Junior</span>
                      <span class="message"
                        >Lorem ipsum dolor sit amet, consectetur adipiscing
                        elit. Donec sit amet lacinia orci. Proin vestibulum eget
                        risus non luctus. Nunc cursus lacinia lacinia. Nulla
                        molestie malesuada est ac tincidunt. Quisque eget
                        convallis diam.</span
                      >
                    </a>
                  </li>
                </ul>

                <hr />

                <div class="text-end">
                  <a href="#" class="view-more">View All</a>
                </div>
              </div>
            </div>
          </li>
          <li>
            <a
              href="#"
              class="dropdown-toggle notification-icon"
              data-bs-toggle="dropdown"
            >
              <i class="bx bx-bell"></i>
              <span class="badge">3</span>
            </a>

            <div class="dropdown-menu notification-menu">
              <div class="notification-title">
                <span class="float-end badge badge-default">3</span>
                Alerts
              </div>

              <div class="content">
                <ul>
                  <li>
                    <a href="#" class="clearfix">
                      <div class="image">
                        <i class="fas fa-thumbs-down bg-danger text-light"></i>
                      </div>
                      <span class="title">Server is Down!</span>
                      <span class="message">Just now</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" class="clearfix">
                      <div class="image">
                        <i class="bx bx-lock bg-warning text-light"></i>
                      </div>
                      <span class="title">User Locked</span>
                      <span class="message">15 minutes ago</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" class="clearfix">
                      <div class="image">
                        <i class="fas fa-signal bg-success text-light"></i>
                      </div>
                      <span class="title">Connection Restaured</span>
                      <span class="message">10/10/2023</span>
                    </a>
                  </li>
                </ul>

                <hr />

                <div class="text-end">
                  <a href="#" class="view-more">View All</a>
                </div>
              </div>
            </div>
          </li>
        </ul>

        <span class="separator"></span>

        <div id="userbox" class="userbox">
          <a href="#" data-bs-toggle="dropdown">
            <figure class="profile-picture">
              <img
                src="/img/!logged-user.jpg"
                alt="Joseph Doe"
                class="rounded-circle"
                data-lock-picture="/img/!logged-user.jpg"
              />
            </figure>
            <div
              class="profile-info"
              data-lock-name="John Doe"
              data-lock-email="johndoe@okler.com"
            >
              <span class="name">John Doe Junior</span>
              <span class="role">Administrator</span>
            </div>

            <i class="fa custom-caret"></i>
          </a>

          <div class="dropdown-menu">
            <ul class="list-unstyled mb-2">
              <li class="divider"></li>
              <li>
                <a role="menuitem" tabindex="-1" href="pages-user-profile.html"
                  ><i class="bx bx-user-circle"></i> My Profile</a
                >
              </li>
              <li>
                <a
                  role="menuitem"
                  tabindex="-1"
                  href="#"
                  data-lock-screen="true"
                  ><i class="bx bx-lock"></i> Lock Screen</a
                >
              </li>
              <li>
                <RouterLink
                  role="menuitem"
                  tabindex="-1"
                  :to="{ name: 'logout' }"
                >
                  <i class="bx bx-power-off"></i> Logout
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <!-- end: search & user box -->
    </header>

    <div class="inner-wrapper">
      <!-- start: sidebar -->
      <aside id="sidebar-left" class="sidebar-left">
        <div class="sidebar-header">
          <div class="sidebar-title">Navigation</div>
          <div
            class="sidebar-toggle d-none d-md-block"
            data-toggle-class="sidebar-left-collapsed"
            data-target="html"
            data-fire-event="sidebar-left-toggle"
          >
            <i class="fas fa-bars" aria-label="Toggle sidebar"></i>
          </div>
        </div>
        <!-- dashboard nav -->
        <div class="nano">
          <div class="nano-content">
            <nav id="menu" class="nav-main" role="navigation">
              <ul class="nav nav-main">
                <li :class="{ 'nav-active': isActiveByName('dashboard') }">
                  <router-link class="nav-link" to="/dashboard">
                    <i class="bx bx-home-alt" aria-hidden="true"></i>
                    <span>Dashboard</span>
                  </router-link>
                </li>
                <!-- router nav -->
                <li
                  class="nav-parent"
                  :class="{ 'nav-expanded nav-active': isRouterSectionOpen() }"
                >
                  <a class="nav-link" href="#">
                    <i class="bx bx-cart-alt" aria-hidden="true"></i>
                    <span>Router</span>
                  </a>
                  <ul class="nav nav-children">
                    <li
                      :class="{ 'nav-active': isActiveByName('router-list') }"
                    >
                      <router-link
                        class="nav-link"
                        :to="{ name: 'router-list' }"
                      >
                        Router-List
                      </router-link>
                    </li>
                    <li
                      :class="{ 'nav-active': isActiveByName('router-create') }"
                    >
                      <router-link
                        class="nav-link"
                        :to="{ name: 'router-create' }"
                      >
                        Create Router
                      </router-link>
                    </li>
                  </ul>
                </li>

                <!-- bandwith nav -->
                <li
                  class="nav-parent"
                  :class="{
                    'nav-expanded nav-active': isBandwithSectionOpen(),
                  }"
                >
                  <a class="nav-link" href="#">
                    <i class="bx bx-cart-alt" aria-hidden="true"></i>
                    <span>Bandwith</span>
                  </a>
                  <ul class="nav nav-children">
                    <li
                      :class="{ 'nav-active': isActiveByName('bandwith-list') }"
                    >
                      <router-link
                        class="nav-link"
                        :to="{ name: 'bandwith-list' }"
                      >
                        Badnwith-List
                      </router-link>
                    </li>
                  </ul>
                </li>
                <!--  -->
                <!-- packetprofile nav -->
                <li
                  class="nav-parent"
                  :class="{
                    'nav-expanded nav-active': isPacketProfileSectionOpen(),
                  }"
                >
                  <a class="nav-link" href="#">
                    <i class="bx bx-cart-alt" aria-hidden="true"></i>
                    <span>Packet Profile</span>
                  </a>
                  <ul class="nav nav-children">
                    <li
                      :class="{
                        'nav-active': isActiveByName('packetprofile-list'),
                      }"
                    >
                      <router-link
                        class="nav-link"
                        :to="{ name: 'packetprofile-list' }"
                      >
                        Packet List
                      </router-link>
                    </li>
                  </ul>
                </li>
                <!--  -->
                <li
                  class="nav-parent"
                  :class="{ 'nav-expanded nav-active': isOdpSectionOpen() }"
                >
                  <a class="nav-link" href="#">
                    <i class="bx bx-layout" aria-hidden="true"></i>
                    <span>Layouts</span>
                  </a>
                  <ul class="nav nav-children">
                    <li :class="{ 'nav-active': isActiveByName('odp-list') }">
                      <router-link class="nav-link" :to="{ name: 'odp-list' }">
                        ODP-list
                      </router-link>
                    </li>
                    <li :class="{ 'nav-active': isActiveByName('odp-create') }">
                      <router-link
                        class="nav-link"
                        :to="{ name: 'odp-create' }"
                      >
                        Create Router
                      </router-link>
                    </li>
                  </ul>
                </li>
                <li
                  class="nav-parent"
                  :class="{ 'nav-expanded nav-active': isOdcSectionOpen() }"
                >
                  <a class="nav-link" href="#">
                    <i class="bx bx-file" aria-hidden="true"></i>
                    <span>Pages</span>
                  </a>
                  <ul class="nav nav-children">
                    <li :class="{ 'nav-active': isActiveByName('odc-list') }">
                      <router-link class="nav-link" :to="{ name: 'odc-list' }">
                        ODC-list
                      </router-link>
                    </li>
                    <li>
                      <a class="nav-link" href="pages-signin.html"> Sign In </a>
                    </li>
                  </ul>
                </li>
                <li class="nav-parent">
                  <a class="nav-link" href="#">
                    <i class="bx bx-map" aria-hidden="true"></i>
                    <span>Maps</span>
                  </a>
                  <ul class="nav nav-children">
                    <li>
                      <a class="nav-link" href="maps-google-maps.html">
                        Basic
                      </a>
                    </li>
                    <li>
                      <a class="nav-link" href="maps-google-maps-builder.html">
                        Map Builder
                      </a>
                    </li>
                    <li>
                      <a class="nav-link" href="maps-vector.html"> Vector </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </aside>
      <!-- end: sidebar -->

      <section role="main" class="content-body">
        <Breadcrumbs />

        <!-- start: page -->

        <RouterView />

        <!-- end: page -->
      </section>
    </div>
  </section>
</template>
