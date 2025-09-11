<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useBandwithStore } from "../../../stores/bandwith";

const props = defineProps({
  uuid: { type: String, required: false },
});

const route = useRoute();
const router = useRouter();
const store = useBandwithStore();

const loading = ref(false);
const errorMsg = ref("");

const id = ref(String(props.uuid || route.params.uuid || ""));

const item = computed(() => store.current);

// === helpers ===
function normalizeUnit(u) {
  if (!u) return "";
  const s = String(u).toLowerCase();
  if (s === "mbps") return "Mbps";
  if (s === "kbps") return "Kbps";
  if (s === "gbps") return "Gbps";
  return u;
}
function pickUnit(minUnit, maxUnit) {
  // prioritas unit max, fallback min
  return normalizeUnit(maxUnit || minUnit || "");
}
function formatRange(minVal, maxVal, minUnit, maxUnit) {
  const u = pickUnit(minUnit, maxUnit);
  const toNum = (v) =>
    v === null || v === undefined || v === "" ? null : Number(v);
  const a = toNum(minVal);
  const b = toNum(maxVal);
  if (a !== null && b !== null) {
    if (a === b) return `${a} ${u}`.trim();
    return `${a}–${b} ${u}`.trim();
  }
  if (a !== null) return `${a} ${u}`.trim();
  if (b !== null) return `${b} ${u}`.trim();
  return "-";
}
function fmtDate(v) {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}

// === actions ===
async function load() {
  if (!id.value || id.value === "undefined" || id.value === "null") {
    errorMsg.value = "UUID tidak valid di URL.";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    await store.getOne(String(id.value)); // gunakan store yang sudah ada
    if (!store.current) throw new Error("Record not found");
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal memuat detail Bandwidth";
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push({ name: "bandwith-list" });
}
function goEdit() {
  router.push({ name: "bandwith-edit", params: { uuid: String(id.value) } });
}

onMounted(load);
watch(
  () => [props.uuid, route.params.uuid],
  ([p, r]) => {
    id.value = String(p || r || "");
    load();
  }
);
</script>

<template>
  <section class="card">
    <header
      class="card-header d-flex align-items-center justify-content-between"
    >
      <div>
        <h2 class="card-title mb-0">Detail Bandwith</h2>
        <p class="card-subtitle">Informasi paket bandwidth</p>
      </div>
      <div class="card-actions d-flex align-items-center">
        <!-- EDIT pakai router-link dengan style seperti contoh -->
        <router-link
          :to="{ name: 'bandwith-edit', params: { uuid: String(id) } }"
          class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-warning"
          title="Edit"
        >
          <i class="icons icon-note"></i>
        </router-link>

        <!-- Kembali -->
        <router-link
          :to="{ name: 'bandwith-list' }"
          class="btn btn-sm btn-secondary"
        >
          ← Kembali
        </router-link>
      </div>
    </header>

    <div class="card-body">
      <div v-if="loading" class="text-muted">Memuat…</div>
      <div v-else-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <div v-else-if="item" class="row g-3">
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-header">
              <h5 class="card-title mb-0">Informasi Dasar</h5>
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                <dt class="col-5">Nama Paket</dt>
                <dd class="col-7">{{ item.name || "-" }}</dd>

                <dt class="col-5">Upload</dt>
                <dd class="col-7">
                  {{
                    formatRange(
                      item.upload_min,
                      item.upload_max,
                      item.upload_min_unit,
                      item.upload_max_unit
                    )
                  }}
                </dd>

                <dt class="col-5">Download</dt>
                <dd class="col-7">
                  {{
                    formatRange(
                      item.download_min,
                      item.download_max,
                      item.download_min_unit,
                      item.download_max_unit
                    )
                  }}
                </dd>

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
                <dd class="col-7">{{ item.uuid || "-" }}</dd>

                <dt class="col-5">Dibuat</dt>
                <dd class="col-7">{{ fmtDate(item.created_at) }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <!-- (opsional) kolom kanan jika nanti ada informasi lain -->
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-header">
              <h5 class="card-title mb-0">Keterangan</h5>
            </div>
            <div class="card-body">
              <div class="text-muted">Tidak ada keterangan tambahan.</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-muted">Data Bandwidth tidak ditemukan.</div>
    </div>
  </section>
</template>

<style scoped>
.badge {
  font-size: 0.75rem;
  padding: 0.35rem 0.55rem;
  border-radius: 0.5rem;
}
</style>
