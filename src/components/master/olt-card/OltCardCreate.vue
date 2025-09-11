<script setup>
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOltCardStore } from "../../../stores/oltCard";

const route = useRoute();
const router = useRouter();
const store = useOltCardStore();

const errorMsg = ref("");

// --- FORM STATE (sesuai Postman) ---
const form = reactive({
  olt_uuid: String(route.query.olt_uuid || ""), // prefill dari query bila ada
  code: "",
  slot_number: "",
  card_type: "",
  model: "",
  installed_at: "", // YYYY-MM-DD
  is_active: true, // <- boolean (sesuai Postman)
  olt_pon_ports: [], // array of ports
});

function clonePort(p = {}) {
  return {
    code: p.code ?? "",
    is_active: p.is_active === false ? false : true,
    port_number: p.port_number ?? null,
    txdbm: p.txdbm ?? null, // nullable number
    endpoint: p.endpoint ?? "", // nullable string -> kirim null kalau kosong
    latitude: p.latitude ?? "",
    longitude: p.longitude ?? "",
    oid_code: p.oid_code ?? "", // nullable string -> kirim null kalau kosong
  };
}

function addPort() {
  form.olt_pon_ports.push(clonePort({ is_active: true, port_number: 1 }));
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
    // rakit payload PERSIS seperti yang diminta backend
    const payload = {
      olt_uuid: String(form.olt_uuid || "").trim(),
      code: String(form.code || "").trim() || undefined,
      slot_number: toNumberOrNull(form.slot_number),
      card_type: String(form.card_type || "").trim() || undefined,
      model: String(form.model || "").trim() || undefined,
      installed_at: form.installed_at || undefined, // "YYYY-MM-DD"
      is_active: !!form.is_active, // boolean
      olt_pon_ports: form.olt_pon_ports.map((p) => ({
        code: String(p.code || "").trim() || undefined,
        is_active: !!p.is_active,
        port_number: toNumberOrNull(p.port_number),
        txdbm: toNumberOrNull(p.txdbm), // nullable
        endpoint: String(p.endpoint || "").trim() || null,
        latitude: String(p.latitude ?? ""),
        longitude: String(p.longitude ?? ""),
        oid_code: String(p.oid_code || "").trim() || null,
      })),
    };

    // validasi minimal
    if (!payload.olt_uuid) throw new Error("OLT UUID wajib diisi.");
    if (payload.slot_number == null)
      throw new Error("Slot Number wajib diisi.");

    const created = await store.create(payload);

    // arahkan setelah berhasil
    const newId = created?.data?.uuid || created?.uuid || created?.id || null;

    if (newId) {
      router.push({ name: "olt-card-edit", params: { uuid: String(newId) } });
    } else {
      // fallback: kembali ke list & filter berdasar olt_uuid
      router.push({
        name: "olt-card-list",
        query: payload.olt_uuid ? { olt_uuid: payload.olt_uuid } : {},
      });
    }
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal membuat card";
  }
}
</script>

<template>
  <section class="card">
    <header
      class="card-header d-flex justify-content-between align-items-center"
    >
      <h2 class="card-title m-0">Tambah OLT Card</h2>
      <div class="card-actions d-flex gap-2">
        <router-link
          :to="{ name: 'olt-card-list' }"
          class="btn btn-sm btn-secondary"
          >Kembali</router-link
        >
      </div>
    </header>

    <div class="card-body">
      <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <form @submit.prevent="onSubmit">
        <!-- Informasi Card -->
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">OLT UUID</label>
            <input
              v-model.trim="form.olt_uuid"
              type="text"
              class="form-control"
              placeholder="uuid OLT"
              required
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Code</label>
            <input
              v-model.trim="form.code"
              type="text"
              class="form-control"
              placeholder="OLT_OLT-02_GTGH_SLOT_2"
            />
          </div>

          <div class="col-md-3">
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
          <div class="col-md-3">
            <label class="form-label">Card Type</label>
            <input
              v-model.trim="form.card_type"
              type="text"
              class="form-control"
              placeholder="GPON"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label">Model</label>
            <input
              v-model.trim="form.model"
              type="text"
              class="form-control"
              placeholder="GTGH / GTGO"
            />
          </div>
          <div class="col-md-3">
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
            id="isActive"
            class="form-check-input"
            type="checkbox"
            v-model="form.is_active"
          />
          <label class="form-check-label" for="isActive">Aktif</label>
        </div>

        <!-- PON Ports -->
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
                      v-model.trim="p.code"
                      type="text"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td class="text-center">
                    <input type="checkbox" v-model="p.is_active" />
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
                      v-model.trim="p.endpoint"
                      type="text"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      v-model.trim="p.latitude"
                      type="text"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      v-model.trim="p.longitude"
                      type="text"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      v-model.trim="p.oid_code"
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

        <!-- Submit -->
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
