<script setup>
import {
  onMounted,
  onBeforeUnmount,
  nextTick,
  ref,
  computed,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOltCardStore } from "../../../stores/oltCard";
import { useOltStore } from "../../../stores/olt"; // dropdown OLT

const route = useRoute();
const router = useRouter();
const store = useOltCardStore();
const oltStore = useOltStore();

const items = computed(() => store.items || []);
const loading = computed(() => store.loadingList);
const error = computed(() => store.error);

// dropdown OLT
const olts = computed(() => oltStore.items || []);
const oltUuid = ref(String(route.query.olt_uuid || ""));
const search = ref(String(route.query.search || ""));

// DataTables helpers
const tableId = "#datatable-olt-card";
let dt = null;
const tableKey = ref(0); // kunci re-render total table

function initDataTable() {
  const $ = window.jQuery;
  if (!$?.fn?.DataTable) return;
  if ($.fn.DataTable.isDataTable(tableId)) return;
  dt = $(tableId).DataTable({
    paging: true,
    searching: true,
    autoWidth: false,
    order: [],
    pageLength: 10,
    lengthMenu: [
      [10, 25, 50, -1],
      [10, 25, 50, "Semua"],
    ],
    // atur layout supaya length & search bisa stack
    dom:
      "<'row'<'col-12 col-md-6'l><'col-12 col-md-6'f>>" +
      "t" +
      "<'row'<'col-12 col-md-6'i><'col-12 col-md-6'p>>",
  });
}

function destroyDataTable() {
  const $ = window.jQuery;
  if (!$?.fn?.DataTable) return;
  if ($.fn.DataTable.isDataTable(tableId)) {
    // ✅ JANGAN gunakan .destroy(true) agar <table> tidak dihapus dari DOM
    $(tableId).DataTable().clear().destroy();
  }
  dt = null;
}

function formatDate(v) {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return v;
  }
}

async function load() {
  // 1) pastikan DT lama bersih
  destroyDataTable();

  // 2) fetch sesuai filter
  await store.fetchList({
    page: 1,
    limit: 1000,
    olt_uuid: oltUuid.value || "",
    search: search.value || "",
  });

  // 3) paksa table re-render total
  tableKey.value++;

  // 4) init DataTables di DOM baru
  await nextTick();
  initDataTable();
}

// Label opsi OLT
function oltLabel(o) {
  const name = o.code || o.name || "(tanpa nama)";
  const brand = o.brand ? ` (${o.brand})` : "";
  const ip = o.ip_address ? ` — ${o.ip_address}` : "";
  return `${name}${brand}${ip}`;
}

function goCreate() {
  router.push({ name: "olt-card-create", query: { olt_uuid: oltUuid.value } });
}
function goEdit(uuid) {
  if (uuid)
    router.push({ name: "olt-card-edit", params: { uuid: String(uuid) } });
}
function goDetail(uuid) {
  if (uuid)
    router.push({ name: "olt-card-detail", params: { uuid: String(uuid) } });
}

async function onDelete(uuid) {
  if (!uuid) return;
  if (!confirm("Yakin hapus card ini?")) return;
  await store.remove(uuid);
  await load();
}

// Hapus banyak (opsional)
const selected = ref(new Set());
const toggleRow = (uuid, checked) => {
  if (uuid) checked ? selected.value.add(uuid) : selected.value.delete(uuid);
};
const isChecked = (uuid) => selected.value.has(uuid);
const clearSelection = () => selected.value.clear();
async function deleteSelected() {
  if (!selected.value.size) return;
  if (!confirm(`Hapus ${selected.value.size} kartu?`)) return;
  await store.removeMany([...selected.value]);
  clearSelection();
  await load();
}

// SYNC
const syncing = ref(false);
async function doSync() {
  if (!oltUuid.value) {
    alert("Pilih OLT dulu untuk Sync.");
    return;
  }
  if (!confirm("Jalankan sync card dari device?")) return;
  syncing.value = true;
  try {
    if (typeof store.syncByOlt === "function")
      await store.syncByOlt(oltUuid.value);
    else if (typeof store.sync === "function") await store.sync(oltUuid.value);
    else if (typeof store.syncOltCard === "function")
      await store.syncOltCard(oltUuid.value);
    else throw new Error("Store belum punya method sync OLT Card.");
    await load();
  } catch (e) {
    alert(
      store.error || e?.response?.data?.message || e?.message || "Gagal sync"
    );
  } finally {
    syncing.value = false;
  }
}

// mount
onMounted(async () => {
  await oltStore.fetchList({ page: 1, limit: 1000 }).catch(() => {});
  await load();
});
onBeforeUnmount(() => destroyDataTable());

// Debounce filter
let t;
watch([oltUuid, search], ([o, s]) => {
  clearTimeout(t);
  t = setTimeout(() => {
    router.replace({
      query: { olt_uuid: o || undefined, search: s || undefined },
    });
    load();
  }, 250);
});
</script>

<template>
  <section class="card">
    <!-- HEADER: fleksibel & wrap -->
    <header class="card-header">
      <div class="d-flex flex-wrap align-items-center gap-2 w-100">
        <h2 class="card-title m-0 flex-grow-1">OLT Card</h2>

        <!-- toolbar responsif -->
        <div
          class="toolbar d-flex flex-wrap align-items-center gap-2 ms-auto w-100 w-md-auto"
        >
          <!-- Dropdown OLT -->
          <select
            v-model="oltUuid"
            class="form-select form-select-sm flex-grow-1 flex-md-grow-0"
            style="min-width: 260px"
          >
            <option value="">— Pilih OLT —</option>
            <option v-for="o in olts" :key="o.uuid" :value="o.uuid">
              {{ oltLabel(o) }}
            </option>
          </select>

          <!-- Search milik aplikasi -->
          <input
            v-model.trim="search"
            type="text"
            class="form-control form-control-sm flex-grow-1 flex-md-grow-0"
            style="min-width: 220px"
            placeholder="Cari code/type/model"
          />

          <button
            class="btn btn-sm btn-outline-secondary"
            @click="doSync"
            :disabled="syncing || !oltUuid"
          >
            <span
              v-if="syncing"
              class="spinner-border spinner-border-sm me-1"
            ></span>
            Sync Card
          </button>

          <router-link
            :to="{ name: 'olt-card-create', query: { olt_uuid: oltUuid } }"
            class="btn btn-sm btn-primary"
          >
            + Tambah Card
          </router-link>

          <button
            class="btn btn-sm btn-outline-danger"
            :disabled="!selected.size"
            @click="deleteSelected"
            title="Hapus terpilih"
          >
            Hapus Terpilih ({{ selected.size }})
          </button>
        </div>
      </div>
    </header>

    <div class="card-body">
      <div class="mb-2">
        <span v-if="loading" class="text-muted">memuat…</span>
        <span v-if="error" class="text-danger">{{ error }}</span>
      </div>

      <div class="table-responsive">
        <table
          :key="tableKey"
          id="datatable-olt-card"
          class="table table-bordered table-striped mb-0"
        >
          <thead>
            <tr>
              <th style="width: 28px"></th>
              <th>Code</th>
              <th>Slot</th>
              <th>Type</th>
              <th>Model</th>
              <th>Status</th>
              <th>Dibuat</th>
              <th class="text-nowrap" style="width: 140px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8">Memuat…</td>
            </tr>
            <tr v-else-if="!items.length">
              <td colspan="8">Tidak ada data</td>
            </tr>
            <tr v-else v-for="row in items" :key="row.uuid">
              <td class="text-center">
                <input
                  type="checkbox"
                  :checked="isChecked(row.uuid)"
                  @change="toggleRow(row.uuid, $event.target.checked)"
                />
              </td>
              <td>{{ row.code || "-" }}</td>
              <td>{{ row.slot_number ?? "-" }}</td>
              <td>{{ row.card_type || "-" }}</td>
              <td>{{ row.model || "-" }}</td>
              <td>
                <span
                  class="badge"
                  :class="row.is_active ? 'bg-success' : 'bg-secondary'"
                >
                  {{ row.is_active ? "Aktif" : "Nonaktif" }}
                </span>
              </td>
              <td>{{ formatDate(row.created_at) }}</td>
              <td class="text-nowrap">
                <router-link
                  :to="{
                    name: 'olt-card-detail',
                    params: { uuid: String(row.uuid) },
                  }"
                  class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-primary"
                  title="Detail"
                >
                  <i class="icons icon-notebook"></i>
                </router-link>
                <router-link
                  :to="{
                    name: 'olt-card-edit',
                    params: { uuid: String(row.uuid) },
                  }"
                  class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-warning"
                  title="Edit"
                >
                  <i class="icons icon-note"></i>
                </router-link>
                <button
                  type="button"
                  class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-danger"
                  @click="onDelete(row.uuid)"
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

<style scoped>
/* Toolbar responsif: baris kedua saat layar kecil */
.toolbar {
  row-gap: 0.5rem;
}

/* Kecil: semua kontrol full width */
@media (max-width: 767.98px) {
  .toolbar > * {
    width: 100% !important;
  }
}

/* DataTables controls (length + filter) supaya stack rapi di mobile */
:deep(.dataTables_wrapper .row) {
  row-gap: 0.5rem;
}
@media (max-width: 767.98px) {
  :deep(.dataTables_wrapper .dataTables_length),
  :deep(.dataTables_wrapper .dataTables_filter) {
    width: 100%;
  }
  :deep(.dataTables_wrapper .dataTables_filter input) {
    width: 100%;
  }
}

/* Hindari kolom lain memaksa nowrap selain kolom Aksi */
.table td,
.table th {
  white-space: normal;
}
</style>
