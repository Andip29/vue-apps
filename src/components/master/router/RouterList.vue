<script setup>
import {
  onMounted,
  onBeforeUnmount,
  nextTick,
  ref,
  computed,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { useRouterStore } from "../../../stores/router"; // store yang barusan kita buat

const router = useRouter();
const store = useRouterStore();

// state & computed
const items = computed(() => store.items || []);
const loading = computed(() => store.loadingList);
const error = computed(() => store.error);

// helpers
function fmtDate(v) {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}
function statusBadge(s) {
  const on = String(s).toLowerCase() === "online";
  return {
    text: on ? "Online" : "Offline",
    cls: on ? "bg-success" : "bg-secondary",
  };
}

// actions
function goCreate() {
  router.push({ name: "router-create" });
}
function goDetail(uuid) {
  if (!uuid) return;
  router.push({ name: "router-detail", params: { uuid: String(uuid) } });
}
function goEdit(uuid) {
  if (!uuid) return;
  router.push({ name: "router-edit", params: { uuid: String(uuid) } });
}
async function onDelete(uuid) {
  if (!confirm("Yakin hapus router ini?")) return;
  await store.remove(uuid);
  await rebuildDataTable();
}

// DataTables
const tableRef = ref(null);
let dt = null;

async function load() {
  await store.fetchList({ page: 1, limit: 1000 }); // DT yang handle paging/search
  await nextTick();
  initDataTable();
}
function initDataTable() {
  const $ = window.jQuery;
  if (!($ && $.fn && $.fn.DataTable)) {
    console.warn("jQuery DataTables tidak ditemukan. Pastikan JS/CSS dimuat.");
    return;
  }
  if (dt && $.fn.DataTable.isDataTable(tableRef.value)) dt.destroy();
  dt = $(tableRef.value).DataTable({
    paging: true,
    searching: true,
    autoWidth: false,
    order: [],
    pageLength: 10,
    lengthMenu: [
      [10, 25, 50, -1],
      [10, 25, 50, "Semua"],
    ],
  });
}
function destroyDataTable() {
  const $ = window.jQuery;
  if (dt && $ && $.fn?.DataTable?.isDataTable(tableRef.value)) {
    dt.destroy();
    dt = null;
  }
}
async function rebuildDataTable() {
  destroyDataTable();
  await nextTick();
  initDataTable();
}

onMounted(load);
onBeforeUnmount(destroyDataTable);

// Re-init jika list berubah (mis. setelah hapus)
watch(items, async (nv, ov) => {
  if (nv !== ov) await rebuildDataTable();
});
</script>

<template>
  <section class="card">
    <header
      class="card-header d-flex justify-content-between align-items-center"
    >
      <h2 class="card-title m-0">Router</h2>
      <div>
        <button class="btn btn-primary btn-sm" @click="goCreate">
          + Tambah Router
        </button>
      </div>
    </header>

    <div class="card-body">
      <div class="mb-2">
        <span v-if="loading" class="text-muted">memuat…</span>
        <span v-if="error" class="text-danger">{{ error }}</span>
      </div>

      <div class="table-responsive">
        <table
          ref="tableRef"
          id="datatable-router"
          class="table table-bordered table-striped mb-0"
        >
          <thead>
            <tr>
              <th>Code</th>
              <th>Brand</th>
              <th>IP</th>
              <th>Port</th>
              <th>Community</th>
              <th>Status</th>
              <th>Uptime</th>
              <th>CPU</th>
              <th>Free Mem</th>
              <th>Total Mem</th>
              <th>Dibuat</th>
              <th style="width: 120px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="12">Memuat…</td>
            </tr>
            <tr v-else-if="!items.length">
              <td colspan="12">Tidak ada data</td>
            </tr>
            <tr v-else v-for="it in items" :key="it.uuid">
              <td>{{ it.code || "-" }}</td>
              <td>{{ it.brand || "-" }}</td>
              <td>{{ it.ip_address || "-" }}</td>
              <td>{{ it.port || "-" }}</td>
              <td>{{ it.community || "-" }}</td>
              <td>
                <span class="badge" :class="statusBadge(it.status_online).cls">
                  {{ statusBadge(it.status_online).text }}
                </span>
              </td>
              <td>{{ it.up_time || "-" }}</td>
              <td>{{ it.cpu_load ?? "-" }}</td>
              <td>{{ it.free_memory || "-" }}</td>
              <td>{{ it.total_memory || "-" }}</td>
              <td>{{ fmtDate(it.created_at) }}</td>
              <td class="text-nowrap">
                <router-link
                  :to="{
                    name: 'router-detail',
                    params: { uuid: String(it.uuid) },
                  }"
                  class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-primary"
                  title="Detail"
                >
                  <i class="icons icon-notebook"></i>
                </router-link>
                <router-link
                  :to="{
                    name: 'router-edit',
                    params: { uuid: String(it.uuid) },
                  }"
                  class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-warning"
                  title="Edit"
                >
                  <i class="icons icon-note"></i>
                </router-link>
                <button
                  type="button"
                  class="mb-1 mt-1 btn btn-xs btn-default border border-danger"
                  @click="onDelete(it.uuid)"
                  title="Hapus"
                >
                  <i class="icons icon-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Tidak perlu pagination manual: DataTables yg handle -->
    </div>
  </section>
</template>

<style scoped>
/* tidak ada styling khusus; mengikuti Bootstrap/Porto */
</style>
