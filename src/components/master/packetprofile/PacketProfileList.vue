<script setup>
import { onMounted, computed, ref } from "vue";
import { usePacketProfileStore } from "../../../stores/packetProfile";

const store = usePacketProfileStore();

const page = ref(1);
const limit = ref(10);
const routerUuid = ref(""); // opsional filter router_uuid

const items = computed(() => store.items);
const loading = computed(() => store.loadingList);
const error = computed(() => store.error);
const pg = computed(
  () =>
    store.meta?.pagination ?? {
      per_page: 10,
      current_page: 1,
      total_pages: 1,
      total: 0,
    }
);

const load = () =>
  store.fetchList({
    page: page.value,
    limit: limit.value,
    router_uuid: routerUuid.value || undefined,
  });
onMounted(load);

const toRupiah = (n) => {
  if (n == null) return "-";
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return n;
  }
};
const fmtDate = (s) => (s ? new Date(s).toLocaleString("id-ID") : "-");
</script>

<template>
  <section class="card">
    <header
      class="card-header d-flex justify-content-between align-items-center"
    >
      <h2 class="card-title m-0">Packet Profile</h2>
      <!-- (opsional) tombol create nanti -->
      <!-- <router-link :to="{ name: 'packet-profile-create' }" class="btn btn-primary btn-sm">+ Tambah</router-link> -->
    </header>

    <div class="card-body">
      <div class="row g-2 mb-3">
        <div class="col-auto">
          <label class="form-label mb-0 me-2">Per halaman</label>
        </div>
        <div class="col-auto">
          <select
            class="form-select form-select-sm"
            v-model.number="limit"
            @change="load"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
          </select>
        </div>

        <div class="col-auto">
          <label class="form-label mb-0 ms-3 me-2">Router UUID</label>
        </div>
        <div class="col-auto">
          <input
            class="form-control form-control-sm"
            v-model.trim="routerUuid"
            placeholder="(opsional)"
          />
        </div>
        <div class="col-auto">
          <button
            class="btn btn-sm btn-outline-primary"
            @click="
              page = 1;
              load();
            "
          >
            Filter
          </button>
        </div>

        <div class="col ms-auto text-muted d-flex align-items-center">
          Total: {{ pg.total }}
        </div>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div class="table-responsive">
        <table class="table table-bordered table-striped mb-0">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Base Cost</th>
              <th>Price</th>
              <th>PPN (%)</th>
              <th>Status</th>
              <th>Dibuat</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6">Memuat…</td>
            </tr>
            <tr v-else-if="!items.length">
              <td colspan="6">Tidak ada data</td>
            </tr>
            <tr v-else v-for="row in items" :key="row.uuid">
              <td>{{ row.name }}</td>
              <td>{{ toRupiah(row.base_cost) }}</td>
              <td>{{ toRupiah(row.price) }}</td>
              <td>{{ row.ppn ?? "-" }}</td>
              <td>
                <span
                  class="badge"
                  :class="row.is_active ? 'bg-success' : 'bg-secondary'"
                >
                  {{ row.is_active ? "Aktif" : "Nonaktif" }}
                </span>
              </td>
              <td>{{ fmtDate(row.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <div>Halaman {{ pg.current_page }} / {{ pg.total_pages }}</div>
        <div class="btn-group">
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="pg.current_page <= 1 || loading"
            @click="
              page = pg.current_page - 1;
              load();
            "
          >
            ‹ Sebelumnya
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="pg.current_page >= pg.total_pages || loading"
            @click="
              page = pg.current_page + 1;
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
