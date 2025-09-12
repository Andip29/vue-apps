<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGroupProfileStore } from "../../../stores/groupProfile";

const props = defineProps({ uuid: { type: String, required: false } });

const route = useRoute();
const router = useRouter();
const store = useGroupProfileStore();

const id = ref(
  String(props.uuid || route.params.uuid || route.query.uuid || "")
);
const loading = ref(false);
const errorMsg = ref("");

const item = computed(() => store.current);

const fmt = (v) =>
  v === null || v === undefined || v === "" ? "-" : String(v);
const fmtDate = (v) => (!v ? "-" : new Date(v).toLocaleString());

async function load() {
  if (!id.value || id.value === "undefined" || id.value === "null") {
    errorMsg.value = "UUID tidak valid di URL.";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    const it = await store.getOne(String(id.value));
    if (!it) throw new Error("Record not found");
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal memuat detail Group Profile";
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push({ name: "group-profile-list" });
}
function goEdit() {
  router.push({
    name: "group-profile-edit",
    params: { uuid: String(id.value) },
  });
}
function goRouterDetail(uuid) {
  if (!uuid) return;
  router.push({ name: "router-detail", params: { uuid: String(uuid) } });
}

onMounted(load);
watch(
  () => [props.uuid, route.params.uuid, route.query.uuid],
  ([p, rp, rq]) => {
    id.value = String(p || rp || rq || "");
    load();
  }
);
</script>

<template>
  <section class="card">
    <header
      class="card-header d-flex justify-content-between align-items-center"
    >
      <div>
        <h2 class="card-title mb-0">Detail Group Profile</h2>
        <p class="card-subtitle">
          Informasi konfigurasi group & router terkait.
        </p>
      </div>

      <div class="card-actions d-flex align-items-center">
        <button
          class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-warning"
          title="Edit"
          @click="goEdit"
        >
          <i class="icons icon-note"></i>
        </button>
        <button class="btn btn-sm btn-secondary" @click="goBack">
          ← Kembali
        </button>
      </div>
    </header>

    <div class="card-body">
      <div v-if="loading" class="text-muted">Memuat…</div>
      <div v-else-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <div v-else-if="item" class="row g-3">
        <!-- Kolom kiri: informasi group profile -->
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-header">
              <h5 class="card-title mb-0">Informasi Group</h5>
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                <dt class="col-5">Nama</dt>
                <dd class="col-7">{{ fmt(item.name) }}</dd>
                <dt class="col-5">Tipe</dt>
                <dd class="col-7">{{ fmt(item.type) }}</dd>
                <dt class="col-5">Parent Pool</dt>
                <dd class="col-7">{{ fmt(item.parent_pool) }}</dd>
                <dt class="col-5">Module</dt>
                <dd class="col-7">{{ fmt(item.module) }}</dd>
                <dt class="col-5">IP Local</dt>
                <dd class="col-7">{{ fmt(item.ip_local) }}</dd>
                <dt class="col-5">First IP</dt>
                <dd class="col-7">{{ fmt(item.first_ip) }}</dd>
                <dt class="col-5">Last IP</dt>
                <dd class="col-7">{{ fmt(item.last_ip) }}</dd>
                <dt class="col-5">Status</dt>
                <dd class="col-7">
                  <span
                    class="badge"
                    :class="item.is_active ? 'bg-success' : 'bg-secondary'"
                  >
                    {{ item.is_active ? "Aktif" : "Nonaktif" }}
                  </span>
                </dd>
                <dt class="col-5">UUID</dt>
                <dd class="col-7">{{ fmt(item.uuid) }}</dd>
                <dt class="col-5">Dibuat</dt>
                <dd class="col-7">{{ fmtDate(item.created_at) }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <!-- Kolom kanan: informasi router terkait -->
        <div class="col-md-6">
          <div class="card mb-3">
            <div
              class="card-header d-flex justify-content-between align-items-center"
            >
              <h5 class="card-title mb-0">Router Terkait</h5>
              <button
                v-if="item.router?.uuid"
                class="btn btn-xs btn-default border"
                @click="goRouterDetail(item.router.uuid)"
                title="Lihat Router"
              >
                <i class="icons icon-notebook"></i> Detail Router
              </button>
            </div>
            <div class="card-body">
              <template v-if="item.router">
                <dl class="row mb-0">
                  <dt class="col-5">Code</dt>
                  <dd class="col-7">{{ fmt(item.router.code) }}</dd>
                  <dt class="col-5">Brand</dt>
                  <dd class="col-7">{{ fmt(item.router.brand) }}</dd>
                  <dt class="col-5">IP Address</dt>
                  <dd class="col-7">{{ fmt(item.router.ip_address) }}</dd>
                  <dt class="col-5">Username</dt>
                  <dd class="col-7">{{ fmt(item.router.username) }}</dd>
                  <dt class="col-5">Password</dt>
                  <dd class="col-7">{{ fmt(item.router.password) }}</dd>
                  <dt class="col-5">Community</dt>
                  <dd class="col-7">{{ fmt(item.router.community) }}</dd>
                  <dt class="col-5">Latitude</dt>
                  <dd class="col-7">{{ fmt(item.router.latitude) }}</dd>
                  <dt class="col-5">Longitude</dt>
                  <dd class="col-7">{{ fmt(item.router.longitude) }}</dd>
                  <dt class="col-5">Aktif</dt>
                  <dd class="col-7">
                    <span
                      class="badge"
                      :class="
                        item.router.is_active ? 'bg-success' : 'bg-secondary'
                      "
                    >
                      {{ item.router.is_active ? "Ya" : "Tidak" }}
                    </span>
                  </dd>
                  <dt class="col-5">Dibuat</dt>
                  <dd class="col-7">{{ fmtDate(item.router.created_at) }}</dd>
                </dl>
              </template>
              <div v-else class="text-muted">— Tidak ada router terkait —</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-muted">Data tidak ditemukan.</div>
    </div>
  </section>
</template>
