<script setup>
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOltPonPortStore } from "../../../stores/oltPonPort";

const route = useRoute();
const router = useRouter();
const store = useOltPonPortStore();

const errorMsg = ref("");

const form = reactive({
  // opsional: kalau dari OLT tertentu, bisa isi via ?olt_uuid=
  olt_uuid: String(route.query.olt_uuid || ""), // dikirim jika backend memerlukan
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

function toNumberOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function onSubmit() {
  errorMsg.value = "";
  try {
    const payload = {
      // beberapa backend butuh pengikat OLT/slot/card — kalau tidak dipakai backend, akan diabaikan
      olt_uuid: form.olt_uuid || undefined,
      code: (form.code || "").trim() || undefined,
      port_number: toNumberOrNull(form.port_number),
      gpon_olt: (form.gpon_olt || "").trim() || undefined,
      txdbm: toNumberOrNull(form.txdbm),
      endpoint: (form.endpoint || "").trim() || null,
      latitude: String(form.latitude ?? ""),
      longitude: String(form.longitude ?? ""),
      oid_code: (form.oid_code || "").trim() || null,
      is_active: !!form.is_active,
    };

    if (payload.port_number == null) throw new Error("Port number wajib diisi.");

    const created = await store.create(payload);
    const newId = created?.uuid || created?.id || created?.data?.uuid || null;

    if (newId) {
      router.push({ name: "olt-pon-port-edit", params: { uuid: String(newId) } });
    } else {
      router.push({
        name: "olt-pon-port-list",
        query: form.olt_uuid ? { olt_uuid: form.olt_uuid } : {},
      });
    }
  } catch (e) {
    errorMsg.value = store.error || e?.response?.data?.message || e?.message || "Gagal membuat PON Port";
  }
}
</script>

<template>
  <section class="card">
    <header class="card-header d-flex justify-content-between align-items-center">
      <h2 class="card-title m-0">Tambah OLT PON Port</h2>
      <router-link :to="{ name: 'olt-pon-port-list' }" class="btn btn-sm btn-secondary">Kembali</router-link>
    </header>

    <div class="card-body">
      <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <form @submit.prevent="onSubmit">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">OLT UUID (opsional)</label>
            <input v-model.trim="form.olt_uuid" type="text" class="form-control" placeholder="uuid OLT (opsional)" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Code</label>
            <input v-model.trim="form.code" type="text" class="form-control" placeholder="OLT_OLT-02_GTGH_SLOT_2_PORT_01" />
          </div>

          <div class="col-md-3">
            <label class="form-label">Port #</label>
            <input v-model.number="form.port_number" type="number" class="form-control" min="0" step="1" required />
          </div>
          <div class="col-md-3">
            <label class="form-label">GPON OLT</label>
            <input v-model.trim="form.gpon_olt" type="text" class="form-control" placeholder="gpon-olt_1/2/1" />
          </div>
          <div class="col-md-3">
            <label class="form-label">TX dBm</label>
            <input v-model.number="form.txdbm" type="number" class="form-control" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Endpoint</label>
            <input v-model.trim="form.endpoint" type="text" class="form-control" />
          </div>

          <div class="col-md-3">
            <label class="form-label">Latitude</label>
            <input v-model.trim="form.latitude" type="text" class="form-control" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Longitude</label>
            <input v-model.trim="form.longitude" type="text" class="form-control" />
          </div>
          <div class="col-md-6">
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
            Simpan
          </button>
          <router-link :to="{ name: 'olt-pon-port-list' }" class="btn btn-secondary ms-2">Batal</router-link>
        </div>
      </form>
    </div>
  </section>
</template>
