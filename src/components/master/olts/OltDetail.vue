<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOltStore } from "../../../stores/olt";
import http from "../../../lib/api/http";

const BASE = "/master/olt";

// props opsional; kalau tidak ada pakai route param
const props = defineProps({
  uuid: { type: String, required: false },
});

const route = useRoute();
const router = useRouter();
const store = useOltStore();

const loading = ref(false);
const errorMsg = ref("");

// sumber kebenaran untuk id
const uuid = ref(String(props.uuid || route.params.uuid || ""));

const item = computed(() => store.current);

// ---- helper ----
async function fetchOneSmart(id) {
  const candidates = [
    `${BASE}/${id}`, // paling umum
    `${BASE}/detail/${id}`, // beberapa backend pakai /detail
    `${BASE}/show/${id}`, // fallback jika ada
  ];
  let lastErr = null;

  for (const url of candidates) {
    try {
      const { data } = await http.get(url);
      return data?.data ?? data ?? null;
    } catch (err) {
      lastErr = err;
      const code = err?.response?.status;
      if (code && code !== 404) throw err; // error selain 404 → hentikan
      // 404 → lanjut kandidat berikutnya
    }
  }

  // fallback terakhir: ambil dari cache list bila ada
  const cached =
    store.items.find((x) => String(x.uuid) === String(id)) ||
    store.items.find((x) => String(x.id) === String(id)) ||
    null;

  if (cached) return cached;

  throw lastErr || new Error("Record not found");
}

function fmtDate(v) {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}

const attachments = computed(() => {
  const it = item.value || {};
  const raw = it.olt_attachments || it.attachments || it.files || [];
  // normalisasi minimal: name + url
  return Array.isArray(raw)
    ? raw.map((a, i) => ({
        name: a?.name || a?.filename || `Attachment ${i + 1}`,
        url: a?.url || a?.link || a?.path || "#",
      }))
    : [];
});

async function load() {
  // validasi uuid
  if (!uuid.value || uuid.value === "undefined" || uuid.value === "null") {
    errorMsg.value = "UUID tidak valid di URL.";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    const it = await fetchOneSmart(uuid.value);
    if (!it) throw new Error("Record not found");
    store.current = it; // sinkronkan ke store untuk halaman lain
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal memuat detail OLT";
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push({ name: "olt-list" });
}

function goEdit() {
  router.push({ name: "olt-edit", params: { uuid: String(uuid.value) } });
}

onMounted(load);

// re-load bila uuid dari route/props berubah
watch(
  () => [props.uuid, route.params.uuid],
  ([p, r]) => {
    uuid.value = String(p || r || "");
    load();
  }
);
</script>

<template>
  <div class="row">
    <div class="col">
      <section class="card">
        <header
          class="card-header d-flex align-items-center justify-content-between"
        >
          <div>
            <h2 class="card-title mb-0">Detail OLT</h2>
            <p class="card-subtitle">Basic system information</p>
          </div>
          <div class="card-actions d-flex gap-2">
            <button class="btn btn-sm btn-warning" @click="goEdit">Edit</button>
            <button class="btn btn-sm btn-secondary" @click="goBack">
              ← Kembali
            </button>
          </div>
        </header>

        <div class="card-body">
          <div v-if="loading">Memuat…</div>
          <div v-else-if="errorMsg" class="alert alert-danger">
            {{ errorMsg }}
          </div>

          <div v-else-if="item">
            <!-- Grid 2 kolom untuk info dasar -->
            <div class="row g-3">
              <div class="col-md-6">
                <div class="card mb-3">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Informasi Dasar</h5>
                  </div>
                  <div class="card-body">
                    <dl class="row mb-0">
                      <dt class="col-5">Code</dt>
                      <dd class="col-7">{{ item.code || "-" }}</dd>
                      <dt class="col-5">Brand</dt>
                      <dd class="col-7">{{ item.brand || "-" }}</dd>
                      <dt class="col-5">Type</dt>
                      <dd class="col-7">{{ item.type || "-" }}</dd>
                      <dt class="col-5">Mode</dt>
                      <dd class="col-7">{{ item.mode || "-" }}</dd>
                      <dt class="col-5">Location</dt>
                      <dd class="col-7">{{ item.location || "-" }}</dd>
                      <dt class="col-5">Created At</dt>
                      <dd class="col-7">{{ fmtDate(item.created_at) }}</dd>
                      <dt class="col-5">Status</dt>
                      <dd class="col-7">
                        <span
                          class="badge"
                          :class="
                            item.is_active ? 'bg-success' : 'bg-secondary'
                          "
                        >
                          {{ item.is_active ? "Aktif" : "Nonaktif" }}
                        </span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="card mb-3">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Network & Credential</h5>
                  </div>
                  <div class="card-body">
                    <dl class="row mb-0">
                      <dt class="col-5">IP Address</dt>
                      <dd class="col-7">{{ item.ip_address || "-" }}</dd>
                      <dt class="col-5">Username</dt>
                      <dd class="col-7">{{ item.username || "-" }}</dd>
                      <dt class="col-5">Password</dt>
                      <dd class="col-7">
                        {{ item.password || "—" }}
                      </dd>
                      <dt class="col-5">Community</dt>
                      <dd class="col-7">{{ item.community || "-" }}</dd>
                      <dt class="col-5">Latitude</dt>
                      <dd class="col-7">{{ item.latitude || "-" }}</dd>
                      <dt class="col-5">Longitude</dt>
                      <dd class="col-7">{{ item.longitude || "-" }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lampiran -->
            <div class="card">
              <div
                class="card-header d-flex align-items-center justify-content-between"
              >
                <h5 class="card-title mb-0">Lampiran</h5>
              </div>
              <div class="card-body">
                <div v-if="attachments.length">
                  <ul class="list-group">
                    <li
                      v-for="(att, i) in attachments"
                      :key="i"
                      class="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>{{ att.name }}</span>
                      <a
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

          <div v-else class="text-muted">Data OLT tidak ditemukan.</div>
        </div>
      </section>
    </div>
  </div>
</template>
