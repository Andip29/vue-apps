<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOltPonPortStore } from "../../../stores/oltPonPort";

const route = useRoute();
const router = useRouter();
const store = useOltPonPortStore();

const uuid = ref(String(route.params.uuid || ""));
const hintOltUuid = ref(String(route.query.olt_uuid || "")); // hint dari list
const loading = ref(false);
const errorMsg = ref("");

const item = computed(() => store.current);

function fmtDate(v) {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}

async function load() {
  if (!uuid.value) {
    errorMsg.value = "UUID tidak valid.";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    // 1) coba pukul endpoint detail (store sudah handle beberapa variasi)
    const it = await store.getOne(uuid.value);
    if (it) return;

    // 2) fallback: kalau tidak ketemu, coba ambil list by hint & cari lokal
    if (hintOltUuid.value) {
      const arr = await store.fetchList({
        page: 1,
        limit: 100,
        olt_uuid: hintOltUuid.value,
      });
      const found =
        arr.find((x) => String(x.uuid) === String(uuid.value)) || null;
      store.current = found || null;
      if (!found) throw new Error("Record not found (fallback)");
    } else {
      throw new Error("Record not found");
    }
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal memuat detail PON Port";
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push({
    name: "olt-pon-port-list",
    query: hintOltUuid.value ? { olt_uuid: hintOltUuid.value } : {},
  });
}
function goEdit() {
  router.push({
    name: "olt-pon-port-edit",
    params: { uuid: String(uuid.value) },
    query: hintOltUuid.value ? { olt_uuid: hintOltUuid.value } : {},
  });
}

onMounted(load);
watch(
  () => [route.params.uuid, route.query.olt_uuid],
  ([u, q]) => {
    uuid.value = String(u || "");
    hintOltUuid.value = String(q || "");
    load();
  }
);
</script>

<template>
  <section class="card">
    <header
      class="card-header d-flex justify-content-between align-items-center"
    >
      <h2 class="card-title m-0">Detail OLT PON Port</h2>
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
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-header">
              <h5 class="card-title mb-0">Informasi Port</h5>
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                <dt class="col-5">Code</dt>
                <dd class="col-7">{{ item.code || "-" }}</dd>
                <dt class="col-5">Port #</dt>
                <dd class="col-7">{{ item.port_number ?? "-" }}</dd>
                <dt class="col-5">GPON OLT</dt>
                <dd class="col-7">{{ item.gpon_olt || "-" }}</dd>
                <dt class="col-5">TX dBm</dt>
                <dd class="col-7">{{ item.txdbm ?? "-" }}</dd>
                <dt class="col-5">Endpoint</dt>
                <dd class="col-7">{{ item.endpoint || "-" }}</dd>
                <dt class="col-5">Latitude</dt>
                <dd class="col-7">{{ item.latitude ?? "-" }}</dd>
                <dt class="col-5">Longitude</dt>
                <dd class="col-7">{{ item.longitude ?? "-" }}</dd>
                <dt class="col-5">OID Code</dt>
                <dd class="col-7">{{ item.oid_code || "-" }}</dd>
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

        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-header">
              <h5 class="card-title mb-0">Keterangan</h5>
            </div>
            <div class="card-body text-muted">—</div>
          </div>
        </div>
      </div>

      <div v-else class="text-muted">Data tidak ditemukan.</div>
    </div>
  </section>
</template>
