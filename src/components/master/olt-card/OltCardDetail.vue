<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import http from "../../../lib/api/http";
import { useOltCardStore } from "../../../stores/oltCard";

const BASE = "/master/olt-card";

const props = defineProps({ uuid: { type: String, required: false } });
const route = useRoute();
const router = useRouter();
const store = useOltCardStore();

const id = ref(String(props.uuid || route.params.uuid || ""));
const loading = ref(false);
const errorMsg = ref("");

// sumber item (card) diambil dari store.current
const item = computed(() => store.current || null);
const olt = computed(() =>
  item.value && item.value.olt ? item.value.olt : null
);
const ports = computed(() =>
  Array.isArray(item.value?.olt_pon_ports) ? item.value.olt_pon_ports : []
);

function fmtDate(v) {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}
function yesNo(v) {
  return v === 1 || v === "1" || v === true ? "Aktif" : "Nonaktif";
}
function portLabel(p, i) {
  return p?.label || p?.name || p?.port || p?.port_number || `Port #${i + 1}`;
}

// ——— Loader tahan banting: object / array / fallback list ———
async function fetchOneSmart(uuid) {
  let lastErr = null;

  // 1) coba /:uuid
  try {
    const { data } = await http.get(`${BASE}/${uuid}`);
    const payload = data?.data ?? data ?? null;
    if (payload) {
      if (Array.isArray(payload)) {
        const found = payload.find((x) => String(x.uuid) === String(uuid));
        if (found) return found;
      } else {
        return payload;
      }
    }
  } catch (e) {
    lastErr = e;
    if (e?.response?.status && e.response.status !== 404) throw e;
  }

  // 2) fallback /detail/:uuid
  try {
    const { data } = await http.get(`${BASE}/detail/${uuid}`);
    const payload = data?.data ?? data ?? null;
    if (payload) {
      if (Array.isArray(payload)) {
        const found = payload.find((x) => String(x.uuid) === String(uuid));
        if (found) return found;
      } else {
        return payload;
      }
    }
  } catch (e) {
    lastErr = e;
    if (e?.response?.status && e.response.status !== 404) throw e;
  }

  // 3) fallback terakhir: list (ambil secukupnya lalu cari)
  try {
    const { data } = await http.get(`${BASE}`, {
      params: { page: 1, limit: 1000 },
    });
    const arr = data?.data;
    if (Array.isArray(arr)) {
      const found = arr.find((x) => String(x.uuid) === String(uuid));
      if (found) return found;
    }
  } catch (e) {
    lastErr = e;
  }

  throw lastErr || new Error("Record not found");
}

async function load() {
  if (!id.value || id.value === "undefined" || id.value === "null") {
    errorMsg.value = "UUID tidak valid di URL.";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    // coba lewat store dulu; kalau store.getOne gagal, pakai fetchOneSmart
    try {
      await store.getOne(id.value);
    } catch {
      const it = await fetchOneSmart(id.value);
      store.current = it;
    }
    if (!store.current) throw new Error("Record not found");
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal memuat detail OLT Card";
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push({ name: "olt-card-list" });
}
function goEdit() {
  router.push({ name: "olt-card-edit", params: { uuid: String(id.value) } });
}
function goOlt() {
  const oltUuid = olt.value?.uuid;
  if (oltUuid)
    router.push({ name: "olt-detail", params: { uuid: String(oltUuid) } });
}
function goOltCards() {
  const oltUuid = olt.value?.uuid;
  router.push({
    name: "olt-card-list",
    query: oltUuid ? { olt_uuid: String(oltUuid) } : {},
  });
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
      class="card-header d-flex justify-content-between align-items-center"
    >
      <h2 class="card-title m-0">Detail OLT Card</h2>
      <div class="card-actions d-flex align-items-center">
        <button
          type="button"
          class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-warning"
          @click="goEdit"
          title="Edit"
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
        <!-- KIRI: Informasi Card -->
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-header">
              <h5 class="card-title mb-0">Informasi Card</h5>
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                <dt class="col-5">Code</dt>
                <dd class="col-7">{{ item.code || "-" }}</dd>

                <dt class="col-5">Slot Number</dt>
                <dd class="col-7">{{ item.slot_number ?? "-" }}</dd>

                <dt class="col-5">Card Type</dt>
                <dd class="col-7">{{ item.card_type || "-" }}</dd>

                <dt class="col-5">Model</dt>
                <dd class="col-7">{{ item.model || "-" }}</dd>

                <dt class="col-5">Status</dt>
                <dd class="col-7">
                  <span
                    class="badge"
                    :class="item.is_active ? 'bg-success' : 'bg-secondary'"
                  >
                    {{ yesNo(item.is_active) }}
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

        <!-- KANAN: Informasi OLT induk -->
        <div class="col-md-6">
          <div class="card mb-3">
            <div
              class="card-header d-flex justify-content-between align-items-center"
            >
              <h5 class="card-title mb-0">Informasi OLT</h5>
              <div>
                <button
                  v-if="olt"
                  type="button"
                  class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-primary"
                  @click="goOlt"
                  title="Lihat OLT"
                >
                  <i class="icons icon-notebook"></i>
                </button>
                <button
                  type="button"
                  class="mb-1 mt-1 btn btn-xs btn-default border border-primary"
                  @click="goOltCards"
                  title="Daftar Card OLT ini"
                >
                  <i class="icons icon-layers"></i>
                </button>
              </div>
            </div>
            <div class="card-body">
              <template v-if="olt">
                <dl class="row mb-0">
                  <dt class="col-5">Code</dt>
                  <dd class="col-7">{{ olt.code || "-" }}</dd>
                  <dt class="col-5">Brand</dt>
                  <dd class="col-7">{{ olt.brand || "-" }}</dd>
                  <dt class="col-5">Mode</dt>
                  <dd class="col-7">{{ olt.mode || "-" }}</dd>
                  <dt class="col-5">Lokasi</dt>
                  <dd class="col-7">{{ olt.location || "-" }}</dd>
                  <dt class="col-5">IP Address</dt>
                  <dd class="col-7">{{ olt.ip_address || "-" }}</dd>
                  <dt class="col-5">Koordinat</dt>
                  <dd class="col-7">
                    <span v-if="olt.latitude || olt.longitude">
                      {{ olt.latitude || "?" }}, {{ olt.longitude || "?" }}
                    </span>
                    <span v-else>-</span>
                  </dd>
                  <dt class="col-5">Status</dt>
                  <dd class="col-7">
                    <span
                      class="badge"
                      :class="olt.is_active ? 'bg-success' : 'bg-secondary'"
                    >
                      {{ yesNo(olt.is_active) }}
                    </span>
                  </dd>
                  <dt class="col-5">UUID</dt>
                  <dd class="col-7">{{ olt.uuid || "-" }}</dd>
                  <dt class="col-5">Dibuat</dt>
                  <dd class="col-7">{{ fmtDate(olt.created_at) }}</dd>
                </dl>
              </template>
              <div v-else class="text-muted">
                Data OLT tidak tersedia pada respons.
              </div>
            </div>
          </div>
        </div>

        <!-- PON Ports (jika ada) -->
        <div class="col-12" v-if="ports.length">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">PON Ports ({{ ports.length }})</h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-bordered table-striped mb-0">
                  <thead>
                    <tr>
                      <th style="width: 80px">#</th>
                      <th>Label</th>
                      <th>Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(p, i) in ports" :key="i">
                      <td>{{ i + 1 }}</td>
                      <td>{{ portLabel(p, i) }}</td>
                      <td>
                        <!-- tampilkan ringkas properti umum kalau ada -->
                        <span v-if="p?.status">Status: {{ p.status }}</span>
                        <span v-if="p?.onu_count" class="ms-2"
                          >ONU: {{ p.onu_count }}</span
                        >
                        <span
                          v-if="!p?.status && !p?.onu_count"
                          class="text-muted"
                          >—</span
                        >
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-muted">Data tidak ditemukan.</div>
    </div>
  </section>
</template>
