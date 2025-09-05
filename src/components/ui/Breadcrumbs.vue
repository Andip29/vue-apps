<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const crumbs = computed(() => {
  return route.matched
    // sembunyikan level yang tidak mau tampil: set meta.breadcrumb === false
    .filter(r => r.meta?.breadcrumb !== false)
    .map(r => {
      const label = typeof r.meta?.breadcrumb === 'function'
        ? r.meta.breadcrumb(route)
        : (r.meta?.breadcrumb || r.meta?.title || r.name || '')

      // buat target link; untuk rute dinamis pakai name + params
      const to = r.name
        ? { name: r.name, params: route.params, query: route.query }
        : { path: r.path }

      return { label, to, path: r.path }
    })
})
// Judul halaman = meta.title dari rute paling dalam
const pageTitle = computed(() => {
  const last = route.matched.at(-1)
  return last?.meta?.title || last?.meta?.breadcrumb || last?.name || ''
})
</script>

<template>
  <header class="page-header">
    <h2>{{ pageTitle }}</h2>

    <div class="right-wrapper text-end">
      <ol class="breadcrumbs">
        <!-- home -->
        <li>
          <router-link :to="{ name: 'dashboard' }">
            <i class="bx bx-home-alt"></i>
          </router-link>
        </li>

        <!-- crumbs -->
        <li v-for="(c, i) in crumbs" :key="c.path || i">
          <template v-if="i < crumbs.length - 1">
            <router-link :to="c.to"><span>{{ c.label }}</span></router-link>
          </template>
          <template v-else>
            <span>{{ c.label }}</span>
          </template>
        </li>
      </ol>

      <a class="sidebar-right-toggle" data-open="sidebar-right">
        <i class="fas fa-chevron-left"></i>
      </a>
    </div>
  </header>
</template>