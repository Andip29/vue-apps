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

const route = useRoute();
const router = useRouter();
const store = useOltCardStore();

const items = computed(() => store.items || []);
const loading = computed(() => store.loadingList);
const error = computed(() => store.error);

// filter/query
const oltUuid = ref(String(route.query.olt_uuid || ""));
const search = ref(String(route.query.search || ""));

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

async function load() {
  await store.fetchList({
    page: 1,
    limit: 1000,
    olt_uuid: oltUuid.value,
    search: search.value,
  });
  await nextTick();
  initDataTable();
}

function initDataTable() {
  const $ = window.jQuery;
  if (!($ && $.fn && $.fn.DataTable)) {
    console.warn(
      "jQuery DataTables tidak ditemukan. Muat JS/CSS-nya di index.html"
    );
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
  if (
    dt &&
    $ &&
    $.fn &&
    $.fn.DataTable &&
    $.fn.DataTable.isDataTable(tableRef.value)
  ) {
    dt.destroy();
    dt = null;
  }
}
async function rebuildDataTable() {
  destroyDataTable();
  await nextTick();
  initDataTable();
}

function goCreate() {
  router.push({ name: "olt-card-create", query: { olt_uuid: oltUuid.value } });
}
function goEdit(uuid) {
  if (!uuid) return;
  router.push({ name: "olt-card-edit", params: { uuid: String(uuid) } });
}
function goDetail(uuid) {
  if (!uuid) return;
  router.push({ name: "olt-card-detail", params: { uuid: String(uuid) } });
}

const selected = ref(new Set());
function toggleRow(uuid, checked) {
  if (!uuid) return;
  if (checked) selected.value.add(uuid);
  else selected.value.delete(uuid);
}
function isChecked(uuid) {
  return selected.value.has(uuid);
}
function clearSelection() {
  selected.value.clear();
}
async function deleteSelected() {
  if (!selected.value.size) return;
  if (!confirm(`Hapus ${selected.value.size} kartu?`)) return;
  await store.removeMany([...selected.value]);
  clearSelection();
  await rebuildDataTable();
}

async function doSync() {
  if (!oltUuid.value) {
    alert("Masukkan OLT UUID dulu untuk Sync.");
    return;
  }
  if (!confirm("Jalankan sync card dari device?")) return;
  await store.sync(oltUuid.value);
  await load();
}

onMounted(load);
onBeforeUnmount(destroyDataTable);
watch(items, async (nv, ov) => {
  if (nv !== ov) await rebuildDataTable();
});

// refresh saat filter berubah
watch([oltUuid, search], async () => {
  await destroyDataTable();
  await load();
});
</script>

<template>
  <section class="card">
    <header
      class="card-header d-flex justify-content-between align-items-center"
    >
      <h2 class="card-title m-0">OLT Card</h2>
      <div class="d-flex align-items-center gap-2">
        <input
          v-model.trim="oltUuid"
          type="text"
          class="form-control form-control-sm"
          placeholder="OLT UUID (untuk filter & Sync)"
          style="width: 260px"
        />
        <input
          v-model.trim="search"
          type="text"
          class="form-control form-control-sm"
          placeholder="Cari code/type/model"
          style="width: 220px"
        />
        <button class="btn btn-sm btn-outline-secondary" @click="doSync">
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
    </header>

    <div class="card-body">
      <div class="mb-2">
        <span v-if="loading" class="text-muted">memuat…</span>
        <span v-if="error" class="text-danger">{{ error }}</span>
      </div>

      <div class="table-responsive">
        <table
          ref="tableRef"
          id="datatable-olt-card"
          class="table table-bordered table-striped mb-0"
        >
          <thead>
            <tr>
              <th style="width: 28px">
                <!-- kolom dummy untuk checkbox header (optional) -->
              </th>
              <th>Code</th>
              <th>Slot</th>
              <th>Type</th>
              <th>Model</th>
              <th>Status</th>
              <th>Dibuat</th>
              <th style="width: 140px">Aksi</th>
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
                <!-- Detail -->
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

                <!-- Edit -->
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

                <!-- Hapus -->
                <button
                  type="button"
                  class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-danger"
                  @click="store.remove(row.uuid)"
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
