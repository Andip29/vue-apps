<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useOltCardStore } from "../../../stores/oltCard";

const router = useRouter();
const store = useOltCardStore();

const form = reactive({
  olt_uuid: "",
  code: "",
  slot_number: "",
  card_type: "",
  model: "",
  installed_at: "", // YYYY-MM-DD
  is_active: 1, // samakan dengan contoh: 1/0
  olt_pon_ports: [],
});

const errorMsg = ref("");

// helpers
function clonePort(p = {}) {
  return {
    code: p.code ?? "",
    is_active: p.is_active === 0 || p.is_active === false ? 0 : 1, // 1/0 biar konsisten
    port_number: p.port_number ?? null,
    txdbm: p.txdbm ?? null,
    endpoint: p.endpoint ?? "",
    latitude: p.latitude ?? "",
    longitude: p.longitude ?? "",
    oid_code: p.oid_code ?? "",
  };
}
function addPort() {
  form.olt_pon_ports.push(clonePort({ is_active: 1, port_number: 1 }));
}
function removePortAt(idx) {
  form.olt_pon_ports.splice(idx, 1);
}
function toNumberOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function onSubmit() {
  errorMsg.value = "";
  try {
    const payload = {
      olt_uuid: String(form.olt_uuid || "").trim(),
      code: String(form.code || "").trim() || undefined,
      slot_number: toNumberOrNull(form.slot_number),
      card_type: String(form.card_type || "").trim() || undefined,
      model: String(form.model || "").trim() || undefined,
      installed_at: form.installed_at || undefined,
      is_active: form.is_active === 1 ? 1 : 0,
      olt_pon_ports: form.olt_pon_ports.map((p) => ({
        code: String(p.code || "").trim() || undefined,
        is_active: p.is_active === 1, // boolean ke server juga aman
        port_number: toNumberOrNull(p.port_number),
        txdbm: toNumberOrNull(p.txdbm),
        endpoint: String(p.endpoint || "").trim() || null,
        latitude: String(p.latitude ?? ""),
        longitude: String(p.longitude ?? ""),
        oid_code: String(p.oid_code || "").trim() || null,
      })),
    };

    await store.create(payload);
    router.push({ name: "olt-card-list" });
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal membuat OLT Card";
  }
}
</script>

<template>
  <section class="card">
    <header class="card-header">
      <h2 class="card-title">Tambah OLT Card</h2>
    </header>

    <div class="card-body">
      <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <form @submit.prevent="onSubmit">
        <div class="mb-3">
          <h5 class="card-title mb-0">Informasi</h5>
        </div>

        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">OLT UUID</label>
            <input
              v-model="form.olt_uuid"
              type="text"
              class="form-control"
              placeholder="uuid OLT"
              required
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Code</label>
            <input
              v-model="form.code"
              type="text"
              class="form-control"
              placeholder="OLT_OLT-02_GTGH_SLOT_2"
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Slot Number</label>
            <input
              v-model.number="form.slot_number"
              type="number"
              class="form-control"
              min="0"
              step="1"
              required
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Card Type</label>
            <input
              v-model="form.card_type"
              type="text"
              class="form-control"
              placeholder="GPON"
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Model</label>
            <input
              v-model="form.model"
              type="text"
              class="form-control"
              placeholder="GTGH / GTGO"
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Installed At</label>
            <input
              v-model="form.installed_at"
              type="date"
              class="form-control"
              placeholder="YYYY-MM-DD"
            />
          </div>
        </div>

        <div class="form-check form-switch mt-3">
          <input
            class="form-check-input"
            type="checkbox"
            :checked="form.is_active === 1"
            @change="form.is_active = $event.target.checked ? 1 : 0"
            id="isActive"
          />
          <label class="form-check-label" for="isActive">Aktif</label>
        </div>

        <div class="mt-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="mb-0">PON Ports</h5>
            <button
              type="button"
              class="btn btn-sm btn-primary"
              @click="addPort"
            >
              + Tambah Port
            </button>
          </div>

          <div class="table-responsive">
            <table class="table table-bordered table-striped mb-0">
              <thead>
                <tr>
                  <th style="width: 60px">#</th>
                  <th>Code</th>
                  <th style="width: 100px">Aktif</th>
                  <th style="width: 120px">Port #</th>
                  <th style="width: 120px">TX dBm</th>
                  <th>Endpoint</th>
                  <th style="width: 120px">Latitude</th>
                  <th style="width: 120px">Longitude</th>
                  <th>OID Code</th>
                  <th style="width: 80px">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!form.olt_pon_ports.length">
                  <td colspan="10" class="text-muted">
                    Belum ada port. Klik "Tambah Port".
                  </td>
                </tr>
                <tr v-for="(p, i) in form.olt_pon_ports" :key="i">
                  <td>{{ i + 1 }}</td>
                  <td>
                    <input
                      v-model="p.code"
                      type="text"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td class="text-center">
                    <input
                      type="checkbox"
                      :checked="p.is_active === 1"
                      @change="p.is_active = $event.target.checked ? 1 : 0"
                    />
                  </td>
                  <td>
                    <input
                      v-model.number="p.port_number"
                      type="number"
                      class="form-control form-control-sm"
                      min="0"
                      step="1"
                    />
                  </td>
                  <td>
                    <input
                      v-model.number="p.txdbm"
                      type="number"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      v-model="p.endpoint"
                      type="text"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      v-model="p.latitude"
                      type="text"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      v-model="p.longitude"
                      type="text"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      v-model="p.oid_code"
                      type="text"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td class="text-nowrap">
                    <button
                      type="button"
                      class="mb-1 mt-1 btn btn-xs btn-default border border-danger"
                      title="Hapus"
                      @click="removePortAt(i)"
                    >
                      <i class="icons icon-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="mt-3">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="store.saving"
          >
            <span
              v-if="store.saving"
              class="spinner-border spinner-border-sm me-1"
            ></span>
            Simpan
          </button>
          <router-link
            :to="{ name: 'olt-card-list' }"
            class="btn btn-secondary ms-2"
          >
            Batal
          </router-link>
        </div>
      </form>
    </div>
  </section>
</template>
