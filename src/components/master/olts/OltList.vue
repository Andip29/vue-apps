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
import { useOltStore } from "../../../stores/olt";

const router = useRouter();
const store = useOltStore();

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
  router.push({ name: "olt-create" });
}
function goEdit(uuid) {
  if (!uuid) return;
  router.push({ name: "olt-edit", params: { uuid: String(uuid) } });
}
async function onDelete(uuid) {
  if (!confirm("Yakin hapus OLT ini?")) return;
  await store.remove(uuid);
  await rebuildDataTable(); // refresh tampilan tabel (konsisten dengan Bandwidth)
}

async function load() {
  // Ambil cukup banyak item agar DataTables yang handle paging/search (sama pattern dengan Bandwidth)
  await store.fetchList({ page: 1, limit: 1000 });
  await nextTick();
  initDataTable();
}

function initDataTable() {
  const $ = window.jQuery;
  if (!($ && $.fn && $.fn.DataTable)) {
    console.warn(
      "jQuery DataTables tidak ditemukan. Pastikan JS/CSS DataTables sudah dimuat di index.html"
    );
    return;
  }
  if (dt && $.fn.DataTable.isDataTable(tableRef.value)) {
    dt.destroy();
  }
  dt = $(tableRef.value).DataTable({
    paging: true,
    searching: true,
    autoWidth: false,
    order: [], // tidak memaksakan default sorting (sama seperti Bandwidth)
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

onMounted(load);
onBeforeUnmount(destroyDataTable);

// Re-init jika data berubah signifikan (mis. setelah hapus)
watch(items, async (nv, ov) => {
  if (nv !== ov) await rebuildDataTable();
});
</script>

<template>
  <div class="row">
    <div class="col">
      <section class="card">
        <header
          class="card-header d-flex justify-content-between align-items-center"
        >
          <h2 class="card-title m-0">OLT</h2>
          <div>
            <router-link
              :to="{ name: 'olt-create' }"
              class="btn btn-sm btn-primary"
            >
              + Tambah OLT
            </router-link>
          </div>
        </header>

        <div class="card-body">
          <div class="mb-2">
            <span v-if="loading" class="text-muted">memuat…</span>
            <span v-if="error" class="text-danger">{{ error }}</span>
          </div>

          <div class="table-responsive">
            <table
              id="datatable-olt"
              ref="tableRef"
              class="table table-bordered table-striped mb-0"
            >
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Brand</th>
                  <th>Type</th>
                  <th>Mode</th>
                  <th>Location</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>IP Address</th>
                  <th>Community</th>
                  <th>Status</th>
                  <!-- konsisten label dengan Bandwidth -->
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
                  <td>{{ it.type || "-" }}</td>
                  <td>{{ it.mode || "-" }}</td>
                  <td>{{ it.location || "-" }}</td>
                  <td>{{ it.latitude || "-" }}</td>
                  <td>{{ it.longitude || "-" }}</td>
                  <td>{{ it.ip_address || "-" }}</td>
                  <td>{{ it.community || "-" }}</td>
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
                    <!-- Detail -->
                    <router-link
                      :to="{
                        name: 'olt-detail',
                        params: { uuid: String(it.uuid) },
                      }"
                      class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-primary"
                      title="Detail"
                    >
                      <i class="icons icon-notebook"></i>
                    </router-link>

                    <!-- Edit -->
                    <router-link
                      :to="{
                        name: 'olt-edit',
                        params: { uuid: String(it.uuid) },
                      }"
                      class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-warning"
                      title="Edit"
                    >
                      <i class="icons icon-note"></i>
                    </router-link>

                    <!-- Hapus (tetap button) -->
                    <button
                      type="button"
                      class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-danger"
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
    </div>
  </div>
</template>
