<script setup>
import {
  onMounted,
  onBeforeUnmount,
  nextTick,
  ref,
  computed,
  watch,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { useGroupProfileStore } from "../../../stores/groupProfile";

const router = useRouter();
const route = useRoute();
const store = useGroupProfileStore();

const search = ref(String(route.query.search || "")); // filter pencarian (opsional)

const items = computed(() => store.items || []);
const loading = computed(() => store.loadingList);
const error = computed(() => store.error);

const tableRef = ref(null);
let dt = null;

function formatDate(v) {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return v;
  }
}

function goCreate() {
  router.push({ name: "group-profile-create" });
}
function goEdit(uuid) {
  router.push({ name: "group-profile-edit", params: { uuid: String(uuid) } });
}
function goDetail(uuid) {
  router.push({ name: "group-profile-detail", params: { uuid: String(uuid) } });
}
async function onDelete(uuid) {
  if (!confirm("Yakin hapus Group Profile ini?")) return;
  await store.remove(uuid);
  await rebuildDataTable();
}

async function load() {
  await store.fetchList({ page: 1, limit: 100, search: search.value });
  await nextTick();
  initDataTable();
}

function initDataTable() {
  const $ = window.jQuery;
  if (!($ && $.fn && $.fn.DataTable)) {
    console.warn("DataTables tidak ditemukan. Pastikan JS/CSS-nya dimuat.");
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

// reload saat filter search berubah
watch(search, async () => {
  await load();
  router.replace({ query: search.value ? { search: search.value } : {} });
});
watch(items, async (nv, ov) => {
  if (nv !== ov) await rebuildDataTable();
});
</script>

<template>
  <section class="card">
    <header class="card-header d-flex justify-content-between align-items-center">
      <h2 class="card-title m-0">Group Profile</h2>
      <div class="d-flex align-items-center gap-2">
        <input
          v-model="search"
          type="text"
          class="form-control form-control-sm"
          placeholder="Cari nama / IP / dll"
          style="width: 320px"
        />
        <button class="btn btn-primary btn-sm" @click="goCreate">
          + Tambah Group Profile
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
          id="datatable-group-profile"
          class="table table-bordered table-striped mb-0"
        >
          <thead>
            <tr>
              <th>Nama</th>
              <th>Tipe</th>
              <th>Parent Pool</th>
              <th>Module</th>
              <th>IP Local</th>
              <th>First IP</th>
              <th>Last IP</th>
              <th>Status</th>
              <th>Dibuat</th>
              <th style="width: 120px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="10">Memuat…</td>
            </tr>
            <tr v-else-if="!items.length">
              <td colspan="10">Tidak ada data</td>
            </tr>
            <tr v-else v-for="it in items" :key="it.uuid">
              <td>{{ it.name || "-" }}</td>
              <td>{{ it.type || "-" }}</td>
              <td>{{ it.parent_pool || "-" }}</td>
              <td>{{ it.module || "-" }}</td>
              <td>{{ it.ip_local || "-" }}</td>
              <td>{{ it.first_ip || "-" }}</td>
              <td>{{ it.last_ip || "-" }}</td>
              <td>
                <span
                  class="badge"
                  :class="it.is_active ? 'bg-success' : 'bg-secondary'"
                >
                  {{ it.is_active ? "Aktif" : "Nonaktif" }}
                </span>
              </td>
              <td>{{ formatDate(it.created_at) }}</td>
              <td class="text-nowrap">
                <button
                  type="button"
                  class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-primary"
                  @click="goDetail(it.uuid)"
                  title="Detail"
                >
                  <i class="icons icon-notebook"></i>
                </button>
                <button
                  type="button"
                  class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-warning"
                  @click="goEdit(it.uuid)"
                  title="Edit"
                >
                  <i class="icons icon-note"></i>
                </button>
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
    </div>
  </section>
</template>
