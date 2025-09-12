<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRouterStore } from "../../../stores/router";

const props = defineProps({ uuid: { type: String, required: false } });
const route = useRoute();
const router = useRouter();
const store = useRouterStore();

const id = ref(
  String(props.uuid || route.params.uuid || route.query.uuid || "")
);
const loading = ref(false);
const errorMsg = ref("");
const lastUpdated = ref(null);

// Live refresh controls
const liveEnabled = ref(true);
const intervalMs = ref(5000);
let timer = null;

const item = computed(() => store.current);

// ---------- helpers ----------
const fmt = (v) =>
  v === null || v === undefined || v === "" ? "-" : String(v);
const fmtDate = (v) => (!v ? "-" : new Date(v).toLocaleString());

function toNumber(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v).trim().replace("%", "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function parseMemMB(v) {
  // menerima "123 MB", "1.5 GB", angka mentah, atau "0 MB"
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v; // asumsikan sudah MB
  const s = String(v).trim().toUpperCase();
  const m = s.match(/^([0-9]*\.?[0-9]+)\s*(B|KB|MB|GB|TB)?$/i);
  if (!m) return null;
  const val = parseFloat(m[1]);
  const unit = (m[2] || "MB").toUpperCase();
  const mult =
    { B: 1 / (1024 * 1024), KB: 1 / 1024, MB: 1, GB: 1024, TB: 1024 * 1024 }[
      unit
    ] ?? 1;
  return val * mult;
}

const cpuPct = computed(() => {
  const x = toNumber(item.value?.cpu_load);
  if (x === null) return null;
  return Math.max(0, Math.min(100, x));
});

const totalMB = computed(() => parseMemMB(item.value?.total_memory));
const freeMB = computed(() => parseMemMB(item.value?.free_memory));
const usedMB = computed(() => {
  if (totalMB.value === null || freeMB.value === null) return null;
  return Math.max(0, totalMB.value - freeMB.value);
});
const usedPct = computed(() => {
  if (totalMB.value === null || totalMB.value <= 0 || usedMB.value === null)
    return null;
  return Math.max(0, Math.min(100, (usedMB.value / totalMB.value) * 100));
});

function humanMB(v) {
  if (v === null) return "-";
  if (v >= 1024) return `${(v / 1024).toFixed(2)} GB`;
  return `${Math.round(v)} MB`;
}

// ---------- data load ----------
async function loadOnce() {
  if (!id.value || id.value === "undefined" || id.value === "null") {
    errorMsg.value = "UUID tidak valid di URL.";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    // Ambil terbaru dari backend. Coba sync dulu kalau endpoint ada.
    try {
      await store.sync?.({ uuid: id.value });
    } catch {
      // jika sync tidak ada/404, abaikan dan lanjut getOne
    }
    const it = await store.getOne(String(id.value));
    if (!it) throw new Error("Record not found");
    lastUpdated.value = new Date();
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal memuat detail router";
  } finally {
    loading.value = false;
  }
}

function startTimer() {
  stopTimer();
  if (!liveEnabled.value) return;
  timer = setInterval(async () => {
    try {
      await store.sync?.({ uuid: id.value }).catch(() => {});
      await store.getOne(String(id.value));
      lastUpdated.value = new Date();
    } catch {
      // jangan timpa errorMsg saat refresh berkala;
      // biar UI tetap stabil—cukup log ke console.
      // console.warn("refresh gagal", err);
    }
  }, intervalMs.value);
}
function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function refreshNow() {
  loadOnce();
}

function goBack() {
  router.push({ name: "router-list" });
}

// lifecycle
onMounted(async () => {
  await loadOnce();
  startTimer();
});
onBeforeUnmount(() => stopTimer());

// reload bila sumber UUID berubah
watch(
  () => [props.uuid, route.params.uuid, route.query.uuid],
  async ([p, rp, rq]) => {
    id.value = String(p || rp || rq || "");
    await loadOnce();
    startTimer();
  }
);

// ubah interval / toggle live
watch(liveEnabled, () => startTimer());
watch(intervalMs, () => startTimer());
</script>

<template>
  <section class="card">
    <header
      class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2"
    >
      <div>
        <h2 class="card-title mb-0">Detail Router</h2>
        <p class="card-subtitle">Informasi dasar &amp; monitoring (live).</p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <div class="form-check form-switch me-2">
          <input
            id="liveSwitch"
            class="form-check-input"
            type="checkbox"
            v-model="liveEnabled"
          />
          <label class="form-check-label" for="liveSwitch">Live</label>
        </div>

        <select
          v-model.number="intervalMs"
          class="form-select form-select-sm"
          style="width: 110px"
        >
          <option :value="3000">3s</option>
          <option :value="5000">5s</option>
          <option :value="10000">10s</option>
        </select>

        <button
          class="btn btn-sm btn-outline-primary"
          @click="refreshNow"
          :disabled="loading"
        >
          <i class="bx bx-refresh me-1"></i> Segarkan
        </button>

        <router-link
          :to="{ name: 'router-edit', params: { uuid: id } }"
          class="mb-1 mt-1 btn btn-xs btn-default border border-warning"
          title="Edit"
        >
          <i class="icons icon-note"></i>
        </router-link>

        <button class="btn btn-sm btn-secondary" @click="goBack">
          ← Kembali
        </button>
      </div>
    </header>

    <div class="card-body">
      <div class="mb-2 text-muted" v-if="lastUpdated">
        Terakhir diperbarui: {{ new Date(lastUpdated).toLocaleTimeString() }}
      </div>

      <div v-if="loading" class="text-muted">Memuat…</div>
      <div v-else-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <div v-else-if="item" class="row g-3">
        <!-- Informasi dasar -->
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-header">
              <h5 class="card-title mb-0">Informasi</h5>
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                <dt class="col-5">Code</dt>
                <dd class="col-7">{{ fmt(item.code) }}</dd>
                <dt class="col-5">Brand</dt>
                <dd class="col-7">{{ fmt(item.brand) }}</dd>
                <dt class="col-5">Location</dt>
                <dd class="col-7">{{ fmt(item.location) }}</dd>
                <dt class="col-5">Latitude</dt>
                <dd class="col-7">{{ fmt(item.latitude) }}</dd>
                <dt class="col-5">Longitude</dt>
                <dd class="col-7">{{ fmt(item.longitude) }}</dd>
                <dt class="col-5">IP Address</dt>
                <dd class="col-7">{{ fmt(item.ip_address) }}</dd>
                <dt class="col-5">Username</dt>
                <dd class="col-7">{{ fmt(item.username) }}</dd>
                <dt class="col-5">Password</dt>
                <dd class="col-7">{{ fmt(item.password) }}</dd>
                <dt class="col-5">Community</dt>
                <dd class="col-7">{{ fmt(item.community) }}</dd>
                <dt class="col-5">Port (API)</dt>
                <dd class="col-7">{{ fmt(item.port) }}</dd>
                <dt class="col-5">IP Radius</dt>
                <dd class="col-7">{{ fmt(item.ip_address_radius) }}</dd>
                <dt class="col-5">Secret Radius</dt>
                <dd class="col-7">{{ fmt(item.secret_radius) }}</dd>
                <dt class="col-5">Aktif</dt>
                <dd class="col-7">
                  <span
                    class="badge"
                    :class="item.is_active ? 'bg-success' : 'bg-secondary'"
                  >
                    {{ item.is_active ? "Ya" : "Tidak" }}
                  </span>
                </dd>
                <dt class="col-5">UUID</dt>
                <dd class="col-7">{{ fmt(item.uuid) }}</dd>
                <dt class="col-5">Dibuat</dt>
                <dd class="col-7">{{ fmtDate(item.created_at) }}</dd>
              </dl>
            </div>
          </div>

          <!-- Lampiran -->
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Lampiran</h5>
            </div>
            <div class="card-body">
              <div
                v-if="
                  Array.isArray(item.router_attachments) &&
                  item.router_attachments.length
                "
              >
                <ul class="list-group">
                  <li
                    v-for="(att, i) in item.router_attachments"
                    :key="att.uuid || i"
                    class="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>{{
                      att.name || att.filename || `Attachment ${i + 1}`
                    }}</span>
                    <a
                      v-if="att.url"
                      :href="att.url"
                      target="_blank"
                      rel="noopener"
                      class="btn btn-xs btn-default border"
                      >Lihat</a
                    >
                  </li>
                </ul>
              </div>
              <div v-else class="text-muted">Tidak ada lampiran.</div>
            </div>
          </div>
        </div>

        <!-- Monitoring live -->
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-header">
              <h5 class="card-title mb-0">Monitoring (Live)</h5>
            </div>
            <div class="card-body">
              <dl class="row mb-3">
                <dt class="col-5">Status Online</dt>
                <dd class="col-7">{{ fmt(item.status_online) }}</dd>
                <dt class="col-5">Uptime</dt>
                <dd class="col-7">{{ fmt(item.up_time) }}</dd>
                <dt class="col-5">Version</dt>
                <dd class="col-7">{{ fmt(item.version) }}</dd>
              </dl>

              <!-- CPU -->
              <div class="mb-3">
                <div
                  class="d-flex justify-content-between align-items-center mb-1"
                >
                  <strong>CPU Load</strong>
                  <span>{{
                    cpuPct === null ? "-" : cpuPct.toFixed(0) + "%"
                  }}</span>
                </div>
                <div class="progress" style="height: 10px">
                  <div
                    class="progress-bar"
                    role="progressbar"
                    :style="{ width: (cpuPct ?? 0) + '%' }"
                    :aria-valuenow="cpuPct ?? 0"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>

              <!-- Memory -->
              <div class="mb-1">
                <div
                  class="d-flex justify-content-between align-items-center mb-1"
                >
                  <strong>Memory</strong>
                  <span>
                    <template v-if="usedMB !== null && totalMB !== null">
                      {{ humanMB(usedMB) }} / {{ humanMB(totalMB) }} ({{
                        usedPct === null ? "-" : usedPct.toFixed(0) + "%"
                      }})
                    </template>
                    <template v-else>-</template>
                  </span>
                </div>
                <div class="progress" style="height: 10px">
                  <div
                    class="progress-bar"
                    role="progressbar"
                    :style="{ width: (usedPct ?? 0) + '%' }"
                    :aria-valuenow="usedPct ?? 0"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ruang ekstra untuk grafik lain (opsional) -->
          <!-- Tambahkan sparkline/barchart custom jika dibutuhkan -->
        </div>
      </div>

      <div v-else class="text-muted">Data router tidak ditemukan.</div>
    </div>
  </section>
</template>
