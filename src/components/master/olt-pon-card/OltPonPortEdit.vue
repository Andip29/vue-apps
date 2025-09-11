<script setup>
import { reactive, ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOltPonPortStore } from "../../../stores/oltPonPort";

const route = useRoute();
const router = useRouter();
const store = useOltPonPortStore();

const uuid = ref(String(route.params.uuid || ""));
const loading = ref(false);
const errorMsg = ref("");

const form = reactive({
  code: "",
  port_number: "",
  gpon_olt: "",
  txdbm: "",
  endpoint: "",
  latitude: "",
  longitude: "",
  oid_code: "",
  is_active: true,
});

function hydrate(it) {
  form.code = it.code ?? "";
  form.port_number = it.port_number ?? "";
  form.gpon_olt = it.gpon_olt ?? "";
  form.txdbm = it.txdbm ?? "";
  form.endpoint = it.endpoint ?? "";
  form.latitude = it.latitude ?? "";
  form.longitude = it.longitude ?? "";
  form.oid_code = it.oid_code ?? "";
  form.is_active = (it.is_active === 1 || it.is_active === "1" || it.is_active === true);
}
function toNumberOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function load() {
  if (!uuid.value) { errorMsg.value = "UUID tidak valid."; return; }
  loading.value = true; errorMsg.value = "";
  try {
    const it = await store.getOne(uuid.value);
    if (!it) throw new Error("Record not found");
    hydrate(it);
  } catch (e) {
    errorMsg.value = store.error || e?.response?.data?.message || e?.message || "Gagal memuat port";
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  errorMsg.value = "";
  try {
    await store.update(uuid.value, {
      code: (form.code || "").trim() || undefined,
      port_number: toNumberOrNull(form.port_number),
      gpon_olt: (form.gpon_olt || "").trim() || undefined,
      txdbm: toNumberOrNull(form.txdbm),
      endpoint: (form.endpoint || "").trim() || null,
      latitude: String(form.latitude ?? ""),
      longitude: String(form.longitude ?? ""),
      oid_code: (form.oid_code || "").trim() || null,
      is_active: !!form.is_active,
    });
    router.push({ name: "olt-pon-port-detail", params: { uuid: String(uuid.value) } });
  } catch (e) {
    errorMsg.value = store.error || e?.response?.data?.message || e?.message || "Gagal menyimpan perubahan";
  }
}

onMounted(load);
watch(() => route.params.uuid, (v) => { uuid.value = String(v || ""); load(); });
</script>

<template>
  <section class="card">
    <header class="card-header d-flex justify-content-between align-items-center">
      <h2 class="card-title m-0">Edit OLT PON Port</h2>
      <div class="card-actions d-flex gap-2">
        <router-link :to="{ name: 'olt-pon-port-detail', params: { uuid } }" class="btn btn-sm btn-outline-secondary">
          Lihat Detail
        </router-link>
        <router-link :to="{ name: 'olt-pon-port-list' }" class="btn btn-sm btn-secondary">
          Kembali
        </router-link>
      </div>
    </header>

    <div class="card-body">
      <div v-if="loading" class="text-muted">Memuat…</div>
      <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <form v-if="!loading && !errorMsg" @submit.prevent="onSubmit">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Code</label>
            <input v-model.trim="form.code" type="text" class="form-control" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Port #</label>
            <input v-model.number="form.port_number" type="number" class="form-control" min="0" step="1" />
          </div>
          <div class="col-md-3">
            <label class="form-label">TX dBm</label>
            <input v-model.number="form.txdbm" type="number" class="form-control" />
          </div>

          <div class="col-md-4">
            <label class="form-label">GPON OLT</label>
            <input v-model.trim="form.gpon_olt" type="text" class="form-control" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Endpoint</label>
            <input v-model.trim="form.endpoint" type="text" class="form-control" />
          </div>

          <div class="col-md-2">
            <label class="form-label">Latitude</label>
            <input v-model.trim="form.latitude" type="text" class="form-control" />
          </div>
          <div class="col-md-2">
            <label class="form-label">Longitude</label>
            <input v-model.trim="form.longitude" type="text" class="form-control" />
          </div>

          <div class="col-md-12">
            <label class="form-label">OID Code</label>
            <input v-model.trim="form.oid_code" type="text" class="form-control" />
          </div>
        </div>

        <div class="form-check form-switch mt-3">
          <input id="isActive" class="form-check-input" type="checkbox" v-model="form.is_active" />
          <label class="form-check-label" for="isActive">Aktif</label>
        </div>

        <div class="mt-3">
          <button type="submit" class="btn btn-primary" :disabled="store.saving">
            <span v-if="store.saving" class="spinner-border spinner-border-sm me-1"></span>
            Simpan Perubahan
          </button>
          <router-link :to="{ name: 'olt-pon-port-detail', params: { uuid } }" class="btn btn-secondary ms-2">
            Batal
          </router-link>
        </div>
      </form>
    </div>
  </section>
</template>
