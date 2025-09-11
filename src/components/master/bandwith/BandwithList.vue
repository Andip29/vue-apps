<script setup>
import {
  onMounted,
  onBeforeUnmount,
  nextTick,
  computed,
  ref,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { useBandwithStore } from "../../../stores/bandwith";

const router = useRouter();
const store = useBandwithStore();

const items = computed(() => store.items || []);
const loading = computed(() => store.loadingList);
const error = computed(() => store.error);

// Map langsung karena field kamu sudah jelas (upload_min, upload_max, dst)
const rows = computed(() => items.value);

// ---- Helpers ----
function pickUnit(minUnit, maxUnit) {
  // pakai salah satu yang ada; kalau keduanya ada dan beda, prioritas maxUnit
  return maxUnit || minUnit || "";
}
function formatRange(minVal, maxVal, minUnit, maxUnit) {
  const u = pickUnit(minUnit, maxUnit);
  const show = (v) =>
    v === null || v === undefined || v === "" ? null : Number(v);
  const a = show(minVal);
  const b = show(maxVal);
  if (a !== null && b !== null) {
    if (a === b) return `${a} ${u}`.trim();
    return `${a}–${b} ${u}`.trim();
  }
  if (a !== null) return `${a} ${u}`.trim();
  if (b !== null) return `${b} ${u}`.trim();
  return "-";
}

// ---- Actions ----
function goCreate() {
  router.push({ name: "bandwith-create" });
}
function goEdit(uuid) {
  if (!uuid) return;
  router.push({ name: "bandwith-edit", params: { uuid: String(uuid) } });
}
async function onDelete(uuid) {
  if (!confirm("Yakin hapus bandwith ini?")) return;
  await store.remove(uuid);
  await rebuildDataTable(); // refresh tampilan tabel
}

// ---- DataTables integration ----
const tableRef = ref(null);
let dt = null;

async function load() {
  // Ambil banyak item agar DataTables yang handle paging/search.
  // Sesuaikan angka jika backend punya batas (mis. 1000).
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
  // Destroy jika sudah ada
  if (dt && $.fn.DataTable.isDataTable(tableRef.value)) {
    dt.destroy();
  }
  dt = $(tableRef.value).DataTable({
    paging: true,
    searching: true,
    autoWidth: false,
    order: [], // tidak set default sorting
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

// Re-init jika data berubah (mis. setelah hapus)
watch(rows, async (nv, ov) => {
  if (nv !== ov) await rebuildDataTable();
});
</script>

<template>
  <section class="card">
    <header
      class="card-header d-flex justify-content-between align-items-center"
    >
      <h2 class="card-title m-0">Bandwith</h2>
      <div>
        <router-link
          :to="{ name: 'bandwith-create' }"
          class="btn btn-sm btn-primary"
        >
          + Tambah Bandwith
        </router-link>
      </div>
    </header>

    <div class="card-body">
      <div v-if="error" class="alert alert-danger mb-3">{{ error }}</div>

      <div class="table-responsive">
        <table
          ref="tableRef"
          id="datatable-bandwidth"
          class="table table-bordered table-striped mb-0"
        >
          <thead>
            <tr>
              <th>Nama</th>
              <th>Upload (Mbps)</th>
              <th>Download (Mbps)</th>
              <th>Status</th>
              <th style="width: 120px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <!-- Saat loading, tampilkan baris placeholder -->
            <tr v-if="loading">
              <td colspan="5">Memuat…</td>
            </tr>
            <!-- Jika kosong -->
            <tr v-else-if="!rows.length">
              <td colspan="5">Tidak ada data</td>
            </tr>
            <!-- Data -->
            <tr v-else v-for="row in rows" :key="row.uuid">
              <td>{{ row.name }}</td>
              <td>
                {{
                  formatRange(
                    row.upload_min,
                    row.upload_max,
                    row.upload_min_unit,
                    row.upload_max_unit
                  )
                }}
              </td>
              <td>
                {{
                  formatRange(
                    row.download_min,
                    row.download_max,
                    row.download_min_unit,
                    row.download_max_unit
                  )
                }}
              </td>
              <td>
                <span
                  class="badge"
                  :class="row.is_active ? 'bg-success' : 'bg-secondary'"
                >
                  {{ row.is_active ? "Aktif" : "Nonaktif" }}
                </span>
              </td>
              <td class="text-nowrap">
                <!-- (Opsional) DETAIL — aktifkan hanya jika kamu punya route 'bandwith-detail' -->

                <router-link
                  :to="{
                    name: 'bandwith-detail',
                    params: { uuid: String(row.uuid) },
                  }"
                  class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-primary"
                  title="Detail"
                >
                  <i class="icons icon-notebook"></i>
                </router-link>

                <!-- EDIT -->
                <router-link
                  :to="{
                    name: 'bandwith-edit',
                    params: { uuid: String(row.uuid) },
                  }"
                  class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-warning"
                  title="Edit"
                >
                  <i class="icons icon-note"></i>
                </router-link>

                <!-- HAPUS (tetap button karena aksi, bukan navigasi) -->
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

      <!-- Tidak perlu pagination manual: DataTables sudah handle -->
    </div>
  </section>
</template>
