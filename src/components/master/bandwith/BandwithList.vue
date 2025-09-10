<script setup>
import { onMounted, computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useBandwithStore } from "../../../stores/bandwith";

const router = useRouter();
const store = useBandwithStore();

const page = ref(1);
const limit = ref(10);

const pagination = computed(
  () =>
    store.meta?.pagination ?? {
      per_page: 10,
      current_page: 1,
      total_pages: 1,
      total: 0,
    }
);
const items = computed(() => store.items);
const loading = computed(() => store.loadingList);
const error = computed(() => store.error);

const load = () => store.fetchList({ page: page.value, limit: limit.value });

onMounted(load);

function goCreate() {
  router.push({ name: "bandwith-create" });
}
function goEdit(uuid) {
  if (!uuid) return; // jaga-jaga
  router.push({ name: "bandwith-edit", params: { uuid: String(uuid) } }); // pastikan string
}
async function onDelete(uuid) {
  if (!confirm("Yakin hapus bandwith ini?")) return;
  await store.remove(uuid);
  // refresh jika perlu: await load()
}
</script>

<template>
  <section class="card">
    <header
      class="card-header d-flex justify-content-between align-items-center"
    >
      <h2 class="card-title m-0">Bandwith</h2>
      <div>
        <button class="btn btn-primary btn-sm" @click="goCreate">
          + Tambah Bandwith
        </button>
      </div>
    </header>

    <div class="card-body">
      <div v-if="error" class="alert alert-danger mb-3">{{ error }}</div>

      <div class="d-flex align-items-center gap-2 mb-2">
        <label class="mb-0">Per halaman:</label>
        <select
          class="form-select form-select-sm w-auto"
          v-model.number="limit"
          @change="load"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
        <span class="text-muted ms-2">Total: {{ pagination.total }}</span>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered table-striped mb-0">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Upload</th>
              <th>Download</th>
              <th>Status</th>
              <th style="width: 120px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5">Memuat…</td>
            </tr>
            <tr v-else-if="!items.length">
              <td colspan="5">Tidak ada data</td>
            </tr>
            <tr v-else v-for="row in items" :key="row.uuid">
              <td>{{ row.name }}</td>
              <td>
                {{ row.upload_min }}–{{ row.upload_max }}
                {{ row.upload_min_unit || row.upload_max_unit }}
              </td>
              <td>
                {{ row.download_min }}–{{ row.download_max }}
                {{ row.download_min_unit || row.download_max_unit }}
              </td>
              <td>
                <span
                  class="badge"
                  :class="row.is_active ? 'bg-success' : 'bg-secondary'"
                >
                  {{ row.is_active ? "Aktif" : "Nonaktif" }}
                </span>
              </td>
              <td>
                <button
                  class="btn btn-xs btn-warning me-1"
                  @click="goEdit(row.uuid)"
                >
                  Edit
                </button>
                <button
                  class="btn btn-xs btn-danger"
                  @click="onDelete(row.uuid)"
                >
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <div>
          Halaman {{ pagination.current_page }} / {{ pagination.total_pages }}
        </div>
        <div class="btn-group">
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="pagination.current_page <= 1 || loading"
            @click="
              page = pagination.current_page - 1;
              load();
            "
          >
            ‹ Sebelumnya
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="
              pagination.current_page >= pagination.total_pages || loading
            "
            @click="
              page = pagination.current_page + 1;
              load();
            "
          >
            Berikutnya ›
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
